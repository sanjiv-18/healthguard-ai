import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { clinicalNoteSchema } from '../validators/index';

const router = Router();

router.use(authenticate);

async function verifyDoctorAccess(doctorId: string, userId: string, requiredScope?: string): Promise<{ authorized: boolean; access?: any; error?: string }> {
  const access = await prisma.doctorAccess.findFirst({
    where: {
      doctorId,
      userId,
      status: 'ACTIVE'
    },
    include: { scopes: true }
  });

  if (!access) {
    return { authorized: false, error: 'No active access found for this patient' };
  }

  if (new Date() > access.expiresAt) {
    return { authorized: false, error: 'Access has expired' };
  }

  if (requiredScope) {
    const hasScope = access.scopes.some(s => s.permission === requiredScope);
    if (!hasScope) {
      return { authorized: false, error: `Missing required scope: ${requiredScope}` };
    }
  }

  return { authorized: true, access };
}

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const accesses = await prisma.doctorAccess.findMany({
      where: {
        doctorId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        scopes: true
      }
    });

    const activePatients = accesses.filter(a => new Date() <= a.expiresAt);

    const patientStats = await Promise.all(
      activePatients.map(async (access) => {
        const latestVital = await prisma.vitalReading.findFirst({
          where: { userId: access.userId },
          orderBy: { timestamp: 'desc' }
        });

        const latestRisk = await prisma.riskAssessment.findFirst({
          where: { userId: access.userId },
          orderBy: { timestamp: 'desc' }
        });

        const activeAlerts = await prisma.alert.count({
          where: {
            userId: access.userId,
            status: 'ACTIVE'
          }
        });

        return {
          patient: access.user,
          accessId: access.id,
          latestVital,
          latestRisk: latestRisk ? {
            ...latestRisk,
            recommendations: JSON.parse(latestRisk.recommendations)
          } : null,
          activeAlerts,
          accessExpiresAt: access.expiresAt,
          scopes: access.scopes.map(s => s.permission)
        };
      })
    );

    const totalAlerts = patientStats.reduce((sum, p) => sum + p.activeAlerts, 0);
    const criticalPatients = patientStats.filter(p => p.latestRisk?.level === 'CRITICAL').length;
    const highRiskPatients = patientStats.filter(p => p.latestRisk?.level === 'HIGH' || p.latestRisk?.level === 'CRITICAL').length;

    res.json({
      stats: {
        totalPatients: activePatients.length,
        criticalPatients,
        highRiskPatients,
        totalActiveAlerts: totalAlerts
      },
      patients: patientStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.get('/patients', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const accesses = await prisma.doctorAccess.findMany({
      where: {
        doctorId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, dob: true, gender: true,
            patientProfile: true
          }
        },
        scopes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const patients = accesses
      .filter(a => new Date() <= a.expiresAt)
      .map(a => ({
        accessId: a.id,
        patient: a.user,
        grantedAt: a.grantedAt,
        expiresAt: a.expiresAt,
        scopes: a.scopes.map(s => s.permission)
      }));

    res.json({ patients });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/patients/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const userId = String(req.params.id);
    const auth = await verifyDoctorAccess(req.user.id, userId);

    if (!auth.authorized) {
      res.status(403).json({ error: auth.error });
      return;
    }

    const grantedScopes = auth.access!.scopes.map((s: any) => s.permission);

    const patient = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, dob: true, gender: true, height: true, weight: true,
        patientProfile: true,
        baseline: true
      }
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const result: any = { ...patient };

    if (grantedScopes.includes('emergencyEvents')) {
      result.emergencyContacts = await prisma.emergencyContact.findMany({ where: { userId } });
    }

    res.json({ patient: result, access: { scopes: grantedScopes } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

router.get('/patients/:id/vitals', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const userId = String(req.params.id);
    const auth = await verifyDoctorAccess(req.user.id, userId, 'currentVitals');

    if (!auth.authorized) {
      res.status(403).json({ error: auth.error });
      return;
    }

    const { from, to, limit } = req.query;
    const where: any = { userId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from as string);
      if (to) where.timestamp.lte = new Date(to as string);
    }

    const vitals = await prisma.vitalReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 100
    });

    res.json({ vitals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient vitals' });
  }
});

router.get('/patients/:id/risk', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const userId = String(req.params.id);
    const auth = await verifyDoctorAccess(req.user.id, userId, 'aiRisk');

    if (!auth.authorized) {
      res.status(403).json({ error: auth.error });
      return;
    }

    const risks = await prisma.riskAssessment.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    res.json({
      risks: risks.map(r => ({
        ...r,
        recommendations: JSON.parse(r.recommendations)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient risk data' });
  }
});

router.get('/patients/:id/analytics', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const userId = String(req.params.id);
    const auth = await verifyDoctorAccess(req.user.id, userId, 'healthTrends');

    if (!auth.authorized) {
      res.status(403).json({ error: auth.error });
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const vitals = await prisma.vitalReading.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'asc' }
    });

    const risks = await prisma.riskAssessment.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'asc' }
    });

    const avgHeartRate = vitals.length > 0
      ? vitals.reduce((sum, v) => sum + v.heartRate, 0) / vitals.length
      : 0;
    const avgSpo2 = vitals.length > 0
      ? vitals.reduce((sum, v) => sum + v.spo2, 0) / vitals.length
      : 0;
    const avgTemp = vitals.length > 0
      ? vitals.reduce((sum, v) => sum + v.temperature, 0) / vitals.length
      : 0;
    const avgHydration = vitals.length > 0
      ? vitals.reduce((sum, v) => sum + v.hydration, 0) / vitals.length
      : 0;

    const riskDistribution = {
      LOW: risks.filter(r => r.level === 'LOW').length,
      MODERATE: risks.filter(r => r.level === 'MODERATE').length,
      HIGH: risks.filter(r => r.level === 'HIGH').length,
      CRITICAL: risks.filter(r => r.level === 'CRITICAL').length
    };

    const dailyVitals = vitals.reduce((acc, v) => {
      const day = v.timestamp.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(v);
      return acc;
    }, {} as Record<string, typeof vitals>);

    const dailyAverages = Object.entries(dailyVitals).map(([date, readings]) => ({
      date,
      avgHeartRate: readings.reduce((s, r) => s + r.heartRate, 0) / readings.length,
      avgSpo2: readings.reduce((s, r) => s + r.spo2, 0) / readings.length,
      avgTemp: readings.reduce((s, r) => s + r.temperature, 0) / readings.length,
      avgHydration: readings.reduce((s, r) => s + r.hydration, 0) / readings.length,
      readingCount: readings.length
    }));

    res.json({
      summary: {
        totalReadings: vitals.length,
        avgHeartRate: Math.round(avgHeartRate * 10) / 10,
        avgSpo2: Math.round(avgSpo2 * 10) / 10,
        avgTemp: Math.round(avgTemp * 10) / 10,
        avgHydration: Math.round(avgHydration * 10) / 10,
        totalRiskAssessments: risks.length,
        riskDistribution
      },
      dailyAverages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient analytics' });
  }
});

router.post('/patients/:id/notes', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'DOCTOR') { res.status(403).json({ error: 'Doctor access only' }); return; }

    const userId = String(req.params.id);
    const auth = await verifyDoctorAccess(req.user.id, userId);

    if (!auth.authorized) {
      res.status(403).json({ error: auth.error });
      return;
    }

    const parsed = clinicalNoteSchema.safeParse({
      ...req.body,
      userId
    });

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const note = await prisma.clinicalNote.create({
      data: {
        doctorId: req.user.id,
        userId,
        observation: parsed.data.observation,
        assessment: parsed.data.assessment,
        followUp: parsed.data.followUp || null
      }
    });

    await prisma.systemEvent.create({
      data: {
        type: 'CLINICAL_NOTE',
        userId,
        details: `Clinical note created by Dr. ${req.user.email}`
      }
    });

    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create clinical note' });
  }
});

export default router;

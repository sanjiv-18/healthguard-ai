import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateHealthScore } from '../services/healthScoreEngine';
import { getBaseline } from '../services/baselineEngine';

const router = Router();

router.use(authenticate);

router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const reading = await prisma.vitalReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
    });

    if (!reading) {
      res.status(404).json({ error: 'No vital readings found' });
      return;
    }

    res.json({ reading });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current vitals' });
  }
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { from, to, limit } = req.query;
    const where: any = { userId: req.user.id };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from as string);
      if (to) where.timestamp.lte = new Date(to as string);
    }

    const readings = await prisma.vitalReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });

    res.json({ readings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health history' });
  }
});

router.post('/readings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { heartRate, spo2, bodyTemperature, hydration, hrv, sleepMinutes, steps, stressPercent, respiratoryRate, calories, source } = req.body;

    if (heartRate === undefined || spo2 === undefined || bodyTemperature === undefined || hydration === undefined) {
      res.status(400).json({ error: 'heartRate, spo2, bodyTemperature, and hydration are required' });
      return;
    }

    const reading = await prisma.vitalReading.create({
      data: {
        userId: req.user.id,
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        bodyTemperature: Number(bodyTemperature),
        hydration: Number(hydration),
        hrv: hrv !== undefined ? Number(hrv) : null,
        sleepMinutes: sleepMinutes !== undefined ? Math.round(Number(sleepMinutes)) : null,
        steps: steps !== undefined ? Math.round(Number(steps)) : 0,
        stressPercent: stressPercent !== undefined ? Number(stressPercent) : null,
        respiratoryRate: respiratoryRate !== undefined ? Number(respiratoryRate) : null,
        calories: calories !== undefined ? Number(calories) : null,
        source: source || 'manual',
      }
    });

    res.status(201).json({ reading });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vital reading' });
  }
});

router.get('/health-score', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const latestScore = await prisma.healthScore.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
    });

    if (latestScore) {
      res.json({ healthScore: { ...latestScore, reasons: JSON.parse(latestScore.reasons) } });
      return;
    }

    const reading = await prisma.vitalReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
    });

    const envReading = await prisma.environmentReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
    });

    const baseline = await getBaseline(req.user.id);

    const result = calculateHealthScore({
      heartRate: reading?.heartRate,
      spo2: reading?.spo2,
      bodyTemperature: reading?.bodyTemperature,
      hydration: reading?.hydration,
      sleepMinutes: reading?.sleepMinutes ?? undefined,
      steps: reading?.steps,
      hrv: reading?.hrv ?? undefined,
      stressPercent: reading?.stressPercent ?? undefined,
      respiratoryRate: reading?.respiratoryRate ?? undefined,
      envTemperature: envReading?.environmentalTemperature,
      humidity: envReading?.humidity,
      aqi: envReading?.aqi,
      heatIndex: envReading?.heatIndex,
      baseline,
    });

    res.json({ healthScore: { ...result, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health score' });
  }
});

export default router;

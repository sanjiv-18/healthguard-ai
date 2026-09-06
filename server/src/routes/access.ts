import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { doctorAccessSchema } from '../validators/index';

const router = Router();

router.use(authenticate);

router.post('/doctor', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    if (req.user.role !== 'USER') { res.status(403).json({ error: 'Only users can grant doctor access' }); return; }

    const parsed = doctorAccessSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { doctorEmail, scopes, expiresInDays } = parsed.data;

    const doctor = await prisma.user.findFirst({
      where: { email: doctorEmail, role: 'DOCTOR' }
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    const existingAccess = await prisma.doctorAccess.findFirst({
      where: {
        userId: req.user.id,
        doctorId: doctor.id,
        status: 'ACTIVE'
      }
    });

    if (existingAccess) {
      res.status(409).json({ error: 'Active access already granted to this doctor' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const access = await prisma.doctorAccess.create({
      data: {
        userId: req.user.id,
        doctorId: doctor.id,
        expiresAt,
        scopes: {
          create: scopes.map(s => ({ permission: s }))
        }
      },
      include: { scopes: true }
    });

    await prisma.accessAuditLog.create({
      data: {
        doctorId: doctor.id,
        userId: req.user.id,
        action: 'GRANT',
        details: `Access granted to ${doctor.name} with scopes: ${scopes.join(', ')}. Expires: ${expiresAt.toISOString()}`
      }
    });

    await prisma.notification.create({
      data: {
        userId: doctor.id,
        type: 'DOCTOR_ACCESS',
        title: 'New Patient Access Granted',
        message: `Patient ${req.user.email} has granted you access to their health data.`
      }
    });

    res.status(201).json({
      access: {
        ...access,
        doctorName: doctor.name,
        doctorEmail: doctor.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to grant doctor access' });
  }
});

router.get('/doctor', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const accesses = await prisma.doctorAccess.findMany({
      where: { userId: req.user.id },
      include: {
        doctor: { select: { id: true, name: true, email: true } },
        scopes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ accesses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor accesses' });
  }
});

router.get('/doctor/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const access = await prisma.doctorAccess.findFirst({
      where: { id, userId: req.user.id },
      include: {
        doctor: { select: { id: true, name: true, email: true, doctorProfile: true } },
        scopes: true
      }
    });

    if (!access) {
      res.status(404).json({ error: 'Access record not found' });
      return;
    }

    res.json({ access });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch access details' });
  }
});

router.patch('/doctor/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);
    const { scopes, expiresInDays } = req.body;

    const access = await prisma.doctorAccess.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!access) {
      res.status(404).json({ error: 'Access record not found' });
      return;
    }

    if (access.userId !== req.user.id) {
      res.status(403).json({ error: 'Only the granting user can modify access' });
      return;
    }

    const updateData: any = {};

    if (expiresInDays) {
      const newExpires = new Date();
      newExpires.setDate(newExpires.getDate() + expiresInDays);
      updateData.expiresAt = newExpires;
    }

    if (scopes && Array.isArray(scopes)) {
      await prisma.accessScope.deleteMany({ where: { doctorAccessId: id } });
      await prisma.accessScope.createMany({
        data: scopes.map((s: string) => ({ doctorAccessId: id, permission: s }))
      });
    }

    const updated = await prisma.doctorAccess.update({
      where: { id },
      data: updateData,
      include: { scopes: true }
    });

    await prisma.accessAuditLog.create({
      data: {
        doctorId: access.doctorId,
        userId: req.user.id,
        action: 'GRANT',
        details: `Access updated. Scopes: ${scopes ? scopes.join(', ') : 'unchanged'}`
      }
    });

    res.json({ access: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update access' });
  }
});

router.post('/doctor/:id/revoke', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const access = await prisma.doctorAccess.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!access) {
      res.status(404).json({ error: 'Access record not found' });
      return;
    }

    const updated = await prisma.doctorAccess.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date()
      },
      include: { scopes: true }
    });

    await prisma.accessAuditLog.create({
      data: {
        doctorId: access.doctorId,
        userId: req.user.id,
        action: 'REVOKE',
        details: `Access revoked from doctor`
      }
    });

    await prisma.notification.create({
      data: {
        userId: access.doctorId,
        type: 'DOCTOR_ACCESS',
        title: 'Patient Access Revoked',
        message: `Patient ${req.user.email} has revoked your access to their health data.`
      }
    });

    res.json({ access: updated, message: 'Access revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

router.get('/audit-log', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const logs = await prisma.accessAuditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;

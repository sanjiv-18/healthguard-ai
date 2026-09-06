import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/access-log', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const logs = await prisma.accessAuditLog.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch access log' });
  }
});

router.get('/sharing', async (req: AuthRequest, res: Response) => {
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

    const sharing = accesses.map(a => ({
      id: a.id,
      doctorName: a.doctor.name,
      doctorEmail: a.doctor.email,
      status: a.status,
      grantedAt: a.grantedAt,
      expiresAt: a.expiresAt,
      revokedAt: a.revokedAt,
      scopes: a.scopes.map(s => s.permission),
      isActive: a.status === 'ACTIVE' && new Date() <= a.expiresAt
    }));

    const activeCount = sharing.filter(s => s.isActive).length;
    const expiredCount = sharing.filter(s => s.status === 'EXPIRED' || new Date() > s.expiresAt).length;
    const revokedCount = sharing.filter(s => s.status === 'REVOKED').length;

    res.json({
      sharing,
      stats: {
        total: sharing.length,
        active: activeCount,
        expired: expiredCount,
        revoked: revokedCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sharing status' });
  }
});

export default router;

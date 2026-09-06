import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ alerts: alerts.map(a => ({ ...a, factors: JSON.parse(a.factors) })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/:id/acknowledge', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const alert = await prisma.alert.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED' }
    });

    res.json({ alert: { ...updated, factors: JSON.parse(updated.factors) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

router.post('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const alert = await prisma.alert.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { status: 'RESOLVED' }
    });

    res.json({ alert: { ...updated, factors: JSON.parse(updated.factors) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export default router;

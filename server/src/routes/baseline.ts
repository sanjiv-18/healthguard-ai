import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateBaseline, getBaseline } from '../services/baselineEngine';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const baseline = await getBaseline(req.user.id);

    const stored = await prisma.healthBaseline.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      baseline,
      calculatedAt: stored?.calculatedAt || new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch baseline' });
  }
});

router.post('/recalculate', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const baseline = await calculateBaseline(req.user.id);

    await prisma.systemEvent.create({
      data: {
        type: 'BASELINE_RECALCULATED',
        userId: req.user.id,
        details: 'Health baseline recalculated from historical data'
      }
    });

    res.json({ baseline, message: 'Baseline recalculated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to recalculate baseline' });
  }
});

export default router;

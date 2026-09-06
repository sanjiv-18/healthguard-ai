import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const reading = await prisma.environmentReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
    });

    if (!reading) {
      res.status(404).json({ error: 'No environment readings found' });
      return;
    }

    res.json({ reading });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current environment' });
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

    const readings = await prisma.environmentReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 100
    });

    res.json({ readings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch environment history' });
  }
});

export default router;

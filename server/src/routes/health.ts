import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { vitalReadingSchema } from '../validators/index';

const router = Router();

router.use(authenticate);

router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const reading = await prisma.vitalReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
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
      take: limit ? parseInt(limit as string) : 100
    });

    res.json({ readings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health history' });
  }
});

router.post('/readings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const parsed = vitalReadingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const reading = await prisma.vitalReading.create({
      data: {
        userId: req.user.id,
        heartRate: parsed.data.heartRate,
        spo2: parsed.data.spo2,
        temperature: parsed.data.temperature,
        hydration: parsed.data.hydration,
        hrv: parsed.data.hrv ?? null,
        sleep: parsed.data.sleep ?? null,
        activity: parsed.data.activity ?? null,
        source: parsed.data.source || 'manual'
      }
    });

    res.status(201).json({ reading });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vital reading' });
  }
});

export default router;

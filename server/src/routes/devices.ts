import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { vitalReadingSchema } from '../validators/index';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const devices = await prisma.device.findMany({
      where: { userId: req.user.id },
      orderBy: { lastSync: 'desc' }
    });

    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { name, type, isSimulation } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Name and type are required' });
      return;
    }

    const validTypes = ['SMARTWATCH', 'HEALTH_BAND', 'IOT_SENSOR', 'ENV_SENSOR', 'SIMULATION'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: `Invalid device type. Must be one of: ${validTypes.join(', ')}` });
      return;
    }

    const device = await prisma.device.create({
      data: {
        userId: req.user.id,
        name,
        type,
        isSimulation: isSimulation || false
      }
    });

    res.status(201).json({ device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

router.post('/:id/readings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const device = await prisma.device.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

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
        source: `device:${device.name}`
      }
    });

    await prisma.device.update({
      where: { id },
      data: { lastSync: new Date() }
    });

    res.status(201).json({ reading });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device reading' });
  }
});

export default router;

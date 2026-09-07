import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateHealthScore } from '../services/healthScoreEngine';
import { getBaseline } from '../services/baselineEngine';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const devices = await prisma.device.findMany({
      where: { userId: req.user.id },
      orderBy: { lastSync: 'desc' },
    });

    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const devices = await prisma.device.findMany({
      where: { userId: req.user.id },
    });

    const connected = devices.filter(d => d.status === 'CONNECTED').length;
    const disconnected = devices.filter(d => d.status === 'DISCONNECTED').length;
    const syncing = devices.filter(d => d.status === 'SYNCING').length;

    res.json({
      total: devices.length,
      connected,
      disconnected,
      syncing,
      devices: devices.map(d => ({ id: d.id, name: d.name, status: d.status, battery: d.battery, lastSync: d.lastSync })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device status' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { name, type, manufacturer, model, provider, isSimulation } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Name and type are required' });
      return;
    }

    const device = await prisma.device.create({
      data: {
        userId: req.user.id,
        name,
        type,
        manufacturer: manufacturer || null,
        model: model || null,
        provider: provider || 'SIMULATED',
        isSimulation: isSimulation || false,
        battery: 100,
        status: 'CONNECTED',
      }
    });

    res.status(201).json({ device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({ device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const { name, type, manufacturer, model } = req.body;

    const updated = await prisma.device.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(model !== undefined && { model }),
      },
    });

    res.json({ device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    await prisma.device.delete({ where: { id: req.params.id } });

    res.json({ message: 'Device removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

router.post('/:id/connect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const updated = await prisma.device.update({
      where: { id: req.params.id },
      data: { status: 'CONNECTED', connectedAt: new Date(), disconnectedAt: null },
    });

    res.json({ device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect device' });
  }
});

router.post('/:id/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const updated = await prisma.device.update({
      where: { id: req.params.id },
      data: { status: 'DISCONNECTED', disconnectedAt: new Date() },
    });

    res.json({ device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect device' });
  }
});

router.post('/:id/sync', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const updated = await prisma.device.update({
      where: { id: req.params.id },
      data: { status: 'SYNCING', lastSync: new Date() },
    });

    setTimeout(async () => {
      try {
        await prisma.device.update({
          where: { id: req.params.id },
          data: { status: 'CONNECTED' },
        });
      } catch (e) {}
    }, 2000);

    res.json({ device: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync device' });
  }
});

router.post('/:id/readings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    if (device.status === 'DISCONNECTED') {
      res.status(400).json({ error: 'Device is disconnected. Reconnect before sending readings.' });
      return;
    }

    const { heartRate, spo2, bodyTemperature, hydration, hrv, sleepMinutes, steps, stressPercent, respiratoryRate, calories } = req.body;

    const reading = await prisma.vitalReading.create({
      data: {
        userId: req.user.id,
        deviceId: device.id,
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
        source: `device:${device.name}`,
      }
    });

    await prisma.device.update({
      where: { id: req.params.id },
      data: { lastSync: new Date(), battery: Math.max(0, device.battery - 1) },
    });

    const baseline = await getBaseline(req.user.id);
    const healthResult = calculateHealthScore({
      heartRate: reading.heartRate,
      spo2: reading.spo2,
      bodyTemperature: reading.bodyTemperature,
      hydration: reading.hydration,
      sleepMinutes: reading.sleepMinutes ?? undefined,
      steps: reading.steps,
      hrv: reading.hrv ?? undefined,
      stressPercent: reading.stressPercent ?? undefined,
      respiratoryRate: reading.respiratoryRate ?? undefined,
      baseline,
    });

    await prisma.healthScore.create({
      data: {
        userId: req.user.id,
        score: healthResult.score,
        riskLevel: healthResult.riskLevel,
        heartRateScore: healthResult.components.heartRate,
        spo2Score: healthResult.components.spo2,
        temperatureScore: healthResult.components.temperature,
        hydrationScore: healthResult.components.hydration,
        sleepScore: healthResult.components.sleep,
        activityScore: healthResult.components.activity,
        stressScore: healthResult.components.stress,
        respiratoryScore: healthResult.components.respiratory,
        environmentScore: healthResult.components.environment,
        dataQuality: healthResult.dataQuality,
        reasons: JSON.stringify(healthResult.reasons),
      }
    });

    res.status(201).json({ reading, healthScore: healthResult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device reading' });
  }
});

router.get('/:id/readings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const { limit } = req.query;
    const readings = await prisma.vitalReading.findMany({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
    });

    res.json({ readings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device readings' });
  }
});

router.get('/:id/events', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const events = await prisma.systemEvent.findMany({
      where: { userId: req.user.id, type: { contains: 'DEVICE' } },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device events' });
  }
});

export default router;

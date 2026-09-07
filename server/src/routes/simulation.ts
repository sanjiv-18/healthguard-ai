import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateRisk, RiskInput } from '../services/riskEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import { getBaseline } from '../services/baselineEngine';
import { calculateHealthScore } from '../services/healthScoreEngine';
import {
  generateNormal, generateExercise, generateHeatStress, generateHighHeartRate,
  generateLowSpO2, generateDehydration, generatePoorSleep,
  generateCombinedRisk, generateFallDetection, generateDeviceDisconnect
} from '../services/simulationEngine';

const router = Router();

router.use(authenticate);

async function processSimulation(req: AuthRequest, simulationType: string, data: ReturnType<typeof generateNormal>) {
  const userId = req.user!.id;

  const vital = await prisma.vitalReading.create({
    data: {
      userId,
      heartRate: data.vitalReading.heartRate,
      spo2: data.vitalReading.spo2,
      bodyTemperature: data.vitalReading.bodyTemperature,
      hydration: data.vitalReading.hydration,
      hrv: data.vitalReading.hrv,
      sleepMinutes: data.vitalReading.sleepMinutes,
      steps: data.vitalReading.steps,
      stressPercent: data.vitalReading.stressPercent,
      respiratoryRate: data.vitalReading.respiratoryRate,
      calories: data.vitalReading.calories,
      source: data.vitalReading.source,
    }
  });

  let envReading = null;
  if (data.envReading) {
    envReading = await prisma.environmentReading.create({
      data: {
        userId,
        environmentalTemperature: data.envReading.environmentalTemperature,
        humidity: data.envReading.humidity,
        aqi: data.envReading.aqi,
        uvIndex: data.envReading.uvIndex,
        heatIndex: data.envReading.heatIndex,
        windSpeed: data.envReading.windSpeed,
        source: data.envReading.source,
      }
    });
  }

  const baseline = await getBaseline(userId);

  const riskInput: RiskInput = {
    heartRate: data.vitalReading.heartRate,
    spo2: data.vitalReading.spo2,
    temperature: data.vitalReading.bodyTemperature,
    hydration: data.vitalReading.hydration,
    hrv: data.vitalReading.hrv,
    sleep: data.vitalReading.sleepMinutes !== undefined ? data.vitalReading.sleepMinutes / 60 : undefined,
    activity: data.vitalReading.steps,
    envTemp: data.envReading?.environmentalTemperature,
    humidity: data.envReading?.humidity,
    aqi: data.envReading?.aqi,
    heatIndex: data.envReading?.heatIndex,
    baseline,
  };

  const riskResult = calculateRisk(riskInput);

  const riskAssessment = await prisma.riskAssessment.create({
    data: {
      userId,
      overallRisk: riskResult.overallRisk,
      level: riskResult.level,
      heatStress: riskResult.heatStress,
      dehydration: riskResult.dehydration,
      respiratory: riskResult.respiratory,
      cardiacStrain: riskResult.cardiacStrain,
      fatigue: riskResult.fatigue,
      explanation: riskResult.explanation,
      recommendations: JSON.stringify(riskResult.recommendations),
      confidence: riskResult.confidence,
    }
  });

  const healthScoreResult = calculateHealthScore({
    heartRate: data.vitalReading.heartRate,
    spo2: data.vitalReading.spo2,
    bodyTemperature: data.vitalReading.bodyTemperature,
    hydration: data.vitalReading.hydration,
    sleepMinutes: data.vitalReading.sleepMinutes,
    steps: data.vitalReading.steps,
    hrv: data.vitalReading.hrv,
    stressPercent: data.vitalReading.stressPercent,
    respiratoryRate: data.vitalReading.respiratoryRate,
    envTemperature: data.envReading?.environmentalTemperature,
    humidity: data.envReading?.humidity,
    aqi: data.envReading?.aqi,
    heatIndex: data.envReading?.heatIndex,
    baseline,
  });

  const healthScore = await prisma.healthScore.create({
    data: {
      userId,
      score: healthScoreResult.score,
      riskLevel: healthScoreResult.riskLevel,
      heartRateScore: healthScoreResult.components.heartRate,
      spo2Score: healthScoreResult.components.spo2,
      temperatureScore: healthScoreResult.components.temperature,
      hydrationScore: healthScoreResult.components.hydration,
      sleepScore: healthScoreResult.components.sleep,
      activityScore: healthScoreResult.components.activity,
      stressScore: healthScoreResult.components.stress,
      respiratoryScore: healthScoreResult.components.respiratory,
      environmentScore: healthScoreResult.components.environment,
      dataQuality: healthScoreResult.dataQuality,
      reasons: JSON.stringify(healthScoreResult.reasons),
    }
  });

  const recs = await generateRecommendations({
    userId,
    heartRate: data.vitalReading.heartRate,
    spo2: data.vitalReading.spo2,
    temperature: data.vitalReading.bodyTemperature,
    hydration: data.vitalReading.hydration,
    hrv: data.vitalReading.hrv,
    sleep: data.vitalReading.sleepMinutes !== undefined ? data.vitalReading.sleepMinutes / 60 : undefined,
    activity: data.vitalReading.steps,
    envTemp: data.envReading?.environmentalTemperature,
    humidity: data.envReading?.humidity,
    aqi: data.envReading?.aqi,
    heatIndex: data.envReading?.heatIndex,
    risk: riskResult,
  });

  let alert = null;
  if (riskResult.level === 'HIGH' || riskResult.level === 'CRITICAL') {
    alert = await prisma.alert.create({
      data: {
        userId,
        level: riskResult.level,
        category: 'HEALTH',
        title: `${riskResult.level} Risk - ${simulationType.replace(/-/g, ' ').toUpperCase()}`,
        message: riskResult.explanation,
        factors: JSON.stringify(riskResult.recommendations.slice(0, 3)),
      }
    });
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: 'HEALTH',
      title: `Simulation: ${simulationType.replace(/-/g, ' ')}`,
      message: `Risk level: ${riskResult.level} (${riskResult.overallRisk}/100)`,
    }
  });

  const systemEvent = await prisma.systemEvent.create({
    data: {
      type: `SIMULATION_${simulationType.toUpperCase().replace(/-/g, '_')}`,
      userId,
      details: `Simulation executed. Risk: ${riskResult.level} (${riskResult.overallRisk}/100)`,
    }
  });

  return {
    vitalReading: vital,
    envReading,
    riskAssessment: {
      ...riskAssessment,
      recommendations: JSON.parse(riskAssessment.recommendations),
    },
    healthScore: {
      ...healthScore,
      reasons: JSON.parse(healthScore.reasons),
    },
    alert,
    notification,
    recommendations: recs,
    systemEvent,
  };
}

router.post('/normal', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateNormal();
    const result = await processSimulation(req, 'normal', data);
    res.json({ scenario: 'Normal Vitals', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run normal simulation' });
  }
});

router.post('/exercise', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateExercise();
    const result = await processSimulation(req, 'exercise', data);
    res.json({ scenario: 'Exercise', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run exercise simulation' });
  }
});

router.post('/heat-stress', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateHeatStress();
    const result = await processSimulation(req, 'heat-stress', data);
    res.json({ scenario: 'Heat Stress', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run heat stress simulation' });
  }
});

router.post('/heart-rate', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateHighHeartRate();
    const result = await processSimulation(req, 'heart-rate', data);
    res.json({ scenario: 'Heart Rate Spike', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run heart rate simulation' });
  }
});

router.post('/low-spo2', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateLowSpO2();
    const result = await processSimulation(req, 'low-spo2', data);
    res.json({ scenario: 'Low SpO2', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run low SpO2 simulation' });
  }
});

router.post('/dehydration', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateDehydration();
    const result = await processSimulation(req, 'dehydration', data);
    res.json({ scenario: 'Dehydration', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run dehydration simulation' });
  }
});

router.post('/poor-sleep', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generatePoorSleep();
    const result = await processSimulation(req, 'poor-sleep', data);
    res.json({ scenario: 'Poor Sleep', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run poor sleep simulation' });
  }
});

router.post('/combined-risk', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateCombinedRisk();
    const result = await processSimulation(req, 'combined-risk', data);
    res.json({ scenario: 'Combined Risk', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run combined risk simulation' });
  }
});

router.post('/fall', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const data = generateFallDetection();
    const result = await processSimulation(req, 'fall-detection', data);

    const event = await prisma.emergencyEvent.create({
      data: {
        userId: req.user.id,
        trigger: 'FALL_DETECTION',
        notes: 'Simulated fall detection event',
      }
    });

    res.json({
      scenario: 'Fall Detection',
      ...result,
      emergencyEvent: event,
      message: 'Fall detection simulated. In production, emergency services would be contacted.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run fall simulation' });
  }
});

router.post('/device-disconnect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { userId: req.user.id, isSimulation: true },
    });

    if (device) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: 'DISCONNECTED', disconnectedAt: new Date() },
      });
    }

    await prisma.systemEvent.create({
      data: {
        type: 'SIMULATION_DEVICE_DISCONNECT',
        userId: req.user.id,
        details: 'Simulated device disconnection',
      }
    });

    res.json({
      scenario: 'Device Disconnect',
      device: device ? { ...device, status: 'DISCONNECTED' } : null,
      message: 'Device disconnected. Last known data preserved.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run device disconnect simulation' });
  }
});

router.post('/device-reconnect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { userId: req.user.id, isSimulation: true },
    });

    if (device) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: 'CONNECTED', disconnectedAt: null, lastSync: new Date() },
      });
    }

    await prisma.systemEvent.create({
      data: {
        type: 'SIMULATION_DEVICE_RECONNECT',
        userId: req.user.id,
        details: 'Simulated device reconnection',
      }
    });

    const data = generateNormal();
    const result = await processSimulation(req, 'device-reconnect', data);

    res.json({
      scenario: 'Device Reconnect',
      ...result,
      device: device ? { ...device, status: 'CONNECTED' } : null,
      message: 'Device reconnected. Telemetry resumed.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run device reconnect simulation' });
  }
});

router.post('/reset', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const device = await prisma.device.findFirst({
      where: { userId: req.user.id, isSimulation: true },
    });

    if (device) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: 'CONNECTED', disconnectedAt: null, battery: 100, lastSync: new Date() },
      });
    }

    const data = generateNormal();
    const result = await processSimulation(req, 'reset', data);

    await prisma.systemEvent.create({
      data: {
        type: 'SIMULATION_RESET',
        userId: req.user.id,
        details: 'All vitals reset to normal baseline',
      }
    });

    res.json({ scenario: 'Reset to Normal', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset simulation' });
  }
});

router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const events = await prisma.systemEvent.findMany({
      where: { userId: req.user.id, type: { startsWith: 'SIMULATION_' } },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get simulation status' });
  }
});

export default router;

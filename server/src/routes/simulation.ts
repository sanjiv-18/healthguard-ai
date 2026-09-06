import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateRisk, RiskInput } from '../services/riskEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import { getBaseline } from '../services/baselineEngine';
import {
  generateNormal, generateHeatStress, generateDehydration,
  generateHighAQI, generateHeartRateSpike, generatePoorSleep,
  generateCombinedRisk, generateFallDetection
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
      temperature: data.vitalReading.temperature,
      hydration: data.vitalReading.hydration,
      hrv: data.vitalReading.hrv,
      sleep: data.vitalReading.sleep,
      activity: data.vitalReading.activity,
      source: data.vitalReading.source
    }
  });

  let envReading = null;
  if (data.envReading) {
    envReading = await prisma.environmentReading.create({
      data: {
        userId,
        temperature: data.envReading.temperature,
        humidity: data.envReading.humidity,
        aqi: data.envReading.aqi,
        uvIndex: data.envReading.uvIndex,
        heatIndex: data.envReading.heatIndex,
        windSpeed: data.envReading.windSpeed,
        source: data.envReading.source
      }
    });
  }

  const baseline = await getBaseline(userId);

  const input: RiskInput = {
    heartRate: data.vitalReading.heartRate,
    spo2: data.vitalReading.spo2,
    temperature: data.vitalReading.temperature,
    hydration: data.vitalReading.hydration,
    hrv: data.vitalReading.hrv,
    sleep: data.vitalReading.sleep,
    activity: data.vitalReading.activity,
    envTemp: data.envReading?.temperature,
    humidity: data.envReading?.humidity,
    aqi: data.envReading?.aqi,
    heatIndex: data.envReading?.heatIndex,
    baseline
  };

  const riskResult = calculateRisk(input);

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
      confidence: riskResult.confidence
    }
  });

  const recs = await generateRecommendations({
    userId,
    heartRate: data.vitalReading.heartRate,
    spo2: data.vitalReading.spo2,
    temperature: data.vitalReading.temperature,
    hydration: data.vitalReading.hydration,
    hrv: data.vitalReading.hrv,
    sleep: data.vitalReading.sleep,
    activity: data.vitalReading.activity,
    envTemp: data.envReading?.temperature,
    humidity: data.envReading?.humidity,
    aqi: data.envReading?.aqi,
    heatIndex: data.envReading?.heatIndex,
    risk: riskResult
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
        factors: JSON.stringify(riskResult.recommendations.slice(0, 3))
      }
    });
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: 'HEALTH',
      title: `Simulation: ${simulationType.replace(/-/g, ' ')}`,
      message: `Risk level: ${riskResult.level} (${riskResult.overallRisk}/100)`
    }
  });

  const systemEvent = await prisma.systemEvent.create({
    data: {
      type: `SIMULATION_${simulationType.toUpperCase().replace(/-/g, '_')}`,
      userId,
      details: `Simulation executed. Risk: ${riskResult.level} (${riskResult.overallRisk}/100)`
    }
  });

  return {
    vitalReading: vital,
    envReading,
    riskAssessment: {
      ...riskAssessment,
      recommendations: JSON.parse(riskAssessment.recommendations)
    },
    alert,
    notification,
    recommendations: recs,
    systemEvent
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

router.post('/high-aqi', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateHighAQI();
    const result = await processSimulation(req, 'high-aqi', data);
    res.json({ scenario: 'High AQI', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run high AQI simulation' });
  }
});

router.post('/heart-rate', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const data = generateHeartRateSpike();
    const result = await processSimulation(req, 'heart-rate', data);
    res.json({ scenario: 'Heart Rate Spike', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run heart rate simulation' });
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

    const userId = req.user.id;
    const data = generateFallDetection();

    const vital = await prisma.vitalReading.create({
      data: {
        userId,
        heartRate: data.vitalReading.heartRate,
        spo2: data.vitalReading.spo2,
        temperature: data.vitalReading.temperature,
        hydration: data.vitalReading.hydration,
        hrv: data.vitalReading.hrv,
        sleep: data.vitalReading.sleep,
        activity: data.vitalReading.activity,
        source: 'simulation:fall-detection'
      }
    });

    const event = await prisma.emergencyEvent.create({
      data: {
        userId,
        trigger: 'FALL_DETECTION',
        notes: 'Simulated fall detection event'
      }
    });

    const alert = await prisma.alert.create({
      data: {
        userId,
        level: 'CRITICAL',
        category: 'EMERGENCY',
        title: 'Fall Detection - Simulation',
        message: 'Simulated fall detected. Emergency protocol initiated.',
        factors: JSON.stringify(['fall_detection', 'simulation'])
      }
    });

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'EMERGENCY',
        title: 'Fall Detection Simulation',
        message: 'Simulated fall event triggered. Emergency services would be contacted.'
      }
    });

    await prisma.systemEvent.create({
      data: {
        type: 'SIMULATION_FALL_DETECTION',
        userId,
        details: 'Simulated fall detection event'
      }
    });

    res.json({
      scenario: 'Fall Detection',
      vitalReading: vital,
      emergencyEvent: event,
      alert,
      notification,
      message: 'Fall detection simulated. In production, emergency services would be contacted.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run fall simulation' });
  }
});

router.post('/reset', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const data = generateNormal();
    const result = await processSimulation(req, 'reset', data);

    await prisma.systemEvent.create({
      data: {
        type: 'SIMULATION_RESET',
        userId: req.user.id,
        details: 'All vitals reset to normal baseline'
      }
    });

    res.json({ scenario: 'Reset to Normal', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset simulation' });
  }
});

export default router;

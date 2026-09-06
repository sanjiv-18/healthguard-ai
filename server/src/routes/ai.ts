import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateRisk, RiskInput } from '../services/riskEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import { getBaseline } from '../services/baselineEngine';

const router = Router();

router.use(authenticate);

router.get('/risk', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const risk = await prisma.riskAssessment.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
    });

    if (!risk) {
      res.status(404).json({ error: 'No risk assessment found' });
      return;
    }

    res.json({
      risk: {
        ...risk,
        recommendations: JSON.parse(risk.recommendations)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

router.post('/analyze', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const vital = await prisma.vitalReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
    });

    const env = await prisma.environmentReading.findFirst({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
    });

    const baseline = await getBaseline(req.user.id);

    const input: RiskInput = {
      heartRate: vital?.heartRate ?? 70,
      spo2: vital?.spo2 ?? 97,
      temperature: vital?.temperature ?? 36.6,
      hydration: vital?.hydration ?? 65,
      hrv: vital?.hrv ?? undefined,
      sleep: vital?.sleep ?? undefined,
      activity: vital?.activity ?? undefined,
      envTemp: env?.temperature ?? undefined,
      humidity: env?.humidity ?? undefined,
      aqi: env?.aqi ?? undefined,
      heatIndex: env?.heatIndex ?? undefined,
      baseline
    };

    const riskResult = calculateRisk(input);

    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        userId: req.user.id,
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

    await generateRecommendations({
      userId: req.user.id,
      heartRate: input.heartRate,
      spo2: input.spo2,
      temperature: input.temperature,
      hydration: input.hydration,
      hrv: input.hrv,
      sleep: input.sleep,
      activity: input.activity,
      envTemp: input.envTemp,
      humidity: input.humidity,
      aqi: input.aqi,
      heatIndex: input.heatIndex,
      risk: riskResult
    });

    if (riskResult.level === 'HIGH' || riskResult.level === 'CRITICAL') {
      await prisma.alert.create({
        data: {
          userId: req.user.id,
          level: riskResult.level,
          category: 'HEALTH',
          title: `${riskResult.level} Health Risk Detected`,
          message: riskResult.explanation,
          factors: JSON.stringify(riskResult.recommendations.slice(0, 3))
        }
      });

      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'HEALTH',
          title: `Health Risk: ${riskResult.level}`,
          message: `Your overall health risk is ${riskResult.level} (${riskResult.overallRisk}/100).`
        }
      });
    }

    await prisma.systemEvent.create({
      data: {
        type: 'RISK_ANALYSIS',
        userId: req.user.id,
        details: `Risk assessed: ${riskResult.level} (${riskResult.overallRisk}/100)`
      }
    });

    res.json({
      risk: {
        ...riskAssessment,
        recommendations: JSON.parse(riskAssessment.recommendations)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze risk' });
  }
});

export default router;

import { PrismaClient } from '@prisma/client';
import { RiskOutput } from './riskEngine';

const prisma = new PrismaClient();

interface RecommendationInput {
  userId: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  hydration: number;
  hrv?: number;
  sleep?: number;
  activity?: number;
  envTemp?: number;
  humidity?: number;
  aqi?: number;
  heatIndex?: number;
  risk: RiskOutput;
}

interface Recommendation {
  category: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function generateRecommendations(input: RecommendationInput): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];
  const baseline = await prisma.healthBaseline.findUnique({ where: { userId: input.userId } });

  const hrMax = baseline?.heartRateMax ?? 85;
  const hydMin = baseline?.hydrationMin ?? 55;
  const hydMax = baseline?.hydrationMax ?? 75;
  const tempMax = baseline?.temperatureMax ?? 37.2;
  const sleepMin = baseline?.sleepMin ?? 6;

  if (input.hydration < hydMin) {
    const deficit = hydMin - input.hydration;
    const urgency: 'LOW' | 'MEDIUM' | 'HIGH' = deficit > 15 ? 'HIGH' : deficit > 8 ? 'MEDIUM' : 'LOW';
    recs.push({
      category: 'HYDRATION',
      title: 'Increase Fluid Intake',
      message: `Your hydration level is ${input.hydration}%, below your baseline minimum of ${hydMin}%. Drink at least ${Math.round(deficit * 15)}ml of water in the next hour.`,
      priority: urgency
    });
  }

  if (input.sleep !== undefined && input.sleep < sleepMin) {
    const deficit = sleepMin - input.sleep;
    recs.push({
      category: 'SLEEP',
      title: 'Improve Sleep Duration',
      message: `You slept ${input.sleep} hours, which is ${deficit.toFixed(1)} hours below your minimum of ${sleepMin} hours. Aim for a consistent sleep schedule and avoid screens before bed.`,
      priority: deficit > 2 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (input.activity !== undefined) {
    if (input.activity < 20) {
      recs.push({
        category: 'ACTIVITY',
        title: 'Increase Physical Activity',
        message: `Your activity level is low at ${input.activity}%. A 15-30 minute walk can improve cardiovascular health and overall wellbeing.`,
        priority: 'MEDIUM'
      });
    } else if (input.activity > 85) {
      recs.push({
        category: 'ACTIVITY',
        title: 'Moderate Activity Level',
        message: `Your activity level is very high at ${input.activity}%. Ensure you are hydrating adequately and taking rest breaks.`,
        priority: input.heartRate > hrMax + 15 ? 'HIGH' : 'MEDIUM'
      });
    }
  }

  if (input.envTemp !== undefined && input.envTemp > 35) {
    recs.push({
      category: 'HEAT',
      title: 'Heat Advisory',
      message: `Ambient temperature is ${input.envTemp}°C. Stay hydrated, wear light clothing, and avoid direct sun exposure. Consider moving indoors.`,
      priority: input.envTemp > 40 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (input.aqi !== undefined && input.aqi > 100) {
    const aqiLevel = input.aqi > 150 ? 'unhealthy' : 'unhealthy for sensitive groups';
    recs.push({
      category: 'AIR_QUALITY',
      title: 'Air Quality Alert',
      message: `AQI is ${input.aqi} (${aqiLevel}). Limit outdoor activities, use air purifiers indoors, and wear a mask if you must go outside.`,
      priority: input.aqi > 150 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (input.risk.level === 'HIGH' || input.risk.level === 'CRITICAL') {
    recs.push({
      category: 'RECOVERY',
      title: 'Immediate Rest Recommended',
      message: `Your overall risk level is ${input.risk.level}. Take immediate rest, monitor vital signs closely, and consider contacting a healthcare provider.`,
      priority: 'HIGH'
    });
  }

  if (input.temperature > tempMax + 0.5) {
    recs.push({
      category: 'BODY_TEMPERATURE',
      title: 'Monitor Body Temperature',
      message: `Your body temperature is ${input.temperature}°C, above your normal range. Rest in a cool environment and stay hydrated.`,
      priority: input.temperature > tempMax + 1 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (input.heartRate > hrMax + 15 && input.risk.cardiacStrain < 20) {
    recs.push({
      category: 'CARDIAC',
      title: 'Heart Rate Elevated',
      message: `Your heart rate is ${input.heartRate} BPM, above your normal range. If this persists for more than 10 minutes, rest and monitor closely.`,
      priority: 'MEDIUM'
    });
  }

  if (recs.length === 0) {
    recs.push({
      category: 'GENERAL',
      title: 'All Clear',
      message: 'Your vitals and environment are within healthy ranges. Keep up the good work!',
      priority: 'LOW'
    });
  }

  for (const rec of recs) {
    await prisma.recommendation.create({
      data: {
        userId: input.userId,
        category: rec.category,
        title: rec.title,
        message: rec.message,
        priority: rec.priority
      }
    });
  }

  return recs;
}

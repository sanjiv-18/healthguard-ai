import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BaselineResult {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  temperatureMin: number;
  temperatureMax: number;
  hydrationMin: number;
  hydrationMax: number;
  hrvMin: number;
  hrvMax: number;
  sleepMinMinutes: number;
  sleepMaxMinutes: number;
  stepsMin: number;
  stepsMax: number;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export async function calculateBaseline(userId: string): Promise<BaselineResult> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const readings = await prisma.vitalReading.findMany({
    where: {
      userId,
      timestamp: { gte: thirtyDaysAgo },
    },
    orderBy: { timestamp: 'desc' },
  });

  if (readings.length < 5) {
    return {
      heartRateMin: 60, heartRateMax: 85,
      spo2Min: 95,
      temperatureMin: 36.1, temperatureMax: 37.2,
      hydrationMin: 55, hydrationMax: 75,
      hrvMin: 30, hrvMax: 70,
      sleepMinMinutes: 360, sleepMaxMinutes: 540,
      stepsMin: 5000, stepsMax: 10000,
    };
  }

  const hrValues = readings.map(r => r.heartRate);
  const spo2Values = readings.map(r => r.spo2);
  const tempValues = readings.map(r => r.bodyTemperature);
  const hydValues = readings.map(r => r.hydration);
  const hrvValues = readings.filter(r => r.hrv !== null).map(r => r.hrv!);
  const sleepValues = readings.filter(r => r.sleepMinutes !== null).map(r => r.sleepMinutes!);
  const stepsValues = readings.filter(r => r.steps !== null).map(r => r.steps!);

  const result: BaselineResult = {
    heartRateMin: Math.round(percentile(hrValues, 10)),
    heartRateMax: Math.round(percentile(hrValues, 90)),
    spo2Min: Math.round(percentile(spo2Values, 10) * 10) / 10,
    temperatureMin: Math.round(percentile(tempValues, 10) * 10) / 10,
    temperatureMax: Math.round(percentile(tempValues, 90) * 10) / 10,
    hydrationMin: Math.round(percentile(hydValues, 10)),
    hydrationMax: Math.round(percentile(hydValues, 90)),
    hrvMin: hrvValues.length > 0 ? Math.round(percentile(hrvValues, 10)) : 30,
    hrvMax: hrvValues.length > 0 ? Math.round(percentile(hrvValues, 90)) : 70,
    sleepMinMinutes: sleepValues.length > 0 ? Math.round(percentile(sleepValues, 10)) : 360,
    sleepMaxMinutes: sleepValues.length > 0 ? Math.round(percentile(sleepValues, 90)) : 540,
    stepsMin: stepsValues.length > 0 ? Math.round(percentile(stepsValues, 10)) : 5000,
    stepsMax: stepsValues.length > 0 ? Math.round(percentile(stepsValues, 90)) : 10000,
  };

  await prisma.healthBaseline.upsert({
    where: { userId },
    create: { userId, ...result },
    update: { ...result, calculatedAt: new Date() },
  });

  return result;
}

export async function getBaseline(userId: string): Promise<BaselineResult> {
  const existing = await prisma.healthBaseline.findUnique({ where: { userId } });
  if (existing) {
    return {
      heartRateMin: existing.heartRateMin,
      heartRateMax: existing.heartRateMax,
      spo2Min: existing.spo2Min,
      temperatureMin: existing.temperatureMin,
      temperatureMax: existing.temperatureMax,
      hydrationMin: existing.hydrationMin,
      hydrationMax: existing.hydrationMax,
      hrvMin: existing.hrvMin,
      hrvMax: existing.hrvMax,
      sleepMinMinutes: existing.sleepMinMinutes,
      sleepMaxMinutes: existing.sleepMaxMinutes,
      stepsMin: existing.stepsMin,
      stepsMax: existing.stepsMax,
    };
  }
  return calculateBaseline(userId);
}

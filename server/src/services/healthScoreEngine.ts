export interface HealthScoreInput {
  heartRate?: number;
  spo2?: number;
  bodyTemperature?: number;
  hydration?: number;
  sleepMinutes?: number;
  steps?: number;
  hrv?: number;
  stressPercent?: number;
  respiratoryRate?: number;
  calories?: number;
  envTemperature?: number;
  humidity?: number;
  aqi?: number;
  heatIndex?: number;
  baseline?: {
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
  } | null;
}

export interface HealthScoreResult {
  score: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  components: {
    heartRate: number;
    spo2: number;
    temperature: number;
    hydration: number;
    sleep: number;
    activity: number;
    stress: number;
    respiratory: number;
    environment: number;
  };
  reasons: string[];
  dataQuality: 'GOOD' | 'LIMITED' | 'STALE';
}

const WEIGHTS = {
  heartRate: 0.15,
  spo2: 0.20,
  temperature: 0.15,
  hydration: 0.10,
  sleep: 0.15,
  activity: 0.10,
  stress: 0.05,
  respiratory: 0.05,
  environment: 0.05,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function scoreHeartRate(hr: number, baseline?: HealthScoreInput['baseline']): number {
  const min = baseline?.heartRateMin ?? 55;
  const max = baseline?.heartRateMax ?? 85;

  if (hr >= min && hr <= max) return 100;
  if (hr >= min - 10 && hr <= max + 15) return 75;
  if (hr >= min - 15 && hr <= max + 30) return 50;
  if (hr >= 40 && hr <= 120) return 30;
  return 10;
}

function scoreSpO2(spo2: number): number {
  if (spo2 >= 97) return 100;
  if (spo2 >= 95) return 90;
  if (spo2 >= 93) return 60;
  if (spo2 >= 90) return 30;
  return 10;
}

function scoreBodyTemperature(temp: number, baseline?: HealthScoreInput['baseline']): number {
  const min = baseline?.temperatureMin ?? 36.1;
  const max = baseline?.temperatureMax ?? 37.2;

  if (temp >= min && temp <= max) return 100;
  if (temp >= min - 0.3 && temp <= max + 0.3) return 80;
  if (temp >= 35.5 && temp <= 37.8) return 60;
  if (temp >= 35.0 && temp <= 38.5) return 30;
  return 10;
}

function scoreHydration(hydration: number, baseline?: HealthScoreInput['baseline']): number {
  const min = baseline?.hydrationMin ?? 55;

  if (hydration >= min + 10) return 100;
  if (hydration >= min) return 85;
  if (hydration >= min - 10) return 65;
  if (hydration >= 40) return 45;
  if (hydration >= 30) return 25;
  return 10;
}

function scoreSleep(sleepMinutes: number, baseline?: HealthScoreInput['baseline']): number {
  const min = baseline?.sleepMinMinutes ?? 360;
  const max = baseline?.sleepMaxMinutes ?? 540;

  if (sleepMinutes >= min && sleepMinutes <= max) return 100;
  if (sleepMinutes >= min - 60 && sleepMinutes <= max + 60) return 75;
  if (sleepMinutes >= 180 && sleepMinutes <= 600) return 50;
  if (sleepMinutes >= 120) return 30;
  return 10;
}

function scoreActivity(steps: number, baseline?: HealthScoreInput['baseline']): number {
  const min = baseline?.stepsMin ?? 5000;
  const max = baseline?.stepsMax ?? 10000;

  if (steps >= max) return 100;
  if (steps >= min) return 80;
  if (steps >= min * 0.7) return 60;
  if (steps >= min * 0.4) return 40;
  if (steps >= 1000) return 25;
  return 10;
}

function scoreStress(stress: number): number {
  if (stress <= 20) return 100;
  if (stress <= 40) return 80;
  if (stress <= 60) return 60;
  if (stress <= 80) return 35;
  return 15;
}

function scoreRespiratory(rate: number): number {
  if (rate >= 12 && rate <= 20) return 100;
  if (rate >= 10 && rate <= 24) return 75;
  if (rate >= 8 && rate <= 28) return 50;
  return 25;
}

function scoreEnvironment(aqi: number, heatIndex: number): number {
  let aqiScore = 100;
  if (aqi > 200) aqiScore = 15;
  else if (aqi > 150) aqiScore = 30;
  else if (aqi > 100) aqiScore = 55;
  else if (aqi > 50) aqiScore = 80;

  let heatScore = 100;
  if (heatIndex > 40) heatScore = 20;
  else if (heatIndex > 35) heatScore = 45;
  else if (heatIndex > 30) heatScore = 70;

  return Math.round(aqiScore * 0.6 + heatScore * 0.4);
}

function determineRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'LOW';
  if (score >= 60) return 'MODERATE';
  if (score >= 40) return 'HIGH';
  return 'CRITICAL';
}

function assessDataQuality(input: HealthScoreInput): 'GOOD' | 'LIMITED' | 'STALE' {
  const fields = [input.heartRate, input.spo2, input.bodyTemperature, input.hydration];
  const present = fields.filter(f => f !== undefined && f !== null).length;
  if (present >= 3) return 'GOOD';
  if (present >= 1) return 'LIMITED';
  return 'STALE';
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const reasons: string[] = [];
  const availableComponents: { weight: number; score: number }[] = [];

  const hrScore = input.heartRate !== undefined ? scoreHeartRate(input.heartRate, input.baseline) : null;
  const spo2Score = input.spo2 !== undefined ? scoreSpO2(input.spo2) : null;
  const tempScore = input.bodyTemperature !== undefined ? scoreBodyTemperature(input.bodyTemperature, input.baseline) : null;
  const hydScore = input.hydration !== undefined ? scoreHydration(input.hydration, input.baseline) : null;
  const sleepScore = input.sleepMinutes !== undefined ? scoreSleep(input.sleepMinutes, input.baseline) : null;
  const actScore = input.steps !== undefined ? scoreActivity(input.steps, input.baseline) : null;
  const stressScoreVal = input.stressPercent !== undefined ? scoreStress(input.stressPercent) : null;
  const respScore = input.respiratoryRate !== undefined ? scoreRespiratory(input.respiratoryRate) : null;
  const envScore = (input.aqi !== undefined && input.heatIndex !== undefined)
    ? scoreEnvironment(input.aqi, input.heatIndex) : null;

  if (hrScore !== null) {
    availableComponents.push({ weight: WEIGHTS.heartRate, score: hrScore });
    if (hrScore < 50) reasons.push(`Heart rate ${input.heartRate} bpm is outside normal range`);
  }
  if (spo2Score !== null) {
    availableComponents.push({ weight: WEIGHTS.spo2, score: spo2Score });
    if (spo2Score < 50) reasons.push(`Blood oxygen ${input.spo2}% is below normal`);
  }
  if (tempScore !== null) {
    availableComponents.push({ weight: WEIGHTS.temperature, score: tempScore });
    if (tempScore < 50) reasons.push(`Body temperature ${input.bodyTemperature}°C is outside normal range`);
  }
  if (hydScore !== null) {
    availableComponents.push({ weight: WEIGHTS.hydration, score: hydScore });
    if (hydScore < 50) reasons.push(`Hydration estimate ${input.hydration}% is low`);
  }
  if (sleepScore !== null) {
    availableComponents.push({ weight: WEIGHTS.sleep, score: sleepScore });
    if (sleepScore < 50) reasons.push(`Sleep duration is insufficient`);
  }
  if (actScore !== null) {
    availableComponents.push({ weight: WEIGHTS.activity, score: actScore });
    if (actScore < 40) reasons.push(`Activity level is low`);
  }
  if (stressScoreVal !== null) {
    availableComponents.push({ weight: WEIGHTS.stress, score: stressScoreVal });
    if (stressScoreVal < 40) reasons.push(`Stress level is elevated`);
  }
  if (respScore !== null) {
    availableComponents.push({ weight: WEIGHTS.respiratory, score: respScore });
    if (respScore < 50) reasons.push(`Respiratory rate is abnormal`);
  }
  if (envScore !== null) {
    availableComponents.push({ weight: WEIGHTS.environment, score: envScore });
    if (envScore < 50) reasons.push(`Environmental conditions are concerning`);
  }

  let finalScore: number;
  if (availableComponents.length === 0) {
    finalScore = 50;
    reasons.push('No health data available for scoring');
  } else {
    const totalWeight = availableComponents.reduce((sum, c) => sum + c.weight, 0);
    finalScore = availableComponents.reduce((sum, c) => sum + (c.score * c.weight / totalWeight), 0);
  }

  finalScore = Math.round(clamp(finalScore, 0, 100));

  return {
    score: finalScore,
    riskLevel: determineRiskLevel(finalScore),
    components: {
      heartRate: hrScore ?? 0,
      spo2: spo2Score ?? 0,
      temperature: tempScore ?? 0,
      hydration: hydScore ?? 0,
      sleep: sleepScore ?? 0,
      activity: actScore ?? 0,
      stress: stressScoreVal ?? 0,
      respiratory: respScore ?? 0,
      environment: envScore ?? 0,
    },
    reasons,
    dataQuality: assessDataQuality(input),
  };
}

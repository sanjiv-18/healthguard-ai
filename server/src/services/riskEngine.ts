export interface RiskInput {
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
  baseline?: {
    heartRateMin: number;
    heartRateMax: number;
    spo2Min: number;
    temperatureMin: number;
    temperatureMax: number;
    hydrationMin: number;
    hydrationMax: number;
    sleepMin: number;
    sleepMax: number;
  };
}

export interface RiskOutput {
  overallRisk: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  heatStress: number;
  dehydration: number;
  respiratory: number;
  cardiacStrain: number;
  fatigue: number;
  explanation: string;
  recommendations: string[];
  confidence: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function calculateHeatStress(input: RiskInput): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const bl = input.baseline;

  if (input.envTemp !== undefined) {
    if (input.envTemp > 40) { score += 35; factors.push('extreme ambient temperature'); }
    else if (input.envTemp > 35) { score += 25; factors.push('high ambient temperature'); }
    else if (input.envTemp > 30) { score += 12; factors.push('elevated ambient temperature'); }
  }

  if (input.heatIndex !== undefined) {
    if (input.heatIndex > 45) { score += 30; factors.push('dangerous heat index'); }
    else if (input.heatIndex > 38) { score += 20; factors.push('high heat index'); }
    else if (input.heatIndex > 32) { score += 10; factors.push('moderate heat index'); }
  }

  const tempMax = bl?.temperatureMax ?? 37.2;
  if (input.temperature > tempMax + 1.0) { score += 25; factors.push('elevated body temperature'); }
  else if (input.temperature > tempMax + 0.5) { score += 12; factors.push('slightly elevated body temperature'); }

  const hrMax = bl?.heartRateMax ?? 85;
  if (input.heartRate > hrMax + 20) { score += 15; factors.push('heart rate elevated from heat'); }
  else if (input.heartRate > hrMax + 10) { score += 8; factors.push('mildly elevated heart rate'); }

  const hydMin = bl?.hydrationMin ?? 55;
  if (input.hydration < hydMin - 10) { score += 10; factors.push('low hydration contributing to heat risk'); }

  return { score: clamp(score, 0, 100), factors };
}

function calculateDehydration(input: RiskInput): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const bl = input.baseline;

  const hydMin = bl?.hydrationMin ?? 55;
  if (input.hydration < hydMin - 25) { score += 50; factors.push('severe dehydration'); }
  else if (input.hydration < hydMin - 15) { score += 40; factors.push('moderate dehydration'); }
  else if (input.hydration < hydMin - 5) { score += 20; factors.push('mild dehydration'); }
  else if (input.hydration < hydMin) { score += 10; factors.push('slightly below baseline hydration'); }

  if (input.hydration < 35) { score += 25; factors.push('critically low hydration'); }
  else if (input.hydration < 45) { score += 10; factors.push('low hydration level'); }

  const hrMax = bl?.heartRateMax ?? 85;
  if (input.heartRate > hrMax + 15 && input.hydration < 50) {
    score += 15; factors.push('elevated heart rate with low hydration');
  } else if (input.heartRate > hrMax + 10 && input.hydration < 55) {
    score += 8; factors.push('mildly elevated heart rate with dehydration');
  }

  const tempMax = bl?.temperatureMax ?? 37.2;
  if (input.temperature > tempMax + 0.5 && input.hydration < 50) {
    score += 15; factors.push('elevated temperature with low hydration');
  }

  return { score: clamp(score, 0, 100), factors };
}

function calculateRespiratory(input: RiskInput): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const bl = input.baseline;

  if (input.aqi !== undefined) {
    if (input.aqi > 200) { score += 35; factors.push('very unhealthy air quality'); }
    else if (input.aqi > 150) { score += 28; factors.push('unhealthy air quality'); }
    else if (input.aqi > 100) { score += 18; factors.push('unhealthy for sensitive groups'); }
    else if (input.aqi > 50) { score += 5; factors.push('moderate air quality'); }
  }

  const spo2Min = bl?.spo2Min ?? 95;
  if (input.spo2 < 90) { score += 40; factors.push('dangerously low SpO2'); }
  else if (input.spo2 < 93) { score += 25; factors.push('low SpO2'); }
  else if (input.spo2 < spo2Min) { score += 10; factors.push('below baseline SpO2'); }

  if (input.aqi !== undefined && input.aqi > 100 && input.spo2 < 95) {
    score += 12; factors.push('poor air quality with reduced oxygen saturation');
  }

  if (input.heartRate > 80 && input.aqi !== undefined && input.aqi > 150) {
    score += 10; factors.push('elevated heart rate due to respiratory distress');
  }

  return { score: clamp(score, 0, 100), factors };
}

function calculateCardiacStrain(input: RiskInput): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const bl = input.baseline;

  const hrMax = bl?.heartRateMax ?? 85;
  if (input.heartRate > 140) { score += 40; factors.push('dangerously high heart rate'); }
  else if (input.heartRate > 120) { score += 30; factors.push('very high heart rate'); }
  else if (input.heartRate > hrMax + 20) { score += 20; factors.push('elevated heart rate'); }
  else if (input.heartRate > hrMax + 10) { score += 10; factors.push('slightly elevated heart rate'); }

  if (input.hrv !== undefined) {
    if (input.hrv < 20) { score += 25; factors.push('very low HRV indicating cardiac stress'); }
    else if (input.hrv < 30) { score += 15; factors.push('low HRV'); }
  }

  if (input.heartRate > 100 && input.hrv !== undefined && input.hrv < 30) {
    score += 15; factors.push('high HR with low HRV');
  }

  return { score: clamp(score, 0, 100), factors };
}

function calculateFatigue(input: RiskInput): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const bl = input.baseline;

  const sleepMin = bl?.sleepMin ?? 6;
  if (input.sleep !== undefined) {
    if (input.sleep < 3) { score += 25; factors.push('severe sleep deprivation'); }
    else if (input.sleep < 4) { score += 15; factors.push('poor sleep quality'); }
    else if (input.sleep < sleepMin) { score += 10; factors.push('insufficient sleep'); }
  }

  if (input.hrv !== undefined) {
    if (input.hrv < 25) { score += 15; factors.push('low HRV indicating fatigue'); }
    else if (input.hrv < 35) { score += 8; factors.push('moderately low HRV'); }
  }

  if (input.activity !== undefined && input.activity < 10) {
    score += 10; factors.push('very low activity level');
  }

  if (input.sleep !== undefined && input.sleep < 5 && input.hrv !== undefined && input.hrv < 35) {
    score += 12; factors.push('combined poor sleep and low HRV');
  }

  return { score: clamp(score, 0, 100), factors };
}

function determineLevel(risk: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (risk >= 75) return 'CRITICAL';
  if (risk >= 50) return 'HIGH';
  if (risk >= 25) return 'MODERATE';
  return 'LOW';
}

function generateExplanation(
  heatStress: number, dehydration: number, respiratory: number,
  cardiacStrain: number, fatigue: number, allFactors: string[]
): string {
  const parts: string[] = [];

  if (heatStress > 25) {
    parts.push(`Heat stress is elevated (${heatStress.toFixed(0)}/100) due to environmental and body temperature factors.`);
  }
  if (dehydration > 25) {
    parts.push(`Dehydration risk is significant (${dehydration.toFixed(0)}/100) with low fluid levels detected.`);
  }
  if (respiratory > 25) {
    parts.push(`Respiratory concerns (${respiratory.toFixed(0)}/100) from air quality and oxygen saturation levels.`);
  }
  if (cardiacStrain > 25) {
    parts.push(`Cardiac strain detected (${cardiacStrain.toFixed(0)}/100) with elevated heart rate and reduced HRV.`);
  }
  if (fatigue > 25) {
    parts.push(`Fatigue indicators (${fatigue.toFixed(0)}/100) suggest insufficient recovery.`);
  }

  if (parts.length === 0) {
    return 'All vital signs and environmental conditions are within normal ranges. No significant health risks detected.';
  }

  return parts.join(' ') + ` Key factors: ${allFactors.slice(0, 5).join(', ')}.`;
}

function generateRecommendations(
  heatStress: number, dehydration: number, respiratory: number,
  cardiacStrain: number, fatigue: number
): string[] {
  const recs: string[] = [];

  if (heatStress > 20) {
    recs.push('Move to a shaded or air-conditioned area immediately.');
    recs.push('Apply cold compresses to neck and wrists.');
    recs.push('Avoid strenuous outdoor activity until conditions improve.');
  }
  if (dehydration > 20) {
    recs.push('Drink at least 500ml of water or electrolyte solution within the next 30 minutes.');
    recs.push('Reduce physical activity to minimize fluid loss.');
    recs.push('Monitor urine color; aim for pale yellow.');
  }
  if (respiratory > 20) {
    recs.push('Limit outdoor exposure, especially near traffic or industrial areas.');
    recs.push('Use a mask if outdoor air quality is poor.');
    recs.push('Monitor SpO2 levels regularly.');
  }
  if (cardiacStrain > 20) {
    recs.push('Rest and avoid physical exertion.');
    recs.push('If chest pain or dizziness occurs, seek medical attention immediately.');
    recs.push('Practice deep breathing exercises to reduce cardiac load.');
  }
  if (fatigue > 20) {
    recs.push('Prioritize sleep; aim for 7-9 hours tonight.');
    recs.push('Take short rest breaks throughout the day.');
    recs.push('Avoid caffeine and screen time before bed.');
  }

  if (recs.length === 0) {
    recs.push('Continue maintaining current healthy habits.');
    recs.push('Stay hydrated throughout the day.');
  }

  return recs;
}

export function calculateRisk(input: RiskInput): RiskOutput {
  const heat = calculateHeatStress(input);
  const dehy = calculateDehydration(input);
  const resp = calculateRespiratory(input);
  const cardiac = calculateCardiacStrain(input);
  const fat = calculateFatigue(input);

  const allFactors = [...heat.factors, ...dehy.factors, ...resp.factors, ...cardiac.factors, ...fat.factors];

  const maxScore = Math.max(heat.score, dehy.score, resp.score, cardiac.score, fat.score);
  const avgScore = (heat.score * 0.25 + dehy.score * 0.25 + resp.score * 0.2 + cardiac.score * 0.2 + fat.score * 0.1);
  const overallRisk = Math.max(maxScore * 0.9, avgScore * 1.2);
  const clampedRisk = clamp(overallRisk, 0, 100);

  let confidence = 0.85;
  if (input.hrv !== undefined) confidence += 0.03;
  if (input.sleep !== undefined) confidence += 0.03;
  if (input.aqi !== undefined) confidence += 0.02;
  if (input.heatIndex !== undefined) confidence += 0.02;
  confidence = clamp(confidence, 0, 0.98);

  return {
    overallRisk: Math.round(clampedRisk * 10) / 10,
    level: determineLevel(clampedRisk),
    heatStress: Math.round(heat.score * 10) / 10,
    dehydration: Math.round(dehy.score * 10) / 10,
    respiratory: Math.round(resp.score * 10) / 10,
    cardiacStrain: Math.round(cardiac.score * 10) / 10,
    fatigue: Math.round(fat.score * 10) / 10,
    explanation: generateExplanation(heat.score, dehy.score, resp.score, cardiac.score, fat.score, allFactors),
    recommendations: generateRecommendations(heat.score, dehy.score, resp.score, cardiac.score, fat.score),
    confidence: Math.round(confidence * 100) / 100
  };
}

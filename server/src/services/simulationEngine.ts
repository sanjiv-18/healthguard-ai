export interface SimulationData {
  vitalReading: {
    heartRate: number;
    spo2: number;
    bodyTemperature: number;
    hydration: number;
    hrv: number;
    sleepMinutes: number;
    steps: number;
    stressPercent: number;
    respiratoryRate: number;
    calories: number;
    source: string;
  };
  envReading?: {
    environmentalTemperature: number;
    humidity: number;
    aqi: number;
    uvIndex: number;
    heatIndex: number;
    windSpeed: number;
    source: string;
  };
}

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNormal(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(68, 82),
      spo2: randomInRange(96, 99),
      bodyTemperature: randomInRange(36.2, 37.0),
      hydration: randomInRange(65, 85),
      hrv: randomInRange(35, 65),
      sleepMinutes: randomInt(420, 540),
      steps: randomInt(3000, 8000),
      stressPercent: randomInRange(10, 30),
      respiratoryRate: randomInRange(12, 18),
      calories: randomInt(1800, 2500),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(22, 28),
      humidity: randomInRange(40, 60),
      aqi: randomInRange(20, 60),
      uvIndex: randomInRange(2, 6),
      heatIndex: randomInRange(24, 32),
      windSpeed: randomInRange(5, 15),
      source: 'simulation',
    },
  };
}

export function generateExercise(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(100, 140),
      spo2: randomInRange(95, 98),
      bodyTemperature: randomInRange(36.8, 37.6),
      hydration: randomInRange(55, 72),
      hrv: randomInRange(20, 40),
      sleepMinutes: randomInt(420, 540),
      steps: randomInt(6000, 12000),
      stressPercent: randomInRange(20, 50),
      respiratoryRate: randomInRange(20, 30),
      calories: randomInt(2500, 4000),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(24, 30),
      humidity: randomInRange(40, 65),
      aqi: randomInRange(20, 50),
      uvIndex: randomInRange(3, 7),
      heatIndex: randomInRange(26, 34),
      windSpeed: randomInRange(3, 10),
      source: 'simulation',
    },
  };
}

export function generateHeatStress(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(95, 120),
      spo2: randomInRange(95, 97),
      bodyTemperature: randomInRange(37.5, 38.5),
      hydration: randomInRange(38, 52),
      hrv: randomInRange(18, 35),
      sleepMinutes: randomInt(360, 480),
      steps: randomInt(1000, 3000),
      stressPercent: randomInRange(40, 70),
      respiratoryRate: randomInRange(18, 26),
      calories: randomInt(1500, 2200),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(38, 44),
      humidity: randomInRange(55, 78),
      aqi: randomInRange(30, 80),
      uvIndex: randomInRange(8, 11),
      heatIndex: randomInRange(46, 56),
      windSpeed: randomInRange(2, 8),
      source: 'simulation',
    },
  };
}

export function generateHighHeartRate(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(110, 150),
      spo2: randomInRange(94, 98),
      bodyTemperature: randomInRange(36.5, 37.3),
      hydration: randomInRange(55, 70),
      hrv: randomInRange(15, 30),
      sleepMinutes: randomInt(360, 540),
      steps: randomInt(2000, 5000),
      stressPercent: randomInRange(50, 80),
      respiratoryRate: randomInRange(18, 28),
      calories: randomInt(2000, 2800),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(23, 29),
      humidity: randomInRange(40, 55),
      aqi: randomInRange(20, 50),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(25, 33),
      windSpeed: randomInRange(5, 12),
      source: 'simulation',
    },
  };
}

export function generateLowSpO2(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(80, 100),
      spo2: randomInRange(88, 93),
      bodyTemperature: randomInRange(36.3, 37.0),
      hydration: randomInRange(55, 70),
      hrv: randomInRange(25, 45),
      sleepMinutes: randomInt(360, 540),
      steps: randomInt(1500, 4000),
      stressPercent: randomInRange(30, 60),
      respiratoryRate: randomInRange(20, 28),
      calories: randomInRange(1800, 2400),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(22, 28),
      humidity: randomInRange(40, 60),
      aqi: randomInRange(80, 180),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(24, 32),
      windSpeed: randomInRange(3, 10),
      source: 'simulation',
    },
  };
}

export function generateDehydration(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(92, 110),
      spo2: randomInRange(95, 98),
      bodyTemperature: randomInRange(37.3, 37.9),
      hydration: randomInRange(25, 38),
      hrv: randomInRange(18, 35),
      sleepMinutes: randomInt(360, 480),
      steps: randomInt(1500, 3500),
      stressPercent: randomInRange(35, 60),
      respiratoryRate: randomInRange(16, 24),
      calories: randomInt(1600, 2200),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(25, 30),
      humidity: randomInRange(25, 40),
      aqi: randomInRange(30, 70),
      uvIndex: randomInRange(5, 9),
      heatIndex: randomInRange(28, 36),
      windSpeed: randomInRange(3, 10),
      source: 'simulation',
    },
  };
}

export function generatePoorSleep(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(75, 95),
      spo2: randomInRange(95, 98),
      bodyTemperature: randomInRange(36.3, 37.0),
      hydration: randomInRange(50, 62),
      hrv: randomInRange(18, 30),
      sleepMinutes: randomInt(120, 240),
      steps: randomInt(1000, 3000),
      stressPercent: randomInRange(30, 55),
      respiratoryRate: randomInRange(14, 20),
      calories: randomInt(1600, 2200),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(22, 27),
      humidity: randomInRange(42, 58),
      aqi: randomInRange(25, 55),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(24, 31),
      windSpeed: randomInRange(5, 12),
      source: 'simulation',
    },
  };
}

export function generateCombinedRisk(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(110, 140),
      spo2: randomInRange(91, 95),
      bodyTemperature: randomInRange(37.8, 38.8),
      hydration: randomInRange(28, 42),
      hrv: randomInRange(12, 25),
      sleepMinutes: randomInt(150, 300),
      steps: randomInt(500, 2000),
      stressPercent: randomInRange(60, 90),
      respiratoryRate: randomInRange(22, 32),
      calories: randomInt(1400, 2000),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(39, 44),
      humidity: randomInRange(55, 80),
      aqi: randomInRange(160, 280),
      uvIndex: randomInRange(8, 11),
      heatIndex: randomInRange(48, 58),
      windSpeed: randomInRange(1, 5),
      source: 'simulation',
    },
  };
}

export function generateFallDetection(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(115, 145),
      spo2: randomInRange(92, 96),
      bodyTemperature: randomInRange(36.5, 37.3),
      hydration: randomInRange(48, 60),
      hrv: randomInRange(10, 22),
      sleepMinutes: randomInt(360, 540),
      steps: randomInt(0, 500),
      stressPercent: randomInRange(50, 80),
      respiratoryRate: randomInRange(20, 30),
      calories: randomInt(100, 500),
      source: 'SIMULATED_WATCH',
    },
    envReading: {
      environmentalTemperature: randomInRange(23, 28),
      humidity: randomInRange(40, 55),
      aqi: randomInRange(25, 50),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(25, 32),
      windSpeed: randomInRange(5, 10),
      source: 'simulation',
    },
  };
}

export function generateDeviceDisconnect(): SimulationData {
  return {
    vitalReading: {
      heartRate: 0,
      spo2: 0,
      bodyTemperature: 0,
      hydration: 0,
      hrv: 0,
      sleepMinutes: 0,
      steps: 0,
      stressPercent: 0,
      respiratoryRate: 0,
      calories: 0,
      source: 'DEVICE_DISCONNECTED',
    },
  };
}

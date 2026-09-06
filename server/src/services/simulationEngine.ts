export interface SimulationData {
  vitalReading: {
    heartRate: number;
    spo2: number;
    temperature: number;
    hydration: number;
    hrv: number;
    sleep: number;
    activity: number;
    source: string;
  };
  envReading?: {
    temperature: number;
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

export function generateNormal(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(62, 82),
      spo2: randomInRange(96, 99),
      temperature: randomInRange(36.2, 37.0),
      hydration: randomInRange(58, 72),
      hrv: randomInRange(35, 65),
      sleep: randomInRange(6.5, 8.5),
      activity: randomInRange(30, 60),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(22, 28),
      humidity: randomInRange(40, 60),
      aqi: randomInRange(20, 60),
      uvIndex: randomInRange(2, 6),
      heatIndex: randomInRange(24, 32),
      windSpeed: randomInRange(5, 15),
      source: 'simulation'
    }
  };
}

export function generateHeatStress(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(90, 115),
      spo2: randomInRange(95, 98),
      temperature: randomInRange(37.5, 38.5),
      hydration: randomInRange(40, 55),
      hrv: randomInRange(20, 40),
      sleep: randomInRange(5, 7),
      activity: randomInRange(10, 30),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(38, 43),
      humidity: randomInRange(50, 75),
      aqi: randomInRange(30, 80),
      uvIndex: randomInRange(8, 11),
      heatIndex: randomInRange(45, 55),
      windSpeed: randomInRange(2, 8),
      source: 'simulation'
    }
  };
}

export function generateDehydration(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(90, 105),
      spo2: randomInRange(95, 98),
      temperature: randomInRange(37.3, 37.8),
      hydration: randomInRange(30, 45),
      hrv: randomInRange(22, 42),
      sleep: randomInRange(5.5, 7),
      activity: randomInRange(15, 35),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(30, 36),
      humidity: randomInRange(25, 40),
      aqi: randomInRange(30, 70),
      uvIndex: randomInRange(5, 9),
      heatIndex: randomInRange(34, 42),
      windSpeed: randomInRange(3, 10),
      source: 'simulation'
    }
  };
}

export function generateHighAQI(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(72, 92),
      spo2: randomInRange(92, 96),
      temperature: randomInRange(36.4, 37.1),
      hydration: randomInRange(52, 68),
      hrv: randomInRange(28, 50),
      sleep: randomInRange(5.5, 7.5),
      activity: randomInRange(10, 30),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(25, 32),
      humidity: randomInRange(40, 65),
      aqi: randomInRange(150, 260),
      uvIndex: randomInRange(3, 7),
      heatIndex: randomInRange(28, 38),
      windSpeed: randomInRange(1, 6),
      source: 'simulation'
    }
  };
}

export function generateHeartRateSpike(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(120, 165),
      spo2: randomInRange(94, 98),
      temperature: randomInRange(36.5, 37.2),
      hydration: randomInRange(50, 65),
      hrv: randomInRange(15, 30),
      sleep: randomInRange(6, 8),
      activity: randomInRange(5, 20),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(23, 29),
      humidity: randomInRange(40, 55),
      aqi: randomInRange(20, 50),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(25, 33),
      windSpeed: randomInRange(5, 12),
      source: 'simulation'
    }
  };
}

export function generatePoorSleep(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(70, 95),
      spo2: randomInRange(95, 98),
      temperature: randomInRange(36.3, 37.1),
      hydration: randomInRange(50, 65),
      hrv: randomInRange(18, 35),
      sleep: randomInRange(2.5, 4.5),
      activity: randomInRange(10, 25),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(22, 27),
      humidity: randomInRange(42, 58),
      aqi: randomInRange(25, 55),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(24, 31),
      windSpeed: randomInRange(5, 12),
      source: 'simulation'
    }
  };
}

export function generateCombinedRisk(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(110, 140),
      spo2: randomInRange(91, 95),
      temperature: randomInRange(37.8, 38.8),
      hydration: randomInRange(30, 42),
      hrv: randomInRange(12, 25),
      sleep: randomInRange(3, 5),
      activity: randomInRange(5, 15),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(39, 44),
      humidity: randomInRange(55, 80),
      aqi: randomInRange(160, 280),
      uvIndex: randomInRange(8, 11),
      heatIndex: randomInRange(48, 58),
      windSpeed: randomInRange(1, 5),
      source: 'simulation'
    }
  };
}

export function generateFallDetection(): SimulationData {
  return {
    vitalReading: {
      heartRate: randomInRange(100, 130),
      spo2: randomInRange(93, 97),
      temperature: randomInRange(36.4, 37.2),
      hydration: randomInRange(50, 65),
      hrv: randomInRange(15, 30),
      sleep: randomInRange(6, 8),
      activity: randomInRange(0, 5),
      source: 'simulation'
    },
    envReading: {
      temperature: randomInRange(23, 28),
      humidity: randomInRange(40, 55),
      aqi: randomInRange(25, 50),
      uvIndex: randomInRange(2, 5),
      heatIndex: randomInRange(25, 32),
      windSpeed: randomInRange(5, 10),
      source: 'simulation'
    }
  };
}

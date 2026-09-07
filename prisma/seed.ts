import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${path.join(__dirname, 'dev.db')}` } }
});

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Seeding database...');

  const demoUserPassword = await bcrypt.hash('DemoUser@123', 10);
  const demoDoctorPassword = await bcrypt.hash('DemoDoctor@123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo.user@healthguard.local' },
    update: {},
    create: {
      email: 'demo.user@healthguard.local',
      password: demoUserPassword,
      name: 'Demo Patient',
      role: 'USER',
      dob: '1990-05-15',
      gender: 'male',
      height: 175,
      weight: 72,
    },
  });

  const demoDoctor = await prisma.user.upsert({
    where: { email: 'demo.doctor@healthguard.local' },
    update: {},
    create: {
      email: 'demo.doctor@healthguard.local',
      password: demoDoctorPassword,
      name: 'Dr. Sarah Chen',
      role: 'DOCTOR',
      dob: '1985-03-20',
      gender: 'female',
    },
  });

  await prisma.patientProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      bloodType: 'O+',
      allergies: 'None',
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: demoDoctor.id },
    update: {},
    create: {
      userId: demoDoctor.id,
      specialty: 'Internal Medicine',
      licenseNo: 'MD-2024-12345',
      hospital: 'City General Hospital',
    },
  });

  await prisma.healthBaseline.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      heartRateMin: 60,
      heartRateMax: 85,
      spo2Min: 95,
      temperatureMin: 36.1,
      temperatureMax: 37.2,
      hydrationMin: 55,
      hydrationMax: 75,
      hrvMin: 30,
      hrvMax: 70,
      sleepMinMinutes: 360,
      sleepMaxMinutes: 540,
      stepsMin: 5000,
      stepsMax: 10000,
    },
  });

  const existingVitals = await prisma.vitalReading.count({ where: { userId: demoUser.id } });
  if (existingVitals === 0) {
    const now = new Date();
    const vitalsData = [];
    const envData = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      for (let j = 0; j < 2; j++) {
        const timestamp = new Date(date);
        timestamp.setHours(8 + j * 8, randomInt(0, 59), 0, 0);

        vitalsData.push({
          userId: demoUser.id,
          timestamp,
          heartRate: randomInRange(62, 88),
          spo2: randomInRange(95, 99),
          bodyTemperature: randomInRange(36.1, 37.3),
          hydration: randomInRange(55, 80),
          hrv: randomInRange(30, 70),
          sleepMinutes: randomInt(360, 540),
          steps: randomInt(2000, 10000),
          stressPercent: randomInRange(10, 45),
          respiratoryRate: randomInRange(12, 20),
          calories: randomInt(1800, 2800),
          source: 'SIMULATED_WATCH',
        });

        envData.push({
          userId: demoUser.id,
          timestamp,
          environmentalTemperature: randomInRange(20, 32),
          humidity: randomInRange(35, 70),
          aqi: randomInRange(15, 90),
          uvIndex: randomInRange(1, 8),
          heatIndex: randomInRange(22, 35),
          windSpeed: randomInRange(2, 15),
          source: 'simulation',
        });
      }
    }

    await prisma.vitalReading.createMany({ data: vitalsData });
    await prisma.environmentReading.createMany({ data: envData });
    console.log(`Created ${vitalsData.length} vital readings and ${envData.length} environment readings.`);
  }

  await prisma.device.upsert({
    where: { id: 'sim-device-001' },
    update: {},
    create: {
      id: 'sim-device-001',
      userId: demoUser.id,
      name: 'HealthGuard Smart Watch',
      type: 'SMARTWATCH',
      manufacturer: 'HealthGuard',
      model: 'HG-W1',
      provider: 'SIMULATED',
      status: 'CONNECTED',
      battery: 84,
      isSimulation: true,
    },
  });

  const existingContacts = await prisma.emergencyContact.count({ where: { userId: demoUser.id } });
  if (existingContacts === 0) {
    await prisma.emergencyContact.createMany({
      data: [
        { userId: demoUser.id, name: 'John Doe', phone: '+1-555-0101', relation: 'Spouse' },
        { userId: demoUser.id, name: 'Jane Doe', phone: '+1-555-0102', relation: 'Mother' },
      ],
    });
  }

  const existingNotifications = await prisma.notification.count({ where: { userId: demoUser.id } });
  if (existingNotifications === 0) {
    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        type: 'SYSTEM',
        title: 'Welcome to HealthGuard AI',
        message: 'Your account has been set up. Start by connecting a device or running a simulation.',
      },
    });
  }

  console.log('Seed completed successfully.');
  console.log('Demo User: demo.user@healthguard.local / DemoUser@123');
  console.log('Demo Doctor: demo.doctor@healthguard.local / DemoDoctor@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

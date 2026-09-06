import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function main() {
  console.log('Seeding database...');

  const demoPassword = await bcrypt.hash('DemoUser@123', 12);
  const doctorPassword = await bcrypt.hash('DemoDoctor@123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo.user@healthguard.local' },
    update: {},
    create: {
      email: 'demo.user@healthguard.local',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
      dob: '1990-05-15',
      gender: 'Male',
      height: 175,
      weight: 72
    }
  });

  const demoDoctor = await prisma.user.upsert({
    where: { email: 'demo.doctor@healthguard.local' },
    update: {},
    create: {
      email: 'demo.doctor@healthguard.local',
      password: doctorPassword,
      name: 'Dr. Sarah Chen',
      role: 'DOCTOR'
    }
  });

  console.log(`Demo user: ${demoUser.id}`);
  console.log(`Demo doctor: ${demoDoctor.id}`);

  await prisma.patientProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      bloodType: 'O+',
      allergies: 'None',
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '+1-555-0123'
    }
  });

  await prisma.doctorProfile.upsert({
    where: { userId: demoDoctor.id },
    update: {},
    create: {
      userId: demoDoctor.id,
      specialty: 'Internal Medicine',
      licenseNo: 'MD-2024-12345',
      hospital: 'City General Hospital'
    }
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
      sleepMin: 6,
      sleepMax: 9
    }
  });

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  console.log('Generating 30 days of historical vital readings...');

  const vitalReadings = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + day);

    const readingsPerDay = Math.floor(Math.random() * 3) + 2;

    for (let r = 0; r < readingsPerDay; r++) {
      const hour = 8 + Math.floor(Math.random() * 12);
      const timestamp = new Date(date);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      vitalReadings.push({
        userId: demoUser.id,
        timestamp,
        heartRate: randomInRange(62, 84),
        spo2: randomInRange(96, 99),
        temperature: randomInRange(36.2, 37.1),
        hydration: randomInRange(58, 72),
        hrv: randomInRange(32, 65),
        sleep: randomInRange(6.5, 8.5),
        activity: randomInRange(25, 65),
        source: 'device:simulation'
      });
    }
  }

  await prisma.vitalReading.createMany({ data: vitalReadings });
  console.log(`Created ${vitalReadings.length} vital readings`);

  console.log('Generating 30 days of environmental readings...');

  const envReadings = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + day);

    const readingsPerDay = Math.floor(Math.random() * 3) + 1;

    for (let r = 0; r < readingsPerDay; r++) {
      const hour = 8 + Math.floor(Math.random() * 12);
      const timestamp = new Date(date);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      const envTemp = randomInRange(24, 32);
      const humidity = randomInRange(40, 65);

      envReadings.push({
        userId: demoUser.id,
        timestamp,
        temperature: envTemp,
        humidity,
        aqi: randomInRange(25, 80),
        uvIndex: randomInRange(3, 8),
        heatIndex: envTemp * 0.8 + humidity * 0.15 + 2,
        windSpeed: randomInRange(5, 15),
        source: 'simulation'
      });
    }
  }

  await prisma.environmentReading.createMany({ data: envReadings });
  console.log(`Created ${envReadings.length} environment readings`);

  await prisma.riskAssessment.create({
    data: {
      userId: demoUser.id,
      overallRisk: 15,
      level: 'LOW',
      heatStress: 5,
      dehydration: 8,
      respiratory: 3,
      cardiacStrain: 10,
      fatigue: 12,
      explanation: 'All vital signs are within normal ranges. Environmental conditions are favorable. No significant health risks detected.',
      recommendations: JSON.stringify([
        'Continue maintaining current healthy habits.',
        'Stay hydrated throughout the day.',
        'Regular physical activity is recommended.'
      ]),
      confidence: 0.92
    }
  });

  await prisma.device.create({
    data: {
      userId: demoUser.id,
      name: 'HealthGuard Simulator',
      type: 'SIMULATION',
      status: 'connected',
      isSimulation: true
    }
  });

  await prisma.emergencyContact.create({
    data: {
      userId: demoUser.id,
      name: 'John Doe',
      phone: '+1-555-0123',
      relation: 'Spouse'
    }
  });

  await prisma.emergencyContact.create({
    data: {
      userId: demoUser.id,
      name: 'Jane Doe',
      phone: '+1-555-0456',
      relation: 'Parent'
    }
  });

  await prisma.systemEvent.create({
    data: {
      type: 'DATABASE_SEEDED',
      userId: demoUser.id,
      details: 'Initial database seed completed with 30 days of historical data'
    }
  });

  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      type: 'HEALTH',
      title: 'Welcome to HealthGuard AI',
      message: 'Your account has been set up with 30 days of historical health data.'
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

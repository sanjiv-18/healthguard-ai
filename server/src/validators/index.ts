import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['USER', 'DOCTOR']).optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const vitalReadingSchema = z.object({
  heartRate: z.number().min(30).max(250),
  spo2: z.number().min(50).max(100),
  bodyTemperature: z.number().min(30).max(45),
  hydration: z.number().min(0).max(100),
  hrv: z.number().optional(),
  sleepMinutes: z.number().min(0).max(1440).optional(),
  steps: z.number().min(0).optional(),
  stressPercent: z.number().min(0).max(100).optional(),
  respiratoryRate: z.number().min(0).max(60).optional(),
  calories: z.number().min(0).optional(),
  source: z.string().optional(),
});

export const envReadingSchema = z.object({
  environmentalTemperature: z.number().min(-50).max(60),
  humidity: z.number().min(0).max(100),
  aqi: z.number().min(0).max(500),
  uvIndex: z.number().min(0).max(20).optional(),
  heatIndex: z.number().min(-50).max(70),
  windSpeed: z.number().min(0).optional(),
  weatherCondition: z.string().optional(),
  source: z.string().optional(),
});

export const doctorAccessSchema = z.object({
  doctorEmail: z.string().email(),
  scopes: z.array(z.enum([
    'currentVitals', 'healthTrends', 'aiRisk', 'environment', 'alerts', 'healthHistory', 'emergencyEvents',
  ])).min(1),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export const clinicalNoteSchema = z.object({
  userId: z.string().uuid(),
  observation: z.string().min(1),
  assessment: z.string().min(1),
  followUp: z.string().optional(),
});

export const alertAcknowledgeSchema = z.object({
  status: z.literal('ACKNOWLEDGED'),
});

export const alertResolveSchema = z.object({
  status: z.literal('RESOLVED'),
});

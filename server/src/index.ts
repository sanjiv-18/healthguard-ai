import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import environmentRoutes from './routes/environment';
import aiRoutes from './routes/ai';
import baselineRoutes from './routes/baseline';
import alertsRoutes from './routes/alerts';
import notificationsRoutes from './routes/notifications';
import devicesRoutes from './routes/devices';
import emergencyRoutes from './routes/emergency';
import accessRoutes from './routes/access';
import doctorRoutes from './routes/doctor';
import privacyRoutes from './routes/privacy';
import simulationRoutes from './routes/simulation';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../.env' });

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/baseline', baselineRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/simulation', simulationRoutes);

app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HealthGuard AI server running on port ${PORT}`);
});

export default app;

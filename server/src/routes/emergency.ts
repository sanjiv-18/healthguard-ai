import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/sos', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { latitude, longitude, notes } = req.body;

    const event = await prisma.emergencyEvent.create({
      data: {
        userId: req.user.id,
        trigger: 'MANUAL_SOS',
        latitude: latitude || null,
        longitude: longitude || null,
        notes: notes || null
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'EMERGENCY',
        title: 'SOS Triggered',
        message: 'Emergency SOS has been activated. Your emergency contacts have been notified.'
      }
    });

    await prisma.alert.create({
      data: {
        userId: req.user.id,
        level: 'CRITICAL',
        category: 'EMERGENCY',
        title: 'SOS Emergency Activated',
        message: `Manual SOS triggered at ${new Date().toISOString()}. ${notes || ''}`,
        factors: JSON.stringify(['manual_sos', 'emergency'])
      }
    });

    await prisma.systemEvent.create({
      data: {
        type: 'EMERGENCY_SOS',
        userId: req.user.id,
        details: `SOS triggered. Location: ${latitude || 'unknown'}, ${longitude || 'unknown'}`
      }
    });

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: req.user.id }
    });

    res.json({
      event,
      notifiedContacts: contacts.map(c => ({ name: c.name, phone: c.phone, relation: c.relation }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
});

router.post('/fall', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const { latitude, longitude } = req.body;

    const event = await prisma.emergencyEvent.create({
      data: {
        userId: req.user.id,
        trigger: 'FALL_DETECTION',
        latitude: latitude || null,
        longitude: longitude || null,
        notes: 'Fall detected by device sensors'
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'EMERGENCY',
        title: 'Fall Detected',
        message: 'A fall has been detected. Emergency services may be contacted if no response is received within 60 seconds.'
      }
    });

    await prisma.alert.create({
      data: {
        userId: req.user.id,
        level: 'CRITICAL',
        category: 'EMERGENCY',
        title: 'Fall Detection Alert',
        message: 'Fall detected. Please respond within 60 seconds or emergency services will be contacted.',
        factors: JSON.stringify(['fall_detection', 'emergency'])
      }
    });

    await prisma.systemEvent.create({
      data: {
        type: 'FALL_DETECTION',
        userId: req.user.id,
        details: `Fall detected. Location: ${latitude || 'unknown'}, ${longitude || 'unknown'}`
      }
    });

    res.json({ event, message: 'Fall detection triggered. Respond within 60 seconds to cancel.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger fall detection' });
  }
});

router.get('/events', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const events = await prisma.emergencyEvent.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency events' });
  }
});

export default router;

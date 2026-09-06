import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated' }); return; }

    const id = String(req.params.id);

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({ notification: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;

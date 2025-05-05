import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);
router.get('/unread-count', getUnreadNotificationCount);

export default router;
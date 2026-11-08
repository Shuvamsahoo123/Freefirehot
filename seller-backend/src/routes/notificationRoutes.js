import express from 'express';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  toggleNotificationStatus
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);
router.patch('/:id/status', toggleNotificationStatus);

export default router;

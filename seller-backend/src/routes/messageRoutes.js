import express from 'express';
import {
  getMessages,
  createMessage,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', createMessage);
router.patch('/:id/read', markMessageAsRead);
router.delete('/:id', deleteMessage);

export default router;

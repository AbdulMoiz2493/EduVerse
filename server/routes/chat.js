import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMessages } from '../controllers/chatController.js';

const router = express.Router();

router.use(authenticate);

router.get('/:courseId', getMessages);

export default router;
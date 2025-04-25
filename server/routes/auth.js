import express from 'express';
import { signup, login, googleLogin, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);

export default router;
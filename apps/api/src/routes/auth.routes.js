import { Router } from 'express';
import {
  registerUser,
  loginUser,
  me,
  logout,
  refreshToken,
  forgotPassword,
  resetPasswordToken,
  verifyEmail,
  getUserPreferencesController,
  updateUserPreferencesController,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordToken);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, me);
router.get('/preferences', authenticate, getUserPreferencesController);
router.put('/preferences', authenticate, updateUserPreferencesController);

export default router;

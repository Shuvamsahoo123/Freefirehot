import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { currentSeller, getSetupStatus, loginSeller, setupSeller } from '../controllers/authController.js';
import { authenticateSeller } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Try again later.' },
});

router.get('/setup-status', getSetupStatus);
router.post('/setup', authLimiter, setupSeller);
router.post('/login', authLimiter, loginSeller);
router.get('/me', authenticateSeller, currentSeller);

export default router;

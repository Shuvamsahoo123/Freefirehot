import { Router } from 'express';
import { getPushPublicKey, savePushSubscription, removePushSubscription } from '../controllers/pushController.js';

const router = Router();

router.get('/public-key', getPushPublicKey);
router.post('/subscription', savePushSubscription);
router.delete('/subscription', removePushSubscription);

export default router;

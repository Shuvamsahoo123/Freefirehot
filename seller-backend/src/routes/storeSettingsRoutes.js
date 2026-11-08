import express from 'express';
import multer from 'multer';
import { getStoreSettings, updateStoreSettings, uploadQrCode } from '../controllers/storeSettingsController.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get store settings
router.get('/', getStoreSettings);

// Update store settings (open/close shop)
router.put('/', updateStoreSettings);

// Upload QR Code
router.post('/upload-qr', upload.single('image'), uploadQrCode);

export default router;

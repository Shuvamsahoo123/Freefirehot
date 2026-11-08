// =============================================
// Menu Items Routes - FreeFire Hotel Seller API
// =============================================
import { Router } from 'express';
import { authenticateSeller, authorizeSeller } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import {
  uploadMenuItemImage,
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  removeMenuItemImage,
  deleteMenuItem,
} from '../controllers/menuItemController.js';

const router = Router();

// Apply seller auth to all routes
router.use(authenticateSeller, authorizeSeller);

// Image upload endpoint
router.post(
  '/upload-image',
  (req, res, next) => {
    // Handle multer errors (file size, type)
    uploadImage.single('image')(req, res, (err) => {
      if (err) {
        const statusCode = err.statusCode || 400;
        let message = err.message;

        // Multer-specific error messages
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxMb = parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5;
          message = `Image file is too large. Maximum allowed size is ${maxMb} MB.`;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          message = 'Only one image can be uploaded at a time.';
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Unexpected field name. Use "image" as the field name.';
        }

        return res.status(statusCode).json({
          success: false,
          message,
        });
      }
      next();
    });
  },
  uploadMenuItemImage
);

// CRUD routes
router.post('/', createMenuItem);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id/image', removeMenuItemImage);
router.delete('/:id', deleteMenuItem);

export default router;

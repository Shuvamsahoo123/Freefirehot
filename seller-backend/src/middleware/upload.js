// =============================================
// Image Upload Middleware (Multer) - FreeFire Hotel
// =============================================
import multer from 'multer';

// Configurable max size from env, default 5 MB
const MAX_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Multer configuration for image uploads.
 * Uses memory storage (buffer) since we upload to Cloudinary, not local disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `Unsupported image format: ${file.mimetype}. Allowed formats: JPG, JPEG, PNG, WEBP.`
    );
    error.statusCode = 400;
    return cb(error, false);
  }

  // Check file extension
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    const error = new Error(
      `Unsupported file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.`
    );
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: 1,
  },
});

export { MAX_SIZE_MB, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS };

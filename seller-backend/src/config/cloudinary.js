// =============================================
// Cloudinary Configuration - FreeFire Hotel
// =============================================
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Verify Cloudinary credentials are configured.
 * Call during server startup to fail fast if misconfigured.
 */
export function verifyCloudinaryConfig() {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary configuration is incomplete. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env'
    );
  }
  console.log(`☁️  Cloudinary configured for cloud: ${cloud_name}`);
}

export default cloudinary;

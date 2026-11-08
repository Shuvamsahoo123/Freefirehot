import StoreSettings from '../models/StoreSettings.js';
import cloudinary from '../config/cloudinary.js';

const CLOUDINARY_FOLDER = 'freefire-hotel/store-settings';

/**
 * Get current store settings (shop availability)
 * GET /api/seller/store-settings
 */
export async function getStoreSettings(req, res) {
  try {
    const settings = await StoreSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Failed to get store settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store settings.',
    });
  }
}

/**
 * Update store settings (open/close shop)
 * PUT /api/seller/store-settings
 */
export async function updateStoreSettings(req, res) {
  try {
    const {
      isShopOpen,
      closureReason,
      customClosureMessage,
      closureType,
      paymentSettings,
      restaurantName,
      phone,
      address,
      estimatedPrepTime,
      openingHours,
      temporaryClosure,
      holidays,
    } = req.body;
    const settings = await StoreSettings.getSettings();

    if (isShopOpen !== undefined) {

    // If changing from closed to open
    if (isShopOpen === true && !settings.isShopOpen) {
      settings.isShopOpen = true;
      settings.closureReason = 'none';
      settings.customClosureMessage = '';
      settings.closureType = 'none';
      settings.closedAt = null;
      settings.reopenAt = null;
    } 
    // If changing from open to closed, or updating closure details
    else if (isShopOpen === false) {
      settings.isShopOpen = false;
      settings.closureReason = closureReason || 'other';
      settings.customClosureMessage = customClosureMessage || '';
      settings.closureType = closureType || 'manual';
      settings.closedAt = settings.closedAt || new Date(); // preserve existing closedAt if already closed
      
      // Handle end of day logic (optional calculation for midnight)
      if (closureType === 'end_of_day') {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        settings.reopenAt = midnight;
      } else {
        settings.reopenAt = null;
      }
    }
    }

    if (paymentSettings !== undefined) {
      settings.paymentSettings = {
        ...settings.paymentSettings,
        ...paymentSettings,
      };
    }

    if (restaurantName !== undefined) settings.restaurantName = restaurantName;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = address;
    if (estimatedPrepTime !== undefined) settings.estimatedPrepTime = estimatedPrepTime;
    if (openingHours !== undefined) settings.openingHours = openingHours;
    if (temporaryClosure !== undefined) settings.temporaryClosure = temporaryClosure;
    if (holidays !== undefined) settings.holidays = holidays;

    const savedSettings = await settings.save();

    return res.status(200).json({
      success: true,
      message: settings.isShopOpen ? 'Shop is now open' : 'Shop is now closed',
      data: savedSettings,
    });
  } catch (error) {
    console.error('Failed to update store settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store settings.',
    });
  }
}

/**
 * Upload UPI QR code image to Cloudinary.
 * POST /api/seller/store-settings/upload-qr
 */
export async function uploadQrCode(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const publicId = `${CLOUDINARY_FOLDER}/qr-${timestamp}-${randomSuffix}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: undefined,
          resource_type: 'image',
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      message: 'QR code uploaded successfully',
      data: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    });
  } catch (error) {
    console.error('QR code upload failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'QR code upload failed. Please try again.',
    });
  }
}

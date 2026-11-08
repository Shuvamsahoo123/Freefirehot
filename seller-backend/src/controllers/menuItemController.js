// =============================================
// Menu Items Controller - FreeFire Hotel
// =============================================
import cloudinary from '../config/cloudinary.js';
import MenuItem from '../models/MenuItem.js';

// Cloudinary folder for menu item images
const CLOUDINARY_FOLDER = 'freefire-hotel/menu-items';

/**
 * Upload an image to Cloudinary.
 * POST /api/seller/menu-items/upload-image
 */
export async function uploadMenuItemImage(req, res) {
  try {
    // Validate file was provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please select an image to upload.',
      });
    }

    // Generate a unique public ID based on timestamp + random suffix
    // This prevents collisions while remaining predictable
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const publicId = `${CLOUDINARY_FOLDER}/menu-item-${timestamp}-${randomSuffix}`;

    // Upload to Cloudinary using a stream from the buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: undefined, // Already included in public_id
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Limit max dimensions
          ],
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
      message: 'Image uploaded successfully',
      data: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    });
  } catch (error) {
    console.error('Image upload failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Image upload failed. Please try again.',
    });
  }
}

/**
 * Delete an image from Cloudinary.
 * Internal helper — not exposed directly as a route.
 */
async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  try {
    // Validate publicId belongs to our folder
    if (!publicId.startsWith(CLOUDINARY_FOLDER)) {
      console.warn(`Blocked deletion of image outside our folder: ${publicId}`);
      return;
    }
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Deleted Cloudinary image: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, error.message);
    // Log for later cleanup, but don't throw — the menu item update already succeeded
  }
}

/**
 * Create a new menu item.
 * POST /api/seller/menu-items
 */
export async function createMenuItem(req, res) {
  try {
    const {
      name,
      category,
      description,
      price,
      dailyQty,
      image,
      labels,
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item name is required.',
      });
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid price is required.',
      });
    }
    if (dailyQty === undefined || dailyQty === null || Number(dailyQty) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid daily quantity is required.',
      });
    }

    // Validate image object if provided
    const imageData = { url: '', publicId: '' };
    if (image && image.url && image.publicId) {
      // Verify the image was uploaded to our Cloudinary folder
      if (!image.publicId.startsWith(CLOUDINARY_FOLDER)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image reference. Please upload the image through the upload endpoint.',
        });
      }
      imageData.url = image.url;
      imageData.publicId = image.publicId;
    }

    const menuItem = new MenuItem({
      name: name.trim(),
      category: category || 'Non-Veg',
      description: description ? description.trim() : '',
      price: Number(price),
      dailyQty: Number(dailyQty),
      remaining: Number(dailyQty),
      image: imageData,
      labels: labels || [],
    });

    const savedItem = await menuItem.save();

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: savedItem,
    });
  } catch (error) {
    console.error('Create menu item failed:', error.message);

    // If a Cloudinary image was provided and the save failed, try to clean it up
    if (req.body.image?.publicId) {
      console.log('Cleaning up orphaned Cloudinary image after failed save...');
      await deleteCloudinaryImage(req.body.image.publicId);
    }

    // Handle duplicate menuItemId
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A menu item with this name already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create menu item. Please try again.',
    });
  }
}

/**
 * Get all menu items.
 * GET /api/seller/menu-items
 */
export async function getMenuItems(req, res) {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Get menu items failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items.',
    });
  }
}

/**
 * Get a single menu item by ID.
 * GET /api/seller/menu-items/:id
 */
export async function getMenuItem(req, res) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }
    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get menu item failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu item.',
    });
  }
}

/**
 * Update a menu item.
 * PUT /api/seller/menu-items/:id
 */
export async function updateMenuItem(req, res) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    const {
      name,
      category,
      description,
      price,
      dailyQty,
      image,
      labels,
    } = req.body;

    // Track the old image for cleanup after successful update
    const oldImage = { ...item.image.toObject?.() || item.image };

    // Validate and apply updates (only update provided fields)
    if (name !== undefined) item.name = name.trim();
    if (category !== undefined) item.category = category;
    if (description !== undefined) item.description = description.trim();
    if (price !== undefined) item.price = Number(price);
    if (dailyQty !== undefined) {
      item.dailyQty = Number(dailyQty);
      item.remaining = Math.max(0, Number(dailyQty) - item.booked);
    }
    if (labels !== undefined) item.labels = labels;

    // Handle image update
    if (image !== undefined) {
      if (image && image.url && image.publicId) {
        // Validate new image belongs to our folder
        if (!image.publicId.startsWith(CLOUDINARY_FOLDER)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image reference. Please upload through the upload endpoint.',
          });
        }
        item.image = {
          url: image.url,
          publicId: image.publicId,
        };
      }
      // If image is explicitly set to null or empty, keep existing image
      // (removal is handled by the dedicated DELETE endpoint)
    }

    const updatedItem = await item.save();

    // After successful save, clean up old Cloudinary image if it was replaced
    if (
      oldImage.publicId &&
      updatedItem.image.publicId &&
      oldImage.publicId !== updatedItem.image.publicId
    ) {
      // Fire and forget — don't block the response
      deleteCloudinaryImage(oldImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Update menu item failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item. Please try again.',
    });
  }
}

/**
 * Remove image from a menu item.
 * DELETE /api/seller/menu-items/:id/image
 */
export async function removeMenuItemImage(req, res) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    const oldPublicId = item.image?.publicId;

    // Clear image reference in MongoDB
    item.image = { url: '', publicId: '' };
    await item.save();

    // After successful DB update, delete from Cloudinary
    if (oldPublicId) {
      await deleteCloudinaryImage(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Image removed successfully',
      data: item,
    });
  } catch (error) {
    console.error('Remove menu item image failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove image. Please try again.',
    });
  }
}

/**
 * Delete a menu item (including Cloudinary cleanup).
 * DELETE /api/seller/menu-items/:id
 */
export async function deleteMenuItem(req, res) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    const imagePublicId = item.image?.publicId;

    await MenuItem.findByIdAndDelete(req.params.id);

    // After successful deletion, clean up Cloudinary
    if (imagePublicId) {
      deleteCloudinaryImage(imagePublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete menu item. Please try again.',
    });
  }
}

// =============================================
// MenuItem Model - FreeFire Hotel
// =============================================
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    menuItemId: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Non-Veg',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    dailyQty: {
      type: Number,
      required: [true, 'Daily quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    booked: {
      type: Number,
      default: 0,
      min: 0,
    },
    remaining: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    labels: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a URL-safe slug from the item name before saving.
 * Used as the menuItemId if not explicitly provided.
 */
menuItemSchema.pre('validate', function (next) {
  if (!this.menuItemId && this.name) {
    this.menuItemId = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  // Auto-calculate remaining
  if (this.isModified('dailyQty') || this.isModified('booked')) {
    this.remaining = Math.max(0, this.dailyQty - this.booked);
  }
  next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;

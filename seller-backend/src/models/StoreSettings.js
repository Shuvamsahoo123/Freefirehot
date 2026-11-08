import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    isShopOpen: {
      type: Boolean,
      default: true,
    },
  restaurantName: { type: String, default: 'FreeFire Hotel', trim: true },
  phone: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  estimatedPrepTime: { type: Number, default: 30, min: 5, max: 120 },
  openingHours: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      Monday: { open: '10:00', close: '22:00', closed: false },
      Tuesday: { open: '10:00', close: '22:00', closed: false },
      Wednesday: { open: '10:00', close: '22:00', closed: false },
      Thursday: { open: '10:00', close: '22:00', closed: false },
      Friday: { open: '10:00', close: '23:00', closed: false },
      Saturday: { open: '10:00', close: '23:00', closed: false },
      Sunday: { open: '11:00', close: '22:00', closed: false },
    }),
  },
  temporaryClosure: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({ enabled: false, reason: '', fromDate: '', toDate: '' }),
  },
  holidays: { type: [String], default: [] },
    closureReason: {
      type: String,
      enum: ['sold_out', 'closed_for_today', 'temporary_break', 'other', 'none'],
      default: 'none',
    },
    customClosureMessage: {
      type: String,
      default: '',
    },
    closureType: {
      type: String,
      enum: ['manual', 'end_of_day', 'none'],
      default: 'none',
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenAt: {
      type: Date,
      default: null,
    },
    paymentSettings: {
      isUpiEnabled: { type: Boolean, default: false },
      upiId: { type: String, default: '' },
      upiName: { type: String, default: '' },
      upiInstructions: { type: String, default: 'Please pay 50% advance to confirm your order.' },
      upiQrImage: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

// We only need one settings document, so we can use a static method to always get or create it
storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

export default StoreSettings;

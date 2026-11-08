// =============================================
// FreeFire Hotel - Seller Backend Server
// =============================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import { verifyCloudinaryConfig } from './config/cloudinary.js';
import menuItemRoutes from './routes/menuItemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateSeller } from './middleware/auth.js';
import dns from 'node:dns';

// Atlas SRV lookups need a resolver reachable from this runtime; keep a fallback resolver too.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========

// CORS — restrict to Seller Panel origin
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3001,http://127.0.0.1:3001')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 uploads per window
  message: {
    success: false,
    message: 'Too many upload requests. Please wait a few minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ========== ROUTES ==========

import mongoose from 'mongoose';

// Health check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    res.json({ success: true, application: 'FreeFire Hotel Seller API', database: 'connected' });
  } else {
    res.status(503).json({ success: false, application: 'FreeFire Hotel Seller API', database: 'disconnected' });
  }
});

// Authentication and first-account setup stay public; all seller APIs require a signed token.
app.use('/api/seller/auth', authRoutes);
app.use('/api/seller', authenticateSeller);

import storeSettingsRoutes from './routes/storeSettingsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Menu item routes (with upload rate limiting on the upload sub-route)
app.use('/api/seller/menu-items', (req, res, next) => {
  // Apply rate limiting only to upload endpoints
  if (req.path === '/upload-image' && req.method === 'POST') {
    return uploadLimiter(req, res, next);
  }
  next();
}, menuItemRoutes);

// Store Settings (Shop Availability) routes
app.use('/api/seller/store-settings', storeSettingsRoutes);

// Order Management routes
app.use('/api/seller/orders', orderRoutes);

// Notification routes
app.use('/api/seller/notifications', notificationRoutes);

// Contact Message routes
app.use('/api/seller/messages', messageRoutes);

// Review routes
app.use('/api/seller/reviews', reviewRoutes);

app.get('/api/seller/debug-orders', async (req, res) => {
  const orders = await mongoose.connection.db.collection('orders').find().limit(3).toArray();
  res.json(orders);
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
  });
});

// Global error handler — never expose internal details
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
});

// ========== STARTUP ==========

async function startServer() {
  try {
    // Verify Cloudinary configuration
    verifyCloudinaryConfig();

    // Connect to MongoDB
    await connectDB();

    // Start the server
    app.listen(PORT, () => {
      console.log(`\n🔥 FreeFire Hotel Seller Backend running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/seller/menu-items`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();

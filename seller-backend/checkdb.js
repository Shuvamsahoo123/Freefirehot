import 'dotenv/config';
import mongoose from 'mongoose';
import Order from './src/models/Order.js';
import fs from 'fs';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const orders = await Order.find().sort({createdAt: -1}).limit(5);
    fs.writeFileSync('db_dump.json', JSON.stringify(orders, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});

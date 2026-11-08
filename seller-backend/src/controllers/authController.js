import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import Seller from '../models/Seller.js';
import { createSellerToken } from '../middleware/auth.js';

const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function validCredentials(email, password) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    && typeof password === 'string' && password.length >= 10 && password.length <= 128;
}

function issueSession(res, seller) {
  return res.json({ success: true, data: {
    token: createSellerToken(seller),
    seller: { id: seller._id, email: seller.email },
  } });
}

export async function getSetupStatus(_req, res) {
  try {
    const sellerExists = await Seller.exists({});
    return res.json({ success: true, data: { setupRequired: !sellerExists } });
  } catch (error) {
    console.error('Seller setup status failed:', error.message);
    return res.status(503).json({ success: false, message: 'Seller database is unavailable.' });
  }
}

export async function setupSeller(req, res) {
  const { email, password } = req.body;
  if (!validCredentials(email, password)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email and a password with at least 10 characters.' });
  }

  try {
    // The fixed _id makes initial account creation atomic: only one request can claim it.
    const seller = await Seller.create({
      _id: 'primary-seller', email: email.trim().toLowerCase(), passwordHash: await hashPassword(password),
    });
    return issueSession(res, seller);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Seller account is already set up. Please log in.' });
    }
    console.error('Seller setup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to set up the seller account.' });
  }
}

export async function loginSeller(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    const seller = await Seller.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!seller || !(await verifyPassword(password, seller.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    return issueSession(res, seller);
  } catch (error) {
    console.error('Seller login failed:', error.message);
    return res.status(503).json({ success: false, message: 'Seller database is unavailable.' });
  }
}

export async function currentSeller(req, res) {
  try {
    const seller = await Seller.findById(req.seller.id).select('email');
    if (!seller) return res.status(401).json({ success: false, message: 'Seller account no longer exists.' });
    return res.json({ success: true, data: { seller: { id: seller._id, email: seller.email } } });
  } catch (error) {
    console.error('Seller session lookup failed:', error.message);
    return res.status(503).json({ success: false, message: 'Seller database is unavailable.' });
  }
}

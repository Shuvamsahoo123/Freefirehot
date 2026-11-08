import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  return secret;
}

export function createSellerToken(seller) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: seller._id.toString(), email: seller.email, role: 'seller', iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  })).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function authenticateSeller(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });

  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) throw new Error('Invalid token');
    const expected = createHmac('sha256', getSecret()).update(payload).digest();
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Invalid token');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (decoded.exp <= Math.floor(Date.now() / 1000) || decoded.role !== 'seller' || !decoded.sub) throw new Error('Expired token');
    req.seller = { id: decoded.sub, email: decoded.email, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Please log in again.' });
  }
}

export function authorizeSeller(req, res, next) {
  if (!req.seller || req.seller.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
  }
  return next();
}

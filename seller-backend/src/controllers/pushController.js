import PushSubscription from '../models/PushSubscription.js';

export function getPushPublicKey(_req, res) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(503).json({ success: false, message: 'Phone notifications are not configured on the server.' });
  }
  return res.status(200).json({ success: true, data: { publicKey } });
}

export async function savePushSubscription(req, res) {
  try {
    const subscription = req.body?.subscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, message: 'A valid push subscription is required.' });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      { sellerId: req.seller.id, endpoint: subscription.endpoint, subscription },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, message: 'This device will receive new order alerts.' });
  } catch (error) {
    console.error('Failed to save push subscription:', error.message);
    return res.status(500).json({ success: false, message: 'Could not enable phone notifications.' });
  }
}

export async function removePushSubscription(req, res) {
  try {
    const endpoint = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ success: false, message: 'Subscription endpoint is required.' });
    await PushSubscription.deleteOne({ endpoint, sellerId: req.seller.id });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to remove push subscription:', error.message);
    return res.status(500).json({ success: false, message: 'Could not disable phone notifications.' });
  }
}

import { setVapidDetails, sendNotification } from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

export async function sendNewOrderPush(order) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;

  setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@freefirehotel.com', publicKey, privateKey);
  const subscriptions = await PushSubscription.find().lean();
  const orderId = order._id?.toString();
  const orderNumber = order.orderId || orderId || 'new';
  const payload = JSON.stringify({
    title: 'New order received',
    body: `Order #${orderNumber} is waiting for your review.`,
    url: orderId ? `/orders/${orderId}` : '/orders',
    tag: `new-order-${orderId || orderNumber}`,
  });

  await Promise.all(subscriptions.map(async ({ _id, endpoint, subscription }) => {
    try {
      await sendNotification(subscription, payload);
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await PushSubscription.deleteOne({ _id });
      } else {
        console.error('Failed to send new-order push:', error.statusCode || error.message);
      }
    }
  }));
}

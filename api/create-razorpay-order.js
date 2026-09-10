import createOrderHandler from './create-order.js';

/**
 * Backward compatibility alias: /api/create-razorpay-order
 * Delegates to /api/create-order.
 * If amount is passed in rupees, normalizes to paise.
 */
export default async function handler(req, res) {
  if (req.body && req.body.amount && Number(req.body.amount) < 100) {
    // If amount was provided in rupees (e.g. 5000), convert to paise
    req.body.amount = Math.round(Number(req.body.amount) * 100);
  }
  return createOrderHandler(req, res);
}

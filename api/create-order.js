import Razorpay from 'razorpay';

/**
 * Backend API Endpoint: POST /api/create-order
 * Generates an official Razorpay Order ID securely on the backend.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay credentials missing in environment variables.');
    return res.status(401).json({
      success: false,
      error: 'Razorpay credentials not configured on the server.'
    });
  }

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    const numericAmount = Number(amount);

    // Validate minimum amount: 100 paise (1 INR)
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Minimum amount is 100 paise (1 INR).'
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const orderOptions = {
      amount: Math.round(numericAmount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);

    const statusCode = err.statusCode || (err.error && err.error.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
    if (err.statusCode === 401 || (err.error && err.error.code === 'UNAUTHORIZED')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed with Razorpay.'
      });
    }

    return res.status(statusCode).json({
      success: false,
      error: err.error?.description || err.message || 'Failed to create Razorpay order.'
    });
  }
}

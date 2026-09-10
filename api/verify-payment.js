import crypto from 'crypto';

/**
 * Backend API Endpoint: POST /api/verify-payment
 * Validates Razorpay payment signature using HMAC-SHA256.
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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('RAZORPAY_KEY_SECRET missing in environment variables.');
    return res.status(500).json({
      success: false,
      error: 'Razorpay secret not configured on the server.'
    });
  }

  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature
    } = req.body || {};

    const orderId = razorpay_order_id || order_id;
    const paymentId = razorpay_payment_id || payment_id;
    const paymentSignature = razorpay_signature || signature;

    // Validate missing fields
    if (!orderId || !paymentId || !paymentSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters. Required: razorpay_order_id, razorpay_payment_id, razorpay_signature.'
      });
    }

    // Compute expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Compare generated signature with razorpay_signature using timingSafeEqual to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuf = Buffer.from(paymentSignature, 'utf-8');

    const isValid = (expectedBuf.length === receivedBuf.length) &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: orderId,
      payment_id: paymentId
    });
  } catch (err) {
    console.error('Payment signature verification error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during signature verification.'
    });
  }
}

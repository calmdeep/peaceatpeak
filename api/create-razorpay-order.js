/**
 * Peace at Peak Resort - Razorpay Order Creation API
 * Vercel Serverless Function & Local Dev Handler (/api/create-razorpay-order)
 * 
 * Generates an official Razorpay Order ID securely on the backend using the Key ID & Secret.
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

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TaMsshe46w2KE9';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'kwuPArHLcur7MVQuLtVxP5JP';

  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};
    
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // amount in paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {}
      })
    });

    const orderData = await razorpayRes.json();
    return res.status(razorpayRes.status).json(orderData);
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error while creating Razorpay order.' 
    });
  }
}

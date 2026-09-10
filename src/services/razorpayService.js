/**
 * Peace at Peak Resort - Real Razorpay Payment Gateway Service
 * Dynamically loads the official Razorpay JS SDK and triggers the secure checkout modal
 * supporting all facilities: UPI (Google Pay, PhonePe, Paytm, QR), Cards, NetBanking & Wallets.
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Returns active Razorpay Key ID (checks environment variable first, then localStorage override)
 */
export const getRazorpayKey = () => {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }

  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('pap_razorpay_key');
    if (savedKey && savedKey.trim().length > 5 && !savedKey.includes('TaMsshe46w2KE9')) {
      return savedKey.trim();
    }
  }

  return 'rzp_test_TaOSEVM4XdvO4g';
};

/**
 * Saves a new Razorpay Key ID into localStorage
 */
export const setRazorpayKeyOverride = (key) => {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('pap_razorpay_key', key.trim());
    } else {
      localStorage.removeItem('pap_razorpay_key');
    }
  }
};

/**
 * Checks if current active key is in Live Production mode
 */
export const isRazorpayLive = () => {
  const key = getRazorpayKey();
  return key.startsWith('rzp_live_');
};

/**
 * STEP 1: BACKEND - Create Order
 * Calls POST /api/create-order with amount in paise (minimum 100 paise)
 * Returns { order_id, amount, currency }
 */
export const createRazorpayOrder = async ({ amount, bookingId, roomName, notes = {} }) => {
  // Amount in paise: if amount is in rupees (e.g. 4500), convert to paise (450000)
  const amountInPaise = Math.round(Number(amount) * 100);
  if (isNaN(amountInPaise) || amountInPaise < 100) {
    throw new Error('Minimum payment amount is 100 paise (₹1).');
  }

  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${bookingId || Date.now()}`,
      notes: {
        bookingId: bookingId || '',
        roomName: roomName || 'Sanctuary Stay',
        ...notes
      }
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.error || `Order creation failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return {
    order_id: data.order_id || data.id,
    amount: data.amount,
    currency: data.currency || 'INR'
  };
};

/**
 * STEP 3: BACKEND - Verify Signature
 * Calls POST /api/verify-payment to check HMAC-SHA256 signature
 */
export const verifyRazorpayPayment = async ({ orderId, paymentId, signature }) => {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.error || 'Payment signature verification failed. Possible tampering detected.';
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * STEP 2: FRONTEND - Checkout
 * Launches the official Razorpay Checkout modal with the backend order_id
 * On success: receives payment details and verifies signature with backend
 * On dismiss: handles modal cancellation
 * On failure: listens to payment.failed event and shows error
 */
export const initiateRazorpayPayment = async ({
  amount, // in INR rupees (e.g. 4500)
  bookingId,
  roomName,
  guestName,
  guestEmail,
  guestPhone,
  onSuccess,
  onError,
  onDismiss
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
    const err = new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
    onError?.(err);
    throw err;
  }

  const razorpayKey = getRazorpayKey();
  if (!razorpayKey) {
    const err = new Error('Razorpay Key ID is not configured. Please check environment variables.');
    onError?.(err);
    throw err;
  }

  // 1. Create official Razorpay Order ID on backend
  let orderData;
  try {
    orderData = await createRazorpayOrder({
      amount,
      bookingId,
      roomName,
      notes: {
        guestName: guestName || '',
        guestPhone: guestPhone || ''
      }
    });
  } catch (orderErr) {
    console.error('Failed to create Razorpay backend order:', orderErr);
    onError?.(orderErr);
    throw orderErr;
  }

  const options = {
    key: razorpayKey,
    amount: orderData.amount, // amount in paise from backend order
    currency: orderData.currency || 'INR',
    order_id: orderData.order_id,
    name: 'Peace at Peak Resort',
    description: `${roomName || 'Sanctuary Stay'} - #${bookingId || 'Booking'}`,
    image: '/images/hut1.webp',
    prefill: {
      name: guestName || '',
      email: guestEmail || '',
      contact: guestPhone || ''
    },
    notes: {
      bookingId: bookingId || '',
      roomName: roomName || 'Sanctuary Stay',
      guestName: guestName || '',
      guestContact: guestPhone || '',
      resort: 'Peace at Peak, Kanatal, Uttarakhand - 8500 Ft'
    },
    theme: {
      color: '#d97706', // Resort gold / amber theme
      backdrop_color: 'rgba(15, 23, 42, 0.85)'
    },
    handler: async function (response) {
      try {
        // Step 3: Verify signature with backend before marking as paid
        await verifyRazorpayPayment({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature
        });

        onSuccess?.({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          method: 'razorpay'
        });
      } catch (verifyErr) {
        console.error('Razorpay signature verification failed:', verifyErr);
        alert(`Payment Verification Warning: ${verifyErr.message || 'Signature mismatch'}. Payment not confirmed.`);
        onError?.(verifyErr);
      }
    },
    modal: {
      confirm_close: true,
      escape: true,
      ondismiss: function () {
        console.info('Razorpay checkout modal dismissed by user.');
        onDismiss?.();
      }
    }
  };

  const paymentInstance = new window.Razorpay(options);

  // Handle payment.failed event
  paymentInstance.on('payment.failed', function (response) {
    const errorDetails = response.error || {};
    const errMsg = errorDetails.description || errorDetails.reason || 'Payment could not be completed.';
    console.error('Razorpay payment.failed event:', errorDetails);
    alert(`Payment Failed: ${errMsg}`);
    onError?.(new Error(errMsg));
  });

  paymentInstance.open();
};

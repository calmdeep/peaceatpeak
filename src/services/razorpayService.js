/**
 * Peace at Peak - Razorpay Payment Service
 * Dynamically loads the official Razorpay JS SDK and triggers the secure checkout modal.
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

export const isPlaceholderRazorpayKey = () => {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
  return key === 'rzp_test_1DP5mmOlF5G5ag' || key.includes('YOUR_KEY');
};

export const initiateRazorpayPayment = async ({
  amount, // in INR rupees
  bookingId,
  roomName,
  guestName,
  guestEmail,
  guestPhone,
  onSuccess,
  onDismiss
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
  }

  // Use configured Key ID or test key
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

  const options = {
    key: razorpayKey,
    amount: Math.round(Number(amount) * 100), // amount in paise
    currency: 'INR',
    name: 'Peace at Peak Resort',
    description: `${roomName} - Reservation #${bookingId}`,
    image: '/images/hut1.webp',
    prefill: {
      name: guestName || '',
      email: guestEmail || '',
      contact: guestPhone || ''
    },
    notes: {
      bookingId: bookingId,
      resort: 'Peace at Peak, Kanatal, Uttarakhand, 8500 Ft'
    },
    theme: {
      color: '#0f172a' // Luxury slate theme
    },
    handler: function (response) {
      onSuccess?.({
        paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
        orderId: response.razorpay_order_id || null,
        signature: response.razorpay_signature || null,
        method: 'razorpay'
      });
    },
    modal: {
      ondismiss: function () {
        onDismiss?.();
      }
    }
  };

  const paymentInstance = new window.Razorpay(options);
  paymentInstance.open();
};

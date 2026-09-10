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
 * Returns active Razorpay Key ID (checks localStorage override first, then environment variable)
 */
export const getRazorpayKey = () => {
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('pap_razorpay_key');
    if (savedKey && savedKey.trim().length > 5) {
      return savedKey.trim();
    }
  }
  return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
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
 * Launches the real official Razorpay secure checkout window with all facilities
 */
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

  const razorpayKey = getRazorpayKey();
  if (!razorpayKey) {
    throw new Error('Razorpay Key ID is not configured. Please add your Razorpay Live Key ID.');
  }

  const options = {
    key: razorpayKey,
    amount: Math.round(Number(amount) * 100), // amount in paise
    currency: 'INR',
    name: 'Peace at Peak Resort',
    description: `${roomName || 'Sanctuary Stay'} - Reservation #${bookingId}`,
    image: '/images/hut1.webp',
    prefill: {
      name: guestName || '',
      email: guestEmail || '',
      contact: guestPhone || ''
    },
    notes: {
      bookingId: bookingId,
      roomName: roomName || 'Sanctuary Stay',
      guestName: guestName || '',
      guestContact: guestPhone || '',
      resort: 'Peace at Peak, Kanatal, Uttarakhand - 8500 Ft'
    },
    theme: {
      color: '#d97706', // Resort gold / amber theme
      backdrop_color: 'rgba(15, 23, 42, 0.85)'
    },
    modal: {
      confirm_close: true,
      escape: true,
      ondismiss: function () {
        onDismiss?.();
      }
    }
  };

  const paymentInstance = new window.Razorpay(options);
  paymentInstance.open();
};

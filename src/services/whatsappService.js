/**
 * Peace at Peak Resort - WhatsApp Reservation Confirmation Service
 * 
 * Formats booking reservation vouchers into WhatsApp messages
 * and generates 1-click direct WhatsApp links for guests and front desk.
 */

export const RESORT_WHATSAPP_PRIMARY = '917055522239';
export const RESORT_WHATSAPP_SECONDARY = '919568251581';

/**
 * Normalizes phone numbers for WhatsApp API (defaults to Indian +91 if 10 digits)
 * Handles formats like +91 70555 22239, 07055522239, 7055522239, 917055522239
 */
export function normalizeWhatsAppNumber(phone) {
  if (!phone) return '';
  let digits = phone.toString().replace(/[^0-9]/g, '');
  // Remove leading 0 if 11 digits (e.g. 07055522239 -> 7055522239)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  // Standard Indian 10-digit mobile numbers get +91 prefix
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Formats a reservation into a WhatsApp confirmation voucher
 * matching the Peace at Peak reservation boarding pass.
 */
export function formatReservationWhatsAppMessage(booking, receiptImageUrl = null) {
  const {
    id,
    guestName,
    phone,
    email,
    roomName,
    guests = 2,
    checkIn,
    checkOut,
    nights = 1,
    amount,
    paidAmount = 0,
    balanceAmount = 0,
    paymentStatus,
    paymentMethod,
    paymentId,
    basePrice,
    tax
  } = booking;

  let imageUrl = receiptImageUrl || booking.receiptImageUrl || null;
  // Guard against base64 data URLs in WhatsApp text (WhatsApp URL limit is ~2000 chars)
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = null;
  }

  // Derive calculated amounts if not explicitly provided
  const grandTotal = amount || (paidAmount + balanceAmount) || 0;
  const computedBase = basePrice || Math.round(grandTotal / 1.12);
  const computedTax = tax || (grandTotal - computedBase);

  // Determine friendly payment badge text
  let paymentBadge = 'CONFIRMED (PAY ON ARRIVAL)';
  if (paymentStatus === 'paid' || paymentId) {
    paymentBadge = 'VERIFIED VIA RAZORPAY';
  } else if (paymentStatus === 'advance_paid') {
    paymentBadge = '50% ADVANCE VERIFIED';
  }

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ *RESERVATION CONFIRMED* ✨',
    '*PEACE AT PEAK RESORT, KANATAL*',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    `📋 *BOOKING ID:* ${id || 'PAP-CONFIRMED'}`,
    '',
    '🛡️ *PAYMENT STATUS:*',
    `   Status: *${paymentBadge}*`,
    paymentId ? `   Razorpay ID: ${paymentId}` : null,
    paymentMethod ? `   Method: ${paymentMethod}` : null,
    `   Paid Online: *₹${Number(paidAmount).toLocaleString('en-IN')}*`,
    balanceAmount > 0 ? `   Balance Due on Arrival: *₹${Number(balanceAmount).toLocaleString('en-IN')}*` : null,
    '',
    '🏨 *VOUCHER INFO*',
    `• *Accommodation:* ${roomName || 'Luxury Cottage'}`,
    `• *Guests:* ${guests} Occupant${guests === 1 ? '' : 's'}`,
    `• *Check-in:* ${checkIn} (from 1:00 PM)`,
    `• *Check-out:* ${checkOut} (until 11:00 AM)`,
    '',
    '👤 *GUEST PROFILE*',
    `• *Lead Guest:* ${guestName}`,
    `• *Contact:* ${phone}`,
    email ? `• *Email:* ${email}` : null,
    '',
    '🧾 *BILLING BREAKDOWN*',
    `• Room Charge (${nights} night${nights === 1 ? '' : 's'}): ₹${Number(computedBase).toLocaleString('en-IN')}`,
    `• GST (12%): ₹${Number(computedTax).toLocaleString('en-IN')}`,
    '────────────────────',
    `⭐ *GRAND TOTAL:* *₹${Number(grandTotal).toLocaleString('en-IN')}*`,
    '────────────────────',
    imageUrl ? '' : null,
    imageUrl ? '🖼️ *OFFICIAL BOARDING PASS RECEIPT IMAGE:*' : null,
    imageUrl ? `${imageUrl}` : null,
    '',
    '📍 *Resort Address:*',
    'Chopariyal Gaon, Churer Dhar, Kanatal, Tehri Garhwal, Uttarakhand - 249145',
    '',
    '📞 *Concierge & Reception:*',
    '+91 70555 22239, +91 95682 51581, +91 93689 70669',
    '',
    '_We look forward to welcoming you to Himalayan serenity at Peace at Peak!_'
  ];

  return lines.filter(line => line !== null).join('\n');
}

/**
 * Generates direct universal WhatsApp click-to-chat URL (wa.me)
 * Works smoothly across Android, iOS, and Desktop WhatsApp Web
 */
export function getWhatsAppUrl(phone, message) {
  const cleanNumber = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message || '');
  if (cleanNumber) {
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Direct WhatsApp link to Peace at Peak Resort Front Desk (+91 70555 22239)
 * Used by guests to send reservation voucher directly to the resort.
 */
export function getResortWhatsAppUrl(booking, resortPhone = RESORT_WHATSAPP_PRIMARY, receiptImageUrl = null) {
  const message = formatReservationWhatsAppMessage(booking, receiptImageUrl);
  return getWhatsAppUrl(resortPhone, message);
}

/**
 * Direct WhatsApp link to the guest's mobile phone number
 * Used by resort admins/concierge to message confirmation voucher to guest.
 */
export function getGuestWhatsAppUrl(guestPhone, booking, receiptImageUrl = null) {
  const message = formatReservationWhatsAppMessage(booking, receiptImageUrl);
  return getWhatsAppUrl(guestPhone, message);
}

/**
 * Universal WhatsApp share link that opens WhatsApp contact picker
 */
export function getWhatsAppShareUrl(booking, receiptImageUrl = null) {
  const message = formatReservationWhatsAppMessage(booking, receiptImageUrl);
  return getWhatsAppUrl('', message);
}

/**
 * Uses the Web Share API (mobile/tablet native share sheet) to share voucher
 * into WhatsApp, Messages, or any installed app. Falls back gracefully.
 */
export async function shareReservationVoucher(booking) {
  const message = formatReservationWhatsAppMessage(booking);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Peace at Peak Reservation - ${booking.id || 'Confirmed'}`,
        text: message
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share notice:', err);
      }
    }
  }
  return false;
}

/**
 * Background webhook trigger if an automated WhatsApp Gateway / Zapier / Make
 * webhook URL is supplied in environment variables (VITE_WHATSAPP_WEBHOOK_URL).
 */
export async function triggerWhatsAppWebhook(booking) {
  const webhookUrl = import.meta.env?.VITE_WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const payload = {
      bookingId: booking.id,
      guestName: booking.guestName,
      phone: booking.phone,
      email: booking.email,
      roomName: booking.roomName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      amount: booking.amount,
      message: formatReservationWhatsAppMessage(booking),
      timestamp: new Date().toISOString()
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('WhatsApp webhook background delivery notice:', err);
    return false;
  }
}

/**
 * Calls the backend serverless API (/api/send-whatsapp) to automatically
 * dispatch the reservation confirmation and receipt image to the customer's WhatsApp.
 */
export async function dispatchAutomatedWhatsAppReceipt(booking, receiptImageUrl = null) {
  try {
    const message = formatReservationWhatsAppMessage(booking, receiptImageUrl);
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: booking.phone,
        message,
        receiptImageUrl,
        booking: {
          id: booking.id,
          guestName: booking.guestName,
          roomName: booking.roomName,
          amount: booking.amount,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('dispatchAutomatedWhatsAppReceipt notice:', err);
  }
  return { success: false };
}

/**
 * Triggers opening WhatsApp in a new tab or window
 */
export function sendReservationToWhatsApp(phone, booking) {
  const message = formatReservationWhatsAppMessage(booking);
  const url = getWhatsAppUrl(phone, message);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return url;
}

/**
 * Peace at Peak Resort - WhatsApp Reservation Confirmation Service
 * 
 * Formats booking reservation vouchers into WhatsApp messages
 * and generates 1-click direct WhatsApp links for guests and front desk.
 */

export const RESORT_WHATSAPP_PRIMARY = '917055522239';

/**
 * Normalizes phone numbers for WhatsApp API (defaults to Indian +91 if 10 digits)
 */
export function normalizeWhatsAppNumber(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Formats a reservation into a WhatsApp confirmation voucher
 * matching the Peace at Peak reservation boarding pass.
 */
export function formatReservationWhatsAppMessage(booking) {
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
 * Generates direct WhatsApp click-to-chat URL
 */
export function getWhatsAppUrl(phone, message) {
  const cleanNumber = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  if (cleanNumber) {
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
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

/**
 * Peace at Peak Resort - Receipt Image Generation & Dispatch Service
 * 
 * Generates an ultra high-resolution, pixel-perfect Boarding Pass receipt image
 * directly on an HTML5 canvas without external heavy dependencies.
 * Enables 1-click WhatsApp dispatch, native image sharing, and direct PNG download.
 */

import { uploadImageToPublicCDN } from './imageUploadService';

/**
 * Renders the Peace at Peak reservation boarding pass onto an HTML5 Canvas
 * Returns an ultra-sharp high-DPI canvas (2x retina resolution)
 */
export function renderReceiptToCanvas(booking) {
  const {
    id = 'PAP-CONFIRMED',
    guestName = 'Valued Guest',
    phone = '',
    email = '',
    roomName = 'Luxury Stay',
    guests = 2,
    checkIn = '',
    checkOut = '',
    nights = 1,
    amount = 0,
    paidAmount = 0,
    balanceAmount = 0,
    paymentStatus = 'pay_at_checkin',
    paymentMethod = 'Pay on Arrival',
    paymentId = null,
    basePrice,
    tax
  } = booking;

  const grandTotal = amount || (paidAmount + balanceAmount) || 0;
  const computedBase = basePrice || Math.round(grandTotal / 1.12);
  const computedTax = tax || (grandTotal - computedBase);

  // Logical dimensions (400 x 600 aspect ratio -> 800 x 1220 logical)
  const width = 800;
  const height = 1220;
  const scale = 2; // 2x Retina scale

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // 1. Warm Outer Canvas Background
  ctx.fillStyle = '#f6f4ee';
  ctx.fillRect(0, 0, width, height);

  // 2. Card Container
  const cardX = 36;
  const cardY = 36;
  const cardW = width - (cardX * 2); // 728
  const cardH = height - (cardY * 2); // 1148
  const radius = 20;

  // Draw Card Shadow & Background
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  // Draw Card Border
  ctx.strokeStyle = '#e5e1d5';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.stroke();

  // 3. Header Section (Deep Mountain Pine Navy)
  const headerH = 205;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardW - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
  ctx.lineTo(cardX + cardW, cardY + headerH);
  ctx.lineTo(cardX, cardY + headerH);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.clip();

  // Header Gradient Background
  const headGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + headerH);
  headGrad.addColorStop(0, '#13201d');
  headGrad.addColorStop(1, '#1b2c27');
  ctx.fillStyle = headGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);

  // Top Gold Accent Stripe
  ctx.fillStyle = '#c5a059';
  ctx.fillRect(cardX, cardY, cardW, 5);

  // Header Titles
  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 12px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText('PEACE AT PEAK RESORT • KANATAL', width / 2, cardY + 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = '300 24px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('RESERVATION CONFIRMED', width / 2, cardY + 82);

  ctx.fillStyle = '#a3b8b0';
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('OFFICIAL RESORT BOARDING PASS & BILLING RECEIPT', width / 2, cardY + 106);

  // Booking ID Pill
  const pillW = 340;
  const pillH = 36;
  const pillX = (width - pillW) / 2;
  const pillY = cardY + 132;
  ctx.fillStyle = 'rgba(197, 160, 89, 0.15)';
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(`BOOKING ID: ${id}`, width / 2, pillY + 23);

  ctx.restore();

  // 4. Dashed Tear Line with Notches
  const tearY = cardY + headerH;
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 24, tearY);
  ctx.lineTo(cardX + cardW - 24, tearY);
  ctx.stroke();

  // Cutout circles on edges
  ctx.fillStyle = '#f6f4ee';
  ctx.beginPath();
  ctx.arc(cardX, tearY, 14, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = '#e5e1d5';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cardX + cardW, tearY, 14, Math.PI / 2, -Math.PI / 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Payment Status Banner Box
  const payY = tearY + 24;
  const payH = 78;
  const payW = cardW - 48;
  const payX = cardX + 24;

  const isPaid = paymentStatus === 'paid' || paymentId;
  const isAdvance = paymentStatus === 'advance_paid';

  ctx.fillStyle = isPaid || isAdvance ? '#f0fdf4' : '#f8fafc';
  ctx.strokeStyle = isPaid || isAdvance ? '#86efac' : '#cbd5e1';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, payX, payY, payW, payH, 12);
  ctx.fill();
  ctx.stroke();

  // Status Badge Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '1px';
  const statusLabel = isPaid 
    ? 'PAYMENT STATUS: VERIFIED VIA RAZORPAY ONLINE' 
    : (isAdvance ? 'PAYMENT STATUS: 50% ADVANCE VERIFIED' : 'PAYMENT STATUS: CONFIRMED (PAY ON ARRIVAL)');
  ctx.fillText(statusLabel, payX + 16, payY + 28);

  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`Paid Online: ₹${Number(paidAmount).toLocaleString('en-IN')}`, payX + 16, payY + 54);

  if (balanceAmount > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`Due on Arrival: ₹${Number(balanceAmount).toLocaleString('en-IN')}`, payX + payW - 16, payY + 54);
  } else {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('All Dues Cleared ✓', payX + payW - 16, payY + 54);
  }

  // 6. Voucher Information Grid
  const specY = payY + payH + 28;
  drawSectionTitle(ctx, 'VOUCHER SPECIFICATIONS', cardX + 24, specY);

  const col1X = cardX + 24;
  const col2X = cardX + (cardW / 2) + 12;

  drawFieldBlock(ctx, 'ACCOMMODATION', roomName, col1X, specY + 22);
  drawFieldBlock(ctx, 'GUESTS', `${guests} Occupant${guests === 1 ? '' : 's'}`, col2X, specY + 22);

  drawFieldBlock(ctx, 'CHECK-IN', `${checkIn} (from 1:00 PM)`, col1X, specY + 76);
  drawFieldBlock(ctx, 'CHECK-OUT', `${checkOut} (until 11:00 AM)`, col2X, specY + 76);

  // 7. Guest Profile Block
  const guestY = specY + 144;
  drawSectionTitle(ctx, 'GUEST CREDENTIALS', cardX + 24, guestY);

  drawFieldBlock(ctx, 'LEAD GUEST NAME', guestName, col1X, guestY + 22);
  drawFieldBlock(ctx, 'CONTACT NUMBER', phone || 'Not specified', col2X, guestY + 22);
  drawFieldBlock(ctx, 'EMAIL ADDRESS', email || 'info@peaceatpeakkanatal.com', col1X, guestY + 76);
  drawFieldBlock(ctx, 'LENGTH OF STAY', `${nights} Night${nights === 1 ? '' : 's'} Stay`, col2X, guestY + 76);

  // 8. Billing Breakdown Box
  const billY = guestY + 148;
  const billW = cardW - 48;
  const billX = cardX + 24;
  const billH = 150;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, billX, billY, billW, billH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Room Charge (${nights} night${nights === 1 ? '' : 's'}):`, billX + 20, billY + 34);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`₹${Number(computedBase).toLocaleString('en-IN')}`, billX + billW - 20, billY + 34);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Goods & Services Tax (GST 12%):', billX + 20, billY + 66);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`₹${Number(computedTax).toLocaleString('en-IN')}`, billX + billW - 20, billY + 66);

  // Divider
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(billX + 20, billY + 88);
  ctx.lineTo(billX + billW - 20, billY + 88);
  ctx.stroke();
  ctx.setLineDash([]);

  // Grand Total
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('GRAND TOTAL (INCL. GST):', billX + 20, billY + 122);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#b45309'; // Gold-amber
  ctx.font = 'bold 24px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillText(`₹${Number(grandTotal).toLocaleString('en-IN')}`, billX + billW - 20, billY + 124);

  // 9. Resort Concierge Footer & Address
  const footerY = billY + billH + 28;
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('PEACE AT PEAK RESORT • CHOPARIYAL GAON, KANATAL, UTTARAKHAND - 249145', width / 2, footerY);

  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText('Concierge & Reception: +91 70555 22239, +91 95682 51581', width / 2, footerY + 20);

  // 10. Security Barcode Graphic at Bottom
  const barcodeY = footerY + 36;
  drawBarcodeAesthetic(ctx, width / 2 - 130, barcodeY, 260, 22);

  ctx.font = '9px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`VERIFIED RESORT PASS • ${id} • AUTHENTIC`, width / 2, barcodeY + 36);

  return canvas;
}

/**
 * Helper to draw rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Helper for section titles
 */
function drawSectionTitle(ctx, title, x, y) {
  ctx.textAlign = 'left';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(title, x, y);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x + 728 - 48, y + 6);
  ctx.stroke();
}

/**
 * Helper for field pairs
 */
function drawFieldBlock(ctx, label, value, x, y) {
  ctx.textAlign = 'left';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, x, y);

  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.letterSpacing = '0px';
  ctx.fillText(value || '-', x, y + 20);
}

/**
 * Draws an aesthetic boarding pass barcode pattern
 */
function drawBarcodeAesthetic(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = '#1e293b';
  const pattern = [2, 1, 3, 1, 1, 4, 2, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 2];
  let currentX = x;
  for (let i = 0; i < pattern.length && currentX < x + width; i++) {
    const barWidth = pattern[i];
    ctx.fillRect(currentX, y, barWidth, height);
    currentX += barWidth + (i % 2 === 0 ? 2 : 4);
  }
  ctx.restore();
}

/**
 * Generates an image Blob and DataURL of the reservation receipt
 */
export function getReceiptImageBlob(booking, quality = 0.92) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = renderReceiptToCanvas(booking);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, dataUrl });
        } else {
          reject(new Error('Canvas blob generation failed'));
        }
      }, 'image/jpeg', quality);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates the receipt image and uploads it to public CDN (ImgBB)
 * Returns the public image URL
 */
export async function generateAndUploadReceiptImage(booking) {
  try {
    const { blob } = await getReceiptImageBlob(booking, 0.90);
    const receiptFile = new File([blob], `Peace_at_Peak_Receipt_${booking.id || 'Confirmed'}.jpg`, {
      type: 'image/jpeg'
    });
    const publicUrl = await uploadImageToPublicCDN(receiptFile);
    if (publicUrl && publicUrl.startsWith('http')) {
      return publicUrl;
    }
    return null;
  } catch (err) {
    console.warn('Auto-upload receipt image warning:', err);
    return null;
  }
}

/**
 * Downloads the receipt image directly to the guest's device
 */
export async function downloadReceiptImage(booking) {
  try {
    const { dataUrl } = await getReceiptImageBlob(booking, 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Peace_at_Peak_Reservation_${booking.id || 'Confirmed'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn('Download receipt error:', err);
    return false;
  }
}

/**
 * Shares the actual receipt image file directly into WhatsApp or native share sheet
 */
export async function shareReceiptImageFile(booking, messageText = '') {
  try {
    const { blob } = await getReceiptImageBlob(booking, 0.92);
    const fileName = `Peace_at_Peak_Reservation_${booking.id || 'Confirmed'}.jpg`;
    const imageFile = new File([blob], fileName, { type: 'image/jpeg' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({
        files: [imageFile],
        title: `Peace at Peak Reservation - ${booking.id || 'Confirmed'}`,
        text: messageText || `Peace at Peak Reservation Voucher - ${booking.id || ''}`
      });
      return true;
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('Share receipt image file warning:', err);
    }
  }
  return false;
}

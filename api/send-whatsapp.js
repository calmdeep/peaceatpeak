/**
 * Peace at Peak Resort - Automated WhatsApp Business Profile Dispatch API
 * Vercel Serverless Function & Local Dev Handler (/api/send-whatsapp)
 * 
 * Automatically dispatches reservation vouchers and payment confirmations directly
 * from the resort company's WhatsApp Business profile to the customer's phone number.
 * 
 * Supported Providers:
 * 1. Meta WhatsApp Business Cloud API (Official Meta Graph API - Cloud Token & Phone ID)
 * 2. UltraMsg (Instant QR scan connecting the company's WhatsApp Business app on phone)
 * 3. Wati / Aisensy (Leading WhatsApp Business API providers in India)
 * 4. Twilio WhatsApp API
 * 5. Custom Webhooks (Zapier, Make, n8n, Pabbly, or custom CRM)
 */

export default async function handler(req, res) {
  // Enable CORS headers for cross-origin or local requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check & provider detection endpoint
  if (req.method === 'GET') {
    const metaConfigured = Boolean(
      (process.env.WHATSAPP_CLOUD_TOKEN || process.env.VITE_WHATSAPP_CLOUD_TOKEN || process.env.META_WHATSAPP_TOKEN) &&
      (process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.VITE_WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID)
    );
    const ultramsgConfigured = Boolean(
      (process.env.ULTRAMSG_INSTANCE_ID || process.env.VITE_ULTRAMSG_INSTANCE_ID || 'instance191182') &&
      (process.env.ULTRAMSG_TOKEN || process.env.VITE_ULTRAMSG_TOKEN || 'daoc6rj7zggjq828')
    );
    const twilioConfigured = Boolean(
      (process.env.TWILIO_ACCOUNT_SID || process.env.VITE_TWILIO_ACCOUNT_SID) &&
      (process.env.TWILIO_AUTH_TOKEN || process.env.VITE_TWILIO_AUTH_TOKEN)
    );
    const watiConfigured = Boolean(
      (process.env.WATI_ACCESS_TOKEN || process.env.VITE_WATI_ACCESS_TOKEN)
    );
    const webhookConfigured = Boolean(
      (process.env.WHATSAPP_WEBHOOK_URL || process.env.VITE_WHATSAPP_WEBHOOK_URL)
    );

    return res.status(200).json({
      status: 'online',
      service: 'Peace at Peak WhatsApp Business Dispatch API',
      configured: metaConfigured || ultramsgConfigured || twilioConfigured || watiConfigured || webhookConfigured,
      providers: {
        meta_cloud_api: metaConfigured,
        ultramsg: ultramsgConfigured,
        wati: watiConfigured,
        twilio: twilioConfigured,
        custom_webhook: webhookConfigured
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      phone, 
      message, 
      receiptImageUrl, 
      booking 
    } = req.body || {};

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Recipient phone number is required.' });
    }

    // Normalize phone number (standard Indian 10 digits gets 91 prefix; removes spaces, dashes, leading 0s)
    let cleanPhone = phone.toString().replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const dispatchResults = [];

    // =========================================================================
    // PROVIDER 1: Meta WhatsApp Business Cloud API (Official Cloud API)
    // =========================================================================
    const metaToken = process.env.WHATSAPP_CLOUD_TOKEN || process.env.VITE_WHATSAPP_CLOUD_TOKEN || process.env.META_WHATSAPP_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.VITE_WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
    const metaTemplate = process.env.WHATSAPP_TEMPLATE_NAME || process.env.VITE_WHATSAPP_TEMPLATE_NAME;

    if (metaToken && metaPhoneId) {
      let metaPayload;

      // If official pre-approved template name is configured (for 24/7 proactive notifications)
      if (metaTemplate) {
        metaPayload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: metaTemplate,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
            components: [
              ...(receiptImageUrl && receiptImageUrl.startsWith('http') ? [{
                type: 'header',
                parameters: [{ type: 'image', image: { link: receiptImageUrl } }]
              }] : []),
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: booking?.guestName || 'Valued Guest' },
                  { type: 'text', text: booking?.id || 'PAP-CONFIRMED' },
                  { type: 'text', text: booking?.roomName || 'Luxury Stay' },
                  { type: 'text', text: booking?.checkIn || '' },
                  { type: 'text', text: booking?.checkOut || '' },
                  { type: 'text', text: `₹${Number(booking?.amount || 0).toLocaleString('en-IN')}` }
                ]
              }
            ]
          }
        };
      } else if (receiptImageUrl && receiptImageUrl.startsWith('http')) {
        // Direct media message with reservation caption
        metaPayload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'image',
          image: {
            link: receiptImageUrl,
            caption: message?.slice(0, 1024) || `Peace at Peak Resort - Reservation ${booking?.id || 'Confirmed'}`
          }
        };
      } else {
        // Direct text message
        metaPayload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message }
        };
      }

      const metaRes = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      });
      const metaData = await metaRes.json();

      if (metaRes.ok) {
        return res.status(200).json({ 
          success: true, 
          provider: 'meta_whatsapp_cloud_api', 
          recipient: cleanPhone,
          details: metaData 
        });
      } else {
        console.warn('Meta WhatsApp API returned error:', metaData);
        dispatchResults.push({ provider: 'meta_whatsapp_cloud_api', error: metaData });
      }
    }

    // =========================================================================
    // PROVIDER 2: UltraMsg (Instant QR scan with company's WhatsApp Business app)
    // =========================================================================
    const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID || process.env.VITE_ULTRAMSG_INSTANCE_ID || 'instance191182';
    const ultramsgToken = process.env.ULTRAMSG_TOKEN || process.env.VITE_ULTRAMSG_TOKEN || 'daoc6rj7zggjq828';

    if (ultramsgInstance && ultramsgToken) {
      let imageSent = false;
      let textSent = false;
      let ultraResponseDetails = null;

      // 1. Primary: If receipt image exists (HTTP URL or Base64 Data URL), send the image bill
      if (receiptImageUrl && (receiptImageUrl.startsWith('http') || receiptImageUrl.startsWith('data:image/'))) {
        try {
          const isPaid = booking?.paymentStatus === 'paid' || booking?.paymentId;
          const isAdvance = booking?.paymentStatus === 'advance_paid';
          const paymentBadge = isPaid ? 'VERIFIED ONLINE' : (isAdvance ? '50% ADVANCE DEPOSIT' : 'PAY ON ARRIVAL');

          const imageCaption = [
            '━━━━━━━━━━━━━━━━━━━━',
            '✨ *RESERVATION CONFIRMED* ✨',
            '*PEACE AT PEAK RESORT, KANATAL*',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            `📋 *Booking ID:* ${booking?.id || 'PAP-CONFIRMED'}`,
            `👤 *Lead Guest:* ${booking?.guestName || 'Valued Guest'}`,
            `🏨 *Sanctuary:* ${booking?.roomName || 'Luxury Stay'}`,
            `📅 *Stay Dates:* ${booking?.checkIn || ''} to ${booking?.checkOut || ''}`,
            `💳 *Payment:* ₹${Number(booking?.paidAmount || booking?.amount || 0).toLocaleString('en-IN')} (${paymentBadge})`,
            booking?.balanceAmount > 0 ? `💰 *Balance on Arrival:* ₹${Number(booking.balanceAmount).toLocaleString('en-IN')}` : null,
            '',
            '📍 *Location:* Chopariyal Gaon, Churer Dhar, Kanatal - 8500 Ft',
            '📞 *Reception:* +91 70555 22239',
            '',
            '🧾 *Your official reservation voucher & billing receipt image is attached above.*'
          ].filter(Boolean).join('\n');

          const ultraImgRes = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token: ultramsgToken,
              to: cleanPhone,
              image: receiptImageUrl,
              caption: imageCaption
            })
          });
          const imgData = await ultraImgRes.json();
          imageSent = Boolean(imgData?.id || imgData?.sent === 'true' || imgData?.sent === true);
          ultraResponseDetails = imgData;
        } catch (imgErr) {
          console.warn('UltraMsg image send notice:', imgErr);
        }
      }

      // 2. Fallback: Only send text message if image was NOT sent
      if (!imageSent && message) {
        const ultraTextRes = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: ultramsgToken,
            to: cleanPhone,
            body: message
          })
        });
        const textData = await ultraTextRes.json();
        textSent = Boolean(textData?.id || textData?.sent === 'true' || textData?.sent === true);
        ultraResponseDetails = textData || ultraResponseDetails;
      }

      if (imageSent || textSent) {
        return res.status(200).json({ 
          success: true, 
          provider: 'ultramsg', 
          recipient: cleanPhone,
          imageSent,
          textSent,
          details: ultraResponseDetails 
        });
      } else {
        dispatchResults.push({ provider: 'ultramsg', error: ultraResponseDetails });
      }
    }

    // =========================================================================
    // PROVIDER 3: Wati API (India's leading WhatsApp Business platform)
    // =========================================================================
    const watiEndpoint = process.env.WATI_API_ENDPOINT || process.env.VITE_WATI_API_ENDPOINT;
    const watiToken = process.env.WATI_ACCESS_TOKEN || process.env.VITE_WATI_ACCESS_TOKEN;

    if (watiEndpoint && watiToken) {
      const watiBase = watiEndpoint.replace(/\/$/, '');
      const watiRes = await fetch(`${watiBase}/api/v1/sendSessionMessage/${cleanPhone}?messageText=${encodeURIComponent(message)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${watiToken}`,
          'Content-Type': 'application/json'
        }
      });
      const watiData = await watiRes.json();
      if (watiRes.ok) {
        return res.status(200).json({
          success: true,
          provider: 'wati',
          recipient: cleanPhone,
          details: watiData
        });
      }
    }

    // =========================================================================
    // PROVIDER 4: Twilio WhatsApp API
    // =========================================================================
    const twilioSid = process.env.TWILIO_ACCOUNT_SID || process.env.VITE_TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN || process.env.VITE_TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || process.env.VITE_TWILIO_WHATSAPP_NUMBER;

    if (twilioSid && twilioAuth && twilioFrom) {
      const twilioParams = new URLSearchParams();
      twilioParams.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      twilioParams.append('To', `whatsapp:+${cleanPhone}`);
      twilioParams.append('Body', message);
      if (receiptImageUrl && receiptImageUrl.startsWith('http')) {
        twilioParams.append('MediaUrl', receiptImageUrl);
      }

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twilioParams
      });
      const twilioData = await twilioRes.json();
      return res.status(200).json({ 
        success: twilioRes.ok, 
        provider: 'twilio', 
        recipient: cleanPhone,
        details: twilioData 
      });
    }

    // =========================================================================
    // PROVIDER 5: Custom Webhook (Zapier / Make / n8n / Aisensy)
    // =========================================================================
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || process.env.VITE_WHATSAPP_WEBHOOK_URL;
    if (webhookUrl) {
      const hookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message,
          receiptImageUrl,
          booking,
          timestamp: new Date().toISOString()
        })
      });
      return res.status(200).json({ 
        success: hookRes.ok, 
        provider: 'custom_webhook',
        recipient: cleanPhone 
      });
    }

    // If configuration credentials haven't been added yet to .env / Vercel
    return res.status(200).json({
      success: false,
      requiresConfiguration: true,
      phone: cleanPhone,
      message: 'WhatsApp Business API credentials not yet detected in environment variables. Add WHATSAPP_CLOUD_TOKEN & WHATSAPP_PHONE_NUMBER_ID (Meta) or ULTRAMSG_INSTANCE_ID & ULTRAMSG_TOKEN (UltraMsg) in Vercel.',
      attempted: dispatchResults
    });

  } catch (error) {
    console.error('Automated WhatsApp dispatch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error while sending WhatsApp message.' 
    });
  }
}

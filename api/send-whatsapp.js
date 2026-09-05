/**
 * Peace at Peak Resort - Automated WhatsApp Receipt Dispatch API
 * Vercel Serverless Function (/api/send-whatsapp)
 * 
 * Automatically sends booking confirmation and receipt image to the customer's
 * WhatsApp phone number without requiring any manual clicks.
 * 
 * Supports:
 * 1. UltraMsg (Instant QR scan from resort phone, sends image + caption)
 * 2. Meta WhatsApp Business Cloud API (Official Graph API)
 * 3. Twilio WhatsApp API
 * 4. Custom Webhook (Zapier / Make / Wati / Aisensy)
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    // Normalize phone number (Indian +91 if 10 digits, strip leading 0)
    let cleanPhone = phone.toString().replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    // Provider 1: UltraMsg (Recommended - 1-minute QR scan, sends image directly)
    const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID || process.env.VITE_ULTRAMSG_INSTANCE_ID;
    const ultramsgToken = process.env.ULTRAMSG_TOKEN || process.env.VITE_ULTRAMSG_TOKEN;

    if (ultramsgInstance && ultramsgToken) {
      // If receipt image URL is provided, send as image message with caption
      if (receiptImageUrl && receiptImageUrl.startsWith('http')) {
        const ultraRes = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: ultramsgToken,
            to: cleanPhone,
            image: receiptImageUrl,
            caption: message || `Peace at Peak Reservation Confirmed - Booking ID: ${booking?.id || ''}`
          })
        });
        const ultraData = await ultraRes.json();
        return res.status(200).json({ 
          success: true, 
          provider: 'ultramsg_image', 
          details: ultraData 
        });
      } else {
        // Send as text chat
        const ultraRes = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: ultramsgToken,
            to: cleanPhone,
            body: message
          })
        });
        const ultraData = await ultraRes.json();
        return res.status(200).json({ 
          success: true, 
          provider: 'ultramsg_text', 
          details: ultraData 
        });
      }
    }

    // Provider 2: Meta WhatsApp Business Cloud API
    const metaToken = process.env.WHATSAPP_CLOUD_TOKEN || process.env.VITE_WHATSAPP_CLOUD_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

    if (metaToken && metaPhoneId) {
      const metaPayload = receiptImageUrl && receiptImageUrl.startsWith('http') ? {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'image',
        image: {
          link: receiptImageUrl,
          caption: message?.slice(0, 1024) || 'Your Peace at Peak Reservation Voucher'
        }
      } : {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message }
      };

      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      });
      const metaData = await metaRes.json();
      return res.status(200).json({ 
        success: metaRes.ok, 
        provider: 'meta_cloud_api', 
        details: metaData 
      });
    }

    // Provider 3: Twilio WhatsApp API
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
        details: twilioData 
      });
    }

    // Provider 4: Custom Webhook (Zapier / Make / Wati / Aisensy)
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
        provider: 'custom_webhook' 
      });
    }

    // Fallback if no provider credentials have been added to Vercel environment variables yet
    return res.status(200).json({
      success: false,
      requiresConfiguration: true,
      phone: cleanPhone,
      message: 'Automated WhatsApp Gateway not configured yet. Add ULTRAMSG or META or TWILIO keys in Vercel Environment Variables.'
    });

  } catch (error) {
    console.error('Automated WhatsApp dispatch error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error while sending WhatsApp message.' 
    });
  }
}

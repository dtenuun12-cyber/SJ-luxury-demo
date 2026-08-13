// Vercel serverless function — handles POST /api/notify-whatsapp
const config = require('../config.json');
const { rateLimit } = require('./_rate-limit');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!rateLimit(req, res, { windowMs: 60_000, max: 5, key: 'notify-whatsapp' })) return;

  const { name, phone, email, note, _gotcha } = req.body || {};

  // Honeypot: real visitors never fill this hidden field. Pretend success so
  // bots don't learn to look for a different signal.
  if (_gotcha) {
    return res.status(200).json({ success: true });
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if ((!phone || typeof phone !== 'string') && (!email || typeof email !== 'string')) {
    return res.status(400).json({ error: 'At least one contact method (phone or email) is required' });
  }

  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) {
    console.error('CALLMEBOT_APIKEY environment variable is missing.');
    return res.status(500).json({ error: 'Server misconfiguration: CallMeBot API key missing' });
  }

  const recipientPhone = config.whatsapp_number;
  if (!recipientPhone) {
    console.error('config.json is missing whatsapp_number.');
    return res.status(500).json({ error: 'Server misconfiguration: Recipient WhatsApp number missing' });
  }

  const cleanName = name.trim().slice(0, 100);
  const cleanPhone = phone ? String(phone).trim().slice(0, 30) : null;
  const cleanEmail = email ? String(email).trim().slice(0, 100) : null;
  const cleanNote = note ? String(note).trim().slice(0, 500) : null;

  const textLines = ['New Consultation Request — SJ Luxury Collezione', `Name: ${cleanName}`];
  if (cleanPhone) textLines.push(`Phone: ${cleanPhone}`);
  if (cleanEmail) textLines.push(`Email: ${cleanEmail}`);
  if (cleanNote) textLines.push(`Details: ${cleanNote}`);

  const formattedText = textLines.join('\n');
  const targetUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(recipientPhone)}&text=${encodeURIComponent(formattedText)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(targetUrl);
    const resultText = await response.text();
    if (!response.ok) {
      console.error('CallMeBot notification error:', response.status, resultText);
      return res.status(502).json({ error: 'Failed to dispatch WhatsApp notification' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notify WhatsApp Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

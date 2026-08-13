// Vercel serverless function — handles POST /api/room-recommend
//
// Uses a vision-capable Groq model to suggest which pieces from the real
// collection suit a photo of the customer's room. Deliberately a separate,
// single-shot endpoint rather than folded into api/chat.js — this is one
// image analysis, not an ongoing back-and-forth conversation.
//
// Groq's free tier currently serves vision through the Llama 4 models
// (llama-3.3-70b-versatile, used in api/chat.js, is text-only). See
// https://console.groq.com/docs/models for the current model list.
const config = require('../config.json');
const { rateLimit } = require('./_rate-limit');

// Mirrors products-data.js — duplicated (not imported) because that file is
// browser-only, same reasoning as the COLLECTION array in api/chat.js.
const COLLECTION = [
  { name: 'The Guānmào Armchair', wood: 'Huanghuali rosewood', tier: 'Collector Tier', room: 'Study & Living', story: 'Horseshoe-back scholar\'s chair, steam-bent from a single continuous piece, hand-caned seat.', image: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?q=80&w=800&auto=format&fit=crop' },
  { name: 'The Luóhàn Daybed', wood: 'Jichimu (chicken-wing) rosewood', tier: 'Heritage Tier', room: 'Living & Study', story: 'Low meditation and reception daybed with restrained cloud-scroll carved apron.', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop' },
  { name: 'The Ancestral Console', wood: 'Hóngmù rosewood', tier: 'Museum Tier', room: 'Entrance & Dining', story: 'Ceremonial long console with everted flanges, single unbroken grain across a 2.4m span.', image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop' },
  { name: 'The Reunion Table', wood: 'Huanghuali rosewood', tier: 'Collector Tier', room: 'Dining', story: 'Circular gathering table seating eight, waisted base with cabriole legs.', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=800&auto=format&fit=crop' },
  { name: "Scholar's Cabinet", wood: 'Jichimu (chicken-wing) rosewood', tier: 'Heritage Tier', room: 'Study & Living', story: 'Round-corner cabinet, doors hung on wooden pivot pins, fully disassemblable.', image: 'https://images.unsplash.com/photo-1595514535415-8422323cc2f1?q=80&w=800&auto=format&fit=crop' },
  { name: 'Four Seasons Screen', wood: 'Hóngmù rosewood, inlaid panels', tier: 'Museum Tier', room: 'Living & Entrance', story: 'Four-panel openwork carved screen depicting the four seasons, limited annual production.', image: 'https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?q=80&w=800&auto=format&fit=crop' },
];

// ~6M base64 chars decodes to ~4.5MB, just under Vercel's default serverless
// request body limit — client-side compression keeps real uploads far smaller.
const MAX_IMAGE_BASE64_CHARS = 6_000_000;

function buildSystemPrompt() {
  const collectionList = COLLECTION
    .map(p => `- ${p.name} (${p.tier}, ${p.room}): ${p.wood}. ${p.story}`)
    .join('\n');

  return `You are the Luxury Furniture Concierge for ${config.business_name || 'SJ Luxury Collezione'}, reviewing a photo of a customer's room. Recommend 1-3 pieces from the collection below that would genuinely suit the room's scale, light, and existing tones -- reference specifics you can actually see in the photo. Refer to each recommended piece by its exact name so it can be matched to the catalog. Never invent a piece that isn't in this list, and never quote a price -- these are bespoke pieces, so speak in terms of a personalized quotation through consultation. Keep your tone refined, warm, and a little unhurried, like a showroom consultant. Keep the reply to 3-5 sentences.

Collection:
${collectionList}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!rateLimit(req, res, { windowMs: 60_000, max: 6, key: 'room-recommend' })) return;

  const { image, note } = req.body || {};
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'A room photo is required' });
  }
  if (image.length > MAX_IMAGE_BASE64_CHARS) {
    return res.status(413).json({ error: 'That photo is too large — please use a smaller image' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
  }

  const userNote = typeof note === 'string' ? note.trim().slice(0, 300) : '';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 450,
        temperature: 0.5,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          {
            role: 'user',
            content: [
              { type: 'text', text: userNote || 'Here is a photo of my room. Which pieces from the collection would suit it, and why?' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq vision API upstream error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream AI service error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content
      || "My apologies, I couldn't make out enough detail in that photo — could you try a brighter, wider shot of the room?";

    const pieces = COLLECTION.filter(p => reply.includes(p.name)).slice(0, 3);

    return res.status(200).json({ reply, pieces });
  } catch (err) {
    console.error('Room Recommend Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

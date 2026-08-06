// Vercel serverless function — handles POST /api/chat
const config = require('../config.json');

// Collection data is duplicated here (not imported from products-data.js, which is
// browser-only) so the concierge's knowledge always matches what's on the site.
const COLLECTION = [
  { name: 'The Guānmào Armchair', wood: 'Huanghuali rosewood', tier: 'Collector Tier', room: 'Study & Living', story: 'Horseshoe-back scholar\'s chair, steam-bent from a single continuous piece, hand-caned seat.' },
  { name: 'The Luóhàn Daybed', wood: 'Jichimu (chicken-wing) rosewood', tier: 'Heritage Tier', room: 'Living & Study', story: 'Low meditation and reception daybed with restrained cloud-scroll carved apron.' },
  { name: 'The Ancestral Altar Console', wood: 'Hóngmù rosewood', tier: 'Museum Tier', room: 'Entrance & Dining', story: 'Ceremonial long console with everted flanges, single unbroken grain across a 2.4m span.' },
  { name: 'The Roundtable of Reunion', wood: 'Huanghuali rosewood', tier: 'Collector Tier', room: 'Dining', story: 'Circular gathering table seating eight, waisted base with cabriole legs.' },
  { name: "The Scholar's Display Cabinet", wood: 'Jichimu (chicken-wing) rosewood', tier: 'Heritage Tier', room: 'Study & Living', story: 'Round-corner cabinet, doors hung on wooden pivot pins, fully disassemblable.' },
  { name: 'The Four Seasons Screen', wood: 'Hóngmù rosewood, inlaid panels', tier: 'Museum Tier', room: 'Living & Entrance', story: 'Four-panel openwork carved screen depicting the four seasons, limited annual production.' },
];

function buildSystemPrompt() {
  const collectionList = COLLECTION
    .map(p => `- ${p.name} (${p.tier}, ${p.room}): ${p.wood}. ${p.story}`)
    .join('\n');

  return (config.system_prompt || '')
    .replace('{business_name}', config.business_name || 'SJ Luxury Collezione')
    .replace('{address}', config.address || '')
    .replace('{hours}', config.hours || '')
    .replace('{phone}', config.phone || '')
    .replace('{products}', '\n' + collectionList);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
  }

  const trimmedMessages = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').trim().slice(0, 1500),
  }));

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.6,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...trimmedMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API upstream error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream AI service error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "My apologies, I couldn't process that just now.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('API Chat Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

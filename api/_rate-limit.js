// Best-effort in-memory rate limiter shared by the API routes.
//
// This resets whenever a serverless instance cold-starts and isn't shared
// across instances, so it won't stop a determined attacker — but it blunts
// casual bursts and abuse of the free Groq/CallMeBot tiers without needing
// an external store (Redis, etc), which is overkill for a small-business site.

const buckets = new Map();

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Returns true if the request is allowed. Writes a 429 response and returns
// false if the caller has exceeded `max` requests within `windowMs`.
function rateLimit(req, res, { windowMs, max, key }) {
  const ip = getClientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const recent = (buckets.get(bucketKey) || []).filter(t => now - t < windowMs);

  if (recent.length >= max) {
    res.status(429).json({ error: 'Too many requests — please slow down and try again shortly.' });
    return false;
  }

  recent.push(now);
  buckets.set(bucketKey, recent);
  if (buckets.size > 5000) buckets.clear(); // guard against unbounded growth on a long-lived instance
  return true;
}

module.exports = { rateLimit };

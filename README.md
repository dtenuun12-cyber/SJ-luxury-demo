# SJ Luxury Collezione — Website + Luxury Furniture Concierge

A full boutique-style site: Home, Heritage, Collections, and a qualification-based
Consultation page, plus an AI "Luxury Furniture Concierge" (not a generic chatbot)
that knows the collection and steers visitors toward booking a consultation rather
than an instant sale — matching how this brand actually needs to sell.

## What's in here

```
index.html          Homepage
heritage.html        Brand story, craftsmanship, wood species education
collections.html     Full signature collection (gallery style, not a shop grid)
consultation.html    Qualification-based lead form (property type, timeline, budget, etc.)
style.css            Design system — ivory/rosewood palette, Cormorant Garamond + Manrope
script.js            Nav, scroll reveal, collection rendering, consultation form logic
concierge.js         The Luxury Furniture Concierge widget (chat)
products-data.js     The 6 signature pieces — names, story copy, wood, tier
config.json          Business info + the concierge's system prompt
api/chat.js          Backend — calls Groq (free) with the concierge's instructions, streamed token-by-token
api/room-recommend.js    Backend — vision model matches a room photo to real collection pieces
api/notify-whatsapp.js   Sends consultation requests straight to the owner's WhatsApp
api/_rate-limit.js       Shared per-IP rate limiting used by the three endpoints above
```

The concierge's conversation also persists across page navigation (via
`sessionStorage`) so browsing from Home to Heritage to Collections doesn't
reset it mid-conversation — it clears when the browser tab closes.

This follows the same deployment pattern as your first build (GitHub → Vercel →
Groq → CallMeBot). If you haven't deployed a project before, revisit those steps —
they're identical here, just with a new repo.

## Before this is truly ready to show SJ Luxury — the honest list

**1. Real photography is non-negotiable for this brand.**
Every `.piece-media` block and `.art-block` is currently a tasteful gradient
placeholder — deliberately, not a bug. A luxury heritage brand launching on
stock or unlicensed photos undercuts the entire pitch. Before showing this to
the client, either:
- Ask them for existing showroom/product photography you can drop in, or
- Present it as-is and explain the plan is to commission real photography of
  their actual pieces once they're on board — this is a completely normal
  thing to say to a luxury client and can even work in your favor ("we don't
  launch a heritage brand on stock photos").

**2. The 6 collection pieces are placeholder content.**
Names, wood species, and stories are written to sound authentic and are
structurally correct, but they need to be replaced with SJ Luxury's actual
inventory, real pricing philosophy, and any details specific to their real
craftsmanship process. Treat this as a realistic mockup of the *format*, not
literal copy to publish.

**3. Two things need real accounts before launch (same as before):**
- `FORMSPREE_ENDPOINT` in `script.js` (this was previously undefined here — now fixed, see below, but you still need to paste your own endpoint in)
- `GROQ_API_KEY` and `CALLMEBOT_APIKEY` as Vercel environment variables

## Fixed since the first pass — lead capture was silently broken

Two bugs meant leads could be lost even after everything else was set up:
- `script.js` never defined `FORMSPREE_ENDPOINT`, so the concierge's "Book a
  Private Showroom Appointment" form always failed silently (it caught the
  error and showed a generic message, so this was easy to miss in a demo).
- `consultation.html` — the site's main qualification form — had no JavaScript
  behind it at all. The pills didn't toggle selected, and submitting did
  nothing. It's now fully wired: pill selection (single/multi per group),
  required-field validation, and dual-submission to Formspree + the owner's
  WhatsApp, matching the concierge's lead flow.

Both lead forms and the API endpoints also got a honeypot field and basic
per-IP rate limiting (`api/_rate-limit.js`) — cheap protection against bots
hammering your free Groq/CallMeBot quota, best-effort since it resets on
serverless cold starts.

## The room-photo AI feature — now built

Customers can upload a photo of their room from inside the concierge widget
(camera icon next to the input, or the "Match a Room Photo" suggestion chip).
It's sent to `api/room-recommend.js`, which uses a vision-capable Groq model
(`meta-llama/llama-4-scout-17b-16e-instruct` — Groq's free-tier vision model;
`llama-3.3-70b-versatile` used elsewhere is text-only) to recommend 1-3 real
pieces from the collection, shown as inline cards the customer can click
straight into the consultation-booking flow. The photo is downscaled in the
browser before upload to keep requests small and fast.

## Pitching this specifically

A few things worth doing differently for a client at this level, compared to
your furniture-store demo:
- Present it live, slowly — this design rewards being walked through, not
  skimmed. Open with Heritage, not Home.
- Lead with the concierge's *knowledge*, not its speed — ask it something like
  "what's the difference between huanghuali and jichimu" live in the meeting.
- Don't undersell the consultation form — point out that it pre-qualifies
  leads by budget and timeline before a consultant ever picks up the phone,
  which is a genuine efficiency pitch for a business like this.

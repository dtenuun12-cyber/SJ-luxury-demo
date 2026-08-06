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
api/chat.js          Backend — calls Groq (free) with the concierge's instructions
api/notify-whatsapp.js   Sends consultation requests straight to the owner's WhatsApp
```

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
- `FORMSPREE_ENDPOINT` in `script.js`
- `GROQ_API_KEY` and `CALLMEBOT_APIKEY` as Vercel environment variables

## What's intentionally NOT built yet — the room-photo AI feature

The brief mentions an "upload a photo of your room, get furniture
recommendations" feature. This is a real, buildable feature, but it's a
meaningfully bigger scope than everything else here — it needs a vision-capable
AI model (not all free tiers support this well) and a different interaction
flow. I'd treat this as a strong "phase 2" pitch to SJ Luxury rather than
something to build before your first meeting: mention it as part of your
roadmap/vision for the partnership, which also gives you a reason for an
ongoing relationship instead of a one-off project. Tell me when you want to
build it and we will.

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

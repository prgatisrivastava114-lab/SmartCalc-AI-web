# 🎬 VIDEO AD GUIDE — Using & Improving promo.mp4

## What you have

**`assets/promo.mp4`** — a 45-second vertical (720×1280) video ad with:
- AI voiceover (Indian English, male, confident ad tone)
- Your real app screenshots in a phone-style frame
- Navy→teal branding, ending on **www.myfinancialplan.in**

It's already embedded in your landing page (autoplays muted + "tap for sound").

## Where to use it (free, organic — do this today)

1. **YouTube** → upload as a regular video AND it qualifies as a **Short** (under 60s, vertical). Title: *"Plan your family's full financial future in 1 minute — Free 🇮🇳"*. Description first line: `https://www.myfinancialplan.in`. Add the link again as a pinned comment.
2. **Instagram Reels + Facebook Reels** → same file, caption: *"500+ calculators + a 1-minute money plan for your family. Free → myfinancialplan.in 📞 +91 88401 92702"*.
3. **WhatsApp** → Status + broadcast to your client groups. (WhatsApp compresses video — still fine.)
4. **Play Store** → paste the YouTube link in the listing's "Promo video" field.
5. **Website** → done ✅ (it's your landing hero).

## Paid ads (when ready — start small)

| Platform | Budget to start | Setup |
|---|---|---|
| **Meta (FB+Insta)** | ₹200–300/day | Ads Manager → Campaign: *Traffic* or *Leads* → upload promo.mp4 → placement **Reels/Stories only** → audience: India, 25–55, interests *mutual funds, SIP, insurance* → destination `https://www.myfinancialplan.in` |
| **Google/YouTube** | ₹300–500/day | ads.google.com → Campaign: *Video* → *Skippable in-stream* or *Shorts* → same audience topics → final URL = your site |

**Tips:** Vertical video works on Reels/Shorts. For YouTube landscape slots, Meta/Google auto-pad it — acceptable to start; make a 16:9 version later (below).

## Make your own variations (10 minutes, free)

### Easiest — Canva (browser/mobile, free plan OK)
1. canva.com → create design → **"Mobile video 1080×1920"**.
2. Background: dark navy `#0F2233`.
3. Add **Text**: a bold headline (Montserrat ExtraBold, white) + a teal highlight word `#0E9D78`.
4. Drag in screenshots from `assets/shots/` → put them in a **phone frame** (Canva search: "phone mockup").
5. Duplicate the page 5–6 times, one message per page (see script below).
6. Animate each page ("Rise" or "Pop"), set ~4s per page → Download MP4 → **upload to your site by replacing `assets/promo.mp4`**.
7. Optional voice: use Narakeet / ElevenLabs (free tiers) with an "Indian English" voice reading the script, and attach the MP3 in Canva before download.

### CapCut alternative (mobile)
New project → 9:16 → add screenshots → text overlays → auto captions → export 1080p.

## Proven script templates (replace voiceover text)

**Ad 1 (current):** *"What if your family's entire financial future took just one minute? … Visit my financial plan dot in."*

**Ad 2 (problem-first):** *"Your child's college will cost ₹40 lakh in 15 years. Do you know YOUR number? Open MyFinancialPlan — pick education, enter the amount, get the exact monthly SIP. Free, one minute, no sign-up. myfinancialplan dot in."*

**Ad 3 (partner/agent):** *"Insurance advisors: give every client a professional 1-minute financial plan with YOUR branding — reports, follow-ups, dashboard. Starting ₹99 a month. myfinancialplan dot in."*

**Ad 4 (Hinglish):** *"Beta ki padhai, beti ki shaadi, apna ghar, aur retirement — sab ka plan, sirf 1 minute mein. Bilkul free. myfinancialplan.in — abhi try karo!"*

Keep each ad ≤45s, number-first headline, one CTA, end card = domain + helpline.

## Rebuilding THIS exact video (technical, optional)

The video was generated programmatically (PIL slides → ffmpeg concat with the AI voiceover). Sources are in the delivered project: `video_build/slides/*.png` + `voiceover.mp3`. Any developer can re-assemble with:

```bash
# per-slide segments then concat (memory-safe recipe)
ffmpeg -f concat -safe 0 -i list.txt -i voiceover.mp3 \
  -c:v copy -c:a aac -shortest -movflags +faststart promo.mp4
```

But honestly — **Canva is faster** unless you need pixel-identical edits. Ping us and we can regenerate new cuts (different length, Hindi voiceover, partner-focused version) in a future request.

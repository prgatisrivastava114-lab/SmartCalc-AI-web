# 🎨 BRAND KIT — MyFinancialPlan.in × SmartCalc AI

Use this on **every platform** (website, app, Play Store, social media, business cards, WhatsApp) so the brand looks identical everywhere — just like the website and app do.

## 1. Brand names & tagline

| Item | Value |
|---|---|
| Website brand | **MyFinancialPlan.in** |
| App brand | **SmartCalc AI — Financial Planning** |
| Combined signature | *MyFinancialPlan.in · SmartCalc AI* |
| Tagline | **"Plan today for a better tomorrow"** |
| Ad hook | *"Your family's entire financial future, planned in one minute."* |
| Domain | `www.myfinancialplan.in` |
| Helpline / RM | **+91 88401 92702** (call & WhatsApp) |

## 2. Colors (copy-paste ready)

| Use | Name | HEX | RGB |
|---|---|---|---|
| Primary | **Teal** | `#0E9D78` | 14, 157, 120 |
| Secondary | **Indigo** | `#4C62CE` | 76, 98, 206 |
| Headings/text | **Navy Ink** | `#17324A` | 23, 50, 74 |
| Body text | **Ink 2** | `#44586E` | 68, 88, 110 |
| Background top | **Mist Blue** | `#F6FAFF` | 246, 250, 255 |
| Background bottom | **Mint** | `#E9F6EE` | 233, 246, 238 |
| CTA dark | Teal deep | `#0B7A5E` | — |
| Warning/price | Amber | `#BF7B0B` | — |
| WhatsApp CTA | WA Green | `#1FA855` | — |
| Video background | Deep navy gradient | `#0F2233 → #17324A` | — |

**Rule:** the financial-planner experience is always **light theme** (Mist Blue → Mint). Dark navy is used ONLY for the video ad and dark strips (like the "Talk to a human" band on the landing page).

**Gradient formula** (headlines, buttons, logo):
`linear-gradient(135deg, #0E9D78, #4C62CE)` in CSS → in Canva: two-stop gradient, teal at 0%, indigo at 100%, 135°(diagonal).

## 3. Fonts

| Where | Font |
|---|---|
| App | Roboto (Flutter default) |
| Website | Segoe UI / system font stack (already in `index.html`) |
| Graphics/Canva | **Montserrat ExtraBold** for headings, **Open Sans** for body (closest free match) |

Sizes to mimic the site: H1 ≈ 48–52px extra bold, H2 ≈ 32–36px, body 15–17px. Keep text BIG and bold — it's part of the brand (accessibility for all ages).

## 4. Logo & icons

- App icon (512px, PNG): `SmartCalcAI-source → docs/store/hi_res_icon_512.png` — also already inside `app/icons/`.
- Web favicon: `app/favicon.png`.
- Logo concept: **₹ symbol in a rounded square** with the teal→indigo gradient (see the header of `index.html` — that CSS pill is your logo recipe).
- Corner radius everywhere: **14–22px** (cards), **38px** (phone mock), soft shadows `0 8px 24px rgba(23,50,74,.12)`.

## 5. Voice & writing style

- **Hinglish-friendly, warm, trustworthy.** Short sentences. Numbers first ("₹99/month", "one minute").
- Always mention: **Free to start**, **500+ calculators**, **OTP-verified**, **human RM on +91 88401 92702**.
- Mandatory legal line on anything investment-related:
  > "Estimates for guidance only. Markets are subject to risk — read scheme documents carefully. Consult a SEBI-registered advisor."

## 6. Ready asset library (where everything lives)

| Asset | Path in this package |
|---|---|
| Video ad (45s, vertical 720×1280) | `assets/promo.mp4` |
| Video poster / thumbnail | `assets/poster.png` |
| Product screenshots (6) | `assets/shots/` (mode, goals, result, cta, dashboard) |
| Full screenshot set (30) | Workspace folder `/home/user/screenshots/` |
| Landing page | `index.html` — SEO/OG meta already included |

## 7. Platform checklist (identical branding everywhere)

- [ ] **Play Store listing**: use icon + 3 screenshots from `assets/shots/` + tagline + the 45s video as the "Promo video" (YouTube link, see VIDEO_AD_GUIDE).
- [ ] **YouTube channel**: named *MyFinancialPlan.in*; banner in navy with teal→indigo gradient.
- [ ] **Instagram / Facebook page**: profile pic = app icon; bio: *"Free financial planning & 500+ calculators 🧮 Plan in 1 minute 👇 myfinancialplan.in"*.
- [ ] **WhatsApp Business (8840192702)**: logo as profile photo; about: tagline + website link; catalogue items = the 3 partner plans.
- [ ] **Business cards / flyers**: mist-blue background, teal→indigo gradient logo, big helpline number, QR code pointing to `https://www.myfinancialplan.in`.
- [ ] **Email signature**: Name | MyFinancialPlan.in | Plan today for a better tomorrow | 📞 +91 88401 92702 | 🌐 link.

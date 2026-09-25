# MY FINANCIAL PLAN — PHASE 1 UI/UX & WEBSITE LAYOUT ARCHITECTURE

**Brand Tagline**: *"Plan Every Stage. Protect Every Dream."*  
**Platform Domain**: `myfinancialplan.in`  
**Phase**: **PHASE 1 ONLY — COMPLETE UI/UX + WEBSITE LAYOUT**  
**Scope**: Complete visual design system, mobile-first responsive layouts, 21 major page structures, component library, desktop/mobile navigation, and user/partner information architecture. No backend logic, calculation engines, databases, or third-party APIs modified or touched in this phase.

---

## 1. PRODUCT IDENTITY & BRAND DIRECTION

### Brand Values
- **Modern & Premium**: Clean Indian fintech visual aesthetic with subtle gradients, card depth, and spacious padding.
- **Trustworthy & Simple**: Transparent assumptions, family-oriented imagery, and plain-language financial guidance.
- **Accessible & Empowering**: Mobile-first touch targets (48px+), progressive form disclosure, and high contrast ratios.

---

## 2. COMPLETE SITEMAP & INFORMATION ARCHITECTURE

```
myfinancialplan.in/
├── index.html                                (Homepage — 13 Sections)
├── app/index.html                            (Financial Planning Tool — 7-step progressive flow)
├── financial-health/index.html               (Financial Health Assessment & 8 Pillars)
├── life-goals/index.html                     (Interactive Life-Goal Dashboard & Swipeable Cards)
├── my-investments/index.html                 (Present Investments Tracking — 10 Categories)
├── tools/index.html                          (Calculator Hub & Marketplace)
├── learn/index.html                          (Financial Literacy & Education Center)
├── my-dashboard/index.html                   (User Financial Command Center)
├── my-reports/index.html                     (Synchronized PDF Report & Share Center)
├── auth.html                                 (Login & Signup — Mobile OTP, Email, Google OAuth)
├── profile/index.html                        (User Profile & Occupation)
├── settings/index.html                       (Account Settings & Activation Key Redemption)
└── partner/
    ├── index.html                            (Partner Workspace Control Center)
    ├── clients.html                          (Partner Client Roster)
    ├── leads.html                            (9-Status CRM Lead Pipeline)
    ├── crm.html                              (Kanban Board & Activity Timeline)
    ├── followups.html                        (Daily Client Follow-up Agenda)
    ├── reports.html                          (Client Reports with Prepared By & Call/WhatsApp CTAs)
    └── profile.html                          (Partner Advisory Branding Profile)
```

---

## 3. GLOBAL DESIGN SYSTEM & COMPONENT SPECIFICATIONS

### Color Palette (`/assets/css/mfp-design-system.css`)
- **Primary Teal**: `#0E9D78` (Hover: `#0B8465`, Light: `#E8F7F3`, Dark: `#075E46`)
- **Navy Deep**: `#0F172A` (Text Primary, Footer BG)
- **Slate Gray**: `#334155` (Body Text), `#64748B` (Muted Subtitles)
- **Gold Accent**: `#D97706` (Light: `#FEF3C7`)
- **Emerald Green**: `#10B981` (Healthy Status)
- **Rose Red**: `#E11D48` (Action Required Status)

### Responsive Breakpoint System
- **Mobile Extra Small (360px - 375px)**: Single column, 100% width buttons, bottom navigation active.
- **Mobile Large (390px - 414px)**: Touch targets >= 48px, horizontal swipeable decks enabled.
- **Tablet (768px - 1023px)**: 2-column grids, collapsible drawers, hidden bottom nav.
- **Desktop (1024px - 1440px+)**: Sticky header with top nav, 3 & 4 column card grids, multi-column footer.

---

## 4. NAVIGATION ARCHITECTURE

### Desktop Navigation Header
`[Logo + MFP PRO Badge] | Home | Financial Planning | Financial Health | Life Goals | Investments | Calculators | Financial Literacy | Partner || [Login] [Create My Financial Plan]`

### Mobile Navigation Systems
- **Top Bar**: `[Logo] [Hamburger Drawer]`
- **Bottom Navigation Bar**: `Home | Plan | Goals | Investments | Dashboard`

---

## 5. HOMEPAGE 13-SECTION STRUCTURE SUMMARY

1. **Header**: Sticky brand bar with quick login and plan generation triggers.
2. **Hero Section**: Headline *"Have You Planned For Your Life's Important Moments?"*, Indian family visual progression.
3. **"Have You Planned For?"**: Horizontal swipeable goal cards (Child Education, Marriage, Retirement, Emergency, Healthcare, Protection, Legacy, Custom).
4. **Financial Health Section**: 1-100 score ring and 8 core health pillar indicators.
5. **How It Works**: 4-step visual flow (1. Tell Us About Yourself -> 2. Tell Us Your Goals -> 3. We Analyse -> 4. Build Your Plan).
6. **Dashboard Preview**: Realistic financial summary card showing total goal shortages and required SIPs.
7. **Present Investments**: 10 investment category cards (MF, Stocks, FD, PPF, EPF, NPS, Gold, Bonds, Real Estate, Other).
8. **Calculator Hub Preview**: Search & filter tabs for 12 calculator categories.
9. **Financial Literacy Preview**: Article cards and beginner guides.
10. **Partner Mode Section**: Advisor workspace overview with direct partner login.
11. **Trust & Security**: Data encryption, transparent assumptions, and privacy assurances.
12. **Final CTA**: *"Your Future Deserves a Plan."* with primary `CREATE MY FINANCIAL PLAN` trigger.
13. **Footer**: Multi-column links for Planning, Tools, Learn, Partner, and Legal.

---

## 6. VERIFICATION & COMMIT STATUS

- All 21 major page structures created and styled with `/assets/css/mfp-design-system.css`.
- Zero broken links found across the workspace.
- Mobile bottom navigation active on mobile viewports.
- Vanshavali isolated from main navigation under `VANSHAVALI_ENABLED = false` feature flag.

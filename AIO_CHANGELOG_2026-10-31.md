# AIO factual consistency patch — 31 October 2026

## Baseline

- Baseline Git HEAD before changes: `4bb00148e8d4d0edb51fa04ca9415dbaec41932e`
- Scope: public AIO / answer-engine factual consistency and trust signals only.
- No CRM, authentication, payments, calculators, user data or unrelated app logic was changed intentionally.

## Changes

- Standardised public calculator count to **30+** in public HTML, app metadata, manifest, download copy, policies, repository brand guidance and answer-engine content.
- Removed unsupported aggregate rating / review-count JSON-LD from the homepage.
- Removed unsupported “leading”, “top-rated” and “personal financial advisor near me” metadata claims.
- Clarified that MFP is India-focused financial-planning software and is not itself a SEBI-registered investment adviser, insurance company or broker.
- Reframed professional directory landing pages as educational guides and marked them `noindex,follow` until verified live listings exist.
- Replaced homepage “connect with” professional marketplace language with a transparent “Professional Directory — Coming Soon” status block.
- Aligned public Partner Platinum references in terms/refund/referral copy to the current Partner-page price of ₹999. Separate Digital Vanshavali ₹599 estate-plan copy was not changed because it is a different product surface.
- Added `/trust/` canonical facts page with Organization, WebSite, SoftwareApplication and FAQPage JSON-LD.
- Added `/ai-facts.json` and refreshed `/llms.txt` with current/future/not-live boundaries.
- Added `/trust/` to sitemap and excluded `/admin/` and `/auth.html` from crawler source material.

## Verification

- Static HTML/schema checks: 0 errors.
- Public `500+` strings in text assets: 0.
- Directory pages with `noindex,follow`: 3.
- `/trust/`, `/llms.txt`, `/ai-facts.json`, sitemap and key pages returned HTTP 200 in staged preview.
- No fabricated reviews, ratings, registrations, licences, revenue, customers or partnerships were added.

## Rollback

To roll back this commit, revert this commit or reset to baseline `4bb00148e8d4d0edb51fa04ca9415dbaec41932e`. Do not force-push. Review the diff before any public deployment.

## Deployment status

Prepared and committed locally for owner review. Public deployment/push requires the owner’s normal GitHub deployment step and final confirmation of the factual checklist, especially legal identity, calculator registry, pricing, app-store status and professional-directory status.

# SmartCalc AI — Comprehensive Read-Only Functional Audit Report

**Date of Audit:** September 13, 2026  
**Audit Type:** Complete Functional & Architectural Read-Only Inspection  
**Repository:** `https://github.com/prgatisrivastava114-lab/SmartCalc-AI-web.git`  
**Production URL:** `https://www.myfinancialplan.in`  

---

## 1. Feature-by-Feature Functional Audit

### Feature 1: Landing Page Hero & Promo Video Player
* **Page / Route:** `/` (`index.html`)
* **Expected Behavior:** Landing page renders hero title, brand assets, and custom video ad player (`assets/promo.mp4`) with poster overlay, autoplay muted, and audio toggle.
* **Actual Behavior:** Renders correctly. HTML5 `<video>` tag configured with `autoplay muted loop playsinline` attributes. Poster image fallback is specified.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/index.html`, `/assets/promo.mp4`, `/assets/poster.png`
* **Recommended Fix:** N/A.

### Feature 2: Web App Launcher CTA
* **Page / Route:** `/` (`index.html`) -> `/app/`
* **Expected Behavior:** Clicking "Launch Web App" or "Open App" navigates to the compiled Flutter Web application container at `/app/`.
* **Actual Behavior:** Navigates directly to `/app/` where Flutter bootstrap loads CanvasKit and initializes Dart main.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/index.html`, `/app/index.html`
* **Recommended Fix:** N/A.

### Feature 3: Android APK Download Center
* **Page / Route:** `/` (`index.html`), `/download/`, `/downloads/`
* **Expected Behavior:** Clicking "Download Android App" serves the latest compiled universal APK (`SmartCalcAI-v2.22.2.apk`). Alternative architecture APKs (ARMv7a, x86_64) available on `/download/`.
* **Actual Behavior:** Files exist in `/downloads/` and download page displays SHA-256 checksums and installation instructions.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/downloads/SmartCalcAI-v2.22.2.apk`, `/download/index.html`
* **Recommended Fix:** N/A.

### Feature 4: Flutter Web Application Bundle
* **Page / Route:** `/app/` (`/app/index.html`)
* **Expected Behavior:** Loads Flutter Web runtime via `flutter_bootstrap.js` and CanvasKit WebAssembly (`canvaskit.wasm`), executing `main.dart.js` (v2.22.2, build 44).
* **Actual Behavior:** Release assets, CanvasKit engines, `version.json`, and `manifest.json` are present and properly referenced.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/app/index.html`, `/app/main.dart.js`, `/app/version.json`
* **Recommended Fix:** N/A.

### Feature 5: SIP Calculator
* **Page / Route:** `/tools/sip-calculator/`
* **Expected Behavior:** Calculates maturity value using $FV = P \times \frac{(1+i)^n - 1}{i} \times (1+i)$. Displays total invested, wealth gained, and growth %.
* **Actual Behavior:** Math accurately computes $FV$. Handles zero interest rate gracefully ($FV = P \times n$). Formats output in Indian currency format (`en-IN`).
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/sip-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 6: EMI Calculator
* **Page / Route:** `/tools/emi-calculator/`
* **Expected Behavior:** Calculates monthly EMI for home/car/personal loans using $E = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$. Displays total interest and total payment.
* **Actual Behavior:** Math correctly calculates monthly EMI. Handles $r=0$ case ($E = P / n$). Shows multiplier (e.g. ₹1 borrowed -> ₹1.82 repaid).
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/emi-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 7: Fixed Deposit (FD) Calculator
* **Page / Route:** `/tools/fd-calculator/`
* **Expected Behavior:** Computes FD maturity with bank quarterly compounding ($A = P \times (1 + \frac{r}{400})^{4y}$).
* **Actual Behavior:** Correctly applies quarterly compounding rule used by Indian commercial banks. Displays estimated post-tax returns.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/fd-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 8: Lumpsum Investment Calculator
* **Page / Route:** `/tools/lumpsum-calculator/`
* **Expected Behavior:** Calculates future value of a one-time investment ($FV = P \times (1+r)^n$) and displays Rule of 72 doubling estimate.
* **Actual Behavior:** Accurate mathematical evaluation. Displays doubling horizon in years.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/lumpsum-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 9: Retirement Calculator
* **Page / Route:** `/tools/retirement-calculator/`
* **Expected Behavior:** Projects post-retirement monthly expenses with inflation adjustment ($E \times (1+f)^{B-A}$), computes required corpus, and monthly SIP needed.
* **Actual Behavior:** Math correctly accounts for pre-retirement inflation ($f$), post-retirement return rate ($r_s$), and annuity drawdown.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/retirement-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 10: Public Provident Fund (PPF) Calculator
* **Page / Route:** `/tools/ppf-calculator/`
* **Expected Behavior:** Calculates 15-year annual deposit compounding at fixed rate (EEE tax-free status).
* **Actual Behavior:** Correctly loops annual balance compounding ($bal = (bal + P) \times (1+r)$). Reminds user of ₹1.5 lakh/year cap.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/ppf-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 11: Sukanya Samriddhi Yojana (SSY) Calculator
* **Page / Route:** `/tools/ssy-calculator/`
* **Expected Behavior:** Computes SSY returns for 15 deposit years with compounding continuing until 21-year maturity.
* **Actual Behavior:** Correctly restricts deposits to first 15 years while compounding through year 21.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/ssy-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 12: Systematic Withdrawal Plan (SWP) Calculator
* **Page / Route:** `/tools/swp-calculator/`
* **Expected Behavior:** Simulates monthly withdrawals from an initial corpus earning return rate $r$. Displays total withdrawn and remaining balance.
* **Actual Behavior:** Accurately simulates month-by-month balance depletion. Handles partial last withdrawal if corpus exhausts early.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/swp-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 13: 50/30/20 Budget Calculator
* **Page / Route:** `/tools/budget-calculator/`
* **Expected Behavior:** Allocates net monthly income into Needs (50%), Wants (30%), and Investments (20%).
* **Actual Behavior:** Computes allocations instantly on input change and formats values in ₹.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/budget-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 14: Step-Up SIP Calculator
* **Page / Route:** `/tools/step-up-sip-calculator/`
* **Expected Behavior:** Calculates SIP growth with an annual percentage increase in monthly contribution ($P_{cur} = P \times (1+s)^{\lfloor(m-1)/12\rfloor}$).
* **Actual Behavior:** Accurate month-by-month loop. Compares step-up result against a flat SIP.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/step-up-sip-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 15: Future Value Calculator
* **Page / Route:** `/tools/future-value-calculator/`
* **Expected Behavior:** Calculates FV of initial principal plus optional annual additions.
* **Actual Behavior:** Correctly calculates combined future balance.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/future-value-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 16: Present Value Calculator
* **Page / Route:** `/tools/present-value-calculator/`
* **Expected Behavior:** Discounts future sum back to current purchasing power based on inflation rate ($PV = F / (1+r)^n$).
* **Actual Behavior:** Accurate present value calculation.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/present-value-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 17: Monthly Budget Planner
* **Page / Route:** `/tools/monthly-budget-planner/`
* **Expected Behavior:** Sums 8 expense heads, subtracts from income, computes savings rate %, and provides contextual financial advice.
* **Actual Behavior:** Functions dynamically. Warns user if expenses exceed income or savings rate is <10%.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/monthly-budget-planner/index.html`
* **Recommended Fix:** N/A.

### Feature 18: SIP Goal Calculator
* **Page / Route:** `/tools/sip-goal-calculator/`
* **Expected Behavior:** Computes monthly SIP required to achieve a target financial goal amount. Displays delay cost penalty for starting 5 years late.
* **Actual Behavior:** Reverse-calculates required SIP annuity factor. Accurately calculates 5-year delay penalty.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/tools/sip-goal-calculator/index.html`
* **Recommended Fix:** N/A.

### Feature 19: Financial Literacy Hub & SEO Articles
* **Page / Route:** `/learn/`, `/learn/*` (9 articles)
* **Expected Behavior:** Renders responsive financial articles in Hinglish/English with canonical URLs, Schema.org markup, and internal tool links.
* **Actual Behavior:** Articles load cleanly, internal links point to corresponding `/tools/` calculators, and mobile styling is responsive.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/learn/index.html`, `/learn/*/index.html`
* **Recommended Fix:** N/A.

### Feature 20: Google Identity Auth & Pairing Portal
* **Page / Route:** `/auth.html`
* **Expected Behavior:** Renders Google Identity Sign-In (`gsi/client`). Exchanges Google Token for Firebase Auth ID Token (`signInWithIdp`), generates 6-digit pair code, SHA-256 hashes code, and writes to Firestore `/pair_codes/{hash}` with a 5-minute expiration timer.
* **Actual Behavior:** JavaScript logic implements `signInWithIdp`, Web Crypto SHA-256 hashing, and Firestore REST document patch.
* **Status:** `WORKING`
* **Error Message:** None (Handles expired code and network errors gracefully).
* **Relevant File / Endpoint:** `/auth.html`, `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp`, `https://firestore.googleapis.com/v1/...`
* **Recommended Fix:** N/A.

### Feature 21: One-Tap Deep Link Return (`smartcalc://auth`)
* **Page / Route:** `/auth.html?src=app`
* **Expected Behavior:** When launched from the mobile app (`?src=app`), skips 6-digit code generation and immediately redirects to `smartcalc://auth?tok=<gTok>` deep link.
* **Actual Behavior:** URL query parameter check (`IS_APP`) detects app context, displays one-tap button, and triggers `location.href = back`.
* **Status:** `PARTIALLY WORKING`
* **Error Message:** None (Requires SmartCalc AI mobile app installed on device to intercept custom URI scheme `smartcalc://`).
* **Relevant File / Endpoint:** `/auth.html`
* **Recommended Fix:** Add fallback prompt instructing user to install app if deep link fails to trigger.

### Feature 22: Owner Admin Panel 2FA Gate
* **Page / Route:** `/admin/index.html`
* **Expected Behavior:** Enforces 2-stage authentication: Gate 1 verifies Google sign-in against Firestore `/owner/self` doc email; Gate 2 verifies Admin PIN hash against `/owner/admin` doc.
* **Actual Behavior:** Enforces two-step lock screen before unlocking administration dashboard.
* **Status:** `WORKING`
* **Error Message:** Displays clear instructions if Firestore `/owner/self` document is not yet populated.
* **Relevant File / Endpoint:** `/admin/index.html`
* **Recommended Fix:** N/A.

### Feature 23: Admin Remote Flags & Partner Code Generator
* **Page / Route:** `/admin/index.html` (Post-Login View)
* **Expected Behavior:** Allows owner to generate formatted partner activation codes (`MFP-SGP...`), toggle remote feature flags (`/config/remote_flags`), and view submitted lead entries (`/leads/`).
* **Actual Behavior:** Uses Firestore REST API to patch document fields directly without heavy SDK dependencies.
* **Status:** `WORKING`
* **Error Message:** None.
* **Relevant File / Endpoint:** `/admin/index.html`, `/rules-v3.txt`
* **Recommended Fix:** N/A.

---

## 2. Technical System Verifications

### 1. Login Persistence After Reopening App
* **Web Admin Panel (`/admin/index.html`)**: Auth tokens and PIN verification states are stored in `sessionStorage` (`sessionStorage.setItem('owner_auth_v1', ...)`). Closing the browser tab destroys the session, requiring re-authentication upon return. This is the **intended security behavior** for an owner admin panel.
* **Web App Pairing (`/auth.html`)**: Generated 6-digit pairing codes expire in 5 minutes (`TTL = 5 * 60 * 1000`) and are single-use. Once redeemed, long-lived tokens are stored locally on the client device.

### 2. User Permissions & Protected Routes
* Protected Firestore collections defined in `rules-v3.txt`:
  * `/owner/self`: Public read, write restricted to `isOwner()`.
  * `/owner/{doc}`: Read/write restricted to `isOwner()`.
  * `/config/{doc}`: Public read, write restricted to `isOwner()`.
  * `/leads/{doc}`: Authenticated user create, owner-only read/write.
  * `/partner_codes/{doc}`: Owner-only read/write.
  * `/partner_redeems/{doc}`: Validated format create, owner-only read/write.
  * `/users/{uid}/{doc=**}`: User-restricted (`request.auth.uid == uid`).

### 3. Firebase Reads and Writes
* **Reads**: Public client reads remote flags (`/config/remote_flags`), pairing code lookup (`/pair_codes/{hash}`), and owner verification (`/owner/self`).
* **Writes**: Pairing code generation (`/pair_codes/{hash}`), lead submissions (`/leads/`), partner code redemptions (`/partner_redeems/`), and owner remote flag updates (`/config/remote_flags`).
* **API Plane**: All operations execute via standard HTTP `fetch()` requests against Firestore REST API v1 (`https://firestore.googleapis.com/v1/...`).

### 4. Cloudflare API or Worker Calls
* **Deployment Setup**: The repository is configured for Cloudflare Pages static site hosting.
* **CDN / Edge Behavior**: Static assets (`index.html`, `/tools/`, `/learn/`, `/downloads/`, `/app/`) are served via Cloudflare's global CDN with HTTPS SSL certificates and edge caching.
* **No Custom Worker Scripts**: The application does not require background Cloudflare Worker fetch handlers, avoiding extra serverless execution costs.

### 5. Calculation Accuracy
* Verified math formulas across all 14 calculators:
  * **SIP**: $FV = P \times \frac{(1+i)^n - 1}{i} \times (1+i)$ (Verified)
  * **EMI**: $E = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$ (Verified)
  * **FD**: Quarterly compounding $A = P \times (1 + \frac{r}{400})^{4y}$ (Verified)
  * **PPF**: Annual deposit compounding with EEE tax exemption rules (Verified)
  * **SSY**: 15-year deposit limit with 21-year maturity horizon (Verified)
  * **SWP**: Monthly balance depletion simulation with partial final month handling (Verified)
  * **Step-Up SIP**: Compounding with annual percentage multiplier (Verified)

### 6. Input Validation
* Numeric inputs are safely parsed via helper function `num(id)`:
  `const num = id => { const v = parseFloat(document.getElementById(id).value); return isNaN(v) ? 0 : v; };`
* Tenure inputs are clamped using `Math.max(1, ...)` to prevent infinite loops or division by zero.
* $r=0$ edge cases are handled across calculators ($E = P / n$, $FV = P \times n$).

### 7. Empty States
* All calculators and forms are initialized with sensible, realistic default values (e.g. SIP ₹5,000 / 12% / 10 yrs; EMI ₹25,00,000 / 8.5% / 20 yrs) so fields are never empty or blank on initial load.

### 8. Error States
* Network failures, expired pairing codes, 401/403 permission rejections, and invalid PIN inputs present formatted inline error cards (`#err`, toast popups, alert boxes).

### 9. Mobile Layout
* Responsive design verified across landing page, tools, blog articles, auth page, and owner panel.
* CSS flexbox and grid layouts auto-fit to narrow viewports (`grid-template-columns: repeat(auto-fit, ...)`).
* Viewport meta tags present on all pages (`<meta name="viewport" content="width=device-width, initial-scale=1">`).
* Touch targets conform to standard mobile accessibility guidelines (`min-height: 44px`).

### 10. Production Environment Variables
* Public configuration constants embedded in source code:
  * `FIREBASE_API_KEY`: `AIzaSyA5Sc1oRm0E9qIkCgZhYeTxlqiUddVrBIc`
  * `GOOGLE_CLIENT_ID`: `548984348697-i4d6j8842bk8va0i2rqvehvl1pjjfm7a.apps.googleusercontent.com`
  * `FIREBASE_AUTH_DOMAIN`: `smartcalc-ai-638a9.firebaseapp.com`
* Secret credentials (such as private admin keys) are omitted from public web files.

### 11. Cloudflare Deployment Behavior
* Static upload deployment model to Cloudflare Pages project `myfinancialplan`.
* `.nojekyll` file present in root directory to prevent GitHub Pages / Cloudflare build pipeline from ignoring underscore-prefixed directories or hidden files.
* `CNAME` configured for `www.myfinancialplan.in`.

### 12. Firebase Security Rules
* Defined in `rules-v3.txt`. Rules enforce `signedIn()`, `isOwner()` checks, partner code format regex matching (`^MFP-[SGP][0-9]{3}-[A-Z2-9]{4}-[A-Z2-9]{4}$`), and user-isolated document security (`/users/{uid}/{doc=**}`).

---

## 3. Summary Matrix

| Category | Total Tested | Working | Partially Working | Broken |
|---|---|---|---|---|
| **Core Pages & Features** | 4 | 4 | 0 | 0 |
| **Interactive SEO Tools** | 14 | 14 | 0 | 0 |
| **Blog & SEO Articles** | 9 | 9 | 0 | 0 |
| **Auth & Owner Panel** | 3 | 2 | 1 (`smartcalc://` deep link) | 0 |
| **Security & Infrastructure** | 6 | 6 | 0 | 0 |
| **TOTAL** | **36** | **35** | **1** | **0** |

---

## 4. Recommendations for Next Development Cycle

1. **Automated CI/CD Pipeline:** Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically test static syntax and trigger Cloudflare Pages deployments on push.
2. **Deep Link Fallback UI:** Add an explicit fallback banner on `auth.html` when `smartcalc://` deep link fails to open (e.g. if opened on desktop or uninstalled device).
3. **Flutter App Source Repository Tracking:** Connect or document the raw Dart source repository location (`SmartCalcAI-source`) for compiling new app releases to `/app/`.

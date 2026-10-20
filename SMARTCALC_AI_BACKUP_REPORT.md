# SmartCalc AI — Backup & Recovery Point Report

**Date of Backup:** September 13, 2026  
**Backup Status:** SUCCESSFUL  
**Repository:** `https://github.com/prgatisrivastava114-lab/SmartCalc-AI-web.git`  

---

## 1. Recovery Point Summary

| Attribute | Details |
|---|---|
| **Backup Branch Name** | `takeover/smartcalc-ai-backup` |
| **Backup Commit Hash** | `e7cc6bda2dde8825bd688e7f9a5b2d28144c537c` |
| **Git Tag** | `smartcalc-ai-before-takeover` |
| **Production Commit** | `8b5a36d1919d2f21f910ce8a9a858633d6c71e5a` |
| **Live Website URL** | `https://www.myfinancialplan.in` (Cloudflare Pages fallback: `https://myfinancialplan.pages.dev`) |
| **Firebase Project ID** | `smartcalc-ai-638a9` |
| **Cloudflare Project Name** | `myfinancialplan` |

---

## 2. Infrastructure & System Configurations

### A. Firestore Rules (Exported from `rules-v3.txt`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function ownerEmail() {
      return get(/databases/$(database)/documents/owner/self).data.email;
    }
    function isOwner() {
      return signedIn() && request.auth.token.email == ownerEmail();
    }
    match /owner/self {
      allow read: if true;
      allow write: if isOwner();
    }
    match /owner/{doc} {
      allow read, write: if isOwner();
    }
    match /config/{doc} {
      allow read: if true;
      allow write: if isOwner();
    }
    match /leads/{doc} {
      allow create: if signedIn();
      allow read, update, delete: if isOwner();
    }
    match /partner_codes/{doc} {
      allow read, write: if isOwner();
    }
    match /partner_redeems/{doc} {
      allow create: if request.resource.data.keys().hasAll(['plan','code','at'])
                      && request.resource.data.code is string
                      && request.resource.data.code.matches('^MFP-[SGP][0-9]{3}-[A-Z2-9]{4}-[A-Z2-9]{4}$');
      allow read, update, delete: if isOwner();
    }
    match /users/{uid}/{doc=**} {
      allow read, write: if signedIn() && request.auth.uid == uid;
    }
  }
}
```

### B. Firebase Storage Rules
* **Status:** No Firebase Storage bucket rules are active in this repository. All media assets (`promo.mp4`, branding, screenshots) and binary APKs are hosted directly as static assets within the web deployment package (`/assets/` and `/downloads/`).

### C. Cloudflare & Hosting Configuration
* **Project Name:** `myfinancialplan`
* **Custom Domain:** `www.myfinancialplan.in` (Redirects `myfinancialplan.in`)
* **Page Route Config:** Direct static upload model (`/` -> `index.html`, `/app/` -> Flutter Web container, `/tools/` -> SEO Calculators, `/admin/` -> Owner Panel, `/downloads/` -> APK distribution). `.nojekyll` enabled to prevent Jekyll parsing.

### D. Build & Deployment Settings
* **Flutter Web App (`/app/`)**: Built via `flutter build web --release --base-href /app/`.
* **Static Assets**: HTML5, CSS3, ES6 JavaScript, CanvasKit WebAssembly.
* **Deployment Method**: Push to `main` branch or zip asset upload to Cloudflare Pages project `myfinancialplan`.

### E. Environment Variable Names
* `FIREBASE_API_KEY` (Public web key embedded in auth/admin scripts)
* `GOOGLE_CLIENT_ID` (Google OAuth Client ID embedded in auth/admin scripts)
* `FIREBASE_AUTH_DOMAIN` (`smartcalc-ai-638a9.firebaseapp.com`)
* `BACKEND_BASE_URL` (Optional external Node API endpoint, e.g. `https://api.myfinancialplan.in`)

*(Note: No secret keys or private passwords are included in this report.)*

---

## 3. Rollback & Restoration Instructions

If any future changes cause issues or need to be undone, follow these step-by-step instructions to restore the system to its pre-takeover state:

### Step 1: Rollback Local Workspace Code
To discard uncommitted or new changes and revert to the exact backup tag:
```bash
# Fetch latest tags and checkout the backup tag
git checkout smartcalc-ai-before-takeover

# Alternatively, switch back to the takeover backup branch
git checkout takeover/smartcalc-ai-backup
```

### Step 2: Rollback GitHub Repository (`main` branch)
If changes were pushed to `main` and need to be reset on GitHub:
```bash
# Force push the backup tag state to origin/main
git checkout smartcalc-ai-before-takeover
git branch -f main smartcalc-ai-before-takeover
git checkout main
git push origin main --force
```

### Step 3: Rollback Cloudflare Pages Live Deployment
If manual zip uploads were used on Cloudflare Pages:
1. Log into **Cloudflare Dashboard** -> **Workers & Pages** -> **myfinancialplan**.
2. Go to **Deployments** tab.
3. Locate the deployment associated with commit `8b5a36d1919d2f21f910ce8a9a858633d6c71e5a`.
4. Click **`...`** next to that deployment and select **Rollback to this deployment**.

### Step 4: Restore Firestore Security Rules
If Firestore rules were modified in Firebase Console:
1. Open **Firebase Console** -> **Firestore Database** -> **Rules**.
2. Paste the rules documented in Section 2A of this report (`rules-v3.txt`).
3. Click **Publish**.

---

## 4. Files / Assets Outside Local Backup Scope

The following items are external to the `SmartCalc-AI-web` repository and cannot be backed up directly in Git:
1. **Uncompiled Dart Source (`SmartCalcAI-source`)**: The uncompiled Flutter Dart source code repository is stored separately. The web repository contains the compiled release bundle in `/app/`.
2. **Node Backend Script (`dev_server.mjs`)**: The optional backend script referenced in `DEPLOY_GUIDE.md` for external OTP and payment routing is hosted on external server infrastructure (Render/Railway).
3. **Live Firestore Database Records**: Document data in Firestore collections (`/owner/`, `/leads/`, `/config/`) resides on Google Cloud Firebase servers.

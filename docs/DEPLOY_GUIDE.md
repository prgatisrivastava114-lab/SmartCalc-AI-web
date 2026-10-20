# 🚀 DEPLOY GUIDE — Put www.myfinancialplan.in Live

**Time needed: ~20–30 minutes. No coding required.**

You have TWO easy options. Pick ONE:

| Option | Cost | Best if… |
|---|---|---|
| **A. Cloudflare Pages (recommended)** | **FREE forever** | You only bought the domain, no hosting yet |
| **B. Your existing hosting (cPanel)** | Already paid | You already pay for web hosting |

If you're not sure, **choose Option A** — free, fast, automatic HTTPS.

---

## OPTION A — Cloudflare Pages (FREE, recommended)

### Step A1 — Create a free Cloudflare account
1. Go to **https://dash.cloudflare.com/sign-up**
2. Sign up with your email, verify it.

### Step A2 — Move your domain's DNS to Cloudflare
1. In Cloudflare, click **Add a site** (or **Websites → Add site**), type `myfinancialplan.in`, choose the **Free** plan.
2. Cloudflare shows you **2 nameservers**, like:
   - `alice.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
3. Go to the website where you **bought the domain** (GoDaddy / Hostinger / BigRock / Google Domains etc.):
   - Find **My Domains → myfinancialplan.in → DNS / Nameservers**
   - Choose **"Use custom nameservers"** and paste the 2 Cloudflare ones. Save.
4. Back in Cloudflare click **Done, check nameservers**. It activates within a few minutes (can take up to a few hours — normal).

> ✅ This step does NOT change ownership — it just lets Cloudflare serve your site and gives you free HTTPS (the 🔒 padlock).

### Step A3 — Prepare the upload
1. **Unzip** this package on your computer. You get folders: `app/`, `assets/`, `docs/`, and `index.html`.
2. Copy **`SmartCalcAI-v1.4.0.apk`** into the **`downloads/`** folder (this is what the "Download Android App" button serves).
3. Select `index.html`, `app`, `assets`, `downloads` and **zip them together** into one file, e.g. `site.zip`.
   - ⚠️ Zip must contain `index.html` at the **top level**, not inside another folder.

### Step A4 — Deploy
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Project name: `myfinancialplan` → drop your `site.zip` → **Deploy site**.
3. In ~30 seconds your site is live at `https://myfinancialplan.pages.dev`. Test it!

### Step A5 — Connect your real domain
1. In the Pages project → **Custom domains** → **Set up a custom domain** → type `www.myfinancialplan.in`.
2. Cloudflare adds the DNS record automatically (because of Step A2). Also add `myfinancialplan.in` — it will redirect to `www` automatically.
3. Wait 1–5 minutes → visit **https://www.myfinancialplan.in** 🎉

### Test checklist
- [ ] `https://www.myfinancialplan.in` → landing page with video
- [ ] Video plays (muted) → tap 🔊 for sound
- [ ] **Open Web App** → calculators load fully
- [ ] **Download Android App** → the APK downloads
- [ ] Padlock 🔒 shows in the browser

---

## OPTION B — Existing hosting (cPanel / Hostinger / GoDaddy hosting)

### Step B1 — Point the domain (if not already)
In your hosting account, make sure `myfinancialplan.in` is attached to your hosting (your host's "Add Domain" page does this and tells you if nameservers need updating at your registrar).

### Step B2 — Upload files
1. Log into **cPanel** → **File Manager** → open **`public_html`**.
2. Delete placeholder files (`index.php`, `default.html` etc. if you don't need them).
3. Upload `index.html`, the folders `app/`, `assets/`, `downloads/` (upload a zip and use **Extract** — easier).
4. Copy **`SmartCalcAI-v1.4.0.apk`** into `public_html/downloads/`.

### Step B3 — Free HTTPS
- cPanel → **SSL/TLS Status** → Run **AutoSSL** (most hosts) — free padlock.
- Hostinger users: *Websites → SSL → Install free SSL*.

### Step B4 — Test the same checklist as Option A.

---

## 🔧 AFTER GO-LIVE — connect your app to the backend (optional but recommended)

Your web app + Android app can talk to your backend (OTP, coins, referrals, partner payments).

1. **Deploy the backend** (files in `SmartCalcAI-source` → `docs/backend/`):
   - Easiest free host: **Render.com** or **Railway.app** → "New Web Service" → upload repo/folder → it gives you a URL like `https://api-myfinancialplan.onrender.com`.
   - The dev server (`dev_server.mjs`) is already CORS-enabled for the web app.
2. **Tell the apps the backend URL**: in the app → Admin Settings → `backend_base_url = https://api-myfinancialplan.onrender.com`.
3. For a custom look, add a Cloudflare DNS record: `CNAME api.myfinancialplan.in → your-render-url`, then use `https://api.myfinancialplan.in` as the base URL.

## 📱 Updating things later

| To change… | Do this |
|---|---|
| New app version | Replace `downloads/SmartCalcAI-v1.4.0.apk` (keep the same file name, or edit the link in `index.html` and `manifest`) |
| New video ad | Replace `assets/promo.mp4` (keep the name) |
| Text/pricing on landing | Edit `index.html` in Notepad — every label is plain text |
| App itself | Edit the Flutter source, run `flutter build web --release --base-href /app/`, replace the `app/` folder |

## 🆘 Common problems

- **"Launch Web App" shows a blank page** → the zip was uploaded with an extra top folder; `index.html` and `app/` must be at the same level.
- **Video won't autoplay on iPhone** → iOS only autoplays **muted** video (that's exactly how we set it up — tap 🔊 for sound). Nothing to fix.
- **APK downloads as .zip on some hosts** → add a file `downloads/.htaccess` with: `AddType application/vnd.android.package-archive .apk`
- **Changes don't show** → hard-refresh with Ctrl+Shift+R (Cloudflare cache: *Caching → Purge Everything*).

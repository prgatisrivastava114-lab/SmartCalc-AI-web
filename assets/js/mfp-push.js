/* ============================================================================
   MY FINANCIAL PLAN — web push client module
   ----------------------------------------------------------------------------
   The only push code the public site loads. Self-mounts its own UI, so adding
   push to a page means adding this one script tag and nothing else:

       <script type="module" src="/assets/js/mfp-push.js"></script>

   NON-NEGOTIABLES ENCODED HERE
   ----------------------------
   1. Notification.requestPermission() is called from exactly one place, inside
      a click handler, after the person has read our own explanation. It is
      never called on load, on scroll, or on a timer.
   2. "Not now" never reaches the browser prompt. A browser-level Block is
      effectively permanent, so it is only ever spent on someone who has
      already said yes to us.
   3. Every failure path leaves the website completely functional.
   4. No personal or financial data is ever put in a notification.
   ========================================================================== */

const CFG   = {
  "apiKey": "AIzaSyA5Sc1oRm0E9qIkCgZhYeTxlqiUddVrBIc",
  "authDomain": "smartcalc-ai-638a9.firebaseapp.com",
  "projectId": "smartcalc-ai-638a9",
  "storageBucket": "smartcalc-ai-638a9.firebasestorage.app",
  "messagingSenderId": "548984348697",
  "appId": "1:548984348697:web:cba90544a074784ac5ca88"
};
const VAPID = 'BHGW9fA1p2sIxe_Drxq6FYHJ5-KgPRTYfpSZsnaDalxSs5TA6LCeaXT7HTujucG3AyRsMTgWVYzp_z8fJEqppuI';

/* Where the control appears: 'both' | 'contextual' | 'footer' | 'off'.
   One-line change, no other edits needed. */
const PLACEMENT = 'both';

const SW_URL     = '/firebase-messaging-sw.js';
const PREFS_URL  = '/notifications/';
const FS_BASE    = `https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents`;
const LS_INSTALL = 'mfp_install_id';
const LS_SNOOZE  = 'mfp_push_snooze';
const LS_STATE   = 'mfp_push_state';
const SNOOZE_DAYS = 45;

const CATEGORIES = [
  { id: 'planning',     label: 'Financial planning and goal reminders',  def: true  },
  { id: 'calculators',  label: 'New calculators and money guides',       def: true  },
  { id: 'announcements',label: 'Important website announcements',        def: true  },
  { id: 'partner',      label: 'Partner and client follow-up reminders', def: false, partnerOnly: true }
];

/* ── tiny helpers ───────────────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const now = () => Date.now();
const log = (...a) => { if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.log('[mfp-push]', ...a); };

function installId() {
  let v = null;
  try { v = localStorage.getItem(LS_INSTALL); } catch (_) { return null; }
  if (!v) {
    v = (crypto.randomUUID ? crypto.randomUUID()
                           : 'i-' + now().toString(36) + '-' + Math.random().toString(36).slice(2, 11));
    try { localStorage.setItem(LS_INSTALL, v); } catch (_) {}
  }
  return v;
}
const readLS  = (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } };
const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

/* ── environment ────────────────────────────────────────────────────────── */
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true;
const isInApp = /FBAN|FBAV|Instagram|Line\/|Twitter|MicroMessenger/i.test(navigator.userAgent);

function support() {
  /* Truthiness, not `in`: a property can exist and still be undefined, which
     is exactly what a stubbed or partially-implemented browser looks like. */
  if (!navigator.serviceWorker)        return 'unsupported';
  if (!window.PushManager)             return isIOS && !isStandalone ? 'ios-needs-install' : 'unsupported';
  if (!window.Notification || typeof Notification.requestPermission !== 'function') return 'unsupported';
  if (isInApp)                         return 'unsupported';
  if (!window.isSecureContext)         return 'unsupported';
  if (isIOS && !isStandalone)          return 'ios-needs-install';
  return 'ok';
}

/* ── Firestore REST ─────────────────────────────────────────────────────────
   The public site deliberately does not load the Firestore SDK — that would be
   ~100 KB for three writes. REST with the public web key does the same job.
   Security comes from the rules, which allow a device to write only its own
   document and never read anybody's.
   ------------------------------------------------------------------------ */
function toFs(o) {
  const f = {};
  for (const k in o) {
    const v = o[k];
    if (v === null || v === undefined)   f[k] = { nullValue: null };
    else if (typeof v === 'boolean')     f[k] = { booleanValue: v };
    else if (typeof v === 'number')      f[k] = { integerValue: String(Math.trunc(v)) };
    else if (Array.isArray(v))           f[k] = { arrayValue: { values: v.map((x) => ({ stringValue: String(x) })) } };
    else                                 f[k] = { stringValue: String(v) };
  }
  return f;
}

async function fsWrite(docId, data) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url  = `${FS_BASE}/push_tokens/${encodeURIComponent(docId)}?key=${CFG.apiKey}&${mask}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFs(data) })
  });
  if (!r.ok) throw new Error('store ' + r.status + ' ' + (await r.text()).slice(0, 120));
  return true;
}

/* ── Firebase messaging (lazy — only once the user has opted in) ─────────── */
let _fb = null;
async function firebaseMessaging() {
  if (_fb) return _fb;
  const [{ initializeApp, getApps, getApp }, msg] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js')
  ]);
  const app = getApps().length ? getApp() : initializeApp(CFG);
  _fb = { app, ...msg };
  return _fb;
}

/* ── state ──────────────────────────────────────────────────────────────── */
function state() {
  const s = support();
  if (s !== 'ok') return s;
  const p = Notification.permission;
  if (p === 'denied')  return 'denied';
  if (p === 'granted') return readLS(LS_STATE) === 'subscribed' ? 'subscribed' : 'granted-unsubscribed';
  return 'askable';
}

/* ── subscribe ──────────────────────────────────────────────────────────── */
async function subscribe(cats) {
  if (VAPID.indexOf('__MFP_VAPID') === 0) {
    throw new Error('VAPID key not configured. Generate it in Firebase Console → Project settings → Cloud Messaging → Web Push certificates, then set it in assets/js/mfp-push.js.');
  }

  const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
  await navigator.serviceWorker.ready;

  const { getMessaging, getToken } = await firebaseMessaging();
  const messaging = getMessaging();

  /* Passing the registration explicitly is what stops the SDK from picking up
     the Vanshavali or Flutter worker by accident. */
  const token = await getToken(messaging, { vapidKey: VAPID, serviceWorkerRegistration: reg });
  if (!token) throw new Error('No registration token returned.');

  const id = installId();
  const selected = cats || CATEGORIES.filter((c) => c.def && !c.partnerOnly).map((c) => c.id);

  await fsWrite(id, {
    token,
    installId: id,
    categories: selected,
    active: true,
    uid: null,
    platform: isIOS ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'desktop',
    standalone: !!isStandalone,
    lang: (navigator.language || 'en').slice(0, 10),
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 40),
    createdAt: new Date().toISOString(),
    refreshedAt: new Date().toISOString()
  });

  writeLS(LS_STATE, 'subscribed');
  writeLS('mfp_push_cats', selected);
  attachForeground();
  return token;
}

async function unsubscribe() {
  const id = installId();
  try {
    const { getMessaging, deleteToken } = await firebaseMessaging();
    await deleteToken(getMessaging());
  } catch (e) { log('deleteToken failed (non-fatal)', e.message); }
  try { await fsWrite(id, { active: false, categories: [], unsubscribedAt: new Date().toISOString() }); } catch (e) { log(e.message); }
  writeLS(LS_STATE, 'unsubscribed');
}

/* Refresh the stored token when a subscribed device comes back. Rotation is
   silent and common; without this the record goes stale and sends fail. */
async function refreshIfNeeded() {
  if (state() !== 'subscribed') return;
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    if (!reg) return;
    const { getMessaging, getToken } = await firebaseMessaging();
    const token = await getToken(getMessaging(), { vapidKey: VAPID, serviceWorkerRegistration: reg });
    if (token) await fsWrite(installId(), { token, refreshedAt: new Date().toISOString(), active: true });
  } catch (e) { log('refresh skipped', e.message); }
}

/* ── foreground messages ────────────────────────────────────────────────────
   A notification while the tab is focused is intrusive and on some platforms
   is suppressed anyway. Show a quiet in-page toast instead.
   ------------------------------------------------------------------------ */
let _fgBound = false;
async function attachForeground() {
  if (_fgBound) return;
  _fgBound = true;
  try {
    const { getMessaging, onMessage } = await firebaseMessaging();
    onMessage(getMessaging(), (payload) => {
      const d = payload.data || payload.notification || {};
      toast(d.title || 'My Financial Plan', d.body || '', d.url || '');
    });
  } catch (e) { log('foreground bind failed', e.message); }
}

/* ── styles ─────────────────────────────────────────────────────────────── */
const CSS = `
.mfp-np-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
  background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);color:#e8f0f8;
  border-radius:8px;padding:0 15px;min-height:40px;font:600 12.5px/1 inherit;cursor:pointer;
  transition:.15s;font-family:inherit}
.mfp-np-btn:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.34)}
.mfp-np-card{display:flex;align-items:center;gap:14px;background:linear-gradient(180deg,#fbfdff,#f4f9fd);
  border:1px solid #d6e4f0;border-left:3px solid #0E9D78;border-radius:10px;padding:13px 15px;
  margin:14px 0;flex-wrap:wrap}
.mfp-np-card .ic{width:36px;height:36px;border-radius:9px;background:#DDF4EC;display:grid;place-items:center;flex:none}
.mfp-np-card .tx{flex:1;min-width:185px}
.mfp-np-card .tx b{display:block;font-size:13.5px;margin-bottom:2px;color:#17324A}
.mfp-np-card .tx span{font-size:12.5px;color:#5B6B7F;line-height:1.5}
.mfp-np-go{background:#047857;color:#fff;border:0;border-radius:8px;padding:0 18px;min-height:42px;
  font:700 13px/1 inherit;cursor:pointer;white-space:nowrap;transition:.15s;font-family:inherit}
.mfp-np-go:hover{background:#065f46;box-shadow:0 3px 10px rgba(4,120,87,.3)}
.mfp-np-x{background:none;border:0;color:#8294a8;font-size:21px;line-height:1;cursor:pointer;
  min-width:40px;min-height:40px;display:grid;place-items:center;border-radius:8px;flex:none;font-family:inherit}
.mfp-np-x:hover{color:#5B6B7F}
.mfp-np-ov{position:fixed;inset:0;background:rgba(15,34,51,.55);display:grid;place-items:center;
  z-index:2147483000;padding:18px;backdrop-filter:blur(2px)}
.mfp-np-sh{background:#fff;border-radius:15px;max-width:410px;width:100%;padding:23px;
  box-shadow:0 18px 50px rgba(15,34,51,.3);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#17324A}
.mfp-np-sh .ic{width:46px;height:46px;border-radius:12px;background:#DDF4EC;display:grid;place-items:center;margin-bottom:13px}
.mfp-np-sh h3{margin:0 0 7px;font-size:18px;letter-spacing:-.3px}
.mfp-np-sh p{margin:0 0 13px;font-size:13.5px;color:#5B6B7F;line-height:1.6}
.mfp-np-sh ul{list-style:none;padding:0;margin:0 0 17px}
.mfp-np-sh li{display:flex;gap:9px;font-size:13px;padding:5px 0;align-items:flex-start}
.mfp-np-sh li i{color:#0E9D78;font-weight:800;font-style:normal;flex:none}
.mfp-np-row{display:flex;gap:9px}
.mfp-np-row button{flex:1}
.mfp-np-ghost{background:#fff;color:#17324A;border:1px solid #cfdae6;border-radius:8px;padding:0 18px;
  min-height:42px;font:700 13px/1 inherit;cursor:pointer;font-family:inherit}
.mfp-np-ghost:hover{background:#f4f8fb}
.mfp-np-fine{font-size:11px;color:#8294a8;margin:13px auto 0;text-align:center;line-height:1.55;max-width:330px}
.mfp-np-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;background:#17324A;color:#fff;
  border-radius:11px;padding:13px 17px;max-width:min(400px,92vw);z-index:2147483000;cursor:pointer;
  box-shadow:0 10px 30px rgba(15,34,51,.35);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  animation:mfpNpIn .25s ease-out}
.mfp-np-toast b{display:block;font-size:13.5px;margin-bottom:2px}
.mfp-np-toast span{font-size:12.5px;color:#c7d4e2}
@keyframes mfpNpIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@media (prefers-reduced-motion:reduce){.mfp-np-toast{animation:none}}
@media(max-width:560px){.mfp-np-card .tx{min-width:100%}.mfp-np-go{width:100%}}
`;
function injectCss() {
  if ($('#mfp-np-css')) return;
  const s = document.createElement('style');
  s.id = 'mfp-np-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const BELL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
const BELL_T = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0E9D78" stroke-width="2.1" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';

/* ── toast ──────────────────────────────────────────────────────────────── */
function toast(title, body, url) {
  injectCss();
  const el = document.createElement('div');
  el.className = 'mfp-np-toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<b></b><span></span>`;
  el.firstChild.textContent = title;
  el.lastChild.textContent = body;
  if (url) el.onclick = () => { try { const u = new URL(url, location.origin); if (u.origin === location.origin) location.href = u.pathname + u.search + u.hash; } catch (_) {} };
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 8000);
}

/* ── consent sheet ──────────────────────────────────────────────────────── */
function openSheet() {
  injectCss();
  const s = support();

  const ov = document.createElement('div');
  ov.className = 'mfp-np-ov';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Notification settings');

  const close = () => { ov.remove(); document.removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  ov.onclick = (e) => { if (e.target === ov) close(); };

  if (s === 'ios-needs-install') {
    ov.innerHTML = `<div class="mfp-np-sh"><div class="ic">${BELL_T}</div>
      <h3>Add to your Home Screen first</h3>
      <p>On iPhone and iPad, Apple only allows notifications once a site has been added to the Home Screen. It takes about ten seconds.</p>
      <ul>
        <li><i>1</i><span>Tap the <strong>Share</strong> button at the bottom of Safari</span></li>
        <li><i>2</i><span>Choose <strong>Add to Home Screen</strong></span></li>
        <li><i>3</i><span>Open My Financial Plan from your Home Screen</span></li>
        <li><i>4</i><span>Tap <strong>Enable notifications</strong> there</span></li>
      </ul>
      <div class="mfp-np-row"><button class="mfp-np-go" data-x>Got it</button></div>
      <p class="mfp-np-fine">Requires iOS 16.4 or later. Everything on the site works without this.</p></div>`;
  } else if (s === 'unsupported') {
    ov.innerHTML = `<div class="mfp-np-sh"><div class="ic">${BELL_T}</div>
      <h3>Notifications aren’t available here</h3>
      <p>${isInApp ? 'In-app browsers inside Instagram, Facebook and similar apps don’t support web notifications. Open the site in Chrome or Safari and try again.' : 'This browser doesn’t support web notifications. Everything else on the site works normally.'}</p>
      <div class="mfp-np-row"><button class="mfp-np-go" data-x>Close</button></div></div>`;
  } else if (s === 'denied') {
    ov.innerHTML = `<div class="mfp-np-sh"><div class="ic">${BELL_T}</div>
      <h3>Notifications are blocked</h3>
      <p>You previously blocked notifications for this site, so your browser won’t let us ask again. You can change it yourself:</p>
      <ul>
        <li><i>1</i><span>Tap the <strong>lock icon</strong> next to the address bar</span></li>
        <li><i>2</i><span>Find <strong>Notifications</strong></span></li>
        <li><i>3</i><span>Switch it to <strong>Allow</strong>, then reload</span></li>
      </ul>
      <div class="mfp-np-row"><button class="mfp-np-go" data-x>Close</button></div>
      <p class="mfp-np-fine">We won’t ask you again.</p></div>`;
  } else if (s === 'ok' && state() === 'subscribed') {
    ov.innerHTML = `<div class="mfp-np-sh"><div class="ic">${BELL_T}</div>
      <h3>Notifications are on</h3>
      <p>You’re subscribed on this device. You can choose categories or turn them off at any time.</p>
      <div class="mfp-np-row">
        <button class="mfp-np-ghost" data-off>Turn off</button>
        <button class="mfp-np-go" data-prefs>Settings</button>
      </div></div>`;
  } else {
    ov.innerHTML = `<div class="mfp-np-sh"><div class="ic">${BELL_T}</div>
      <h3>Turn on notifications?</h3>
      <p>We’ll send a short alert when something genuinely useful lands. You choose the categories, and you can turn them off at any time.</p>
      <ul>
        <li><i>✓</i><span>New calculators and money guides</span></li>
        <li><i>✓</i><span>Goal and planning reminders you have set yourself</span></li>
        <li><i>✓</i><span>Important website announcements</span></li>
      </ul>
      <div class="mfp-np-row">
        <button class="mfp-np-ghost" data-no>Not now</button>
        <button class="mfp-np-go" data-yes>Yes, enable</button>
      </div>
      <p class="mfp-np-fine">About once a month. No investment advice, no promises of returns, and never your personal financial details in a notification.</p></div>`;
  }

  document.body.appendChild(ov);

  const sh = $('.mfp-np-sh', ov);
  $('[data-x]', ov)     && ($('[data-x]', ov).onclick     = close);
  $('[data-prefs]', ov) && ($('[data-prefs]', ov).onclick = () => { location.href = PREFS_URL; });

  const no = $('[data-no]', ov);
  if (no) no.onclick = () => { writeLS(LS_SNOOZE, now() + SNOOZE_DAYS * 864e5); close(); render(); };

  const off = $('[data-off]', ov);
  if (off) off.onclick = async () => {
    off.disabled = true; off.textContent = 'Turning off…';
    await unsubscribe(); close(); render();
    toast('Notifications turned off', 'You can switch them back on whenever you like.', '');
  };

  const yes = $('[data-yes]', ov);
  if (yes) yes.onclick = async () => {
    yes.disabled = true; yes.textContent = 'Just a moment…';
    let perm = 'default';
    try { perm = await Notification.requestPermission(); } catch (_) { perm = Notification.permission; }

    if (perm !== 'granted') {
      sh.innerHTML = `<div class="ic">${BELL_T}</div><h3>No problem</h3>
        <p>Notifications stay off and the site works exactly as before. If you change your mind, the option is in the footer of every page.</p>
        <div class="mfp-np-row"><button class="mfp-np-go" data-x>Close</button></div>`;
      $('[data-x]', sh).onclick = () => { close(); render(); };
      return;
    }

    try {
      await subscribe();
      sh.innerHTML = `<div class="ic">${BELL_T}</div><h3>You’re all set</h3>
        <p>Notifications are on for this device. You can change categories or turn them off any time from the footer.</p>
        <div class="mfp-np-row">
          <button class="mfp-np-ghost" data-x>Done</button>
          <button class="mfp-np-go" data-prefs2>Choose categories</button>
        </div>`;
      $('[data-x]', sh).onclick = () => { close(); render(); };
      $('[data-prefs2]', sh).onclick = () => { location.href = PREFS_URL; };
    } catch (err) {
      log('subscribe failed', err);
      sh.innerHTML = `<div class="ic">${BELL_T}</div><h3>That didn’t work</h3>
        <p>We couldn’t finish setting up notifications on this device. Nothing else is affected — please try again later.</p>
        <div class="mfp-np-row"><button class="mfp-np-go" data-x>Close</button></div>`;
      $('[data-x]', sh).onclick = () => { close(); render(); };
    }
  };

  (sh.querySelector('.mfp-np-go') || sh).focus?.();
}

/* ── mounting ───────────────────────────────────────────────────────────── */
function mountFooter() {
  const bar = $('.mfp-sf-bar');
  if (!bar || $('#mfp-np-foot')) return;
  const st = state();
  if (st === 'unsupported') return;

  const b = document.createElement('button');
  b.id = 'mfp-np-foot';
  b.type = 'button';
  b.className = 'mfp-np-btn';
  b.innerHTML = BELL + '<span></span>';
  b.lastChild.textContent = st === 'subscribed' ? 'Notification settings'
                          : st === 'denied'     ? 'Notifications blocked'
                          : 'Enable notifications';
  b.onclick = openSheet;
  bar.appendChild(b);
}

function mountContextual() {
  if (state() !== 'askable') return;                       // only ask people we can ask
  const sn = readLS(LS_SNOOZE, 0);
  if (sn && now() < sn) return;                            // respected "Not now"
  if ($('#mfp-np-card')) return;

  /* Anchor BELOW the whole calculator card.

     Not inside it: `.calc` is a two-column grid (.calc-fields | .grid3), so an
     element appended within it becomes a third grid item and drops into the
     left column on the next row — beside the results rather than beneath them.
     Sitting after the card keeps it full width and clearly separate from the
     tool, which is also what the no-interference rule requires. */
  const anchor = $('.calc');
  if (!anchor || !anchor.parentElement) return;

  const card = document.createElement('div');
  card.id = 'mfp-np-card';
  card.className = 'mfp-np-card';
  card.innerHTML =
    `<div class="ic">${BELL_T}</div>
     <div class="tx"><b>Get told when we add a new calculator</b>
     <span>About once a month. No spam, no investment tips, unsubscribe in one tap.</span></div>
     <button class="mfp-np-go" type="button">Enable</button>
     <button class="mfp-np-x" type="button" aria-label="Dismiss">&times;</button>`;
  card.querySelector('.mfp-np-go').onclick = openSheet;
  card.querySelector('.mfp-np-x').onclick  = () => { writeLS(LS_SNOOZE, now() + SNOOZE_DAYS * 864e5); card.remove(); };

  anchor.insertAdjacentElement('afterend', card);
}

function render() {
  injectCss();
  const el = $('#mfp-np-foot'); if (el) el.remove();
  const c  = $('#mfp-np-card'); if (c) c.remove();
  if (PLACEMENT === 'off') return;
  if (PLACEMENT === 'both' || PLACEMENT === 'footer')     mountFooter();
  if (PLACEMENT === 'both' || PLACEMENT === 'contextual') mountContextual();
}

/* ── boot ───────────────────────────────────────────────────────────────── */
function boot() {
  try {
    render();
    if (state() === 'subscribed') { attachForeground(); refreshIfNeeded(); }

    navigator.serviceWorker?.addEventListener('message', (e) => {
      if (e.data?.type === 'mfp-push-resubscribe') refreshIfNeeded();
    });
  } catch (e) { log('boot failed', e); }   // never let push break a page
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* Exposed for the preferences page and for testing. */
window.MFPPush = {
  state, subscribe, unsubscribe, refreshIfNeeded, openSheet, installId,
  CATEGORIES, support,
  async setCategories(cats) {
    await fsWrite(installId(), { categories: cats, updatedAt: new Date().toISOString() });
    writeLS('mfp_push_cats', cats);
  },
  getCategories() { return readLS('mfp_push_cats', CATEGORIES.filter((c) => c.def && !c.partnerOnly).map((c) => c.id)); }
};

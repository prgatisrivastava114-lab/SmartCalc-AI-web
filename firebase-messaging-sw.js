/* ============================================================================
   MY FINANCIAL PLAN — Firebase Cloud Messaging service worker
   ----------------------------------------------------------------------------
   Scope: /  (root)

   SCOPE SAFETY — read before editing
   ----------------------------------
   This site already runs two other service workers:

     /vanshavali/sw.js                 scope /vanshavali/   offline asset cache
     /app/flutter_service_worker.js    scope /app/          Flutter engine cache

   Service worker scopes are longest-prefix-match, so a page under /vanshavali/
   is controlled by that worker and NOT by this one. This file must therefore
   never assume it controls a page. It does not claim clients, does not call
   skipWaiting(), and does not register any fetch handler — so it cannot
   intercept, cache or break a single request belonging to the other two.

   Its only jobs are: receive background pushes, draw the notification, and
   handle the click.

   The client registers this file explicitly and passes the registration to
   getToken({ serviceWorkerRegistration }), so the SDK never auto-discovers and
   hijacks one of the other workers.
   ========================================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  "apiKey": "AIzaSyA5Sc1oRm0E9qIkCgZhYeTxlqiUddVrBIc",
  "authDomain": "smartcalc-ai-638a9.firebaseapp.com",
  "projectId": "smartcalc-ai-638a9",
  "storageBucket": "smartcalc-ai-638a9.firebasestorage.app",
  "messagingSenderId": "548984348697",
  "appId": "1:548984348697:web:cba90544a074784ac5ca88"
});

const messaging = firebase.messaging();

const ORIGIN   = self.location.origin;
const ICON     = '/assets/icons/icon-192.png';
const BADGE    = '/assets/icons/badge-96.png';
const FALLBACK = '/';

/* ---------------------------------------------------------------------------
   Same-origin guard.
   A notification's destination comes from a Firestore campaign document. Even
   though the Cloud Function validates it on the way in, this is the last line
   of defence before a user is navigated somewhere. Anything that is not an
   http(s) URL on this exact origin is discarded and replaced with the home
   page. Protocol-relative ("//evil.com") and javascript: URLs are rejected
   here, not sanitised.
   ------------------------------------------------------------------------- */
function safeUrl(raw) {
  if (!raw || typeof raw !== 'string') return FALLBACK;
  const v = raw.trim();
  if (!v || v.startsWith('//')) return FALLBACK;
  try {
    const u = new URL(v, ORIGIN);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return FALLBACK;
    if (u.origin !== ORIGIN) return FALLBACK;
    return u.pathname + u.search + u.hash;
  } catch (_) {
    return FALLBACK;
  }
}

/* Strip anything that could be used to fake a system message or inject markup
   into the notification shade. Length caps mirror the server-side validator. */
function clean(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, max);
}

/* ---------------------------------------------------------------------------
   Background messages.

   The Cloud Function sends DATA-ONLY payloads on purpose. If a `notification`
   block were included, Chrome would auto-render it AND fire this handler,
   producing two notifications for one send. Data-only means we draw it exactly
   once, here, with full control over icon, badge, tag and actions.
   ------------------------------------------------------------------------- */
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};

  const title = clean(d.title, 80)  || 'My Financial Plan';
  const body  = clean(d.body, 240)  || '';
  const url   = safeUrl(d.url);

  /* `tag` collapses repeats: a re-sent campaign replaces its own notification
     instead of stacking a second copy in the shade. */
  const tag = clean(d.campaignId, 64) || 'mfp-general';

  const options = {
    body,
    icon: ICON,
    badge: BADGE,
    tag,
    renotify: false,
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    data: { url, campaignId: tag, category: clean(d.category, 40) },
    actions: [{ action: 'open', title: 'Open' }]
  };

  const img = clean(d.image, 400);
  if (img && safeUrl(img) !== FALLBACK) options.image = img;

  return self.registration.showNotification(title, options);
});

/* ---------------------------------------------------------------------------
   Click handling.
   Prefer focusing a tab that is already open on this origin over spawning a
   duplicate. If one exists, navigate it; otherwise open a new window.
   ------------------------------------------------------------------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action && event.action !== 'open') return;

  const target = safeUrl((event.notification.data || {}).url);

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const c of all) {
      let same = false;
      try { same = new URL(c.url).origin === ORIGIN; } catch (_) {}
      if (!same) continue;
      try {
        await c.focus();
        if ('navigate' in c) await c.navigate(target);
        return;
      } catch (_) { /* fall through to openWindow */ }
    }

    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});

/* Record dismissals so engagement can be judged honestly rather than by
   delivery count alone. Fire-and-forget; never blocks. */
self.addEventListener('notificationclose', (event) => {
  const d = event.notification.data || {};
  if (!d.campaignId) return;
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((cs) => cs.forEach((c) =>
      c.postMessage({ type: 'mfp-push-dismissed', campaignId: d.campaignId })));
});

/* ---------------------------------------------------------------------------
   Browser-initiated subscription rotation.
   Chrome can replace a push subscription without the page being open. The page
   cannot react because it is not running, so flag it for the next page load.
   ------------------------------------------------------------------------- */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    cs.forEach((c) => c.postMessage({ type: 'mfp-push-resubscribe' }));
  })());
});

/* Deliberately absent: skipWaiting(), clients.claim(), and any 'fetch'
   listener. A new version activates only once every tab using the old one has
   closed, which is the safe default, and this worker never touches network
   traffic belonging to the Vanshavali or Flutter workers. */

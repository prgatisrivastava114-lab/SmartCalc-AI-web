/* ============================================================================
   MyFinancialPlan.in — GRAND LAUNCH CURTAIN  (temporary feature, isolated)
   File: /curtain.js  ·  Included from index.html via ONE line
       (script src="/curtain.js" defer — see index.html tail)
   Config doc (existing Firebase project, public read / owner write):
       config/grandLaunch  { status:'draft|scheduled|live|paused',
                             launchAt:<ms epoch UTC>, tz, headline, sub, updatedAt }
   Admin preview (no DB change):  /?mfpCurtain=closed   /?mfpCurtain=open
   REMOVAL: delete this file + the one script tag in index.html + the
   "🎬 Launch" tab block in admin/index.html. No data is touched.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__mfpCurtain) return; window.__mfpCurtain = 1;

  var API_KEY = 'AIzaSyA5Sc1oRm0E9qIkCgZhYeTxlqiUddVrBIc';
  var FS_DOC = 'https://firestore.googleapis.com/v1/projects/smartcalc-ai-638a9/databases/(default)/documents/config/grandLaunch?key=' + API_KEY;
  var OPEN_MS = 6500;                 /* cinematic curtain opening (~5–8s) */
  /* ── TEMPORARY built-in default schedule (owner pre-set): 19 Oct 2026, 11:45 AM IST.
     Sirf tab chalta hai jab Firestore config/grandLaunch doc MAUJOOD na ho.
     Admin panel se pehla Save aate hi wahi config final ho jata hai (ye default hat jata hai). ── */
  var FALLBACK = { status: 'scheduled', launchAt: 1792390500000, headline: '', sub: '' }; /* 2026-10-19 11:45:00 +05:30 */
  var DEFAULT_HEAD = 'A New Beginning for Your Financial Future';
  var DEFAULT_SUB = 'Plan Today. Secure Tomorrow.';

  function dec(v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return parseInt(v.integerValue, 10);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    return null;
  }
  function qp(n) { var m = location.search.match(new RegExp('[?&]' + n + '=([^&]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function pad(n) { n = Math.max(0, n | 0); return (n < 10 ? '0' : '') + n; }

  /* ---------- CSS (self-injected) ---------- */
  var CSS = ''
    + 'html.mfp-curtain-locked,html.mfp-curtain-locked body{overflow:hidden!important;height:100%!important}'
    + '#mfpCurtain{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#12030a;'
    + 'font-family:"Playfair Display",Georgia,"Times New Roman",serif;'
    + 'transition:background 1.8s ease .2s}'
    + '#mfpCurtain.mc-opening{background:transparent}'
    + '#mfpCurtain.mc-fade{opacity:0;transition:opacity .85s ease}'
    /* — velvet panels — */
    + '#mfpCurtain .mc-panel{position:absolute;top:0;bottom:0;width:51.5vw;z-index:4;will-change:transform,filter;'
    + 'transition:transform ' + OPEN_MS + 'ms cubic-bezier(.72,.02,.28,1),filter ' + OPEN_MS + 'ms ease;'
    + 'background:'
    + 'linear-gradient(180deg,rgba(0,0,0,.62) 0,rgba(0,0,0,0) 90px,rgba(0,0,0,0) calc(100% - 110px),rgba(0,0,0,.72) 100%),'
    + 'repeating-linear-gradient(90deg,#3a040a 0,#6d0b16 12px,#9c1523 34px,#7c0f1c 58px,#570912 80px,#3a040a 96px)}'
    + '#mfpCurtain .mc-panel::after{content:"";position:absolute;inset:0;pointer-events:none;'
    + 'background:linear-gradient(115deg,transparent 38%,rgba(255,210,170,.07) 50%,transparent 62%)}'
    + '#mfpCurtain .mc-left{left:-1vw;transform-origin:left center;box-shadow:inset -42px 0 54px -18px rgba(0,0,0,.75)}'
    + '#mfpCurtain .mc-right{right:-1vw;transform-origin:right center;box-shadow:inset 42px 0 54px -18px rgba(0,0,0,.75)}'
    /* — top valance (swag) + gold rod — */
    + '#mfpCurtain .mc-valance{position:absolute;top:0;left:0;right:0;height:118px;z-index:6;will-change:transform;'
    + 'transition:transform ' + (OPEN_MS - 1200) + 'ms cubic-bezier(.72,.02,.28,1) .35s;'
    + 'background:'
    + 'radial-gradient(60px 46px at 60px 0,transparent 86%,#f0bd55 87.5% 94%,transparent 95.5%) 0 0/120px 60px repeat-x,'
    + 'radial-gradient(60px 46px at 60px 0,#7c1222 95%,transparent 96%) 0 0/120px 60px repeat-x,'
    + 'linear-gradient(180deg,#8d1424 0,#5c0a16 78%,#470610 100%);'
    + 'box-shadow:0 10px 30px rgba(0,0,0,.55)}'
    + '#mfpCurtain .mc-rod{position:absolute;top:0;left:-2vw;right:-2vw;height:14px;z-index:7;'
    + 'transition:transform ' + (OPEN_MS - 1200) + 'ms ease .35s;'
    + 'background:linear-gradient(180deg,#f7dd8b 0,#caa14a 45%,#8a5f16 100%);box-shadow:0 3px 10px rgba(0,0,0,.6)}'
    + '#mfpCurtain .mc-rod::before,#mfpCurtain .mc-rod::after{content:"";position:absolute;top:-7px;width:28px;height:28px;'
    + 'border-radius:50%;background:radial-gradient(circle at 34% 30%,#ffe9ad,#caa14a 58%,#7a5410);box-shadow:0 3px 8px rgba(0,0,0,.55)}'
    + '#mfpCurtain .mc-rod::before{left:2.5vw}#mfpCurtain .mc-rod::after{right:2.5vw}'
    /* — golden glow behind centre seam — */
    + '#mfpCurtain .mc-glow{position:absolute;top:0;bottom:0;left:50%;width:8px;margin-left:-4px;z-index:3;'
    + 'background:linear-gradient(180deg,transparent,rgba(255,214,120,.55) 30%,rgba(255,224,150,.65) 50%,rgba(255,214,120,.55) 70%,transparent);'
    + 'filter:blur(6px);opacity:.5;transition:all 5.6s ease .3s;will-change:transform,opacity;'
    + 'animation:mcPulse 3.8s ease-in-out infinite}'
    + '@keyframes mcPulse{0%,100%{opacity:.32}50%{opacity:.62}}'
    /* — centre content — */
    + '#mfpCurtain .mc-center{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;'
    + 'justify-content:center;text-align:center;padding:24px 18px;transition:opacity .9s ease .05s,transform .9s ease .05s;'
    + 'text-shadow:0 2px 14px rgba(0,0,0,.65);max-height:100%;overflow-y:auto}'
    + '#mfpCurtain .mc-logo{width:84px;height:84px;border-radius:50%;object-fit:cover;border:3px solid #f0bd55;'
    + 'box-shadow:0 0 0 4px rgba(240,189,85,.25),0 10px 30px rgba(0,0,0,.6);background:#2a060c}'
    + '#mfpCurtain .mc-badge{width:84px;height:84px;border-radius:50%;border:3px solid #f0bd55;display:flex;align-items:center;'
    + 'justify-content:center;font-size:40px;font-weight:800;color:#f0bd55;background:radial-gradient(circle at 32% 28%,#7c1222,#3a040a);'
    + 'box-shadow:0 0 0 4px rgba(240,189,85,.25),0 10px 30px rgba(0,0,0,.6)}'
    + '#mfpCurtain .mc-kicker{margin:20px 0 6px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#e8c47a;'
    + 'font-family:Georgia,serif;font-weight:600}'
    + '#mfpCurtain .mc-head{margin:0;max-width:820px;font-size:clamp(24px,5.6vw,52px);line-height:1.18;font-weight:800;'
    + 'background:linear-gradient(180deg,#ffe9ad 10%,#f0bd55 55%,#caa14a 90%);-webkit-background-clip:text;background-clip:text;color:transparent}'
    + '#mfpCurtain .mc-sub{margin:10px 0 0;font-size:clamp(13px,2.6vw,19px);font-style:italic;color:#f4e3c2;opacity:.92;'
    + 'font-family:Georgia,serif}'
    + '#mfpCurtain .mc-count{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:26px 0 6px}'
    + '#mfpCurtain .mc-cell{min-width:66px;padding:10px 8px 8px;border-radius:12px;background:rgba(10,2,5,.55);'
    + 'border:1px solid rgba(240,189,85,.45);box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}'
    + '#mfpCurtain .mc-num{display:block;font-size:clamp(22px,6vw,44px);font-weight:800;color:#ffe9ad;font-variant-numeric:tabular-nums;'
    + 'font-family:"Playfair Display",Georgia,serif;line-height:1}'
    + '#mfpCurtain .mc-lab{display:block;margin-top:5px;font-size:10px;letter-spacing:2.5px;color:#d9b36a;text-transform:uppercase;'
    + 'font-family:Georgia,serif}'
    + '#mfpCurtain .mc-note{font-size:11.5px;color:#e9d5ae;opacity:.75;letter-spacing:1.4px;text-transform:uppercase;'
    + 'font-family:Georgia,serif;margin-top:14px}'
    /* — OPENING state — */
    + '#mfpCurtain.mc-opening .mc-left{transform:translateX(-112%) scaleX(.58);filter:brightness(1.14)}'
    + '#mfpCurtain.mc-opening .mc-right{transform:translateX(112%) scaleX(.58);filter:brightness(1.14)}'
    + '#mfpCurtain.mc-opening .mc-valance{transform:translateY(-135%)}'
    + '#mfpCurtain.mc-opening .mc-rod{transform:translateY(-160%)}'
    + '#mfpCurtain.mc-opening .mc-center{opacity:0;transform:scale(1.07);pointer-events:none}'
    + '#mfpCurtain.mc-opening .mc-glow{opacity:.95;width:120vw;margin-left:-60vw;filter:blur(60px)}'
    /* — reduced motion: simple dignified fade — */
    + '@media (prefers-reduced-motion:reduce){'
    + '#mfpCurtain .mc-panel,#mfpCurtain .mc-valance,#mfpCurtain .mc-rod,#mfpCurtain .mc-center,#mfpCurtain .mc-glow{transition:opacity .8s ease!important}'
    + '#mfpCurtain.mc-opening .mc-left,#mfpCurtain.mc-opening .mc-right{transform:none;opacity:0;filter:none}'
    + '#mfpCurtain.mc-opening .mc-valance,#mfpCurtain.mc-opening .mc-rod{transform:none;opacity:0}'
    + '#mfpCurtain.mc-opening .mc-glow{opacity:0}'
    + '}'
    + '@media (max-width:420px){#mfpCurtain .mc-cell{min-width:58px}}';

  /* ---------- DOM ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build(cfg, nowFn) {
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);
    try { /* premium serif (graceful offline fallback) */
      var lk = document.createElement('link'); lk.rel = 'stylesheet';
      lk.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,500&display=swap';
      document.head.appendChild(lk);
    } catch (_) {}

    var ov = el('div'); ov.id = 'mfpCurtain';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Grand launch countdown — website opens soon');

    var glow = el('div', 'mc-glow');
    var panL = el('div', 'mc-panel mc-left');
    var panR = el('div', 'mc-panel mc-right');
    var val = el('div', 'mc-valance');
    var rod = el('div', 'mc-rod');
    var mid = el('div', 'mc-center');

    var logo = new Image(); logo.className = 'mc-logo'; logo.alt = 'MyFinancialPlan.in';
    logo.src = '/assets/brand/mfp_icon.png';
    var logoBox = el('div');
    logo.onerror = function () { logo.remove(); logoBox.appendChild(el('div', 'mc-badge', '₹')); };
    logoBox.appendChild(logo);

    var head = (cfg.headline || DEFAULT_HEAD), sub = (cfg.sub || DEFAULT_SUB);
    mid.appendChild(logoBox);
    mid.appendChild(el('div', 'mc-kicker', 'MyFinancialPlan.in &nbsp;•&nbsp; Grand Launch'));
    mid.appendChild(el('h1', 'mc-head', head.replace(/</g, '&lt;')));
    mid.appendChild(el('p', 'mc-sub', sub.replace(/</g, '&lt;')));

    var count = el('div', 'mc-count');
    var cells = {};
    ['Days', 'Hours', 'Mins', 'Secs'].forEach(function (k) {
      var c = el('div', 'mc-cell');
      var n = el('span', 'mc-num', '00'); var l = el('span', 'mc-lab', k);
      c.appendChild(n); c.appendChild(l); count.appendChild(c); cells[k] = n;
    });
    mid.appendChild(count);
    mid.appendChild(el('div', 'mc-note', 'The curtain rises soon'));

    ov.appendChild(glow); ov.appendChild(panL); ov.appendChild(panR);
    ov.appendChild(val); ov.appendChild(rod); ov.appendChild(mid);
    (document.body || document.documentElement).appendChild(ov);
    document.documentElement.classList.add('mfp-curtain-locked');

    var opened = false;
    function open() {
      if (opened) return; opened = true;
      ov.classList.add('mc-opening');
      var reduced = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      var dur = reduced ? 0 : OPEN_MS;
      setTimeout(function () { ov.classList.add('mc-fade'); }, reduced ? 150 : dur - 800);
      setTimeout(function () {
        ov.remove(); st.remove();
        document.documentElement.classList.remove('mfp-curtain-locked');
        clearInterval(timer);
      }, reduced ? 1100 : dur + 150);
    }
    function tick() {
      var left = cfg.launchAt - nowFn();
      if (left <= 0) {
        cells.Days.textContent = '00'; cells.Hours.textContent = '00';
        cells.Mins.textContent = '00'; cells.Secs.textContent = '00';
        open(); return;
      }
      var s = Math.floor(left / 1000);
      cells.Days.textContent = pad(Math.floor(s / 86400));
      cells.Hours.textContent = pad(Math.floor(s % 86400 / 3600));
      cells.Mins.textContent = pad(Math.floor(s % 3600 / 60));
      cells.Secs.textContent = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 250);
  }

  /* ---------- boot ---------- */
  (async function init() {
    var mode = qp('mfpCurtain');            /* admin preview overrides — no DB writes */
    var demo = window.__mfpCurtainDemo;     /* offline demo hook */
    var cfg = null;

    if (demo) { cfg = demo; }
    else {
      try {
        var r = await fetch(FS_DOC, { cache: 'no-store' });
        if (r.ok) {
          var d = await r.json(), f = d.fields || {};
          cfg = {};
          for (var k in f) cfg[k] = dec(f[k]);
        }
      } catch (_) { /* offline → fail open, site normal */ }
      if (mode === 'closed' || mode === 'open') {
        cfg = cfg || { status: 'scheduled' };
        cfg.status = 'scheduled';
      }
      var haveDoc = !!cfg;
      if (cfg && (cfg.status !== 'scheduled' || (!cfg.launchAt && !mode))) cfg = null;   /* draft/live/paused/malformed → off */
      /* server clock aa chuka: niche offset ke baad fallback apply hoga (haveDoc flag use karke) */
    }

    /* trusted server clock: same-origin HEAD → Date header (GitHub Pages CDN).
       Device clock alone is never trusted; fallback to it only if fetch fails. */
    var offset = 0;
    try {
      var h = await fetch(location.pathname, { method: 'HEAD', cache: 'no-store' });
      var dh = h.headers && h.headers.get('date');
      if (dh) { var o = Date.parse(dh) - Date.now(); if (isFinite(o) && Math.abs(o) < 86400000) offset = o; }
    } catch (_) {}
    var nowFn = function () { return Date.now() + offset; };

    if (!cfg && !haveDoc && !mode && FALLBACK.launchAt > nowFn()) cfg = FALLBACK; /* built-in default schedule */
    if (!cfg) return;

    if (mode === 'open') cfg.launchAt = nowFn() + 1800;               /* test opening now */
    else if (mode === 'closed' && (!cfg.launchAt || cfg.launchAt <= nowFn())) cfg.launchAt = nowFn() + 3600000; /* force closed view */
    if (!cfg.launchAt) return;
    if (nowFn() >= cfg.launchAt && mode !== 'closed' && !demo) return; /* already launched → direct site */

    build(cfg, nowFn);
  })();
})();

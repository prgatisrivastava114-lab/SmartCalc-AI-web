/* ============================================================================
   MyFinancialPlan — Content Protection Engine
   ----------------------------------------------------------------------------
   This file contains NO security policy. No levels, no switches, no rules.
   It is only an execution engine: it fetches an issued policy from the
   backend, unframes it, and carries out whatever that policy instructs.
   The policy itself lives in the backend and can be changed at any time
   without touching or redeploying this site.
   ============================================================================ */
(function () {
  'use strict';

  /* --- transport identities (opaque) --------------------------------------- */
  var _p = 'c21hcnRjYWxjLWFpLTYzOGE5';
  var _k = 'QUl6YVN5QTVTYzFvUm0wRTlxSWtDZ1poWWVUeGxxaVVkZFZyQklj';
  var _c = 'Y29uZmlnL3NlY3VyaXR5';
  var _s = 'bWZwLnNjLjlmMy0yYzdhMWU1Yg==';

  /* --- sealed default profile --------------------------------------------- */
  /* Applied instantly so the page is never exposed, then replaced by the
     policy the backend issues. Opaque by design. */
  var _d = '2.ZKsZyyo_czxLljP8N8W0r1mila4K8pl2f_uoCnw5Dn71BpB4A86dTtEzZ_dO-Pt8syuxo3iMW6PXihiwjXyQKqCYllzBDe5nUQfDkictMctgkZ7ZSGEh5SUg_YIU4m23RZOApPcs4gyEW4XuEslCYelCQ3tFTIcYtybGb4PB0QrgXpeq9jGJOMjTH0ZxCZGKCmbZ35chwIcVnIZcdgq2vVinIDR9ljObY3Vev4fPgbJrczCwRU6_ZRnsVYjjHBv5tPClNS9NJ2qowIywt5VSd-eqkQ7iUYx0Txk85KvWr62xKqhUZ8PSokAY7VOmN0wQHTMVgHKPFHb7_AnQG8YnqlRz_-DtfBe0wJOTmvYMImT8DbB7TTT8XQ98ozwafaYqXOHGzHn8PQu5aIeUxSehPrYXaRrgRuLb1UV3p0Tj-fVm5KIicoXFUiKcz_VndLDgooPhK27BQ5OZzR_uURfBGMRpNBoydKzCyJhtkrr2yoq-IXQvcu5SrTqGcLG4VUNiezzJSEEAibt6w2XXiQ01uZW7te0yq3MGX3gPzkT93HSsX5ChgBfaDtg_8neZtaY_TAJdkNsruufSeapyD1ocaAwwaVj5OnVf0wIPlnbAZmG_c_GLXKyKs-lWhHtR1or-p5qPoF4jFGDrHiJQZl2DyhCadhGeK54zrBOr7-6l9WFqgKjVttddWZKQcbovYt-aTsjxUSNJnKeqLJoWzveO9dCWx3U8xnMGR6TQE3TEl4lJXnieyK6sNcxjsiFLHc1m6ScVOt-7vuuDymZQBPviGDjOZHWpB7A1uSgnex-DyiW335jMUVAwhJE8L7r0lT6RQtUtXRvlqCsSeIsSil5uDYxGlvSZkE5S5-cTur_TfpQVGV_B6edUtN3jWF7fYYkVxpJqqv_Tx-5RDaVgF7HGyC4VDWaOwOF2iWrOJrWvWWBPR5Ml8-M1dXAsdD8MxGiGX2uVCbQIYANkS8nbvJxOY--vXn3o_Hjw5-od8Huczpz7T2ojW82nwzFpU34Nhwt3YkGnvlu4v35QyPFXQ4SB-bbLrO8Vmjx_azOJZhcERuJARtnAlCT_l06oSZlZLC-l1Dy9KSQ4K0zTR5ehcaQiSjKLU8eOpVUyCGgHhtZbyUrdF439BsmIFTj1mQ04rve1G2-ejhSjW--OXUAd14SkpVz0Y3fO5-JhbTe4Rx0MeePtjgs1sb2ptKsHj-svw9evtPRDYk9GUD4F-e-iE0FGp_awcoASoc9dOYiGY_q4mzo1x3VqrfU-f3MFz60.132160';

  var _n = 'MyFinancialPlan.in';
  var _q = 'mfp_sp';
  var _r = 'mfp_vid';

  var S = null, G = { on: false, nodes: [], v: 0, pol: null };

  /* --- helpers ------------------------------------------------------------- */
  function dec(x) {
    var b = atob(x), o = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
    return new TextDecoder().decode(o);
  }
  function ub(x) {
    x = String(x).replace(/-/g, '+').replace(/_/g, '/');
    while (x.length % 4) x += '=';
    var b = atob(x), o = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
    return o;
  }
  function f1(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }
  function ks(seed) {
    var s = seed >>> 0 || 0x9e3779b9, q = [], i = 0;
    return function (n) {
      while (q.length < n - i) {
        s ^= (s << 13); s >>>= 0;
        s ^= (s >>> 17);
        s ^= (s << 5);  s >>>= 0;
        q.push(s & 0xff);
      }
      var o = q.slice(i, i + n);
      return o;
    };
  }
  function open(blob) {
    try {
      var a = String(blob).split('.');
      if (a.length !== 3 || a[0] !== '2') return null;
      var e = String(f1(dec(_s) + '|' + a[1])).toString(36);
      while (e.length < 6) e = '0' + e;
      if (e.slice(0, 6) !== a[2]) return null;
      var x = ub(a[1]);
      var k = ks(f1(dec(_s)))(x.length);
      var o = new Uint8Array(x.length);
      for (var i = 0; i < x.length; i++) o[i] = x[i] ^ k[i];
      var p = JSON.parse(new TextDecoder().decode(o));
      return (p && typeof p === 'object') ? p : null;
    } catch (err) { return null; }
  }

  /* --- identity for the forensic mark -------------------------------------- */
  function who() {
    var id = '', us = '';
    try {
      id = localStorage.getItem(_r) || '';
      if (!id) {
        id = 'V-' + Math.random().toString(36).slice(2, 8).toUpperCase() +
             Date.now().toString(36).slice(-4).toUpperCase();
        localStorage.setItem(_r, id);
      }
      us = localStorage.getItem('mfp_user_email') ||
           localStorage.getItem('mfp_user_phone') ||
           localStorage.getItem('userEmail') || '';
    } catch (e) {}
    return { i: id, u: us ? '  •  ' + us : '' };
  }

  /* --- teardown ------------------------------------------------------------ */
  function clear() {
    try {
      G.nodes.forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
      (G.h || []).forEach(function (h) {
        h[0].removeEventListener(h[1], h[2], h[3]);
      });
    } catch (e) {}
    G.nodes = []; G.h = []; G.on = false;
    G.toast = null;   /* rebuilt lazily — never reuse a detached node */
  }
  function add(el) { if (el) { document.body.appendChild(el); G.nodes.push(el); } }
  function hook(t, e, f, o) {
    t.addEventListener(e, f, o);
    (G.h = G.h || []).push([t, e, f, o]);
  }

  /* --- messages come from the policy --------------------------------------- */
  function msg(p, k, fb) { return (p.m && p.m[k]) || fb || ''; }

  var timer = null;
  function say(p, text) {
    if (!p || !text) return;
    var el = G.toast;
    if (!el) {
      el = document.createElement('div');
      el.style.cssText =
        'position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);z-index:2147483646;' +
        'background:#0B3B2E;color:#fff;padding:12px 20px;border-radius:14px;max-width:88vw;' +
        'text-align:center;pointer-events:none;opacity:0;transition:opacity .22s,transform .22s;' +
        'font:700 13.5px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
        'box-shadow:0 12px 32px rgba(0,0,0,.32);';
      add(el);
      G.toast = el;
    }
    el.textContent = text;
    requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)'; });
    clearTimeout(timer);
    timer = setTimeout(function () { el.style.opacity = '0'; el.style.transform = 'translate(-50%,20px)'; },
      p.tt || 2400);
  }

  /* --- build --------------------------------------------------------------- */
  function build(p) {
    clear();
    G.pol = p; G.on = true;

    var ex = p.ex || 'input,textarea,select';
    var cap = p.caps || {};
    function safe(t) { try { return t && t.closest && !!t.closest(ex); } catch (e) { return false; } }

    /* ---- styling ---- */
    var css = '';
    if (cap.cp) {
      css += 'html,body,body *:not(input):not(textarea):not(select):not([contenteditable="true"]):not(.mfp-copyable):not([data-mfp-copy])' +
             '{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;' +
             'user-select:none!important;-webkit-touch-callout:none!important;-webkit-user-drag:none!important}' +
             'img,svg,video,canvas{-webkit-user-drag:none!important}' +
             '::selection{background:transparent!important;color:inherit!important}' +
             '::-moz-selection{background:transparent!important;color:inherit!important}' +
             'input,textarea,select,[contenteditable="true"],.mfp-copyable,[data-mfp-copy]' +
             '{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}';
    }
    if (cap.pr) {
      css += '@media print{body>div:not(#mfp-pg){display:none!important}body>section:not(#mfp-pg){display:none!important}' +
             '#mfp-pg{display:block!important;position:static!important;padding:90px 24px;text-align:center;' +
             'font:700 19px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0B3B2E}}';
    }
    if (css) {
      var st = document.createElement('style');
      st.textContent = css;
      (document.head || document.documentElement).appendChild(st);
      G.nodes.push(st);
    }

    /* ---- print notice ---- */
    if (cap.pr) {
      var pg = document.createElement('div');
      pg.id = 'mfp-pg';
      pg.style.display = 'none';
      pg.innerHTML = '<div style="font-size:44px">🔒</div>' +
        '<div style="margin-top:14px">' + esc(msg(p, 'pt', '🔒 This report is protected.')) + '</div>' +
        '<div style="margin-top:8px;font-weight:500;font-size:15px;color:#475569">' +
        esc(msg(p, 'sd', '')) + '</div>';
      add(pg);
    }

    /* ---- copy / selection / context ---- */
    if (cap.cp) {
      ['copy', 'cut'].forEach(function (e) {
        hook(document, e, function (ev) {
          if (safe(ev.target)) return;
          ev.preventDefault(); ev.stopPropagation();
          try { if (ev.clipboardData) ev.clipboardData.setData('text/plain', '© ' + _n); } catch (x) {}
          say(p, msg(p, 'cp', '🔒 Copying is not allowed.'));
        }, true);
      });
      ['selectstart', 'dragstart'].forEach(function (e) {
        hook(document, e, function (ev) { if (!safe(ev.target)) ev.preventDefault(); }, true);
      });
      hook(document, 'touchstart', function (ev) {
        if (!safe(ev.target) && ev.target && ev.target.tagName === 'IMG') {
          ev.target.style.webkitTouchCallout = 'none';
        }
      }, { capture: true, passive: true });
    }
    if (cap.rc) {
      hook(document, 'contextmenu', function (ev) {
        if (safe(ev.target)) return;
        ev.preventDefault();
        say(p, msg(p, 'rc', '🔒 Right-click is disabled.'));
      }, true);
    }

    /* ---- keys ---- */
    hook(document, 'keydown', function (ev) {
      var k = (ev.key || '').toLowerCase();
      var c = ev.ctrlKey || ev.metaKey;

      if (k === 'printscreen') {
        if (cap.ps) {
          try { navigator.clipboard.writeText(''); } catch (x) {}
          say(p, msg(p, 'ps', '📸 Screenshot detected.'));
        }
        return;
      }
      if (!c) {
        if (cap.dv && ev.key === 'F12') { ev.preventDefault(); say(p, msg(p, 'dv', '🔒 Dev tools disabled.')); }
        return;
      }
      if (cap.cp && (k === 'c' || k === 'x' || k === 'a') && !safe(ev.target)) {
        ev.preventDefault(); ev.stopPropagation();
        say(p, msg(p, 'cp', '🔒 Copying is not allowed.'));
        return;
      }
      if (cap.pr && k === 'p') { ev.preventDefault(); ev.stopPropagation(); say(p, msg(p, 'pr', '🔒 Printing restricted.')); return; }
      if (cap.sv && k === 's') { ev.preventDefault(); say(p, msg(p, 'sv', '🔒 Saving this page is not allowed.')); return; }
      if (cap.dv && (k === 'u' || ((k === 'i' || k === 'j') && ev.shiftKey))) {
        ev.preventDefault(); ev.stopPropagation();
        say(p, msg(p, 'dv', '🔒 Dev tools disabled.'));
      }
    }, true);

    /* ---- focus shield ---- */
    if (cap.bl) {
      var sh = null;
      function shield(on) {
        if (on) {
          if (!sh) {
            sh = document.createElement('div');
            sh.style.cssText =
              'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
              'background:rgba(11,59,46,.965);color:#fff;text-align:center;padding:24px;' +
              '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);' +
              'font:800 16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
            sh.innerHTML = '<div><div style="font-size:44px">🔒</div>' +
              '<div style="margin-top:12px">' + esc(_n) + '</div>' +
              '<div style="margin-top:8px;font-weight:500;font-size:13.5px;color:#A7D9C9">' +
              esc(msg(p, 'sw', '')) + '</div></div>';
            add(sh);
          }
          sh.style.display = 'flex';
        } else if (sh) { sh.style.display = 'none'; }
      }
      hook(window, 'blur', function () { shield(true); });
      hook(window, 'focus', function () { shield(false); });
      hook(document, 'visibilitychange', function () { shield(!!document.hidden); });
      hook(document, 'click', function () { shield(false); });
      if (!cap.pr) { hook(window, 'beforeprint', function () { shield(true); }); hook(window, 'afterprint', function () { shield(false); }); }
      G.shield = shield;
    }

    /* ---- forensic mark ---- */
    if (cap.wm) {
      var w = who();
      var d = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      var line = String(p.wmt || '{s} • {i}{u} • {d}')
        .replace('{s}', _n).replace('{i}', w.i).replace('{u}', w.u).replace('{d}', d);
      var t = esc(line.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="320">' +
        '<text x="0" y="60" transform="rotate(-27 0 60)" font-family="system-ui,sans-serif" font-size="15" ' +
        'font-weight="700" fill="rgba(11,59,46,0.085)" letter-spacing="0.5">' + t + '</text>' +
        '<text x="0" y="220" transform="rotate(-27 0 220)" font-family="system-ui,sans-serif" font-size="15" ' +
        'font-weight="700" fill="rgba(11,59,46,0.085)" letter-spacing="0.5">' + t + '</text></svg>';
      var wm = document.createElement('div');
      wm.setAttribute('aria-hidden', 'true');
      wm.style.cssText = 'position:fixed;inset:0;z-index:2147483645;pointer-events:none;opacity:.9;' +
        '-webkit-print-color-adjust:exact;print-color-adjust:exact;background-repeat:repeat;background-size:520px 320px;' +
        'background-image:url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
      add(wm);
    }

    /* ---- visible marker ---- */
    if (cap.bg) {
      var bd = document.createElement('div');
      bd.style.cssText = 'position:fixed;right:10px;bottom:78px;z-index:2147483644;pointer-events:none;' +
        'background:rgba(11,59,46,.82);color:#CFF3E6;padding:5px 11px;border-radius:99px;' +
        'font:700 10.5px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.22)';
      bd.textContent = '🔒';
      add(bd);
    }

    /* ---- native container ---- */
    try {
      var a = window.MFPSecure || window.AndroidSecure;
      if (a && typeof a.enableSecureScreen === 'function') a.enableSecureScreen();
    } catch (e) {}
  }
  function esc(s) { return String(s == null ? '' : s); }

  /* --- acquisition --------------------------------------------------------- */
  function cached() {
    try {
      var r = sessionStorage.getItem(_q);
      if (!r) return null;
      var o = JSON.parse(r);
      if (!o || !o.b) return null;
      var p = open(o.b);
      if (!p) return null;
      if (Date.now() - o.t > (p.ttl || 300) * 1000) return null;
      return p;
    } catch (e) { return null; }
  }
  function remember(blob) {
    try { sessionStorage.setItem(_q, JSON.stringify({ t: Date.now(), b: blob })); } catch (e) {}
  }
  function url() {
    return 'https://firestore.googleapis.com/v1/projects/' + dec(_p) +
           '/databases/(default)/documents/' + dec(_c) + '?key=' + dec(_k);
  }
  function readField(j) {
    return j && j.fields && j.fields.b && (j.fields.b.stringValue || j.fields.b.referenceValue) || null;
  }
  function also(j) { return j && j.fields && j.fields.fn && j.fields.fn.stringValue || ''; }

  function run() {
    var c = cached();
    if (c) { build(c); return; }
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var to = setTimeout(function () { try { ctl && ctl.abort(); } catch (e) {} }, 4000);

    fetch(url(), ctl ? { signal: ctl.signal, cache: 'no-store' } : { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        clearTimeout(to);
        var blob = readField(j);
        if (!blob) return;
        var p = open(blob);
        if (!p) return;
        remember(blob);
        var fn = also(j);
        if (fn) {
          fetch(fn, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ r: document.referrer || '', p: location.pathname || '/', m: p.where || null })
          }).then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
            var b2 = x && (x.b || x.blob);
            var p2 = b2 ? open(b2) : null;
            if (p2) { build(p2); remember(b2); } else { build(p); }
          }).catch(function () { build(p); });
        } else {
          build(p);
        }
      })
      .catch(function () { clearTimeout(to); /* sealed default stays in force */ });
  }

  function boot() {
    var d = open(_d);
    if (d) build(d);
    run();
    setInterval(run, 1000 * 60 * 5);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }

  window.MFPProtect = {
    refresh: function () { try { sessionStorage.removeItem(_q); } catch (e) {} run(); },
    version: '2.0.0'
  };
})();

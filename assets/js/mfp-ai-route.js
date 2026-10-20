/* ============================================================================
   MyFinancialPlan — AI Route Guard
   ----------------------------------------------------------------------------
   Points every AI call the web app makes at the MFP gateway instead of the
   provider, WITHOUT rebuilding the Flutter bundle.

   WHY THIS EXISTS
   ---------------
   The compiled app at /app/main.dart.js calls
       https://generativelanguage.googleapis.com/v1beta/models/…?key=<KEY>
   with a credential it reads from Firestore. That is the leak. Rebuilding the
   Flutter app removes the call properly, but for the web build we can intercept
   it here instead — no source change, no rebuild, effective immediately.

   HOW
   ---
   fetch() and XMLHttpRequest are patched for the provider host only. The request
   is rewritten to the gateway; the credential is dropped from the URL and the
   gateway supplies its own from Secret Manager. Every other request on the site
   passes through untouched.

   SHAPE
   -----
   The gateway runs in transparent-proxy mode, so the Gemini request and response
   bodies pass through unchanged. The app cannot tell the difference.

   SAFETY
   ------
   - If the gateway is unreachable or errors, the call FAILS — it does not fall
     back to calling the provider directly, because that path requires a
     credential in the client and is exactly what we are eliminating.
   - Only the AI host is touched. Nothing else is intercepted.
   - Set window.MFP_AI_GATEWAY = '' to disable the guard entirely.
   ============================================================================ */
(function () {
  'use strict';

  var GATEWAY = window.MFP_AI_GATEWAY !== undefined
    ? window.MFP_AI_GATEWAY
    : 'https://asia-south1-smartcalc-ai-638a9.cloudfunctions.net/mfpAi';

  if (!GATEWAY) return;                       // guard disabled

  var AI_HOST = 'generativelanguage.googleapis.com';

  function isAi(url) {
    try { return String(url).indexOf(AI_HOST) !== -1; } catch (e) { return false; }
  }

  /* Preserve the path and query but discard the credential. */
  function rewrite(url) {
    try {
      var u = new URL(url, location.href);
      var tail = u.pathname + (u.searchParams.get('alt') ? '?alt=' + u.searchParams.get('alt') : '');
      return GATEWAY.replace(/\/$/, '') + tail;
    } catch (e) {
      return GATEWAY;
    }
  }

  /* Attach the caller's identity so the gateway can apply a per-user quota.
     Never attach a provider credential. */
  function headersFor(original) {
    var h = {};
    try {
      if (original && typeof original.forEach === 'function') {
        original.forEach(function (v, k) {
          var lk = String(k).toLowerCase();
          if (lk === 'host' || lk === 'content-length' || lk === 'x-goog-api-key' ||
              lk === 'authorization') return;   // strip anything credential-shaped
          h[k] = v;
        });
      } else if (original && typeof original === 'object') {
        Object.keys(original).forEach(function (k) {
          var lk = k.toLowerCase();
          if (lk === 'host' || lk === 'content-length' || lk === 'x-goog-api-key' ||
              lk === 'authorization') return;
          h[k] = original[k];
        });
      }
    } catch (e) {}
    h['Content-Type'] = 'application/json';
    return h;
  }

  function idToken() {
    try {
      return localStorage.getItem('mfp_id_token') ||
             sessionStorage.getItem('mfp_id_token') || '';
    } catch (e) { return ''; }
  }

  /* ── patch fetch ───────────────────────────────────────────────────────── */
  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input, init) {
      var url = (typeof input === 'string') ? input : (input && input.url);

      if (isAi(url)) {
        var opts = init || {};
        var h = headersFor(opts.headers);
        var tok = idToken();
        if (tok) h['Authorization'] = 'Bearer ' + tok;

        var body = opts.body;
        if (!body && typeof Request !== 'undefined' && input instanceof Request) {
          /* clone the Request so its body is not consumed */
          return input.clone().text().then(function (t) {
            return origFetch(rewrite(url), { method: input.method, headers: h, body: t });
          });
        }
        return origFetch(rewrite(url), {
          method: opts.method || 'POST',
          headers: h,
          body: body
        });
      }

      return origFetch.apply(this, arguments);
    };
  }

  /* ── patch XMLHttpRequest, which the Dart bundle also uses ─────────────── */
  var OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    var open = OrigXHR.prototype.open;
    var send = OrigXHR.prototype.send;
    var setHeader = OrigXHR.prototype.setRequestHeader;

    OrigXHR.prototype.open = function (method, url) {
      if (isAi(url)) {
        this.__mfpAi = { method: method, headers: {} };
        arguments[1] = rewrite(url);
      }
      return open.apply(this, arguments);
    };

    OrigXHR.prototype.setRequestHeader = function (name, value) {
      if (this.__mfpAi) {
        var lk = String(name).toLowerCase();
        if (lk === 'x-goog-api-key' || lk === 'authorization') return;   // drop credential
        this.__mfpAi.headers[name] = value;
      }
      return setHeader.apply(this, arguments);
    };

    OrigXHR.prototype.send = function (body) {
      if (this.__mfpAi) {
        var tok = idToken();
        try {
          if (tok) setHeader.call(this, 'Authorization', 'Bearer ' + tok);
          setHeader.call(this, 'Content-Type', 'application/json');
        } catch (e) {}
      }
      return send.apply(this, arguments);
    };
  }

  window.MFP_AI_ROUTE = { enabled: true, gateway: GATEWAY, host: AI_HOST };
})();

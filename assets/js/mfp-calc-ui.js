/*! mfp-calc-ui.js — My Financial Plan
 *  One shared engine for every investment/withdrawal calculator on the site.
 *
 *  WHY THIS FILE EXISTS
 *  The homepage widget and the /tools/ pages used to calculate the same things
 *  in different ways, with different inputs and different answers. This module
 *  is the single source of truth: a schedule simulator plus the three renderers
 *  (chart, table, results breakdown) that read from it. A page supplies inputs
 *  and decides where to put the output; it never does arithmetic of its own.
 *
 *  Every projection is period-by-period rather than closed-form, because once a
 *  calculator has phases — deposits stopping, withdrawals starting — no single
 *  formula stays honest across the whole horizon.
 */
(function (root) {
  'use strict';

  var INFL = 0.06;   /* long-run inflation used only for the "today's money" line */
  var MAXY = 60;     /* hard cap: beyond this a compounding assumption dominates
                        the answer and the answer stops meaning anything        */

  function fm(x) { return '\u20B9' + Math.round(x).toLocaleString('en-IN'); }

  function fmS(x) {
    x = Math.round(x);
    if (Math.abs(x) >= 10000000) return '\u20B9' + (x / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    if (Math.abs(x) >= 100000) return '\u20B9' + (x / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    if (Math.abs(x) >= 1000) return '\u20B9' + Math.round(x / 1000) + 'k';
    return '\u20B9' + x;
  }

  function today(v, years) { return v / Math.pow(1 + INFL, years); }

  function clampY(v, def, max) {
    var raw = (v === null || v === undefined) ? '' : ('' + v).trim();
    var n = (raw === '') ? def : Math.round(+raw);
    if (!isFinite(n) || n < 0) n = def;
    return Math.min(n, max || MAXY);
  }

  function row(y, o, i, ti, g, w, cw, c, ph) {
    return { y: y, o: o, i: i, ti: ti, g: g, w: w, cw: cw, c: c, ph: ph };
  }

  /* ── the simulator ──────────────────────────────────────────────────────
     kind 'sip' {amt, freq, rate, years, hold}
     kind 'lum' {amt, rate, years, hold}
     kind 'swp' {amt, rate, delay, freq, method:'fix'|'pct', value, proj}
     kind 'fd'  {amt, rate, years}
     kind 'emi' {amt, rate, years}
     Returns year rows; .kind on the array says 'asset' or 'loan'.            */
  function schedule(kind, p) {
    var rows = [], bal = 0, ti = 0, cw = 0, y, k;
    p = p || {};

    if (kind === 'sip') {
      var P = +p.amt || 0, f = +p.freq || 12, R = (+p.rate || 0) / 100 / f,
          T = clampY(p.years, 15), H = clampY(p.hold, 30), N = Math.min(T + H, MAXY);
      for (y = 1; y <= N; y++) {
        var o = bal, inv = 0, g = 0;
        for (k = 0; k < f; k++) {
          if (y <= T) { bal += P; inv += P; ti += P; }
          var q = bal * R; bal += q; g += q;
        }
        rows.push(row(y, o, inv, ti, g, 0, 0, bal, y <= T ? 'dep' : 'hold'));
      }
      rows.kind = 'asset';

    } else if (kind === 'lum') {
      var P2 = +p.amt || 0, R2 = (+p.rate || 0) / 100,
          T2 = clampY(p.years, 15), H2 = clampY(p.hold, 30), N2 = Math.min(T2 + H2, MAXY);
      bal = P2; ti = P2;
      for (y = 1; y <= N2; y++) {
        var o2 = bal, g2 = bal * R2; bal += g2;
        rows.push(row(y, y === 1 ? 0 : o2, y === 1 ? P2 : 0, ti, g2, 0, 0, bal, y <= T2 ? 'dep' : 'hold'));
      }
      rows.kind = 'asset';

    } else if (kind === 'swp') {
      var P3 = +p.amt || 0, f3 = +p.freq || 12, R3 = (+p.rate || 0) / 100 / f3,
          D = clampY(p.delay, 0), pct = p.method === 'pct', WV = +p.value || 0,
          N3 = Math.max(1, clampY(p.proj, 30));
      bal = P3; ti = P3;
      for (y = 1; y <= N3; y++) {
        var o3 = bal, g3 = 0, w3 = 0, drawing = (y > D);
        var perYr = pct ? (bal * WV / 100) : 0;   /* % is an annual rate read off the
                                                     corpus at the start of the year */
        for (k = 0; k < f3; k++) {
          if (drawing && bal > 0) {
            var want = pct ? (perYr / f3) : WV, take = Math.min(want, bal);
            bal -= take; w3 += take; cw += take;
          }
          var q3 = bal * R3; bal += q3; g3 += q3;
        }
        rows.push(row(y, o3, 0, ti, g3, w3, cw, bal, drawing ? 'draw' : 'grow'));
        if (drawing && bal < 1) { rows[rows.length - 1].c = 0; break; }
      }
      rows.kind = 'asset';

    /* compound interest: principal compounding `freq` times a year plus an optional
       monthly addition. im=(1+r/n)^(n/12)-1 makes a monthly walk identical to
       P*(1+r/n)^(n*t), so one loop reproduces the lump and the instalments. */
    } else if (kind === 'ci') {
      var ciP = +p.amt || 0, ciR = (+p.rate || 0) / 100, ciN = +p.freq || 1,
          ciT = clampY(p.years, 10), ciAdd = +p.add || 0,
          ciIm = Math.pow(1 + ciR / ciN, ciN / 12) - 1;
      bal = ciP; ti = ciP;
      for (y = 1; y <= ciT; y++) {
        var ciO = bal, ciInv = 0, ciG = 0;
        for (k = 0; k < 12; k++) {
          if (ciAdd > 0) { bal += ciAdd; ciInv += ciAdd; ti += ciAdd; }
          var ciQ = bal * ciIm; bal += ciQ; ciG += ciQ;
        }
        /* year 1: the principal is the investment, not an opening balance —
           booking it as both would double-count it (same convention as 'lum') */
        rows.push(row(y, y === 1 ? 0 : ciO, y === 1 ? ciInv + ciP : ciInv, ti, ciG, 0, 0, bal, 'dep'));
      }
      rows.kind = 'asset';

    /* recurring deposit: monthly instalment, quarterly compounding — the convention
       Indian banks use. Tenure is given in MONTHS. */
    } else if (kind === 'rd') {
      var rdR = +p.amt || 0, rdRate = (+p.rate || 0) / 100,
          rdM = Math.max(1, Math.round(+p.months || 0)),
          rdIm = Math.pow(1 + rdRate / 4, 1 / 3) - 1, rdDone = 0;
      for (y = 1; y <= Math.ceil(rdM / 12); y++) {
        var rdO = bal, rdInv = 0, rdG = 0;
        for (k = 0; k < 12 && rdDone < rdM; k++, rdDone++) {
          bal += rdR; rdInv += rdR; ti += rdR;
          var rdQ = bal * rdIm; bal += rdQ; rdG += rdQ;
        }
        rows.push(row(y, rdO, rdInv, ti, rdG, 0, 0, bal, 'dep'));
      }
      rows.kind = 'asset';

    /* step-up SIP: the instalment rises by `step` percent every 12 months */
    } else if (kind === 'step') {
      var stP = +p.amt || 0, stI = (+p.rate || 0) / 1200,
          stY = clampY(p.years, 15), stS = (+p.step || 0) / 100;
      for (y = 1; y <= stY; y++) {
        var stO = bal, stInv = 0, stG = 0, stCur = stP * Math.pow(1 + stS, y - 1);
        for (k = 0; k < 12; k++) {
          bal += stCur; stInv += stCur; ti += stCur;
          var stQ = bal * stI; bal += stQ; stG += stQ;
        }
        rows.push(row(y, stO, stInv, ti, stG, 0, 0, bal, 'dep'));
      }
      rows.kind = 'asset';

    /* future value: a starting pot growing annually with a fixed amount added at
       the END of each year (bal = bal*(1+r) + A) */
    } else if (kind === 'fv') {
      var fvP = +p.amt || 0, fvA = +p.add || 0, fvR = (+p.rate || 0) / 100,
          fvY = clampY(p.years, 15);
      bal = fvP; ti = fvP;
      for (y = 1; y <= fvY; y++) {
        var fvO = bal, fvG = bal * fvR;
        bal += fvG; bal += fvA; ti += fvA;
        rows.push(row(y, y === 1 ? 0 : fvO, y === 1 ? fvA + fvP : fvA, ti, fvG, 0, 0, bal, 'dep'));
      }
      rows.kind = 'asset';

    } else if (kind === 'fd') {
      var P4 = +p.amt || 0, R4 = (+p.rate || 0) / 400, T4 = clampY(p.years, 5);
      bal = P4; ti = P4;
      for (y = 1; y <= T4; y++) {
        var o4 = bal, g4 = 0;
        for (k = 0; k < 4; k++) { var q4 = bal * R4; bal += q4; g4 += q4; }
        rows.push(row(y, y === 1 ? 0 : o4, y === 1 ? P4 : 0, ti, g4, 0, 0, bal, 'dep'));
      }
      rows.kind = 'asset';

    } else {
      var L5 = +p.amt || 0, R5 = (+p.rate || 0) / 1200, T5 = clampY(p.years, 20),
          N5 = Math.max(1, T5 * 12),
          E = R5 === 0 ? L5 / N5 : L5 * R5 * Math.pow(1 + R5, N5) / (Math.pow(1 + R5, N5) - 1);
      bal = L5;
      for (y = 1; y <= T5; y++) {
        var o5 = bal, pr = 0, it = 0;
        for (k = 0; k < 12; k++) {
          if (bal <= 0) break;
          var ii = bal * R5, pp = Math.min(E - ii, bal);
          bal -= pp; pr += pp; it += ii;
        }
        rows.push(row(y, o5, it, 0, 0, pr, 0, Math.max(0, bal), 'loan'));
      }
      rows.kind = 'loan';
    }
    return rows;
  }

  /* ── renderers ────────────────────────────────────────────────────────── */
  var PHC = { dep: '#0E9D78', hold: '#4C62CE', grow: '#0E9D78', draw: '#BF7B0B', loan: '#4C62CE' };
  var PHL = { dep: 'Deposit phase', hold: 'Still invested, no new deposits',
              grow: 'Growing before withdrawals', draw: 'Withdrawal phase', loan: 'Outstanding loan' };

  function chart(rows) {
    if (!rows || !rows.length) return '<p class="cfnote">Enter your numbers above to see the cash flow.</p>';
    var W = 640, H = 210, padL = 6, padB = 22, padT = 12, n = rows.length, max = 0, i, r;
    for (i = 0; i < n; i++) max = Math.max(max, Math.abs(rows[i].c));
    if (max <= 0) max = 1;
    var bw = (W - padL * 2) / n, bar = Math.max(2, Math.min(26, bw * 0.68)), s = '', seen = {};
    for (i = 0; i < n; i++) {
      r = rows[i]; seen[r.ph] = 1;
      var h = Math.max(1, (Math.abs(r.c) / max) * (H - padT - padB)),
          x = padL + bw * i + (bw - bar) / 2, yy = H - padB - h;
      s += '<rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + bar.toFixed(1) +
           '" height="' + h.toFixed(1) + '" rx="2" fill="' + PHC[r.ph] + '"><title>Year ' + r.y + ': ' + fm(r.c) + '</title></rect>';
    }
    var step = n <= 12 ? 1 : Math.ceil(n / 10);
    for (i = 0; i < n; i += step) {
      var xt = padL + bw * i + bw / 2;
      s += '<text x="' + xt.toFixed(1) + '" y="' + (H - 7) + '" font-size="10" fill="#44586E" text-anchor="middle">' + rows[i].y + '</text>';
    }
    s += '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padL) + '" y2="' + (H - padB) + '" stroke="#DCE7F0" stroke-width="1"/>';
    s += '<text x="' + padL + '" y="' + padT + '" font-size="10.5" fill="#44586E" font-weight="700">' + fmS(max) + '</text>';
    var leg = '';
    for (var ph in seen) leg += '<span><i style="background:' + PHC[ph] + '"></i>' + PHL[ph] + '</span>';
    return '<svg class="cfsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Year by year balance chart">' + s + '</svg>' +
           '<div class="cfleg">' + leg + '<span>Bar height = balance at the end of each year</span></div>';
  }

  function table(kind, rows) {
    if (!rows || !rows.length) return '<p class="cfnote">Enter your numbers above to see the cash flow.</p>';
    var cols, cell;
    if (kind === 'sip') {
      cols = ['Year', 'Invested this year', 'Total invested', 'Opening', 'Growth', 'Closing'];
      cell = function (r) { return '<td class="pos">' + (r.i ? fm(r.i) : '\u2014') + '</td><td>' + fm(r.ti) + '</td><td>' + fm(r.o) + '</td><td class="pos">' + fm(r.g) + '</td><td class="bal">' + fm(r.c) + '</td>'; };
    } else if (kind === 'lum') {
      cols = ['Year', 'Opening', 'Investment', 'Returns', 'Closing'];
      cell = function (r) { return '<td>' + fm(r.o) + '</td><td class="pos">' + (r.i ? fm(r.i) : '\u2014') + '</td><td class="pos">' + fm(r.g) + '</td><td class="bal">' + fm(r.c) + '</td>'; };
    } else if (kind === 'swp') {
      cols = ['Year', 'Opening', 'Growth', 'Withdrawn', 'Total withdrawn', 'Closing'];
      cell = function (r) { return '<td>' + fm(r.o) + '</td><td class="pos">' + fm(r.g) + '</td><td class="neg">' + (r.w ? fm(r.w) : '\u2014') + '</td><td class="neg">' + fm(r.cw) + '</td><td class="bal">' + fm(r.c) + '</td>'; };
    } else if (kind === 'fd') {
      cols = ['Year', 'Opening', 'Deposited', 'Interest', 'Closing'];
      cell = function (r) { return '<td>' + fm(r.o) + '</td><td class="pos">' + (r.i ? fm(r.i) : '\u2014') + '</td><td class="pos">' + fm(r.g) + '</td><td class="bal">' + fm(r.c) + '</td>'; };
    } else {
      cols = ['Year', 'Opening', 'Interest', 'Principal', 'Outstanding', 'Paid that year'];
      cell = function (r) { return '<td>' + fm(r.o) + '</td><td class="neg">' + fm(r.i) + '</td><td class="pos">' + fm(r.w) + '</td><td class="bal">' + fm(r.c) + '</td><td>' + fm(r.i + r.w) + '</td>'; };
    }
    var h = '<p class="cfswipe">\u2190 swipe the table sideways to see every column</p><div class="cfwrap"><table class="cftbl"><thead><tr>';
    for (var c = 0; c < cols.length; c++) h += '<th>' + cols[c] + '</th>';
    h += '</tr></thead><tbody>';
    for (var i = 0; i < rows.length; i++) h += '<tr><td>' + rows[i].y + '</td>' + cell(rows[i]) + '</tr>';
    return h + '</tbody></table></div>';
  }

  function breakdown(items) {
    var h = '';
    for (var i = 0; i < items.length; i++) {
      if (!items[i]) continue;
      h += '<div' + (items[i][2] ? ' class="' + items[i][2] + '"' : '') + '><span>' + items[i][0] + '</span><span>' + items[i][1] + '</span></div>';
    }
    return h;
  }

  /* exhaustion year, or 0 when the corpus survives the projection */
  function dryYear(rows) {
    if (!rows || !rows.length) return 0;
    var last = rows[rows.length - 1];
    return (last.c < 1 && last.cw > 0) ? last.y : 0;
  }

  function totalGrowth(rows) {
    var g = 0;
    for (var i = 0; i < (rows || []).length; i++) g += rows[i].g;
    return g;
  }

  root.MFPCalc = {
    INFL: INFL, MAXY: MAXY,
    fm: fm, fmS: fmS, today: today, clampY: clampY,
    schedule: schedule, chart: chart, table: table, breakdown: breakdown,
    dryYear: dryYear, totalGrowth: totalGrowth,
    PHC: PHC, PHL: PHL
  };
})(window);

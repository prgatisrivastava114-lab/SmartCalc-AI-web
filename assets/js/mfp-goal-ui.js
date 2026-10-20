/* ============================================================================
   MY FINANCIAL PLAN — GOAL CALCULATOR UI
   Renders inputs, runs the engine, renders results. No network, no storage.
   ============================================================================ */
(function () {
  'use strict';

  var E = window.MFP_GOALS;
  if (!E) return;

  /* ── field definitions per goal ─────────────────────────────────────────── */
  function fieldsFor(key, g) {
    var f = [];
    var money = function (k, label, hint, val) {
      return { k: k, label: label, hint: hint, pfx: '\u20B9', money: true, val: val };
    };
    var age = function (k, label, hint, val) {
      return { k: k, label: label, hint: hint, sfx: 'yrs', int: true, min: 0, max: 100, val: val };
    };
    var pct = function (k, label, hint, val) {
      return { k: k, label: label, hint: hint, sfx: '%', dec: 1, min: 0, max: 30, val: val };
    };

    if (key === 'emergency') {
      f.push(money('currentCost', g.costLabel, g.costHint, 42000));
      f.push({ k: 'emergencyMonths', label: 'Months of cover', hint: '6 months is the usual starting point', sfx: 'mo', int: true, min: 1, max: 60, val: 6 });
      f.push(money('existingAmount', 'Emergency fund you already have', 'Savings, FD or liquid fund set aside', 100000));
      f.push({ k: 'buildMonths', label: 'Build it over', hint: 'How many months you want to take', sfx: 'mo', int: true, min: 1, max: 120, val: 12 });
      return f;
    }

    if (key === 'hlv') {
      f.push(money('currentCost', g.costLabel, g.costHint, 85000));
      f.push({ k: 'hlvMultiplier', label: 'Human Life Value multiplier', hint: '15 years of income is a common planning benchmark', sfx: '\u00D7', int: true, min: 1, max: 40, val: 15 });
      f.push(money('existingCover', 'Life cover you already have', 'Term insurance cover, in total', 5000000));
      f.push(money('employerCover', 'Employer cover', 'Group life cover from your job, if any', 0));
      f.push(money('liabilities', 'Outstanding loans', 'Home loan, car loan and other liabilities', 0));
      f.push(money('futureObligations', 'Future family obligations', "Children's education or marriage you want covered", 0));
      return f;
    }

    /* long-term goals */
    var ageLabel = g.ageLabel, costLabel = g.costLabel, costHint = g.costHint;
    f.push(age('currentAge', ageLabel, key === 'education' || key === 'marriage' ? 'The child\u2019s age today' : 'Your age today', key === 'retirement' || key === 'legacy' ? 35 : 4));

    if (g.defaultTargetAge) {
      f.push(age('targetAge', g.targetAgeLabel, 'You can change this', g.defaultTargetAge));
    }
    f.push(money('currentCost', costLabel, costHint, key === 'retirement' ? 40000 : key === 'legacy' ? 5000000 : 1000000));

    /* SPEC §5 — "Do you already have some money saved for this goal?"
       Answered by a Yes/No control; the amount field appears only when Yes.
       This is the feature that stops today's savings being subtracted from
       tomorrow's cost — the amount is grown to the goal date first. */
    f.push(money('existingAmount', 'Amount available today', 'Savings, investments, FD or deposits already set aside for this goal', 0));

    return f;
  }

  /* ── optional assumptions block ─────────────────────────────────────────── */
  function assumptionsFor(key) {
    var f = [];
    if (key === 'hlv') return f;
    f.push({ k: 'inflation', label: 'Inflation assumption', hint: 'MFP default is 6% per year', sfx: '%', dec: 1, min: 0, max: 20, val: E.ASSUMPTIONS.inflation });
    if (key !== 'emergency') {
      f.push({ k: 'expectedReturn', label: 'Expected investment return', hint: 'MFP default is 12% per year. Returns are not guaranteed.', sfx: '%', dec: 1, min: 0, max: 30, val: E.ASSUMPTIONS.expectedReturn });
    }
    return f;
  }

  /* ── input markup ───────────────────────────────────────────────────────── */
  function inputHTML(f) {
    var v = f.val === null || f.val === undefined ? '' : f.val;
    return '' +
      '<div class="gc-field" data-field="' + f.k + '">' +
        '<label for="gc-' + f.k + '">' + f.label + '</label>' +
        '<div class="gc-input">' +
          (f.pfx ? '<span class="pfx">' + f.pfx + '</span>' : '') +
          '<input id="gc-' + f.k + '" name="' + f.k + '" type="text" inputmode="decimal" ' +
            'autocomplete="off" value="' + v + '" placeholder="0">' +
          (f.sfx ? '<span class="sfx">' + f.sfx + '</span>' : '') +
        '</div>' +
        (f.hint ? '<span class="fh">' + f.hint + '</span>' : '') +
      '</div>';
  }

  /* ── read inputs ────────────────────────────────────────────────────────── */
  function readInputs(root) {
    var out = {};
    root.querySelectorAll('input[data-gc-input]').forEach(function (el) {
      out[el.getAttribute('data-gc-input')] = el.value;
    });
    root.querySelectorAll('button[data-gc-toggle]').forEach(function (el) {
      out[el.getAttribute('data-gc-toggle')] = el.classList.contains('on');
    });
    root.querySelectorAll('button[data-gc-seg]').forEach(function (el) {
      if (el.classList.contains('on')) out[el.getAttribute('data-gc-seg')] = el.getAttribute('data-gc-val');
    });
    return out;
  }

  /* ── SVG growth chart ───────────────────────────────────────────────────── */
  function chartSVG(series, goalShort) {
    if (!series || series.length < 2) return '';
    var W = 640, H = 220, P = { l: 8, r: 8, t: 14, b: 24 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    var max = 0;
    series.forEach(function (p) { max = Math.max(max, p.goal, p.existing + p.sip); });
    if (max <= 0) max = 1;
    var n = series.length;

    function X(i) { return P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw); }
    function Y(v) { return P.t + ih - (v / max) * ih; }

    var havePts = series.map(function (p, i) { return X(i).toFixed(1) + ',' + Y(p.existing + p.sip).toFixed(1); });
    var goalPts = series.map(function (p, i) { return X(i).toFixed(1) + ',' + Y(p.goal).toFixed(1); });

    var area = 'M' + X(0).toFixed(1) + ',' + Y(0).toFixed(1) + 'L' +
      havePts.join('L') + 'L' + X(n - 1).toFixed(1) + ',' + Y(0).toFixed(1) + 'Z';

    var grid = '';
    [0.25, 0.5, 0.75, 1].forEach(function (fr) {
      var y = (P.t + ih - fr * ih).toFixed(1);
      grid += '<line class="gridline" x1="' + P.l + '" y1="' + y + '" x2="' + (W - P.r) + '" y2="' + y + '"/>';
    });

    var ticks = '';
    var idx = [0, Math.floor((n - 1) / 2), n - 1].filter(function (v, i, a) { return a.indexOf(v) === i; });
    ticks = idx.map(function (i) {
      return '<text class="lbl" x="' + X(i).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="' +
        (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">Year ' + series[i].year + '</text>';
    }).join('');

    return '' +
      '<svg class="gc-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" ' +
      'aria-label="Goal value compared with your projected savings over time">' +
        grid +
        '<path class="have-area" d="' + area + '"/>' +
        '<polyline class="goal-line" points="' + goalPts.join(' ') + '"/>' +
        '<polyline class="have-line" points="' + havePts.join(' ') + '"/>' +
        ticks +
      '</svg>';
  }

  /* ── coverage bar ───────────────────────────────────────────────────────── */
  function coverageBar(existingFV, sip, goal) {
    if (!goal || goal <= 0) return '';
    var a = Math.max(0, existingFV);
    var b = sip ? sip.contributed : 0;
    var c = sip ? sip.growth : 0;
    var total = a + b + c;
    var scale = Math.max(goal, total);                 // if surplus, bar overfills proportionally
    var pa = (a / scale) * 100, pb = (b / scale) * 100, pc = (c / scale) * 100;
    var pd = Math.max(0, ((scale - total) / scale) * 100);
    return '' +
      '<div class="gc-cov">' +
        '<div class="bar">' +
          (pa > 0.4 ? '<i class="s1" style="width:' + pa.toFixed(2) + '%"></i>' : '') +
          (pb > 0.4 ? '<i class="s2" style="width:' + pb.toFixed(2) + '%"></i>' : '') +
          (pc > 0.4 ? '<i class="s2" style="width:' + pc.toFixed(2) + '%;opacity:.62"></i>' : '') +
          (pd > 0.4 ? '<i class="s3" style="width:' + pd.toFixed(2) + '%"></i>' : '') +
        '</div>' +
        '<div class="legend">' +
          (a > 0 ? '<span><i style="background:#0E9D78"></i>Existing savings, grown</span>' : '') +
          (b > 0 ? '<span><i style="background:#38BD98"></i>Your SIP contributions</span>' : '') +
          (c > 0 ? '<span><i style="background:#8FDFC4"></i>Assumed growth on SIP</span>' : '') +
          (pd > 0.4 ? '<span><i style="background:#F87171"></i>Unfunded</span>' : '') +
        '</div>' +
      '</div>';
  }

  /* ── timeline flow ──────────────────────────────────────────────────────── */
  function flowHTML(r) {
    var steps;

    if (r.engine === 'protection') {
      /* Human Life Value: the journey is income -> value -> cover -> gap,
         not a savings timeline. Showing "monthly saving" here would be wrong. */
      var h = r.hlv || {};
      steps = [
        { ic: '\u{1F4CD}', t: 'Monthly income', v: E.formatINR(h.monthlyIncome || 0) },
        { ic: '\u{1F4C5}', t: 'Annual income', v: E.formatShort((h.monthlyIncome || 0) * 12) },
        { ic: '\u2716\uFE0F', t: (h.multiplier || 15) + '\u00D7 multiplier', v: E.formatShort(h.indicativeHLV || 0) },
        { ic: '\u{1F6E1}\uFE0F', t: 'Cover you hold', v: h.totalCover > 0 ? '\u2212 ' + E.formatShort(h.totalCover) : '\u2014' },
        { ic: '\u{1F3AF}', t: 'Indicative gap', v: E.formatShort(h.gap || 0) }
      ];
    } else if (r.engine === 'reserve') {
      /* Emergency fund: spend -> fund needed -> what you have -> shortfall -> monthly saving */
      var em = r.emergency || {};
      steps = [
        { ic: '\u{1F4CD}', t: 'Monthly expense', v: E.formatINR(em.monthlyExpense || 0) },
        { ic: '\u2716\uFE0F', t: em.months + ' months cover', v: E.formatShort(em.required || 0) },
        { ic: '\u{1F4B0}', t: 'Already set aside', v: em.existing > 0 ? '\u2212 ' + E.formatShort(em.existing) : '\u2014' },
        { ic: '\u{1F4C9}', t: 'Shortfall', v: E.formatShort(r.gap || 0) },
        { ic: '\u{1F3AF}', t: 'Monthly saving', v: E.formatINR(Math.round(r.suggestedMonthlySaving || 0)) }
      ];
    } else {
      steps = [
        { ic: '\u{1F4CD}', t: 'Today', v: E.formatShort(r.currentCost) + (r.engine === 'corpus' ? '/mo' : '') },
        { ic: '\u{1F4C8}', t: 'Future cost', v: E.formatShort(r.futureGoalValue) },
        { ic: '\u{1F4B0}', t: 'Existing fund grows to', v: r.existingFutureValue > 0 ? E.formatShort(r.existingFutureValue) : '\u2014' },
        { ic: '\u{1F4C9}', t: 'Gap', v: E.formatShort(r.gap || 0) },
        { ic: '\u{1F3AF}', t: r.timeline.targetAge ? 'SIP to age ' + r.timeline.targetAge : 'Monthly SIP', v: E.formatINR(Math.round(r.requiredSip || 0)) }
      ];
    }
    return '<div class="gc-flow">' + steps.map(function (s) {
      return '<div class="step' + (s.t === 'Today' ? ' now' : '') + '">' +
        '<div class="dot">' + s.ic + '</div>' +
        '<div class="t">' + s.t + '</div>' +
        '<div class="v">' + s.v + '</div></div>';
    }).join('') + '</div>';
  }

  /* ── scenarios ──────────────────────────────────────────────────────────── */
  function scenarioHTML(list) {
    if (!list) return '';
    return '' +
      '<table class="gc-scen"><thead><tr>' +
        '<th>Scenario</th><th style="text-align:right">Return assumed</th>' +
        '<th style="text-align:right">Monthly SIP</th></tr></thead><tbody>' +
      list.map(function (s) {
        return '<tr class="' + (s.isBase ? 'base' : '') + '">' +
          '<td>' + s.name + (s.isBase ? '<span class="tag">BASE</span>' : '') + '</td>' +
          '<td class="num">' + E.formatPct(s.returnPct) + '</td>' +
          '<td class="num">' + (s.requiredSip > 0 ? E.formatINR(Math.round(s.requiredSip)) : E.formatINR(0)) + '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>' +
      '<p class="gc-note">These are <strong>assumptions you can change</strong>, not forecasts. ' +
      'A higher assumed return always produces a lower SIP \u2014 that is arithmetic, not a promise.</p>';
  }

  /* ── main result renderer ───────────────────────────────────────────────── */
  function renderResult(el, r, key, cfg, inputs) {
    if (!r.ok) {
      el.innerHTML =
        '<div class="gc-card" id="gc-results">' +
          '<h2>\u26A0\uFE0F Please check your inputs</h2>' +
          '<div class="gc-msgs">' + r.errors.map(function (e) {
            return '<div class="gc-msg err">' + e + '</div>';
          }).join('') + '</div>' +
          (r.warnings && r.warnings.length ? '<div class="gc-msgs">' + r.warnings.map(function (w) {
            return '<div class="gc-msg warn">' + w + '</div>';
          }).join('') + '</div>' : '') +
        '</div>';
      return;
    }

    var h = [];
    h.push('<div class="gc-card" id="gc-results">');

    /* print-only letterhead — appears on the PDF, hidden on screen */
    h.push('<div class="gc-print-head"><b>' + E.GOALS[key].label + ' \u2014 MyFinancialPlan</b>' +
      '<span>Illustrative estimate generated on ' +
      new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) +
      ' \u00B7 myfinancialplan.in</span></div>');

    /* hero number */
    if (r.engine === 'protection') {
      h.push(heroBlock('Indicative insurance gap', r.hlv.gap,
        r.hlv.sufficient
          ? 'Your existing cover already meets the indicative requirement under these assumptions.'
          : 'Based on ' + r.hlv.multiplier + '\u00D7 annual income of ' + E.formatShort(r.hlv.annualIncome) +
            (r.hlv.liabilities + r.hlv.futureObligations > 0 ? ', plus the liabilities and obligations you entered' : '') + '.'));
    } else if (r.engine === 'reserve') {
      h.push(heroBlock('Current emergency fund shortfall', r.gap,
        r.emergency.surplus
          ? 'Your emergency fund already covers ' + r.emergency.monthsCoveredNow.toFixed(1) + ' months of expenses.'
          : 'That is ' + E.formatINR(Math.round(r.suggestedMonthlySaving)) + ' per month for ' + r.emergency.buildMonths + ' months to close.'));
    } else if (r.gap <= 0 && r.existingAmount > 0) {
      h.push(heroBlock('Required monthly SIP', 0,
        'Your existing amount may be sufficient to meet this goal under the selected assumptions.'));
    } else {
      h.push(heroBlock('Required monthly SIP', r.requiredSip,
        'Based on the selected return assumption of ' + E.formatPct(r.assumptions.expectedReturn) +
        ' over ' + E.formatYears(r.timeline.years) + '.'));
    }

    /* warnings */
    if (r.warnings && r.warnings.length) {
      h.push('<div class="gc-msgs" style="margin-top:14px">' + r.warnings.map(function (w) {
        return '<div class="gc-msg warn">' + w + '</div>';
      }).join('') + '</div>');
    }

    /* story */
    if (r.engine === 'reserve') {
      var em = r.emergency;
      h.push('<div class="gc-story">' +
        storyRow('Monthly household expense', E.formatINR(em.monthlyExpense)) +
        storyRow('Months of cover wanted', em.months + ' months') +
        storyRow('Required emergency fund', E.formatINR(em.required), 'hi') +
        (em.inflationAdjusted ? storyRow('Adjusted for inflation', E.formatINR(em.requiredBase) + ' \u2192 ' + E.formatINR(em.required)) : '') +
        storyRow('Already saved', '\u2212 ' + E.formatINR(em.existing)) +
        storyRow('Current shortfall', E.formatINR(em.shortfall), 'hi') +
        storyRow('Suggested monthly saving for ' + em.buildMonths + ' months', E.formatINR(Math.round(em.suggestedMonthly)), 'tot') +
      '</div>');
      h.push('<div class="gc-tiles">' +
        tile(E.formatINR(em.required), 'Required fund') +
        tile(E.formatINR(em.existing), 'You have') +
        tile(em.shortfall > 0 ? E.formatINR(em.shortfall) : 'Covered', 'Shortfall') +
        tile(em.monthsCoveredNow.toFixed(1) + ' mo', 'Months covered now') +
      '</div>');
      h.push('<div class="gc-msg good"><b>This is not a long-term investment</b>' +
        'An emergency fund should sit in savings, a liquid fund or a sweep-in FD \u2014 somewhere you can reach within 24 hours. ' +
        'It is deliberately kept separate from the SIP calculations on the other goal pages, because money you may need tomorrow should not be exposed to market risk.</div>');
    } else if (r.engine === 'protection') {
      var x = r.hlv;
      h.push('<div class="gc-story">' +
        storyRow('Monthly income', E.formatINR(x.monthlyIncome)) +
        storyRow('Annual income', E.formatINR(x.annualIncome) + '  (' + E.formatINR(x.monthlyIncome) + ' \u00D7 12)') +
        storyRow('HLV multiplier', x.multiplier + ' years of income') +
        storyRow('Indicative Human Life Value', E.formatINR(x.indicativeHLV), 'hi') +
        (x.liabilities > 0 ? storyRow('Liabilities', '+ ' + E.formatINR(x.liabilities)) : '') +
        (x.futureObligations > 0 ? storyRow('Future obligations', '+ ' + E.formatINR(x.futureObligations)) : '') +
        storyRow('Total indicative need', E.formatINR(x.totalNeed), 'hi') +
        storyRow('Your cover', '\u2212 ' + E.formatINR(x.totalCover)) +
        storyRow('Indicative insurance gap', E.formatINR(x.gap), 'tot') +
      '</div>');
      h.push('<div class="gc-tiles">' +
        tile(E.formatShort(x.indicativeHLV), 'Indicative HLV') +
        tile(E.formatShort(x.totalCover), 'Your cover') +
        tile(x.gap > 0 ? E.formatShort(x.gap) : 'Sufficient', 'Gap') +
        tile(x.multiplier + '\u00D7', 'Multiplier used') +
      '</div>');
    } else {
      h.push('<div class="gc-story">' +
        storyRow('Your goal today', E.formatINR(r.currentCost) + (r.engine === 'corpus' ? ' / month' : '')) +
        storyRow('Time available', E.formatYears(r.timeline.years) + '  \u2192  age ' + r.timeline.targetAge) +
        (r.engine === 'corpus'
          ? storyRow('Same expense at retirement', E.formatINR(Math.round(r.retirement.futureMonthlyExpense)) + ' / month')
          : '') +
        storyRow(r.engine === 'corpus' ? 'Corpus required at retirement' : 'Estimated future cost',
                 E.formatINR(Math.round(r.futureGoalValue)), 'hi') +
        storyRow('Existing savings today', E.formatINR(r.existingAmount)) +
        storyRow('What that may become', E.formatINR(Math.round(r.existingFutureValue)),
                 r.existingFutureValue >= r.futureGoalValue ? 'plus' : '') +
        storyRow('Remaining funding requirement', E.formatINR(Math.round(r.gap)), 'hi') +
        storyRow('Required monthly SIP', (r.gap <= 0 ? E.formatINR(0) : E.formatINR(Math.round(r.requiredSip))), 'tot') +
      '</div>');

      h.push('<div class="gc-tiles">' +
        tile(E.formatShort(r.futureGoalValue), r.engine === 'corpus' ? 'Corpus needed' : 'Future cost') +
        tile(E.formatShort(r.existingFutureValue), 'Existing grows to') +
        tile(r.gap > 0 ? E.formatShort(r.gap) : 'Covered', 'Remaining') +
        tile(r.gap > 0 ? E.formatINR(Math.round(r.requiredSip)) : E.formatINR(0), 'Monthly SIP') +
      '</div>');

      h.push('<h2 style="margin-top:22px">How your goal gets funded</h2>');
      h.push(coverageBar(r.existingFutureValue, r.sip, r.futureGoalValue));

      if (r.sip) {
        h.push('<div class="gc-story">' +
          storyRow('You contribute over ' + E.formatYears(r.timeline.years), E.formatINR(Math.round(r.sip.contributed))) +
          storyRow('Assumed growth on that SIP', E.formatINR(Math.round(r.sip.growth)), 'plus') +
          storyRow('Total from SIP', E.formatINR(Math.round(r.sip.total)), 'hi') +
          storyRow('Plus existing savings growth', E.formatINR(Math.round(r.existingFutureValue))) +
          storyRow('Total at target date', E.formatINR(Math.round(r.sip.total + r.existingFutureValue)), 'tot') +
        '</div>');
      }
    }

    /* flow + chart */
    h.push(flowHTML(r));

    if (r.series && r.series.length > 2) {
      h.push('<h2 style="margin-top:22px">Your savings against the rising goal</h2>');
      h.push(chartSVG(r.series));
      h.push('<div class="gc-legend">' +
        '<span><i style="background:#94A3B8"></i>Goal value each year</span>' +
        '<span><i style="background:#0E9D78"></i>Your projected savings</span>' +
      '</div>');
      h.push('<p class="gc-note">The grey line is the goal growing with inflation. The green area is your existing savings plus SIP, growing with the assumed return. Where the green line stays above the grey line, the goal is funded.</p>');
    }

    /* scenarios */
    var sc = E.scenarios(key, inputs, cfg && cfg.engineOpts ? cfg.engineOpts : {});
    var usable = cfg && cfg.scenarios !== false && r.isSipGoal;
    if (usable && sc) {
      h.push('<h2 style="margin-top:24px">If your return assumption is different</h2>');
      h.push(scenarioHTML(sc));
    }

    /* transparency */
    h.push('<details class="gc-how"><summary>How did we calculate this?</summary><div class="steps">' +
      r.steps.map(function (s) {
        return '<div class="st"><span class="k">' + s.label + '</span><span class="v">' + s.value + '</span></div>';
      }).join('') +
      '</div></details>');

    h.push('<p class="gc-note" style="margin-top:12px">Inflation assumption: <strong>' +
      E.formatPct(r.assumptions.inflation) + '</strong> \u00B7 ' +
      'Return assumption: <strong>' + E.formatPct(r.assumptions.expectedReturn) + '</strong>' +
      (r.assumptions.targetAge ? ' \u00B7 Target age: <strong>' + r.assumptions.targetAge + '</strong>' : '') +
      '</p>');

    h.push('</div>');

    /* ── action row: download as PDF (browser print) + reset ─────────────
       Spec §13 "Save Plan / Download PDF" without a server: nothing the user
       typed is transmitted, so the page cannot email or store a PDF for them.
       Browser print-to-PDF keeps that promise intact. */
    h.push('<div class="gc-actions">' +
      '<button type="button" class="primary" data-gc-print>\u{1F4C4} Download this estimate as PDF</button>' +
      '<button type="button" data-gc-reset>\u21BA Reset</button>' +
      '<span class="hint">Uses your browser\u2019s own print-to-PDF. Nothing you typed is sent anywhere, ' +
      'and we do not store this calculation or email you about it.</span>' +
      '</div>');

    el.innerHTML = h.join('');
  }

  function heroBlock(label, value, note) {
    var zero = !value || value <= 0;
    return '<div class="gc-hero-result">' +
      '<div class="lbl">' + label + '</div>' +
      '<div class="big' + (zero ? ' is-zero' : '') + '">' + E.formatINR(Math.round(value)) + '</div>' +
      '<div class="note">' + note + '</div>' +
      '<div class="pill">Illustrative \u00B7 based on your assumptions</div>' +
    '</div>';
  }
  function storyRow(k, v, cls) {
    return '<div class="row ' + (cls || '') + '"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }
  function tile(v, l) {
    return '<div class="gc-tile"><b>' + v + '</b><span>' + l + '</span></div>';
  }

  /* ── mount ──────────────────────────────────────────────────────────────── */
  var state = { key: 'education', inputs: {} };

  function mount(opts) {
    var root = document.getElementById(opts.root || 'gc-app');
    if (!root) return;
    var key = opts.goal || 'education';
    var cfg = opts.config || {};
    state.key = key;

    function build() {
      var g = E.GOALS[key];
      var inputs = fieldsFor(key, g);
      var assum = assumptionsFor(key);

      var asksExisting = (key === 'education' || key === 'marriage' || key === 'retirement' || key === 'legacy');
      var segBlock = asksExisting
        ? '<div class="gc-field" style="margin-top:16px">' +
            '<label>Do you already have some money saved for this goal?</label>' +
            '<div class="gc-seg">' +
              '<button type="button" data-gc-seg="hasExisting" data-gc-val="no" class="on">No</button>' +
              '<button type="button" data-gc-seg="hasExisting" data-gc-val="yes">Yes</button>' +
            '</div>' +
            '<span class="fh">If yes, we grow that amount to the goal date before subtracting it — we never take today’s figure off tomorrow’s cost.</span>' +
          '</div>'
        : '';

      var extra = '';
      if (key === 'emergency') {
        extra = '<div class="gc-toggle"><button class="gc-switch" type="button" aria-label="Adjust for inflation" data-gc-toggle="inflationAdjust" aria-pressed="false"></button>' +
          '<span><span class="tl">Adjust for inflation</span>' +
          '<span class="td">Usually off \u2014 an emergency fund is needed now, not in 10 years. Turn on only if you will build it over a long period.</span></span></div>';
      }

      var tabs = '';
      if (cfg.tabs) {
        tabs = '<div class="gc-tabs">' + E.ORDER.map(function (k) {
          return '<button type="button" data-gc-tab="' + k + '" class="' + (k === key ? 'on' : '') + '">' +
            E.GOALS[k].icon + ' ' + E.GOALS[k].short + '</button>';
        }).join('') + '</div>';
      }

      root.innerHTML = tabs +
        '<div class="gc-card">' +
          '<h2>' + g.icon + ' ' + (cfg.inputTitle || g.label) + '</h2>' +
          '<p class="hint">' + (cfg.inputHint || 'Everything stays on your device. Nothing is saved, sent or shared.') + '</p>' +
          '<div class="gc-msgs" id="gc-msgs"></div>' +
          segBlock +
          '<div class="gc-grid two" id="gc-fields">' +
            inputs.map(function (f) {
              return f.money
                ? inputHTML(f).replace('data-field="' + f.k + '"', 'data-field="' + f.k + '" data-money="1"')
                : inputHTML(f);
            }).join('') +
          '</div>' +
          extra +
          (assum.length ? '<details class="gc-assum"><summary>Change assumptions</summary><div class="abody"><div class="gc-grid two" id="gc-assump">' +
            assum.map(inputHTML).join('') + '</div></div></details>' : '') +
          '<div style="margin-top:16px"><button class="gc-btn" type="button" id="gc-calc">Calculate my goal</button></div>' +
        '</div>' +
        '<div id="gc-out"></div>';

      /* Yes/No control for existing savings */
      if (asksExisting) {
        var wrap = root.querySelector('[data-field="existingAmount"]');
        var amtEl = root.querySelector('[data-gc-input="existingAmount"]');
        function applyExisting(val) {
          var has = val === 'yes';
          if (wrap) wrap.classList.toggle('gc-hidden', !has);
          if (!has && amtEl) { amtEl.value = '0'; }
          else if (has && amtEl && (amtEl.value === '0' || amtEl.value === '')) { amtEl.value = '200000'; }
        }
        root.querySelectorAll('[data-gc-seg="hasExisting"]').forEach(function (b) {
          b.addEventListener('click', function () {
            root.querySelectorAll('[data-gc-seg="hasExisting"]').forEach(function (o) { o.classList.remove('on'); });
            b.classList.add('on');
            applyExisting(b.getAttribute('data-gc-val'));
            schedule();
          });
        });
        applyExisting('no');
      }

      /* mark inputs so they can be read back */
      root.querySelectorAll('#gc-fields input, #gc-assump input').forEach(function (el) {
        el.setAttribute('data-gc-input', el.getAttribute('name'));
      });

      /* money fields: format on blur */
      root.querySelectorAll('input[data-gc-input]').forEach(function (el) {
        el.addEventListener('blur', function () {
          var n = E.num(el.value);
          var isMoney = el.closest('[data-money]');
          if (!isNaN(n) && isMoney) el.value = E.groupIndian(n);
          else if (!isNaN(n) && !el.value) el.value = '';
        });
        el.addEventListener('input', function () { schedule(); });
      });
      root.querySelectorAll('.gc-switch').forEach(function (b) {
        b.addEventListener('click', function () {
          b.classList.toggle('on');
          b.setAttribute('aria-pressed', b.classList.contains('on') ? 'true' : 'false');
          schedule();
        });
      });

      root.querySelector('#gc-calc').addEventListener('click', function () { run(true); });

      var t;
      function schedule() { clearTimeout(t); t = setTimeout(function () { run(false); }, 260); }

      function run(scroll) {
        state.inputs = readInputs(root);
        var r = E.calculate(key, state.inputs, cfg.engineOpts || {});
        renderResult(root.querySelector('#gc-out'), r, key, cfg, state.inputs);
        if (r.ok && scroll) {
          var el = root.querySelector('#gc-results');
          if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
        }
      }
      run(false);

      /* tabs */
      root.querySelectorAll('[data-gc-tab]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-gc-tab');
          var url = '/' + E.GOALS[k].slug + '/';
          if (cfg.tabsLink && cfg.tabsLink !== 'inline') { location.href = url; return; }
          state.key = k; key = k;
          var i = state.inputs;   // keep what the visitor already typed where the field exists
          build();
          Object.keys(i).forEach(function (kk) {
            var el = root.querySelector('[data-gc-input="' + kk + '"]');
            if (el && i[kk] !== '' && i[kk] != null) el.value = i[kk];
          });
          run(false);
        });
      });
    }

    build();
  }

  window.MFPGoalUI = { mount: mount };
})();

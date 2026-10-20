/* ============================================================================
   MY FINANCIAL PLAN — PUBLIC GOAL CALCULATION ENGINE
   ----------------------------------------------------------------------------
   Standalone, login-free, privacy-safe goal calculator engine.

   ARCHITECTURE
     GOAL TYPE → PARAMETERS → CENTRAL ENGINE → FUTURE VALUE → LUMP SUM FV
       → FUNDING GAP → SIP ENGINE → RESULT → VISUALISATION → OPTIONAL CTA

   ONE ENGINE, SIX GOALS. No goal has its own arithmetic.

   SOURCE OF TRUTH
     All default assumptions and every formula below are taken from the existing
     authenticated plan engine (assets/js/mfp-core-engine.js) so a public result
     and a signed-in result never disagree:
        inflation            6.0 %   (mfp-core-engine default)
        expected return     12.0 %   (mfp-core-engine default)
        post-retirement rtn  7.0 %   (mfp-core-engine retirement method)
        retirement duration   25 yrs (mfp-core-engine retirement method)
        SIP formula         annuity-due, identical expression to line ~288
     If that engine's defaults change, change ASSUMPTIONS here to match.

   PRIVACY
     Pure functions. No network. No storage. No cookies. No identifiers.
     Nothing a visitor types ever leaves the device.

   ACCURACY
     Full double precision internally. Rounding happens only in the format
     helpers, never mid-calculation.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MFP_GOALS = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     1. CENTRAL ASSUMPTIONS — the single source of truth
     ══════════════════════════════════════════════════════════════════════════ */
  var ASSUMPTIONS = {
    inflation: 6.0,             // % p.a.
    expectedReturn: 12.0,       // % p.a. long-term equity-oriented
    postRetirementReturn: 7.0,  // % p.a. after retirement
    retirementYears: 25,        // years of retirement to fund
    liquidReturn: 4.0,          // % p.a. short-term / liquid
    hlvMultiplier: 15,          // years of income
    emergencyMonths: 6,         // months of expenses
    emergencyBuildMonths: 12,   // months to build the emergency fund
    scenarioSpread: 2.0,        // ± percentage points for scenarios
    minTermYears: 0.25,
    maxTermYears: 75
  };

  /* ══════════════════════════════════════════════════════════════════════════
     2. GOAL DEFINITIONS
     ══════════════════════════════════════════════════════════════════════════ */
  var GOALS = {
    education: {
      key: 'education',
      label: "Child Education",
      short: 'Education',
      icon: '🎓',
      accent: '#3B82F6',
      defaultTargetAge: 21,
      ageLabel: "Child's current age",
      costLabel: 'Current estimated education cost',
      costHint: 'Today\u2019s cost for the course or degree you have in mind',
      targetAgeLabel: 'Education at age',
      engine: 'inflated',
      slug: 'child-education-calculator'
    },
    marriage: {
      key: 'marriage',
      label: "Child Marriage",
      short: 'Marriage',
      icon: '💍',
      accent: '#EC4899',
      defaultTargetAge: 25,
      ageLabel: "Child's current age",
      costLabel: 'Current estimated marriage cost',
      costHint: 'Today\u2019s cost of the celebration you have in mind',
      targetAgeLabel: 'Marriage at age',
      engine: 'inflated',
      slug: 'child-marriage-calculator'
    },
    retirement: {
      key: 'retirement',
      label: 'Self & Spouse Retirement',
      short: 'Retirement',
      icon: '🌅',
      accent: '#0E9D78',
      defaultTargetAge: 60,
      ageLabel: 'Your current age',
      costLabel: 'Monthly expense you want in retirement',
      costHint: 'At today\u2019s prices \u2014 we will inflate it for you',
      targetAgeLabel: 'Retire at age',
      engine: 'corpus',
      slug: 'retirement-goal-calculator'
    },
    legacy: {
      key: 'legacy',
      label: 'Legacy & Estate Fund',
      short: 'Legacy',
      icon: '🏛️',
      accent: '#D4AF37',
      defaultTargetAge: 75,
      ageLabel: 'Your current age',
      costLabel: 'Legacy amount you wish to leave',
      costHint: 'In today\u2019s value',
      targetAgeLabel: 'Target age',
      engine: 'inflated',
      slug: 'legacy-planning-calculator'
    },
    emergency: {
      key: 'emergency',
      label: 'Emergency Safety Net',
      short: 'Emergency',
      icon: '🛡️',
      accent: '#F59E0B',
      defaultTargetAge: null,
      ageLabel: 'Your current age',
      costLabel: 'Monthly household expense',
      costHint: 'Rent, EMIs, groceries, school fees, utilities',
      targetAgeLabel: null,
      engine: 'reserve',
      slug: 'emergency-fund-calculator'
    },
    hlv: {
      key: 'hlv',
      label: 'Family Protection',
      short: 'Protection',
      icon: '🛡️',
      accent: '#7C3AED',
      defaultTargetAge: null,
      ageLabel: 'Your current age',
      costLabel: 'Your monthly income',
      costHint: 'Take-home, per month',
      targetAgeLabel: null,
      engine: 'protection',
      slug: 'human-life-value-calculator'
    }
  };

  var ORDER = ['education', 'marriage', 'retirement', 'emergency', 'hlv', 'legacy'];

  /* ══════════════════════════════════════════════════════════════════════════
     3. MATH PRIMITIVES
     Every formula here is the same expression used by the authenticated engine.
     ══════════════════════════════════════════════════════════════════════════ */

  /** Inflation-adjusted future value:  present × (1 + r)^n  */
  function futureValue(present, ratePct, years) {
    return (present || 0) * Math.pow(1 + (ratePct || 0) / 100, years || 0);
  }

  /** Present value of a future amount:  future ÷ (1 + r)^n  */
  function presentValue(future, ratePct, years) {
    return (future || 0) / Math.pow(1 + (ratePct || 0) / 100, years || 0);
  }

  /**
   * Required monthly SIP to reach `target` in `years`.
   * Annuity-due (each instalment grows for one extra month) — the standard
   * Indian SIP convention, and the exact expression used by mfp-core-engine.
   */
  function sipFor(target, ratePct, years) {
    var months = Math.round((years || 0) * 12);
    if (target <= 0 || months <= 0) return 0;
    var mRate = (ratePct || 0) / 100 / 12;
    if (mRate === 0) return target / months;                 // zero-return guard
    return (target * mRate) / ((Math.pow(1 + mRate, months) - 1) * (1 + mRate));
  }

  /** Future value of a monthly SIP stream — the inverse of sipFor. */
  function sipFutureValue(monthly, ratePct, years) {
    var months = Math.round((years || 0) * 12);
    if (monthly <= 0 || months <= 0) return 0;
    var mRate = (ratePct || 0) / 100 / 12;
    if (mRate === 0) return monthly * months;
    return monthly * ((Math.pow(1 + mRate, months) - 1) / mRate) * (1 + mRate);
  }

  /** Split a SIP into what you put in and what growth adds. */
  function sipBreakdown(monthly, ratePct, years) {
    var months = Math.round((years || 0) * 12);
    var contributed = monthly * months;
    var total = sipFutureValue(monthly, ratePct, years);
    return {
      monthly: monthly,
      months: months,
      contributed: contributed,
      growth: Math.max(0, total - contributed),
      total: total
    };
  }

  /**
   * Retirement corpus using the engine's real-rate method.
   * Inflation-adjusted annuity over the retirement duration.
   */
  function retirementCorpus(monthlyExpenseToday, inflationPct, postReturnPct, years, durationYears) {
    var futureMonthly = futureValue(monthlyExpenseToday, inflationPct, years);
    var futureAnnual = futureMonthly * 12;
    var realRate = ((postReturnPct / 100) - (inflationPct / 100)) / (1 + (inflationPct / 100));
    var corpus;
    if (Math.abs(realRate) > 0.0001) {
      corpus = futureAnnual * ((1 - Math.pow(1 + realRate, -durationYears)) / realRate);
    } else {
      corpus = futureAnnual * durationYears;
    }
    return { futureMonthlyExpense: futureMonthly, futureAnnualExpense: futureAnnual, corpus: corpus, realRate: realRate };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4. FORMATTING — Indian conventions, display only
     ══════════════════════════════════════════════════════════════════════════ */
  function groupIndian(n) {
    var neg = n < 0;
    var s = Math.round(Math.abs(n)).toString();
    if (s.length <= 3) return (neg ? '-' : '') + s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return (neg ? '-' : '') + rest + ',' + last3;
  }

  /** ₹10,00,000 — full grouping */
  function formatINR(n) {
    if (n === null || n === undefined || isNaN(n)) return '\u2014';
    return '\u20B9' + groupIndian(n);
  }

  /** ₹1.25 Cr · ₹12.5 L · ₹75,000 — short form for headline figures */
  function formatShort(n) {
    if (n === null || n === undefined || isNaN(n)) return '\u2014';
    var neg = n < 0, a = Math.abs(n);
    var sign = neg ? '-' : '';
    if (a >= 1e7) {
      var cr = a / 1e7;
      return '\u20B9' + sign + trimNum(cr, cr >= 100 ? 0 : cr >= 10 ? 1 : 2) + ' Cr';
    }
    if (a >= 1e5) {
      var l = a / 1e5;
      return '\u20B9' + sign + trimNum(l, l >= 100 ? 0 : l >= 10 ? 1 : 2) + ' L';
    }
    return '\u20B9' + sign + groupIndian(a);
  }
  function trimNum(v, dp) {
    var s = v.toFixed(dp);
    if (s.indexOf('.') > -1) s = s.replace(/\.?0+$/, '');
    return s;
  }

  function formatPct(v) {
    if (v === null || v === undefined || isNaN(v)) return '\u2014';
    return trimNum(v, 2) + '%';
  }

  function formatYears(y) {
    if (y === null || y === undefined || isNaN(y)) return '\u2014';
    if (y < 1) return Math.round(y * 12) + ' months';
    var whole = Math.floor(y);
    var remMonths = Math.round((y - whole) * 12);
    if (remMonths === 0) return whole + (whole === 1 ? ' year' : ' years');
    if (remMonths === 12) return (whole + 1) + ' years';
    return whole + ' yr ' + remMonths + ' mo';
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5. VALIDATION — friendly, never silent, never misleading
     ══════════════════════════════════════════════════════════════════════════ */
  var LIMITS = {
    age: { min: 0, max: 100 },
    money: { min: 0, max: 1e12 },
    inflation: { min: 0, max: 20 },
    ret: { min: 0, max: 30 },
    months: { min: 1, max: 60 },
    multiplier: { min: 1, max: 40 },
    years: { min: 0.25, max: 75 }
  };

  function num(v) {
    if (v === '' || v === null || v === undefined) return NaN;
    var n = Number(String(v).replace(/[\u20B9,\s]/g, ''));
    return isFinite(n) ? n : NaN;
  }

  function validate(goalKey, i, A) {
    var g = GOALS[goalKey];
    var errors = [], warnings = [];
    if (!g) return { ok: false, errors: ['Unknown goal type.'], warnings: [] };
    A = A || ASSUMPTIONS;

    var age = num(i.currentAge);
    var cost = num(i.currentCost);

    /* IMPORTANT: "not supplied" must stay NaN. If we pre-fill the default here,
       calculate() can never tell an absent value from an explicit one, and every
       opts.assumptions override becomes dead — which silently made all three
       scenario outcomes compute identically. Validation still runs against the
       EFFECTIVE assumption below, so no warning is lost. */
    var notSupplied = function (x) { return x === '' || x === undefined || x === null; };
    var inflation = notSupplied(i.inflation) ? NaN : num(i.inflation);
    var ret = notSupplied(i.expectedReturn) ? NaN : num(i.expectedReturn);
    var existing = i.existingAmount === '' || i.existingAmount === undefined ? 0 : num(i.existingAmount);
    var targetAge = i.targetAge === '' || i.targetAge === undefined ? g.defaultTargetAge : num(i.targetAge);

    /* --- required fields --- */
    if (isNaN(cost)) errors.push('Please enter ' + g.costLabel.toLowerCase() + '.');
    else if (cost < 0) errors.push('Amount cannot be negative.');

    /* --- age ---
       Only the goals that need a time horizon require an age. The emergency
       reserve and the protection estimate are both calculated for today, so an
       age is optional there — we must not block a valid calculation on a field
       the form does not ask for. */
    var ageRequired = (goalKey === 'education' || goalKey === 'marriage' ||
                       goalKey === 'retirement' || goalKey === 'legacy');
    if (ageRequired) {
      if (isNaN(age)) errors.push('Please enter ' + g.ageLabel.toLowerCase() + '.');
      else if (age < LIMITS.age.min) errors.push('Age cannot be negative.');
      else if (age > LIMITS.age.max) errors.push('Please enter an age below ' + LIMITS.age.max + '.');
    } else if (!isNaN(age)) {
      if (age < LIMITS.age.min) errors.push('Age cannot be negative.');
      else if (age > LIMITS.age.max) errors.push('Please enter an age below ' + LIMITS.age.max + '.');
    }

    /* --- goal term --- */
    if (ageRequired) {
      if (isNaN(targetAge)) errors.push('Please enter ' + (g.targetAgeLabel || 'target age').toLowerCase() + '.');
      else if (!errors.length || !isNaN(age)) {
        if (age === targetAge) {
          errors.push('Your selected target age has already been reached. Please choose a future target age.');
        } else if (targetAge < age) {
          errors.push('Your selected target age has already been reached. Please choose a future target age.');
        } else {
          var term = targetAge - age;
          if (term < LIMITS.years.min) {
            errors.push('The time available is under 3 months. Please choose a slightly later target age.');
          } else if (term > LIMITS.years.max) {
            errors.push('A goal term above ' + LIMITS.years.max + ' years is outside what this calculator supports.');
          } else if (term > 50) {
            warnings.push(formatYears(term) + ' is a very long horizon. Long-term inflation and return assumptions become less reliable over time.');
          }
        }
      }
    }

    /* --- assumptions (checked on the EFFECTIVE values) --- */
    var effInflation = isNaN(inflation) ? A.inflation : inflation;
    var effRet = isNaN(ret) ? A.expectedReturn : ret;
    if (effInflation < LIMITS.inflation.min || effInflation > LIMITS.inflation.max) {
      errors.push('Inflation should be between ' + LIMITS.inflation.min + '% and ' + LIMITS.inflation.max + '%.');
    } else if (effInflation > 10) {
      warnings.push('An inflation assumption of ' + formatPct(effInflation) + ' is high. 6% is the usual long-term planning figure.');
    }
    if (effRet < LIMITS.ret.min || effRet > LIMITS.ret.max) {
      errors.push('Expected return should be between ' + LIMITS.ret.min + '% and ' + LIMITS.ret.max + '%.');
    } else if (effRet > 20) {
      warnings.push('A return assumption of ' + formatPct(effRet) + ' is aggressive. Returns are not guaranteed.');
    } else if (effRet < effInflation) {
      warnings.push('Your return assumption is lower than inflation, so the goal amount will keep growing faster than your savings.');
    }
    if (!isNaN(existing) && existing < 0) errors.push('Existing savings cannot be negative.');
    if (!isNaN(existing) && existing > LIMITS.money.max) errors.push('That existing amount is too large to calculate.');

    /* --- goal-specific --- */
    if (goalKey === 'emergency') {
      var mob = num(i.emergencyMonths);
      if (isNaN(mob)) errors.push('Please enter how many months of expenses you want set aside.');
      else if (mob < LIMITS.months.min || mob > LIMITS.months.max) {
        errors.push('Emergency cover should be between ' + LIMITS.months.min + ' and ' + LIMITS.months.max + ' months.');
      }
    }
    if (goalKey === 'hlv') {
      var m = num(i.hlvMultiplier);
      if (isNaN(m)) errors.push('Please enter a Human Life Value multiplier.');
      else if (m < LIMITS.multiplier.min || m > LIMITS.multiplier.max) {
        errors.push('The multiplier should be between ' + LIMITS.multiplier.min + ' and ' + LIMITS.multiplier.max + '.');
      }
      var cover = i.existingCover === '' || i.existingCover === undefined ? 0 : num(i.existingCover);
      if (!isNaN(cover) && cover < 0) errors.push('Existing cover cannot be negative.');
    }

    if (!isNaN(cost) && cost === 0) {
      warnings.push('You have entered zero. Enter today\u2019s cost to get a meaningful result.');
    }

    return { ok: errors.length === 0, errors: errors, warnings: warnings, values: {
      age: age, cost: cost, inflation: inflation, ret: ret, existing: existing, targetAge: targetAge
    } };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6. CENTRAL ENGINE — turns any goal into a unified result
     ══════════════════════════════════════════════════════════════════════════ */
  function calculate(goalKey, input, opts) {
    input = input || {};
    opts = opts || {};
    var g = GOALS[goalKey];
    if (!g) return { ok: false, goalType: goalKey, errors: ['Unknown goal type.'], warnings: [] };

    var A = Object.assign({}, ASSUMPTIONS, opts.assumptions || {});

    var v = validate(goalKey, input, A);
    if (!v.ok) {
      return { ok: false, goalType: goalKey, goal: g, errors: v.errors, warnings: v.warnings };
    }
    var age = v.values.age;
    var cost = v.values.cost;
    var inflation = isNaN(v.values.inflation) ? A.inflation : v.values.inflation;
    var ret = isNaN(v.values.ret) ? A.expectedReturn : v.values.ret;
    var existing = isNaN(v.values.existing) ? 0 : v.values.existing;
    var targetAge = v.values.targetAge;

    var result = {
      ok: true,
      goalType: goalKey,
      goal: g,
      errors: [],
      warnings: v.warnings.slice(),
      assumptions: {
        inflation: inflation,
        expectedReturn: ret,
        postRetirementReturn: A.postRetirementReturn,
        retirementYears: A.retirementYears,
        targetAge: targetAge,
        hlvMultiplier: goalKey === 'hlv' ? (num(input.hlvMultiplier) || A.hlvMultiplier) : null,
        emergencyMonths: goalKey === 'emergency' ? (num(input.emergencyMonths) || A.emergencyMonths) : null,
        liquidReturn: A.liquidReturn,
        emergencyBuildMonths: A.emergencyBuildMonths
      }
    };

    /* ── engine: reserve (emergency fund) ─────────────────────────────────── */
    if (g.engine === 'reserve') {
      var months = result.assumptions.emergencyMonths;
      var required = cost * months;
      var buildMonths = num(input.buildMonths) || A.emergencyBuildMonths;
      buildMonths = Math.min(Math.max(buildMonths, 1), 120);

      var useInflation = !!input.inflationAdjust;
      var inflated = useInflation ? futureValue(required, inflation, num(input.buildYears) || 1) : required;

      var shortfall = Math.max(0, inflated - existing);
      var surplus = existing >= inflated;

      /* Deliberately simple: no investment return assumed on money you may
         need tomorrow. This is NOT a long-term SIP. */
      var suggestedMonthly = shortfall > 0 ? shortfall / buildMonths : 0;

      result.engine = 'reserve';
      result.timeline = { currentAge: age, targetAge: null, years: buildMonths / 12, months: buildMonths, targetYear: new Date().getFullYear() };
      result.currentCost = cost;
      result.futureGoalValue = inflated;
      result.emergency = {
        monthlyExpense: cost,
        months: months,
        requiredBase: required,
        required: inflated,
        inflationAdjusted: useInflation,
        existing: existing,
        shortfall: shortfall,
        surplus: surplus,
        buildMonths: buildMonths,
        suggestedMonthly: suggestedMonthly,
        monthsCoveredNow: cost > 0 ? existing / cost : 0,
        monthsCoveredAfter: cost > 0 ? (existing + shortfall) / cost : 0
      };
      result.existingAmount = existing;
      result.existingFutureValue = existing;
      result.gap = shortfall;
      result.requiredSip = 0;                  // not a SIP goal by design
      result.suggestedMonthlySaving = suggestedMonthly;
      result.isSipGoal = false;
      result.steps = buildSteps(g, result, [
        ['Months of cover wanted', months + ' months'],
        ['Monthly household expense', formatINR(cost)],
        ['Required emergency fund', formatINR(required) + '  (' + formatINR(cost) + ' \u00D7 ' + months + ')'],
        useInflation
          ? ['Inflation adjustment applied', formatINR(required) + ' grows to ' + formatINR(inflated) + ' at ' + formatPct(inflation) + ' over ' + formatYears(num(input.buildYears) || 1)]
          : ['Inflation adjustment', 'Not applied \u2014 money you may need soon should stay safe, not invested'],
        ['Already saved', formatINR(existing)],
        ['Current shortfall', formatINR(shortfall)],
        ['Suggested monthly saving', formatINR(suggestedMonthly) + ' per month for ' + buildMonths + ' months']
      ]);
      return result;
    }

    /* ── engine: protection (Human Life Value) ────────────────────────────── */
    if (g.engine === 'protection') {
      var mult = result.assumptions.hlvMultiplier;
      var annualIncome = cost * 12;
      var hlv = annualIncome * mult;
      var liabilities = num(input.liabilities) || 0;
      var obligations = num(input.futureObligations) || 0;
      var cover = num(input.existingCover) || 0;
      var employer = num(input.employerCover) || 0;
      var totalNeed = hlv + liabilities + obligations;
      var totalCover = cover + employer;
      var gap = Math.max(0, totalNeed - totalCover);

      result.engine = 'protection';
      result.timeline = { currentAge: age, targetAge: null, years: null, months: null, targetYear: null };
      result.currentCost = cost;
      result.futureGoalValue = totalNeed;
      result.hlv = {
        monthlyIncome: cost,
        annualIncome: annualIncome,
        multiplier: mult,
        indicativeHLV: hlv,
        liabilities: liabilities,
        futureObligations: obligations,
        totalNeed: totalNeed,
        existingCover: cover,
        employerCover: employer,
        totalCover: totalCover,
        gap: gap,
        sufficient: totalCover >= totalNeed,
        humanLifeValueToday: presentValue(hlv, inflation, Math.max(1, 65 - (isNaN(age) ? 35 : age)))
      };
      result.existingAmount = totalCover;
      result.existingFutureValue = totalCover;
      result.gap = gap;
      result.requiredSip = 0;
      result.suggestedMonthlySaving = 0;
      result.isSipGoal = false;
      result.steps = buildSteps(g, result, [
        ['Monthly income', formatINR(cost)],
        ['Annual income', formatINR(annualIncome) + '  (' + formatINR(cost) + ' \u00D7 12)'],
        ['Human Life Value multiplier', mult + ' years of income'],
        ['Indicative Human Life Value', formatINR(hlv) + '  (' + formatINR(annualIncome) + ' \u00D7 ' + mult + ')'],
        liabilities > 0 ? ['Liabilities added', formatINR(liabilities)] : null,
        obligations > 0 ? ['Future family obligations added', formatINR(obligations)] : null,
        ['Total indicative need', formatINR(totalNeed)],
        ['Life cover you already have', '\u2212 ' + formatINR(cover)],
        employer > 0 ? ['Employer cover', '\u2212 ' + formatINR(employer)] : null,
        ['Indicative insurance gap', formatINR(gap)]
      ].filter(Boolean));
      return result;
    }

    /* ── engines: inflated + corpus (long-term goals) ─────────────────────── */
    var years = targetAge - age;
    var monthsTerm = Math.round(years * 12);
    var targetYear = new Date().getFullYear() + Math.floor(years);

    var futureGoal, corpusDetail = null;

    if (g.engine === 'corpus') {
      corpusDetail = retirementCorpus(cost, inflation, A.postRetirementReturn, years, A.retirementYears);
      futureGoal = corpusDetail.corpus;
    } else {
      futureGoal = futureValue(cost, inflation, years);
    }

    var existingFV = futureValue(existing, ret, years);
    var gap = Math.max(0, futureGoal - existingFV);
    var surplus = existingFV >= futureGoal;
    var requiredSip = sipFor(gap, ret, years);
    var breakdown = sipBreakdown(requiredSip, ret, years);

    result.engine = g.engine;
    result.timeline = {
      currentAge: age,
      targetAge: targetAge,
      years: years,
      months: monthsTerm,
      targetYear: targetYear
    };
    result.currentCost = cost;
    result.futureGoalValue = futureGoal;
    result.retirement = corpusDetail ? {
      monthlyExpenseToday: cost,
      futureMonthlyExpense: corpusDetail.futureMonthlyExpense,
      futureAnnualExpense: corpusDetail.futureAnnualExpense,
      realRate: corpusDetail.realRate,
      durationYears: A.retirementYears,
      postRetirementReturn: A.postRetirementReturn
    } : null;
    result.existingAmount = existing;
    result.existingFutureValue = existingFV;
    result.gap = gap;
    result.surplus = surplus;
    result.requiredSip = requiredSip;
    result.isSipGoal = true;
    result.sip = {
      monthly: requiredSip,
      months: monthsTerm,
      contributed: breakdown.contributed,
      growth: breakdown.growth,
      total: breakdown.total
    };
    result.requiredLumpsumToday = gap > 0 ? presentValue(gap, ret, years) : 0;

    /* year-by-year series for the chart */
    result.series = buildSeries(cost, inflation, existing, ret, requiredSip, years, g.engine, A);

    result.steps = buildSteps(g, result, buildInflatedSteps(g, result));

    /* --- contextual warnings --- */
    if (surplus && existing > 0) {
      result.warnings.push('Your existing amount may be sufficient to meet this goal under the selected assumptions.');
      result.warningKind = 'surplus';
    }
    if (years < 3 && g.engine === 'inflated') {
      result.warnings.push('This is a short horizon. Equity-oriented returns are volatile over a few years \u2014 consider safer instruments for money you need this soon.');
    }
    if (g.engine === 'corpus') {
      result.warnings.push('Illustrative retirement requirement based on your assumptions.');
    }
    return result;
  }

  /* ── transparency steps ─────────────────────────────────────────────────── */
  function buildInflatedSteps(g, r) {
    var out = [];
    if (g.engine === 'corpus') {
      out.push(['Monthly expense you want, today', formatINR(r.currentCost)]);
      out.push(['Time to retirement', formatYears(r.timeline.years) + '  (' + r.timeline.targetAge + ' \u2212 ' + r.timeline.currentAge + ')']);
      out.push(['Same expense at retirement', formatINR(r.retirement.futureMonthlyExpense) + '  after ' + formatPct(r.assumptions.inflation) + ' inflation']);
      out.push(['Corpus needed at retirement', formatINR(r.futureGoalValue) + '  to fund ' + r.assumptions.retirementYears + ' years of retirement']);
    } else {
      out.push(['Today\u2019s cost of your goal', formatINR(r.currentCost)]);
      out.push(['Time available', formatYears(r.timeline.years) + '  (' + r.timeline.targetAge + ' \u2212 ' + r.timeline.currentAge + ')']);
      out.push(['Estimated future cost', formatINR(r.futureGoalValue) + '  at ' + formatPct(r.assumptions.inflation) + ' inflation']);
    }
    out.push(['Existing savings today', formatINR(r.existingAmount)]);
    out.push([
      'What those savings may become',
      r.existingAmount > 0
        ? formatINR(r.existingFutureValue) + '  growing at ' + formatPct(r.assumptions.expectedReturn)
        : 'Nothing set aside yet'
    ]);
    out.push([
      'Remaining funding requirement',
      formatINR(r.gap) + (r.surplus ? '  (already covered)' : '  (' + formatINR(r.futureGoalValue) + ' \u2212 ' + formatINR(r.existingFutureValue) + ')')
    ]);
    out.push([
      'Required monthly SIP',
      r.surplus || r.gap <= 0
        ? formatINR(0) + '  \u2014 existing savings may already cover this goal'
        : formatINR(r.requiredSip) + '  at ' + formatPct(r.assumptions.expectedReturn) + ' for ' + formatYears(r.timeline.years)
    ]);
    if (r.gap > 0) {
      out.push(['You contribute over the term', formatINR(r.sip.contributed)]);
      out.push(['Assumed growth on that SIP', formatINR(r.sip.growth)]);
      out.push(['Reaches at target date', formatINR(r.sip.total + r.existingFutureValue) + '  towards a goal of ' + formatINR(r.futureGoalValue)]);
    }
    return out;
  }

  function buildSteps(g, r, rows) {
    return rows.map(function (pair) { return { label: pair[0], value: pair[1] }; });
  }

  /* ── chart series ───────────────────────────────────────────────────────── */
  function buildSeries(cost, inflation, existing, ret, sip, years, engine, A) {
    var n = Math.max(1, Math.ceil(years));
    var step = n > 40 ? Math.ceil(n / 40) : 1;   // sample long horizons
    var out = [];
    var postReturn = A ? A.postRetirementReturn : ASSUMPTIONS.postRetirementReturn;
    var duration = A ? A.retirementYears : ASSUMPTIONS.retirementYears;

    for (var y = 0; y <= n; y += step) {
      var goalHere;
      if (engine === 'corpus') {
        var rc = retirementCorpus(cost, inflation, postReturn, y, duration);
        goalHere = rc.corpus;
      } else {
        goalHere = futureValue(cost, inflation, y);
      }
      out.push({
        year: y,
        label: 'Yr ' + y,
        goal: goalHere,
        existing: futureValue(existing, ret, y),
        sip: sipFutureValue(sip, ret, y)
      });
    }
    /* always include the final year */
    if (out[out.length - 1].year !== n) {
      var goalEnd = engine === 'corpus'
        ? retirementCorpus(cost, inflation, postReturn, n, duration).corpus
        : futureValue(cost, inflation, n);
      out.push({
        year: n, label: 'Yr ' + n,
        goal: goalEnd,
        existing: futureValue(existing, ret, n),
        sip: sipFutureValue(sip, ret, n)
      });
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7. SCENARIOS — clearly-labelled assumption sets, never promises
     ══════════════════════════════════════════════════════════════════════════ */
  function scenarios(goalKey, input, baseOpts) {
    var A = Object.assign({}, ASSUMPTIONS, (baseOpts && baseOpts.assumptions) || {});
    var base = calculate(goalKey, input, baseOpts);
    if (!base.ok || !base.isSipGoal) return null;

    var defs = [
      { name: 'Conservative', delta: -A.scenarioSpread },
      { name: 'Base', delta: 0 },
      { name: 'Optimistic', delta: A.scenarioSpread }
    ];
    return defs.map(function (d) {
      var ret = Math.max(0, base.assumptions.expectedReturn + d.delta);
      /* The scenario's return must win over whatever the form supplied.
         Overriding only opts.assumptions was not enough: the form posts an
         explicit `expectedReturn`, which validate() treats as user-supplied
         and which therefore shadowed the override — so all three scenarios
         computed the same SIP. Set it on the input too. */
      var scenInput = Object.assign({}, input, { expectedReturn: ret });
      var r = calculate(goalKey, scenInput, {
        assumptions: Object.assign({}, (baseOpts && baseOpts.assumptions) || {}, { expectedReturn: ret })
      });
      return {
        name: d.name,
        returnPct: ret,
        requiredSip: r.ok ? r.requiredSip : 0,
        gap: r.ok ? r.gap : 0,
        isBase: d.delta === 0
      };
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8. EXPORT
     ══════════════════════════════════════════════════════════════════════════ */
  return {
    ASSUMPTIONS: ASSUMPTIONS,
    GOALS: GOALS,
    ORDER: ORDER,
    LIMITS: LIMITS,
    /* math */
    futureValue: futureValue,
    presentValue: presentValue,
    sipFor: sipFor,
    sipFutureValue: sipFutureValue,
    sipBreakdown: sipBreakdown,
    retirementCorpus: retirementCorpus,
    /* formatting */
    formatINR: formatINR,
    formatShort: formatShort,
    formatPct: formatPct,
    formatYears: formatYears,
    groupIndian: groupIndian,
    /* core */
    num: num,
    validate: validate,
    calculate: calculate,
    scenarios: scenarios
  };
}));

/**
 * MY FINANCIAL PLAN — CENTRAL FINANCIAL PROFILE & CALCULATION ENGINE
 * Brand Promise: Plan Every Stage. Protect Every Dream.
 *
 * Centralized data engine with reactive event synchronization across:
 * - Income, Expenses, Cash Flow, Savings, Occupation
 * - Present Investments (10 Categories)
 * - Goals (Child Education, Marriage, Retirement, Emergency, Healthcare, Protection, Legacy)
 * - Future Retirement Fund Corpus Calculation
 * - Financial Health Score (1 - 100)
 * - PDF Reports & Partner CRM Synchronization
 */

'use strict';

window.MFP_ENGINE = {
  // Central Profile Data State
  profile: {
    name: '',
    age: 32,
    retirementAge: 60,
    occupation: 'Salaried Job', // Skilled Service, Salaried Job, Business Owner, Professional
    monthlyIncome: 85000,
    monthlyExpenses: 42000,
    monthlySavings: 43000,
    emergencyFundMonths: 4,
    
    // Present Investments (10 Categories)
    investments: {
      mutualFunds: 350000,
      stocks: 150000,
      fdRd: 200000,
      ppf: 120000,
      epf: 280000,
      nps: 90000,
      gold: 110000,
      bonds: 50000,
      realEstate: 0,
      other: 20000
    },

    // Insurance & Protection
    insurance: {
      termLifeCover: 5000000, // ₹50 Lakhs
      healthCover: 500000,    // ₹5 Lakhs
      criticalIllnessCover: 0
    },

    // Life Goals
    goals: [
      {
        id: 'retirement',
        name: "Self & Spouse Retirement",
        category: 'Retirement',
        currentRequirement: 40000, // Desired monthly expense in retirement at today's cost
        targetAge: 60,
        yearsLeft: 28,
        expectedInflation: 6.0,
        expectedReturn: 12.0,
        allocatedInvestment: 400000
      },
      {
        id: 'child_edu',
        name: "Child Higher Education",
        category: 'Child Education',
        currentRequirement: 2500000, // ₹25 Lakhs today
        targetAge: 18,
        yearsLeft: 14,
        expectedInflation: 8.0,
        expectedReturn: 12.0,
        allocatedInvestment: 200000
      },
      {
        id: 'daughter_marriage',
        name: "Daughter's Marriage",
        category: "Daughter's Marriage",
        currentRequirement: 2000000, // ₹20 Lakhs today
        targetAge: 25,
        yearsLeft: 21,
        expectedInflation: 7.0,
        expectedReturn: 11.0,
        allocatedInvestment: 150000
      },
      {
        id: 'emergency_fund',
        name: 'Emergency Safety Net',
        category: 'Emergency Fund',
        currentRequirement: 250000, // 6 months expenses
        targetAge: 33,
        yearsLeft: 1,
        expectedInflation: 5.0,
        expectedReturn: 7.0,
        allocatedInvestment: 200000
      }
    ],

    // System Feature Flags
    featureFlags: {
      VANSHAVALI_ENABLED: false, // Isolated from main launch UI
      CALCULATORS_HUB_ENABLED: true,
      FINANCIAL_LITERACY_ENABLED: true,
      PARTNER_CRM_ENABLED: true
    }
  },

  // Event Listeners for Reactive Sync
  listeners: [],

  subscribe: function(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  },

  notify: function() {
    const summary = this.getFinancialSummary();
    this.listeners.forEach(cb => {
      try { cb(summary); } catch(e) { console.warn('Sync listener error:', e); }
    });
  },

  // Update Present Investments (Reactive Sync Trigger)
  updateInvestment: function(category, value) {
    if (this.profile.investments.hasOwnProperty(category)) {
      this.profile.investments[category] = Math.max(0, parseFloat(value) || 0);
      this.notify();
    }
  },

  // Calculate Total Present Investments
  getTotalPresentInvestments: function() {
    let sum = 0;
    for (let k in this.profile.investments) {
      sum += this.profile.investments[k] || 0;
    }
    return sum;
  },

  // Calculate Future Retirement Fund Corpus
  calculateRetirementCorpus: function() {
    const p = this.profile;
    const rGoal = p.goals.find(g => g.id === 'retirement');
    if (!rGoal) return { futureCorpus: 0, requiredSip: 0, shortage: 0 };

    const yearsToRetire = Math.max(1, p.retirementAge - p.age);
    const inflation = (rGoal.expectedInflation || 6.0) / 100;
    const postReturn = 7.0 / 100; // Post-retirement return assumption
    const preReturn = (rGoal.expectedReturn || 12.0) / 100;

    // Inflation-adjusted monthly expense at retirement age
    const futureMonthlyExpense = rGoal.currentRequirement * Math.pow(1 + inflation, yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // Desired retirement duration (25 years post retirement)
    const retirementDurationYears = 25;
    const realRate = (postReturn - inflation) / (1 + inflation);

    // Required Future Retirement Fund Corpus at age 60
    let futureCorpus = 0;
    if (Math.abs(realRate) > 0.0001) {
      futureCorpus = futureAnnualExpense * ((1 - Math.pow(1 + realRate, -retirementDurationYears)) / realRate);
    } else {
      futureCorpus = futureAnnualExpense * retirementDurationYears;
    }

    // Allocated existing investments grow till retirement
    const allocatedExisting = rGoal.allocatedInvestment || 0;
    const futureAllocatedValue = allocatedExisting * Math.pow(1 + preReturn, yearsToRetire);
    const shortage = Math.max(0, futureCorpus - futureAllocatedValue);

    // Monthly SIP required to bridge shortage
    const monthlyRate = preReturn / 12;
    const months = yearsToRetire * 12;
    let requiredSip = 0;
    if (shortage > 0 && months > 0) {
      requiredSip = (shortage * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
    }

    return {
      futureMonthlyExpense: Math.round(futureMonthlyExpense),
      futureCorpus: Math.round(futureCorpus),
      futureAllocatedValue: Math.round(futureAllocatedValue),
      shortage: Math.round(shortage),
      requiredSip: Math.round(requiredSip),
      yearsToRetire
    };
  },

  // Calculate Goal Details Engine
  calculateGoalDetail: function(goal) {
    const years = Math.max(1, goal.yearsLeft || 10);
    const inflation = (goal.expectedInflation || 6.0) / 100;
    const expReturn = (goal.expectedReturn || 12.0) / 100;

    // 1. Current requirement
    const currentReq = goal.currentRequirement || 0;

    // 2. Future requirement (Inflation-adjusted)
    const futureReq = currentReq * Math.pow(1 + inflation, years);

    // 3. Existing allocated investment value in future
    const existingAllocated = goal.allocatedInvestment || 0;
    const futureAllocatedVal = existingAllocated * Math.pow(1 + expReturn, years);

    // 4. Shortage / Surplus
    const shortage = Math.max(0, futureReq - futureAllocatedVal);

    // 5. Required Lumpsum Today to meet shortage
    const requiredLumpsumToday = shortage / Math.pow(1 + expReturn, years);

    // 6. Required Monthly SIP
    const mRate = expReturn / 12;
    const months = years * 12;
    let requiredSip = 0;
    if (shortage > 0 && months > 0) {
      requiredSip = (shortage * mRate) / ((Math.pow(1 + mRate, months) - 1) * (1 + mRate));
    }

    return {
      currentRequirement: Math.round(currentReq),
      futureRequirement: Math.round(futureReq),
      futureAllocatedVal: Math.round(futureAllocatedVal),
      shortage: Math.round(shortage),
      requiredLumpsumToday: Math.round(requiredLumpsumToday),
      requiredSip: Math.round(requiredSip),
      progressPct: Math.min(100, Math.round((futureAllocatedVal / (futureReq || 1)) * 100))
    };
  },

  // Calculate Synchronized Financial Health Score (1 - 100)
  calculateFinancialHealthScore: function() {
    const p = this.profile;
    let score = 0;

    // 1. Savings Rate (Max 25 pts)
    const savingsRate = p.monthlyIncome > 0 ? (p.monthlySavings / p.monthlyIncome) : 0;
    if (savingsRate >= 0.35) score += 25;
    else if (savingsRate >= 0.20) score += 18;
    else if (savingsRate >= 0.10) score += 10;
    else score += 5;

    // 2. Emergency Fund Months (Max 20 pts)
    const emergencyMonths = p.monthlyExpenses > 0 ? (this.profile.investments.fdRd + this.profile.investments.mutualFunds * 0.3) / p.monthlyExpenses : 0;
    if (emergencyMonths >= 6) score += 20;
    else if (emergencyMonths >= 3) score += 12;
    else if (emergencyMonths >= 1) score += 6;

    // 3. Life Insurance Cover Ratio (Max 20 pts)
    const annualIncome = p.monthlyIncome * 12;
    const lifeCoverRatio = annualIncome > 0 ? (p.insurance.termLifeCover / annualIncome) : 0;
    if (lifeCoverRatio >= 10) score += 20;
    else if (lifeCoverRatio >= 5) score += 12;
    else if (lifeCoverRatio >= 2) score += 6;

    // 4. Retirement Readiness (Max 20 pts)
    const ret = this.calculateRetirementCorpus();
    if (ret.shortage === 0) score += 20;
    else if (ret.futureAllocatedValue >= ret.futureCorpus * 0.5) score += 14;
    else if (ret.futureAllocatedValue >= ret.futureCorpus * 0.2) score += 8;
    else score += 4;

    // 5. Total Net Worth & Liquidity (Max 15 pts)
    const totalInv = this.getTotalPresentInvestments();
    if (totalInv >= annualIncome * 3) score += 15;
    else if (totalInv >= annualIncome) score += 10;
    else if (totalInv > 0) score += 5;

    return Math.min(100, Math.max(10, Math.round(score)));
  },

  // Get Age Guidance Category
  getAgeGuidance: function() {
    const age = this.profile.age || 30;
    if (age <= 25) {
      return {
        badge: 'Early Starter (18–25)',
        class: 'b-mint',
        message: 'Great age to leverage the power of compounding! Focus on aggressive growth SIPs and establishing a 6-month emergency fund.'
      };
    } else if (age <= 35) {
      return {
        badge: 'At the Edge (26–35)',
        class: 'b-lav',
        message: 'Key career & family building years. Prioritize 10X income term insurance, child goal planning, and structured retirement SIPs.'
      };
    } else if (age <= 45) {
      return {
        badge: 'Late Starter (36–45)',
        class: 'b-cream',
        message: 'Prime earning phase! Boost Step-Up SIPs to close goal shortages, review health cover, and accelerate retirement corpus building.'
      };
    } else {
      return {
        badge: 'Delayed Action Needed (46+)',
        class: 'b-red',
        message: 'Consolidate assets into debt & equity balance. Maximize retirement corpus accumulation and plan estate/legacy distribution.'
      };
    }
  },

  // Master Financial Summary Object
  getFinancialSummary: function() {
    const totalInvestments = this.getTotalPresentInvestments();
    const retCorpus = this.calculateRetirementCorpus();
    const healthScore = this.calculateFinancialHealthScore();
    const ageGuidance = this.getAgeGuidance();

    let totalGoalFutureReq = 0;
    let totalGoalShortage = 0;
    let totalCombinedSipNeeded = 0;

    const goalSummaries = this.profile.goals.map(g => {
      const calc = this.calculateGoalDetail(g);
      totalGoalFutureReq += calc.futureRequirement;
      totalGoalShortage += calc.shortage;
      totalCombinedSipNeeded += calc.requiredSip;
      return { goal: g, calc };
    });

    return {
      profile: this.profile,
      totalInvestments,
      retCorpus,
      healthScore,
      ageGuidance,
      totalGoalFutureReq,
      totalGoalShortage,
      totalCombinedSipNeeded,
      goalSummaries,
      lastCalculated: new Date().toISOString()
    };
  }
};

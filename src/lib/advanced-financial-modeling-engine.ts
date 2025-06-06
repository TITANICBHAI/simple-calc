/**
 * Advanced Financial Modeling Engine
 * Comprehensive financial calculations with real-world applications
 */

export interface LoanCalculation {
  principal: number;
  annualRate: number;
  termYears: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: AmortizationEntry[];
  payoffStrategies: PayoffStrategy[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface PayoffStrategy {
  strategy: string;
  extraPayment: number;
  newTermMonths: number;
  totalSavings: number;
  description: string;
}

export interface InvestmentAnalysis {
  principal: number;
  annualReturn: number;
  years: number;
  monthlyContribution: number;
  finalValue: number;
  totalContributions: number;
  totalGains: number;
  compoundingEffect: number;
  projectionChart: { year: number; value: number; contributions: number }[];
  riskAnalysis: RiskAssessment;
}

export interface RiskAssessment {
  volatility: number;
  sharpeRatio: number;
  worstCaseScenario: number;
  bestCaseScenario: number;
  confidenceInterval: [number, number];
}

export interface RetirementPlan {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  retirementGoal: number;
  projectedValue: number;
  monthlyIncomeAtRetirement: number;
  shortfall: number;
  recommendations: string[];
}

export interface BusinessValuation {
  revenue: number;
  expenses: number;
  growth_rate: number;
  discount_rate: number;
  terminal_multiple: number;
  dcf_value: number;
  revenue_multiple_value: number;
  asset_value: number;
  final_valuation: number;
  analysis: string[];
}

export class FinancialModelingEngine {
  /**
   * Advanced loan calculation with optimization strategies
   */
  static calculateLoan(
    principal: number,
    annualRate: number,
    termYears: number
  ): LoanCalculation {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    
    // Calculate monthly payment using standard formula
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;
    
    // Generate amortization schedule
    const amortizationSchedule = this.generateAmortizationSchedule(
      principal, monthlyRate, monthlyPayment, numPayments
    );
    
    // Calculate payoff strategies
    const payoffStrategies = this.calculatePayoffStrategies(
      principal, annualRate, termYears, monthlyPayment
    );
    
    return {
      principal,
      annualRate,
      termYears,
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortizationSchedule,
      payoffStrategies
    };
  }

  /**
   * Generate detailed amortization schedule
   */
  private static generateAmortizationSchedule(
    principal: number,
    monthlyRate: number,
    monthlyPayment: number,
    numPayments: number
  ): AmortizationEntry[] {
    const schedule: AmortizationEntry[] = [];
    let balance = principal;
    
    for (let month = 1; month <= numPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return schedule;
  }

  /**
   * Calculate various loan payoff strategies
   */
  private static calculatePayoffStrategies(
    principal: number,
    annualRate: number,
    termYears: number,
    monthlyPayment: number
  ): PayoffStrategy[] {
    const strategies: PayoffStrategy[] = [];
    const monthlyRate = annualRate / 100 / 12;
    
    // Strategy 1: Extra $100/month
    const extra100 = this.calculateEarlyPayoff(principal, monthlyRate, monthlyPayment + 100);
    strategies.push({
      strategy: "Extra $100/month",
      extraPayment: 100,
      newTermMonths: extra100.months,
      totalSavings: extra100.savings,
      description: `Pay off ${(termYears * 12 - extra100.months)} months early, save $${extra100.savings.toFixed(2)}`
    });
    
    // Strategy 2: Extra $250/month
    const extra250 = this.calculateEarlyPayoff(principal, monthlyRate, monthlyPayment + 250);
    strategies.push({
      strategy: "Extra $250/month",
      extraPayment: 250,
      newTermMonths: extra250.months,
      totalSavings: extra250.savings,
      description: `Pay off ${(termYears * 12 - extra250.months)} months early, save $${extra250.savings.toFixed(2)}`
    });
    
    // Strategy 3: Bi-weekly payments
    const biweekly = this.calculateBiweeklyPayoff(principal, annualRate, monthlyPayment);
    strategies.push({
      strategy: "Bi-weekly payments",
      extraPayment: monthlyPayment / 2,
      newTermMonths: biweekly.months,
      totalSavings: biweekly.savings,
      description: `Pay half monthly amount every two weeks, save $${biweekly.savings.toFixed(2)}`
    });
    
    return strategies;
  }

  /**
   * Calculate early payoff with extra payments
   */
  private static calculateEarlyPayoff(
    principal: number,
    monthlyRate: number,
    newPayment: number
  ): { months: number; savings: number } {
    let balance = principal;
    let months = 0;
    let totalPaid = 0;
    
    while (balance > 0.01 && months < 360) { // Max 30 years
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(newPayment - interestPayment, balance);
      balance -= principalPayment;
      totalPaid += interestPayment + principalPayment;
      months++;
    }
    
    const originalTotal = principal * (monthlyRate * Math.pow(1 + monthlyRate, 360)) / (Math.pow(1 + monthlyRate, 360) - 1) * 360;
    const savings = originalTotal - totalPaid;
    
    return { months, savings };
  }

  /**
   * Calculate bi-weekly payment strategy
   */
  private static calculateBiweeklyPayoff(
    principal: number,
    annualRate: number,
    monthlyPayment: number
  ): { months: number; savings: number } {
    const biweeklyPayment = monthlyPayment / 2;
    const biweeklyRate = annualRate / 100 / 26; // 26 bi-weekly periods per year
    
    let balance = principal;
    let periods = 0;
    let totalPaid = 0;
    
    while (balance > 0.01 && periods < 780) { // Max 30 years * 26 periods
      const interestPayment = balance * biweeklyRate;
      const principalPayment = Math.min(biweeklyPayment - interestPayment, balance);
      balance -= principalPayment;
      totalPaid += interestPayment + principalPayment;
      periods++;
    }
    
    const months = Math.ceil(periods / 2.17); // Convert bi-weekly periods to months
    const originalTotal = principal * (annualRate/100/12 * Math.pow(1 + annualRate/100/12, 360)) / (Math.pow(1 + annualRate/100/12, 360) - 1) * 360;
    const savings = originalTotal - totalPaid;
    
    return { months, savings };
  }

  /**
   * Advanced investment analysis with Monte Carlo simulation
   */
  static analyzeInvestment(
    principal: number,
    annualReturn: number,
    years: number,
    monthlyContribution: number = 0
  ): InvestmentAnalysis {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    
    // Calculate future value with compound growth
    let value = principal;
    let totalContributions = principal;
    const projectionChart: { year: number; value: number; contributions: number }[] = [];
    
    // Add initial point
    projectionChart.push({ year: 0, value: principal, contributions: principal });
    
    for (let month = 1; month <= months; month++) {
      // Apply monthly growth
      value *= (1 + monthlyRate);
      
      // Add monthly contribution
      if (monthlyContribution > 0) {
        value += monthlyContribution;
        totalContributions += monthlyContribution;
      }
      
      // Record yearly snapshots
      if (month % 12 === 0) {
        projectionChart.push({
          year: month / 12,
          value,
          contributions: totalContributions
        });
      }
    }
    
    const finalValue = value;
    const totalGains = finalValue - totalContributions;
    const compoundingEffect = totalGains / totalContributions;
    
    // Risk analysis
    const riskAnalysis = this.calculateRiskAssessment(annualReturn, years, finalValue);
    
    return {
      principal,
      annualReturn,
      years,
      monthlyContribution,
      finalValue,
      totalContributions,
      totalGains,
      compoundingEffect,
      projectionChart,
      riskAnalysis
    };
  }

  /**
   * Calculate risk assessment for investment
   */
  private static calculateRiskAssessment(
    annualReturn: number,
    years: number,
    expectedValue: number
  ): RiskAssessment {
    // Estimate volatility based on asset class
    let volatility: number;
    if (annualReturn <= 3) volatility = 0.05; // Bonds
    else if (annualReturn <= 7) volatility = 0.10; // Balanced
    else volatility = 0.15; // Stocks
    
    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 2; // Assume 2% risk-free rate
    const sharpeRatio = (annualReturn - riskFreeRate) / (volatility * 100);
    
    // Monte Carlo simulation for confidence intervals
    const simulations = 1000;
    const results: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      let simulatedReturn = annualReturn;
      
      // Add random variation based on volatility
      for (let year = 0; year < years; year++) {
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
        simulatedReturn *= randomFactor;
      }
      
      results.push(simulatedReturn);
    }
    
    results.sort((a, b) => a - b);
    const worstCaseScenario = expectedValue * (results[Math.floor(simulations * 0.05)] / annualReturn);
    const bestCaseScenario = expectedValue * (results[Math.floor(simulations * 0.95)] / annualReturn);
    const confidenceInterval: [number, number] = [
      expectedValue * (results[Math.floor(simulations * 0.25)] / annualReturn),
      expectedValue * (results[Math.floor(simulations * 0.75)] / annualReturn)
    ];
    
    return {
      volatility,
      sharpeRatio,
      worstCaseScenario,
      bestCaseScenario,
      confidenceInterval
    };
  }

  /**
   * Comprehensive retirement planning
   */
  static planRetirement(
    currentAge: number,
    retirementAge: number,
    currentSavings: number,
    monthlyContribution: number,
    expectedReturn: number,
    inflationRate: number = 3,
    retirementGoal: number
  ): RetirementPlan {
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    // Calculate projected value at retirement
    let projectedValue = currentSavings;
    
    for (let month = 0; month < months; month++) {
      projectedValue *= (1 + monthlyRate);
      projectedValue += monthlyContribution;
    }
    
    // Adjust for inflation
    const inflationAdjustedGoal = retirementGoal * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const shortfall = Math.max(0, inflationAdjustedGoal - projectedValue);
    
    // Calculate monthly income at retirement (4% rule)
    const monthlyIncomeAtRetirement = projectedValue * 0.04 / 12;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (shortfall > 0) {
      const additionalMonthlyNeeded = this.calculateAdditionalContribution(
        currentSavings, monthlyContribution, monthlyRate, months, inflationAdjustedGoal
      );
      recommendations.push(`Increase monthly contribution by $${additionalMonthlyNeeded.toFixed(2)} to meet goal`);
    } else {
      recommendations.push("You're on track to meet your retirement goal!");
    }
    
    if (monthlyContribution < currentSavings * 0.01) {
      recommendations.push("Consider increasing contribution rate - aim for 10-15% of income");
    }
    
    if (expectedReturn < 6) {
      recommendations.push("Consider more aggressive investment strategy for higher returns");
    }
    
    recommendations.push("Review and adjust plan annually");
    recommendations.push("Consider tax-advantaged accounts (401k, IRA)");
    
    return {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      inflationRate,
      retirementGoal: inflationAdjustedGoal,
      projectedValue,
      monthlyIncomeAtRetirement,
      shortfall,
      recommendations
    };
  }

  /**
   * Calculate additional monthly contribution needed
   */
  private static calculateAdditionalContribution(
    currentSavings: number,
    currentContribution: number,
    monthlyRate: number,
    months: number,
    goal: number
  ): number {
    // Binary search for required additional contribution
    let low = 0;
    let high = 10000;
    let epsilon = 1;
    
    while (high - low > epsilon) {
      const mid = (low + high) / 2;
      const totalContribution = currentContribution + mid;
      
      let projectedValue = currentSavings;
      for (let month = 0; month < months; month++) {
        projectedValue *= (1 + monthlyRate);
        projectedValue += totalContribution;
      }
      
      if (projectedValue < goal) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return high;
  }

  /**
   * Business valuation using multiple methods
   */
  static valueBusiness(
    revenue: number,
    expenses: number,
    growthRate: number,
    discountRate: number,
    terminalMultiple: number = 10
  ): BusinessValuation {
    const netIncome = revenue - expenses;
    const fcf = netIncome * 0.8; // Assume 80% of net income is free cash flow
    
    // DCF Valuation
    let dcfValue = 0;
    let projectedFCF = fcf;
    
    // Project 5 years of cash flows
    for (let year = 1; year <= 5; year++) {
      projectedFCF *= (1 + growthRate / 100);
      dcfValue += projectedFCF / Math.pow(1 + discountRate / 100, year);
    }
    
    // Terminal value
    const terminalValue = (projectedFCF * terminalMultiple) / Math.pow(1 + discountRate / 100, 5);
    dcfValue += terminalValue;
    
    // Revenue multiple valuation
    const revenueMultiple = this.getIndustryMultiple(revenue);
    const revenueMultipleValue = revenue * revenueMultiple;
    
    // Asset-based valuation (simplified)
    const assetValue = revenue * 0.5; // Assume assets worth 50% of revenue
    
    // Weighted average
    const finalValuation = (dcfValue * 0.5) + (revenueMultipleValue * 0.3) + (assetValue * 0.2);
    
    const analysis = [
      `DCF Method: $${dcfValue.toFixed(0)} (50% weight)`,
      `Revenue Multiple: $${revenueMultipleValue.toFixed(0)} (30% weight)`,
      `Asset-Based: $${assetValue.toFixed(0)} (20% weight)`,
      `Growth Rate: ${growthRate}% annually`,
      `Discount Rate: ${discountRate}%`,
      `Free Cash Flow Margin: ${(fcf/revenue*100).toFixed(1)}%`
    ];
    
    return {
      revenue,
      expenses,
      growth_rate: growthRate,
      discount_rate: discountRate,
      terminal_multiple: terminalMultiple,
      dcf_value: dcfValue,
      revenue_multiple_value: revenueMultipleValue,
      asset_value: assetValue,
      final_valuation: finalValuation,
      analysis
    };
  }

  /**
   * Get industry multiple based on revenue size
   */
  private static getIndustryMultiple(revenue: number): number {
    if (revenue < 1000000) return 1.5; // Small business
    if (revenue < 10000000) return 2.5; // Medium business
    if (revenue < 100000000) return 4.0; // Large business
    return 6.0; // Enterprise
  }

  /**
   * Calculate optimal debt-to-equity ratio
   */
  static optimizeCapitalStructure(
    totalAssets: number,
    currentDebt: number,
    costOfDebt: number,
    costOfEquity: number,
    taxRate: number = 25
  ): {
    optimalDebtRatio: number;
    optimalDebt: number;
    optimalEquity: number;
    wacc: number;
    analysis: string[];
  } {
    let optimalRatio = 0;
    let minWACC = Infinity;
    
    // Test different debt ratios
    for (let debtRatio = 0; debtRatio <= 0.8; debtRatio += 0.01) {
      const debt = totalAssets * debtRatio;
      const equity = totalAssets - debt;
      
      // Calculate WACC
      const afterTaxCostOfDebt = costOfDebt * (1 - taxRate / 100);
      const wacc = (debt / totalAssets) * afterTaxCostOfDebt + 
                   (equity / totalAssets) * costOfEquity;
      
      if (wacc < minWACC) {
        minWACC = wacc;
        optimalRatio = debtRatio;
      }
    }
    
    const optimalDebt = totalAssets * optimalRatio;
    const optimalEquity = totalAssets - optimalDebt;
    
    const analysis = [
      `Current Debt Ratio: ${(currentDebt/totalAssets*100).toFixed(1)}%`,
      `Optimal Debt Ratio: ${(optimalRatio*100).toFixed(1)}%`,
      `Minimum WACC: ${(minWACC*100).toFixed(2)}%`,
      `Tax Shield Benefit: ${(costOfDebt * taxRate/100 * optimalDebt).toFixed(0)}`,
      optimalRatio > currentDebt/totalAssets ? 
        "Consider increasing debt financing for tax benefits" :
        "Consider reducing debt to lower financial risk"
    ];
    
    return {
      optimalDebtRatio: optimalRatio,
      optimalDebt,
      optimalEquity,
      wacc: minWACC,
      analysis
    };
  }
}
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
    
    const originalTotal = principal * (1 + monthlyRate) ** (months); // Rough estimate
    const savings = Math.max(0, originalTotal - totalPaid);
    
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
    const biweeklyRate = (annualRate / 100) / 26; // 26 bi-weekly periods per year
    const biweeklyPayment = monthlyPayment / 2;
    
    let balance = principal;
    let payments = 0;
    let totalPaid = 0;
    
    while (balance > 0.01 && payments < 780) { // Max 30 years bi-weekly
      const interestPayment = balance * biweeklyRate;
      const principalPayment = Math.min(biweeklyPayment - interestPayment, balance);
      balance -= principalPayment;
      totalPaid += interestPayment + principalPayment;
      payments++;
    }
    
    const months = Math.round(payments / 2.17); // Approximate months
    const originalTotal = principal * Math.pow(1 + (annualRate/100/12), 360);
    const savings = Math.max(0, originalTotal - totalPaid);
    
    return { months, savings };
  }

  /**
   * Comprehensive investment analysis with projections
   */
  static calculateInvestment(
    principal: number,
    annualReturn: number,
    years: number,
    monthlyContribution: number = 0
  ): InvestmentAnalysis {
    const monthlyRate = annualReturn / 100 / 12;
    const projectionChart = [];
    
    let currentValue = principal;
    let totalContributions = principal;
    
    for (let year = 0; year <= years; year++) {
      projectionChart.push({
        year,
        value: currentValue,
        contributions: totalContributions
      });
      
      if (year < years) {
        // Add monthly contributions for the year
        for (let month = 0; month < 12; month++) {
          currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
          totalContributions += monthlyContribution;
        }
      }
    }
    
    const finalValue = currentValue;
    const totalGains = finalValue - totalContributions;
    const compoundingEffect = totalGains / (totalContributions - principal);
    
    // Risk analysis (simplified)
    const volatility = annualReturn * 0.15; // Rough estimate
    const sharpeRatio = (annualReturn - 3) / volatility; // Assuming 3% risk-free rate
    const worstCase = finalValue * (1 - volatility/100);
    const bestCase = finalValue * (1 + volatility/100);
    
    const riskAnalysis: RiskAssessment = {
      volatility,
      sharpeRatio,
      worstCaseScenario: worstCase,
      bestCaseScenario: bestCase,
      confidenceInterval: [worstCase, bestCase]
    };
    
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
   * Retirement planning calculator
   */
  static calculateRetirement(
    currentAge: number,
    retirementAge: number,
    currentSavings: number,
    monthlyContribution: number,
    expectedReturn: number,
    inflationRate: number = 2.5,
    retirementGoal: number = 1000000
  ): RetirementPlan {
    const yearsToRetirement = retirementAge - currentAge;
    
    // Calculate projected retirement savings
    const investment = this.calculateInvestment(
      currentSavings,
      expectedReturn,
      yearsToRetirement,
      monthlyContribution
    );
    
    const projectedValue = investment.finalValue;
    
    // Calculate inflation-adjusted retirement goal
    const inflationMultiplier = Math.pow(1 + inflationRate/100, yearsToRetirement);
    const adjustedGoal = retirementGoal * inflationMultiplier;
    
    // Calculate retirement income (4% rule)
    const monthlyIncomeAtRetirement = (projectedValue * 0.04) / 12;
    
    // Calculate shortfall
    const shortfall = Math.max(0, adjustedGoal - projectedValue);
    
    // Generate recommendations
    const recommendations = [];
    if (shortfall > 0) {
      const additionalMonthly = shortfall / (yearsToRetirement * 12);
      recommendations.push(`Consider increasing monthly contributions by $${additionalMonthly.toFixed(2)}`);
      recommendations.push(`Or delay retirement by ${Math.ceil(shortfall / (monthlyContribution * 12))} years`);
    } else {
      recommendations.push("You're on track for your retirement goal!");
      recommendations.push("Consider diversifying your investment portfolio");
    }
    
    return {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      inflationRate,
      retirementGoal: adjustedGoal,
      projectedValue,
      monthlyIncomeAtRetirement,
      shortfall,
      recommendations
    };
  }

  /**
   * Business valuation using multiple methods
   */
  static calculateBusinessValuation(
    revenue: number,
    expenses: number,
    growthRate: number,
    discountRate: number,
    terminalMultiple: number = 10
  ): BusinessValuation {
    const netIncome = revenue - expenses;
    const analysis = [];
    
    // DCF Valuation
    let dcfValue = 0;
    for (let year = 1; year <= 5; year++) {
      const futureIncome = netIncome * Math.pow(1 + growthRate/100, year);
      const presentValue = futureIncome / Math.pow(1 + discountRate/100, year);
      dcfValue += presentValue;
    }
    
    // Terminal value
    const terminalIncome = netIncome * Math.pow(1 + growthRate/100, 5);
    const terminalValue = (terminalIncome * terminalMultiple) / Math.pow(1 + discountRate/100, 5);
    dcfValue += terminalValue;
    
    analysis.push(`DCF analysis assumes ${growthRate}% growth for 5 years`);
    analysis.push(`Terminal value calculated using ${terminalMultiple}x multiple`);
    
    // Revenue multiple method
    const revenueMultipleValue = revenue * (netIncome/revenue > 0.2 ? 3 : 2);
    analysis.push(`Revenue multiple based on ${((netIncome/revenue)*100).toFixed(1)}% profit margin`);
    
    // Asset-based approach (simplified)
    const assetValue = revenue * 0.5; // Rough estimate
    analysis.push(`Asset value estimated as 50% of annual revenue`);
    
    // Weighted average
    const finalValuation = (dcfValue * 0.5) + (revenueMultipleValue * 0.3) + (assetValue * 0.2);
    
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
}
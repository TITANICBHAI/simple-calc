"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, TrendingUp, Building2, Calculator, 
  PieChart, BarChart3, Target, Crown, Sparkles,
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdvancedFinancialModelingProps {
  isVisible: boolean;
  onClose: () => void;
}

interface FinancialResults {
  presentValue: number;
  futureValue: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  cashFlows: number[];
  discountedCashFlows: number[];
  cumulativeCashFlows: number[];
  sensitivity: {
    npvSensitivity: { [key: string]: number };
    irrSensitivity: { [key: string]: number };
  };
  scenarios: {
    optimistic: { npv: number; irr: number };
    pessimistic: { npv: number; irr: number };
    mostLikely: { npv: number; irr: number };
  };
  recommendation: 'accept' | 'reject' | 'consider';
  riskAssessment: 'low' | 'medium' | 'high';
}

export default function AdvancedFinancialModeling({ isVisible, onClose }: AdvancedFinancialModelingProps) {
  const [modelType, setModelType] = useState('investment');
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<FinancialResults | null>(null);

  // Investment Analysis Inputs
  const [initialInvestment, setInitialInvestment] = useState('100000');
  const [discountRate, setDiscountRate] = useState('10');
  const [projectPeriods, setProjectPeriods] = useState('5');
  const [annualCashFlow, setAnnualCashFlow] = useState('25000');

  // Loan Analysis Inputs
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('5.5');
  const [loanTerm, setLoanTerm] = useState('30');

  // Business Valuation Inputs
  const [revenue, setRevenue] = useState('1000000');
  const [growthRate, setGrowthRate] = useState('15');
  const [profitMargin, setProfitMargin] = useState('20');

  const performFinancialAnalysis = async () => {
    setIsCalculating(true);
    setProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 150);

      let analysisResults: FinancialResults;

      switch (modelType) {
        case 'investment':
          analysisResults = await calculateInvestmentAnalysis();
          break;
        case 'loan':
          analysisResults = await calculateLoanAnalysis();
          break;
        case 'business':
          analysisResults = await calculateBusinessValuation();
          break;
        case 'portfolio':
          analysisResults = await calculatePortfolioAnalysis();
          break;
        default:
          analysisResults = await calculateInvestmentAnalysis();
      }

      clearInterval(progressInterval);
      setProgress(100);
      setResults(analysisResults);

      toast({
        title: "💰 Financial Analysis Complete!",
        description: `${modelType.charAt(0).toUpperCase() + modelType.slice(1)} analysis completed with comprehensive metrics.`
      });

    } catch (error) {
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Financial analysis failed",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const calculateInvestmentAnalysis = async (): Promise<FinancialResults> => {
    const initial = parseFloat(initialInvestment);
    const rate = parseFloat(discountRate) / 100;
    const periods = parseInt(projectPeriods);
    const cashFlow = parseFloat(annualCashFlow);

    // Generate cash flows
    const cashFlows = Array(periods).fill(cashFlow);
    cashFlows.unshift(-initial); // Initial investment

    // Calculate discounted cash flows
    const discountedCashFlows = cashFlows.map((cf, i) => 
      i === 0 ? cf : cf / Math.pow(1 + rate, i)
    );

    // Calculate cumulative cash flows
    const cumulativeCashFlows = cashFlows.reduce((acc, cf, i) => {
      acc.push(i === 0 ? cf : acc[i-1] + cf);
      return acc;
    }, [] as number[]);

    // Net Present Value
    const npv = discountedCashFlows.reduce((sum, dcf) => sum + dcf, 0);

    // Internal Rate of Return (using approximation)
    const irr = calculateIRR(cashFlows);

    // Payback Period
    const paybackPeriod = calculatePaybackPeriod(cumulativeCashFlows);

    // Profitability Index
    const profitabilityIndex = (npv + initial) / initial;

    // Present and Future Values
    const presentValue = cashFlow / rate * (1 - 1 / Math.pow(1 + rate, periods));
    const futureValue = presentValue * Math.pow(1 + rate, periods);

    // Sensitivity Analysis
    const sensitivity = calculateSensitivityAnalysis(initial, cashFlow, rate, periods);

    // Scenario Analysis
    const scenarios = calculateScenarioAnalysis(initial, cashFlow, rate, periods);

    // Risk Assessment and Recommendation
    const riskAssessment = assessRisk(irr, npv, paybackPeriod);
    const recommendation = makeRecommendation(npv, irr, paybackPeriod, profitabilityIndex);

    return {
      presentValue,
      futureValue,
      netPresentValue: npv,
      internalRateOfReturn: irr,
      paybackPeriod,
      profitabilityIndex,
      cashFlows,
      discountedCashFlows,
      cumulativeCashFlows,
      sensitivity,
      scenarios,
      recommendation,
      riskAssessment
    };
  };

  const calculateLoanAnalysis = async (): Promise<FinancialResults> => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const months = parseInt(loanTerm) * 12;

    // Monthly payment calculation
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    // Generate payment schedule
    const cashFlows: number[] = [];
    let balance = principal;

    for (let i = 0; i < months; i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      cashFlows.push(-monthlyPayment);
    }

    // Add initial loan amount as positive cash flow
    cashFlows.unshift(principal);

    const totalPayments = monthlyPayment * months;
    const totalInterest = totalPayments - principal;

    return {
      presentValue: principal,
      futureValue: totalPayments,
      netPresentValue: -totalInterest,
      internalRateOfReturn: parseFloat(interestRate),
      paybackPeriod: parseInt(loanTerm),
      profitabilityIndex: principal / totalPayments,
      cashFlows,
      discountedCashFlows: cashFlows,
      cumulativeCashFlows: cashFlows.reduce((acc, cf, i) => {
        acc.push(i === 0 ? cf : acc[i-1] + cf);
        return acc;
      }, [] as number[]),
      sensitivity: { npvSensitivity: {}, irrSensitivity: {} },
      scenarios: {
        optimistic: { npv: -totalInterest * 0.8, irr: parseFloat(interestRate) * 0.8 },
        pessimistic: { npv: -totalInterest * 1.2, irr: parseFloat(interestRate) * 1.2 },
        mostLikely: { npv: -totalInterest, irr: parseFloat(interestRate) }
      },
      recommendation: 'consider' as 'accept' | 'reject' | 'consider',
      riskAssessment: 'medium' as 'low' | 'medium' | 'high'
    };
  };

  const calculateBusinessValuation = async (): Promise<FinancialResults> => {
    const annualRevenue = parseFloat(revenue);
    const growth = parseFloat(growthRate) / 100;
    const margin = parseFloat(profitMargin) / 100;
    const discountRate = 0.12; // Typical discount rate for business valuation

    // Project 5 years of cash flows
    const periods = 5;
    const cashFlows: number[] = [];
    
    for (let i = 1; i <= periods; i++) {
      const projectedRevenue = annualRevenue * Math.pow(1 + growth, i);
      const profit = projectedRevenue * margin;
      cashFlows.push(profit);
    }

    // Terminal value (simplified)
    const terminalGrowth = 0.03;
    const terminalValue = cashFlows[cashFlows.length - 1] * (1 + terminalGrowth) / (discountRate - terminalGrowth);
    cashFlows.push(terminalValue);

    // Discount all cash flows
    const discountedCashFlows = cashFlows.map((cf, i) => cf / Math.pow(1 + discountRate, i + 1));
    const businessValue = discountedCashFlows.reduce((sum, dcf) => sum + dcf, 0);

    return {
      presentValue: businessValue,
      futureValue: businessValue * Math.pow(1 + growth, periods),
      netPresentValue: businessValue,
      internalRateOfReturn: growth * 100,
      paybackPeriod: businessValue / (annualRevenue * margin),
      profitabilityIndex: businessValue / annualRevenue,
      cashFlows,
      discountedCashFlows,
      cumulativeCashFlows: cashFlows.reduce((acc, cf, i) => {
        acc.push(i === 0 ? cf : acc[i-1] + cf);
        return acc;
      }, [] as number[]),
      sensitivity: calculateBusinessSensitivity(annualRevenue, growth, margin, discountRate),
      scenarios: {
        optimistic: { npv: businessValue * 1.3, irr: growth * 100 * 1.2 },
        pessimistic: { npv: businessValue * 0.7, irr: growth * 100 * 0.8 },
        mostLikely: { npv: businessValue, irr: growth * 100 }
      },
      recommendation: (businessValue > annualRevenue * 2 ? 'accept' : 'consider') as 'accept' | 'reject' | 'consider',
      riskAssessment: (growth > 0.2 ? 'high' : (growth > 0.1 ? 'medium' : 'low')) as 'low' | 'medium' | 'high'
    };
  };

  const calculatePortfolioAnalysis = async (): Promise<FinancialResults> => {
    // Simplified portfolio analysis
    const portfolioValue = 500000;
    const expectedReturn = 0.08;
    const periods = 10;

    const futureValue = portfolioValue * Math.pow(1 + expectedReturn, periods);
    const annualGrowth = (futureValue - portfolioValue) / periods;

    return {
      presentValue: portfolioValue,
      futureValue,
      netPresentValue: futureValue - portfolioValue,
      internalRateOfReturn: expectedReturn * 100,
      paybackPeriod: portfolioValue / annualGrowth,
      profitabilityIndex: futureValue / portfolioValue,
      cashFlows: Array(periods).fill(annualGrowth),
      discountedCashFlows: Array(periods).fill(annualGrowth / Math.pow(1 + expectedReturn, 5)),
      cumulativeCashFlows: Array(periods).fill(0).map((_, i) => annualGrowth * (i + 1)),
      sensitivity: { npvSensitivity: {}, irrSensitivity: {} },
      scenarios: {
        optimistic: { npv: (futureValue - portfolioValue) * 1.4, irr: expectedReturn * 100 * 1.3 },
        pessimistic: { npv: (futureValue - portfolioValue) * 0.6, irr: expectedReturn * 100 * 0.7 },
        mostLikely: { npv: futureValue - portfolioValue, irr: expectedReturn * 100 }
      },
      recommendation: 'accept' as 'accept' | 'reject' | 'consider',
      riskAssessment: 'medium' as 'low' | 'medium' | 'high'
    };
  };

  // Helper functions
  const calculateIRR = (cashFlows: number[]): number => {
    // Newton-Raphson method for IRR calculation
    let rate = 0.1; // Initial guess
    let iteration = 0;
    const maxIterations = 100;
    const tolerance = 0.0001;

    while (iteration < maxIterations) {
      let npv = 0;
      let dnpv = 0;

      for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + rate, i);
        dnpv -= i * cashFlows[i] / Math.pow(1 + rate, i + 1);
      }

      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100;
      }
      
      rate = newRate;
      iteration++;
    }

    return rate * 100;
  };

  const calculatePaybackPeriod = (cumulativeCashFlows: number[]): number => {
    for (let i = 1; i < cumulativeCashFlows.length; i++) {
      if (cumulativeCashFlows[i] >= 0) {
        const prevCF = cumulativeCashFlows[i - 1];
        const currCF = cumulativeCashFlows[i];
        return i - 1 + Math.abs(prevCF) / (currCF - prevCF);
      }
    }
    return cumulativeCashFlows.length;
  };

  const calculateSensitivityAnalysis = (initial: number, cashFlow: number, rate: number, periods: number) => {
    const baseNPV = calculateNPV(initial, cashFlow, rate, periods);
    const baseIRR = calculateIRR([-initial, ...Array(periods).fill(cashFlow)]);

    const variations = [-20, -10, 10, 20]; // Percentage variations
    const npvSensitivity: { [key: string]: number } = {};
    const irrSensitivity: { [key: string]: number } = {};

    // Cash flow sensitivity
    variations.forEach(variation => {
      const newCashFlow = cashFlow * (1 + variation / 100);
      npvSensitivity[`cashFlow${variation > 0 ? '+' : ''}${variation}%`] = 
        calculateNPV(initial, newCashFlow, rate, periods);
      irrSensitivity[`cashFlow${variation > 0 ? '+' : ''}${variation}%`] = 
        calculateIRR([-initial, ...Array(periods).fill(newCashFlow)]);
    });

    // Discount rate sensitivity
    variations.forEach(variation => {
      const newRate = rate * (1 + variation / 100);
      npvSensitivity[`rate${variation > 0 ? '+' : ''}${variation}%`] = 
        calculateNPV(initial, cashFlow, newRate, periods);
    });

    return { npvSensitivity, irrSensitivity };
  };

  const calculateScenarioAnalysis = (initial: number, cashFlow: number, rate: number, periods: number) => {
    return {
      optimistic: {
        npv: calculateNPV(initial, cashFlow * 1.2, rate, periods),
        irr: calculateIRR([-initial, ...Array(periods).fill(cashFlow * 1.2)])
      },
      pessimistic: {
        npv: calculateNPV(initial, cashFlow * 0.8, rate, periods),
        irr: calculateIRR([-initial, ...Array(periods).fill(cashFlow * 0.8)])
      },
      mostLikely: {
        npv: calculateNPV(initial, cashFlow, rate, periods),
        irr: calculateIRR([-initial, ...Array(periods).fill(cashFlow)])
      }
    };
  };

  const calculateBusinessSensitivity = (revenue: number, growth: number, margin: number, discountRate: number) => {
    // Simplified business sensitivity analysis
    return {
      npvSensitivity: {
        'revenue+10%': revenue * 1.1 * margin / discountRate,
        'revenue-10%': revenue * 0.9 * margin / discountRate,
        'margin+20%': revenue * margin * 1.2 / discountRate,
        'margin-20%': revenue * margin * 0.8 / discountRate
      },
      irrSensitivity: {
        'growth+5%': (growth + 0.05) * 100,
        'growth-5%': (growth - 0.05) * 100
      }
    };
  };

  const calculateNPV = (initial: number, cashFlow: number, rate: number, periods: number): number => {
    let npv = -initial;
    for (let i = 1; i <= periods; i++) {
      npv += cashFlow / Math.pow(1 + rate, i);
    }
    return npv;
  };

  const assessRisk = (irr: number, npv: number, paybackPeriod: number): 'low' | 'medium' | 'high' => {
    if (irr > 20 && npv > 50000 && paybackPeriod < 3) return 'low';
    if (irr > 10 && npv > 0 && paybackPeriod < 5) return 'medium';
    return 'high';
  };

  const makeRecommendation = (npv: number, irr: number, paybackPeriod: number, profitabilityIndex: number): 'accept' | 'reject' | 'consider' => {
    if (npv > 0 && irr > 15 && paybackPeriod < 4 && profitabilityIndex > 1.2) return 'accept';
    if (npv < 0 || irr < 5 || paybackPeriod > 8) return 'reject';
    return 'consider';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(2)}%`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl max-w-7xl max-h-[95vh] overflow-y-auto w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Advanced Financial Modeling Engine
                </h2>
                <p className="text-muted-foreground">Professional financial analysis and valuation tools</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Professional
              </Badge>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Model Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Analysis Type</Label>
                    <Select value={modelType} onValueChange={setModelType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">Investment Analysis</SelectItem>
                        <SelectItem value="loan">Loan Analysis</SelectItem>
                        <SelectItem value="business">Business Valuation</SelectItem>
                        <SelectItem value="portfolio">Portfolio Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {modelType === 'investment' && (
                    <div className="space-y-3">
                      <div>
                        <Label>Initial Investment ($)</Label>
                        <Input
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          placeholder="100000"
                        />
                      </div>
                      <div>
                        <Label>Annual Cash Flow ($)</Label>
                        <Input
                          value={annualCashFlow}
                          onChange={(e) => setAnnualCashFlow(e.target.value)}
                          placeholder="25000"
                        />
                      </div>
                      <div>
                        <Label>Discount Rate (%)</Label>
                        <Input
                          value={discountRate}
                          onChange={(e) => setDiscountRate(e.target.value)}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label>Project Period (Years)</Label>
                        <Input
                          value={projectPeriods}
                          onChange={(e) => setProjectPeriods(e.target.value)}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  )}

                  {modelType === 'loan' && (
                    <div className="space-y-3">
                      <div>
                        <Label>Loan Amount ($)</Label>
                        <Input
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          placeholder="250000"
                        />
                      </div>
                      <div>
                        <Label>Interest Rate (% Annual)</Label>
                        <Input
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          placeholder="5.5"
                        />
                      </div>
                      <div>
                        <Label>Loan Term (Years)</Label>
                        <Input
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          placeholder="30"
                        />
                      </div>
                    </div>
                  )}

                  {modelType === 'business' && (
                    <div className="space-y-3">
                      <div>
                        <Label>Annual Revenue ($)</Label>
                        <Input
                          value={revenue}
                          onChange={(e) => setRevenue(e.target.value)}
                          placeholder="1000000"
                        />
                      </div>
                      <div>
                        <Label>Growth Rate (% Annual)</Label>
                        <Input
                          value={growthRate}
                          onChange={(e) => setGrowthRate(e.target.value)}
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <Label>Profit Margin (%)</Label>
                        <Input
                          value={profitMargin}
                          onChange={(e) => setProfitMargin(e.target.value)}
                          placeholder="20"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={performFinancialAnalysis}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                  >
                    {isCalculating ? (
                      <>
                        <Calculator className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Run Financial Analysis
                      </>
                    )}
                  </Button>

                  {isCalculating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Financial modeling...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {results ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Financial Analysis Results
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            results.recommendation === 'accept' ? 'default' :
                            results.recommendation === 'reject' ? 'destructive' : 'secondary'
                          }
                        >
                          {results.recommendation === 'accept' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {results.recommendation === 'reject' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {results.recommendation === 'consider' && <Info className="h-3 w-3 mr-1" />}
                          {results.recommendation.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Risk: {results.riskAssessment.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="summary">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="detailed">Detailed</TabsTrigger>
                        <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(results.netPresentValue)}
                              </div>
                              <div className="text-sm text-muted-foreground">Net Present Value</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatPercentage(results.internalRateOfReturn)}
                              </div>
                              <div className="text-sm text-muted-foreground">Internal Rate of Return</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {results.paybackPeriod.toFixed(1)} years
                              </div>
                              <div className="text-sm text-muted-foreground">Payback Period</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {results.profitabilityIndex.toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">Profitability Index</div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Investment Recommendation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                {results.recommendation === 'accept' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : results.recommendation === 'reject' ? (
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Info className="h-5 w-5 text-yellow-500" />
                                )}
                                <span className="font-semibold">
                                  {results.recommendation === 'accept' ? 'ACCEPT this investment' :
                                   results.recommendation === 'reject' ? 'REJECT this investment' :
                                   'CONSIDER this investment carefully'}
                                </span>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                {results.recommendation === 'accept' && 
                                  "This investment shows strong financial metrics with positive NPV and attractive returns."}
                                {results.recommendation === 'reject' && 
                                  "This investment does not meet minimum financial criteria and may result in losses."}
                                {results.recommendation === 'consider' && 
                                  "This investment has mixed financial indicators. Conduct additional due diligence."}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Risk Level:</span>
                                <Badge variant={
                                  results.riskAssessment === 'low' ? 'default' :
                                  results.riskAssessment === 'medium' ? 'secondary' : 'destructive'
                                }>
                                  {results.riskAssessment.toUpperCase()} RISK
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="detailed" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Present & Future Values</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Present Value:</span>
                                <span className="font-mono">{formatCurrency(results.presentValue)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Future Value:</span>
                                <span className="font-mono">{formatCurrency(results.futureValue)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Net Gain:</span>
                                <span className={`font-mono ${results.futureValue - results.presentValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(results.futureValue - results.presentValue)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Cash Flow Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Cash Inflows:</span>
                                <span className="font-mono">
                                  {formatCurrency(results.cashFlows.filter(cf => cf > 0).reduce((sum, cf) => sum + cf, 0))}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Cash Outflows:</span>
                                <span className="font-mono">
                                  {formatCurrency(Math.abs(results.cashFlows.filter(cf => cf < 0).reduce((sum, cf) => sum + cf, 0)))}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Net Cash Flow:</span>
                                <span className={`font-mono ${results.cashFlows.reduce((sum, cf) => sum + cf, 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(results.cashFlows.reduce((sum, cf) => sum + cf, 0))}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="sensitivity" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">NPV Sensitivity Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {Object.entries(results.sensitivity.npvSensitivity).map(([scenario, npv]) => (
                                <div key={scenario} className="flex justify-between items-center">
                                  <span className="text-sm">{scenario}:</span>
                                  <span className={`font-mono text-sm ${npv > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(npv)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">IRR Sensitivity Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {Object.entries(results.sensitivity.irrSensitivity).map(([scenario, irr]) => (
                                <div key={scenario} className="flex justify-between items-center">
                                  <span className="text-sm">{scenario}:</span>
                                  <span className="font-mono text-sm">{formatPercentage(irr)}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="scenarios" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-green-600">Optimistic Scenario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>NPV:</span>
                                <span className="font-mono">{formatCurrency(results.scenarios.optimistic.npv)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>IRR:</span>
                                <span className="font-mono">{formatPercentage(results.scenarios.optimistic.irr)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-blue-600">Most Likely Scenario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>NPV:</span>
                                <span className="font-mono">{formatCurrency(results.scenarios.mostLikely.npv)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>IRR:</span>
                                <span className="font-mono">{formatPercentage(results.scenarios.mostLikely.irr)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg text-red-600">Pessimistic Scenario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>NPV:</span>
                                <span className="font-mono">{formatCurrency(results.scenarios.pessimistic.npv)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>IRR:</span>
                                <span className="font-mono">{formatPercentage(results.scenarios.pessimistic.irr)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ready for Financial Analysis</h3>
                      <p className="text-muted-foreground">
                        Select your analysis type, enter the financial parameters, and run the analysis.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Professional financial modeling with comprehensive analysis
            </div>
            <Button onClick={onClose}>Close Financial Modeling</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
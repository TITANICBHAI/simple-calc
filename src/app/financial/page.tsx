"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Calculator, TrendingUp, PiggyBank, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { KofiButton } from '@/components/ui/kofi-button';
import AdSenseAd from '@/components/AdSenseAd';
import { SmartHeader } from '@/components/smart-header';

export default function FinancialToolsPage() {
  // Tip Calculator State
  const [billAmount, setBillAmount] = useState('50.00');
  const [tipPercentage, setTipPercentage] = useState('18');
  const [peopleCount, setPeopleCount] = useState('2');

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');

  // Investment Calculator State
  const [principal, setPrincipal] = useState('10000');
  const [annualRate, setAnnualRate] = useState('7');
  const [years, setYears] = useState('10');
  const [monthlyContribution, setMonthlyContribution] = useState('500');

  // Discount Calculator State
  const [originalPrice, setOriginalPrice] = useState('100');
  const [discountPercent, setDiscountPercent] = useState('25');

  // Tip Calculator Results
  const tipResults = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const tip = parseFloat(tipPercentage) || 0;
    const people = parseInt(peopleCount) || 1;
    
    const tipAmount = (bill * tip) / 100;
    const totalAmount = bill + tipAmount;
    const perPerson = totalAmount / people;
    const tipPerPerson = tipAmount / people;
    
    return {
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      perPerson: perPerson.toFixed(2),
      tipPerPerson: tipPerPerson.toFixed(2)
    };
  }, [billAmount, tipPercentage, peopleCount]);

  // Loan Calculator Results
  const loanResults = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseFloat(loanTerm) || 0) * 12;
    
    if (P === 0 || r === 0 || n === 0) return null;
    
    const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;
    
    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    };
  }, [loanAmount, interestRate, loanTerm]);

  // Investment Calculator Results
  const investmentResults = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    
    // Compound interest for principal
    const futureValuePrincipal = P * Math.pow(1 + r, t);
    
    // Future value of annuity for monthly contributions
    const monthlyRate = r / 12;
    const months = t * 12;
    const futureValueContributions = months > 0 ? PMT * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) : 0;
    
    const totalFutureValue = futureValuePrincipal + futureValueContributions;
    const totalContributions = P + (PMT * months);
    const totalGains = totalFutureValue - totalContributions;
    
    return {
      futureValue: totalFutureValue.toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      totalGains: totalGains.toFixed(2),
      returnOnInvestment: ((totalGains / totalContributions) * 100).toFixed(2)
    };
  }, [principal, annualRate, years, monthlyContribution]);

  // Discount Calculator Results
  const discountResults = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(discountPercent) || 0;
    
    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    const savings = discountAmount;
    
    return {
      discountAmount: discountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      savings: savings.toFixed(2)
    };
  }, [originalPrice, discountPercent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Floating Ko-fi Button */}
      <KofiButton variant="floating" />
      
      <SmartHeader 
        title="Financial Calculator" 
        subtitle="Professional financial analysis and planning tools"
        showBackButton={true}
        showAIBadge={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">


        <Tabs defaultValue="tip" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tip">Tip Calculator</TabsTrigger>
            <TabsTrigger value="loan">Loan Calculator</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="discount">Discount</TabsTrigger>
          </TabsList>

          {/* Tip Calculator */}
          <TabsContent value="tip" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tip Calculator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate tips and split bills among multiple people
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bill">Bill Amount ($)</Label>
                    <Input
                      id="bill"
                      type="number"
                      step="0.01"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="50.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tip">Tip Percentage (%)</Label>
                    <Input
                      id="tip"
                      type="number"
                      value={tipPercentage}
                      onChange={(e) => setTipPercentage(e.target.value)}
                      placeholder="18"
                    />
                    <div className="flex gap-2 mt-2">
                      {['15', '18', '20', '25'].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          size="sm"
                          onClick={() => setTipPercentage(percent)}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="people">Number of People</Label>
                    <Input
                      id="people"
                      type="number"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Tip Amount</p>
                        <p className="text-2xl font-bold text-green-600">${tipResults.tipAmount}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">${tipResults.totalAmount}</p>
                      </div>
                    </div>
                    
                    {parseInt(peopleCount) > 1 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Per Person</p>
                          <p className="text-xl font-bold text-purple-600">${tipResults.perPerson}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Tip Per Person</p>
                          <p className="text-xl font-bold text-orange-600">${tipResults.tipPerPerson}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loan Calculator */}
          <TabsContent value="loan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Loan Calculator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate monthly payments for mortgages and loans
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="loan-amount">Loan Amount ($)</Label>
                    <Input
                      id="loan-amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="250000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="interest">Annual Interest Rate (%)</Label>
                    <Input
                      id="interest"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="6.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="term">Loan Term (Years)</Label>
                    <Input
                      id="term"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      placeholder="30"
                    />
                    <div className="flex gap-2 mt-2">
                      {['15', '20', '30'].map((term) => (
                        <Button
                          key={term}
                          variant="outline"
                          size="sm"
                          onClick={() => setLoanTerm(term)}
                        >
                          {term} years
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Payment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loanResults ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p className="text-3xl font-bold text-blue-600">${loanResults.monthlyPayment}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Total Payment</p>
                          <p className="text-lg font-bold text-green-600">${loanResults.totalPayment}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Total Interest</p>
                          <p className="text-lg font-bold text-red-600">${loanResults.totalInterest}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Enter loan details to see payment breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investment Calculator */}
          <TabsContent value="investment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Investment Calculator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate compound interest and investment growth
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="principal">Initial Investment ($)</Label>
                    <Input
                      id="principal"
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="10000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rate">Annual Return Rate (%)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.1"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(e.target.value)}
                      placeholder="7"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input
                      id="years"
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly">Monthly Contribution ($)</Label>
                    <Input
                      id="monthly"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    Investment Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Future Value</p>
                      <p className="text-3xl font-bold text-green-600">${investmentResults.futureValue}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Invested</p>
                        <p className="text-lg font-bold text-blue-600">${investmentResults.totalContributions}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Gains</p>
                        <p className="text-lg font-bold text-purple-600">${investmentResults.totalGains}</p>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Return on Investment</p>
                      <p className="text-xl font-bold text-orange-600">{investmentResults.returnOnInvestment}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discount Calculator */}
          <TabsContent value="discount" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="h-5 w-5" />
                    Discount Calculator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate discounted prices and savings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="original">Original Price ($)</Label>
                    <Input
                      id="original"
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="25"
                    />
                    <div className="flex gap-2 mt-2">
                      {['10', '20', '25', '30', '50'].map((discount) => (
                        <Button
                          key={discount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDiscountPercent(discount)}
                        >
                          {discount}%
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Savings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Final Price</p>
                      <p className="text-3xl font-bold text-green-600">${discountResults.finalPrice}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">You Save</p>
                        <p className="text-lg font-bold text-red-600">${discountResults.savings}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Discount Amount</p>
                        <p className="text-lg font-bold text-blue-600">${discountResults.discountAmount}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Middle Content Ad */}
        <div className="max-w-4xl mx-auto my-12 text-center">
          <AdSenseAd 
            adSlot="5678901234"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>

        {/* Important Financial Disclaimer */}
        <Card className="mt-12 border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              ⚠️ Important Financial Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700 space-y-3">
            <p><strong>NOT FINANCIAL ADVICE:</strong> These calculators are for educational and informational purposes only. They do not constitute financial, investment, legal, or tax advice.</p>
            <p><strong>NO GUARANTEE OF ACCURACY:</strong> While we strive for accuracy, we make NO WARRANTY of any kind regarding the accuracy, reliability, or completeness of these calculations.</p>
            <p><strong>CONSULT PROFESSIONALS:</strong> Always consult qualified financial advisors, accountants, or other professionals before making any financial decisions.</p>
            <p><strong>USE AT YOUR OWN RISK:</strong> You use these tools entirely at your own risk. We are NOT responsible for any financial losses, damages, or consequences resulting from the use of these calculators.</p>
            <p><strong>VERIFY ALL CALCULATIONS:</strong> Always verify important calculations with multiple sources and professional advice before making financial commitments.</p>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <div className="max-w-4xl mx-auto mt-12 mb-8 text-center">
          <AdSenseAd 
            adSlot="6789012345"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>
      </div>
    </div>
  );
}
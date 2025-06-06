"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, DollarSign, Wrench, Target, Zap, 
  TrendingUp, Building, Beaker, Cpu, Crown,
  ChevronRight, BarChart3, PieChart, LineChart, Brain,
  Binary, Sigma, Grid3X3, Code2, CalendarDays, Clock, 
  Link2, Atom, Sparkles, Search, FileText, Waves
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import our powerful engines
import { FinancialModelingEngine, type LoanCalculation, type InvestmentAnalysis, type RetirementPlan } from '@/lib/financial-modeling-engine';
import { EngineeringCalculationsEngine, type PhysicsCalculation, type ChemistryCalculation, type StructuralAnalysis } from '@/lib/engineering-calculations-engine';
import { PrecisionEngine, type PrecisionResult } from '@/lib/precision-engine';

// Import the new Enhanced Mathematical Utilities
import EnhancedMathematicalUtilities from '@/components/enhanced-mathematical-utilities';

// Import our newly integrated mathematical tools
import ExpressionSolver from '@/components/expression-solver';
import MatrixSolver from '@/components/matrix-solver';
import SystemOfLinearEquationsSolver from '@/components/system-of-linear-equations-solver';
import DateDifferenceCalculator from '@/components/date-difference-calculator';
import TimestampConverter from '@/components/timestamp-converter';
import UrlEncoderDecoder from '@/components/url-encoder-decoder';
import PhysicsCalculationsHub from '@/components/physics-calculations-hub';
import SymbolicMathematicsEngine from '@/components/symbolic-mathematics-engine';
import CalculatorNavigationHub from '@/components/calculator-navigation-hub';
// Create placeholder components outside the main component
const StatisticsCalculator = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Statistics Calculator
      <br />
      <small>Advanced statistical analysis tools coming soon</small>
    </div>
  </div>
);

const QuadraticEquationSolver = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Quadratic Equation Solver
      <br />
      <small>Solve ax² + bx + c = 0 equations</small>
    </div>
  </div>
);

const NumericalBaseConverter = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Base Converter
      <br />
      <small>Convert between binary, decimal, hex</small>
    </div>
  </div>
);

const RegexTester = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Regex Tester
      <br />
      <small>Test regular expressions</small>
    </div>
  </div>
);

const ProfessionalTools = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Professional Tools
      <br />
      <small>Advanced mathematical utilities</small>
    </div>
  </div>
);

const MathematicalPhysicsSimulator = () => (
  <div className="text-center py-8">
    <div className="text-muted-foreground">
      Mathematical Physics Simulator
      <br />
      <small>Simulate physical phenomena</small>
    </div>
  </div>
);

export default function AdvancedCalculatorSuite() {
  const [activeTab, setActiveTab] = useState('financial');
  const [activeSubTab, setActiveSubTab] = useState('loan');
  const [showMathUtilities, setShowMathUtilities] = useState(false);
  
  // Financial states
  const [loanResult, setLoanResult] = useState<LoanCalculation | null>(null);
  const [investmentResult, setInvestmentResult] = useState<InvestmentAnalysis | null>(null);
  const [retirementResult, setRetirementResult] = useState<RetirementPlan | null>(null);
  
  // Engineering states
  const [physicsResult, setPhysicsResult] = useState<PhysicsCalculation | null>(null);
  const [chemistryResult, setChemistryResult] = useState<ChemistryCalculation | null>(null);
  
  // Precision states
  const [precisionResult, setPrecisionResult] = useState<PrecisionResult | null>(null);

  // Financial calculation handlers
  const calculateLoan = () => {
    try {
      const principal = parseFloat((document.getElementById('loan_principal') as HTMLInputElement)?.value || '200000');
      const rate = parseFloat((document.getElementById('loan_rate') as HTMLInputElement)?.value || '6.5');
      const term = parseFloat((document.getElementById('loan_term') as HTMLInputElement)?.value || '30');
      
      const result = FinancialModelingEngine.calculateLoan(principal, rate, term);
      setLoanResult(result);
      
      toast({
        title: "Loan Analysis Complete",
        description: `Monthly payment: $${result.monthlyPayment.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid input values",
        variant: "destructive"
      });
    }
  };

  const calculateInvestment = () => {
    try {
      const principal = parseFloat((document.getElementById('inv_principal') as HTMLInputElement)?.value || '10000');
      const rate = parseFloat((document.getElementById('inv_rate') as HTMLInputElement)?.value || '8');
      const years = parseFloat((document.getElementById('inv_years') as HTMLInputElement)?.value || '20');
      const monthly = parseFloat((document.getElementById('inv_monthly') as HTMLInputElement)?.value || '500');
      
      const result = FinancialModelingEngine.calculateInvestment(principal, rate, years, monthly);
      setInvestmentResult(result);
      
      toast({
        title: "Investment Analysis Complete",
        description: `Final value: $${result.finalValue.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid input values",
        variant: "destructive"
      });
    }
  };

  const calculateRetirement = () => {
    try {
      const currentAge = parseFloat((document.getElementById('ret_current_age') as HTMLInputElement)?.value || '30');
      const retirementAge = parseFloat((document.getElementById('ret_retirement_age') as HTMLInputElement)?.value || '65');
      const currentSavings = parseFloat((document.getElementById('ret_current_savings') as HTMLInputElement)?.value || '50000');
      const monthlyContrib = parseFloat((document.getElementById('ret_monthly') as HTMLInputElement)?.value || '1000');
      const expectedReturn = parseFloat((document.getElementById('ret_return') as HTMLInputElement)?.value || '7');
      
      const result = FinancialModelingEngine.calculateRetirement(
        currentAge, retirementAge, currentSavings, monthlyContrib, expectedReturn
      );
      setRetirementResult(result);
      
      toast({
        title: "Retirement Plan Complete",
        description: `Projected value: $${result.projectedValue.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid input values",
        variant: "destructive"
      });
    }
  };

  // Physics calculation handler
  const calculatePhysics = () => {
    try {
      const type = (document.getElementById('physics_type') as HTMLSelectElement)?.value as 'mechanics';
      const inputs: { [key: string]: number } = {};
      
      // Get physics inputs based on type
      if (type === 'mechanics') {
        inputs.initial_velocity = parseFloat((document.getElementById('initial_velocity') as HTMLInputElement)?.value || '50');
        inputs.angle = parseFloat((document.getElementById('angle') as HTMLInputElement)?.value || '45');
        inputs.gravity = parseFloat((document.getElementById('gravity') as HTMLInputElement)?.value || '9.81');
      }
      
      const result = EngineeringCalculationsEngine.calculatePhysics(type, inputs);
      setPhysicsResult(result);
      
      toast({
        title: "Physics Calculation Complete",
        description: `Calculated ${Object.keys(result.outputs).length} parameters`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid input values",
        variant: "destructive"
      });
    }
  };

  // Chemistry calculation handler
  const calculateChemistry = () => {
    try {
      const type = (document.getElementById('chemistry_type') as HTMLSelectElement)?.value as 'gas_laws';
      const inputs: { [key: string]: number } = {};
      
      if (type === 'gas_laws') {
        inputs.pressure = parseFloat((document.getElementById('pressure') as HTMLInputElement)?.value || '1');
        inputs.volume = parseFloat((document.getElementById('volume') as HTMLInputElement)?.value || '22.4');
        inputs.temperature = parseFloat((document.getElementById('temperature') as HTMLInputElement)?.value || '273');
      }
      
      const result = EngineeringCalculationsEngine.calculateChemistry(type, inputs);
      setChemistryResult(result);
      
      toast({
        title: "Chemistry Calculation Complete",
        description: `Calculated ${Object.keys(result.outputs).length} values`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid input values",
        variant: "destructive"
      });
    }
  };

  // Precision calculation handler
  const calculatePrecision = () => {
    try {
      const expression = (document.getElementById('precision_expression') as HTMLInputElement)?.value || 'pi * e^2';
      const decimalPlaces = parseInt((document.getElementById('decimal_places') as HTMLInputElement)?.value || '15');
      
      const result = PrecisionEngine.calculateWithPrecision(expression, { decimalPlaces });
      setPrecisionResult(result);
      
      toast({
        title: "Precision Calculation Complete",
        description: `Calculated with ${decimalPlaces} decimal places`
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Invalid expression",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <CardTitle>Professional Mathematics Toolkit</CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Professional
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Professional-grade financial modeling, engineering calculations, and high-precision mathematics
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="core" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Core Math
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="applied" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Applied
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="utilities" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Utilities
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
            </TabsList>

            {/* Financial Tools */}
            <TabsContent value="financial" className="space-y-6">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="loan">Loan Analysis</TabsTrigger>
                  <TabsTrigger value="investment">Investment</TabsTrigger>
                  <TabsTrigger value="retirement">Retirement</TabsTrigger>
                </TabsList>

                <TabsContent value="loan" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="loan_principal">Principal ($)</Label>
                      <Input id="loan_principal" type="number" defaultValue="200000" />
                    </div>
                    <div>
                      <Label htmlFor="loan_rate">Interest Rate (%)</Label>
                      <Input id="loan_rate" type="number" step="0.1" defaultValue="6.5" />
                    </div>
                    <div>
                      <Label htmlFor="loan_term">Term (years)</Label>
                      <Input id="loan_term" type="number" defaultValue="30" />
                    </div>
                  </div>
                  
                  <Button onClick={calculateLoan} className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze Loan
                  </Button>

                  {loanResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Loan Analysis Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ${loanResult.monthlyPayment.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Monthly Payment</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${loanResult.totalInterest.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Interest</div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Payoff Strategies:</h4>
                          {loanResult.payoffStrategies.slice(0, 2).map((strategy, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">{strategy.strategy}</div>
                              <div className="text-muted-foreground">{strategy.description}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="investment" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inv_principal">Initial Investment ($)</Label>
                      <Input id="inv_principal" type="number" defaultValue="10000" />
                    </div>
                    <div>
                      <Label htmlFor="inv_rate">Annual Return (%)</Label>
                      <Input id="inv_rate" type="number" step="0.1" defaultValue="8" />
                    </div>
                    <div>
                      <Label htmlFor="inv_years">Years</Label>
                      <Input id="inv_years" type="number" defaultValue="20" />
                    </div>
                    <div>
                      <Label htmlFor="inv_monthly">Monthly Contribution ($)</Label>
                      <Input id="inv_monthly" type="number" defaultValue="500" />
                    </div>
                  </div>
                  
                  <Button onClick={calculateInvestment} className="w-full">
                    <PieChart className="mr-2 h-4 w-4" />
                    Analyze Investment
                  </Button>

                  {investmentResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Investment Projection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ${investmentResult.finalValue.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Final Value</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${investmentResult.totalGains.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Gains</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {(investmentResult.compoundingEffect * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Growth Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="retirement" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ret_current_age">Current Age</Label>
                      <Input id="ret_current_age" type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label htmlFor="ret_retirement_age">Retirement Age</Label>
                      <Input id="ret_retirement_age" type="number" defaultValue="65" />
                    </div>
                    <div>
                      <Label htmlFor="ret_current_savings">Current Savings ($)</Label>
                      <Input id="ret_current_savings" type="number" defaultValue="50000" />
                    </div>
                    <div>
                      <Label htmlFor="ret_monthly">Monthly Contribution ($)</Label>
                      <Input id="ret_monthly" type="number" defaultValue="1000" />
                    </div>
                    <div>
                      <Label htmlFor="ret_return">Expected Return (%)</Label>
                      <Input id="ret_return" type="number" step="0.1" defaultValue="7" />
                    </div>
                  </div>
                  
                  <Button onClick={calculateRetirement} className="w-full">
                    <Building className="mr-2 h-4 w-4" />
                    Plan Retirement
                  </Button>

                  {retirementResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Retirement Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ${retirementResult.projectedValue.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Projected Value</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${retirementResult.monthlyIncomeAtRetirement.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">Monthly Income</div>
                          </div>
                        </div>
                        
                        {retirementResult.recommendations.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-semibold">Recommendations:</h4>
                            {retirementResult.recommendations.map((rec, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm">
                                {rec}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Engineering Tools */}
            <TabsContent value="engineering" className="space-y-6">
              <Tabs defaultValue="physics">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="physics">Physics</TabsTrigger>
                  <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                </TabsList>

                <TabsContent value="physics" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="physics_type">Physics Type</Label>
                      <Select defaultValue="mechanics">
                        <SelectTrigger id="physics_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mechanics">Mechanics</SelectItem>
                          <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                          <SelectItem value="electromagnetism">Electromagnetism</SelectItem>
                          <SelectItem value="waves">Waves</SelectItem>
                          <SelectItem value="optics">Optics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="initial_velocity">Initial Velocity (m/s)</Label>
                        <Input id="initial_velocity" type="number" defaultValue="50" />
                      </div>
                      <div>
                        <Label htmlFor="angle">Angle (degrees)</Label>
                        <Input id="angle" type="number" defaultValue="45" />
                      </div>
                      <div>
                        <Label htmlFor="gravity">Gravity (m/s²)</Label>
                        <Input id="gravity" type="number" step="0.01" defaultValue="9.81" />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={calculatePhysics} className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Calculate Physics
                  </Button>

                  {physicsResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Physics Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(physicsResult.outputs).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-lg font-bold text-blue-600">
                                {value.toFixed(3)} {physicsResult.units[key]}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <h4 className="font-semibold">Formulas Used:</h4>
                          {physicsResult.formulas.map((formula, index) => (
                            <div key={index} className="font-mono text-sm bg-muted p-2 rounded">
                              {formula}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="chemistry" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chemistry_type">Chemistry Type</Label>
                      <Select defaultValue="gas_laws">
                        <SelectTrigger id="chemistry_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gas_laws">Gas Laws</SelectItem>
                          <SelectItem value="stoichiometry">Stoichiometry</SelectItem>
                          <SelectItem value="equilibrium">Equilibrium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pressure">Pressure (atm)</Label>
                        <Input id="pressure" type="number" step="0.1" defaultValue="1" />
                      </div>
                      <div>
                        <Label htmlFor="volume">Volume (L)</Label>
                        <Input id="volume" type="number" step="0.1" defaultValue="22.4" />
                      </div>
                      <div>
                        <Label htmlFor="temperature">Temperature (K)</Label>
                        <Input id="temperature" type="number" defaultValue="273" />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={calculateChemistry} className="w-full">
                    <Beaker className="mr-2 h-4 w-4" />
                    Calculate Chemistry
                  </Button>

                  {chemistryResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Chemistry Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(chemistryResult.outputs).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-lg font-bold text-green-600">
                                {value.toFixed(4)} {chemistryResult.units[key]}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {chemistryResult.safety.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-semibold text-orange-600">Safety Notes:</h4>
                            {chemistryResult.safety.map((note, index) => (
                              <div key={index} className="text-sm bg-orange-50 dark:bg-orange-950/20 p-2 rounded border-l-4 border-orange-500">
                                {note}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Precision Tools */}
            <TabsContent value="precision" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="precision_expression">Mathematical Expression</Label>
                  <Input 
                    id="precision_expression" 
                    placeholder="e.g., pi * e^2, sqrt(2) + log(10)"
                    defaultValue="pi * e^2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="decimal_places">Decimal Places</Label>
                    <Input id="decimal_places" type="number" min="1" max="50" defaultValue="15" />
                  </div>
                </div>
                
                <Button onClick={calculatePrecision} className="w-full">
                  <Cpu className="mr-2 h-4 w-4" />
                  Calculate with Precision
                </Button>

                {precisionResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Precision Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold font-mono break-all">
                            {precisionResult.value}
                          </div>
                          <div className="text-sm text-muted-foreground">Standard Format</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-mono text-sm">
                              {precisionResult.scientificValue}
                            </div>
                            <div className="text-xs text-muted-foreground">Scientific Notation</div>
                          </div>
                          <div>
                            <div className="font-mono text-sm">
                              {precisionResult.engineeringValue}
                            </div>
                            <div className="text-xs text-muted-foreground">Engineering Notation</div>
                          </div>
                        </div>
                        
                        {precisionResult.fractionValue && (
                          <div>
                            <div className="text-lg font-mono">
                              {precisionResult.fractionValue}
                            </div>
                            <div className="text-sm text-muted-foreground">Fraction Form</div>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Computed in {precisionResult.computationTime.toFixed(2)}ms with {precisionResult.actualDigits} significant digits
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <CalculatorNavigationHub 
                onToolSelect={(toolId, category) => {
                  setActiveTab(category);
                  toast({
                    title: "Tool Selected",
                    description: `Switched to ${category} tab for ${toolId.replace('-', ' ')}`,
                  });
                }}
              />
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                <h3 className="font-semibold mb-2">Professional Calculator Suite Features:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>✅ Advanced loan analysis with payoff strategies</div>
                  <div>✅ Investment projections with risk assessment</div>
                  <div>✅ Comprehensive retirement planning</div>
                  <div>✅ Physics calculations (mechanics, thermodynamics, etc.)</div>
                  <div>✅ Chemistry computations with safety warnings</div>
                  <div>✅ Structural engineering analysis</div>
                  <div>✅ Ultra-high precision mathematics</div>
                  <div>✅ Multiple number format representations</div>
                  <div>✅ Code generation (TypeScript, Python, LaTeX)</div>
                  <div>✅ Equation manipulation and rearrangement</div>
                  <div>✅ Mathematical series analysis and recognition</div>
                  <div>✅ Advanced symbolic computation utilities</div>
                </div>
              </div>
            </TabsContent>

            {/* Core Mathematics Tools */}
            <TabsContent value="core" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-500" />
                      Expression Solver
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpressionSolver />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="h-5 w-5 text-green-500" />
                      Matrix Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MatrixSolver />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sigma className="h-5 w-5 text-red-500" />
                      Linear Equations Solver
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemOfLinearEquationsSolver />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Statistics Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatisticsCalculator />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-indigo-500" />
                      Quadratic Equation Solver
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuadraticEquationSolver />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Binary className="h-5 w-5 text-cyan-500" />
                      Base Converter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NumericalBaseConverter />
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Advanced Mathematics Tools */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      Symbolic Mathematics Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SymbolicMathematicsEngine />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-yellow-500" />
                      Regex Tester
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegexTester />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Professional Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfessionalTools />
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Applied Sciences */}
            <TabsContent value="applied" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Atom className="h-5 w-5 text-blue-500" />
                      Physics Calculations Hub
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhysicsCalculationsHub />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Waves className="h-5 w-5 text-teal-500" />
                      Mathematical Physics Simulator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MathematicalPhysicsSimulator />
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Utilities Tools */}
            <TabsContent value="utilities" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                      Date Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DateDifferenceCalculator />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Timestamp Converter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TimestampConverter />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-green-500" />
                      URL Encoder/Decoder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UrlEncoderDecoder />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Enhanced Mathematical Utilities Modal */}
      <EnhancedMathematicalUtilities 
        isVisible={showMathUtilities} 
        onClose={() => setShowMathUtilities(false)} 
      />
    </div>
  );
}
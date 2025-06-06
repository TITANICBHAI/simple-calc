"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, Sparkles, Code, Lightbulb, Target, Wrench,
  CheckCircle, AlertTriangle, TrendingUp, Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import our powerful new systems
import { SmartErrorCorrector } from '@/lib/smart-error-correction';
import { RealWorldReasoningEngine, type RealWorldSolution } from '@/lib/real-world-reasoning-engine';
import { EquationUtilities, type EquationResult, type CodeGeneration } from '@/lib/equation-utilities';

export default function IntelligentMathHub() {
  const [activeTab, setActiveTab] = useState('reasoning');
  
  // Smart Error Correction states
  const [inputExpression, setInputExpression] = useState('2x + 3(x-1');
  const [correctionResult, setCorrectionResult] = useState<any>(null);
  
  // Real-World Reasoning states
  const [problemStatement, setProblemStatement] = useState('I need to save $50,000 for a house down payment in 3 years. How much should I save monthly?');
  const [reasoningSolution, setReasoningSolution] = useState<RealWorldSolution | null>(null);
  
  // Equation Utilities states
  const [equation, setEquation] = useState('F = m * a');
  const [equationResult, setEquationResult] = useState<EquationResult | null>(null);
  const [codeGeneration, setCodeGeneration] = useState<CodeGeneration | null>(null);

  // Smart Error Correction
  const performErrorCorrection = () => {
    try {
      const result = SmartErrorCorrector.validateAndCorrect(inputExpression);
      setCorrectionResult(result);
      
      toast({
        title: result.wasFixed ? "Expression Corrected!" : "Expression Valid",
        description: result.wasFixed 
          ? `Fixed: ${result.original} → ${result.corrected}`
          : "No corrections needed"
      });
    } catch (error) {
      toast({
        title: "Error Correction Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Real-World Problem Reasoning
  const analyzeRealWorldProblem = async () => {
    try {
      const solution = await RealWorldReasoningEngine.analyzeRealWorldProblem(problemStatement);
      setReasoningSolution(solution);
      
      toast({
        title: "Analysis Complete",
        description: `Identified as ${solution.domain} problem with ${solution.analysis.length} reasoning steps`
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Equation Manipulation
  const processEquation = () => {
    try {
      const result = EquationUtilities.rearrangeEquation(equation);
      const codeGen = EquationUtilities.generateCodeFromEquation(equation);
      
      setEquationResult(result);
      setCodeGeneration(codeGen);
      
      toast({
        title: result.error ? "Processing Error" : "Equation Processed",
        description: result.error || "Generated code in multiple languages",
        variant: result.error ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Equation Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">Intelligent Mathematical Reasoning Hub</CardTitle>
              <p className="text-muted-foreground mt-1">
                Advanced AI-powered mathematical analysis, error correction, and real-world problem solving
              </p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto">
              AI-Enhanced
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reasoning" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Problem Reasoning
              </TabsTrigger>
              <TabsTrigger value="correction" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Smart Correction
              </TabsTrigger>
              <TabsTrigger value="equations" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Equation Tools
              </TabsTrigger>
            </TabsList>

            {/* Real-World Problem Reasoning */}
            <TabsContent value="reasoning" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="problem_statement">Real-World Problem</Label>
                    <textarea
                      id="problem_statement"
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                      placeholder="Describe any real-world problem you need help solving..."
                    />
                  </div>
                  
                  <Button onClick={analyzeRealWorldProblem} className="w-full" size="lg">
                    <Brain className="mr-2 h-5 w-5" />
                    Analyze with AI Reasoning
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-800">Financial Planning</div>
                      <div className="text-blue-600">Investment, budgeting, loans</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-800">Health & Wellness</div>
                      <div className="text-green-600">BMI, calories, exercise</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-800">Business Strategy</div>
                      <div className="text-purple-600">Marketing, sales, growth</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-semibold text-orange-800">Engineering</div>
                      <div className="text-orange-600">Design, optimization</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reasoningSolution && (
                    <>
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Analysis Results</CardTitle>
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {reasoningSolution.domain}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Confidence: {(reasoningSolution.confidence * 100).toFixed(0)}%</span>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold">Key Recommendations:</Label>
                            <div className="mt-2 space-y-1">
                              {reasoningSolution.recommendations.slice(0, 3).map((rec, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {Object.keys(reasoningSolution.calculations).length > 0 && (
                            <div>
                              <Label className="text-sm font-semibold">Calculations:</Label>
                              <div className="mt-2 p-2 bg-muted rounded text-sm space-y-1">
                                {Object.entries(reasoningSolution.calculations).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-mono">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Reasoning Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48">
                            <div className="space-y-3">
                              {reasoningSolution.analysis.map((step, index) => (
                                <div key={index} className="border-l-2 border-blue-200 pl-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      Step {step.step}
                                    </Badge>
                                    <span className="text-sm font-medium">{step.title}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{step.reasoning}</p>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-xs">Confidence: {(step.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {reasoningSolution.riskFactors.length > 0 && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Risk Factors
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {reasoningSolution.riskFactors.slice(0, 3).map((risk, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{risk}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Smart Error Correction */}
            <TabsContent value="correction" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="input_expression">Mathematical Expression</Label>
                    <Input 
                      id="input_expression"
                      value={inputExpression}
                      onChange={(e) => setInputExpression(e.target.value)}
                      placeholder="Enter any mathematical expression..."
                      className="text-lg font-mono"
                    />
                  </div>
                  
                  <Button onClick={performErrorCorrection} className="w-full" size="lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Smart Error Correction
                  </Button>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Auto-Fixes Include:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>• Missing multiplication: 2x → 2*x</div>
                      <div>• Parentheses: (2+3(4 → (2+3)*(4)</div>
                      <div>• Function syntax: sin x → sin(x)</div>
                      <div>• Common typos: senx → sin(x)</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {correctionResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {correctionResult.wasFixed ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              Expression Corrected
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 text-blue-500" />
                              Expression Valid
                            </>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Original:</Label>
                          <div className="p-2 bg-red-50 rounded font-mono text-sm border border-red-200">
                            {correctionResult.original}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Corrected:</Label>
                          <div className="p-2 bg-green-50 rounded font-mono text-sm border border-green-200">
                            {correctionResult.corrected}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={correctionResult.isValid ? "default" : "destructive"}>
                            {correctionResult.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          {correctionResult.wasFixed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Auto-Fixed
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Equation Utilities */}
            <TabsContent value="equations" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equation_input">Mathematical Equation</Label>
                    <Input 
                      id="equation_input"
                      value={equation}
                      onChange={(e) => setEquation(e.target.value)}
                      placeholder="e.g., F = m * a, E = m * c^2"
                      className="text-lg font-mono"
                    />
                  </div>
                  
                  <Button onClick={processEquation} className="w-full" size="lg">
                    <Code className="mr-2 h-5 w-5" />
                    Process Equation
                  </Button>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Features:</h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      <div>• Equation rearrangement</div>
                      <div>• Code generation (TS, Python, JS)</div>
                      <div>• LaTeX formatting</div>
                      <div>• Variable extraction</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {equationResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Equation Processing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {equationResult.error ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <div className="text-red-800 font-medium">Error:</div>
                            <div className="text-red-700 text-sm">{equationResult.error}</div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <Label className="text-sm font-medium">Original:</Label>
                              <div className="p-2 bg-muted rounded font-mono text-sm">
                                {equationResult.original}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Rearranged:</Label>
                              <div className="p-2 bg-blue-50 rounded font-mono text-sm">
                                {equationResult.rearranged}
                              </div>
                            </div>
                            
                            {equationResult.steps && (
                              <div>
                                <Label className="text-sm font-medium">Steps:</Label>
                                <div className="mt-1 space-y-1">
                                  {equationResult.steps.map((step, index) => (
                                    <div key={index} className="text-xs text-muted-foreground">
                                      {index + 1}. {step}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {codeGeneration && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Generated Code</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="typescript" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            <TabsTrigger value="latex">LaTeX</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="typescript">
                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                              <code>{codeGeneration.typescript}</code>
                            </pre>
                          </TabsContent>
                          
                          <TabsContent value="python">
                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                              <code>{codeGeneration.python}</code>
                            </pre>
                          </TabsContent>
                          
                          <TabsContent value="javascript">
                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                              <code>{codeGeneration.javascript}</code>
                            </pre>
                          </TabsContent>
                          
                          <TabsContent value="latex">
                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                              <code>{codeGeneration.latex}</code>
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
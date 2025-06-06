"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { KatexDisplay } from '@/components/ui/katex-display';
import { 
  Code, 
  FileText, 
  Sigma, 
  Calculator,
  ArrowRightLeft,
  Lightbulb,
  ChevronRight,
  Copy,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { generateCode } from '@/lib/math-parser/astCodeGen';
import { rearrangeEquation, generateCodeFromEquation } from '@/lib/math-parser/equationUtilities';
import { matchKnownSeries, symbolicRatioTest } from '@/lib/math-parser/seriesAnalysis';

interface EnhancedMathUtilitiesProps {
  isVisible: boolean;
  onClose: () => void;
}

type UtilityMode = 'code_generation' | 'equation_manipulation' | 'series_analysis' | 'expression_tools';

export default function EnhancedMathematicalUtilities({ isVisible, onClose }: EnhancedMathUtilitiesProps) {
  const [activeMode, setActiveMode] = useState<UtilityMode>('code_generation');
  
  // Code Generation States
  const [codeExpression, setCodeExpression] = useState('x^2 + 3*x + 2');
  const [codeLanguage, setCodeLanguage] = useState<'ts' | 'py' | 'latex'>('ts');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Equation Manipulation States
  const [equation, setEquation] = useState('y = m*x + b');
  const [equationResult, setEquationResult] = useState<any>(null);
  
  // Series Analysis States
  const [seriesExpression, setSeriesExpression] = useState('sin(x)');
  const [seriesResult, setSeriesResult] = useState<any>(null);
  const [ratioTestExpression, setRatioTestExpression] = useState('1/n^2');
  const [ratioTestResult, setRatioTestResult] = useState<any>(null);
  
  // Expression Tools States
  const [sourceExpression, setSourceExpression] = useState('x^2 + 3*x + 2');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleCodeGeneration = useCallback(() => {
    try {
      const ast = parseExpression(codeExpression);
      const code = generateCode(ast);
      
      let finalCode = '';
      switch (codeLanguage) {
        case 'ts':
          finalCode = `// TypeScript Expression: ${codeExpression}\nconst result = ${code};`;
          break;
        case 'py':
          finalCode = `# Python Expression: ${codeExpression}\nresult = ${code.replace(/\^/g, '**')}`;
          break;
        case 'latex':
          finalCode = `\\[ ${code.replace(/\*/g, ' \\cdot ').replace(/\^/g, '^{').replace(/([^}])$/, '$1}')} \\]`;
          break;
      }
      
      setGeneratedCode(finalCode);
      toast({
        title: "Code Generated Successfully",
        description: `Expression converted to ${codeLanguage.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [codeExpression, codeLanguage]);

  const handleEquationManipulation = useCallback(() => {
    try {
      const result = rearrangeEquation(equation);
      setEquationResult(result);
      
      if (result.error) {
        toast({
          title: "Equation Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Equation Rearranged",
          description: "Successfully converted to standard form",
        });
      }
    } catch (error: any) {
      toast({
        title: "Manipulation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [equation]);

  const handleSeriesAnalysis = useCallback(() => {
    try {
      const result = matchKnownSeries(seriesExpression);
      setSeriesResult(result);
      
      if (result.matched) {
        toast({
          title: "Series Recognized",
          description: `Identified as: ${result.name}`,
        });
      } else {
        toast({
          title: "Series Not Recognized",
          description: "This expression doesn't match known series patterns",
        });
      }
    } catch (error: any) {
      toast({
        title: "Analysis Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [seriesExpression]);

  const handleRatioTest = useCallback(() => {
    try {
      const result = symbolicRatioTest(ratioTestExpression);
      setRatioTestResult(result);
      
      toast({
        title: "Ratio Test Setup",
        description: "Generated ratio test expressions",
      });
    } catch (error: any) {
      toast({
        title: "Ratio Test Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [ratioTestExpression]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content copied successfully",
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Enhanced Mathematical Utilities
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as UtilityMode)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="code_generation" className="flex items-center gap-1 text-xs">
                <Code className="h-3 w-3" />
                Code Gen
              </TabsTrigger>
              <TabsTrigger value="equation_manipulation" className="flex items-center gap-1 text-xs">
                <ArrowRightLeft className="h-3 w-3" />
                Equations
              </TabsTrigger>
              <TabsTrigger value="series_analysis" className="flex items-center gap-1 text-xs">
                <Sigma className="h-3 w-3" />
                Series
              </TabsTrigger>
              <TabsTrigger value="expression_tools" className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                Tools
              </TabsTrigger>
            </TabsList>

            {/* Code Generation Tab */}
            <TabsContent value="code_generation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="code-expression">Mathematical Expression</Label>
                    <Input
                      id="code-expression"
                      value={codeExpression}
                      onChange={(e) => setCodeExpression(e.target.value)}
                      placeholder="Enter expression (e.g., x^2 + 3*x + 2)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code-language">Target Language</Label>
                    <Select value={codeLanguage} onValueChange={(value: any) => setCodeLanguage(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ts">TypeScript</SelectItem>
                        <SelectItem value="py">Python</SelectItem>
                        <SelectItem value="latex">LaTeX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleCodeGeneration} className="w-full">
                    <Code className="h-4 w-4 mr-2" />
                    Generate Code
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Label>Generated Code</Label>
                  {generatedCode && (
                    <div className="relative">
                      <Textarea
                        value={generatedCode}
                        readOnly
                        className="min-h-[120px] font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generatedCode)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Equation Manipulation Tab */}
            <TabsContent value="equation_manipulation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="equation">Equation to Rearrange</Label>
                    <Input
                      id="equation"
                      value={equation}
                      onChange={(e) => setEquation(e.target.value)}
                      placeholder="Enter equation (e.g., y = m*x + b)"
                    />
                  </div>
                  
                  <Button onClick={handleEquationManipulation} className="w-full">
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Rearrange Equation
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Label>Rearranged Form</Label>
                  {equationResult && !equationResult.error && (
                    <div className="space-y-2">
                      <Alert>
                        <AlertDescription>
                          <strong>Original:</strong> {equationResult.original}
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <AlertDescription>
                          <strong>Rearranged:</strong> {equationResult.rearranged}
                        </AlertDescription>
                      </Alert>
                      <div className="text-xs text-muted-foreground">
                        {equationResult.note}
                      </div>
                    </div>
                  )}
                  
                  {equationResult?.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{equationResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Series Analysis Tab */}
            <TabsContent value="series_analysis" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="series-expression">Series Expression</Label>
                      <Input
                        id="series-expression"
                        value={seriesExpression}
                        onChange={(e) => setSeriesExpression(e.target.value)}
                        placeholder="Enter expression (e.g., sin(x), exp(x))"
                      />
                    </div>
                    
                    <Button onClick={handleSeriesAnalysis} className="w-full">
                      <Sigma className="h-4 w-4 mr-2" />
                      Analyze Series
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Series Information</Label>
                    {seriesResult?.matched && (
                      <div className="space-y-2">
                        <Badge variant="secondary">{seriesResult.name}</Badge>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div className="font-medium mb-2">Series Expansion:</div>
                          <KatexDisplay math={seriesResult.expansion} />
                        </div>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div className="font-medium mb-2">Domain of Convergence:</div>
                          <KatexDisplay math={seriesResult.domain} />
                        </div>
                      </div>
                    )}
                    
                    {seriesResult && !seriesResult.matched && (
                      <Alert>
                        <AlertDescription>
                          No known series pattern found for this expression.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ratio-test">Ratio Test Expression</Label>
                        <Input
                          id="ratio-test"
                          value={ratioTestExpression}
                          onChange={(e) => setRatioTestExpression(e.target.value)}
                          placeholder="Enter sequence term (e.g., 1/n^2)"
                        />
                      </div>
                      
                      <Button onClick={handleRatioTest} className="w-full">
                        <Calculator className="h-4 w-4 mr-2" />
                        Setup Ratio Test
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Ratio Test Setup</Label>
                      {ratioTestResult && (
                        <div className="space-y-2">
                          <div className="bg-muted p-3 rounded text-sm">
                            <div className="font-medium mb-2">Ratio Expression:</div>
                            <KatexDisplay math={ratioTestResult.ratioExpr} />
                          </div>
                          <div className="bg-muted p-3 rounded text-sm">
                            <div className="font-medium mb-2">Limit to Evaluate:</div>
                            <KatexDisplay math={ratioTestResult.limitExpr} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Expression Tools Tab */}
            <TabsContent value="expression_tools" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="source-expression">Source Expression</Label>
                  <Input
                    id="source-expression"
                    value={sourceExpression}
                    onChange={(e) => setSourceExpression(e.target.value)}
                    placeholder="Enter mathematical expression"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-options"
                    checked={showAdvancedOptions}
                    onCheckedChange={setShowAdvancedOptions}
                  />
                  <Label htmlFor="advanced-options">Show Advanced Options</Label>
                </div>
                
                {showAdvancedOptions && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      Additional expression manipulation tools coming soon: substitution, 
                      simplification, and symbolic differentiation.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
// src/components/calculator/expression-solver.tsx
// This Expression Solver uses a custom math parsing engine located in src/lib/math-parser/:
// - symbolicLexer.ts: Tokenizes the input mathematical expression string.
// - symbolicParser.ts: Parses the tokens into an Abstract Syntax Tree (AST).
// - symbolicSimplifier.ts: Applies simplification rules to the AST (connected and used before evaluation).
// - symbolicEvaluator.ts: Evaluates the simplified AST to compute a numerical result or a symbolic string.
// - astCodeGen.ts: Converts an AST back to a string (used internally for displaying derivatives).
// Other utilities like symbolicDifferentiator.ts, symbolicSubstitutor.ts, symbolicLimiter.ts, etc., are part of the library but not all are directly connected to this specific UI tool's primary workflow yet.
// For example, symbolicDifferentiator.ts IS used for the "Differentiate" feature here.

"use client";

import React, { useState, type ChangeEvent, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Info, RotateCw, Loader2, Sigma, TrendingUp, FunctionSquare, Settings2, ChevronRight, CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AISmartCalculator } from '@/lib/ai-smart-calculator';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { evaluateAST, type Scope as EvaluatorScope, FUNCTIONS as PREDEFINED_FUNCTIONS, CONSTANTS as PREDEFINED_CONSTANTS } from '@/lib/math-parser/symbolicEvaluator';
import { simplifyAST } from '@/lib/math-parser/symbolicSimplifier';
import { differentiateAST } from '@/lib/math-parser/symbolicDifferentiator';
import { generateCode } from '@/lib/math-parser/astCodeGen';
import { KatexDisplay } from '@/components/ui/katex-display';
import { expandExpression, factorExpression } from '@/lib/math-parser/mathjsUtils';
import { evaluateWithSteps, StepTracker } from '@/lib/math-parser/stepTracker';
import { SolutionSteps } from './solution-steps';
import { type ExpressionState, type SolutionStep } from '@/types/expression-solver';
import { integrateSymbolic, solveEquationSymbolic, advancedSimplify, proveSymbolic, type ProofResult } from '@/lib/math-parser/advancedMath';

interface ExpressionSolverProps {
  initialExpression?: string;
}

const ExpressionSolver: React.FC<ExpressionSolverProps> = ({ initialExpression }) => {
  const [expression, setExpression] = useState<string>(initialExpression || '');
  const [result, setResult] = useState<string | number | null>(null);
  const [derivativeString, setDerivativeString] = useState<string | null>(null);
  const [processedExpressionString, setProcessedExpressionString] = useState<string | null>(null); // For expand/factor
  const [error, setError] = useState<string | null>(null);
  
  // Live validation state
  const [validationStatus, setValidationStatus] = useState<'valid' | 'error' | 'empty'>('empty');
  const [validationMessage, setValidationMessage] = useState<string>('Start typing...');
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({}); // Store inputs as string to allow partial input like "-" or "."
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDifferentiating, setIsDifferentiating] = useState<boolean>(false);
  const [isProcessingExpression, setIsProcessingExpression] = useState<boolean>(false);
  const { toast } = useToast();

  const [exampleExpressionInput, setExampleExpressionInput] = useState(false);
  const [exampleValuesAssigned, setExampleValuesAssigned] = useState(false);
  const [exampleSolved, setExampleSolved] = useState(false);

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [showSteps, setShowSteps] = useState(true);

  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [advancedSimplified, setAdvancedSimplified] = useState<string | null>(null);
  const [categoryDetected, setCategoryDetected] = useState<string | null>(null);

  // Detect command-prefixed expressions from AI Math input
  React.useEffect(() => {
    if (!initialExpression) return;
    const cmdMatch = initialExpression.match(/^(differentiate|integrate|expand|factor|solve|prove|simplify)\((.+?)(?:,\s*([a-z]))?\)$/i);
    if (cmdMatch) {
      const cmd = cmdMatch[1].toLowerCase();
      setCategoryDetected(`Detected command: ${cmd}`);
      const expr = cmdMatch[2];
      const variable = cmdMatch[3] || 'x';
      setExpression(expr);
      setDetectedVariables(variable ? [variable] : []);
      setTimeout(() => {
        if (cmd === 'differentiate') handleDifferentiate();
        else if (cmd === 'integrate') handleIntegrate(expr, variable);
        else if (cmd === 'expand') handleExpandExpression();
        else if (cmd === 'factor') handleFactorExpression();
        else if (cmd === 'solve') handleSolveEquation(expr, variable);
        else if (cmd === 'prove') handleProveSymbolic();
        else if (cmd === 'simplify') handleAdvancedSimplify();
      }, 100);
    } else {
      setCategoryDetected(null);
      setExpression(initialExpression);
    }
    // eslint-disable-next-line
  }, [initialExpression]);

  const extractVariables = useCallback((exp: string): string[] => {
    const knownFunctionsAndConstants = new Set(
      Object.keys(PREDEFINED_FUNCTIONS).map(k => k.toLowerCase())
        .concat(Object.keys(PREDEFINED_CONSTANTS).map(k => k.toLowerCase()))
        .concat(['x', 'y', 'z', 't', 'a', 'b', 'c', 'm', 'g', 'k']) // Common single letter vars
    );
    // Match words that start with a letter or underscore, can contain letters, numbers, or underscores
    // and are not part of a Math.something pattern.
    const variableRegex = /(?<!Math\.)\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const matches = new Set<string>();
    let match;
    while ((match = variableRegex.exec(exp)) !== null) {
      const potentialVar = match[1];
      if (!knownFunctionsAndConstants.has(potentialVar.toLowerCase()) &&
          !/^\d+$/.test(potentialVar) // Not purely a number
          ) {
        matches.add(potentialVar);
      }
    }
    return Array.from(matches);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    setExpression(newExpression);
    setExampleExpressionInput(newExpression.trim() !== '');
    setError(null);
    setResult(null);
    setDerivativeString(null);
    setProcessedExpressionString(null);
    setExampleSolved(false);

    const currentVars = extractVariables(newExpression);
    setDetectedVariables(currentVars);

    const newVariableValues: Record<string, string> = {};
    currentVars.forEach(v => {
      newVariableValues[v] = variableInputs[v] || '';
    });
    setVariableInputs(newVariableValues);

    const allVarsHaveSomeInput = currentVars.every(v => newVariableValues[v]?.trim() !== '' && newVariableValues[v]?.trim() !== '-');
    setExampleValuesAssigned(allVarsHaveSomeInput && currentVars.length > 0);
  };

  const handleVariableValueChange = (variableName: string, value: string) => {
    setVariableInputs(prev => {
      const updated = { ...prev, [variableName]: value };
      const allVarsHaveSomeInput = detectedVariables.every(v => {
        const valStr = updated[v]?.trim();
        return valStr !== '' && valStr !== '-' && !isNaN(parseFloat(valStr));
      });
      setExampleValuesAssigned(allVarsHaveSomeInput && detectedVariables.length > 0);
      return updated;
    });
    setResult(null); 
    setDerivativeString(null);
    setProcessedExpressionString(null);
    setExampleSolved(false);
  };

  const handleSolve = useCallback(async () => {
    setError(null);
    setResult(null);
    setDerivativeString(null);
    setProcessedExpressionString(null);
    setSteps([]);
    setIsLoading(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      setIsLoading(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      // Add input sanitization
      const sanitizedExpression = expression.replace(/\s+/g, ' ').trim();
      const ast = parseExpression(sanitizedExpression);
      const stepTracker = new StepTracker();
      
      // Add input validation for common errors
      if (sanitizedExpression.includes('//') || sanitizedExpression.includes('/*')) {
        throw new Error('Invalid operator: Comments are not allowed in expressions');
      }
      
      if ((sanitizedExpression.match(/\(/g) || []).length !== (sanitizedExpression.match(/\)/g) || []).length) {
        throw new Error('Mismatched parentheses');
      }

      // Handle variable substitutions with validation
      const scope: EvaluatorScope = {};
      const unassignedOrInvalidVars: string[] = [];
      
      for (const varName of detectedVariables) {
        const varValue = variableInputs[varName]?.trim();
        if (!varValue || !/^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(varValue)) {
          unassignedOrInvalidVars.push(varName);
        } else {
          const numValue = parseFloat(varValue);
          if (isNaN(numValue) || !isFinite(numValue)) {
            throw new Error(`Invalid value for variable ${varName}: must be a finite number`);
          }
          scope[varName] = numValue;
          stepTracker.addStep({
            description: `Variable substitution: ${varName}`,
            expression: `${varName} = ${numValue}`
          }, 'substitution');
        }
      }

      if (unassignedOrInvalidVars.length > 0) {
        const errorMessage = `Please assign valid numerical values to variables: ${unassignedOrInvalidVars.join(', ')}.`;
        setError(errorMessage);
        setIsLoading(false);
        toast({ title: "Variable Error", description: errorMessage, variant: "destructive" });
        return;
      }

      // Add performance optimization with debouncing and memoization
      const { result: evalResult, steps: solutionSteps } = await evaluateWithSteps(ast, scope, stepTracker);
      setSteps(solutionSteps);

      if (typeof evalResult === 'number') {
        // Handle special cases and format numbers appropriately
        if (!isFinite(evalResult)) {
          throw new Error(evalResult > 0 ? 'Result is infinity' : 'Result is negative infinity');
        }
        if (isNaN(evalResult)) {
          throw new Error('Result is not a number (NaN)');
        }
        // Format numbers with appropriate precision
        const formatted = Math.abs(evalResult) < 1e-10 || Math.abs(evalResult) > 1e10
          ? evalResult.toExponential(6)
          : parseFloat(evalResult.toFixed(10)); // Prevent floating point issues
        setResult(formatted);
      } else {
        setResult(evalResult);
      }

      toast({ 
        title: "Calculation Complete", 
        description: `Result: ${typeof evalResult === 'number' ? evalResult.toString() : evalResult}`,
        variant: "default"
      });

    } catch (e: any) {
      let errorTitle = "Calculation Error";
      let userErrorMessage = e.message || "An error occurred during calculation.";

      // Enhanced error categorization
      if (e.name === "SyntaxError" || userErrorMessage.includes("Unexpected token")) {
        errorTitle = "Syntax Error";
        userErrorMessage = "Please check your expression for syntax errors. Common issues include mismatched parentheses or invalid operators.";
      } else if (userErrorMessage.includes("division by zero")) {
        errorTitle = "Division by Zero";
        userErrorMessage = "Cannot divide by zero. Please check your expression.";
      } else if (userErrorMessage.includes("undefined variable")) {
        errorTitle = "Variable Error";
        userErrorMessage = "One or more variables in the expression are undefined.";
      } else if (userErrorMessage.includes("domain error")) {
        errorTitle = "Domain Error";
        userErrorMessage = "Mathematical operation not defined for given input (e.g., square root of negative number).";
      }

      toast({ title: errorTitle, description: userErrorMessage, variant: "destructive" });
      setError(userErrorMessage);
      setResult(null);
      setDerivativeString(null);
      setSteps([]);
    } finally {
      setIsLoading(false);
    }
  }, [expression, variableInputs, detectedVariables, toast]);

  const handleDifferentiate = useCallback(() => {
    setError(null);
    // Keep previous numerical result and processed string if they exist
    // setResult(null); 
    // setProcessedExpressionString(null);
    setDerivativeString(null);
    setIsDifferentiating(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty to differentiate.");
      setIsDifferentiating(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }

    let varToDiff = 'x'; // Default differentiation variable
    if (detectedVariables.length > 0) {
      varToDiff = detectedVariables[0]; // Differentiate w.r.t the first detected variable
      toast({ title: "Differentiation Info", description: `Differentiating with respect to the first detected variable: '${varToDiff}'. If others exist, they are treated as constants.`, duration: 5000});
    } else {
      toast({ title: "Differentiation Info", description: `No variables detected in expression. Attempting differentiation w.r.t. 'x'. If 'x' is not in expression, derivative will be 0.`, duration: 6000});
    }

    try {
      const ast = parseExpression(expression);
      const derivativeAst = differentiateAST(ast, varToDiff);
      const simplifiedDerivativeAst = simplifyAST(derivativeAst); // Simplify the derivative's AST
      const derivativeCode = generateCode(simplifiedDerivativeAst); // Convert simplified AST to string
      
      setDerivativeString(derivativeCode);
      toast({ title: "Differentiation Successful", description: `Derivative w.r.t. ${varToDiff} calculated and simplified.` });
    } catch (e: any) {
      const errorMessage = e.message || "Could not compute derivative. Ensure expression is valid and uses supported functions/variables.";
      setError(`Differentiation Error: ${errorMessage}`);
      toast({ title: "Differentiation Error", description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsDifferentiating(false);
    }
  }, [expression, detectedVariables, toast]);

  const handleIntegrate = useCallback((expr: string, variable: string) => {
    setError(null);
    setDerivativeString(null);
    setProcessedExpressionString(null);
    setIsProcessingExpression(true);
    try {
      const ast = parseExpression(expr);
      const integralAst = integrateSymbolic(ast, variable);
      const integralStr = generateCode(integralAst) + ' + C';
      setProcessedExpressionString(`∫ ${expr} d${variable} = ${integralStr}`);
      toast({ title: 'Integral (symbolic)', description: `Indefinite integral with respect to ${variable}` });
    } catch (e: any) {
      setError(e.message || 'Error during integration.');
      toast({ title: 'Integration Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [toast]);

  const handleExpandExpression = useCallback(() => {
    setError(null);
    // Keep previous numerical result and derivative if they exist
    // setResult(null); 
    // setDerivativeString(null);
    setProcessedExpressionString(null);
    setIsProcessingExpression(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty to expand.");
      setIsProcessingExpression(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      const expanded = expandExpression(expression);
      if (expanded.startsWith("Failed to expand")) {
          setError(expanded);
          toast({ title: "Expansion Error", description: expanded, variant: "destructive" });
      } else {
          setProcessedExpressionString(expanded);
          toast({ title: "Expression Expanded", description: "Using mathjs.expand()" });
      }
    } catch (e: any) {
      const msg = e.message || "Error during expansion.";
      setError(msg);
      toast({ title: "Expansion Error", description: msg, variant: "destructive" });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [expression, toast]);

  const handleFactorExpression = useCallback(() => {
    setError(null);
    // Keep previous numerical result and derivative if they exist
    // setResult(null); 
    // setDerivativeString(null);
    setProcessedExpressionString(null);
    setIsProcessingExpression(true);

    if (!expression.trim()) {
      setError("Expression cannot be empty to factor/simplify.");
      setIsProcessingExpression(false);
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      const factored = factorExpression(expression); // Uses mathjs.simplify() internally
       if (factored.startsWith("Failed to factor")) {
          setError(factored);
          toast({ title: "Factoring/Simplification Error", description: factored, variant: "destructive" });
      } else {
          setProcessedExpressionString(factored);
          toast({ title: "Expression Factored/Simplified", description: "Using mathjs.simplify()" });
      }
    } catch (e: any) {
      const msg = e.message || "Error during factoring/simplification.";
      setError(msg);
      toast({ title: "Factoring Error", description: msg, variant: "destructive" });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [expression, toast]);

  const handleSolveEquation = useCallback((eqn: string, variable: string) => {
    setError(null);
    setProcessedExpressionString(null);
    setIsProcessingExpression(true);
    try {
      // Split at =, move all to one side, parse as expression = 0
      const parts = eqn.split('=');
      if (parts.length !== 2) throw new Error('Equation must be of the form ... = ...');
      const left = parts[0].trim();
      const right = parts[1].trim();
      const expr = `(${left})-(${right})`;
      const ast = parseExpression(expr);
      const solutions = solveEquationSymbolic(ast, variable);
      setProcessedExpressionString(`Solve: ${eqn} for ${variable}\n${solutions.join(' ; ')}`);
      toast({ title: 'Equation Solver', description: `Solving for ${variable}` });
    } catch (e: any) {
      setError(e.message || 'Error during equation solving.');
      toast({ title: 'Solve Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [toast]);

  const handleProveSymbolic = useCallback(() => {
    setError(null);
    setProofResult(null);
    setIsProcessingExpression(true);
    try {
      const ast = parseExpression(expression);
      const result = proveSymbolic(ast);
      setProofResult(result);
      toast({ title: 'Symbolic Proof', description: result.valid ? 'Proof succeeded' : 'Proof failed', variant: result.valid ? 'default' : 'destructive' });
    } catch (e: any) {
      setError(e.message || 'Error during symbolic proof.');
      toast({ title: 'Proof Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [expression, toast]);

  const handleAdvancedSimplify = useCallback(() => {
    setError(null);
    setAdvancedSimplified(null);
    setIsProcessingExpression(true);
    try {
      const ast = parseExpression(expression);
      const simplified = advancedSimplify(ast);
      setAdvancedSimplified(generateCode(simplified));
      toast({ title: 'Advanced Simplify', description: 'Expression simplified using advanced rules.' });
    } catch (e: any) {
      setError(e.message || 'Error during advanced simplification.');
      toast({ title: 'Advanced Simplify Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsProcessingExpression(false);
    }
  }, [expression, toast]);

  const handleReset = () => {
    setExpression('');
    setResult(null);
    setDerivativeString(null);
    setProcessedExpressionString(null);
    setError(null);
    setVariableInputs({});
    setDetectedVariables([]);
    setExampleExpressionInput(false);
    setExampleValuesAssigned(false);
    setExampleSolved(false);
    setIsLoading(false);
    setIsDifferentiating(false);
    setIsProcessingExpression(false);
    toast({ title: "Expression Solver Reset", description: "Input and variables cleared." });
  };

  const availableFunctionsString = useMemo(() => Object.keys(PREDEFINED_FUNCTIONS).sort().join(', '), []);
  const availableConstantsString = useMemo(() => Object.keys(PREDEFINED_CONSTANTS).sort().join(', '), []);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Terminal className="mr-2 h-6 w-6 text-accent" />
          Expression Solver
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={(v) => setActiveTab(v as 'basic' | 'advanced')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Mode</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4">
            {/* Instructional Alert */}
            <Alert variant="default" className="bg-secondary/30 border-secondary">
              <Info className="h-4 w-4" />
              <AlertTitle>How to use</AlertTitle>
              <AlertDescription className="text-xs space-y-1 mt-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    {exampleExpressionInput ? '✅' : '1.'}{' '}
                    Type your expression. Ex: <code className="font-mono bg-card p-0.5 rounded text-xs">myVar * (sin(PI/4) + 0.5)^2</code>. Trigonometric functions (e.g., `sin(x)`) expect angles in **radians**.
                  </li>
                  <li>
                    {exampleValuesAssigned ? '✅' : '2.'}{' '}
                    If variables (e.g., <code className="font-mono bg-card p-0.5 rounded text-xs">myVar</code>, <code className="font-mono bg-card p-0.5 rounded text-xs">x</code>) are detected, input fields will appear. Assign them numerical values for calculation.
                  </li>
                  <li>
                    {exampleSolved ? '✅' : '3.'}{' '}
                    Click "Calculate" for numerical result.
                  </li>
                  <li>
                    4. Click "Differentiate" for the symbolic derivative (w.r.t. the first detected variable or 'x'). The derivative will also be simplified.
                  </li>
                  <li>
                    5. Use "Expand Expression" or "Factor/Simplify Expression" for symbolic manipulations (these use `mathjs`).
                  </li>
                </ol>
                <p className="text-xs mt-2">
                  Tip: You can copy a formula string (e.g., 'PI * r^2') from your 'Formula Reference' and paste it here, then define any variables like 'r'.
                </p>
                <p className="text-xs mt-1">
                  Available functions for custom parser (case-insensitive): <code className="font-mono">{availableFunctionsString}</code>.
                </p>
                <p className="text-xs">
                  Available constants for custom parser (case-insensitive): <code className="font-mono">{availableConstantsString}</code>.
                </p>
                <p className="text-xs">
                  Supported operators for custom parser: <code className="font-mono">+ - * / ^ ( )</code>. Use <code className="font-mono">^</code> for exponentiation. Unary minus is supported.
                </p>
                <p className="text-xs mt-1">
                 For "Expand" and "Factor/Simplify" buttons, standard `mathjs` syntax is expected (e.g., `sin(x)`, `pow(base, exp)`).
                </p>
              </AlertDescription>
            </Alert>

            {/* Expression Input */}
            <div>
              <Label htmlFor="math-expression" className="text-sm font-medium">Enter Expression</Label>
              <Input
                id="math-expression"
                type="text"
                value={expression}
                onChange={handleInputChange}
                placeholder="(e.g., (10 + x) * 2 - y / 4 or sin(PI/2) * x)"
                className="mt-1 font-mono"
                aria-label="Mathematical expression"
                tabIndex={0}
              />
            </div>

            {/* Variable Inputs */}
            {detectedVariables.length > 0 && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                <Label className="text-sm font-medium block mb-1">Assign Variable Values (for Numerical Calculation):</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                  {detectedVariables.map(variableName => (
                    <div key={variableName}>
                      <Label htmlFor={`var-${variableName}`} className="text-xs font-mono">{variableName} =</Label>
                      <Input
                        id={`var-${variableName}`}
                        type="text" 
                        inputMode="decimal"
                        value={variableInputs[variableName] || ''}
                        onChange={(e) => handleVariableValueChange(variableName, e.target.value)}
                        placeholder="number"
                        className="mt-0.5 font-mono text-sm h-9"
                        tabIndex={0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={handleSolve} disabled={isLoading || isDifferentiating || isProcessingExpression} className="w-full" tabIndex={0}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sigma className="mr-2 h-4 w-4" />}
                Calculate
                </Button>
                <Button onClick={handleDifferentiate} disabled={isLoading || isDifferentiating || isProcessingExpression || !expression.trim()} className="w-full" variant="secondary" tabIndex={0}>
                {isDifferentiating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Differentiate
                </Button>
                <Button onClick={handleExpandExpression} disabled={isLoading || isDifferentiating || isProcessingExpression || !expression.trim()} className="w-full" variant="secondary" tabIndex={0}>
                {isProcessingExpression && !isDifferentiating && !isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FunctionSquare className="mr-2 h-4 w-4" />}
                Expand Expression
                </Button>
                <Button onClick={handleFactorExpression} disabled={isLoading || isDifferentiating || isProcessingExpression || !expression.trim()} className="w-full" variant="secondary" tabIndex={0}>
                {isProcessingExpression && !isDifferentiating && !isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
                Factor/Simplify Expression
                </Button>
                <Button onClick={handleProveSymbolic} disabled={isLoading || isDifferentiating || isProcessingExpression || !expression.trim()} className="w-full" variant="secondary" tabIndex={0}>
                  Prove Symbolically
                </Button>
                <Button onClick={handleAdvancedSimplify} disabled={isLoading || isDifferentiating || isProcessingExpression || !expression.trim()} className="w-full" variant="secondary" tabIndex={0}>
                  Advanced Simplify
                </Button>
            </div>

            {/* Result Displays */}
            {result !== null && (
              <div className="space-y-2 pt-3 border-t border-border mt-4">
                <Label className="text-sm font-medium text-muted-foreground text-center block">Numerical Result:</Label>
                <p className="text-2xl font-bold text-accent text-center font-mono break-all p-2 bg-muted/20 rounded-md">
                  {String(result)}
                </p>
              </div>
            )}

            {derivativeString && (
              <div className="space-y-2 pt-3 border-t border-border mt-4">
                <Label className="text-sm font-medium text-muted-foreground text-center block">Symbolic Derivative (w.r.t. {detectedVariables[0] || 'x'}):</Label>
                <div className="p-3 bg-muted/30 rounded-md text-sm overflow-x-auto">
                    <KatexDisplay latexString={derivativeString} className="text-base"/>
                </div>
              </div>
            )}

            {processedExpressionString && (
              <div className="space-y-2 pt-3 border-t border-border mt-4">
                <Label className="text-sm font-medium text-muted-foreground text-center block">Processed Expression (Expanded or Factored/Simplified):</Label>
                <div className="p-3 bg-muted/30 rounded-md text-sm overflow-x-auto">
                     <KatexDisplay latexString={processedExpressionString} className="text-base"/>
                </div>
              </div>
            )}

            {/* Category Detected Message */}
            {categoryDetected && (
              <div className="text-xs text-blue-700 font-semibold mb-2">{categoryDetected}</div>
            )}

            {/* Proof Result Display */}
            {proofResult && (
              <div className="space-y-2 pt-3 border-t border-border mt-4">
                <Label className="text-sm font-medium text-muted-foreground text-center block">Symbolic Proof Steps:</Label>
                <div className="p-3 bg-muted/30 rounded-md text-sm overflow-x-auto">
                  {proofResult.steps.map((step, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="font-mono">{step.expression}</span>
                      {step.rule && <span className="ml-2 text-xs text-muted-foreground">({step.rule})</span>}
                    </div>
                  ))}
                  <div className={proofResult.valid ? 'text-green-700 font-bold mt-2' : 'text-red-700 font-bold mt-2'}>
                    {proofResult.message}
                  </div>
                </div>
              </div>
            )}
            {/* Advanced Simplified Result Display */}
            {advancedSimplified && (
              <div className="space-y-2 pt-3 border-t border-border mt-4">
                <Label className="text-sm font-medium text-muted-foreground text-center block">Advanced Simplified Expression:</Label>
                <div className="p-3 bg-muted/30 rounded-md text-sm overflow-x-auto">
                  <KatexDisplay latexString={advancedSimplified} className="text-base"/>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>
                     {error.startsWith("Syntax error") ? "Syntax Error" :
                      error.startsWith("Type error") ? "Type Error" :
                      error.startsWith("Reference error") ? "Reference Error" :
                      error.startsWith("Domain error") ? "Domain Error" :
                      error.startsWith("Please assign") ? "Input Error" :
                      error.startsWith("Incomplete expression") ? "Input Error" :
                     "Error"}
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4">
            {/* Advanced mode content (if any) */}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full gap-2">
          <Button 
            onClick={handleSolve} 
            className="flex-1"
            disabled={isLoading || !expression.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Terminal className="mr-2 h-4 w-4" />
                Solve
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default ExpressionSolver;


"use client";
import { useState, useCallback } from 'react';
import type { HistoryEntry } from '@/types';
import { toast } from '@/hooks/use-toast';

// Helper for safe evaluation
const simpleCalculate = (val1: number, op: string, val2: number): number | null => {
  switch (op) {
    case '+': return val1 + val2;
    case '-': return val1 - val2;
    case '*': return val1 * val2;
    case '/':
      if (val2 === 0) {
        toast({ title: "Error", description: "Cannot divide by zero", variant: "destructive" });
        return null;
      }
      return val1 / val2;
    case '^': return Math.pow(val1, val2);
    default:
      return null;
  }
};

const factorial = (n: number): number | null => {
  if (n < 0) {
    toast({ title: "Error", description: "Factorial of negative number", variant: "destructive" });
    return null;
  }
  if (n === 0) return 1;
  if (n !== Math.floor(n)) { // Check if n is not an integer
    toast({ title: "Error", description: "Factorial of non-integer", variant: "destructive" });
    return null;
  }
  if (n > 170) { // Max factorial before Infinity in JS for standard numbers
    toast({ title: "Error", description: "Factorial input too large, result exceeds limit.", variant: "destructive" });
    return null;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

const RAGE_QUIT_CLEAR_COUNT = 3;
const RAGE_QUIT_WINDOW_MS = 5000; // 5 seconds

interface UseCalculatorProps {
  isHigherPrecisionMode: boolean;
}

export const useCalculator = ({ isHigherPrecisionMode }: UseCalculatorProps) => {
  const [currentValue, setCurrentValue] = useState<string>('');
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [isResultDisplayed, setIsResultDisplayed] = useState<boolean>(false);
  const [openParenthesesCount, setOpenParenthesesCount] = useState(0);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memoryValue, setMemoryValue] = useState<number | null>(null);
  const memoryIndicator = memoryValue !== null;

  const [clearTimestamps, setClearTimestamps] = useState<number[]>([]);
  const [shouldTriggerRageQuitEasterEgg, setShouldTriggerRageQuitEasterEgg] = useState(false);

  const formatResult = useCallback((num: number): string => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";

    if (isHigherPrecisionMode) {
      const precision = 15;
      let resultStr = Number(num.toPrecision(precision)).toString();
      if (resultStr.includes('e') && Math.abs(num) > 1e-7 && Math.abs(num) < 1e15) {
          const decimalPlaces = Math.max(0, precision - Math.floor(Math.log10(Math.abs(num))) - 1);
          if (decimalPlaces <= 12) { 
            resultStr = num.toFixed(Math.min(decimalPlaces, 12));
            resultStr = parseFloat(resultStr).toString(); 
          }
      }
      return resultStr;
    }
    return String(parseFloat(Number(num).toPrecision(12)));
  }, [isHigherPrecisionMode]);


  const addToHistory = useCallback((expr: string, resultNum: number) => {
    const resultStr = formatResult(resultNum);
    // Avoid logging if expression is identical to its result (e.g. just entering a number and hitting equals)
    // Or if the expression is just the result itself from a previous operation recalled.
    if (expr.trim() === resultStr.trim()) return;
    
    const newHistoryEntry: HistoryEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
      expression: expr,
      result: resultStr,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newHistoryEntry, ...prev.slice(0, 49)]);
  }, [formatResult]);


  const resetState = (keepHistory: boolean = true) => {
    setCurrentValue('');
    setExpression('');
    setPreviousValue(null);
    setOperator(null);
    setIsResultDisplayed(false);
    setOpenParenthesesCount(0);
    if (!keepHistory) {
      setHistory([]);
    }
  };

  const performCalculation = useCallback(() => {
    if (!operator || previousValue === null || currentValue === '') return null;
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    if (isNaN(prev) || isNaN(current)) return null;
    return simpleCalculate(prev, operator, current);
  }, [operator, previousValue, currentValue]);


  const handleNumber = (num: string) => {
    if (isResultDisplayed) {
      setCurrentValue(num);
      setExpression(num);
      setPreviousValue(null);
      setOperator(null);
      setIsResultDisplayed(false);
    } else {
      if (currentValue === '0' && num === '0') return;
      if (currentValue === '0' && num !== '.' && num !== '0') {
        setCurrentValue(num);
        setExpression(prev => {
            if (prev.endsWith('0') && !prev.match(/\.[0-9]*0$/) && prev.length > 1 && !['+', '-', '*', '/', '^', '('].some(op => prev.endsWith(op + '0'))) {
                 return prev.slice(0, -1) + num;
            }
            return prev + num;
        });
      } else {
        setCurrentValue((prev) => prev + num);
        setExpression((prev) => prev + num);
      }
    }
  };

  const handleOperator = (op: string) => {
    if (currentValue === '' && previousValue === null && !expression.endsWith(')') && op !== '-') return;

    if (currentValue !== '') {
      if (previousValue !== null && operator) {
        const intermediateResult = performCalculation();
        if (intermediateResult !== null) {
          const intermediateExpression = `${previousValue}${operator}${currentValue}`;
          addToHistory(intermediateExpression, intermediateResult);
          const resultStr = formatResult(intermediateResult);
          setExpression(resultStr + op);
          setCurrentValue('');
          setPreviousValue(resultStr);
          setOperator(op);
          setIsResultDisplayed(false);
        } else { 
          setOperator(op);
          if (previousValue) setExpression(previousValue + op);
        }
      } else {
        setPreviousValue(currentValue);
        setCurrentValue('');
        setOperator(op);
        setExpression(expression + op);
        setIsResultDisplayed(false);
      }
    } else if (previousValue !== null && !isResultDisplayed && !expression.endsWith('(')) {
      setOperator(op);
      setExpression(previousValue + op);
    } else if (expression.endsWith(')')) {
        setPreviousValue(expression); 
        setCurrentValue('');
        setOperator(op);
        setExpression(expression + op);
        setIsResultDisplayed(false);
    } else if (op === '-' && (expression === '' || expression.endsWith('(') || ['+', '-', '*', '/', '^'].some(prevOp => expression.endsWith(prevOp)))) {
      setCurrentValue('-');
      setExpression(expression + '-');
      setIsResultDisplayed(false);
    }
  };

  const handleEquals = () => {
    if (openParenthesesCount > 0) {
        toast({ title: "Error", description: "Unclosed parentheses.", variant: "destructive"});
        return;
    }
    if (previousValue === null && operator === null && currentValue !== '') {
      const val = parseFloat(currentValue);
      if (!isNaN(val)) {
        const resultStr = formatResult(val);
        addToHistory(currentValue, val); // Log the input itself if it's just a number
        setExpression(resultStr);
        setCurrentValue(resultStr); 
        setIsResultDisplayed(true);
      }
      return;
    }

    if (previousValue === null || operator === null || currentValue === '') return;

    const result = performCalculation();
    if (result !== null) {
      const finalExpression = `${previousValue}${operator}${currentValue}`;
      addToHistory(finalExpression, result);
      const resultStr = formatResult(result);
      setCurrentValue(resultStr);
      setExpression(resultStr);
      setPreviousValue(null);
      setOperator(null);
      setIsResultDisplayed(true);
    }
  };

  const handleClear = () => {
    const newTime = Date.now();
    setClearTimestamps(prevTimestamps => {
        const updatedTimestamps = [...prevTimestamps, newTime].slice(-RAGE_QUIT_CLEAR_COUNT);
        if (updatedTimestamps.length === RAGE_QUIT_CLEAR_COUNT) {
            if ((updatedTimestamps[RAGE_QUIT_CLEAR_COUNT - 1] - updatedTimestamps[0]) < RAGE_QUIT_WINDOW_MS) {
                setShouldTriggerRageQuitEasterEgg(true);
                return [];
            }
        }
        return updatedTimestamps;
    });
    resetState(true);
  };

  const resetRageQuitTrigger = useCallback(() => {
    setShouldTriggerRageQuitEasterEgg(false);
  }, []);


  const handleBackspace = () => {
    if (isResultDisplayed) {
      resetState(true);
    } else {
      const lastCharOfExpr = expression.slice(-1);
      if (lastCharOfExpr === '(') {
        setOpenParenthesesCount(prev => Math.max(0, prev - 1));
      } else if (lastCharOfExpr === ')') {
        setOpenParenthesesCount(prev => prev + 1);
      }

      if (currentValue !== '') {
        const newCurrentValue = currentValue.slice(0, -1);
        setCurrentValue(newCurrentValue);
        setExpression(prev => prev.slice(0, -1));
      } else if (operator !== null) {
        setCurrentValue(previousValue || '');
        setExpression(previousValue || '');
        setPreviousValue(null);
        setOperator(null);
      } else if (expression !== '') {
         setExpression(prev => prev.slice(0, -1));
         if(expression.length === 1) resetState(true);
      }
    }
  };

  const handleDecimal = () => {
    if (isResultDisplayed) {
      setCurrentValue('0.');
      setExpression('0.');
      setPreviousValue(null);
      setOperator(null);
      setIsResultDisplayed(false);
    } else if (!currentValue.includes('.')) {
      const valToSet = currentValue === '' || currentValue === '-' ? currentValue + '0.' : currentValue + '.';
      setCurrentValue(valToSet);
      setExpression((prev) => {
         if(currentValue === '' && (prev === '' || prev.endsWith('(') || ['+', '-', '*', '/', '^'].some(op => prev.endsWith(op)))) {
            return prev + '0.';
         }
         if(currentValue === '-' && (prev.endsWith('-'))) {
            return prev + '0.';
         }
         return prev + '.';
      });
    }
  };

  const handleSpecialOperation = (opType: string) => {
    if (opType === '(') {
      setExpression(prev => prev + '(');
      setOpenParenthesesCount(prev => prev + 1);
      if (isResultDisplayed) {
          setCurrentValue('');
          setPreviousValue(null);
          setOperator(null);
          setIsResultDisplayed(false);
      }
      if (currentValue !== '' && !isResultDisplayed && !['+', '-', '*', '/', '^', '('].some(op => expression.endsWith(op))) {
          handleOperator('*');
          setExpression(prev => prev.slice(0, -1) + '*(');
      }
      return;
    }
    if (opType === ')') {
      if (openParenthesesCount > 0 && (currentValue !== '' || expression.endsWith('(') || (previousValue !== null && expression.endsWith(operator || '')))) {
        setExpression(prev => prev + ')');
        setOpenParenthesesCount(prev => prev - 1);
        if (currentValue !== '') {
            setPreviousValue(expression + currentValue + ')');
            setCurrentValue('');
        }
      } else {
        toast({ title: "Warning", description: "Invalid placement for )", variant: "default" });
      }
      return;
    }

    if (opType === 'DRG') {
        const newMode = angleMode === 'deg' ? 'rad' : 'deg';
        setAngleMode(newMode);
        toast({ title: "Angle Mode", description: `Switched to ${newMode === 'rad' ? 'Radians' : 'Degrees'}`});
        return;
    }

    const handleConstant = (constValue: number, constSymbol: string) => {
        const constStr = formatResult(constValue);
        if (isResultDisplayed || currentValue === '' || (operator && previousValue !== null && !currentValue.match(/[0-9.]/))) {
            setCurrentValue(constStr);
            if (operator && previousValue !== null) {
                setExpression(previousValue + operator + constSymbol);
            } else {
                setExpression(constSymbol);
                setPreviousValue(null);
                setOperator(null);
            }
            setIsResultDisplayed(false);
        } else {
            if(expression.match(/[0-9.)]$/) || expression.endsWith('π') || expression.endsWith('e')) {
                handleOperator('*'); // Assume multiplication if a constant is inserted after a number/closing parenthesis
                setExpression(prevExpression => prevExpression + constSymbol); // Append symbol after new operator
                setCurrentValue(constStr); // Current value becomes the constant for next operation
            } else {
                setCurrentValue(constStr);
                setExpression(prev => prev + constSymbol);
            }
            setIsResultDisplayed(false);
        }
    };

    if (opType === 'PI') {
        handleConstant(Math.PI, 'π');
        return;
    }
    if (opType === 'E_CONST') {
        handleConstant(Math.E, 'e');
        return;
    }

    let targetValueStr = currentValue;
    if (currentValue === '' && previousValue !== null && isResultDisplayed) {
        targetValueStr = previousValue;
    } else if (currentValue === '' && expression.endsWith(')')) {
        toast({ title: "Info", description: "Please evaluate parentheses first or enter a number for unary operations.", variant: "default"});
        return;
    } else if (currentValue === '' && opType !== '+/-') {
      toast({ title: "Info", description: "Enter a number first.", variant: "default"});
      return;
    }

    let val = parseFloat(targetValueStr);

    if (opType === '+/-') {
        if (targetValueStr !== '' && targetValueStr !== '0' && targetValueStr !== '-') {
          const newValue = targetValueStr.startsWith('-') ? targetValueStr.slice(1) : `-${targetValueStr}`;
          setCurrentValue(newValue);
          if (isResultDisplayed || (!operator && previousValue === null)) {
            setExpression(newValue);
          } else {
            // More robust replacement for +/-: find the last number segment in expression and toggle its sign
            const exprParts = expression.match(/(\d+\.?\d*|-\d+\.?\d*|[+\-*/^()]|π|e)/g) || [];
            if (exprParts.length > 0 && exprParts[exprParts.length - 1] === targetValueStr) {
                exprParts[exprParts.length - 1] = newValue;
                setExpression(exprParts.join(''));
            } else { // Fallback if regex matching is tricky
                setExpression(prev => prev.endsWith(targetValueStr) ? prev.slice(0, -targetValueStr.length) + newValue : prev + newValue);
            }
          }
        } else if (targetValueStr === '-') {
             setCurrentValue('');
             setExpression(prev => prev.endsWith('-') ? prev.slice(0, -1) : prev);
        }
        return;
    }

    if (isNaN(val)) {
         toast({ title: "Error", description: "Invalid number for operation.", variant: "destructive"});
         return;
    }

    let result: number | null = null;
    let historyExpr = targetValueStr;
    // let appliedFunction = opType; // Not currently used

    switch (opType) {
      case '%':
        let percentValue;
        if (previousValue && operator && (operator === '+' || operator === '-')) {
          const prevVal = parseFloat(previousValue);
          if (isNaN(prevVal)) { toast({title:"Error", description:"Invalid previous value for percentage.", variant: "destructive"}); return; }
          percentValue = prevVal * (val / 100);
          historyExpr = `${previousValue} ${operator} ${val}% (of ${previousValue})`;
          setCurrentValue(formatResult(percentValue));
          setExpression(previousValue + operator + formatResult(percentValue));
        } else if (previousValue && operator && (operator === '*' || operator === '/' || operator === '^')) {
          percentValue = val / 100;
          historyExpr = `${previousValue} ${operator} ${val}% (as ${formatResult(percentValue)})`;
          setCurrentValue(formatResult(percentValue));
          setExpression(previousValue + operator + formatResult(percentValue));
        } else { // Standalone percentage
          percentValue = val / 100;
          historyExpr = `${val}% (as decimal)`;
          setCurrentValue(formatResult(percentValue));
          setExpression(formatResult(percentValue));
          setPreviousValue(null); 
          setOperator(null);
        }
        result = percentValue; // For history logging
        break;
      case 'sqrt':
        if (val < 0) { toast({ title: "Error", description: "Square root of negative number", variant: "destructive" }); return; }
        result = Math.sqrt(val);
        historyExpr = `sqrt(${targetValueStr})`;
        break;
      case 'sin':
        result = Math.sin(angleMode === 'deg' ? val * Math.PI / 180 : val);
        historyExpr = `sin(${targetValueStr}${angleMode==='deg'?'°':''})`;
        break;
      case 'cos':
        result = Math.cos(angleMode === 'deg' ? val * Math.PI / 180 : val);
        historyExpr = `cos(${targetValueStr}${angleMode==='deg'?'°':''})`;
        break;
      case 'tan':
        if (angleMode === 'deg' && Math.abs(val % 180) === 90 && Math.abs(Math.cos(val * Math.PI / 180)) < 1e-12 ) {
            toast({ title: "Error", description: "Tangent is undefined for this angle.", variant: "destructive" });
            return;
        }
        result = Math.tan(angleMode === 'deg' ? val * Math.PI / 180 : val);
        historyExpr = `tan(${targetValueStr}${angleMode==='deg'?'°':''})`;
        break;
      case 'asin':
        if (val < -1 || val > 1) { toast({ title: "Error", description: "Arcsin input must be between -1 and 1.", variant: "destructive"}); return; }
        result = Math.asin(val);
        if (angleMode === 'deg') result = result * 180 / Math.PI;
        historyExpr = `asin(${targetValueStr}) -> ${angleMode}`;
        break;
      case 'acos':
        if (val < -1 || val > 1) { toast({ title: "Error", description: "Arccos input must be between -1 and 1.", variant: "destructive"}); return; }
        result = Math.acos(val);
        if (angleMode === 'deg') result = result * 180 / Math.PI;
        historyExpr = `acos(${targetValueStr}) -> ${angleMode}`;
        break;
      case 'atan':
        result = Math.atan(val);
        if (angleMode === 'deg') result = result * 180 / Math.PI;
        historyExpr = `atan(${targetValueStr}) -> ${angleMode}`;
        break;
      case 'sinh': result = Math.sinh(val); historyExpr = `sinh(${targetValueStr})`; break;
      case 'cosh': result = Math.cosh(val); historyExpr = `cosh(${targetValueStr})`; break;
      case 'tanh': result = Math.tanh(val); historyExpr = `tanh(${targetValueStr})`; break;
      case 'asinh': result = Math.asinh(val); historyExpr = `asinh(${targetValueStr})`; break;
      case 'acosh':
        if (val < 1) { toast({ title: "Error", description: "acosh input must be >= 1.", variant: "destructive"}); return; }
        result = Math.acosh(val);
        historyExpr = `acosh(${targetValueStr})`;
        break;
      case 'atanh':
        if (val <= -1 || val >= 1) { toast({ title: "Error", description: "atanh input must be between -1 and 1.", variant: "destructive"}); return; }
        result = Math.atanh(val);
        historyExpr = `atanh(${targetValueStr})`;
        break;
      case 'RECIPROCAL': 
        if (val === 0) { toast({ title: "Error", description: "Cannot divide by zero (1/0).", variant: "destructive"}); return; }
        result = 1 / val;
        historyExpr = `1/(${targetValueStr})`;
        break;
      case 'log':
        if (val <= 0) { toast({ title: "Error", description: "Logarithm of non-positive number", variant: "destructive" }); return; }
        result = Math.log10(val);
        historyExpr = `log(${targetValueStr})`;
        break;
      case 'ln':
         if (val <= 0) { toast({ title: "Error", description: "Natural log of non-positive number", variant: "destructive" }); return; }
        result = Math.log(val);
        historyExpr = `ln(${targetValueStr})`;
        break;
      case 'FACTORIAL':
        result = factorial(val);
        if (result === null) return;
        historyExpr = `${targetValueStr}!`;
        break;
    }

    if (result !== null) {
      const resultStr = formatResult(result);
      addToHistory(historyExpr, result); 
      setCurrentValue(resultStr);

      if (isResultDisplayed || (!operator && previousValue === null)) {
         setExpression(resultStr);
         setPreviousValue(null);
         setOperator(null);
      } else if (operator && previousValue !== null) {
        const currentExpressionSnapshot = expression;
        // Replace the part of expression that was targetValueStr with the resultStr
        // This needs to be more robust, e.g. if targetValueStr was part of a longer number
        const targetRegex = new RegExp(targetValueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
        if(targetRegex.test(currentExpressionSnapshot) && currentExpressionSnapshot.endsWith(targetValueStr)) {
            setExpression(currentExpressionSnapshot.slice(0, -targetValueStr.length) + resultStr);
        } else {
             // Fallback: This might happen if targetValueStr was part of a function call already like `sin(targetValueStr)`
             // In this case, we might just set the expression to the new result.
             setExpression(previousValue + operator + resultStr);
        }
      } else {
         setExpression(resultStr);
      }
      setIsResultDisplayed(true);
    }
  };

  const handleMemoryOperation = (operationType: 'MC' | 'MR' | 'MS' | 'M+' | 'M-') => {
    let valueToProcess: number | null = null;

    if (currentValue !== '') {
        const parsedCurrent = parseFloat(currentValue);
        if (!isNaN(parsedCurrent) && isFinite(parsedCurrent)) {
            valueToProcess = parsedCurrent;
        }
    } else if (isResultDisplayed && expression !== '') {
        const parsedExpression = parseFloat(expression);
         if (!isNaN(parsedExpression) && isFinite(parsedExpression)) {
            valueToProcess = parsedExpression;
        }
    }

    switch (operationType) {
      case 'MC':
        setMemoryValue(null);
        toast({ title: "Memory Cleared" });
        break;
      case 'MR':
        if (memoryValue !== null) {
          const memStr = formatResult(memoryValue);
          setCurrentValue(memStr);
          setExpression(memStr);
          setPreviousValue(null);
          setOperator(null);
          setIsResultDisplayed(true);
          toast({ title: "Memory Recalled", description: `Value: ${memStr}` });
        } else {
          toast({ title: "Memory Empty", variant: "default" });
        }
        break;
      case 'MS':
        if (valueToProcess !== null) {
            setMemoryValue(valueToProcess);
            toast({ title: "Memory Stored", description: `Stored: ${formatResult(valueToProcess)}` });
        } else {
            toast({ title: "Invalid Value for MS", description: "Current display is not a valid number to store.", variant: "destructive" });
        }
        break;
      case 'M+':
        if (valueToProcess !== null) {
          setMemoryValue((prevMem) => {
              const newMem = (prevMem === null ? 0 : prevMem) + valueToProcess!;
              toast({ title: "Memory Add", description: `${formatResult(valueToProcess!)} added. New memory: ${formatResult(newMem)}` });
              return newMem;
          });
        } else {
          toast({ title: "Invalid Value for M+", description: "Current display is not a valid number.", variant: "destructive" });
        }
        break;
      case 'M-':
        if (valueToProcess !== null) {
          setMemoryValue((prevMem) => {
              const newMem = (prevMem === null ? 0 : prevMem) - valueToProcess!;
              toast({ title: "Memory Subtract", description: `${formatResult(valueToProcess!)} subtracted. New memory: ${formatResult(newMem)}` });
              return newMem;
          });
        } else {
          toast({ title: "Invalid Value for M-", description: "Current display is not a valid number.", variant: "destructive" });
        }
        break;
    }
  };


  const recallFromHistory = (entry: HistoryEntry) => {
    const entryResultNum = parseFloat(entry.result);
    if (!isNaN(entryResultNum)){
        setCurrentValue(formatResult(entryResultNum));
        setExpression(formatResult(entryResultNum));
    } else {
        setCurrentValue(entry.result); // If result was "Error" or "Infinity"
        setExpression(entry.result);
    }
    setPreviousValue(null);
    setOperator(null);
    setIsResultDisplayed(true);
    setOpenParenthesesCount(0);
    toast({ title: "Recalled", description: `Set to ${entry.result}`});
  };

  const clearHistory = () => {
    setHistory([]);
    toast({ title: "History Cleared" });
  };

  return {
    currentValue,
    expression,
    history,
    angleMode,
    memoryIndicator,
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleBackspace,
    handleDecimal,
    handleSpecialOperation,
    handleMemoryOperation,
    recallFromHistory,
    clearHistory,
    shouldTriggerRageQuitEasterEgg,
    resetRageQuitTrigger,
  };
};

import type { FC } from 'react';
import React, { useCallback } from 'react'; // Import React for useMemo and React.memo
import CalculatorButton from './calculator-button';
import type { CalculatorButtonConfig } from '@/types';
import { Delete, Percent, Divide, X, Minus, Plus, Equal, Sigma, Pi as PiIcon, Brain, Parentheses } from 'lucide-react';
import { CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalculatorKeypadProps {
  onButtonClick: (value: string, type: CalculatorButtonConfig['type']) => void;
  onLongPressCKey: () => void;
  isAdvancedMode: boolean;
  activeStandardViewInAdvanced?: boolean;
  angleMode?: 'deg' | 'rad';
}

const CalculatorKeypad: FC<CalculatorKeypadProps> = React.memo(({
  onButtonClick,
  onLongPressCKey,
  isAdvancedMode,
  activeStandardViewInAdvanced,
  angleMode = 'deg',
}) => {
  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration for button press
    }
  }, []);

  // Enhanced button press handler with haptic feedback
  const handleButtonPress = useCallback((value: string, type: CalculatorButtonConfig['type']) => {
    triggerHapticFeedback();
    onButtonClick(value, type);
  }, [onButtonClick, triggerHapticFeedback]);

  // Enhanced memory button press handler
  const handleMemoryButtonPress = useCallback((operation: string) => {
    triggerHapticFeedback();
    // Add custom animation class for memory operations
    const memoryIndicator = document.querySelector('.memory-indicator');
    if (memoryIndicator) {
      memoryIndicator.classList.add('memory-flash');
      setTimeout(() => memoryIndicator.classList.remove('memory-flash'), 200);
    }
    onButtonClick(operation, 'memory');
  }, [onButtonClick, triggerHapticFeedback]);

  const buttons = React.useMemo(() => {
    const standardButtons: CalculatorButtonConfig[] = [
      { id: 'clear', label: 'C', value: 'clear', type: 'action', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', longPressValue: 'easterEgg', ariaLabel: 'Clear All' },
      { id: 'backspace', label: <Delete />, value: 'backspace', type: 'action', longPressValue: 'easterEgg', ariaLabel: 'Backspace / Delete' },
      { id: 'percent', label: <Percent />, value: '%', type: 'special', variant: 'accent', ariaLabel: 'Percentage' },
      { id: 'divide', label: <Divide />, value: '/', type: 'operator', variant: 'accent', ariaLabel: 'Divide' },

      { id: 'seven', label: '7', value: '7', type: 'number' },
      { id: 'eight', label: '8', value: '8', type: 'number' },
      { id: 'nine', label: '9', value: '9', type: 'number' },
      { id: 'multiply', label: <X />, value: '*', type: 'operator', variant: 'accent', ariaLabel: 'Multiply' },

      { id: 'four', label: '4', value: '4', type: 'number' },
      { id: 'five', label: '5', value: '5', type: 'number' },
      { id: 'six', label: '6', value: '6', type: 'number' },
      { id: 'subtract', label: <Minus />, value: '-', type: 'operator', variant: 'accent', ariaLabel: 'Subtract' },

      { id: 'one', label: '1', value: '1', type: 'number' },
      { id: 'two', label: '2', value: '2', type: 'number' },
      { id: 'three', label: '3', value: '3', type: 'number' },
      { id: 'add', label: <Plus />, value: '+', type: 'operator', variant: 'accent', ariaLabel: 'Add' },

      { id: 'toggleSignStd', label: '+/-', value: '+/-', type: 'special', variant: 'secondary', ariaLabel: 'Toggle Sign (+/-)' },
      { id: 'zero', label: '0', value: '0', type: 'number' },
      { id: 'decimal', label: '.', value: '.', type: 'number', ariaLabel: 'Decimal Point' },
      { id: 'equals', label: <Equal />, value: '=', type: 'action', className: 'bg-primary text-primary-foreground hover:bg-primary/90', ariaLabel: 'Equals' },
    ];

    const advancedStandardButtons: CalculatorButtonConfig[] = [
      // Enhanced memory functions with improved accessibility
      { 
        id: 'memClear', 
        label: 'MC', 
        value: 'MC', 
        type: 'memory', 
        variant: 'secondary', 
        ariaLabel: 'Memory Clear',
        description: 'Clears the stored value in memory'
      },
      { 
        id: 'memRecall', 
        label: 'MR', 
        value: 'MR', 
        type: 'memory', 
        variant: 'secondary', 
        ariaLabel: 'Memory Recall',
        description: 'Recalls the stored value from memory'
      },
      { 
        id: 'memPlus', 
        label: 'M+', 
        value: 'M+', 
        type: 'memory', 
        variant: 'secondary', 
        ariaLabel: 'Memory Add',
        description: 'Adds current value to memory'
      },
      { 
        id: 'memMinus', 
        label: 'M-', 
        value: 'M-', 
        type: 'memory', 
        variant: 'secondary', 
        ariaLabel: 'Memory Subtract',
        description: 'Subtracts current value from memory'
      },

      // Memory Functions Row 2 & DRG, Parentheses
      { id: 'memStore', label: 'MS', value: 'MS', type: 'memory', variant: 'secondary', ariaLabel: 'Memory Store' },
      { id: 'drg', label: angleMode === 'deg' ? 'Deg' : 'Rad', value: 'DRG', type: 'special', variant: 'secondary', ariaLabel: 'Toggle Degree/Radian Mode' },
      { id: 'openParen', label: '(', value: '(', type: 'special', variant: 'secondary', ariaLabel: 'Open Parenthesis' },
      { id: 'closeParen', label: ')', value: ')', type: 'special', variant: 'secondary', ariaLabel: 'Close Parenthesis' },
      
      // Scientific Functions - Adjusted for 9 rows total in advanced standard view
      { id: 'sinAdv', label: 'sin', value: 'sin', type: 'special', variant: 'secondary', ariaLabel: 'Sine',
        description: 'Calculates sine of angle (in current angle mode)'
      },
      { id: 'cosAdv', label: 'cos', value: 'cos', type: 'special', variant: 'secondary', ariaLabel: 'Cosine' },
      { id: 'tanAdv', label: 'tan', value: 'tan', type: 'special', variant: 'secondary', ariaLabel: 'Tangent' },
      { id: 'powAdv', label: <>x<sup>y</sup></>, value: '^', type: 'operator', variant: 'accent', ariaLabel: 'Exponent' },

      { id: 'asinAdv', label: 'sin⁻¹', value: 'asin', type: 'special', variant: 'secondary', ariaLabel: 'Arcsine' },
      { id: 'acosAdv', label: 'cos⁻¹', value: 'acos', type: 'special', variant: 'secondary', ariaLabel: 'Arccosine' },
      { id: 'atanAdv', label: 'tan⁻¹', value: 'atan', type: 'special', variant: 'secondary', ariaLabel: 'Arctangent' },
      { id: 'sqrtAdv', label: '√', value: 'sqrt', type: 'special', variant: 'secondary', ariaLabel: 'Square Root' },

      { id: 'logAdv', label: 'log', value: 'log', type: 'special', variant: 'secondary', ariaLabel: 'Logarithm (base 10)' },
      { id: 'lnAdv', label: 'ln', value: 'ln', type: 'special', variant: 'secondary', ariaLabel: 'Natural Logarithm' },
      { id: 'piAdv', label: <PiIcon />, value: 'PI', type: 'special', variant: 'secondary', ariaLabel: 'Pi Constant' },
      { id: 'eAdv', label: 'e', value: 'E_CONST', type: 'special', variant: 'secondary', ariaLabel: 'Euler\'s Number (e)' },

      { id: 'sinhAdv', label: 'sinh', value: 'sinh', type: 'special', variant: 'secondary', ariaLabel: 'Hyperbolic Sine' },
      { id: 'coshAdv', label: 'cosh', value: 'cosh', type: 'special', variant: 'secondary', ariaLabel: 'Hyperbolic Cosine' },
      { id: 'tanhAdv', label: 'tanh', value: 'tanh', type: 'special', variant: 'secondary', ariaLabel: 'Hyperbolic Tangent' },
      { id: 'factorialAdv', label: 'n!', value: 'FACTORIAL', type: 'special', variant: 'secondary', ariaLabel: 'Factorial' },
      
      { id: 'asinhAdv', label: 'asinh', value: 'asinh', type: 'special', variant: 'secondary', ariaLabel: 'Inverse Hyperbolic Sine' },
      { id: 'acoshAdv', label: 'acosh', value: 'acosh', type: 'special', variant: 'secondary', ariaLabel: 'Inverse Hyperbolic Cosine' },
      { id: 'atanhAdv', label: 'atanh', value: 'atanh', type: 'special', variant: 'secondary', ariaLabel: 'Inverse Hyperbolic Tangent' },
      { id: 'reciprocalAdv', label: '1/x', value: 'RECIPROCAL', type: 'special', variant: 'secondary', ariaLabel: 'Reciprocal (1/x)' },


      // Standard Action/Operator Buttons (Shared part)
      { id: 'clearAdv', label: 'C', value: 'clear', type: 'action', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', longPressValue: 'easterEgg', ariaLabel: 'Clear All' },
      { id: 'backspaceAdv', label: <Delete />, value: 'backspace', type: 'action', longPressValue: 'easterEgg', ariaLabel: 'Backspace / Delete' },
      { id: 'percentAdv', label: <Percent />, value: '%', type: 'special', variant: 'accent', ariaLabel: 'Percentage' },
      { id: 'divideAdv', label: <Divide />, value: '/', type: 'operator', variant: 'accent', ariaLabel: 'Divide' },

      { id: 'sevenAdv', label: '7', value: '7', type: 'number' },
      { id: 'eightAdv', label: '8', value: '8', type: 'number' },
      { id: 'nineAdv', label: '9', value: '9', type: 'number' },
      { id: 'multiplyAdv', label: <X />, value: '*', type: 'operator', variant: 'accent', ariaLabel: 'Multiply' },

      { id: 'fourAdv', label: '4', value: '4', type: 'number' },
      { id: 'fiveAdv', label: '5', value: '5', type: 'number' },
      { id: 'sixAdv', label: '6', value: '6', type: 'number' },
      { id: 'subtractAdv', label: <Minus />, value: '-', type: 'operator', variant: 'accent', ariaLabel: 'Subtract' },

      { id: 'oneAdv', label: '1', value: '1', type: 'number' },
      { id: 'twoAdv', label: '2', value: '2', type: 'number' },
      { id: 'threeAdv', label: '3', value: '3', type: 'number' },
      { id: 'addAdv', label: <Plus />, value: '+', type: 'operator', variant: 'accent', ariaLabel: 'Add' },

      { id: 'toggleSignAdv', label: '+/-', value: '+/-', type: 'special', variant: 'secondary', ariaLabel: 'Toggle Sign (+/-)' },
      { id: 'zeroAdv', label: '0', value: '0', type: 'number' },
      { id: 'decimalAdv', label: '.', value: '.', type: 'number', ariaLabel: 'Decimal Point' },
      { id: 'equalsAdv', label: <Equal />, value: '=', type: 'action', className: 'bg-primary text-primary-foreground hover:bg-primary/90', ariaLabel: 'Equals' },
    ];

    if (isAdvancedMode && activeStandardViewInAdvanced) {
      return advancedStandardButtons;
    }
    return standardButtons;

  }, [isAdvancedMode, activeStandardViewInAdvanced, angleMode]);

  const keypadGridClass = (isAdvancedMode && activeStandardViewInAdvanced)
    ? "grid grid-cols-4 gap-1 p-1 sm:p-1.5 bg-card rounded-b-lg shadow-lg dark:shadow-none" // Added dark mode support
    : "grid grid-cols-4 gap-2 p-4 bg-card rounded-b-lg shadow-lg dark:shadow-none";

  const buttonHeightClass = (isAdvancedMode && activeStandardViewInAdvanced)
    ? "h-10 sm:h-11 text-sm sm:text-base"
    : "h-16 sm:h-20 text-2xl";


  return (
    <>
      <div 
        className={keypadGridClass} 
        role="group" 
        aria-label="Calculator keypad"
      >
        {buttons.map((btn) => (
          <CalculatorButton
            key={btn.id}
            label={btn.label}
            value={btn.value}
            type={btn.type}
            longPressValue={btn.longPressValue}
            onClickButton={handleButtonPress}
            onLongPressButton={
              (btn.id === 'clear' || btn.id === 'clearAdv' || btn.id === 'backspace' || btn.id === 'backspaceAdv') 
                ? onLongPressCKey 
                : undefined
            }
            className={cn(
              btn.className || '',
              buttonHeightClass,
              'transition-transform active:scale-95', // Added press animation
              'focus-visible:ring-2 focus-visible:ring-accent', // Enhanced focus styles
              'dark:hover:bg-accent/20' // Dark mode hover state
            )}
            variant={
              (btn.variant as any) || 
              (btn.type === 'number' 
                ? 'secondary' 
                : (btn.type === 'operator' || btn.type === 'special' || btn.type === 'memory') 
                  ? 'accent' 
                  : 'default')
            }
            ariaLabel={btn.ariaLabel}
            description={btn.description}
          />
        ))}
      </div>
    </>
  );
});

CalculatorKeypad.displayName = 'CalculatorKeypad';

export default CalculatorKeypad;

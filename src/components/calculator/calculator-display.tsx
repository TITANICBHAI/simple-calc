import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Sigma } from 'lucide-react';

interface CalculatorDisplayProps {
  expression: string;
  currentValue: string;
  memoryIndicator?: boolean;
  angleMode?: 'deg' | 'rad';
}

const CalculatorDisplay: FC<CalculatorDisplayProps> = ({ 
  expression, 
  currentValue, 
  memoryIndicator,
  angleMode
}) => {
  // Format large numbers with commas
  const formatNumber = (value: string): string => {
    if (!value) return "0";
    
    // Handle scientific notation
    if (value.includes('e')) {
      const [base, exp] = value.split('e');
      return `${formatNumber(base)}e${exp}`;
    }

    // Split number into integer and decimal parts
    const [intPart, decPart] = value.split('.');
    
    // Add commas to integer part
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combine with decimal part if it exists
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  };

  return (
    <div className="bg-muted/50 p-6 rounded-t-lg text-right break-all min-h-[128px] relative">
      <div className="absolute top-2 left-2 flex items-center gap-2">
        {memoryIndicator && (
          <Badge 
            variant="secondary"
            className="memory-indicator animate-fade-in bg-primary/20 text-primary"
            aria-label="Memory Active"
            title="Memory Active"
          >
            <Sigma className="h-4 w-4 mr-1" />
            M
          </Badge>
        )}
        {angleMode && (
          <Badge 
            variant="outline" 
            className="text-xs"
            aria-label={`Angle Mode: ${angleMode.toUpperCase()}`}
          >
            {angleMode.toUpperCase()}
          </Badge>
        )}
      </div>
      
      <div
        className="text-muted-foreground text-xl h-8 mb-1 truncate"
        aria-label="Calculation expression"
      >
        {expression || " "}
      </div>
      
      <div
        key={currentValue}
        className={cn(
          "text-foreground text-5xl font-mono font-bold h-14",
          "animate-value-change overflow-x-auto",
          "scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent"
        )}
        aria-label="Current value or result"
        role="status"
      >
        {formatNumber(currentValue) || "0"}
      </div>
    </div>
  );
};

export default CalculatorDisplay;

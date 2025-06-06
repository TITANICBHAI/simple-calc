"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PercentSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PercentageCalculator: React.FC = () => {
  const [percentage, setPercentage] = useState<string>(''); // The 'X' in "X% of Y"
  const [valueOf, setValueOf] = useState<string>('');     // The 'Y' in "X% of Y"
  const [result, setResult] = useState<number | null>(null);

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  useEffect(() => {
    const perc = parseFloat(percentage);
    const val = parseFloat(valueOf);

    if (isNaN(perc) || isNaN(val)) {
      setResult(null);
      return;
    }
    
    if (val === 0 && perc !==0) { // X% of 0 is 0
        setResult(0);
        return;
    }

    const calculatedResult = (perc / 100) * val;
    setResult(calculatedResult);

  }, [percentage, valueOf]);

  const handleReset = () => {
    setPercentage('');
    setValueOf('');
    setResult(null);
    toast({ title: "Percentage Calculator Reset", description: "Fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <PercentSquare className="mr-2 h-6 w-6 text-accent" />
          Percentage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
            <div className="flex-1">
                <Label htmlFor="percentage" className="text-sm font-medium">What is</Label>
                <Input
                id="percentage"
                type="text"
                inputMode="decimal"
                value={percentage}
                onChange={handleInputChange(setPercentage)}
                placeholder="e.g., 10"
                aria-label="Percentage value"
                className="mt-1"
                />
            </div>
            <span className="pt-6 text-lg">%</span>
             <div className="flex-1">
                <Label htmlFor="valueOf" className="text-sm font-medium">of</Label>
                <Input
                id="valueOf"
                type="text"
                inputMode="decimal"
                value={valueOf}
                onChange={handleInputChange(setValueOf)}
                placeholder="e.g., 50"
                aria-label="Base value"
                className="mt-1"
                />
            </div>
        </div>
        
        {result !== null && (
          <div className="space-y-2 pt-3 border-t border-border mt-4">
            <p className="text-2xl font-bold text-accent text-center">
              Result: {result.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 5})}
            </p>
             <p className="text-xs text-muted-foreground text-center">
              {percentage}% of {valueOf} is {result.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 5})}.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col items-center gap-4">
          <Button onClick={handleReset} variant="outline" className="w-full max-w-xs">
            Reset
          </Button>
          <ins className="adsbygoogle"
               style={{ display: 'block', textAlign: 'center' }}
               data-ad-client="ca-pub-1074051846339488"
               data-ad-slot="8922282796"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PercentageCalculator;

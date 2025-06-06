"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Scale, PersonStanding } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BmiCalculator: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm' | 'ft'>('cm');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setBmi(null);
      setBmiCategory('');
      return;
    }

    let weightInKg = w;
    if (weightUnit === 'lbs') {
      weightInKg = w * 0.453592;
    }

    let heightInM = h;
    if (heightUnit === 'cm') {
      heightInM = h / 100;
    } else if (heightUnit === 'ft') {
      heightInM = h * 0.3048;
    }
    // if heightUnit is 'm', it's already in meters

    if (heightInM <= 0) {
        setBmi(null);
        setBmiCategory('');
        return;
    }

    const calculatedBmi = weightInKg / (heightInM * heightInM);
    setBmi(calculatedBmi);

    if (calculatedBmi < 18.5) setBmiCategory('Underweight');
    else if (calculatedBmi < 25) setBmiCategory('Normal weight');
    else if (calculatedBmi < 30) setBmiCategory('Overweight');
    else setBmiCategory('Obese');

  }, [weight, height, weightUnit, heightUnit]);

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setWeightUnit('kg');
    setHeightUnit('cm');
    setBmi(null);
    setBmiCategory('');
    toast({ title: "BMI Calculator Reset", description: "Fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Activity className="mr-2 h-6 w-6 text-accent" />
          BMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="weight" className="text-sm font-medium">Weight</Label>
            <Input
              id="weight"
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={handleInputChange(setWeight)}
              placeholder="e.g., 70"
              aria-label="Weight"
            />
          </div>
          <div className="w-1/3">
            <Label htmlFor="weightUnit" className="text-sm font-medium invisible">Unit</Label>
            <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value as 'kg' | 'lbs')}>
              <SelectTrigger id="weightUnit" aria-label="Weight unit">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="height" className="text-sm font-medium">Height</Label>
            <Input
              id="height"
              type="text"
              inputMode="decimal"
              value={height}
              onChange={handleInputChange(setHeight)}
              placeholder="e.g., 175"
              aria-label="Height"
            />
          </div>
          <div className="w-1/3">
             <Label htmlFor="heightUnit" className="text-sm font-medium invisible">Unit</Label>
            <Select value={heightUnit} onValueChange={(value) => setHeightUnit(value as 'cm' | 'm' | 'ft')}>
              <SelectTrigger id="heightUnit" aria-label="Height unit">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="ft">ft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {bmi !== null && (
          <div className="space-y-2 pt-3 border-t border-border mt-4">
            <p className="text-2xl font-bold text-accent text-center">
              BMI: {bmi.toFixed(2)}
            </p>
            <p className="text-md text-muted-foreground text-center">
              Category: <span className="font-semibold">{bmiCategory}</span>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Note: BMI is a general guideline. Consult a healthcare professional for advice.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          Reset
        </Button>
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

export default BmiCalculator;

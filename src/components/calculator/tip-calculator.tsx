"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Percent, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TipCalculator: React.FC = () => {
  const [billAmount, setBillAmount] = useState<string>('');
  const [tipPercentage, setTipPercentage] = useState<string>('15');
  const [numberOfPeople, setNumberOfPeople] = useState<string>('1');

  const [tipAmount, setTipAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPerPerson, setAmountPerPerson] = useState<number>(0);

  const { toast } = useToast();

  const presetTipPercentages = [10, 15, 18, 20, 25];

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point for amount/percentage, or just numbers for people
    if (/^\d*\.?\d*$/.test(value) || (setter === setNumberOfPeople && /^\d*$/.test(value))) {
      setter(value);
    }
  };
  
  const handlePositiveIntegerChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Only allow digits
      const numValue = parseInt(value, 10);
      if (value === '' || (numValue > 0 && numValue <= 1000)) { // Allow empty or positive up to 1000
        setter(value);
      } else if (numValue === 0 && value.length === 1) {
         setter('1'); // default to 1 if 0 entered
      }
    }
  };


  useEffect(() => {
    const bill = parseFloat(billAmount);
    const tip = parseFloat(tipPercentage);
    const people = parseInt(numberOfPeople, 10);

    if (isNaN(bill) || bill <= 0) {
      setTipAmount(0);
      setTotalAmount(0);
      setAmountPerPerson(0);
      return;
    }

    if (isNaN(tip) || tip < 0) {
        setTipAmount(0);
        setTotalAmount(bill); // Total is just bill if tip is invalid
        if (!isNaN(people) && people > 0) {
            setAmountPerPerson(bill / people);
        } else {
            setAmountPerPerson(bill); // If people invalid, per person is total
        }
        return;
    }
    
    const currentTipAmount = (bill * tip) / 100;
    const currentTotalAmount = bill + currentTipAmount;
    
    setTipAmount(currentTipAmount);
    setTotalAmount(currentTotalAmount);

    if (!isNaN(people) && people > 0) {
      setAmountPerPerson(currentTotalAmount / people);
    } else {
      setAmountPerPerson(currentTotalAmount); // if people is 0 or invalid, show total per person
    }

  }, [billAmount, tipPercentage, numberOfPeople]);

  const handleReset = () => {
    setBillAmount('');
    setTipPercentage('15');
    setNumberOfPeople('1');
    toast({ title: "Tip Calculator Reset", description: "All fields have been cleared."});
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <DollarSign className="mr-2 h-6 w-6 text-accent" />
          Tip Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="billAmount" className="text-sm font-medium">Bill Amount</Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="billAmount"
              type="text"
              inputMode="decimal"
              value={billAmount}
              onChange={handleInputChange(setBillAmount)}
              placeholder="0.00"
              className="pl-10"
              aria-label="Bill Amount"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tipPercentage" className="text-sm font-medium">Tip Percentage</Label>
           <div className="relative mt-1">
            <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="tipPercentage"
              type="text"
              inputMode="decimal"
              value={tipPercentage}
              onChange={handleInputChange(setTipPercentage)}
              placeholder="15"
              className="pl-10"
              aria-label="Tip Percentage"
            />
          </div>
          <div className="mt-2 flex space-x-2">
            {presetTipPercentages.map(p => (
              <Button
                key={p}
                variant={tipPercentage === String(p) ? "default" : "outline"}
                size="sm"
                onClick={() => setTipPercentage(String(p))}
                className="flex-1"
              >
                {p}%
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="numberOfPeople" className="text-sm font-medium">Number of People</Label>
          <div className="relative mt-1">
            <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="numberOfPeople"
              type="text"
              inputMode="numeric"
              value={numberOfPeople}
              onChange={handlePositiveIntegerChange(setNumberOfPeople)}
              placeholder="1"
              className="pl-10"
              aria-label="Number of People"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tip Amount:</span>
            <span className="font-semibold text-foreground">${tipAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-bold text-accent">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Per Person:</span>
            <span className="font-semibold text-foreground">${amountPerPerson.toFixed(2)}</span>
          </div>
        </div>
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

export default TipCalculator;

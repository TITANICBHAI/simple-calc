"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Tag, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<string>('');

  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  
  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (/^\d*\.?\d*$/.test(value)) { // Allow numbers and one decimal
      setter(value);
    }
  };

  useEffect(() => {
    const price = parseFloat(originalPrice);
    let discount = parseFloat(discountPercentage);

    if (isNaN(price) || price < 0) {
      setSavedAmount(0);
      setFinalPrice(0); 
      return;
    }

    // Validate discount: if invalid, treat as 0% discount
    if (isNaN(discount) || discount < 0 || discount > 100) {
      discount = 0; // Effectively no discount
      if (discountPercentage !== '' && !isNaN(parseFloat(discountPercentage))) { // Only show error if they typed something invalid
          // Potentially show a toast or inline error for invalid discount percentage here if desired
      }
    }

    const currentSavedAmount = (price * discount) / 100;
    const currentFinalPrice = price - currentSavedAmount;

    setSavedAmount(currentSavedAmount);
    setFinalPrice(currentFinalPrice);

  }, [originalPrice, discountPercentage]);

  const handleReset = () => {
    setOriginalPrice('');
    setDiscountPercentage('');
    // Results will auto-clear due to useEffect
    toast({ title: "Discount Calculator Reset", description: "Fields cleared."});
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Tag className="mr-2 h-6 w-6 text-accent" />
          Discount Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price</Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="originalPrice"
              type="text"
              inputMode="decimal"
              value={originalPrice}
              onChange={handleInputChange(setOriginalPrice)}
              placeholder="0.00"
              className="pl-10"
              aria-label="Original Price"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="discountPercentage" className="text-sm font-medium">Discount Percentage</Label>
          <div className="relative mt-1">
            <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="discountPercentage"
              type="text"
              inputMode="decimal"
              value={discountPercentage}
              onChange={handleInputChange(setDiscountPercentage)}
              placeholder="0-100"
              className="pl-10"
              aria-label="Discount Percentage"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You Save:</span>
            <span className="font-semibold text-green-500">${savedAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Final Price:</span>
            <span className="font-bold text-accent">${finalPrice.toFixed(2)}</span>
          </div>
        </div>
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

// Simple DollarSign component if not available elsewhere or to avoid conflicts
const DollarSign: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1074051846339488" crossOrigin="anonymous"></script>

export default DiscountCalculator;

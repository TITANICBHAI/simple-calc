"use client";

import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Unit, UnitCategory } from '@/types/units';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SingleUnitConverterProps {
  category: UnitCategory;
}

interface CustomUnit {
  name: string;
  symbol: string;
  toBaseFactor: number;
  fromBaseFactor: number;
  offset?: number;
}

const SingleUnitConverter: React.FC<SingleUnitConverterProps> = ({ category }) => {
  const [inputValue1, setInputValue1] = useState<string>('1');
  const [selectedUnitSymbol1, setSelectedUnitSymbol1] = useState<string>(category.units[0]?.symbol || '');
  
  const [inputValue2, setInputValue2] = useState<string>('');
  const [selectedUnitSymbol2, setSelectedUnitSymbol2] = useState<string>(category.units[1]?.symbol || category.units[0]?.symbol || '');

  const [isCalculating, setIsCalculating] = useState<'input1' | 'input2' | null>(null);
  const { toast } = useToast();

  const [customUnits, setCustomUnits] = useState<CustomUnit[]>([]);
  const [showCustomUnitForm, setShowCustomUnitForm] = useState(false);
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitSymbol, setCustomUnitSymbol] = useState('');
  const [customUnitToBase, setCustomUnitToBase] = useState('');
  const [customUnitOffset, setCustomUnitOffset] = useState('');
  const customUnitNameRef = useRef<HTMLInputElement>(null);

  // Merge built-in and custom units for selection and conversion
  const allUnits = [...category.units, ...customUnits];

  const convertValue = (
    amountStr: string,
    fromUnitSymbol: string,
    toUnitSymbol: string,
    allUnits: Unit[]
  ): string => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return '';

    const fromUnit = allUnits.find(u => u.symbol === fromUnitSymbol);
    const toUnit = allUnits.find(u => u.symbol === toUnitSymbol);

    if (!fromUnit || !toUnit) return '';

    // Handle temperature separately due to offsets and non-linear scales
    if (category.name === "Temperature") {
        if (fromUnit.symbol === toUnit.symbol) return amountStr;
        let celsiusVal: number;
        // Convert fromUnit to Celsius
        if (fromUnit.symbol === '°C') celsiusVal = amount;
        else if (fromUnit.symbol === '°F') celsiusVal = (amount - 32) * 5 / 9;
        else if (fromUnit.symbol === 'K') celsiusVal = amount - 273.15;
        else return ''; // Unknown fromUnit for temperature

        // Convert Celsius to toUnit
        let finalVal: number;
        if (toUnit.symbol === '°C') finalVal = celsiusVal;
        else if (toUnit.symbol === '°F') finalVal = (celsiusVal * 9 / 5) + 32;
        else if (toUnit.symbol === 'K') finalVal = celsiusVal + 273.15;
        else return ''; // Unknown toUnit for temperature
        
        return Number(finalVal.toFixed(5)).toString(); // Use toFixed for reasonable precision
    }

    // Standard conversion for other units
    const valueInBaseUnit = (amount + (fromUnit.offset || 0)) * fromUnit.toBaseFactor;
    const finalValue = (valueInBaseUnit / toUnit.toBaseFactor) - (toUnit.offset || 0) ;
    
    // Return value with a reasonable number of decimal places, avoiding scientific notation for typical cases
    return Number(finalValue.toFixed(7)).toString();
  };

  useEffect(() => {
    if (isCalculating === 'input2' || !inputValue1) {
      if (!inputValue1 && isCalculating !== 'input2') setInputValue2(''); // Clear output if input1 is empty
      return;
    }
    const result = convertValue(inputValue1, selectedUnitSymbol1, selectedUnitSymbol2, allUnits);
    setInputValue2(result);
  }, [inputValue1, selectedUnitSymbol1, selectedUnitSymbol2, allUnits, isCalculating]);

  useEffect(() => {
    if (isCalculating === 'input1' || !inputValue2) {
      if (!inputValue2 && isCalculating !== 'input1') setInputValue1(''); // Clear output if input2 is empty
      return;
    }
    const result = convertValue(inputValue2, selectedUnitSymbol2, selectedUnitSymbol1, allUnits);
    setInputValue1(result);
  }, [inputValue2, selectedUnitSymbol2, selectedUnitSymbol1, allUnits, isCalculating]);
  
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    inputNumber: 1 | 2
  ) => {
    const value = e.target.value;
    // Allow numbers, a single decimal point, and a leading minus for temperatures
    const isValidInput = /^-?\d*\.?\d*$/.test(value);

    if (isValidInput || value === '' || value ==='-') {
      setIsCalculating(inputNumber === 1 ? 'input1' : 'input2');
      if (inputNumber === 1) {
        setInputValue1(value);
      } else {
        setInputValue2(value);
      }
    }
  };

  const handleUnitChange = (
    unitSymbol: string,
    inputNumber: 1 | 2
  ) => {
    setIsCalculating(inputNumber === 1 ? 'input1' : 'input2'); // Recalculate based on input1 if unit1 changes
    if (inputNumber === 1) {
      setSelectedUnitSymbol1(unitSymbol);
    } else {
      setSelectedUnitSymbol2(unitSymbol);
    }
  };
  
  // Reset calculation lock after a short delay to allow state updates
  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => setIsCalculating(null), 50);
      return () => clearTimeout(timer);
    }
  }, [isCalculating]);


  const handleReset = () => {
    setIsCalculating('input1'); // Prioritize recalculating based on input1 after reset
    setInputValue1('1');
    setSelectedUnitSymbol1(category.units[0]?.symbol || '');
    // setSelectedUnitSymbol2(category.units[1]?.symbol || category.units[0]?.symbol || '');
    // inputValue2 will update via useEffect
    toast({ title: `${category.name} Converter Reset`, description: "Fields reset to default."});
    // Ensure isCalculating is reset after a brief moment to allow the first useEffect to run
    setTimeout(() => setIsCalculating(null), 100);
  };

  // Add custom unit to the list
  const handleAddCustomUnit = () => {
    if (!customUnitName.trim() || !customUnitSymbol.trim() || isNaN(Number(customUnitToBase)) || Number(customUnitToBase) === 0) {
      toast({ title: 'Invalid Custom Unit', description: 'Please provide a valid name, symbol, and nonzero conversion factor.', variant: 'destructive' });
      return;
    }
    const toBase = Number(customUnitToBase);
    const fromBase = 1 / toBase;
    const offset = customUnitOffset.trim() ? Number(customUnitOffset) : undefined;
    const newUnit: CustomUnit = {
      name: customUnitName.trim(),
      symbol: customUnitSymbol.trim(),
      toBaseFactor: toBase,
      fromBaseFactor: fromBase,
      ...(offset !== undefined ? { offset } : {})
    };
    setCustomUnits(prev => [...prev, newUnit]);
    setShowCustomUnitForm(false);
    setCustomUnitName('');
    setCustomUnitSymbol('');
    setCustomUnitToBase('');
    setCustomUnitOffset('');
    setTimeout(() => customUnitNameRef.current?.focus(), 100);
    toast({ title: 'Custom Unit Added', description: `${newUnit.name} (${newUnit.symbol}) added.` });
  };

  // Remove a custom unit
  const handleRemoveCustomUnit = (symbol: string) => {
    setCustomUnits(prev => prev.filter(u => u.symbol !== symbol));
    toast({ title: 'Custom Unit Removed', description: `Unit ${symbol} removed.` });
  };

  if (!category || category.units.length < 1) {
    return <p className="text-muted-foreground">Unit category not configured correctly.</p>;
  }

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor={`input1-${category.name}`} className="text-sm font-medium">{category.units.find(u => u.symbol === selectedUnitSymbol1)?.name || 'Value 1'}</Label>
          <Input
            id={`input1-${category.name}`}
            type="text" // Using text to allow for '-', then validate
            inputMode="decimal"
            value={inputValue1}
            onChange={(e) => handleInputChange(e, 1)}
            placeholder="Enter value"
            className="mt-1"
          />
        </div>
        <div className="w-full">
           <Label htmlFor={`unit1-select-${category.name}`} className="text-sm font-medium sr-only">Unit 1</Label>
          <Select value={selectedUnitSymbol1} onValueChange={(value) => handleUnitChange(value, 1)}>
            <SelectTrigger id={`unit1-select-${category.name}`} aria-label={`Select unit for input 1 - ${category.name}`}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {category.units.map(unit => (
                <SelectItem key={`${category.name}-1-${unit.symbol}`} value={unit.symbol}>
                  {unit.name} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center my-2">
        <span className="text-2xl font-semibold text-muted-foreground">=</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
           <Label htmlFor={`input2-${category.name}`} className="text-sm font-medium">{category.units.find(u => u.symbol === selectedUnitSymbol2)?.name || 'Value 2'}</Label>
          <Input
            id={`input2-${category.name}`}
            type="text"
            inputMode="decimal"
            value={inputValue2}
            onChange={(e) => handleInputChange(e, 2)}
            placeholder="Converted value"
            className="mt-1"
          />
        </div>
         <div className="w-full">
          <Label htmlFor={`unit2-select-${category.name}`} className="text-sm font-medium sr-only">Unit 2</Label>
          <Select value={selectedUnitSymbol2} onValueChange={(value) => handleUnitChange(value, 2)}>
            <SelectTrigger id={`unit2-select-${category.name}`} aria-label={`Select unit for input 2 - ${category.name}`}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {category.units.map(unit => (
                <SelectItem key={`${category.name}-2-${unit.symbol}`} value={unit.symbol}>
                  {unit.name} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="pt-4">
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset {category.name} Converter
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <Button size="sm" variant="outline" onClick={() => setShowCustomUnitForm(v => !v)}>
          {showCustomUnitForm ? 'Cancel' : 'Add Custom Unit'}
        </Button>
        {customUnits.length > 0 && (
          <span className="text-xs text-muted-foreground">Custom units: {customUnits.map(u => (
            <span key={u.symbol} className="inline-flex items-center gap-1 ml-2">
              <span>{u.name} ({u.symbol})</span>
              <Button size="xs" variant="ghost" onClick={() => handleRemoveCustomUnit(u.symbol)} aria-label={`Remove ${u.name}`}>✕</Button>
            </span>
          ))}</span>
        )}
      </div>
      {showCustomUnitForm && (
        <div className="mb-4 p-2 border rounded bg-muted/30">
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-unit-name">Unit Name</Label>
            <Input ref={customUnitNameRef} id="custom-unit-name" value={customUnitName} onChange={e => setCustomUnitName(e.target.value)} placeholder="e.g. Smoot" />
            <Label htmlFor="custom-unit-symbol">Unit Symbol</Label>
            <Input id="custom-unit-symbol" value={customUnitSymbol} onChange={e => setCustomUnitSymbol(e.target.value)} placeholder="e.g. sm" />
            <Label htmlFor="custom-unit-to-base">Conversion to Base Unit ({category.baseUnitSymbol})</Label>
            <Input id="custom-unit-to-base" value={customUnitToBase} onChange={e => setCustomUnitToBase(e.target.value)} placeholder="e.g. 1.7018" inputMode="decimal" />
            <Label htmlFor="custom-unit-offset">Offset (optional)</Label>
            <Input id="custom-unit-offset" value={customUnitOffset} onChange={e => setCustomUnitOffset(e.target.value)} placeholder="e.g. 0" inputMode="decimal" />
            <Button size="sm" className="mt-2" onClick={handleAddCustomUnit}>Add Unit</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleUnitConverter;

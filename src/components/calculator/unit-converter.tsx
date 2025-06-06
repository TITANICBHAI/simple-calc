'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown } from 'lucide-react';

interface Unit {
  name: string;
  symbol: string;
  factor: number;
}

interface UnitCategory {
  name: string;
  units: Unit[];
}

const unitCategories: UnitCategory[] = [
  {
    name: 'Length',
    units: [
      { name: 'Meter', symbol: 'm', factor: 1 },
      { name: 'Kilometer', symbol: 'km', factor: 1000 },
      { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { name: 'Inch', symbol: 'in', factor: 0.0254 },
      { name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { name: 'Mile', symbol: 'mi', factor: 1609.34 },
    ]
  },
  {
    name: 'Weight',
    units: [
      { name: 'Kilogram', symbol: 'kg', factor: 1 },
      { name: 'Gram', symbol: 'g', factor: 0.001 },
      { name: 'Pound', symbol: 'lb', factor: 0.453592 },
      { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
      { name: 'Ton', symbol: 't', factor: 1000 },
    ]
  },
  {
    name: 'Temperature',
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1 },
      { name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { name: 'Kelvin', symbol: 'K', factor: 1 },
    ]
  },
  {
    name: 'Volume',
    units: [
      { name: 'Liter', symbol: 'L', factor: 1 },
      { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
      { name: 'Quart', symbol: 'qt', factor: 0.946353 },
      { name: 'Pint', symbol: 'pt', factor: 0.473176 },
      { name: 'Cup', symbol: 'cup', factor: 0.236588 },
    ]
  }
];

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState('Length');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');

  const currentCategory = unitCategories.find(cat => cat.name === activeCategory);

  useEffect(() => {
    if (currentCategory && currentCategory.units.length > 0) {
      setFromUnit(currentCategory.units[0].symbol);
      setToUnit(currentCategory.units[1]?.symbol || currentCategory.units[0].symbol);
    }
  }, [activeCategory, currentCategory]);

  const convertValue = (value: string, from: string, to: string, category: string) => {
    if (!value || isNaN(Number(value))) return '';
    
    const num = parseFloat(value);
    const categoryData = unitCategories.find(cat => cat.name === category);
    if (!categoryData) return '';

    const fromUnitData = categoryData.units.find(unit => unit.symbol === from);
    const toUnitData = categoryData.units.find(unit => unit.symbol === to);
    
    if (!fromUnitData || !toUnitData) return '';

    // Special handling for temperature
    if (category === 'Temperature') {
      let celsius = num;
      
      // Convert from unit to Celsius
      if (from === '°F') {
        celsius = (num - 32) * 5/9;
      } else if (from === 'K') {
        celsius = num - 273.15;
      }
      
      // Convert from Celsius to target unit
      if (to === '°F') {
        return ((celsius * 9/5) + 32).toFixed(4);
      } else if (to === 'K') {
        return (celsius + 273.15).toFixed(4);
      } else {
        return celsius.toFixed(4);
      }
    }

    // Regular conversion through base unit
    const baseValue = num * fromUnitData.factor;
    const convertedValue = baseValue / toUnitData.factor;
    
    return convertedValue.toFixed(6).replace(/\.?0+$/, '');
  };

  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      const result = convertValue(fromValue, fromUnit, toUnit, activeCategory);
      setToValue(result);
    }
  }, [fromValue, fromUnit, toUnit, activeCategory]);

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 w-full">
          {unitCategories.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {unitCategories.map((category) => (
          <TabsContent key={category.name} value={category.name} className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Enter value"
                        value={fromValue}
                        onChange={(e) => setFromValue(e.target.value)}
                      />
                      <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {category.units.map((unit) => (
                            <SelectItem key={unit.symbol} value={unit.symbol}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwapUnits}
                      className="rounded-full"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Result"
                        value={toValue}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {category.units.map((unit) => (
                            <SelectItem key={unit.symbol} value={unit.symbol}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {fromValue && toValue && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg">
                      <span className="font-semibold">{fromValue} {fromUnit}</span>
                      {' = '}
                      <span className="font-semibold text-blue-600">{toValue} {toUnit}</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
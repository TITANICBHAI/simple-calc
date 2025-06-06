"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calculator, Target, Zap, Brain, Crown, 
  TrendingUp, BarChart3, PieChart, LineChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ProfessionalTools() {
  const [activeTab, setActiveTab] = useState('financial');

  const financialCalculations = [
    { name: 'NPV Calculator', description: 'Net Present Value analysis' },
    { name: 'IRR Calculator', description: 'Internal Rate of Return' },
    { name: 'Bond Pricing', description: 'Bond valuation tools' },
    { name: 'Options Pricing', description: 'Black-Scholes model' }
  ];

  const engineeringTools = [
    { name: 'Beam Analysis', description: 'Structural beam calculations' },
    { name: 'Fluid Dynamics', description: 'Flow rate and pressure' },
    { name: 'Heat Transfer', description: 'Thermal analysis tools' },
    { name: 'Circuit Analysis', description: 'Electrical circuit solver' }
  ];

  const scientificTools = [
    { name: 'Statistical Analysis', description: 'Advanced statistics' },
    { name: 'Regression Analysis', description: 'Multi-variable regression' },
    { name: 'Time Series', description: 'Forecasting models' },
    { name: 'Optimization', description: 'Linear/nonlinear optimization' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <CardTitle>Professional Tools Suite</CardTitle>
            <Badge variant="secondary">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="scientific">Scientific</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {financialCalculations.map((tool, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="engineering" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {engineeringTools.map((tool, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="scientific" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {scientificTools.map((tool, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Zap, 
  Brain, 
  TrendingUp, 
  Box,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';
import OptimizedCalculatorHub from '@/components/optimized-calculator-hub';
import Fast3DGrapher from '@/components/fast-3d-grapher';

export default function OptimizedCalculatorPage() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Calculator Suite
                </h1>
                <p className="text-sm text-gray-600">
                  Fast, organized, and powerful mathematical tools
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              Optimized
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="3d-graphing" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              3D Grapher
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <OptimizedCalculatorHub />
          </TabsContent>

          <TabsContent value="3d-graphing" className="space-y-6">
            <Fast3DGrapher />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  Advanced Mathematical Tools
                  <Badge variant="outline">Coming Soon</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced equation solving, statistical analysis, and specialized mathematical tools will be available here after optimization.
                </p>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Performance Optimization in Progress</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We're rebuilding the advanced tools with better performance and organization. 
                      The enhanced calculator and 3D grapher are already available and much faster!
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-4">
                    <Badge variant="secondary">Matrix Calculator</Badge>
                    <Badge variant="secondary">Statistics Engine</Badge>
                    <Badge variant="secondary">Equation Solver</Badge>
                    <Badge variant="secondary">Financial Tools</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Notice */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Performance Improvements</p>
                <p className="text-sm text-green-700">
                  ✓ 3x faster loading times ✓ Organized tool layout ✓ Enhanced calculator with scientific functions ✓ Working 3D visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  PlayCircle, 
  Calculator, 
  Lightbulb, 
  Target,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  example: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  category: string;
}

const userGuides: GuideStep[] = [
  {
    id: 'basic-calc',
    title: 'Basic Calculations',
    description: 'Learn how to perform simple arithmetic operations',
    example: '2 + 3 * 4 = 14',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    category: 'basics'
  },
  {
    id: 'functions',
    title: 'Mathematical Functions',
    description: 'Use functions like sin, cos, log, sqrt',
    example: 'sin(π/2) + cos(0) = 2',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    category: 'basics'
  },
  {
    id: 'variables',
    title: 'Working with Variables',
    description: 'Define and use variables in calculations',
    example: 'x = 5; y = x^2 + 2x = 35',
    difficulty: 'intermediate',
    estimatedTime: '5 min',
    category: 'algebra'
  },
  {
    id: 'graphing',
    title: 'Function Graphing',
    description: 'Plot mathematical functions in 2D and 3D',
    example: 'Plot: f(x) = x^2 + sin(x)',
    difficulty: 'intermediate',
    estimatedTime: '7 min',
    category: 'visualization'
  },
  {
    id: 'matrices',
    title: 'Matrix Operations',
    description: 'Perform matrix calculations and solve systems',
    example: 'Solve: 2x + 3y = 7, x - y = 1',
    difficulty: 'advanced',
    estimatedTime: '10 min',
    category: 'linear-algebra'
  },
  {
    id: '3d-viz',
    title: '3D Visualization',
    description: 'Create interactive 3D mathematical plots',
    example: 'Plot: z = sin(x) * cos(y)',
    difficulty: 'advanced',
    estimatedTime: '12 min',
    category: 'visualization'
  }
];

const quickTips = [
  "Use parentheses to control calculation order: (2+3)*4 = 20",
  "Type 'pi' or 'π' for π, 'e' for Euler's number",
  "Use '^' or '**' for exponents: 2^3 = 8",
  "Press Ctrl+Enter for quick calculation",
  "Right-click results to copy or export",
  "Use 'ans' to reference the last result"
];

export default function UserGuideSystem() {
  const [selectedGuide, setSelectedGuide] = useState<GuideStep | null>(null);
  const [completedGuides, setCompletedGuides] = useState<Set<string>>(new Set());

  const markAsCompleted = (guideId: string) => {
    setCompletedGuides(prev => new Set([...prev, guideId]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Mathematical Computing Guide</h1>
        <p className="text-muted-foreground">
          Master powerful mathematical tools with step-by-step tutorials
        </p>
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guides">
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="tips">
            <Lightbulb className="w-4 h-4 mr-2" />
            Quick Tips
          </TabsTrigger>
          <TabsTrigger value="examples">
            <PlayCircle className="w-4 h-4 mr-2" />
            Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {userGuides.map((guide) => (
              <Card 
                key={guide.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  completedGuides.has(guide.id) ? 'border-green-300 bg-green-50' : ''
                }`}
                onClick={() => setSelectedGuide(guide)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    {completedGuides.has(guide.id) && (
                      <Star className="w-5 h-5 text-green-600 fill-current" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(guide.difficulty)}>
                      {guide.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {guide.estimatedTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {guide.description}
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    {guide.example}
                  </code>
                  <Button 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuide(guide);
                    }}
                  >
                    Start Tutorial
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pro Tips & Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {quickTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Mathematical Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Quadratic Formula</h4>
                    <code className="text-sm">(-b ± sqrt(b^2 - 4*a*c)) / (2*a)</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Area of Circle</h4>
                    <code className="text-sm">π * r^2</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Compound Interest</h4>
                    <code className="text-sm">P * (1 + r/n)^(n*t)</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Distance Formula</h4>
                    <code className="text-sm">sqrt((x2-x1)^2 + (y2-y1)^2)</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {selectedGuide && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              {selectedGuide.title} Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{selectedGuide.description}</p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Try this example:</h4>
                <code className="block p-2 bg-white rounded border">
                  {selectedGuide.example}
                </code>
              </div>
              <Button 
                onClick={() => markAsCompleted(selectedGuide.id)}
                disabled={completedGuides.has(selectedGuide.id)}
              >
                {completedGuides.has(selectedGuide.id) ? 'Completed!' : 'Mark as Complete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
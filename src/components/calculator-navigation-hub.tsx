"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, Brain, Wrench, DollarSign, Code2, Target,
  Sigma, Grid3X3, BarChart3, Atom, Binary, Search,
  Calendar, Clock, Link2, TrendingUp, Zap
} from 'lucide-react';

interface CalculatorTool {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'applied' | 'financial' | 'utilities' | 'precision';
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const calculatorTools: CalculatorTool[] = [
  // Core Mathematics
  {
    id: 'expression-solver',
    name: 'Expression Solver',
    description: 'Solve complex mathematical expressions with variables',
    category: 'core',
    icon: <Calculator className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['algebra', 'expressions', 'variables']
  },
  {
    id: 'matrix-calculator',
    name: 'Matrix Calculator',
    description: 'Matrix operations: addition, multiplication, determinant, inverse',
    category: 'core',
    icon: <Grid3X3 className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['linear algebra', 'matrices', 'determinant']
  },
  {
    id: 'linear-equations',
    name: 'Linear Equations Solver',
    description: 'Solve systems of linear equations',
    category: 'core',
    icon: <Sigma className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['systems', 'equations', 'algebra']
  },
  {
    id: 'statistics',
    name: 'Statistics Calculator',
    description: 'Statistical analysis and probability calculations',
    category: 'core',
    icon: <BarChart3 className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['statistics', 'probability', 'analysis']
  },
  {
    id: 'quadratic-solver',
    name: 'Quadratic Equation Solver',
    description: 'Solve quadratic equations ax² + bx + c = 0',
    category: 'core',
    icon: <Calculator className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['quadratic', 'polynomial', 'roots']
  },
  {
    id: 'base-converter',
    name: 'Base Converter',
    description: 'Convert between binary, decimal, hexadecimal, and other bases',
    category: 'core',
    icon: <Binary className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['conversion', 'binary', 'hex', 'programming']
  },

  // Advanced Mathematics
  {
    id: 'symbolic-math',
    name: 'Symbolic Mathematics',
    description: 'Advanced symbolic computation and algebraic manipulation',
    category: 'advanced',
    icon: <Brain className="h-5 w-5" />,
    difficulty: 'advanced',
    tags: ['symbolic', 'calculus', 'derivatives', 'integrals']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and validate regular expressions',
    category: 'advanced',
    icon: <Search className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['regex', 'pattern matching', 'programming']
  },
  {
    id: 'professional-tools',
    name: 'Professional Tools',
    description: 'Advanced mathematical utilities for professionals',
    category: 'advanced',
    icon: <Zap className="h-5 w-5" />,
    difficulty: 'advanced',
    tags: ['professional', 'advanced', 'specialized']
  },

  // Applied Sciences
  {
    id: 'physics-hub',
    name: 'Physics Calculations',
    description: 'Comprehensive physics calculations and formulas',
    category: 'applied',
    icon: <Atom className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['physics', 'mechanics', 'thermodynamics', 'electromagnetism']
  },
  {
    id: 'physics-simulator',
    name: 'Mathematical Physics Simulator',
    description: 'Simulate physical phenomena and mathematical models',
    category: 'applied',
    icon: <Wrench className="h-5 w-5" />,
    difficulty: 'advanced',
    tags: ['simulation', 'physics', 'modeling']
  },

  // Financial Tools
  {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Calculate loan payments, interest, and amortization schedules',
    category: 'financial',
    icon: <DollarSign className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['loans', 'mortgages', 'interest', 'payments']
  },
  {
    id: 'investment-analyzer',
    name: 'Investment Analyzer',
    description: 'Analyze investment growth and compound interest',
    category: 'financial',
    icon: <TrendingUp className="h-5 w-5" />,
    difficulty: 'intermediate',
    tags: ['investments', 'compound interest', 'growth']
  },

  // Utilities
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate differences between dates and time periods',
    category: 'utilities',
    icon: <Calendar className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['dates', 'time', 'calendar', 'duration']
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    category: 'utilities',
    icon: <Clock className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['timestamps', 'unix', 'time', 'conversion']
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs for web development',
    category: 'utilities',
    icon: <Link2 className="h-5 w-5" />,
    difficulty: 'beginner',
    tags: ['url', 'encoding', 'web development', 'escape']
  },

  // Precision Tools
  {
    id: 'precision-calculator',
    name: 'Ultra-Precision Calculator',
    description: 'High-precision mathematical calculations',
    category: 'precision',
    icon: <Target className="h-5 w-5" />,
    difficulty: 'advanced',
    tags: ['precision', 'accuracy', 'scientific', 'computation']
  }
];

interface NavigationHubProps {
  onToolSelect?: (toolId: string, category: string) => void;
}

export default function CalculatorNavigationHub({ onToolSelect }: NavigationHubProps) {
  const categories = {
    core: { name: 'Core Mathematics', icon: <Calculator className="h-6 w-6" />, color: 'blue' },
    advanced: { name: 'Advanced Tools', icon: <Brain className="h-6 w-6" />, color: 'purple' },
    applied: { name: 'Applied Sciences', icon: <Wrench className="h-6 w-6" />, color: 'teal' },
    financial: { name: 'Financial Tools', icon: <DollarSign className="h-6 w-6" />, color: 'green' },
    utilities: { name: 'Utilities', icon: <Code2 className="h-6 w-6" />, color: 'orange' },
    precision: { name: 'Precision Tools', icon: <Target className="h-6 w-6" />, color: 'purple' }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      core: 'text-blue-500',
      advanced: 'text-purple-500',
      applied: 'text-teal-500',
      financial: 'text-green-500',
      utilities: 'text-orange-500',
      precision: 'text-purple-500'
    };
    return colors[category as keyof typeof colors] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-500" />
            Calculator Navigation Hub
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Explore all available mathematical tools and calculators. Click on any tool to get started.
          </p>
        </CardHeader>
      </Card>

      {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
        const categoryTools = calculatorTools.filter(tool => tool.category === categoryKey);
        
        if (categoryTools.length === 0) return null;

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={getCategoryColor(categoryKey)}>
                  {categoryInfo.icon}
                </span>
                {categoryInfo.name}
                <span className="text-sm text-muted-foreground">({categoryTools.length} tools)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                    style={{ borderLeftColor: categoryInfo.color === 'blue' ? '#3b82f6' : 
                             categoryInfo.color === 'purple' ? '#8b5cf6' :
                             categoryInfo.color === 'teal' ? '#14b8a6' :
                             categoryInfo.color === 'green' ? '#10b981' :
                             categoryInfo.color === 'orange' ? '#f59e0b' : '#6b7280' }}
                    onClick={() => onToolSelect?.(tool.id, tool.category)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={getCategoryColor(tool.category)}>
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm leading-tight">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyBadgeColor(tool.difficulty)}`}>
                              {tool.difficulty}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {tool.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {tool.tags.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{tool.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">🎯 Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 text-sm">
              <div>
                <strong>Beginners:</strong> Start with Expression Solver, Date Calculator, or Base Converter
              </div>
              <div>
                <strong>Students:</strong> Try Matrix Calculator, Statistics, or Quadratic Solver
              </div>
              <div>
                <strong>Professionals:</strong> Explore Physics Hub, Symbolic Math, or Financial Tools
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
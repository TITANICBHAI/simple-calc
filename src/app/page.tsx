"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign, Percent, Code, Ruler, BarChart3, Brain, Sparkles, ArrowRight, Star, Coffee, Target, Zap, Heart, BookOpen, Users, Award, Settings, HelpCircle, LineChart, Sigma, Binary, Activity, PieChart, FlaskConical, Cpu, Atom, TrendingDown, Wallet, Terminal, Scale, BarChart2, Bot, Infinity, Beaker, Layers, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { KofiButton } from '@/components/ui/kofi-button';
import AdSenseAd from '@/components/AdSenseAd';
import { BrandLogo } from '@/components/brand-logo';
import EnhancedSupportFavorites from '@/components/enhanced-support-favorites';
import HydrationSafeWrapper from '@/components/hydration-safe-wrapper';

const features = [
  {
    title: "Scientific Calculator",
    description: "Professional-grade calculator with trigonometric functions (sin, cos, tan), logarithms (ln, log), exponentials, factorials, and advanced mathematical operations for engineering and scientific computations",
    icon: Calculator,
    href: "/calculator",
    color: "from-blue-500 to-blue-600",
    popular: true
  },
  {
    title: "Function Visualizer",
    description: "Advanced 3D plotting engine for mathematical functions with interactive surface visualization, contour mapping, critical point analysis, and real-time function manipulation capabilities",
    icon: Layers,
    href: "/graphing",
    color: "from-purple-500 to-purple-600",
    popular: true
  },
  {
    title: "Financial Calculator",
    description: "Comprehensive financial toolkit featuring loan amortization schedules, investment return calculations, compound interest modeling, mortgage payment analysis, and retirement planning tools",
    icon: CreditCard,
    href: "/financial",
    color: "from-green-500 to-green-600"
  },
  {
    title: "Percentage Calculator",
    description: "Precision percentage computations including percentage increase/decrease, tip calculations, tax computations, markup/markdown analysis, and proportional relationship solving",
    icon: Percent,
    href: "/percentage",
    color: "from-orange-500 to-orange-600"
  },
  {
    title: "Developer Tools",
    description: "Essential programming utilities featuring binary/decimal/hexadecimal conversion, MD5/SHA hash generation, URL encoding/decoding, JSON formatting, and regex pattern testing",
    icon: Terminal,
    href: "/developer",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    title: "Unit Converter",
    description: "Universal measurement conversion system supporting 200+ units across length, mass, temperature, volume, energy, pressure, speed, and specialized scientific measurements",
    icon: Scale,
    href: "/units",
    color: "from-teal-500 to-teal-600"
  },
  {
    title: "Statistical Engine",
    description: "Advanced statistical analysis platform with descriptive statistics, probability distributions, hypothesis testing, regression analysis, ANOVA, and data visualization capabilities",
    icon: BarChart2,
    href: "/statistics",
    color: "from-red-500 to-red-600"
  },
  {
    title: "AI Math Solver",
    description: "Intelligent problem-solving assistant powered by advanced AI models, capable of solving algebra, calculus, geometry, and word problems with detailed step-by-step explanations",
    icon: Bot,
    href: "/ai-math",
    color: "from-pink-500 to-pink-600",
    premium: true
  },
  {
    title: "Symbolic Math",
    description: "Computer algebra system for symbolic computation including algebraic simplification, calculus operations, equation solving, matrix operations, and polynomial factorization",
    icon: Infinity,
    href: "/advanced-math",
    color: "from-violet-500 to-violet-600",
    premium: true,
    new: true
  },
  {
    title: "Research Lab",
    description: "Cutting-edge computational research platform featuring machine learning algorithms, neural network modeling, quantum computing simulations, and advanced mathematical research tools",
    icon: Beaker,
    href: "/ml-quantum",
    color: "from-purple-600 to-pink-600",
    premium: true,
    new: true
  }
];

const quickCalculations = [
  { label: "15% of 250", result: "37.5" },
  { label: "√144", result: "12" },
  { label: "25²", result: "625" },
  { label: "sin(30°)", result: "0.5" }
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Enhanced Header */}
      <header className="w-full border-b-2 border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrandLogo size="md" animated={true} />
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
            <Link href="/help">
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <KofiButton size="sm" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Your Ultimate
            <span className="text-blue-700"> Math Toolkit</span>
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto font-medium">
            From basic calculations to advanced mathematical analysis, AI-powered problem solving, and interactive visualizations - all in one powerful platform.
          </p>
          
          {/* Educational Value Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Learn Mathematics</h3>
                <p className="text-gray-700 text-sm">Step-by-step solutions help you understand concepts better. Perfect for students and professionals.</p>
              </div>
              <div className="bg-white border-2 border-green-200 p-6 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Trusted by Millions</h3>
                <p className="text-gray-700 text-sm">Used by students, teachers, engineers, and professionals worldwide for accurate calculations.</p>
              </div>
              <div className="bg-white border-2 border-purple-200 p-6 rounded-xl shadow-lg">
                <Award className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Always Free</h3>
                <p className="text-gray-700 text-sm">All our mathematical tools are completely free to use with no hidden fees or subscriptions.</p>
              </div>
            </div>
          </div>
          
          {/* Quick Tools Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {/* Quick Calculator */}
            <Card className="p-6 bg-white border-2 border-gray-300 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Quick Calculator
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickCalculations.map((calc, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-gray-800 font-medium">{calc.label}</span>
                    <span className="font-bold text-blue-700">{calc.result}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-500 shadow-lg">
                <Link href="/calculator">
                  Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            {/* AI Solver Preview */}
            <Card className="p-6 bg-white border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Math Solver
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  Powered by Groq
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                  <div className="font-medium text-purple-800 mb-1">✨ AI-Powered Solutions</div>
                  <div className="text-purple-700 text-xs">Step-by-step explanations, instant solving</div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded border">📝 Algebra & Equations</div>
                  <div className="bg-gray-50 p-2 rounded border">∫ Calculus & Derivatives</div>
                  <div className="bg-gray-50 p-2 rounded border">📊 Statistics & Geometry</div>
                </div>
              </div>
              <Button asChild className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold border-2 border-purple-500 shadow-lg">
                <Link href="/calculator">
                  Try AI Solver <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tools and calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-gray-400 focus:border-blue-600 rounded-xl bg-white text-gray-900 font-medium shadow-lg"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Sparkles className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>



        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group"
            >
              <Link href={feature.href}>
                <AnimatedGlowCard 
                  className="p-6 h-full cursor-pointer group transform hover:scale-105"
                  glowColor={feature.color.includes('blue') ? '#3b82f6' : 
                            feature.color.includes('purple') ? '#8b5cf6' :
                            feature.color.includes('green') ? '#10b981' :
                            feature.color.includes('red') ? '#ef4444' :
                            feature.color.includes('orange') ? '#f59e0b' :
                            feature.color.includes('pink') ? '#ec4899' :
                            feature.color.includes('violet') ? '#8b5cf6' :
                            feature.color.includes('indigo') ? '#6366f1' :
                            feature.color.includes('teal') ? '#14b8a6' : '#3b82f6'}
                  intensity={feature.premium ? 'high' : feature.popular ? 'medium' : 'low'}
                  animationType={feature.new ? 'sparkle' : feature.premium ? 'wave' : feature.popular ? 'flow' : 'pulse'}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-gray-300`}
                         style={{animation: 'float 3s ease-in-out infinite', animationDelay: `${index * 0.2}s`}}>
                      <feature.icon className="h-8 w-8 text-white drop-shadow-sm" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                        {feature.popular && (
                          <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-xs font-bold border border-blue-300">
                            <Zap className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {feature.premium && (
                          <Badge variant="secondary" className="bg-purple-200 text-purple-800 text-xs font-bold border border-purple-300">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-50 hover:text-blue-800 transition-colors"
                    >
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </AnimatedGlowCard>
              </Link>
            </div>
          ))}
        </div>

        {/* Educational Content Section */}
        <div className="mt-16 mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Use Our Mathematical Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 bg-white border-2 border-gray-300 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Scientific Calculator Tutorial</h4>
              <div className="space-y-3 text-gray-700">
                <p><strong>Step 1:</strong> Enter your mathematical expression using standard notation</p>
                <p><strong>Step 2:</strong> Use parentheses for complex calculations: (2+3)×4</p>
                <p><strong>Step 3:</strong> Access trigonometric functions: sin, cos, tan</p>
                <p><strong>Step 4:</strong> Use logarithmic functions: log, ln for advanced calculations</p>
                <p className="text-blue-600 font-semibold">Perfect for students, engineers, and researchers!</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-2 border-gray-300 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Financial Calculator Guide</h4>
              <div className="space-y-3 text-gray-700">
                <p><strong>Loan Calculations:</strong> Calculate monthly payments and interest</p>
                <p><strong>Investment Planning:</strong> Compound interest and ROI calculations</p>
                <p><strong>Currency Conversion:</strong> Real-time exchange rates</p>
                <p><strong>Tax Calculations:</strong> Income tax and sales tax calculators</p>
                <p className="text-green-600 font-semibold">Essential tools for financial planning!</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Middle Content Ad */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <AdSenseAd 
            adSlot="2345678901"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>

        {/* Mathematics Tips Section */}
        <div className="mt-16 mb-12 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mathematical Problem-Solving Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Break Down Complex Problems</h4>
              <p className="text-gray-700">Divide complicated calculations into smaller, manageable steps for better accuracy.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Check Your Work</h4>
              <p className="text-gray-700">Always verify your results using different methods or by working backwards.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Understand the Concepts</h4>
              <p className="text-gray-700">Focus on understanding the underlying mathematical principles, not just memorizing formulas.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to solve complex problems?</h3>
          <p className="text-gray-800 mb-6 font-medium text-lg">Join thousands of students, professionals, and math enthusiasts using MathHub daily.</p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-6 rounded-xl shadow-2xl font-bold border-2 border-blue-500">
            <Link href="/calculator" className="flex items-center gap-3">
              <Calculator className="h-6 w-6 animate-pulse" />
              Start Calculating 
              <Target className="h-5 w-5 animate-bounce" />
            </Link>
          </Button>
        </div>

        {/* Enhanced Support & Favorites Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <HydrationSafeWrapper>
            <EnhancedSupportFavorites />
          </HydrationSafeWrapper>
        </div>
      </div>

      {/* Bottom Ad Before Footer */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <AdSenseAd 
          adSlot="3456789012"
          adFormat="auto"
          className="mb-8"
          adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
        />
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t-2 border-gray-300 shadow-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-900 font-semibold text-lg">MathHub - Your complete mathematical toolkit. Made with ❤️ for math lovers.</p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <a href="/privacy" className="text-gray-800 font-medium hover:text-blue-700 hover:underline transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-gray-800 font-medium hover:text-blue-700 hover:underline transition-colors">Terms of Service</a>
            <a href="/contact" className="text-gray-800 font-medium hover:text-blue-700 hover:underline transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Zap,
  Target,
  Globe,
  Brain,
  Atom
} from 'lucide-react'
import Link from 'next/link'
import AdSenseAd from '@/components/AdSenseAd'

export const metadata = {
  title: 'About MathHub - Advanced Mathematical Computing Platform',
  description: 'Learn about MathHub, the comprehensive mathematical platform offering Computer Algebra System, 3D visualization, advanced statistics, financial modeling, and physics calculations for students, researchers, and professionals.',
  keywords: 'mathematical software, CAS system, 3D math visualization, statistics calculator, financial modeling, physics equations, online calculator',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="w-full border-b-2 border-gray-300 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">MathHub</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/calculator" className="text-gray-600 hover:text-blue-600">Calculators</Link>
            <Link href="/graphing" className="text-gray-600 hover:text-blue-600">3D Graphing</Link>
            <Link href="/statistics" className="text-gray-600 hover:text-blue-600">Statistics</Link>
            <Link href="/financial" className="text-gray-600 hover:text-blue-600">Financial</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-16 w-16 text-blue-600 mr-4" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                About MathHub
              </h1>
              <p className="text-xl text-gray-600 mt-2">Professional Mathematical Computing Platform</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            MathHub is an advanced mathematical computing platform that brings university-level computational power 
            to students, researchers, and professionals worldwide. Our comprehensive toolkit rivals professional 
            software like Mathematica and MATLAB.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 mb-0">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <Calculator className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Computer Algebra System</CardTitle>
              <CardDescription>
                Advanced symbolic computation with step-by-step solutions, differentiation, integration, and equation solving.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardHeader>
              <Globe className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>3D Visualization Engine</CardTitle>
              <CardDescription>
                High-performance WebGL-based plotting with interactive controls, surface analysis, and real-time rendering.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Advanced Statistics</CardTitle>
              <CardDescription>
                Comprehensive statistical analysis including hypothesis testing, regression analysis, and Bayesian methods.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
            <CardHeader>
              <Target className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Financial Modeling</CardTitle>
              <CardDescription>
                Monte Carlo simulations, portfolio optimization, Black-Scholes options pricing, and risk analysis.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-red-200 hover:border-red-400 transition-colors">
            <CardHeader>
              <Atom className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Physics Engine</CardTitle>
              <CardDescription>
                Comprehensive physics equation database with uncertainty analysis and automatic unit conversion.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
            <CardHeader>
              <Zap className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>High Performance</CardTitle>
              <CardDescription>
                Optimized algorithms and WebGL acceleration for complex mathematical computations and visualizations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Ad Placement */}
        <div className="max-w-4xl mx-auto my-12 text-center">
          <AdSenseAd 
            adSlot="1234567890"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '280px' }}
          />
        </div>

        {/* Who Uses MathHub */}
        <Card className="mb-16 border-2 border-gray-200">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-3xl">Who Uses MathHub?</CardTitle>
            <CardDescription className="text-lg">
              Trusted by students, researchers, and professionals worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Students</h3>
                <p className="text-sm text-gray-600">From high school calculus to PhD research</p>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Educators</h3>
                <p className="text-sm text-gray-600">Teachers and professors for classroom demonstrations</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Researchers</h3>
                <p className="text-sm text-gray-600">Scientists and engineers for complex analysis</p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold">Professionals</h3>
                <p className="text-sm text-gray-600">Financial analysts and data scientists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose MathHub */}
        <Card className="mb-16 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-blue-800">Why Choose MathHub?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">🚀 Advanced Capabilities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Symbolic mathematics with CAS system</li>
                  <li>• Real-time 3D mathematical visualization</li>
                  <li>• Professional-grade statistical analysis</li>
                  <li>• Monte Carlo financial simulations</li>
                  <li>• Complete physics equation database</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">💡 User-Friendly Design</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Intuitive interface for all skill levels</li>
                  <li>• Step-by-step solution explanations</li>
                  <li>• Mobile-responsive design</li>
                  <li>• No software installation required</li>
                  <li>• Free access to advanced tools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Advanced Mathematics?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and professionals using MathHub for their mathematical needs
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/calculator">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Try Calculator Suite
              </Button>
            </Link>
            <Link href="/graphing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                Explore 3D Graphing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
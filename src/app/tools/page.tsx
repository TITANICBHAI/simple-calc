import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Atom,
  Waves,
  Brain,
  Zap,
  Target,
  Users,
  Star,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import AdSenseAd from '@/components/AdSenseAd'

export const metadata = {
  title: 'Free Online Mathematical Tools & Calculators - Advanced CAS, 3D Graphing, Statistics',
  description: 'Professional mathematical tools including Computer Algebra System, 3D graphing calculator, advanced statistics, Monte Carlo simulations, and physics equation solver. Free online mathematical computing platform.',
  keywords: 'online calculator, mathematical tools, CAS calculator, 3D graphing calculator, statistics calculator, physics equation solver, financial calculator, free math tools',
}

const featuredTools = [
  {
    title: "Scientific Calculator",
    description: "Professional-grade calculator with trigonometric functions (sin, cos, tan), logarithms (ln, log), exponentials, factorials, and advanced mathematical operations for engineering and scientific computations",
    features: ["Trigonometric Functions", "Logarithms & Exponentials", "Scientific Notation", "Memory Operations"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-300 to-cyan-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white font-bold text-lg">f(x)</div>
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">π</div>
      </div>
    ),
    color: "blue",
    difficulty: "Popular",
    users: "200,000+",
    url: "/calculator"
  },
  {
    title: "Function Visualizer",
    description: "Advanced 3D plotting engine for mathematical functions with interactive surface visualization, contour mapping, critical point analysis, and real-time function manipulation capabilities",
    features: ["3D Surface Plotting", "Interactive Controls", "Critical Point Analysis", "Vector Field Visualization"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-300 to-magenta-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L7 8L11 12L17 6L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16L7 12L11 16L17 10L21 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M3 20L7 16L11 20L17 14L21 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-cyan-400 text-purple-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3D</div>
      </div>
    ),
    color: "purple",
    difficulty: "Popular",
    users: "150,000+",
    url: "/graphing"
  },
  {
    title: "Financial Calculator",
    description: "Comprehensive financial analysis tools for loans, mortgages, investments, and retirement planning with advanced calculations",
    features: ["Loan Calculations", "Investment Analysis", "Compound Interest", "Retirement Planning"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-green-300 to-lime-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">$</div>
      </div>
    ),
    color: "green",
    difficulty: "Popular",
    users: "120,000+",
    url: "/statistics"
  },
  {
    title: "Investment & Portfolio Analyzer",
    description: "Monte Carlo simulations, portfolio optimization, and advanced financial modeling tools",
    features: ["Monte Carlo Simulations", "Portfolio Optimization", "Risk Analysis", "Black-Scholes Model"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-300 to-orange-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 12L9 6L13 10L21 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="13" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="21" cy="2" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-green-400 text-orange-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">%</div>
      </div>
    ),
    color: "orange",
    difficulty: "Advanced",
    users: "85,000+",
    url: "/financial"
  },
  {
    title: "Physics Calculator",
    description: "Complete physics calculations with uncertainty analysis and unit conversions",
    features: ["50+ Physics Formulas", "Unit Conversions", "Uncertainty Analysis", "Step-by-step Solutions"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-red-300 to-rose-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="5" r="0.5" fill="currentColor"/>
            <circle cx="19" cy="12" r="0.5" fill="currentColor"/>
            <circle cx="12" cy="19" r="0.5" fill="currentColor"/>
            <circle cx="5" cy="12" r="0.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-blue-400 text-red-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">F</div>
      </div>
    ),
    color: "red",
    difficulty: "Beginner",
    users: "95,000+",
    url: "/calculator"
  },
  {
    title: "Matrix & Linear Algebra",
    description: "Advanced linear algebra operations, eigenvalues, and matrix computations",
    features: ["Matrix Operations", "Eigenvalues & Eigenvectors", "Determinants", "Linear System Solver"],
    icon: () => (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-90 shadow-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-300 to-violet-400 rounded-xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="6.5" cy="6.5" r="1" fill="currentColor"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
            <circle cx="6.5" cy="17.5" r="1" fill="currentColor"/>
            <circle cx="17.5" cy="17.5" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-cyan-400 text-indigo-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">A</div>
      </div>
    ),
    color: "indigo",
    difficulty: "Intermediate",
    users: "75,000+",
    url: "/calculator"
  }
]

const quickTools = [
  { name: "Quadratic Equation Solver", category: "Algebra", url: "/calculator" },
  { name: "Derivative Calculator", category: "Calculus", url: "/calculator" },
  { name: "Integral Calculator", category: "Calculus", url: "/calculator" },
  { name: "Standard Deviation Calculator", category: "Statistics", url: "/statistics" },
  { name: "Correlation Calculator", category: "Statistics", url: "/statistics" },
  { name: "3D Surface Plotter", category: "Graphing", url: "/graphing" },
  { name: "Parametric Equation Grapher", category: "Graphing", url: "/graphing" },
  { name: "Monte Carlo Simulator", category: "Finance", url: "/financial" },
  { name: "Portfolio Optimizer", category: "Finance", url: "/financial" },
  { name: "Newton's Laws Calculator", category: "Physics", url: "/calculator" },
  { name: "Thermodynamics Calculator", category: "Physics", url: "/calculator" },
  { name: "Unit Converter", category: "Utilities", url: "/units" }
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="w-full border-b-2 border-gray-300 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">MathHub</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
            <Link href="/tutorials" className="text-gray-600 hover:text-blue-600">Tutorials</Link>
            <Link href="/calculator" className="text-gray-600 hover:text-blue-600">Calculators</Link>
            <Link href="/graphing" className="text-gray-600 hover:text-blue-600">3D Graphing</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Zap className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mathematical Tools & Calculators
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Professional-grade mathematical computing tools used by 200,000+ students and professionals
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            From basic calculations to advanced research-level analysis, our comprehensive suite of mathematical tools 
            provides university-level computational power accessible through your web browser.
          </p>
        </div>

        {/* Featured Tools */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">🌟 Featured Mathematical Tools</h2>
          <p className="text-center text-gray-600 mb-12">Our most popular and powerful calculators</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTools.map((tool, index) => {
              const Icon = tool.icon
              const colorClasses = {
                blue: "border-blue-200 hover:border-blue-400 bg-blue-50",
                purple: "border-purple-200 hover:border-purple-400 bg-purple-50",
                green: "border-green-200 hover:border-green-400 bg-green-50",
                yellow: "border-yellow-200 hover:border-yellow-400 bg-yellow-50",
                red: "border-red-200 hover:border-red-400 bg-red-50",
                orange: "border-orange-200 hover:border-orange-400 bg-orange-50",
                indigo: "border-indigo-200 hover:border-indigo-400 bg-indigo-50"
              }
              
              return (
                <Card key={index} className={`border-2 transition-all duration-300 hover:shadow-lg ${colorClasses[tool.color as keyof typeof colorClasses]}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon />
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{tool.users}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        {tool.difficulty}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-sm text-gray-700">Key Features:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href={tool.url}>
                      <Button className="w-full group">
                        Use Tool
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Ad Placement */}
        <div className="max-w-4xl mx-auto my-16 text-center">
          <AdSenseAd 
            adSlot="5555555555"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '300px' }}
          />
        </div>

        {/* Quick Access Tools */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Quick Access Calculators
            </CardTitle>
            <CardDescription>Fast access to our most-used mathematical tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {quickTools.map((tool, index) => (
                <Link key={index} href={tool.url}>
                  <div className="p-4 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {tool.name}
                        </h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {tool.category}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tool Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-800">Algebra & Calculus</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Symbolic equation solving</li>
                <li>• Differentiation & integration</li>
                <li>• Series expansion</li>
                <li>• Limit calculations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader className="text-center">
              <Waves className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-800">3D Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Interactive 3D graphs</li>
                <li>• Surface plotting</li>
                <li>• Vector field visualization</li>
                <li>• Parametric curves</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-800">Statistics & Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Hypothesis testing</li>
                <li>• Regression analysis</li>
                <li>• Probability distributions</li>
                <li>• Descriptive statistics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-yellow-800">Finance & Physics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Monte Carlo simulations</li>
                <li>• Portfolio optimization</li>
                <li>• Physics equations</li>
                <li>• Unit conversions</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* User Testimonials */}
        <Card className="mb-16 border-2 border-gray-200">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">What Our Users Say</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-2">
                  "The 3D graphing tool helped me visualize complex multivariable functions for my calculus course."
                </p>
                <p className="text-sm text-gray-500">- Sarah M., Engineering Student</p>
              </div>
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-2">
                  "The statistical analysis tools are incredibly powerful. Better than expensive software!"
                </p>
                <p className="text-sm text-gray-500">- Dr. James L., Research Scientist</p>
              </div>
              <div className="text-center p-4">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-2">
                  "Monte Carlo simulations made portfolio analysis so much easier for my finance work."
                </p>
                <p className="text-sm text-gray-500">- Michael R., Financial Analyst</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Start Using Professional Mathematical Tools</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 200,000+ users who rely on MathHub for their mathematical computing needs
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/calculator">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Try Calculator Suite
              </Button>
            </Link>
            <Link href="/tutorials">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                View Tutorials
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
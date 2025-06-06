import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  BookOpen, 
  Play, 
  TrendingUp, 
  BarChart3, 
  Atom,
  Waves,
  Brain,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'
import AdSenseAd from '@/components/AdSenseAd'

export const metadata = {
  title: 'Mathematical Tutorials - Learn Advanced Calculus, Statistics & Physics | MathHub',
  description: 'Free mathematical tutorials covering calculus, linear algebra, statistics, physics equations, 3D graphing, and financial modeling. Step-by-step guides for students and professionals.',
  keywords: 'math tutorials, calculus help, statistics tutorial, physics equations, 3D graphing tutorial, financial modeling guide, mathematical analysis, step by step math',
}

const tutorials = [
  {
    title: "Computer Algebra System Mastery",
    description: "Learn to solve complex equations symbolically with step-by-step solutions",
    category: "Symbolic Math",
    difficulty: "Intermediate",
    duration: "15 min",
    icon: Calculator,
    color: "blue",
    topics: ["Symbolic Integration", "Equation Solving", "Differentiation", "Series Expansion"]
  },
  {
    title: "3D Mathematical Visualization",
    description: "Master advanced 3D plotting for multivariable functions and surfaces",
    category: "Visualization",
    difficulty: "Advanced",
    duration: "20 min",
    icon: Waves,
    color: "purple",
    topics: ["Surface Plotting", "Vector Fields", "Contour Maps", "Interactive Controls"]
  },
  {
    title: "Statistical Analysis & Hypothesis Testing",
    description: "Complete guide to inferential statistics and data analysis",
    category: "Statistics",
    difficulty: "Intermediate",
    duration: "25 min",
    icon: BarChart3,
    color: "green",
    topics: ["T-Tests", "ANOVA", "Regression Analysis", "Bayesian Methods"]
  },
  {
    title: "Monte Carlo Financial Modeling",
    description: "Learn portfolio optimization and risk analysis with simulations",
    category: "Finance",
    difficulty: "Advanced",
    duration: "30 min",
    icon: TrendingUp,
    color: "yellow",
    topics: ["Portfolio Theory", "VaR Calculation", "Options Pricing", "Risk Metrics"]
  },
  {
    title: "Physics Equation Solving",
    description: "Comprehensive guide to physics calculations with uncertainty analysis",
    category: "Physics",
    difficulty: "Beginner",
    duration: "18 min",
    icon: Atom,
    color: "red",
    topics: ["Classical Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics"]
  },
  {
    title: "Advanced Calculus Techniques",
    description: "Master integration by parts, substitution, and partial fractions",
    category: "Calculus",
    difficulty: "Intermediate",
    duration: "22 min",
    icon: Brain,
    color: "indigo",
    topics: ["Integration Methods", "Multivariable Calculus", "Vector Calculus", "Differential Equations"]
  }
]

const quickGuides = [
  { title: "Solve Quadratic Equations", url: "/calculator", time: "2 min" },
  { title: "Plot 3D Functions", url: "/graphing", time: "3 min" },
  { title: "Calculate Standard Deviation", url: "/statistics", time: "2 min" },
  { title: "Black-Scholes Options", url: "/financial", time: "5 min" },
  { title: "Newton's Second Law", url: "/calculator", time: "2 min" },
  { title: "Matrix Operations", url: "/calculator", time: "4 min" }
]

export default function TutorialsPage() {
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
            <Link href="/calculator" className="text-gray-600 hover:text-blue-600">Calculators</Link>
            <Link href="/graphing" className="text-gray-600 hover:text-blue-600">3D Graphing</Link>
            <Link href="/statistics" className="text-gray-600 hover:text-blue-600">Statistics</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mathematical Tutorials
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Master advanced mathematics with our comprehensive step-by-step guides
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            From basic calculus to advanced statistical analysis and 3D visualization, 
            learn professional mathematical techniques used by researchers and engineers worldwide.
          </p>
        </div>

        {/* Quick Start Guides */}
        <Card className="mb-16 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center">
              <Play className="h-6 w-6 text-green-600 mr-2" />
              <CardTitle className="text-2xl text-green-800">Quick Start Guides</CardTitle>
            </div>
            <CardDescription>Get started immediately with these 2-5 minute tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickGuides.map((guide, index) => (
                <Link key={index} href={guide.url}>
                  <div className="p-4 bg-white rounded-lg border hover:border-green-400 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">{guide.title}</h3>
                      <Badge variant="outline" className="text-green-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {guide.time}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ad Placement */}
        <div className="max-w-4xl mx-auto my-12 text-center">
          <AdSenseAd 
            adSlot="9876543210"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>

        {/* Main Tutorials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 mb-0">
          {tutorials.map((tutorial, index) => {
            const Icon = tutorial.icon
            const colorClasses = {
              blue: "border-blue-200 hover:border-blue-400 bg-blue-50",
              purple: "border-purple-200 hover:border-purple-400 bg-purple-50",
              green: "border-green-200 hover:border-green-400 bg-green-50",
              yellow: "border-yellow-200 hover:border-yellow-400 bg-yellow-50",
              red: "border-red-200 hover:border-red-400 bg-red-50",
              indigo: "border-indigo-200 hover:border-indigo-400 bg-indigo-50"
            }
            
            return (
              <Card key={index} className={`border-2 transition-colors cursor-pointer ${colorClasses[tutorial.color as keyof typeof colorClasses]}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-8 w-8 text-${tutorial.color}-600`} />
                    <div className="flex gap-2">
                      <Badge variant="secondary">{tutorial.difficulty}</Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge className={`bg-${tutorial.color}-100 text-${tutorial.color}-800`}>
                      {tutorial.category}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutorial.topics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link href="/calculator">
                    <Button className="w-full mt-4" variant="outline">
                      Start Tutorial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Learning Paths */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Recommended Learning Paths
            </CardTitle>
            <CardDescription>Structured learning journeys for different goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-xl font-bold text-blue-800 mb-3">📚 Student Path</h3>
                <p className="text-gray-700 mb-4">Perfect for high school to university students</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>1. Basic Calculator Functions</li>
                  <li>2. Algebraic Equation Solving</li>
                  <li>3. Calculus & Derivatives</li>
                  <li>4. Statistical Analysis</li>
                  <li>5. 3D Graphing Basics</li>
                </ul>
              </div>
              
              <div className="p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
                <h3 className="text-xl font-bold text-purple-800 mb-3">🔬 Researcher Path</h3>
                <p className="text-gray-700 mb-4">Advanced tools for scientific research</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>1. Computer Algebra System</li>
                  <li>2. Advanced Statistics</li>
                  <li>3. 3D Visualization</li>
                  <li>4. Physics Calculations</li>
                  <li>5. Data Analysis Methods</li>
                </ul>
              </div>
              
              <div className="p-6 border-2 border-green-200 rounded-lg bg-green-50">
                <h3 className="text-xl font-bold text-green-800 mb-3">💼 Professional Path</h3>
                <p className="text-gray-700 mb-4">Tools for finance and engineering</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>1. Financial Modeling</li>
                  <li>2. Monte Carlo Simulation</li>
                  <li>3. Risk Analysis</li>
                  <li>4. Portfolio Optimization</li>
                  <li>5. Advanced Statistics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Topics */}
        <Card className="mb-16 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl">🔥 Most Popular Topics</CardTitle>
            <CardDescription>What our users are learning right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Calculus Integration",
                "Statistical Hypothesis Testing", 
                "3D Function Plotting",
                "Monte Carlo Methods",
                "Linear Algebra",
                "Differential Equations",
                "Financial Mathematics",
                "Physics Problem Solving"
              ].map((topic, index) => (
                <Link key={index} href="/calculator">
                  <div className="p-4 border rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-gray-800">{topic}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Advanced Mathematics?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start with our interactive tutorials and become proficient with professional mathematical tools
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/calculator">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Learning Now
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                Learn More About MathHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
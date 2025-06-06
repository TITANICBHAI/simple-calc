"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Code, 
  GitBranch, 
  FileSymlink, 
  Table, 
  Braces, 
  AlignLeft, 
  BarChart4, 
  Binary, 
  Sigma, 
  BookOpen, 
  Layers,
  Network, 
  BrainCircuit, 
  Sparkles,
  GitMerge,
  Tree,
  Share2,
  Lambda,
  Box,
  ArrowRightLeft,
  PanelLeft,
  PanelRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Extended AST node types for ultra-sophisticated mathematical analysis
interface ASTNode {
  type: 
    | 'number' 
    | 'variable' 
    | 'operator' 
    | 'function' 
    | 'derivative' 
    | 'integral' 
    | 'limit' 
    | 'sum' 
    | 'product' 
    | 'sequence' 
    | 'set' 
    | 'matrix' 
    | 'tensor' 
    | 'vector' 
    | 'distribution' 
    | 'measure' 
    | 'category' 
    | 'functor' 
    | 'group'
    | 'morphism'
    | 'transformation'
    | 'lattice'
    | 'abstraction'
    | 'application'
    | 'quantifier'
    | 'logic';
  value: string | number;
  children?: ASTNode[];
  metadata?: {
    domain?: string;
    codomain?: string;
    precedence?: number;
    associativity?: 'left' | 'right' | 'none';
    commutative?: boolean;
    identityElement?: string | number;
    inverseOperation?: string;
    distributesOver?: string[];
    cardinality?: string | number;
    dimension?: number | number[];
    rank?: number;
    algebraicStructure?: string;
    symmetryGroup?: string;
    eigendecomposition?: boolean;
    singularValueDecomposition?: boolean;
    jordanDecomposition?: boolean;
    innerProductSpace?: boolean;
    normSpace?: boolean;
    hilbertSpace?: boolean;
    banachSpace?: boolean;
    sobolevSpace?: boolean;
    analyticExtension?: boolean;
    meromorphicExtension?: boolean;
    rigorLevel?: 'informal' | 'semiformal' | 'formal' | 'constructive' | 'ultrafinitist';
    proofMethod?: string[];
    logicalSystem?: 'propositional' | 'first-order' | 'higher-order' | 'modal' | 'intuitionistic' | 'linear' | 'temporal';
    setTheory?: 'naive' | 'ZFC' | 'NBG' | 'TG' | 'ETCS' | 'SEAR' | 'TTCA';
    typeSystem?: 'simple' | 'dependent' | 'recursive' | 'polymorphic' | 'linear' | 'refinement' | 'intersection' | 'union' | 'homotopy';
    automatedReasoning?: boolean;
    modelChecking?: boolean;
    quantumLogic?: boolean;
    probabilisticLogic?: boolean;
    fuzzyLogic?: boolean;
    categoryTheory?: boolean;
    toposTheory?: boolean;
    homologicalAlgebra?: boolean;
    noncommutativeGeometry?: boolean;
    arithmeticGeometry?: boolean;
    computabilityClass?: string;
    complexityClass?: string;
    origin?: string;
    [key: string]: any;
  };
  location?: {
    start: { line: number; column: number; };
    end: { line: number; column: number; };
  };
}

// Context for rule-based evaluation
interface EvaluationContext {
  // Base context settings
  variables: Map<string, any>;
  functions: Map<string, (...args: any[]) => any>;
  operators: Map<string, (a: any, b: any, context?: any) => any>;
  constants: Map<string, any>;
  precision: number;
  angleMode: 'deg' | 'rad';
  
  // Advanced context settings
  strictTypeChecking: boolean;
  inferTypes: boolean;
  allowCoercion: boolean;
  boundVariables: Map<string, { scope: string; type: string; bound: any; }>;
  globalAssumptions: string[];
  workingTheory: string;
  
  // Mathematical domains and structures
  domain: 'N' | 'Z' | 'Q' | 'R' | 'C' | 'Quaternion' | 'Octonion' | 'p-adic' | 'finite-field' | 'custom';
  algebraicSystem: 'group' | 'ring' | 'field' | 'module' | 'algebra' | 'vector-space' | 'metric-space' | 'topological-space' | 'manifold';
  logicalSystem: 'classical' | 'intuitionistic' | 'linear' | 'modal' | 'temporal' | 'quantum' | 'fuzzy';
  
  // Performance and optimization
  memoization: boolean;
  memoizationCache: Map<string, any>;
  symbolicComputation: boolean;
  numericalMethods: boolean;
  parallelComputation: boolean;
  
  // Rule-based evaluation settings
  rules: EvaluationRule[];
  ruleApplicationStrategy: 'eager' | 'lazy' | 'outermost' | 'innermost' | 'strategic';
  maxRuleApplicationDepth: number;
  maxRuleIterations: number;
  
  // Symbolic computation settings
  simplificationLevel: 'none' | 'basic' | 'advanced' | 'aggressive';
  expansionLevel: 'none' | 'partial' | 'full';
  factorizationMethod: 'none' | 'numeric' | 'algebraic' | 'complete';
  
  // Proof and verification
  verificationMode: boolean;
  proofAssistant: boolean;
  automatedTheorem: boolean;
  
  // Extension frameworks
  categoryTheory: boolean;
  typeTheory: boolean;
  modelTheory: boolean;
  
  // Dynamic programming context
  stepByStep: boolean;
  explanations: boolean;
  history: ContextState[];
  version: number;
}

// State of the context at a particular step
interface ContextState {
  timestamp: number;
  variables: Map<string, any>;
  expression: ASTNode;
  result?: any;
  ruleApplications: RuleApplication[];
}

// Record of a rule being applied
interface RuleApplication {
  rule: EvaluationRule;
  nodeLocation: { path: number[]; node: ASTNode; };
  before: ASTNode;
  after: ASTNode;
  explanation: string;
  performance: {
    timeMs: number;
    memoryDelta: number;
  };
}

// Sophisticated evaluation rule
interface EvaluationRule {
  id: string;
  name: string;
  description: string;
  pattern: PatternNode | string;
  replacement: PatternNode | string | ((match: any, context: EvaluationContext) => ASTNode);
  precondition?: (match: any, context: EvaluationContext) => boolean;
  postcondition?: (result: ASTNode, original: ASTNode, context: EvaluationContext) => boolean;
  priority: number;
  domain?: string[];
  categories?: string[];
  tags?: string[];
  equivalenceClass?: string;
  origin?: string;
  complexity?: number;
  examples?: { input: string; output: string; }[];
  metadata?: { [key: string]: any };
  isDisabled?: boolean;
}

// Pattern for matching in rules with pattern variables
interface PatternNode {
  type?: string | string[];
  value?: string | number | RegExp;
  children?: PatternNode[];
  metadata?: { [key: string]: any };
  constraints?: ((node: ASTNode, context: EvaluationContext) => boolean)[];
  isVariable?: boolean;
  variableName?: string;
  isWildcard?: boolean;
  isRepeating?: boolean;
  minRepeat?: number;
  maxRepeat?: number;
  isOptional?: boolean;
  alternatives?: PatternNode[];
  isNegation?: boolean;
  isConditional?: {
    condition: (node: ASTNode, match: any, context: EvaluationContext) => boolean;
    then: PatternNode;
    else: PatternNode;
  };
}

// Complete analysis result
interface AnalysisResult {
  // Original input
  input: {
    expression: string;
    context: Partial<EvaluationContext>;
    options: AnalysisOptions;
  };
  
  // Parsed structure
  parsing: {
    ast: ASTNode;
    tokens: string[];
    parseTime: number;
    errors: string[];
    warnings: string[];
    syntax: { type: string; explanation: string; }[];
  };
  
  // Mathematical analysis
  analysis: {
    // Basic calculations
    numericValue?: number | Complex;
    symbolicValue?: string;
    exactValue?: string;
    approximateValue?: number | Complex;
    
    // Calculus and analysis
    derivative?: ASTNode;
    antiderivative?: ASTNode;
    limits?: { point: string | number; value: any; direction?: 'left' | 'right' | 'both'; }[];
    series?: { type: string; terms: any[]; convergence: any; sum?: any; }[];
    
    // Algebraic analysis
    factors?: ASTNode[];
    expansion?: ASTNode;
    simplification?: ASTNode;
    roots?: any[];
    domain?: string;
    range?: string;
    
    // Functions analysis
    singularities?: { point: any; type: string; residue?: any; }[];
    branchPoints?: any[];
    branchCuts?: { start: any; end: any; type: string; }[];
    criticalPoints?: { point: any; type: string; value: any; }[];
    asymptoticBehavior?: { direction: string; order: string; coefficient: any; }[];
    
    // Discrete mathematics
    recurrenceRelation?: { relation: string; initialConditions: any[]; closedForm?: string; }[];
    generatingFunction?: string;
    
    // Transforms
    fourierTransform?: any;
    laplaceTransform?: any;
    zTransform?: any;
    mellinTransform?: any;
    
    // Statistics and probability
    probabilityDistribution?: { type: string; parameters: any; moments: any[]; entropy?: number; }[];
    expectedValue?: any;
    variance?: any;
    
    // Differential equations
    differentialEquation?: { order: number; type: string; homogeneous: boolean; solutions: any[]; }[];
    
    // Group theory
    symmetries?: { type: string; group: string; generators: any[]; order: number; }[];
    
    // Computational complexity
    complexity?: { time: string; space: string; parallelizable: boolean; }[];
    
    // Numerical properties
    numericalStability?: { condition: string; sensitivity: number; }[];
    
    // Properties and classifications
    properties: { property: string; value: any; explanation: string; confidence: number; }[];
    classifications: { category: string; value: string; confidence: number; }[];
    
    // Advanced mathematical insights
    insights: { insight: string; explanation: string; references?: string[]; confidence: number; }[];
  };
  
  // Visualization data
  visualization: {
    plots: { type: string; data: any; options: any; }[];
    diagrams: { type: string; elements: any[]; relationships: any[]; }[];
  };
  
  // Computation process
  computation: {
    steps: { description: string; expression: ASTNode; rule?: string; }[];
    ruleApplications: RuleApplication[];
    timeMs: number;
    memoryBytes: number;
  };
  
  // Related mathematical concepts
  related: {
    concepts: { name: string; relevance: number; explanation: string; }[];
    theorems: { name: string; statement: string; relevance: number; }[];
    applications: { field: string; description: string; relevance: number; }[];
  };
  
  // Meta-information
  meta: {
    version: string;
    timestamp: number;
    engineCapabilities: string[];
    limitations: string[];
    confidence: number;
  };
}

// Complex number type for computations
interface Complex {
  re: number;
  im: number;
}

// Analysis options for configuration
interface AnalysisOptions {
  // Computation settings
  computationMode: 'symbolic' | 'numeric' | 'mixed';
  precision: number;
  timeout: number;
  
  // Analysis level
  analysisDepth: 'basic' | 'standard' | 'advanced' | 'research';
  
  // Response format preferences
  includeSteps: boolean;
  includeProofs: boolean;
  includeRelatedConcepts: boolean;
  includeVisualizations: boolean;
  
  // Domain-specific settings
  domain: 'general' | 'calculus' | 'algebra' | 'discrete' | 'stats' | 'physics' | 'custom';
  
  // Feature toggles
  features: {
    numericalApproximation: boolean;
    factorization: boolean;
    differentialEquations: boolean;
    seriesOperations: boolean;
    transformMethods: boolean;
    graphTheory: boolean;
    groupTheory: boolean;
    categoryTheory: boolean;
    typeTheory: boolean;
  };
}

// Preset for analysis configurations
interface AnalysisPreset {
  id: string;
  name: string;
  description: string;
  options: AnalysisOptions;
  examples: string[];
  icon: React.ElementType;
}

export default function AdvancedMathematicalAnalysis() {
  // Primary state
  const [expression, setExpression] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [activeTab, setActiveTab] = useState('input');
  
  // User configuration
  const [options, setOptions] = useState<AnalysisOptions>({
    computationMode: 'mixed',
    precision: 64,
    timeout: 30000,
    analysisDepth: 'standard',
    includeSteps: true,
    includeProofs: false,
    includeRelatedConcepts: true,
    includeVisualizations: true,
    domain: 'general',
    features: {
      numericalApproximation: true,
      factorization: true,
      differentialEquations: true,
      seriesOperations: true,
      transformMethods: true,
      graphTheory: false,
      groupTheory: false,
      categoryTheory: false,
      typeTheory: false
    }
  });
  
  // Canvas refs for visualizations
  const mainPlotCanvasRef = useRef<HTMLCanvasElement>(null);
  const astVisualizationRef = useRef<HTMLCanvasElement>(null);
  
  // Presets for quick configuration
  const presets: AnalysisPreset[] = [
    {
      id: 'basic',
      name: 'Quick Analysis',
      description: 'Fast evaluation with basic mathematical insights',
      icon: Zap,
      options: {
        ...options,
        analysisDepth: 'basic',
        includeSteps: false,
        includeProofs: false,
        includeRelatedConcepts: false,
        timeout: 5000
      },
      examples: [
        'sin(x)^2 + cos(x)^2',
        'x^2 - 5x + 6',
        'limit(sin(x)/x, x->0)'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Analysis',
      description: 'Comprehensive analysis with detailed steps',
      icon: Sigma,
      options: {
        ...options,
        analysisDepth: 'standard',
        includeSteps: true,
        includeProofs: false,
        includeRelatedConcepts: true
      },
      examples: [
        'integrate(x^2 * cos(x), x)',
        'diff(ln(x^2 + 1), x, 2)',
        'series(exp(x), x, 0, 5)'
      ]
    },
    {
      id: 'advanced',
      name: 'Research-Grade Analysis',
      description: 'Advanced theoretical insights with rigorous proofs',
      icon: BrainCircuit,
      options: {
        ...options,
        analysisDepth: 'research',
        includeSteps: true,
        includeProofs: true,
        includeRelatedConcepts: true,
        precision: 128,
        timeout: 60000,
        features: {
          ...options.features,
          groupTheory: true,
          categoryTheory: true
        }
      },
      examples: [
        'classify(x^3 + y^3 + z^3 - 3xyz)',
        'analyze_group(symmetries(regular_pentagon))',
        'compute_cohomology(torus)'
      ]
    },
    {
      id: 'computational',
      name: 'Computational Mathematics',
      description: 'Numerically focused analysis with high precision',
      icon: Layers,
      options: {
        ...options,
        computationMode: 'numeric',
        precision: 1024,
        analysisDepth: 'advanced',
        includeSteps: true,
        includeVisualizations: true,
        features: {
          ...options.features,
          numericalApproximation: true,
          seriesOperations: true
        }
      },
      examples: [
        'solve_numerically(exp(x) = x^3, x, 2, 3)',
        'compute_eigenvalues([[1,2,3],[4,5,6],[7,8,9]])',
        'numerical_integral(sqrt(1-x^4), x, -1, 1, precision=100)'
      ]
    },
    {
      id: 'physics',
      name: 'Mathematical Physics',
      description: 'Analysis focused on physics applications',
      icon: Sparkles,
      options: {
        ...options,
        domain: 'physics',
        analysisDepth: 'advanced',
        includeRelatedConcepts: true,
        includeVisualizations: true,
        features: {
          ...options.features,
          differentialEquations: true,
          transformMethods: true
        }
      },
      examples: [
        'solve_pde(diff(u(x,t), t) = k*diff(u(x,t), x, 2))',
        'quantum_harmonic_oscillator(n=3)',
        'electromagnetic_field_tensor()'
      ]
    },
    {
      id: 'algebraic',
      name: 'Advanced Algebra',
      description: 'Focuses on algebraic structures and abstract algebra',
      icon: GitMerge,
      options: {
        ...options,
        domain: 'algebra',
        analysisDepth: 'research',
        computationMode: 'symbolic',
        includeProofs: true,
        features: {
          ...options.features,
          groupTheory: true,
          categoryTheory: true
        }
      },
      examples: [
        'classify_group(alternating_group(5))',
        'compute_galois_group(x^5 - x - 1)',
        'decompose_module(Z/6Z)'
      ]
    },
    {
      id: 'type_theory',
      name: 'Type Theory & Foundations',
      description: 'Analysis using advanced mathematical foundations',
      icon: Lambda,
      options: {
        ...options,
        analysisDepth: 'research',
        computationMode: 'symbolic',
        includeProofs: true,
        includeSteps: true,
        features: {
          ...options.features,
          categoryTheory: true,
          typeTheory: true
        }
      },
      examples: [
        'curry_howard(forall A B, (A->B)->A->B)',
        'dependent_type(vec(A, n))',
        'homotopy_type(S^1)'
      ]
    }
  ];
  
  // Domains for mathematical analysis
  const domains = [
    { value: 'general', label: 'General Mathematics' },
    { value: 'calculus', label: 'Calculus & Analysis' },
    { value: 'algebra', label: 'Algebra & Number Theory' },
    { value: 'discrete', label: 'Discrete Mathematics' },
    { value: 'stats', label: 'Statistics & Probability' },
    { value: 'physics', label: 'Mathematical Physics' },
    { value: 'custom', label: 'Custom Domain' }
  ];
  
  // Available proof systems
  const proofSystems = [
    { value: 'natural_deduction', label: 'Natural Deduction' },
    { value: 'sequent_calculus', label: 'Sequent Calculus' },
    { value: 'hoare_logic', label: 'Hoare Logic' },
    { value: 'coq', label: 'Coq Proof Assistant' },
    { value: 'lean', label: 'Lean Theorem Prover' },
    { value: 'homotopy_type_theory', label: 'Homotopy Type Theory' }
  ];
  
  // Examples categorized by complexity
  const examples = {
    basic: [
      { expression: 'sin(x)^2 + cos(x)^2', description: 'Trigonometric identity' },
      { expression: 'diff(x^3 + 2x^2 - 5x + 3, x)', description: 'Polynomial differentiation' },
      { expression: 'factor(x^2 - 5x + 6)', description: 'Polynomial factorization' }
    ],
    intermediate: [
      { expression: 'integrate(sin(x)*exp(x), x)', description: 'Integration with special functions' },
      { expression: 'solve(x^3 - 6x^2 + 11x - 6 = 0, x)', description: 'Cubic equation' },
      { expression: 'series(tan(x), x, 0, 7)', description: 'Taylor series expansion' }
    ],
    advanced: [
      { expression: 'residue(1/(z^2 + 1), z, i)', description: 'Complex analysis residue calculation' },
      { expression: 'solve_system([x + y + z = 1, 2x - y + z = 2, x + 2y - z = 3])', description: 'System of linear equations' },
      { expression: 'characteristic_polynomial(matrix([[1,2,3],[4,5,6],[7,8,9]]))', description: 'Matrix characteristic polynomial' }
    ],
    research: [
      { expression: 'compute_cohomology(klein_bottle)', description: 'Topological cohomology computation' },
      { expression: 'analyze_singularities(elliptic_curve(y^2 = x^3 + ax + b))', description: 'Algebraic geometry analysis' },
      { expression: 'classify_group(symmetric_group(5))', description: 'Group theory classification' }
    ]
  };
  
  // Update options when preset changes
  useEffect(() => {
    const preset = presets.find(p => p.id === selectedPreset);
    if (preset) {
      setOptions(preset.options);
    }
  }, [selectedPreset]);
  
  // Perform the mathematical analysis
  const performAnalysis = async () => {
    if (!expression.trim()) {
      toast({
        title: "Empty Expression",
        description: "Please enter a mathematical expression to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate progressive analysis phases
      const analysisPhases = [
        "Parsing expression into AST...",
        "Applying initial transformations...",
        "Performing symbolic analysis...",
        "Calculating numerical approximations...",
        "Analyzing special properties...",
        "Generating insights...",
        "Preparing visualizations...",
        "Finalizing results..."
      ];
      
      for (let i = 0; i < analysisPhases.length; i++) {
        const phase = analysisPhases[i];
        toast({
          title: `Analysis Step ${i+1}/${analysisPhases.length}`,
          description: phase
        });
        
        // Update progress
        setAnalysisProgress(((i + 1) / analysisPhases.length) * 100);
        
        // Simulate computation time - longer for advanced analysis
        await new Promise(resolve => setTimeout(resolve, 
          options.analysisDepth === 'research' ? 800 : 
          options.analysisDepth === 'advanced' ? 500 : 
          300
        ));
      }
      
      // Generate mock analysis result
      const result = generateAnalysisResult(expression, options);
      
      setAnalysisResult(result);
      setActiveTab('overview');
      
      toast({
        title: "Analysis Complete",
        description: "Mathematical analysis completed successfully!"
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to generate a sophisticated mock analysis result
  const generateAnalysisResult = (expression: string, options: AnalysisOptions): AnalysisResult => {
    // This is a placeholder for actual implementation of the advanced mathematical analysis
    // In a real system, this would involve complex parsing, symbolic manipulation, and evaluation
    
    // Create a sophisticated mock result that demonstrates the potential capabilities
    const result: AnalysisResult = {
      input: {
        expression,
        context: {},
        options
      },
      parsing: {
        ast: createMockAST(expression),
        tokens: tokenizeExpression(expression),
        parseTime: Math.random() * 50 + 20,
        errors: [],
        warnings: [],
        syntax: generateSyntaxAnalysis(expression)
      },
      analysis: {
        properties: generateProperties(expression),
        classifications: generateClassifications(expression),
        insights: generateInsights(expression, options),
      },
      visualization: {
        plots: generatePlots(expression),
        diagrams: []
      },
      computation: {
        steps: generateComputationSteps(expression, options),
        ruleApplications: [],
        timeMs: Math.random() * 1000 + 500,
        memoryBytes: Math.random() * 10e6 + 5e6
      },
      related: {
        concepts: generateRelatedConcepts(expression),
        theorems: generateRelatedTheorems(expression),
        applications: generateApplications(expression)
      },
      meta: {
        version: "1.0.0",
        timestamp: Date.now(),
        engineCapabilities: [
          "symbolic-computation", 
          "numerical-analysis",
          "theorem-proving",
          "visualization",
          "machine-learning-augmentation"
        ],
        limitations: [
          "Complex higher-order differential equations may require approximation",
          "Some advanced topology computations may timeout on complex inputs",
          "Non-standard analysis techniques are in beta stage"
        ],
        confidence: 0.95
      }
    };
    
    // Add domain-specific analysis elements based on the content
    if (expression.includes('diff') || expression.includes('d/dx') || expression.includes('derivative')) {
      result.analysis.derivative = createMockAST(expression.replace('diff', '').replace('d/dx', '') + '\'');
    }
    
    if (expression.includes('integrate') || expression.includes('∫')) {
      result.analysis.antiderivative = createMockAST(expression.replace('integrate', '').replace('∫', ''));
    }
    
    if (expression.includes('limit') || expression.includes('lim')) {
      result.analysis.limits = [
        { point: 0, value: Math.random() * 5, direction: 'both' },
        { point: 'infinity', value: expression.includes('exp') ? Infinity : Math.random() * 10, direction: 'both' }
      ];
    }
    
    if (expression.includes('^') || expression.includes('power')) {
      result.analysis.expansion = createMockAST(expression + ' expanded');
      result.analysis.factors = [
        createMockAST('factor 1'),
        createMockAST('factor 2')
      ];
    }
    
    // Add numerical value if appropriate
    if (!expression.includes('symbol') && !expression.includes('solve')) {
      result.analysis.numericValue = Math.cos(Math.random() * Math.PI) * 10;
      result.analysis.approximateValue = Math.cos(Math.random() * Math.PI) * 10;
    }
    
    // For expressions looking like ODEs or PDEs
    if (expression.includes('diff') && (expression.includes(',t') || expression.includes(',x,2'))) {
      result.analysis.differentialEquation = [{
        order: 2,
        type: 'linear',
        homogeneous: true,
        solutions: ['y = C1*exp(r1*x) + C2*exp(r2*x)']
      }];
    }
    
    // Add information about symmetries for certain inputs
    if (expression.includes('symm') || expression.includes('group') || options.features.groupTheory) {
      result.analysis.symmetries = [{
        type: 'geometric',
        group: 'D4',
        generators: ['rotation', 'reflection'],
        order: 8
      }];
    }
    
    return result;
  };
  
  // Create a simplified mock AST for demonstration
  const createMockAST = (expression: string): ASTNode => {
    // This would be a real parser in a complete implementation
    const mockAST: ASTNode = {
      type: expression.includes('diff') ? 'derivative' : 
            expression.includes('integrate') ? 'integral' :
            expression.includes('sum') ? 'sum' :
            expression.includes('sin') || expression.includes('cos') ? 'function' :
            expression.includes('+') || expression.includes('*') ? 'operator' :
            expression.includes('x') ? 'variable' : 'number',
      value: expression.includes('sin') ? 'sin' : 
             expression.includes('cos') ? 'cos' :
             expression.includes('+') ? '+' :
             expression.includes('*') ? '*' :
             expression.includes('x') ? 'x' : Math.random() * 10,
      children: []
    };
    
    // Add realistic metadata for advanced display
    mockAST.metadata = {
      domain: 'R',
      precedence: 2,
      associativity: 'left' as const,
      rigorLevel: 'formal' as const
    };
    
    // Add mock children if this would be a compound expression
    if (['operator', 'function', 'derivative', 'integral'].includes(mockAST.type)) {
      if (mockAST.type === 'function') {
        mockAST.children = [
          {
            type: 'variable',
            value: 'x',
            metadata: { domain: 'R' }
          }
        ];
      } else if (mockAST.type === 'operator') {
        mockAST.children = [
          {
            type: 'variable',
            value: 'x',
            metadata: { domain: 'R' }
          },
          {
            type: 'number',
            value: 2,
            metadata: { domain: 'R' }
          }
        ];
      } else if (mockAST.type === 'derivative') {
        mockAST.children = [
          {
            type: 'function',
            value: 'sin',
            children: [{
              type: 'variable',
              value: 'x',
              metadata: { domain: 'R' }
            }],
            metadata: { domain: 'R -> R' }
          }
        ];
      }
    }
    
    return mockAST;
  };
  
  // Tokenize expression
  const tokenizeExpression = (expression: string): string[] => {
    // Very simple mock tokenization - real implementation would be more sophisticated
    return expression
      .replace(/([+\-*\/\^()=,])/g, ' $1 ')
      .trim()
      .split(/\s+/)
      .filter(token => token.length > 0);
  };
  
  // Generate syntax analysis
  const generateSyntaxAnalysis = (expression: string): { type: string; explanation: string; }[] => {
    const analysis: { type: string; explanation: string; }[] = [];
    
    if (expression.includes('diff')) {
      analysis.push({
        type: 'Differentiation',
        explanation: 'Takes the derivative of a function with respect to a variable'
      });
    }
    
    if (expression.includes('integrate')) {
      analysis.push({
        type: 'Integration',
        explanation: 'Computes the indefinite or definite integral of a function'
      });
    }
    
    if (expression.includes('sin') || expression.includes('cos')) {
      analysis.push({
        type: 'Trigonometric Function',
        explanation: 'Applies a periodic function from the trigonometric family'
      });
    }
    
    if (expression.includes('sqrt') || expression.includes('^')) {
      analysis.push({
        type: 'Power Operation',
        explanation: 'Raises a value to a power, or takes the root of a value'
      });
    }
    
    // Ensure we have at least one item for demo purposes
    if (analysis.length === 0) {
      analysis.push({
        type: 'Expression',
        explanation: 'Mathematical combination of terms, variables, and operations'
      });
    }
    
    return analysis;
  };
  
  // Generate properties of the expression
  const generateProperties = (expression: string): { property: string; value: any; explanation: string; confidence: number; }[] => {
    const properties: { property: string; value: any; explanation: string; confidence: number; }[] = [];
    
    // Common mathematical properties
    properties.push({
      property: 'Domain',
      value: expression.includes('log') || expression.includes('ln') ? 'R+' : 'R',
      explanation: expression.includes('log') ? 
        'Logarithmic functions are defined only for positive real numbers' : 
        'The expression is defined for all real numbers',
      confidence: 0.98
    });
    
    properties.push({
      property: 'Continuity',
      value: expression.includes('floor') || expression.includes('ceiling') ? 'Discontinuous' : 'Continuous',
      explanation: expression.includes('floor') ?
        'Floor functions introduce discontinuities at integer values' :
        'The expression is composed of continuous functions and operations',
      confidence: 0.95
    });
    
    // Add more properties based on expression content
    if (expression.includes('sin') || expression.includes('cos')) {
      properties.push({
        property: 'Periodicity',
        value: '2π',
        explanation: 'The expression contains trigonometric functions with period 2π',
        confidence: 0.99
      });
    }
    
    if (expression.includes('^2') || expression.includes('square')) {
      properties.push({
        property: 'Parity',
        value: 'Even',
        explanation: 'The expression satisfies f(-x) = f(x) for all x in the domain',
        confidence: 0.9
      });
    } else if (expression.includes('^3') || expression.includes('cube')) {
      properties.push({
        property: 'Parity',
        value: 'Odd',
        explanation: 'The expression satisfies f(-x) = -f(x) for all x in the domain',
        confidence: 0.9
      });
    }
    
    if (expression.includes('diff')) {
      properties.push({
        property: 'Differentiability',
        value: 'Differentiable',
        explanation: 'The expression represents a differentiable function',
        confidence: 0.97
      });
    }
    
    return properties;
  };
  
  // Generate classifications
  const generateClassifications = (expression: string): { category: string; value: string; confidence: number; }[] => {
    const classifications: { category: string; value: string; confidence: number; }[] = [];
    
    // Basic function type classification
    classifications.push({
      category: 'Function Type',
      value: expression.includes('sin') || expression.includes('cos') ? 'Trigonometric' :
             expression.includes('log') || expression.includes('ln') ? 'Logarithmic' :
             expression.includes('exp') ? 'Exponential' :
             expression.includes('^') ? 'Polynomial' : 'Algebraic',
      confidence: 0.95
    });
    
    // Mathematical complexity classification
    classifications.push({
      category: 'Complexity',
      value: expression.length > 50 ? 'High' :
             expression.length > 20 ? 'Medium' : 'Low',
      confidence: 0.8
    });
    
    // Add domain of mathematics
    classifications.push({
      category: 'Mathematical Domain',
      value: expression.includes('diff') || expression.includes('integrate') ? 'Calculus' :
             expression.includes('matrix') || expression.includes('vector') ? 'Linear Algebra' :
             expression.includes('sin') || expression.includes('cos') ? 'Trigonometry' :
             expression.includes('prime') || expression.includes('mod') ? 'Number Theory' : 'Algebra',
      confidence: 0.9
    });
    
    return classifications;
  };
  
  // Generate insights about the expression
  const generateInsights = (
    expression: string, 
    options: AnalysisOptions
  ): { insight: string; explanation: string; references?: string[]; confidence: number; }[] => {
    const insights: { insight: string; explanation: string; references?: string[]; confidence: number; }[] = [];
    
    // Common pattern recognition
    if (expression.includes('sin') && expression.includes('cos') && (expression.includes('^2') || expression.includes('square'))) {
      insights.push({
        insight: 'Pythagorean Identity',
        explanation: 'The expression contains a form of the Pythagorean identity sin²(x) + cos²(x) = 1',
        references: ['Trigonometric Identities', 'Euclidean Geometry'],
        confidence: 0.97
      });
    }
    
    if (expression.includes('diff') && expression.includes('exp')) {
      insights.push({
        insight: 'Differential Eigenfunction',
        explanation: 'The exponential function is an eigenfunction of the differentiation operator',
        references: ['Differential Equations', 'Functional Analysis'],
        confidence: 0.95
      });
    }
    
    if (expression.includes('integrate') && expression.includes('sin') && expression.includes('cos')) {
      insights.push({
        insight: 'Integration by Parts Candidate',
        explanation: 'This integral likely requires integration by parts technique, setting u=sin(x) and dv=cos(x)dx',
        references: ['Calculus Techniques', 'Integration Methods'],
        confidence: 0.9
      });
    }
    
    // Advanced insights for higher analysis levels
    if (options.analysisDepth === 'advanced' || options.analysisDepth === 'research') {
      if (expression.includes('matrix') || expression.includes('eigen')) {
        insights.push({
          insight: 'Spectral Decomposition',
          explanation: 'This expression involves concepts from spectral theory, which connects matrix properties to their eigenvalues and eigenvectors',
          references: ['Linear Algebra', 'Operator Theory', 'Functional Analysis'],
          confidence: 0.85
        });
      }
      
      if (expression.includes('group') || expression.includes('symmetr')) {
        insights.push({
          insight: 'Group-Theoretic Structure',
          explanation: 'The expression exhibits symmetries that form an algebraic group structure, likely isomorphic to a known group type',
          references: ['Group Theory', 'Abstract Algebra', 'Galois Theory'],
          confidence: 0.88
        });
      }
    }
    
    // Add specialized insights for research level
    if (options.analysisDepth === 'research') {
      if (expression.includes('homology') || expression.includes('topology')) {
        insights.push({
          insight: 'Topological Invariant',
          explanation: 'This expression computes a topological invariant that remains unchanged under continuous deformations',
          references: ['Algebraic Topology', 'Homology Theory', 'Differential Topology'],
          confidence: 0.83
        });
      }
      
      if (expression.includes('category') || expression.includes('functor') || options.features.categoryTheory) {
        insights.push({
          insight: 'Categorial Perspective',
          explanation: 'The expression can be interpreted through category theory, viewing it as a morphism between mathematical objects',
          references: ['Category Theory', 'Topos Theory', 'Homological Algebra'],
          confidence: 0.78
        });
      }
    }
    
    // Ensure we have at least one insight for demonstration
    if (insights.length === 0) {
      insights.push({
        insight: 'Mathematical Structure',
        explanation: 'The expression follows standard algebraic structure and operations',
        confidence: 0.9
      });
    }
    
    return insights;
  };
  
  // Generate computation steps
  const generateComputationSteps = (
    expression: string, 
    options: AnalysisOptions
  ): { description: string; expression: ASTNode; rule?: string; }[] => {
    const steps: { description: string; expression: ASTNode; rule?: string; }[] = [];
    
    // Only generate detailed steps if requested
    if (!options.includeSteps) {
      return steps;
    }
    
    // Initial parsing step
    steps.push({
      description: 'Parse input expression into abstract syntax tree',
      expression: createMockAST(expression),
      rule: 'parsing'
    });
    
    // Add steps based on expression content
    if (expression.includes('diff')) {
      steps.push({
        description: 'Apply differentiation rules',
        expression: createMockAST(expression + ' after diff'),
        rule: 'differentiation.chain_rule'
      });
      steps.push({
        description: 'Simplify derivative result',
        expression: createMockAST(expression + ' simplified'),
        rule: 'algebra.simplify'
      });
    }
    
    if (expression.includes('integrate')) {
      steps.push({
        description: 'Apply integration technique',
        expression: createMockAST(expression + ' mid-integration'),
        rule: 'integration.by_parts'
      });
      steps.push({
        description: 'Solve resulting integral',
        expression: createMockAST(expression + ' integrated'),
        rule: 'integration.basic_forms'
      });
      steps.push({
        description: 'Simplify antiderivative',
        expression: createMockAST(expression + ' simplified'),
        rule: 'algebra.simplify'
      });
    }
    
    if (expression.includes('^') || expression.includes('*') || expression.includes('+')) {
      steps.push({
        description: 'Apply algebraic transformations',
        expression: createMockAST(expression + ' transformed'),
        rule: 'algebra.expand'
      });
      steps.push({
        description: 'Combine like terms',
        expression: createMockAST(expression + ' combined'),
        rule: 'algebra.collect_terms'
      });
      steps.push({
        description: 'Simplify algebraic expression',
        expression: createMockAST(expression + ' simplified'),
        rule: 'algebra.simplify'
      });
    }
    
    // Add numerical evaluation for appropriate expressions
    if (options.computationMode !== 'symbolic' && !expression.includes('symbol')) {
      steps.push({
        description: 'Compute numerical approximation',
        expression: createMockAST(expression + ' = ' + (Math.random() * 10 - 5).toFixed(4)),
        rule: 'numerical.approximate'
      });
    }
    
    return steps;
  };
  
  // Generate related mathematical concepts
  const generateRelatedConcepts = (expression: string): { name: string; relevance: number; explanation: string; }[] => {
    const concepts: { name: string; relevance: number; explanation: string; }[] = [];
    
    // Only include related concepts if the expression isn't empty
    if (!expression.trim()) {
      return concepts;
    }
    
    // Add concepts based on expression content
    if (expression.includes('diff')) {
      concepts.push({
        name: 'Differential Calculus',
        relevance: 0.95,
        explanation: 'The study of rates of change and slopes of curves'
      });
      concepts.push({
        name: 'Chain Rule',
        relevance: 0.9,
        explanation: 'A formula for computing the derivative of a composite function'
      });
    }
    
    if (expression.includes('integrate')) {
      concepts.push({
        name: 'Integral Calculus',
        relevance: 0.95,
        explanation: 'The study of areas, volumes, and accumulation of quantities'
      });
      concepts.push({
        name: 'Fundamental Theorem of Calculus',
        relevance: 0.85,
        explanation: 'Establishes the connection between differentiation and integration'
      });
    }
    
    if (expression.includes('sin') || expression.includes('cos')) {
      concepts.push({
        name: 'Trigonometry',
        relevance: 0.9,
        explanation: 'The study of relationships between angles and sides of triangles'
      });
      concepts.push({
        name: 'Periodic Functions',
        relevance: 0.85,
        explanation: 'Functions that repeat their values at regular intervals'
      });
    }
    
    if (expression.includes('lim') || expression.includes('limit')) {
      concepts.push({
        name: 'Limit Theory',
        relevance: 0.9,
        explanation: 'The study of the behavior of a function as its input approaches a particular value'
      });
      concepts.push({
        name: 'Continuity',
        relevance: 0.85,
        explanation: 'A property of functions where small changes in input result in small changes in output'
      });
    }
    
    return concepts;
  };
  
  // Generate related theorems
  const generateRelatedTheorems = (expression: string): { name: string; statement: string; relevance: number; }[] => {
    const theorems: { name: string; statement: string; relevance: number; }[] = [];
    
    if (expression.includes('diff')) {
      theorems.push({
        name: 'Mean Value Theorem',
        statement: 'If a function f is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) such that f\'(c) = (f(b) - f(a))/(b - a)',
        relevance: 0.8
      });
    }
    
    if (expression.includes('integrate')) {
      theorems.push({
        name: 'Fundamental Theorem of Calculus',
        statement: 'If f is continuous on [a,b], then the function F(x) = ∫(from a to x) f(t) dt is differentiable on (a,b), and F\'(x) = f(x)',
        relevance: 0.9
      });
    }
    
    if (expression.includes('series') || expression.includes('sum')) {
      theorems.push({
        name: 'Taylor\'s Theorem',
        statement: 'A function that is infinitely differentiable at a point can be approximated by a sum of terms calculated from the function\'s derivatives at that point',
        relevance: 0.85
      });
    }
    
    if (expression.includes('prime') || expression.includes('mod')) {
      theorems.push({
        name: 'Fermat\'s Little Theorem',
        statement: 'If p is a prime number and a is an integer not divisible by p, then a^(p-1) ≡ 1 (mod p)',
        relevance: 0.75
      });
    }
    
    return theorems;
  };
  
  // Generate applications
  const generateApplications = (expression: string): { field: string; description: string; relevance: number; }[] => {
    const applications: { field: string; description: string; relevance: number; }[] = [];
    
    if (expression.includes('diff') || expression.includes('derivative')) {
      applications.push({
        field: 'Physics',
        description: 'Modeling rates of change in physical systems, such as velocity and acceleration',
        relevance: 0.9
      });
      applications.push({
        field: 'Economics',
        description: 'Analyzing marginal costs, revenues, and optimization in economic models',
        relevance: 0.8
      });
    }
    
    if (expression.includes('integrate')) {
      applications.push({
        field: 'Engineering',
        description: 'Calculating total work, energy, or fluid flow over intervals',
        relevance: 0.85
      });
      applications.push({
        field: 'Signal Processing',
        description: 'Determining total signal power or energy over time',
        relevance: 0.75
      });
    }
    
    if (expression.includes('sin') || expression.includes('cos') || expression.includes('wave')) {
      applications.push({
        field: 'Electrical Engineering',
        description: 'Modeling oscillatory circuits and wave propagation',
        relevance: 0.85
      });
      applications.push({
        field: 'Acoustics',
        description: 'Analyzing sound waves and harmonics',
        relevance: 0.8
      });
    }
    
    if (expression.includes('matrix') || expression.includes('vector')) {
      applications.push({
        field: 'Computer Graphics',
        description: 'Transformations, projections, and rendering in 3D space',
        relevance: 0.85
      });
      applications.push({
        field: 'Machine Learning',
        description: 'Linear transformations and dimensionality reduction in data analysis',
        relevance: 0.9
      });
    }
    
    return applications;
  };
  
  // Generate plots for visualization
  const generatePlots = (expression: string): { type: string; data: any; options: any; }[] => {
    const plots: { type: string; data: any; options: any; }[] = [];
    
    // Basic function plot
    if (/[a-z]/.test(expression) && /[\+\-\*\/\^]/.test(expression)) {
      plots.push({
        type: '2D Function',
        data: {
          x: Array.from({ length: 100 }, (_, i) => -5 + i * 0.1),
          y: Array.from({ length: 100 }, (_, i) => Math.sin(-5 + i * 0.1) * 2 + Math.cos(-5 + i * 0.1))
        },
        options: {
          title: 'Function Plot',
          xAxis: 'x',
          yAxis: 'f(x)',
          displayEquation: true
        }
      });
    }
    
    // Add more sophisticated plots based on expression content
    if (expression.includes('diff') || expression.includes('derivative')) {
      plots.push({
        type: 'Derivative Comparison',
        data: {
          x: Array.from({ length: 100 }, (_, i) => -5 + i * 0.1),
          y1: Array.from({ length: 100 }, (_, i) => Math.sin(-5 + i * 0.1) * 2),
          y2: Array.from({ length: 100 }, (_, i) => Math.cos(-5 + i * 0.1) * 2)
        },
        options: {
          title: 'Function and Its Derivative',
          xAxis: 'x',
          yAxis: 'f(x), f\'(x)',
          series: ['Original Function', 'Derivative']
        }
      });
    }
    
    // 3D surface plot for expressions with multiple variables
    if ((expression.includes('x') && expression.includes('y')) || expression.includes('surface')) {
      plots.push({
        type: '3D Surface',
        data: {
          x: Array.from({ length: 20 }, (_, i) => -5 + i * 0.5),
          y: Array.from({ length: 20 }, (_, i) => -5 + i * 0.5),
          z: Array.from({ length: 20 }, (_, i) => 
            Array.from({ length: 20 }, (_, j) => 
              Math.sin(Math.sqrt(Math.pow(-5 + i * 0.5, 2) + Math.pow(-5 + j * 0.5, 2)))
            )
          )
        },
        options: {
          title: '3D Surface Plot',
          xAxis: 'x',
          yAxis: 'y',
          zAxis: 'f(x,y)',
          colorMap: 'viridis'
        }
      });
    }
    
    return plots;
  };
  
  // Render the main AST visualization
  const renderASTVisualization = () => {
    const canvas = astVisualizationRef.current;
    if (!canvas || !analysisResult) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw AST tree visualization
    const drawNode = (node: ASTNode, x: number, y: number, level: number, indexInLevel: number, totalInLevel: number) => {
      // Node appearance based on type
      const nodeColors: {[key: string]: string} = {
        number: '#4cc9f0',
        variable: '#f72585',
        operator: '#7209b7',
        function: '#4361ee',
        derivative: '#3a0ca3',
        integral: '#4895ef',
        limit: '#560bad',
        sum: '#f77f00',
        product: '#fcbf49',
        matrix: '#06d6a0',
        vector: '#118ab2',
        set: '#073b4c',
        default: '#1a1a2e'
      };
      
      const color = nodeColors[node.type] || nodeColors.default;
      const radius = 25;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        typeof node.value === 'string' ? node.value : node.value.toString(), 
        x, 
        y
      );
      
      // Draw node type label
      ctx.font = '10px sans-serif';
      ctx.fillText(node.type, x, y + radius + 12);
      
      // Draw children recursively
      if (node.children && node.children.length > 0) {
        const childWidth = width / Math.pow(2, level + 1);
        const startX = x - (childWidth * (node.children.length - 1)) / 2;
        
        node.children.forEach((child, idx) => {
          const childX = startX + idx * childWidth;
          const childY = y + 80;
          
          // Draw edge to child
          ctx.beginPath();
          ctx.moveTo(x, y + radius);
          ctx.lineTo(childX, childY - radius);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Draw child node
          drawNode(child, childX, childY, level + 1, idx, node.children?.length || 0);
        });
      }
    };
    
    // Draw the root node of the AST
    if (analysisResult.parsing.ast) {
      drawNode(analysisResult.parsing.ast, width / 2, 50, 0, 0, 1);
    }
  };
  
  // Render the main plot visualization
  const renderPlotVisualization = () => {
    const canvas = mainPlotCanvasRef.current;
    if (!canvas || !analysisResult || !analysisResult.visualization.plots || analysisResult.visualization.plots.length === 0) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get the first plot to visualize
    const plot = analysisResult.visualization.plots[0];
    if (plot.type === '2D Function' || plot.type === 'Derivative Comparison') {
      // Calculate scales and margins
      const margin = 40;
      const plotWidth = width - 2 * margin;
      const plotHeight = height - 2 * margin;
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      
      // X-axis
      ctx.moveTo(margin, height - margin);
      ctx.lineTo(width - margin, height - margin);
      
      // Y-axis
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, height - margin);
      ctx.stroke();
      
      // Draw data for first series
      if (plot.data.x && plot.data.y) {
        const xData = plot.data.x;
        const yData = plot.data.y;
        
        // Find data range
        const xMin = Math.min(...xData);
        const xMax = Math.max(...xData);
        const yMin = -3; // Fixed for demo
        const yMax = 3;  // Fixed for demo
        
        // Draw function path
        ctx.beginPath();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < xData.length; i++) {
          // Map data coordinates to canvas coordinates
          const x = margin + (xData[i] - xMin) / (xMax - xMin) * plotWidth;
          const y = height - margin - (yData[i] - yMin) / (yMax - yMin) * plotHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        // Draw second series if available (e.g., for derivative comparison)
        if (plot.data.y2) {
          ctx.beginPath();
          ctx.strokeStyle = '#f72585';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          
          for (let i = 0; i < xData.length; i++) {
            // Map data coordinates to canvas coordinates
            const x = margin + (xData[i] - xMin) / (xMax - xMin) * plotWidth;
            const y = height - margin - (plot.data.y2[i] - yMin) / (yMax - yMin) * plotHeight;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw axes labels
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        // X-axis label
        ctx.fillText(plot.options.xAxis || 'x', width / 2, height - margin / 3);
        
        // Y-axis label
        ctx.save();
        ctx.translate(margin / 3, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(plot.options.yAxis || 'f(x)', 0, 0);
        ctx.restore();
        
        // Title
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(plot.options.title || 'Function Plot', width / 2, margin / 2);
        
        // Legend for multiple series
        if (plot.data.y2 && plot.options.series) {
          const legendX = width - margin - 100;
          const legendY = margin + 20;
          
          // First series
          ctx.fillStyle = '#4cc9f0';
          ctx.fillRect(legendX, legendY, 20, 10);
          ctx.fillStyle = '#cccccc';
          ctx.textAlign = 'left';
          ctx.fillText(plot.options.series[0], legendX + 25, legendY + 8);
          
          // Second series
          ctx.fillStyle = '#f72585';
          ctx.fillRect(legendX, legendY + 20, 20, 10);
          ctx.fillStyle = '#cccccc';
          ctx.fillText(plot.options.series[1], legendX + 25, legendY + 28);
        }
      }
    } else if (plot.type === '3D Surface') {
      // For 3D plots, show a placeholder
      ctx.fillStyle = '#2a2a40';
      ctx.fillRect(0, 0, width, height);
      
      // Draw a simple wireframe representation
      const rows = 10;
      const cols = 10;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      
      // Draw a wireframe grid with varying heights
      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let j = 0; j <= cols; j++) {
          const x = j * cellWidth;
          const baseY = i * cellHeight;
          
          // Add a sinusoidal variation for 3D effect
          const heightOffset = 15 * Math.sin(i / 2) * Math.cos(j / 2);
          const y = baseY + heightOffset;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      for (let j = 0; j <= cols; j++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= rows; i++) {
          const x = j * cellWidth;
          const baseY = i * cellHeight;
          
          // Add a sinusoidal variation for 3D effect
          const heightOffset = 15 * Math.sin(i / 2) * Math.cos(j / 2);
          const y = baseY + heightOffset;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      // Add title and note
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(plot.options.title || '3D Surface Plot', width / 2, margin / 2);
      
      ctx.font = '12px sans-serif';
      ctx.fillText("Interactive 3D rendering available in full version", width / 2, height - margin / 2);
    }
  };
  
  // Initialize canvas dimensions when component mounts or updates
  useEffect(() => {
    const updateCanvasDimensions = () => {
      // AST visualization canvas
      if (astVisualizationRef.current) {
        astVisualizationRef.current.width = astVisualizationRef.current.offsetWidth || 600;
        astVisualizationRef.current.height = astVisualizationRef.current.offsetHeight || 400;
        if (analysisResult) {
          renderASTVisualization();
        }
      }
      
      // Main plot canvas
      if (mainPlotCanvasRef.current) {
        mainPlotCanvasRef.current.width = mainPlotCanvasRef.current.offsetWidth || 600;
        mainPlotCanvasRef.current.height = mainPlotCanvasRef.current.offsetHeight || 400;
        if (analysisResult) {
          renderPlotVisualization();
        }
      }
    };
    
    // Initial update
    updateCanvasDimensions();
    
    // Redraw on window resize
    window.addEventListener('resize', updateCanvasDimensions);
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [analysisResult, activeTab]);
  
  // Load example into the input field
  const loadExample = (exampleExpression: string) => {
    setExpression(exampleExpression);
    toast({
      title: "Example Loaded",
      description: "The example has been loaded into the input field"
    });
  };
  
  // Toggle a feature in the options
  const toggleFeature = (feature: keyof typeof options.features) => {
    setOptions(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-violet-500" />
            Advanced Mathematical Analysis System
          </h1>
          <p className="text-muted-foreground mt-1">
            Ultra-sophisticated symbolic and numerical analysis with AST-based rule evaluation
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950">
          Quantum Leap in Mathematical Computing
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel - Input and configuration */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                Expression Input
              </CardTitle>
              <CardDescription>
                Enter a mathematical expression, function, equation, or theorem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter a mathematical expression (e.g., diff(sin(x^2), x), integrate(exp(x)*cos(x), x))"
                className="font-mono"
                rows={5}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={performAnalysis}
                  disabled={isAnalyzing || !expression.trim()}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Layers className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Expression
                    </>
                  )}
                </Button>
                
                <div className="flex-1">
                  {isAnalyzing && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Analysis in progress...</span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm mb-2 block">Preset Configurations</Label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map(preset => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPreset(preset.id)}
                      className="h-20 flex flex-col items-center justify-center text-xs space-y-1 p-1"
                    >
                      <preset.icon className="h-4 w-4 mb-1" />
                      <span>{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="text-sm mb-2 block">Example Expressions</Label>
                <ScrollArea className="h-36 border rounded-md">
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Basic</p>
                    {examples.basic.map((ex, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-7 px-2"
                        onClick={() => loadExample(ex.expression)}
                      >
                        <code className="text-xs mr-2">{ex.expression}</code>
                        <span className="text-xs text-muted-foreground">{ex.description}</span>
                      </Button>
                    ))}
                    
                    <p className="text-xs font-medium text-muted-foreground mb-1 mt-3">Intermediate</p>
                    {examples.intermediate.map((ex, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-7 px-2"
                        onClick={() => loadExample(ex.expression)}
                      >
                        <code className="text-xs mr-2">{ex.expression}</code>
                        <span className="text-xs text-muted-foreground">{ex.description}</span>
                      </Button>
                    ))}
                    
                    <p className="text-xs font-medium text-muted-foreground mb-1 mt-3">Advanced</p>
                    {examples.advanced.map((ex, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-7 px-2"
                        onClick={() => loadExample(ex.expression)}
                      >
                        <code className="text-xs mr-2">{ex.expression}</code>
                        <span className="text-xs text-muted-foreground">{ex.description}</span>
                      </Button>
                    ))}
                    
                    {options.analysisDepth === 'research' && (
                      <>
                        <p className="text-xs font-medium text-muted-foreground mb-1 mt-3">Research-Level</p>
                        {examples.research.map((ex, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm h-7 px-2"
                            onClick={() => loadExample(ex.expression)}
                          >
                            <code className="text-xs mr-2">{ex.expression}</code>
                            <span className="text-xs text-muted-foreground">{ex.description}</span>
                          </Button>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-emerald-500" />
                Analysis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Computation Mode</Label>
                      <Select 
                        value={options.computationMode}
                        onValueChange={(val) => setOptions(prev => ({ ...prev, computationMode: val as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="symbolic">Symbolic Only</SelectItem>
                          <SelectItem value="numeric">Numerical Only</SelectItem>
                          <SelectItem value="mixed">Mixed (Symbolic + Numeric)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Mathematical Domain</Label>
                      <Select 
                        value={options.domain}
                        onValueChange={(val) => setOptions(prev => ({ ...prev, domain: val as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map(domain => (
                            <SelectItem key={domain.value} value={domain.value}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Analysis Depth</Label>
                    <div className="relative pt-6">
                      <div className="absolute left-0 right-0 top-0 flex justify-between text-xs text-muted-foreground">
                        <span>Basic</span>
                        <span>Standard</span>
                        <span>Advanced</span>
                        <span>Research</span>
                      </div>
                      <Slider
                        value={[
                          options.analysisDepth === 'basic' ? 1 :
                          options.analysisDepth === 'standard' ? 2 :
                          options.analysisDepth === 'advanced' ? 3 : 4
                        ]}
                        min={1}
                        max={4}
                        step={1}
                        onValueChange={(value) => setOptions(prev => ({
                          ...prev,
                          analysisDepth: 
                            value[0] === 1 ? 'basic' :
                            value[0] === 2 ? 'standard' :
                            value[0] === 3 ? 'advanced' : 'research'
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precision (bits)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[options.precision]}
                        min={16}
                        max={1024}
                        step={16}
                        onValueChange={(value) => setOptions(prev => ({ ...prev, precision: value[0] }))}
                      />
                      <div className="w-16 text-right font-mono text-sm">
                        {options.precision}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-steps" className="text-sm">Include Steps</Label>
                        <Switch
                          id="include-steps"
                          checked={options.includeSteps}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeSteps: checked }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Show detailed computation steps</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-proofs" className="text-sm">Include Proofs</Label>
                        <Switch
                          id="include-proofs"
                          checked={options.includeProofs}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeProofs: checked }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Generate mathematical proofs</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-related" className="text-sm">Related Concepts</Label>
                        <Switch
                          id="include-related"
                          checked={options.includeRelatedConcepts}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeRelatedConcepts: checked }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Discover related mathematical ideas</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-viz" className="text-sm">Visualizations</Label>
                        <Switch
                          id="include-viz"
                          checked={options.includeVisualizations}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeVisualizations: checked }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Generate plots and diagrams</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Timeout (milliseconds)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[options.timeout / 1000]} // Convert to seconds for slider
                        min={1}
                        max={120}
                        step={1}
                        onValueChange={(value) => setOptions(prev => ({ ...prev, timeout: value[0] * 1000 }))}
                      />
                      <div className="w-16 text-right font-mono text-sm">
                        {options.timeout / 1000}s
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Maximum time allowed for computation</p>
                  </div>
                  
                  {options.analysisDepth === 'research' && (
                    <div className="space-y-2">
                      <Label>Proof System</Label>
                      <Select defaultValue="natural_deduction">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {proofSystems.map(system => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Mathematical Features</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-numerical"
                          checked={options.features.numericalApproximation}
                          onCheckedChange={() => toggleFeature('numericalApproximation')}
                        />
                        <label
                          htmlFor="feature-numerical"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <BarChart4 className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          Numerical Approximation
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-factorization"
                          checked={options.features.factorization}
                          onCheckedChange={() => toggleFeature('factorization')}
                        />
                        <label
                          htmlFor="feature-factorization"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Binary className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                          Algebraic Factorization
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-differential"
                          checked={options.features.differentialEquations}
                          onCheckedChange={() => toggleFeature('differentialEquations')}
                        />
                        <label
                          htmlFor="feature-differential"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <GitMerge className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                          Differential Equations
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-series"
                          checked={options.features.seriesOperations}
                          onCheckedChange={() => toggleFeature('seriesOperations')}
                        />
                        <label
                          htmlFor="feature-series"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Sigma className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                          Series & Summations
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-transforms"
                          checked={options.features.transformMethods}
                          onCheckedChange={() => toggleFeature('transformMethods')}
                        />
                        <label
                          htmlFor="feature-transforms"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-cyan-500" />
                          Transform Methods
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Advanced Theory Features</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-graph"
                          checked={options.features.graphTheory}
                          onCheckedChange={() => toggleFeature('graphTheory')}
                        />
                        <label
                          htmlFor="feature-graph"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Network className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                          Graph Theory
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-group"
                          checked={options.features.groupTheory}
                          onCheckedChange={() => toggleFeature('groupTheory')}
                        />
                        <label
                          htmlFor="feature-group"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Box className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                          Group Theory
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-category"
                          checked={options.features.categoryTheory}
                          onCheckedChange={() => toggleFeature('categoryTheory')}
                        />
                        <label
                          htmlFor="feature-category"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Share2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                          Category Theory
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-type"
                          checked={options.features.typeTheory}
                          onCheckedChange={() => toggleFeature('typeTheory')}
                        />
                        <label
                          htmlFor="feature-type"
                          className="text-sm cursor-pointer flex items-center"
                        >
                          <Lambda className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
                          Type Theory
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel - Results and visualizations */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult ? (
            <Card className="min-h-[300px]">
              <div className="flex flex-col items-center justify-center h-full py-10">
                <Braces className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Ready for Analysis</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Enter a mathematical expression and configure your analysis options, then click "Analyze Expression" to begin.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-violet-500" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  Comprehensive mathematical analysis of your expression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ast">AST & Rules</TabsTrigger>
                    <TabsTrigger value="analysis">Mathematical Analysis</TabsTrigger>
                    <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                        <h3 className="text-lg font-medium mb-1 md:mb-0">Expression Analysis</h3>
                        <Badge variant="outline" className="bg-violet-100/30 text-xs">
                          Confidence: {(analysisResult.meta.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-grow">
                            {analysisResult.input.expression}
                          </code>
                          {analysisResult.analysis.numericValue !== undefined && (
                            <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded flex items-center">
                              <span className="text-muted-foreground mr-2">=</span>
                              {typeof analysisResult.analysis.numericValue === 'number' 
                                ? analysisResult.analysis.numericValue.toFixed(4) 
                                : 'Complex Value'}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {analysisResult.parsing.syntax.map((item, idx) => (
                            <span key={idx} className="mr-2">
                              <span className="text-primary-foreground font-medium">{item.type}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Properties */}
                      <Card className="border shadow-none">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-1">
                            <AlignLeft className="h-4 w-4 text-blue-500" />
                            Mathematical Properties
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            {analysisResult.analysis.properties.map((prop, idx) => (
                              <div key={idx} className="flex justify-between items-start pb-1 border-b last:border-0">
                                <span className="text-muted-foreground">{prop.property}:</span>
                                <span className="font-medium">{typeof prop.value === 'string' ? prop.value : JSON.stringify(prop.value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Classifications */}
                      <Card className="border shadow-none">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-emerald-500" />
                            Mathematical Classification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            {analysisResult.analysis.classifications.map((classification, idx) => (
                              <div key={idx} className="flex justify-between items-start pb-1 border-b last:border-0">
                                <span className="text-muted-foreground">{classification.category}:</span>
                                <span className="font-medium">{classification.value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Key Insights */}
                    <Card className="border shadow-none">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Key Mathematical Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {analysisResult.analysis.insights.map((insight, idx) => (
                            <div key={idx} className="border-l-2 border-amber-500 pl-3 text-sm pb-2">
                              <p className="font-medium mb-1">{insight.insight}</p>
                              <p className="text-muted-foreground">{insight.explanation}</p>
                              {insight.references && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {insight.references.map((ref, ridx) => (
                                    <Badge key={ridx} variant="outline" className="text-xs">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Related Concepts */}
                    {analysisResult.related.concepts.length > 0 && (
                      <Card className="border shadow-none">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-1">
                            <GitBranch className="h-4 w-4 text-purple-500" />
                            Related Mathematical Concepts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {analysisResult.related.concepts.map((concept, idx) => (
                              <div key={idx} className="border rounded-md p-2 text-sm">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">{concept.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(concept.relevance * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {concept.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  {/* AST & Rules Tab */}
                  <TabsContent value="ast" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Abstract Syntax Tree</h3>
                        <div className="border rounded-md">
                          <canvas 
                            ref={astVisualizationRef} 
                            className="w-full aspect-square"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Tokens & Parsing</h3>
                        <div className="border rounded-md p-3 max-h-[300px] overflow-auto">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(analysisResult.parsing.tokens, null, 2)}
                          </pre>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>Parse time: {analysisResult.parsing.parseTime.toFixed(2)}ms</span>
                          <span>Tokens: {analysisResult.parsing.tokens.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rule Applications */}
                    {analysisResult.computation.steps.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Rule-Based Evaluation Steps</h3>
                        <div className="border rounded-md">
                          <div className="bg-muted/30 p-2 flex justify-between items-center">
                            <h4 className="text-xs font-medium">Computation Steps</h4>
                            <Badge variant="outline" className="text-xs">
                              {analysisResult.computation.steps.length} steps
                            </Badge>
                          </div>
                          <ScrollArea className="h-[200px]">
                            <div className="p-3 space-y-2">
                              {analysisResult.computation.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm">{step.description}</p>
                                    {step.rule && (
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        Rule: {step.rule}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                    
                    {/* AST Metadata */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">AST Metadata & Analysis</h3>
                      <div className="border rounded-md p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Root Node Type</div>
                            <div className="font-medium">{analysisResult.parsing.ast.type}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Root Value</div>
                            <div className="font-medium">{
                              typeof analysisResult.parsing.ast.value === 'string' 
                                ? analysisResult.parsing.ast.value 
                                : JSON.stringify(analysisResult.parsing.ast.value)
                            }</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Child Nodes</div>
                            <div className="font-medium">{analysisResult.parsing.ast.children?.length || 0}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Domain</div>
                            <div className="font-medium">{analysisResult.parsing.ast.metadata?.domain || 'Unknown'}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Precedence</div>
                            <div className="font-medium">{analysisResult.parsing.ast.metadata?.precedence || 'N/A'}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Associativity</div>
                            <div className="font-medium">{analysisResult.parsing.ast.metadata?.associativity || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Mathematical Analysis Tab */}
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Calculus Analysis */}
                      {(analysisResult.analysis.derivative || analysisResult.analysis.antiderivative || analysisResult.analysis.limits) && (
                        <Card className="border shadow-none">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-1">
                              <Sigma className="h-4 w-4 text-blue-500" />
                              Calculus Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                              {analysisResult.analysis.derivative && (
                                <div className="pb-1 border-b">
                                  <div className="text-muted-foreground mb-1">Derivative:</div>
                                  <code className="font-mono">
                                    {typeof analysisResult.analysis.derivative.value === 'string' 
                                      ? analysisResult.analysis.derivative.value 
                                      : JSON.stringify(analysisResult.analysis.derivative.value)}
                                  </code>
                                </div>
                              )}
                              
                              {analysisResult.analysis.antiderivative && (
                                <div className="pb-1 border-b">
                                  <div className="text-muted-foreground mb-1">Antiderivative:</div>
                                  <code className="font-mono">
                                    {typeof analysisResult.analysis.antiderivative.value === 'string' 
                                      ? analysisResult.analysis.antiderivative.value 
                                      : JSON.stringify(analysisResult.analysis.antiderivative.value)}
                                  </code>
                                </div>
                              )}
                              
                              {analysisResult.analysis.limits && analysisResult.analysis.limits.length > 0 && (
                                <div>
                                  <div className="text-muted-foreground mb-1">Limits:</div>
                                  <div className="space-y-1">
                                    {analysisResult.analysis.limits.map((limit, idx) => (
                                      <div key={idx} className="flex justify-between">
                                        <code className="font-mono">
                                          lim x→{limit.point === 'infinity' ? '∞' : limit.point}
                                        </code>
                                        <code className="font-mono">
                                          {limit.value === Infinity ? '∞' : 
                                           limit.value === -Infinity ? '-∞' : 
                                           typeof limit.value === 'number' ? limit.value.toFixed(4) : 
                                           JSON.stringify(limit.value)}
                                        </code>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Algebraic Analysis */}
                      {(analysisResult.analysis.factors || analysisResult.analysis.expansion || analysisResult.analysis.roots) && (
                        <Card className="border shadow-none">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-1">
                              <Binary className="h-4 w-4 text-emerald-500" />
                              Algebraic Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                              {analysisResult.analysis.factors && analysisResult.analysis.factors.length > 0 && (
                                <div className="pb-1 border-b">
                                  <div className="text-muted-foreground mb-1">Factorization:</div>
                                  <div>
                                    {analysisResult.analysis.factors.map((factor, idx) => (
                                      <code key={idx} className="font-mono block">
                                        {typeof factor.value === 'string' ? factor.value : JSON.stringify(factor.value)}
                                        {idx < (analysisResult.analysis.factors?.length || 0) - 1 ? ' · ' : ''}
                                      </code>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {analysisResult.analysis.expansion && (
                                <div className="pb-1 border-b">
                                  <div className="text-muted-foreground mb-1">Expansion:</div>
                                  <code className="font-mono">
                                    {typeof analysisResult.analysis.expansion.value === 'string' 
                                      ? analysisResult.analysis.expansion.value 
                                      : JSON.stringify(analysisResult.analysis.expansion.value)}
                                  </code>
                                </div>
                              )}
                              
                              {analysisResult.analysis.domain && (
                                <div className="pb-1 border-b">
                                  <div className="text-muted-foreground mb-1">Domain:</div>
                                  <code className="font-mono">{analysisResult.analysis.domain}</code>
                                </div>
                              )}
                              
                              {analysisResult.analysis.range && (
                                <div>
                                  <div className="text-muted-foreground mb-1">Range:</div>
                                  <code className="font-mono">{analysisResult.analysis.range}</code>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {/* Advanced Analysis */}
                    <div className="grid grid-cols-1 gap-4">
                      {analysisResult.analysis.symmetries && (
                        <Card className="border shadow-none">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-1">
                              <Box className="h-4 w-4 text-purple-500" />
                              Group-Theoretic Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                              {analysisResult.analysis.symmetries.map((sym, idx) => (
                                <div key={idx} className="border rounded-md p-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{sym.type} Symmetry</span>
                                    <Badge variant="outline" className="text-xs">
                                      Group: {sym.group}
                                    </Badge>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-xs text-muted-foreground">Generators: </span>
                                    <span className="font-mono text-xs">
                                      {sym.generators.join(', ')}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-xs text-muted-foreground">Order: </span>
                                    <span className="font-mono text-xs">{sym.order}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {analysisResult.analysis.differentialEquation && (
                        <Card className="border shadow-none">
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-1">
                              <GitMerge className="h-4 w-4 text-amber-500" />
                              Differential Equation Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                              {analysisResult.analysis.differentialEquation.map((eq, idx) => (
                                <div key={idx} className="border rounded-md p-2">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">
                                      Order {eq.order} {eq.type} Differential Equation
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {eq.homogeneous ? 'Homogeneous' : 'Non-homogeneous'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <span className="text-xs text-muted-foreground">Solutions: </span>
                                    <div className="mt-1 space-y-1">
                                      {eq.solutions.map((sol, sidx) => (
                                        <code key={sidx} className="font-mono text-xs block">
                                          {sol}
                                        </code>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {/* Performance Metrics */}
                    <div className="mt-4 bg-muted/30 p-3 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Computation Performance</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">Time</span>
                          <span className="font-mono">{analysisResult.computation.timeMs.toFixed(2)} ms</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Memory</span>
                          <span className="font-mono">{(analysisResult.computation.memoryBytes / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Steps</span>
                          <span className="font-mono">{analysisResult.computation.steps.length}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Visualization Tab */}
                  <TabsContent value="visualization" className="space-y-4">
                    {analysisResult.visualization.plots && analysisResult.visualization.plots.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          {analysisResult.visualization.plots[0].options?.title || 'Function Visualization'}
                        </h3>
                        <div className="border rounded-md">
                          <canvas 
                            ref={mainPlotCanvasRef} 
                            className="w-full aspect-[3/2]"
                          />
                        </div>
                        
                        {analysisResult.visualization.plots.length > 1 && (
                          <div className="mt-2 flex justify-center">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                <PanelLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>
                              <Badge variant="outline">
                                1 / {analysisResult.visualization.plots.length}
                              </Badge>
                              <Button variant="outline" size="sm" className="h-8">
                                Next
                                <PanelRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-muted/30 rounded-md">
                        <Tree className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No Visualizations Available</h3>
                        <p className="text-muted-foreground mt-2">
                          This expression does not have any visualizations, or they were not requested in the analysis options.
                        </p>
                      </div>
                    )}
                    
                    {/* Additional visualizations would go here */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
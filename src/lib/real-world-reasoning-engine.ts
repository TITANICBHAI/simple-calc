/**
 * Real-World Reasoning Engine
 * Advanced reasoning for practical problems beyond pure mathematics
 */

import { evaluate } from 'mathjs';
import { SmartErrorCorrector } from './smart-error-correction';

export interface RealWorldProblem {
  domain: string;
  context: string;
  variables: Record<string, any>;
  constraints: string[];
  objectives: string[];
}

export interface ReasoningStep {
  step: number;
  category: 'analysis' | 'research' | 'calculation' | 'evaluation' | 'recommendation';
  title: string;
  reasoning: string;
  evidence: string[];
  assumptions: string[];
  confidence: number;
  alternatives?: string[];
}

export interface RealWorldSolution {
  problem: string;
  domain: string;
  analysis: ReasoningStep[];
  recommendations: string[];
  calculations: Record<string, any>;
  riskFactors: string[];
  nextSteps: string[];
  confidence: number;
}

export class RealWorldReasoningEngine {

  /**
   * Analyze real-world problems with comprehensive reasoning
   */
  static async analyzeRealWorldProblem(problem: string): Promise<RealWorldSolution> {
    const domain = this.identifyDomain(problem);
    const context = this.extractContext(problem);
    const analysis = await this.performAnalysis(problem, domain, context);
    
    return {
      problem,
      domain,
      analysis,
      recommendations: this.generateRecommendations(analysis, domain),
      calculations: this.performRelevantCalculations(problem, domain),
      riskFactors: this.identifyRisks(domain, context),
      nextSteps: this.suggestNextSteps(domain, analysis),
      confidence: this.calculateOverallConfidence(analysis)
    };
  }

  /**
   * Identify the domain of the problem
   */
  private static identifyDomain(problem: string): string {
    const lower = problem.toLowerCase();
    
    const domainPatterns = [
      { keywords: ['money', 'budget', 'investment', 'loan', 'profit', 'cost', 'price', 'finance'], domain: 'Financial Planning' },
      { keywords: ['health', 'bmi', 'calories', 'exercise', 'diet', 'medicine', 'medical'], domain: 'Health & Wellness' },
      { keywords: ['business', 'marketing', 'sales', 'revenue', 'customers', 'strategy'], domain: 'Business Strategy' },
      { keywords: ['engineering', 'design', 'build', 'construct', 'materials', 'structure'], domain: 'Engineering & Design' },
      { keywords: ['time', 'schedule', 'productivity', 'efficiency', 'planning', 'deadline'], domain: 'Time Management' },
      { keywords: ['education', 'learning', 'study', 'grade', 'course', 'exam'], domain: 'Education & Learning' },
      { keywords: ['data', 'statistics', 'analysis', 'trends', 'research', 'study'], domain: 'Data Analysis' },
      { keywords: ['environment', 'energy', 'sustainability', 'carbon', 'green', 'eco'], domain: 'Environmental Science' },
      { keywords: ['travel', 'distance', 'speed', 'route', 'transportation'], domain: 'Travel & Transportation' },
      { keywords: ['cooking', 'recipe', 'ingredients', 'nutrition', 'food'], domain: 'Culinary Arts' }
    ];

    for (const pattern of domainPatterns) {
      if (pattern.keywords.some(keyword => lower.includes(keyword))) {
        return pattern.domain;
      }
    }

    return 'General Problem Solving';
  }

  /**
   * Extract contextual information from the problem
   */
  private static extractContext(problem: string): string {
    const sentences = problem.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Look for context clues
    const contextIndicators = [
      'because', 'since', 'due to', 'as a result of', 'given that', 
      'considering', 'in order to', 'so that', 'for the purpose of'
    ];
    
    let context = '';
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (contextIndicators.some(indicator => lower.includes(indicator))) {
        context += sentence + '. ';
      }
    }
    
    return context.trim() || 'Limited context provided';
  }

  /**
   * Perform comprehensive analysis with reasoning steps
   */
  private static async performAnalysis(problem: string, domain: string, context: string): Promise<ReasoningStep[]> {
    const steps: ReasoningStep[] = [];
    
    // Step 1: Problem Understanding
    steps.push({
      step: 1,
      category: 'analysis',
      title: 'Problem Understanding & Scope Definition',
      reasoning: `This appears to be a ${domain} problem. Understanding the core issue is crucial for effective solution development.`,
      evidence: [`Domain identified as: ${domain}`, `Context: ${context}`],
      assumptions: ['Problem statement contains sufficient information', 'Standard domain practices apply'],
      confidence: 0.85
    });

    // Step 2: Domain-specific analysis
    const domainAnalysis = this.getDomainSpecificAnalysis(problem, domain);
    steps.push({
      step: 2,
      category: 'research',
      title: `${domain} Domain Analysis`,
      reasoning: domainAnalysis.reasoning,
      evidence: domainAnalysis.evidence,
      assumptions: domainAnalysis.assumptions,
      confidence: domainAnalysis.confidence,
      alternatives: domainAnalysis.alternatives
    });

    // Step 3: Quantitative Analysis
    const quantAnalysis = this.performQuantitativeAnalysis(problem, domain);
    if (quantAnalysis) {
      steps.push({
        step: 3,
        category: 'calculation',
        title: 'Quantitative Analysis',
        reasoning: quantAnalysis.reasoning,
        evidence: quantAnalysis.evidence,
        assumptions: quantAnalysis.assumptions,
        confidence: quantAnalysis.confidence
      });
    }

    // Step 4: Risk Assessment
    steps.push({
      step: 4,
      category: 'evaluation',
      title: 'Risk Assessment & Constraints',
      reasoning: `Every real-world solution carries risks and operates within constraints. Identifying these helps ensure practical feasibility.`,
      evidence: this.identifyRisks(domain, context),
      assumptions: ['Standard risk factors apply', 'Constraints are reasonable'],
      confidence: 0.80
    });

    return steps;
  }

  /**
   * Get domain-specific analysis
   */
  private static getDomainSpecificAnalysis(problem: string, domain: string): any {
    const baseAnalysis = {
      reasoning: '',
      evidence: [] as string[],
      assumptions: [] as string[],
      confidence: 0.75,
      alternatives: [] as string[]
    };

    switch (domain) {
      case 'Financial Planning':
        return {
          ...baseAnalysis,
          reasoning: 'Financial problems require consideration of time value of money, risk tolerance, and regulatory constraints.',
          evidence: [
            'Financial decisions have long-term implications',
            'Risk-return tradeoffs must be evaluated',
            'Tax implications should be considered'
          ],
          assumptions: [
            'Stable economic conditions',
            'Access to financial markets',
            'Rational decision-making'
          ],
          alternatives: [
            'Conservative approach with lower risk',
            'Aggressive approach with higher potential returns',
            'Balanced portfolio strategy'
          ]
        };

      case 'Health & Wellness':
        return {
          ...baseAnalysis,
          reasoning: 'Health decisions require evidence-based approaches, individual considerations, and professional medical guidance.',
          evidence: [
            'Individual health factors vary significantly',
            'Medical research provides guidelines',
            'Professional supervision often required'
          ],
          assumptions: [
            'No serious underlying health conditions',
            'Access to healthcare professionals',
            'Compliance with recommendations'
          ],
          alternatives: [
            'Gradual lifestyle changes',
            'Professional supervised program',
            'Self-directed approach with monitoring'
          ]
        };

      case 'Business Strategy':
        return {
          ...baseAnalysis,
          reasoning: 'Business decisions require market analysis, competitive assessment, and resource allocation optimization.',
          evidence: [
            'Market conditions affect business success',
            'Competition influences strategy',
            'Resource constraints limit options'
          ],
          assumptions: [
            'Market demand exists',
            'Sufficient resources available',
            'Competitive advantage achievable'
          ],
          alternatives: [
            'Market penetration strategy',
            'Product differentiation approach',
            'Cost leadership strategy'
          ]
        };

      default:
        return {
          ...baseAnalysis,
          reasoning: 'This problem requires systematic analysis, data gathering, and evidence-based decision making.',
          evidence: [
            'Multiple factors likely influence the outcome',
            'Best practices in problem-solving apply',
            'Iterative refinement may be needed'
          ],
          assumptions: [
            'Information provided is accurate',
            'Standard approaches are applicable',
            'Solution can be implemented'
          ]
        };
    }
  }

  /**
   * Perform quantitative analysis if applicable
   */
  private static performQuantitativeAnalysis(problem: string, domain: string): any | null {
    // Extract numbers from the problem
    const numbers = problem.match(/\d+\.?\d*/g);
    if (!numbers || numbers.length === 0) {
      return null;
    }

    const calculations: any = {};
    
    // Perform domain-specific calculations
    switch (domain) {
      case 'Financial Planning':
        if (numbers.length >= 3) {
          const principal = parseFloat(numbers[0]);
          const rate = parseFloat(numbers[1]) / 100;
          const time = parseFloat(numbers[2]);
          
          calculations.simpleInterest = principal * rate * time;
          calculations.compoundInterest = principal * Math.pow(1 + rate, time) - principal;
          calculations.futureValue = principal * Math.pow(1 + rate, time);
        }
        break;

      case 'Health & Wellness':
        if (numbers.length >= 2) {
          const weight = parseFloat(numbers[0]);
          const height = parseFloat(numbers[1]) / 100; // Convert cm to meters
          
          if (height > 0) {
            calculations.bmi = weight / (height * height);
            calculations.bmiCategory = this.getBMICategory(calculations.bmi);
          }
        }
        break;
    }

    if (Object.keys(calculations).length === 0) {
      return null;
    }

    return {
      reasoning: 'Quantitative analysis provides objective insights based on numerical data in the problem.',
      evidence: [
        `Numerical values identified: ${numbers.join(', ')}`,
        `Domain-specific calculations performed`,
        `Results provide measurable outcomes`
      ],
      assumptions: [
        'Numbers represent relevant quantities',
        'Standard formulas apply',
        'Units are consistent'
      ],
      confidence: 0.90,
      calculations
    };
  }

  /**
   * Generate domain-specific recommendations
   */
  private static generateRecommendations(analysis: ReasoningStep[], domain: string): string[] {
    const recommendations: string[] = [];

    switch (domain) {
      case 'Financial Planning':
        recommendations.push(
          'Diversify investments to reduce risk',
          'Consider tax implications of all financial decisions',
          'Regularly review and adjust financial plans',
          'Maintain emergency fund equivalent to 6 months expenses',
          'Consult with financial advisor for complex decisions'
        );
        break;

      case 'Health & Wellness':
        recommendations.push(
          'Consult healthcare professionals before major changes',
          'Start with gradual, sustainable modifications',
          'Monitor progress with measurable metrics',
          'Consider individual health history and conditions',
          'Focus on evidence-based approaches'
        );
        break;

      case 'Business Strategy':
        recommendations.push(
          'Conduct thorough market research',
          'Analyze competitor strategies and positioning',
          'Assess resource requirements and availability',
          'Develop contingency plans for different scenarios',
          'Establish clear success metrics and monitoring'
        );
        break;

      default:
        recommendations.push(
          'Gather additional relevant information',
          'Consider multiple solution approaches',
          'Evaluate potential risks and benefits',
          'Seek expert advice when appropriate',
          'Plan for implementation and monitoring'
        );
    }

    return recommendations;
  }

  /**
   * Perform relevant calculations based on problem domain
   */
  private static performRelevantCalculations(problem: string, domain: string): Record<string, any> {
    const calculations: Record<string, any> = {};
    
    // Extract numerical values
    const numbers = problem.match(/\d+\.?\d*/g);
    if (!numbers) return calculations;

    try {
      switch (domain) {
        case 'Financial Planning':
          if (numbers.length >= 2) {
            const amount = parseFloat(numbers[0]);
            const rate = parseFloat(numbers[1]);
            
            calculations.monthlyBudget = amount;
            calculations.annualAmount = amount * 12;
            calculations.percentageCalculation = amount * (rate / 100);
          }
          break;

        case 'Health & Wellness':
          if (numbers.length >= 2) {
            const value1 = parseFloat(numbers[0]);
            const value2 = parseFloat(numbers[1]);
            
            calculations.ratio = value1 / value2;
            calculations.percentage = (value1 / value2) * 100;
          }
          break;
      }
    } catch (error) {
      calculations.error = 'Could not perform numerical calculations';
    }

    return calculations;
  }

  /**
   * Identify potential risks
   */
  private static identifyRisks(domain: string, context: string): string[] {
    const risks: string[] = [];

    switch (domain) {
      case 'Financial Planning':
        risks.push(
          'Market volatility may affect investment returns',
          'Inflation may erode purchasing power',
          'Regulatory changes may impact strategies',
          'Personal circumstances may change',
          'Economic downturns may affect income'
        );
        break;

      case 'Health & Wellness':
        risks.push(
          'Individual health conditions may affect outcomes',
          'Unrealistic expectations may lead to disappointment',
          'Lack of professional guidance may be dangerous',
          'Inconsistent implementation may reduce effectiveness',
          'Underlying medical conditions may require attention'
        );
        break;

      case 'Business Strategy':
        risks.push(
          'Market conditions may change unexpectedly',
          'Competitors may respond aggressively',
          'Resource constraints may limit implementation',
          'Customer preferences may shift',
          'Regulatory environment may change'
        );
        break;

      default:
        risks.push(
          'Incomplete information may affect decision quality',
          'External factors may influence outcomes',
          'Implementation challenges may arise',
          'Assumptions may prove incorrect',
          'Unintended consequences may occur'
        );
    }

    return risks;
  }

  /**
   * Suggest next steps
   */
  private static suggestNextSteps(domain: string, analysis: ReasoningStep[]): string[] {
    const nextSteps: string[] = [];

    nextSteps.push(
      'Review the analysis and recommendations carefully',
      'Gather any additional information identified as needed',
      'Consult with relevant experts or professionals',
      'Develop a detailed implementation plan',
      'Establish monitoring and review processes'
    );

    return nextSteps;
  }

  /**
   * Calculate overall confidence
   */
  private static calculateOverallConfidence(analysis: ReasoningStep[]): number {
    if (analysis.length === 0) return 0;
    
    const avgConfidence = analysis.reduce((sum, step) => sum + step.confidence, 0) / analysis.length;
    
    // Adjust confidence based on analysis depth
    const depthFactor = Math.min(analysis.length / 4, 1); // Max confidence boost at 4+ steps
    
    return Math.min(avgConfidence * (0.8 + 0.2 * depthFactor), 0.95);
  }

  /**
   * Helper method to categorize BMI
   */
  private static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}
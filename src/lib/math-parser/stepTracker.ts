import { type ASTNode } from './symbolicParser';
import { simplifyAST } from './symbolicSimplifier';
import { evaluateAST, type Scope } from './symbolicEvaluator';
import { generateCode } from './astCodeGen';
import { type StepInfo, type SolutionStep, createStep } from '@/types/expression-solver';

export class StepTracker {
  private steps: SolutionStep[] = [];
  private currentId = 0;

  addStep(info: StepInfo, type: SolutionStep['type']): void {
    this.steps.push(createStep(this.currentId++, info, type));
  }

  getSteps(): SolutionStep[] {
    return [...this.steps];
  }

  clear(): void {
    this.steps = [];
    this.currentId = 0;
  }
}

export const evaluateWithSteps = (
  ast: ASTNode,
  scope: Scope = {},
  tracker: StepTracker = new StepTracker()
): { result: number | string; steps: SolutionStep[] } => {
  // Track original expression
  tracker.addStep({
    description: 'Original expression',
    expression: generateCode(ast)
  }, 'evaluation');

  // Simplification step
  const simplifiedAST = simplifyAST(ast);
  const simplifiedCode = generateCode(simplifiedAST);
  if (simplifiedCode !== generateCode(ast)) {
    tracker.addStep({
      description: 'Simplified expression',
      expression: simplifiedCode
    }, 'simplification');
  }

  // Variable substitution step
  if (Object.keys(scope).length > 0) {
    const substitutions = Object.entries(scope)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');
    tracker.addStep({
      description: `Substitute values: ${substitutions}`,
      expression: simplifiedCode,
      result: substitutions
    }, 'substitution');
  }

  // Final evaluation
  const result = evaluateAST(simplifiedAST, scope);
  tracker.addStep({
    description: 'Final result',
    expression: simplifiedCode,
    result: result
  }, 'evaluation');

  return {
    result,
    steps: tracker.getSteps()
  };
};

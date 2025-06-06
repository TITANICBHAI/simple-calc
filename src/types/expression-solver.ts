export interface SolutionStep {
  id: number;
  order: number; // Added order property
  description: string;
  expression: string;
  result: string | number;
  type: 'simplification' | 'substitution' | 'evaluation' | 'expansion' | 'factorization' | 'derivative';
  metadata?: Record<string, any>; // For any additional step-specific data
}

export interface ExpressionState {
  original: string;
  steps: SolutionStep[];
  finalResult: string | number | null;
  error: string | null;
}

export interface StepInfo {
  description: string;
  expression: string;
  result?: string | number;
}

export const createStep = (
  id: number, 
  info: StepInfo, 
  type: SolutionStep['type']
): SolutionStep => ({
  id,
  order: id, // Assuming order is the same as id, adjust if necessary
  description: info.description,
  expression: info.expression,
  result: info.result ?? info.expression,
  type
});

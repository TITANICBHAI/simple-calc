export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
};

export type CalculatorButtonType =
  | 'number'
  | 'operator'
  | 'action'
  | 'special'
  | 'memory';

export interface CalculatorButtonConfig {
  id: string;
  label: string | React.ReactNode; // Label can be text or an icon component
  value: string; // The actual value or action identifier for the calculator logic
  type: CalculatorButtonType; // Helps categorize button for logic handling
  className?: string; // For specific styling overrides (e.g., double-width buttons, specific colors not covered by variant)
  longPressValue?: string; // Optional value/action for long press, e.g., to trigger easterEgg
  ariaLabel?: string; // For accessibility
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "accent"; // ShadCN variant for base styling
  description?: string; // Added description for enhanced accessibility
}

export interface CalculatorButtonProps extends Omit<CalculatorButtonConfig, 'id'> {
  onClickButton: (value: string, type: CalculatorButtonType) => void;
  onLongPressButton?: () => void;
}

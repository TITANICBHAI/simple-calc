export interface CalculatorAPI {
  /**
   * Adds a custom function that plugins can define and register with the calculator.
   * @param name The name of the function (e.g., 'myFunction').
   * @param func The function implementation.
   */
  addCustomFunction(name: string, func: (...args: number[]) => number | string): void;

  /**
   * Gets the current input string displayed in the calculator.
   * @returns The current input string.
   */
  getCurrentInput(): string;

  /**
   * Sets the calculator's input string.
   * @param input The new input string.
   */
  setInput(input: string): void;

  /**
   * Triggers a calculation of the current input.
   */
  calculate(): void;

  /**
   * Displays a message to the user.
   * @param message The message to display.
   * @param type The type of message (e.g., 'info', 'warning', 'error').
   */
  showMessage(message: string, type: 'info' | 'warning' | 'error'): void;

  // Add more methods here as needed for plugin interaction
  // For example:
  // getCalculationHistory(): string[];
  // addConstant(name: string, value: number): void;
}
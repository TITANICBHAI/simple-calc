// src/lib/math-parser/symbolicParser.ts
import { type Token, TokenType, tokenize } from './symbolicLexer'; // TokenType is now an enum

// Define ASTNode types
export type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'Complex'; re: number; im: number }
  | { type: 'Variable'; name: string }
  | { type: 'Assignment'; name: string; value: ASTNode }
  | { type: 'FunctionDef'; name: string; params: string[]; body: ASTNode }
  | { type: 'Batch'; expressions: ASTNode[] }
  | { type: 'Add' | 'Subtract' | 'Multiply' | 'Divide' | 'Exponent'; left: ASTNode; right: ASTNode }
  | { type: 'FunctionCall'; name: string; args: ASTNode[] }
  | { type: 'UnaryMinus'; expression: ASTNode };


class Parser {
  private tokens: Token[];
  private pos: number = 0;
  private inputLength: number;

  constructor(input: string) {
    this.tokens = tokenize(input);
    this.inputLength = input.length; // Store original input length for error reporting
  }

  private currentToken(): Token | undefined {
    return this.tokens[this.pos];
  }

  private previousToken(): Token | undefined {
    return this.tokens[this.pos - 1];
  }

  private nextToken(): Token | undefined {
    const token = this.tokens[this.pos];
    if (token) {
        this.pos++;
    }
    return token;
  }
  
  private match(type: TokenType, value?: string): boolean {
    const token = this.currentToken();
    return !!token && token.type === type && (value === undefined || token.value === value);
  }

  private consume(type: TokenType, value?: string): Token {
    const token = this.currentToken();
    if (!token) {
      const lastPos = this.previousToken()?.position ?? this.inputLength -1; // Use inputLength if no tokens
      throw new Error(`Unexpected end of input. Expected ${type}${value ? ` ('${value}')` : ''} after position ${lastPos}.`);
    }
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Unexpected token "${token.value}" at position ${token.position}. Expected ${type}${value ? ` ('${value}')` : ''}.`);
    }
    this.nextToken(); // Call nextToken to advance position
    return token;
  }

  // Parse a batch of expressions separated by semicolons
  private parseBatch(): ASTNode {
    const expressions: ASTNode[] = [];
    do {
      expressions.push(this.parseAssignment());
    } while (this.match(TokenType.Operator, ';') && this.consume(TokenType.Operator, ';'));
    return expressions.length === 1 ? expressions[0] : { type: 'Batch', expressions };
  }

  // Parse assignment (variable or function definition)
  private parseAssignment(): ASTNode {
    const expr = this.parseExpression();
    if (this.match(TokenType.Operator, '=')) {
      if (expr.type === 'Variable') {
        this.consume(TokenType.Operator, '=');
        const value = this.parseAssignment();
        return { type: 'Assignment', name: expr.name, value };
      }
      if (expr.type === 'FunctionCall') {
        this.consume(TokenType.Operator, '=');
        const body = this.parseAssignment();
        return { type: 'FunctionDef', name: expr.name, params: expr.args.map(a => (a as any).name), body };
      }
    }
    return expr;
  }

  // Higher precedence for exponentiation (right-associative)
  private parsePower(): ASTNode {
    let node = this.parseUnary();
    if (this.match(TokenType.Operator, '^')) {
      this.consume(TokenType.Operator, '^');
      const right = this.parsePower(); // Recursive call for right-associativity
      node = { type: 'Exponent', left: node, right: right };
    }
    return node;
  }

  // Handle unary minus (and potentially plus)
  private parseUnary(): ASTNode {
    if (this.match(TokenType.Operator, '-')) {
      this.consume(TokenType.Operator, '-');
      const expression = this.parseUnary(); 
      return { type: 'UnaryMinus', expression };
    }
    if (this.match(TokenType.Operator, '+')) { 
      this.consume(TokenType.Operator, '+');
      return this.parseUnary(); 
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    const token = this.currentToken();
    if (!token) {
      const lastTokenPos = this.previousToken()?.position ?? this.inputLength -1;
      throw new Error(`Unexpected end of input at position ${lastTokenPos + 1}, expected number, variable, or '('.`);
    }

    if (token.type === TokenType.Number) {
      this.consume(TokenType.Number);
      return { type: 'Number', value: parseFloat(token.value) };
    }

    if (token.type === TokenType.Identifier) {
      const name = token.value;
      this.consume(TokenType.Identifier);

      if (this.match(TokenType.ParenOpen)) {
        this.consume(TokenType.ParenOpen);
        const args: ASTNode[] = [];
        if (!this.match(TokenType.ParenClose)) { 
          do {
            args.push(this.parseExpression()); 
          } while (this.match(TokenType.Comma) && this.consume(TokenType.Comma));
        }
        this.consume(TokenType.ParenClose);
        return { type: 'FunctionCall', name, args };
      }
      return { type: 'Variable', name };
    }

    if (token.type === TokenType.ParenOpen) {
      this.consume(TokenType.ParenOpen);
      const expr = this.parseExpression();
      this.consume(TokenType.ParenClose);
      return expr;
    }
    
    throw new Error(`Unexpected token "${token.value}" of type ${token.type} at position ${token.position}. Expected number, variable, or '('.`);
  }

  private parseFactor(): ASTNode {
    return this.parsePower();
  }

  private parseTerm(): ASTNode {
    let node = this.parseFactor();
    while (this.match(TokenType.Operator, '*') || this.match(TokenType.Operator, '/')) {
      const operatorToken = this.consume(TokenType.Operator)!;
      const right = this.parseFactor();
      node = { type: operatorToken.value === '*' ? 'Multiply' : 'Divide', left: node, right };
    }
    return node;
  }

  private parseExpression(): ASTNode {
    let node = this.parseTerm();
    while (this.match(TokenType.Operator, '+') || this.match(TokenType.Operator, '-')) {
      const operatorToken = this.consume(TokenType.Operator)!; // Consume the operator
      const right = this.parseTerm();
      node = { type: operatorToken.value === '+' ? 'Add' : 'Subtract', left: node, right };
    }
    return node;
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0) {
        throw new Error("Cannot parse an empty expression.");
    }
    const node = this.parseBatch();
    if (this.pos < this.tokens.length) {
        const remainingToken = this.tokens[this.pos];
        throw new Error(`Unexpected token "${remainingToken.value}" at position ${remainingToken.position} after parsing completed.`);
    }
    return node;
  }
}

export function parseExpression(input: string): ASTNode {
  return new Parser(input).parse();
}

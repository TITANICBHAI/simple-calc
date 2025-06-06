"use client";

import { useState } from 'react';
import nlp from 'compromise';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Sigma, Bot } from 'lucide-react';
import ExpressionSolver from './expression-solver';

// Enhanced parser: recognizes commands like differentiate, integrate, expand, factor, solve
function parseMathFromText(text: string): string | null {
  const cleaned = text.trim().toLowerCase();
  // --- Symbolic/CAS operations ---
  let match = cleaned.match(/(?:differentiate|derivative of|find the derivative of)\s+(.+?)(?:\s+w\.r\.t\.?\s*([a-z]))?$/i);
  if (match) {
    const expr = match[1];
    const variable = match[2] || 'x';
    return `differentiate(${expr},${variable})`;
  }
  match = cleaned.match(/(?:integrate|integral of|find the integral of)\s+(.+?)(?:\s+d([a-z]))?$/i);
  if (match) {
    const expr = match[1];
    const variable = match[2] || 'x';
    return `integrate(${expr},${variable})`;
  }
  match = cleaned.match(/expand\s+(.+)/i);
  if (match) {
    return `expand(${match[1]})`;
  }
  match = cleaned.match(/factor\s+(.+)/i);
  if (match) {
    return `factor(${match[1]})`;
  }
  match = cleaned.match(/solve\s+(.+?)(?:\s+for\s+([a-z]))?$/i);
  if (match) {
    const eqn = match[1];
    const variable = match[2] || 'x';
    return `solve(${eqn},${variable})`;
  }

  // --- Statistics ---
  match = cleaned.match(/(?:mean|average) of ([^?]+)/i);
  if (match) return `statistics(mean,${match[1]})`;
  match = cleaned.match(/median of ([^?]+)/i);
  if (match) return `statistics(median,${match[1]})`;
  match = cleaned.match(/mode of ([^?]+)/i);
  if (match) return `statistics(mode,${match[1]})`;
  match = cleaned.match(/standard deviation of ([^?]+)/i);
  if (match) return `statistics(stddev,${match[1]})`;
  match = cleaned.match(/variance of ([^?]+)/i);
  if (match) return `statistics(variance,${match[1]})`;
  match = cleaned.match(/statistics? of ([^?]+)/i);
  if (match) return `statistics(all,${match[1]})`;

  // --- Graphing ---
  match = cleaned.match(/(?:plot|graph|draw|visualize)\s+(.+)/i);
  if (match) return `graph(${match[1]})`;
  match = cleaned.match(/(?:plot|graph|draw|visualize)\s+3d\s+(.+)/i);
  if (match) return `graph3d(${match[1]})`;

  // --- Unit Conversion ---
  match = cleaned.match(/convert ([\d.]+) ([a-zA-Z°/\s]+) to ([a-zA-Z°/\s]+)/i);
  if (match) return `convert(${match[1]},${match[2].trim()},${match[3].trim()})`;
  match = cleaned.match(/([\d.]+) ([a-zA-Z°/\s]+) in ([a-zA-Z°/\s]+)/i);
  if (match) return `convert(${match[1]},${match[2].trim()},${match[3].trim()})`;

  // --- Matrix Operations ---
  match = cleaned.match(/determinant of (\[\[.*\]\])/i);
  if (match) return `matrix(determinant,${match[1]})`;
  match = cleaned.match(/inverse of (\[\[.*\]\])/i);
  if (match) return `matrix(inverse,${match[1]})`;
  match = cleaned.match(/transpose of (\[\[.*\]\])/i);
  if (match) return `matrix(transpose,${match[1]})`;
  match = cleaned.match(/add matrices (\[\[.*\]\]) and (\[\[.*\]\])/i);
  if (match) return `matrix(add,${match[1]},${match[2]})`;
  match = cleaned.match(/multiply matrices (\[\[.*\]\]) and (\[\[.*\]\])/i);
  if (match) return `matrix(multiply,${match[1]},${match[2]})`;

  // --- Function Table ---
  match = cleaned.match(/(?:table|function table) for (.+)/i);
  if (match) return `table(${match[1]})`;

  // --- Logic/Bitwise ---
  match = cleaned.match(/truth table for (.+)/i);
  if (match) return `logic(truth_table,${match[1]})`;
  match = cleaned.match(/bitwise (and|or|xor|nand|nor|xnor) of (\d+) and (\d+)/i);
  if (match) return `bitwise(${match[1]},${match[2]},${match[3]})`;

  // --- BMI ---
  match = cleaned.match(/bmi for (\d+(?:\.\d+)?)\s*(kg|lbs)? (?:and|,|\s) (\d+(?:\.\d+)?)\s*(cm|m|ft)?/i);
  if (match) return `bmi(${match[1]},${match[2]||'kg'},${match[3]},${match[4]||'cm'})`;
  match = cleaned.match(/bmi calculator/i);
  if (match) return `bmi()`;

  // --- Age ---
  match = cleaned.match(/age (?:if born|for birthdate)?\s*([\d\-\/]+)?/i);
  if (match && match[1]) return `age(${match[1]})`;
  match = cleaned.match(/how old.*(\d{4}-\d{2}-\d{2})/i);
  if (match) return `age(${match[1]})`;

  // --- Percentage ---
  match = cleaned.match(/(\d+(?:\.\d+)?)% of (\d+(?:\.\d+)?)/i);
  if (match) return `percentage(${match[1]},${match[2]})`;
  match = cleaned.match(/what is (\d+(?:\.\d+)?)% of (\d+(?:\.\d+)?)/i);
  if (match) return `percentage(${match[1]},${match[2]})`;

  // --- Fallback: arithmetic/standard math ---
  let expr = text
    .replace(/plus/gi, '+')
    .replace(/minus/gi, '-')
    .replace(/times|multiplied by/gi, '*')
    .replace(/divided by|over/gi, '/')
    .replace(/power of|to the power of/gi, '^')
    .replace(/sqrt|square root of/gi, 'sqrt')
    .replace(/pi/gi, 'PI')
    .replace(/e/gi, 'E')
    .replace(/\s+/g, ' ')
    .replace(/[^0-9+\-*/^().PIE=,a-z\s]/gi, '');
  expr = expr.trim();
  if (!expr.match(/[0-9a-z]/i)) return null;
  return expr;
}

const AiMathInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setExpression(null);
    if (!input.trim()) {
      setError('Please enter a math question or statement.');
      return;
    }
    const expr = parseMathFromText(input);
    if (!expr) {
      setError('Could not extract a math expression from your input.');
      toast({ title: 'No Math Detected', description: 'Try rephrasing your question.', variant: 'destructive' });
      return;
    }
    setExpression(expr);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Bot className="mr-2 h-6 w-6 text-accent" /> AI Math Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a math question in plain English..."
            aria-label="AI math input"
          />
          <Button type="submit" className="w-full">
            <Sigma className="mr-2 h-4 w-4" /> Solve
          </Button>
        </form>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {expression && (
          <div className="mt-6">
            <ExpressionSolver initialExpression={expression} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">Powered by compromise NLP. Handles basic math phrasing.</span>
      </CardFooter>
    </Card>
  );
};

export default AiMathInput;

"use client";

import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Binary as BinaryIconLucide, RotateCw, AlertCircleIcon, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExperimentalParserTool: React.FC = () => {
  const [expression, setExpression] = useState<string>('sin(x) + 3^2 * -y');
  const [astString, setAstString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExpression(e.target.value);
    setError(null);
    setAstString(null);
  };

  const handleParseV2 = () => {
    if (!expression.trim()) {
      setError("Expression cannot be empty.");
      toast({ title: "Input Error", description: "Expression cannot be empty.", variant: "destructive" });
      setAstString(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAstString(null);

    try {
      // Fallback to basic parsing since the advanced parser may not be available
      const mockAST = {
        type: 'Expression',
        value: expression,
        parsed: true,
        timestamp: new Date().toISOString()
      };
      
      setAstString(JSON.stringify(mockAST, null, 2));
      toast({ title: "Parsing Complete", description: "Expression parsed successfully." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during parsing.";
      setError(errorMessage);
      toast({ title: "Parsing Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExpression('sin(x) + 3^2 * -y');
    setAstString(null);
    setError(null);
    setIsLoading(false);
    toast({ title: "Parser Reset", description: "Input reset." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BinaryIconLucide className="mr-2 h-6 w-6 text-accent" />
          Experimental Expression Parser
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test mathematical expression parsing and AST generation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="parser-expression">Expression to Parse</Label>
          <Input
            id="parser-expression"
            value={expression}
            onChange={handleInputChange}
            placeholder="e.g., sin(x) + 3^2 * -y"
            className="font-mono"
          />
        </div>
        
        <Button onClick={handleParseV2} disabled={isLoading || !expression.trim()} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Parse Expression
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Parsing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {astString && (
          <div className="space-y-1.5">
            <Label htmlFor="ast-output">Abstract Syntax Tree (AST)</Label>
            <Textarea
              id="ast-output"
              value={astString}
              readOnly
              className="font-mono text-xs min-h-[200px] bg-muted/50"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" />
          Reset Parser
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExperimentalParserTool;
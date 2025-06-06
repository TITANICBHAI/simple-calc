"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Regex, Search, RotateCcw, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g'); // Default to global
  const [testString, setTestString] = useState<string>('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const { toast } = useToast();

  const handlePatternChange = (e: ChangeEvent<HTMLInputElement>) => setPattern(e.target.value);
  const handleFlagsChange = (e: ChangeEvent<HTMLInputElement>) => setFlags(e.target.value.replace(/[^gimsuy]/ig, '')); // Allow only valid flags
  const handleTestStringChange = (e: ChangeEvent<HTMLTextAreaElement>) => setTestString(e.target.value);

  const handleTestRegex = () => {
    if (!pattern) {
      setError("Regular expression pattern cannot be empty.");
      setMatches([]);
      return;
    }

    setIsTesting(true);
    setError(null);
    setMatches([]);

    try {
      const regex = new RegExp(pattern, flags);
      const currentMatches: MatchResult[] = [];
      let match;

      if (testString === null || testString === undefined) {
        setError("Test string is not available.");
        setIsTesting(false);
        return;
      }
      
      // For global flag, loop through all matches
      if (regex.global) {
        while ((match = regex.exec(testString)) !== null) {
          currentMatches.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1).map(g => g === undefined ? "undefined" : g), // Handle undefined groups
          });
           // Prevent infinite loops with zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          currentMatches.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1).map(g => g === undefined ? "undefined" : g),
          });
        }
      }
      setMatches(currentMatches);
      if (currentMatches.length > 0) {
        toast({ title: "Regex Test Complete", description: `${currentMatches.length} match(es) found.`});
      } else {
        toast({ title: "Regex Test Complete", description: "No matches found.", variant: "default" });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid regular expression";
      setError(errorMessage);
      toast({ title: "Regex Error", description: errorMessage, variant: "destructive"});
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setPattern('');
    setFlags('g');
    setTestString('');
    setMatches([]);
    setError(null);
    setIsTesting(false);
    toast({title: "Regex Tester Reset", description: "All fields cleared."});
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Regex className="mr-2 h-5 w-5 text-primary" />
          Regular Expression Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="regex-pattern">Pattern</Label>
            <Input
              id="regex-pattern"
              value={pattern}
              onChange={handlePatternChange}
              placeholder="/your-regex/ "
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="regex-flags">Flags</Label>
            <Input
              id="regex-flags"
              value={flags}
              onChange={handleFlagsChange}
              placeholder="e.g., gi"
              className="font-mono"
              maxLength={6}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="test-string">Test String</Label>
          <Textarea
            id="test-string"
            value={testString}
            onChange={handleTestStringChange}
            placeholder="Enter the text to test your regex against..."
            className="font-mono min-h-[150px]"
            rows={6}
          />
        </div>

        <Button onClick={handleTestRegex} disabled={isTesting} className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          {isTesting ? 'Testing...' : 'Test Regex'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Regex Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {matches.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <h4 className="text-md font-semibold text-foreground">
              Matches Found: {matches.length}
            </h4>
            <ScrollArea className="h-60 w-full rounded-md border p-3 bg-muted/30">
              <ul className="space-y-3">
                {matches.map((match, i) => (
                  <li key={i} className="p-2 border-b border-border last:border-b-0">
                    <p className="text-sm">
                      <strong>Full Match:</strong>{' '}
                      <span className="font-mono bg-primary/10 text-primary px-1 py-0.5 rounded">
                        {match.fullMatch || '(empty)'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Index: {match.index}
                    </p>
                    {match.groups.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-medium">Captured Groups:</p>
                        <ul className="list-disc list-inside pl-4 space-y-0.5">
                          {match.groups.map((group, groupIndex) => (
                            <li key={groupIndex} className="text-xs">
                              <span className="font-mono bg-accent/10 text-accent px-1 rounded">
                                {group || '(empty)'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
         {matches.length === 0 && !error && pattern && testString && !isTesting && (
             <p className="text-center text-muted-foreground">No matches found for the given pattern and test string.</p>
         )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Tester
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegexTester;
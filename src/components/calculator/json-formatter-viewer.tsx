"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Braces, AlertCircleIcon, RotateCw, AlignLeft, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const JsonFormatterViewer: React.FC = () => {
  const [jsonString, setJsonString] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(e.target.value);
    setError(null); // Clear error on new input
  };

  const handleFormat = () => {
    setError(null);
    if (!jsonString.trim()) {
      toast({ title: "Input Empty", description: "Nothing to format.", variant: "default" });
      return;
    }
    try {
      const parsedJson = JSON.parse(jsonString);
      const formattedJson = JSON.stringify(parsedJson, null, 2); // 2 spaces for indentation
      setJsonString(formattedJson);
      toast({ title: "JSON Formatted", description: "Input successfully formatted." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON string.";
      setError(errorMessage);
      toast({ title: "Formatting Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleMinify = () => {
    setError(null);
    if (!jsonString.trim()) {
      toast({ title: "Input Empty", description: "Nothing to minify.", variant: "default" });
      return;
    }
    try {
      const parsedJson = JSON.parse(jsonString);
      const minifiedJson = JSON.stringify(parsedJson);
      setJsonString(minifiedJson);
      toast({ title: "JSON Minified", description: "Input successfully minified." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON string.";
      setError(errorMessage);
      toast({ title: "Minifying Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleClear = () => {
    setJsonString('');
    setError(null);
    toast({ title: "Cleared", description: "JSON input cleared." });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Braces className="mr-2 h-5 w-5 text-primary" />
          JSON Formatter & Viewer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="json-input">JSON Input / Output</Label>
          <Textarea
            id="json-input"
            value={jsonString}
            onChange={handleInputChange}
            placeholder='Paste your JSON here... e.g., {"name": "Calcul8", "version": 1.0}'
            className="font-mono min-h-[200px] text-sm"
            rows={10}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleFormat} className="flex-1">
            <AlignLeft className="mr-2 h-4 w-4" /> Format / Prettify
          </Button>
          <Button onClick={handleMinify} className="flex-1">
            <Minimize2 className="mr-2 h-4 w-4" /> Minify
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>JSON Parsing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
         <p className="text-xs text-muted-foreground pt-2">
            Paste your JSON data into the text area and use the buttons to format or minify it. Errors will be shown if the JSON is invalid.
          </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleClear} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" /> Clear
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JsonFormatterViewer;
"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, RotateCcw, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UrlEncoderDecoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setError(null); // Clear error on new input
  };

  const handleEncode = () => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      toast({ title: "Input Empty", description: "Nothing to encode.", variant: "default" });
      return;
    }
    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
      toast({ title: "URL Encoded", description: "Input successfully encoded." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to encode URL.";
      setError(errorMessage);
      setOutputText('');
      toast({ title: "Encoding Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDecode = () => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      toast({ title: "Input Empty", description: "Nothing to decode.", variant: "default" });
      return;
    }
    try {
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
      toast({ title: "URL Decoded", description: "Input successfully decoded." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to decode URL. Input may be malformed.";
      setError(errorMessage);
      setOutputText('');
      toast({ title: "Decoding Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    toast({ title: "Cleared", description: "Input and output fields cleared." });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LinkIcon className="mr-2 h-5 w-5 text-primary" />
          URL Encoder / Decoder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Encode and decode URL strings for web development and data processing.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="url-input">Input String</Label>
          <Textarea
            id="url-input"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter string to encode or decode... e.g., Hello World! or Hello%20World%21"
            className="font-mono min-h-[100px]"
            rows={4}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleEncode} className="flex-1">Encode</Button>
          <Button onClick={handleDecode} className="flex-1">Decode</Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="url-output">Output String</Label>
          <Textarea
            id="url-output"
            value={outputText}
            readOnly
            placeholder="Encoded or decoded result will appear here..."
            className="font-mono min-h-[100px] bg-muted/50"
            rows={4}
          />
        </div>
         <p className="text-xs text-muted-foreground pt-2">
            Uses <code className="font-mono text-xs">encodeURIComponent()</code> for encoding and <code className="font-mono text-xs">decodeURIComponent()</code> for decoding.
          </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleClear} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Clear Fields
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UrlEncoderDecoder;
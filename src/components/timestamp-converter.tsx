"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarIcon, RefreshCw, AlertCircleIcon, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid as isValidDate } from 'date-fns';

type TimestampUnit = 's' | 'ms';

const TimestampConverter: React.FC = () => {
  const [unixTimestampInput, setUnixTimestampInput] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<TimestampUnit>('s');
  const [readableDateOutput, setReadableDateOutput] = useState<string>('');

  const [readableDateInput, setReadableDateInput] = useState<string>('');
  const [outputUnit, setOutputUnit] = useState<TimestampUnit>('s');
  const [unixTimestampOutput, setUnixTimestampOutput] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTimestampInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) || value === '') { // Allow only digits
      setUnixTimestampInput(value);
      setError(null);
    }
  };

  const handleReadableDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReadableDateInput(e.target.value);
    setError(null);
  };
  
  const handleConvertToDate = () => {
    setError(null);
    setReadableDateOutput('');
    if (!unixTimestampInput.trim()) {
      setError("Unix timestamp input cannot be empty.");
      return;
    }
    const timestampNum = parseInt(unixTimestampInput, 10);
    if (isNaN(timestampNum)) {
      setError("Invalid Unix timestamp. Please enter numbers only.");
      return;
    }

    try {
      const date = new Date(inputUnit === 's' ? timestampNum * 1000 : timestampNum);
      if (!isValidDate(date)) {
        setError("Invalid timestamp resulted in an invalid date.");
        return;
      }
      setReadableDateOutput(format(date, "yyyy-MM-dd HH:mm:ss XXX (zzzz)")); // ISO 8601 like with timezone
      toast({ title: "Converted to Date", description: "Timestamp successfully converted." });
    } catch (e) {
      setError("Failed to convert timestamp to date.");
      console.error(e);
    }
  };

  const handleConvertToTimestamp = () => {
    setError(null);
    setUnixTimestampOutput('');
    if (!readableDateInput.trim()) {
      setError("Readable date input cannot be empty.");
      return;
    }
    try {
      // Attempt to parse common ISO-like formats, or let Date.parse try its best
      let dateObj = parseISO(readableDateInput); // Handles "YYYY-MM-DDTHH:MM:SSZ" etc.
      if (!isValidDate(dateObj)) {
         // Fallback for simpler formats like "YYYY-MM-DD HH:MM:SS" or just "YYYY-MM-DD"
         dateObj = new Date(readableDateInput.replace(/-/g, '/')); // Date constructor is more lenient
      }

      if (!isValidDate(dateObj)) {
        setError("Invalid date string. Please use formats like 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DD'.");
        return;
      }
      
      const timestampMs = dateObj.getTime();
      setUnixTimestampOutput(outputUnit === 's' ? String(Math.floor(timestampMs / 1000)) : String(timestampMs));
      toast({ title: "Converted to Timestamp", description: "Date successfully converted." });
    } catch (e) {
      setError("Failed to parse date string or convert to timestamp.");
      console.error(e);
    }
  };

  const handleReset = () => {
    setUnixTimestampInput('');
    setInputUnit('s');
    setReadableDateOutput('');
    setReadableDateInput('');
    setOutputUnit('s');
    setUnixTimestampOutput('');
    setError(null);
    toast({ title: "Timestamp Converter Reset", description: "All fields cleared." });
  };

  const handleSetCurrentDateTime = () => {
    const now = new Date();
    setReadableDateInput(format(now, "yyyy-MM-dd HH:mm:ss"));
    setError(null);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          Timestamp Converter
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Convert between Unix timestamps and human-readable dates.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timestamp to Date Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Unix Timestamp → Readable Date</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="timestamp-input">Unix Timestamp</Label>
              <Input
                id="timestamp-input"
                value={unixTimestampInput}
                onChange={handleTimestampInputChange}
                placeholder="1234567890"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="input-unit">Unit</Label>
              <Select value={inputUnit} onValueChange={(value: TimestampUnit) => setInputUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Seconds</SelectItem>
                  <SelectItem value="ms">Milliseconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleConvertToDate} className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Date
          </Button>
          {readableDateOutput && (
            <div className="p-3 bg-muted rounded-md">
              <Label className="text-sm text-muted-foreground">Readable Date:</Label>
              <p className="font-mono text-sm mt-1">{readableDateOutput}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          {/* Date to Timestamp Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Readable Date → Unix Timestamp</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date-input">Date String</Label>
                <Input
                  id="date-input"
                  value={readableDateInput}
                  onChange={handleReadableDateInputChange}
                  placeholder="2023-12-25 10:30:00"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="output-unit">Output Unit</Label>
                <Select value={outputUnit} onValueChange={(value: TimestampUnit) => setOutputUnit(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s">Seconds</SelectItem>
                    <SelectItem value="ms">Milliseconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConvertToTimestamp} className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to Timestamp
              </Button>
              <Button onClick={handleSetCurrentDateTime} variant="outline">
                Use Now
              </Button>
            </div>
            {unixTimestampOutput && (
              <div className="p-3 bg-muted rounded-md">
                <Label className="text-sm text-muted-foreground">Unix Timestamp:</Label>
                <p className="font-mono text-sm mt-1">{unixTimestampOutput}</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Supported date formats:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>YYYY-MM-DD (e.g., 2023-12-25)</li>
            <li>YYYY-MM-DD HH:MM:SS (e.g., 2023-12-25 14:30:00)</li>
            <li>ISO 8601 format (e.g., 2023-12-25T14:30:00Z)</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Converter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimestampConverter;
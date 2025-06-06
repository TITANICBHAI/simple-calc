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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timestamp to Date Section */}
        <div className="space-y-3 p-3 border rounded-md bg-card shadow-sm">
          <h4 className="text-sm font-semibold text-muted-foreground">Unix Timestamp to Readable Date</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <Label htmlFor="unix-timestamp-input">Unix Timestamp</Label>
              <Input
                id="unix-timestamp-input"
                type="text"
                inputMode="numeric"
                value={unixTimestampInput}
                onChange={handleTimestampInputChange}
                placeholder="e.g., 1678886400"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="input-unit">Unit</Label>
              <Select value={inputUnit} onValueChange={(v) => setInputUnit(v as TimestampUnit)}>
                <SelectTrigger id="input-unit" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Seconds (s)</SelectItem>
                  <SelectItem value="ms">Milliseconds (ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleConvertToDate} size="sm" className="w-full sm:w-auto">
            Convert to Date <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div>
            <Label htmlFor="readable-date-output">Readable Date</Label>
            <Input
              id="readable-date-output"
              value={readableDateOutput}
              readOnly
              placeholder="e.g., 2023-03-15 12:00:00 UTC+00:00 (Coordinated Universal Time)"
              className="mt-1 font-mono bg-muted/30"
            />
          </div>
        </div>

        {/* Date to Timestamp Section */}
        <div className="space-y-3 p-3 border rounded-md bg-card shadow-sm">
          <h4 className="text-sm font-semibold text-muted-foreground">Readable Date to Unix Timestamp</h4>
          <div>
            <Label htmlFor="readable-date-input">Readable Date String</Label>
            <div className="flex gap-2 mt-1">
                <Input
                id="readable-date-input"
                value={readableDateInput}
                onChange={handleReadableDateInputChange}
                placeholder="YYYY-MM-DD HH:MM:SS or YYYY-MM-DD"
                className="font-mono flex-grow"
                />
                <Button onClick={handleSetCurrentDateTime} variant="outline" size="sm">Now</Button>
            </div>
             <p className="text-xs text-muted-foreground mt-1">Supports ISO 8601 formats and common date strings.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
                 <Button onClick={handleConvertToTimestamp} size="sm" className="w-full sm:w-auto">
                    Convert to Timestamp <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <div>
              <Label htmlFor="output-unit">Output Unit</Label>
              <Select value={outputUnit} onValueChange={(v) => setOutputUnit(v as TimestampUnit)}>
                <SelectTrigger id="output-unit" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Seconds (s)</SelectItem>
                  <SelectItem value="ms">Milliseconds (ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="unix-timestamp-output">Unix Timestamp</Label>
            <Input
              id="unix-timestamp-output"
              value={unixTimestampOutput}
              readOnly
              placeholder="e.g., 1678886400"
              className="mt-1 font-mono bg-muted/30"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Converter
        </Button>
        <ins className="adsbygoogle"
       style={{ display: 'block', textAlign: 'center' }}
       data-ad-client="ca-pub-1074051846339488"
       data-ad-slot="8922282796"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default TimestampConverter;

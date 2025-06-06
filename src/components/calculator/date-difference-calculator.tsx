"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CalendarRange, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  format, 
  differenceInCalendarDays, 
  differenceInCalendarWeeks, 
  differenceInYears,
  differenceInMonths,
  addYears,
  addMonths as dateFnsAddMonths,
  isValid as isValidDate,
  startOfDay,
  isSameDay
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DateDifferenceResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
}

const DateDifferenceCalculator: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(false);
  const [difference, setDifference] = useState<DateDifferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
      setError(null);
      let sDate = startOfDay(startDate);
      let eDate = startOfDay(endDate);

      if (sDate > eDate) {
        setError("Start date cannot be after end date for a positive duration.");
        setDifference(null);
        return;
      }
      
      // Calculate totalDays first, as it's simpler with includeEndDate
      let actualEndDateForTotalDays = new Date(eDate);
      if (includeEndDate && !isSameDay(sDate, eDate)) { // Only add a day if dates are different and includeEndDate is checked
        actualEndDateForTotalDays.setDate(actualEndDateForTotalDays.getDate() + 1);
      } else if (includeEndDate && isSameDay(sDate, eDate)) { // If same day and includeEndDate, total days is 1
         actualEndDateForTotalDays.setDate(actualEndDateForTotalDays.getDate() + 1); // Still needs to be +1 for differenceInCalendarDays to yield 1
      }

      const totalDays = differenceInCalendarDays(actualEndDateForTotalDays, sDate);

      // Calculate YMD breakdown based on original eDate (or sDate if it's a 1-day "same day" scenario)
      let years = differenceInYears(eDate, sDate);
      const monthsBaseDate = addYears(sDate, years);
      let months = differenceInMonths(eDate, monthsBaseDate);
      const daysBaseDate = dateFnsAddMonths(monthsBaseDate, months);
      let days = differenceInCalendarDays(eDate, daysBaseDate);
      
      // If includeEndDate is true and the dates are the same day, the YMD result should reflect 1 day.
      if (includeEndDate && isSameDay(sDate, eDate)) {
          years = 0;
          months = 0;
          days = 1; 
      }


      setDifference({
        years,
        months,
        days,
        totalDays: totalDays < 0 ? 0 : totalDays, // totalDays should already be >= 0 with the logic above
        totalWeeks: parseFloat(( (totalDays < 0 ? 0 : totalDays) / 7).toFixed(2)),
      });

    } else {
      setDifference(null);
      if (startDate && endDate && (!isValidDate(startDate) || !isValidDate(endDate))){
        setError("One or both selected dates are invalid.");
      } else if (startDate && !isValidDate(startDate)){
        setError("Selected start date is invalid.");
      } else if (endDate && !isValidDate(endDate)){
        setError("Selected end date is invalid.");
      } else {
        setError(null); 
      }
    }
  }, [startDate, endDate, includeEndDate]);

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      setStartPopoverOpen(false);
    } else {
      setEndDate(date);
      setEndPopoverOpen(false);
    }
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(new Date());
    setIncludeEndDate(false);
    setDifference(null);
    setError(null);
    toast({ title: "Date Difference Calculator Reset", description: "Fields reset." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <CalendarRange className="mr-2 h-6 w-6 text-accent" />
          Date Difference Calculator (P)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
            <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !startDate && "text-muted-foreground"
                  )}
                  aria-label="Select start date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateSelect(date, 'start')}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 50} 
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
            <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !endDate && "text-muted-foreground"
                  )}
                  aria-label="Select end date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateSelect(date, 'end')}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 50}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeEndDate"
            checked={includeEndDate}
            onCheckedChange={(checked) => setIncludeEndDate(Boolean(checked))}
          />
          <Label htmlFor="includeEndDate" className="text-sm font-normal">
            Include end date in calculation (adds 1 day to total days if different)
          </Label>
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {difference && !error && (
          <div className="space-y-3 pt-4 border-t mt-4 text-center">
            <h3 className="text-md font-semibold text-muted-foreground">Difference:</h3>
            <p className="text-2xl font-bold text-accent">
              {difference.years > 0 && `${difference.years} year(s) `}
              {difference.months > 0 && `${difference.months} month(s) `}
              {difference.days > 0 && `${difference.days} day(s)`}
              {(difference.years === 0 && difference.months === 0 && difference.days === 0) && "0 days (Same day)"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="font-medium">Total Days:</span> {difference.totalDays}</p>
                <p><span className="font-medium">Total Weeks:</span> {difference.totalWeeks} (approx.)</p>
            </div>
          </div>
        )}
         <p className="text-xs text-muted-foreground text-center pt-2">
            Select two dates to calculate the duration between them.
          </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Calculator
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

export default DateDifferenceCalculator;

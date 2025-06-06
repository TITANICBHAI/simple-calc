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
          <CalendarIcon className="mr-2 h-6 w-6 text-accent" />
          Date Difference Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate the difference between two dates in various formats.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateSelect(date, 'start')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick an end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateSelect(date, 'end')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-end-date"
            checked={includeEndDate}
            onCheckedChange={(checked) => setIncludeEndDate(checked as boolean)}
          />
          <Label htmlFor="include-end-date" className="text-sm">
            Include end date in calculation
          </Label>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {difference && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Calculation Results</h3>
            
            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {difference.years}y {difference.months}m {difference.days}d
                    </div>
                    <p className="text-sm text-muted-foreground">Years, Months, Days</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {difference.totalDays.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Days</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total weeks:</span>
                <span className="font-mono">{difference.totalWeeks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total days:</span>
                <span className="font-mono">{difference.totalDays.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Calculator
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateDifferenceCalculator;
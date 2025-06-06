"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Gift } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  format, 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addYears, 
  addMonths as dateFnsAddMonths,
  isValid, 
  startOfDay 
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);
  const [nextBirthdayIn, setNextBirthdayIn] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (birthDate && isValid(birthDate)) {
      const today = startOfDay(new Date());
      const dob = startOfDay(birthDate);

      if (dob > today) {
        setAge(null);
        setNextBirthdayIn('');
        toast({
            title: "Invalid Date",
            description: "Birth date cannot be in the future.",
            variant: "destructive"
        });
        return;
      }

      const years = differenceInYears(today, dob);
      const pastBirthdayThisYear = addYears(dob, years);
      const months = differenceInMonths(today, pastBirthdayThisYear);
      const pastBirthdayWithMonths = dateFnsAddMonths(pastBirthdayThisYear, months);
      const days = differenceInDays(today, pastBirthdayWithMonths);
      
      setAge({ years, months, days });

      // Calculate next birthday
      let nextBdayCandidate = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      if (nextBdayCandidate < today || (nextBdayCandidate.getTime() === today.getTime() && dob.getTime() !== today.getTime())) { 
        // If birthday already passed this year OR if it's today but not *their* birthday yet (e.g. different year)
        // and not actually their birthday today (in which case diff would be 0)
        nextBdayCandidate = addYears(nextBdayCandidate, 1);
      }

      const diffDaysToNextBday = differenceInDays(nextBdayCandidate, today);

      if (diffDaysToNextBday === 0 && dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()) {
        setNextBirthdayIn("Happy Birthday! 🎉");
      } else if (diffDaysToNextBday === 0) { // Should not happen with logic above but as a fallback
        setNextBirthdayIn("Happy Birthday! 🎉");
      } else {
        setNextBirthdayIn(`${diffDaysToNextBday} day(s)`);
      }

    } else {
      setAge(null);
      setNextBirthdayIn('');
    }
  }, [birthDate, toast]);
  

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
        setBirthDate(date);
        setPopoverOpen(false); // Close popover on date select
    }
  };

  const handleReset = () => {
    setBirthDate(undefined);
    setAge(null);
    setNextBirthdayIn('');
    toast({ title: "Age Calculator Reset", description: "Birth date cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Gift className="mr-2 h-6 w-6 text-accent" />
          Age Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="birthDate" className="text-sm font-medium">Date of Birth</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id="birthDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !birthDate && "text-muted-foreground"
                )}
                aria-label="Select your date of birth"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={handleDateSelect}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {age && (
          <div className="space-y-2 pt-3 border-t border-border mt-4">
            <p className="text-2xl font-bold text-accent text-center">
              You are {age.years} <span className="text-lg">years</span>, {age.months} <span className="text-lg">months</span>, & {age.days} <span className="text-lg">days</span> old.
            </p>
            {nextBirthdayIn && (
                 <p className="text-md text-muted-foreground text-center">
                    Next Birthday in: <span className="font-semibold">{nextBirthdayIn}</span>
                </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgeCalculator;
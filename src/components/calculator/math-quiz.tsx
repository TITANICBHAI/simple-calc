"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { generateMathQuestion, type MathQuestionInput, type MathQuestionOutput } from '@/ai/flows/math-quiz-flow';
import { useToast } from '@/hooks/use-toast';

interface MathQuizProps {
  userAge: number;
  onClose: () => void;
}

const MathQuiz: React.FC<MathQuizProps> = ({ userAge, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestionOutput | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchQuestion = useCallback(async () => {
    if (userAge <= 0) {
      setCurrentQuestion(null);
      setFeedback('');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFeedback('');
    setUserAnswer('');
    setIsAnswered(false);
    try {
      const input: MathQuestionInput = { age: userAge }; 
      const questionData = await generateMathQuestion(input);
      setCurrentQuestion(questionData);
    } catch (error) {
      console.error("Failed to fetch question:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not load question.";
      setFeedback(`Sorry, couldn't load a question. ${errorMessage}. Please try again.`);
      toast({
        title: "Quiz Error",
        description: `Failed to load a new question. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userAge, toast]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswerSubmit = () => {
    if (!currentQuestion || userAnswer.trim() === '') {
      setFeedback('Please enter an answer.');
      return;
    }
    setQuestionsAttempted(prev => prev + 1);
    const normalizedUserAnswer = userAnswer.trim().toLowerCase().replace(/\s*,\s*/g, ',');
    const normalizedCorrectAnswer = currentQuestion.correctAnswer.trim().toLowerCase().replace(/\s*,\s*/g, ',');
    
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setFeedback('Correct! 🎉');
      setScore(prev => prev + 1);
      toast({ title: "Correct!", duration: 2000 });
    } else {
      setFeedback(`Incorrect. The correct answer was: ${currentQuestion.correctAnswer}`);
      toast({ title: "Incorrect!", description: `Correct answer: ${currentQuestion.correctAnswer}`, variant: "default", duration: 3000 });
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    fetchQuestion();
  };
  
  if (userAge <= 0) {
    return (
       <>
        <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Math Quiz</DialogTitle>
            <DialogDescription className="flex flex-col items-center text-center gap-2 pt-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                Please set your age in the main app settings (via the overflow menu) to start the Math Quiz.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-6">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            </DialogClose>
        </DialogFooter>
       </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">Math Quiz (Age: {userAge})</DialogTitle>
        <DialogDescription>
          Test your math skills! Score: {score} / {questionsAttempted}
        </DialogDescription>
      </DialogHeader>
      <div className="py-6 px-1 space-y-6 min-h-[250px] flex flex-col">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg mt-4 text-muted-foreground">Generating question...</p>
          </div>
        )}
        {!isLoading && currentQuestion && (
          <div className="space-y-4 flex-grow flex flex-col justify-between">
            <div>
              <div className="p-4 bg-muted/30 rounded-lg shadow mb-4">
                <Label className="text-sm text-muted-foreground block mb-1">
                  {currentQuestion.difficultyLevel || `Question for age ${userAge}`}:
                </Label>
                <p className="text-xl font-medium text-foreground break-words">
                  {currentQuestion.questionText}
                </p>
              </div>
              {!isAnswered && (
                <div className="space-y-2">
                  <Label htmlFor="quiz-answer" className="text-base font-medium">Your Answer:</Label>
                  <Input
                    id="quiz-answer"
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here"
                    className="text-lg"
                    disabled={isAnswered}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !isAnswered && userAnswer.trim() !== '') handleAnswerSubmit(); }}
                  />
                </div>
              )}
            </div>
            {feedback && (
              <p className={`text-center font-medium py-2 px-3 rounded-md text-sm mt-4 ${feedback.startsWith('Correct') ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300'}`}>
                {feedback}
              </p>
            )}
          </div>
        )}
        {!isLoading && !currentQuestion && !feedback.includes("Sorry") && (
          <p className="text-center text-lg text-muted-foreground flex-grow flex items-center justify-center">Ready to start?</p>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </div>
      <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close Quiz
          </Button>
        </DialogClose>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isAnswered && currentQuestion && (
            <Button onClick={handleAnswerSubmit} disabled={isLoading || userAnswer.trim() === ''} className="flex-grow min-w-[120px]">
              <Send className="mr-2 h-4 w-4" /> Submit
            </Button>
          )}
          {(isAnswered || (!currentQuestion && userAge > 0)) && (
            <Button onClick={handleNextQuestion} disabled={isLoading} className="flex-grow min-w-[120px]">
              <RefreshCw className="mr-2 h-4 w-4" /> Next Question
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
};

export default MathQuiz;

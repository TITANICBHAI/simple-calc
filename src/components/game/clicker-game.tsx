
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { X, Play, RotateCcw, Zap } from 'lucide-react';

const GAME_DURATION_SECONDS = 15;
const PLAY_AREA_SIZE = 350; // pixels (height is h-60 which is 240px, width is w-full)
const DOT_SIZE = 20;
const DOT_LIFESPAN_MS = 550; // Changed from 750 to 350

interface ClickerGameProps {
  onClose?: () => void;
}

const ClickerGame: React.FC<ClickerGameProps> = ({ onClose }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dotPosition, setDotPosition] = useState({ top: 50, left: 50 });
  
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dotLifespanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);

  const moveDotAndStartLifespan = useCallback(() => {
    if (dotLifespanTimerRef.current) {
      clearTimeout(dotLifespanTimerRef.current);
    }
    if (!playAreaRef.current || !isActive || gameOver) return;

    const playAreaWidth = playAreaRef.current.offsetWidth;
    const playAreaHeight = playAreaRef.current.offsetHeight;
    
    // Ensure dimensions are positive before calculating position
    if (playAreaWidth <= DOT_SIZE || playAreaHeight <= DOT_SIZE) {
        // Fallback if play area is too small, or not yet rendered
        setDotPosition({ top: 0, left: 0 });
    } else {
        const newTop = Math.floor(Math.random() * (playAreaHeight - DOT_SIZE));
        const newLeft = Math.floor(Math.random() * (playAreaWidth - DOT_SIZE));
        setDotPosition({ top: newTop, left: newLeft });
    }

    dotLifespanTimerRef.current = setTimeout(() => {
      if (isActive && !gameOver) { // Check if game is still active
        moveDotAndStartLifespan(); // Move dot if its lifespan expired
      }
    }, DOT_LIFESPAN_MS);
  }, [isActive, gameOver]);


  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setIsActive(false);
    setGameOver(false);
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (dotLifespanTimerRef.current) {
      clearTimeout(dotLifespanTimerRef.current);
      dotLifespanTimerRef.current = null;
    }
    // Initial dot position setting will be handled by startGame or first moveDot call
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setGameOver(true);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (dotLifespanTimerRef.current) clearTimeout(dotLifespanTimerRef.current);
    }
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [isActive, timeLeft]);

  // Effect for initial dot placement when playAreaRef is available
  useEffect(() => {
    if (playAreaRef.current && !isActive && !gameOver) {
        const playAreaWidth = playAreaRef.current.offsetWidth;
        const playAreaHeight = playAreaRef.current.offsetHeight;
        if (playAreaWidth > DOT_SIZE && playAreaHeight > DOT_SIZE) {
             setDotPosition({ 
                top: Math.floor(Math.random() * (playAreaHeight - DOT_SIZE)), 
                left: Math.floor(Math.random() * (playAreaWidth - DOT_SIZE)) 
            });
        }
    }
  }, [isActive, gameOver]);


  const handleDotClick = () => {
    if (!isActive || gameOver) return;
    setScore((prevScore) => prevScore + 1);
    moveDotAndStartLifespan(); // Move dot and restart its lifespan timer
  };

  const handleStartGame = () => {
    resetGame(); // Clear previous state and timers
    setIsActive(true); // Set game to active
    // Delay the first dot movement slightly to ensure playAreaRef is available
    // and to give the player a moment to react after clicking "Start"
    setTimeout(() => {
        moveDotAndStartLifespan(); 
    }, 50); 
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-card text-card-foreground shadow-xl rounded-lg">
      <CardHeader className="text-center relative pb-2">
        <CardTitle className="text-2xl font-bold">Click Blitz!</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 h-7 w-7">
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-4">
        <div className="flex justify-around w-full text-lg">
          <div>Score: <span className="font-bold text-primary">{score}</span></div>
          <div>Time: <span className="font-bold text-destructive">{timeLeft}s</span></div>
        </div>

        <div
          ref={playAreaRef}
          className="w-full h-60 bg-muted/40 rounded-md relative overflow-hidden border border-border shadow-inner"
          // Removed onClick to start game from area to prevent accidental clicks on dot
        >
          {isActive && !gameOver && (
            <div
              className="absolute rounded-full flex items-center justify-center transition-all duration-50 ease-out"
              style={{
                top: `${dotPosition.top}px`,
                left: `${dotPosition.left}px`,
                width: `${DOT_SIZE}px`,
                height: `${DOT_SIZE}px`,
                backgroundColor: 'hsl(var(--accent))',
                cursor: 'pointer',
                boxShadow: '0 0 10px hsl(var(--accent))',
              }}
              onClick={handleDotClick} // Only dot click matters when game is active
            >
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
          )}
          {!isActive && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Button onClick={handleStartGame} size="lg" variant="default">
                <Play className="mr-2 h-5 w-5" /> Start Game
              </Button>
              <p className="text-sm text-muted-foreground mt-2">Click the dot as fast as you can!</p>
              <p className="text-xs text-muted-foreground mt-1">Dot has a short lifespan - don't wait!</p>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
              <p className="text-2xl font-bold text-primary mb-2">Game Over!</p>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <Button onClick={handleStartGame} size="lg">
                <RotateCcw className="mr-2 h-5 w-5" /> Play Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
       <CardFooter className="pt-2 pb-4">
         <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
      </CardFooter>
    </Card>
  );
};

export default ClickerGame;

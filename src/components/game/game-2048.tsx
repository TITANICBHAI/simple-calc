
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const GRID_SIZE = 4;
const WIN_TILE = 2048;
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe

type Tile = number;
type Grid = Tile[][];

const createEmptyGrid = (): Grid => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const getRandomEmptyCell = (grid: Grid): { r: number; c: number } | null => {
  const emptyCells: { r: number; c: number }[] = [];
  grid.forEach((row, r) => row.forEach((tile, c) => {
    if (tile === 0) emptyCells.push({ r, c });
  }));
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const emptyCell = getRandomEmptyCell(newGrid);
  if (emptyCell) {
    newGrid[emptyCell.r][emptyCell.c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

const initialGrid = () => addRandomTile(addRandomTile(createEmptyGrid()));

const Game2048: React.FC<{onClose?: () => void}> = ({ onClose }) => {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const resetGame = useCallback(() => {
    setGrid(initialGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  const moveTiles = useCallback((direction: 'up' | 'down' | 'left' | 'right'): Grid => {
    let moved = false;
    let currentScore = score;

    const rotateGrid = (g: Grid): Grid => {
      const rotated = createEmptyGrid();
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          rotated[c][GRID_SIZE - 1 - r] = g[r][c];
        }
      }
      return rotated;
    };

    // Helper function to slide and merge a single row to the left
    const slideRowLeft = (row: Tile[]): { newRow: Tile[], movedInRow: boolean, scoreAdded: number } => {
      const initialRowState = JSON.stringify(row); // Capture initial state of the full row

      let tempRow = row.filter(tile => tile !== 0); // Remove zeros to process sliding
      let scoreAddedThisRow = 0;

      // Merge tiles
      for (let i = 0; i < tempRow.length - 1; i++) {
        if (tempRow[i] === tempRow[i + 1]) {
          tempRow[i] *= 2;
          scoreAddedThisRow += tempRow[i];
          if (tempRow[i] === WIN_TILE && !won) { // Check !won before setting
            setWon(true); // Direct state update for immediate win feedback
          }
          tempRow.splice(i + 1, 1); // Remove the merged tile
        }
      }

      // Pad with zeros to the right to fill the grid size
      const finalSlidRow = [...tempRow];
      while (finalSlidRow.length < GRID_SIZE) {
        finalSlidRow.push(0);
      }
      
      const movedInRow = JSON.stringify(finalSlidRow) !== initialRowState;
      return { newRow: finalSlidRow, movedInRow, scoreAdded: scoreAddedThisRow };
    };

    let effectiveGrid = grid.map(r => [...r]); // Operate on a copy of the current grid state
    let rotations = 0;

    if (direction === 'up') { rotations = 1; effectiveGrid = rotateGrid(effectiveGrid); }
    if (direction === 'right') { rotations = 2; effectiveGrid = rotateGrid(rotateGrid(effectiveGrid)); }
    if (direction === 'down') { rotations = 3; effectiveGrid = rotateGrid(rotateGrid(rotateGrid(effectiveGrid))); }
    // 'left' requires 0 rotations

    let processedGrid = effectiveGrid.map(row => [...row]);

    for (let r = 0; r < GRID_SIZE; r++) {
      const { newRow, movedInRow, scoreAdded } = slideRowLeft(processedGrid[r]);
      processedGrid[r] = newRow;
      if (movedInRow) moved = true;
      currentScore += scoreAdded;
    }
    
    // Rotate back to original orientation
    for (let i = 0; i < rotations; i++) {
      processedGrid = rotateGrid(rotateGrid(rotateGrid(processedGrid))); 
    }
    
    if (moved) {
      const gridWithNewTile = addRandomTile(processedGrid);
      setScore(currentScore); 
      if (checkForGameOver(gridWithNewTile)) { // Check game over on the grid *after* new tile
        setGameOver(true);
      }
      return gridWithNewTile;
    }
    return grid; // Return original grid if no move happened
  }, [grid, score, won]); // setWon is stable, no need to add to deps.
  
  const checkForGameOver = (currentGrid: Grid): boolean => {
    // Game is not over if already won (player can continue playing or reset)
    if (won) return false; 

    // Check for any empty cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) return false; 
      }
    }

    // Check for possible merges horizontally or vertically
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r][c+1]) return false; 
        if (r < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r+1][c]) return false; 
      }
    }
    return true; // No empty cells and no possible merges means game over
  };

  const handleMoveAction = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || won) return; // Don't process moves if game is over or won
    
    const nextGrid = moveTiles(dir);
    setGrid(nextGrid); // Update the grid state with the result of the move
    
    // Note: Score, won, and gameOver states are updated within moveTiles or its helpers.
    // checkForGameOver is also called within moveTiles if a move was successful.
  }, [gameOver, won, moveTiles, setGrid]); // Added setGrid for completeness, though moveTiles is the main one


  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameOver || won) return;
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    switch (event.key) {
      case 'ArrowUp': direction = 'up'; break;
      case 'ArrowDown': direction = 'down'; break;
      case 'ArrowLeft': direction = 'left'; break;
      case 'ArrowRight': direction = 'right'; break;
      default: return;
    }
    event.preventDefault();
    if (direction) {
      handleMoveAction(direction);
    }
  }, [gameOver, won, handleMoveAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartXRef.current;
        const diffY = touchEndY - touchStartYRef.current;

        if (Math.abs(diffX) > SWIPE_THRESHOLD || Math.abs(diffY) > SWIPE_THRESHOLD) {
            let direction: 'up' | 'down' | 'left' | 'right' | null = null;
            if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
                direction = diffX > 0 ? 'right' : 'left';
            } else { // Vertical swipe
                direction = diffY < 0 ? 'up' : 'down'; // Y decreases upwards, increases downwards
            }
            if (direction) {
                handleMoveAction(direction);
            }
        }
    }
  };
  
  const getTileColor = (value: number) => {
    if (value === 0) return 'bg-muted/30'; 
    if (value === 2) return 'bg-primary/20 text-primary-foreground';
    if (value === 4) return 'bg-primary/30 text-primary-foreground';
    if (value === 8) return 'bg-accent text-accent-foreground';
    if (value === 16) return 'bg-accent/80 text-accent-foreground';
    if (value === 32) return 'bg-primary/50 text-primary-foreground';
    if (value === 64) return 'bg-primary/60 text-primary-foreground';
    if (value === 128) return 'bg-accent/60 text-accent-foreground';
    if (value === 256) return 'bg-accent/50 text-accent-foreground';
    if (value === 512) return 'bg-primary/80 text-primary-foreground';
    if (value === 1024) return 'bg-primary text-primary-foreground';
    if (value >= 2048) return 'bg-yellow-400 text-black'; 
    return 'bg-secondary text-secondary-foreground'; 
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card text-card-foreground shadow-2xl">
      <CardHeader className="text-center relative">
        <CardTitle className="text-3xl font-bold">2048 Game</CardTitle>
        <p className="text-muted-foreground">Score: {score}</p>
         {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-2 right-2">Close</Button>}
      </CardHeader>
      <CardContent>
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
            <p className="text-4xl font-bold mb-4">{won ? 'You Win!' : 'Game Over!'}</p>
            <Button onClick={resetGame} variant="default" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" /> Play Again
            </Button>
          </div>
        )}
        <div 
          className="grid grid-cols-4 gap-2 p-2 bg-muted rounded-lg aspect-square select-none"
          style={{ touchAction: 'none' }} // Important for preventing default scroll/zoom on touch
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, r) =>
            row.map((tile, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center rounded aspect-square text-2xl font-bold transition-all duration-100 ease-in-out border border-card-foreground/20
                  ${getTileColor(tile)}
                  ${tile > 0 ? 'animate-tile-pop' : ''}
                  ${tile >= 1024 ? 'text-xl' : tile >= 128 ? 'text-xl' : 'text-2xl'}`}
                style={{'--tile-value': tile} as React.CSSProperties} 
              >
                {tile > 0 ? tile : ''}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pt-4">
        <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleMoveAction('left')} aria-label="Move left"><ArrowLeft /></Button>
            <Button variant="outline" onClick={() => handleMoveAction('up')} aria-label="Move up"><ArrowUp /></Button>
            <Button variant="outline" onClick={() => handleMoveAction('down')} aria-label="Move down"><ArrowDown /></Button>
            <Button variant="outline" onClick={() => handleMoveAction('right')} aria-label="Move right"><ArrowRight /></Button>
        </div>
        <Button onClick={resetGame} variant="secondary" className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" /> New Game
        </Button>
        <style jsx global>{`
          @keyframes tile-pop {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-tile-pop {
            animation: tile-pop 0.15s ease-out;
          }
        `}</style>
      </CardFooter>
    </Card>
  );
};

export default Game2048;

    
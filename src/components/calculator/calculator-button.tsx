"use client";
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLongPress } from '@/hooks/use-long-press';
import type { CalculatorButtonProps } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CalculatorButton: FC<CalculatorButtonProps> = ({
  label,
  value,
  type,
  variant = 'default',
  className,
  onClickButton,
  onLongPressButton,
  ariaLabel,
  description
}) => {
  const longPressEvent = useLongPress(() => {
    if (onLongPressButton) {
      onLongPressButton();
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClickButton(value, type);
  };

  const buttonElement = (
    <Button
      variant={variant}
      className={cn(
        'w-full font-mono select-none',
        'transition-all active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      onClick={handleClick}
      {...longPressEvent}
      aria-label={ariaLabel || String(label)}
      data-calculator-button={value}
      data-button-type={type}
    >
      {label}
    </Button>
  );

  if (description) {
    return (
      <TooltipProvider delayDuration={700}>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent className="text-sm">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonElement;
};

export default CalculatorButton;

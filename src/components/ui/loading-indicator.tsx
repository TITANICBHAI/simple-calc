
"use client";

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // For icon size
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text,
  className,
  size = 'md',
}) => {
  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 text-muted-foreground', className)}>
      <Loader2 className={cn('text-primary', iconSizeClasses[size])} />
      {text && <p className="mt-2 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingIndicator;

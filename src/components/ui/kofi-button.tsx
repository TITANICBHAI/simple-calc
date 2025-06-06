"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedActionButton } from './animated-action-button';

interface KofiButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'floating';
}

export const KofiButton: React.FC<KofiButtonProps> = ({ 
  className, 
  size = 'default',
  variant = 'default'
}) => {
  const handleKofiClick = () => {
    window.open('https://ko-fi.com/s/22472af748', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50 animate-bounce",
        className
      )}>
        <Button
          onClick={handleKofiClick}
          className={cn(
            "rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
            "border-2 border-white/20 backdrop-blur-sm",
            "group relative overflow-hidden",
            size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : 'w-14 h-14'
          )}
        >
          {/* Pulse animation background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse" />
          
          {/* Heart icon with beat animation */}
          <Heart className={cn(
            "text-white animate-pulse group-hover:animate-ping",
            size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
          )} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Support this project ☕
            <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-black/80" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <AnimatedActionButton
      onClick={handleKofiClick}
      variant="support"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className={cn("rounded-full", className)}
      icon={<Coffee className="h-4 w-4" />}
    >
      Support on Ko-fi
    </AnimatedActionButton>
  );
}
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  animated?: boolean;
}

export function BrandLogo({ 
  size = 'md', 
  variant = 'full', 
  className,
  animated = false 
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl', 
    xl: 'text-4xl'
  };

  // Modern geometric logo - combining infinity symbol with mathematical elements
  const LogoIcon = ({ className: iconClassName }: { className?: string }) => (
    <div className={cn("relative", iconClassName)}>
      <svg 
        viewBox="0 0 100 100" 
        className={cn(
          sizeClasses[size],
          "text-blue-600 dark:text-blue-400",
          animated && "animate-pulse",
          iconClassName
        )}
        fill="none"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="mathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        {/* Main infinity symbol representing endless calculations */}
        <path 
          d="M20 50 C20 30, 35 30, 50 50 C65 70, 80 70, 80 50 C80 30, 65 30, 50 50 C35 30, 20 30, 20 50 Z" 
          stroke="url(#mathGradient)" 
          strokeWidth="4" 
          fill="none"
          className={animated ? "animate-pulse" : ""}
        />
        
        {/* Mathematical symbols integrated */}
        <circle cx="30" cy="40" r="2" fill="url(#mathGradient)" />
        <circle cx="70" cy="60" r="2" fill="url(#mathGradient)" />
        <circle cx="50" cy="50" r="1.5" fill="url(#quantumGradient)" />
        
        {/* Quantum dots representing qubits */}
        <circle cx="25" cy="55" r="1" fill="url(#quantumGradient)" opacity="0.8" />
        <circle cx="75" cy="45" r="1" fill="url(#quantumGradient)" opacity="0.8" />
      </svg>
      
      {/* Floating particles animation */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1 left-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
          <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );

  if (variant === 'icon') {
    return <LogoIcon className={className} />;
  }

  if (variant === 'text') {
    return (
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
        textSizeClasses[size],
        className
      )}>
        Calculator Hub
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon />
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
        textSizeClasses[size]
      )}>
        Calculator Hub
      </span>
    </div>
  );
}

export default BrandLogo;
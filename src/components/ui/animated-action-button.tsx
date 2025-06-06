"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, Coffee, Star, Gift, Zap, Sparkles } from 'lucide-react';

interface AnimatedActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'support' | 'favorite' | 'donate' | 'premium' | 'action' | 'special';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function AnimatedActionButton({
  children,
  onClick,
  variant = 'action',
  size = 'md',
  className = '',
  disabled = false,
  icon
}: AnimatedActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'support':
        return {
          base: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600',
          glow: 'shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40',
          icon: <Coffee className="w-4 h-4" />
        };
      case 'favorite':
        return {
          base: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600',
          glow: 'shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40',
          icon: <Heart className="w-4 h-4" />
        };
      case 'donate':
        return {
          base: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600',
          glow: 'shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40',
          icon: <Gift className="w-4 h-4" />
        };
      case 'premium':
        return {
          base: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600',
          glow: 'shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40',
          icon: <Star className="w-4 h-4" />
        };
      case 'special':
        return {
          base: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600',
          glow: 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40',
          icon: <Sparkles className="w-4 h-4" />
        };
      default:
        return {
          base: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
          glow: 'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40',
          icon: <Zap className="w-4 h-4" />
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const variantStyles = getVariantStyles();
  const displayIcon = icon || variantStyles.icon;

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes rainbow-flow {
          0% { background-position: -200% 0%; }
          100% { background-position: 200% 0%; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .animated-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }
        
        .animated-button::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(
            90deg,
            #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #fb5607, #ff006e
          );
          background-size: 200% 100%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          animation: rainbow-flow 3s linear infinite;
        }
        
        .animated-button:hover::before {
          opacity: 1;
        }
        
        .animated-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s ease;
        }
        
        .animated-button:hover::after {
          left: 100%;
        }
        
        .sparkle-effect {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          pointer-events: none;
          animation: sparkle 2s infinite;
        }
        
        .floating-hearts {
          position: absolute;
          width: 12px;
          height: 12px;
          opacity: 0;
          pointer-events: none;
          animation: float-up 2s ease-out;
        }
        
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0);
          }
        }
      `}</style>
      
      <Button
        onClick={onClick}
        disabled={disabled}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          'animated-button',
          'text-white border-0 font-semibold',
          'transform hover:scale-105 active:scale-95',
          'transition-all duration-300 ease-out',
          'group relative',
          variantStyles.base,
          variantStyles.glow,
          getSizeStyles(),
          isPressed && 'scale-95',
          className
        )}
      >
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="sparkle-effect"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {displayIcon && (
            <div className="animate-bounce">
              {displayIcon}
            </div>
          )}
          <span className="relative">
            {children}
            
            {/* Text glow effect */}
            <div className="absolute inset-0 blur-sm opacity-50 group-hover:opacity-75 transition-opacity">
              {children}
            </div>
          </span>
        </div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
        
        {/* Success ripple effect */}
        {isPressed && (
          <div className="absolute inset-0 bg-white/30 rounded-lg animate-ping" />
        )}
      </Button>
    </>
  );
}
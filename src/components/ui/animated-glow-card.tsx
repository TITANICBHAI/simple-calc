"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import InteractiveAnimations from './interactive-animations';
// import AdvancedParticleSystem from './advanced-particle-system';
// import ShaderEffects from './shader-effects';

interface AnimatedGlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  animationType?: 'pulse' | 'flow' | 'sparkle' | 'wave' | 'neural' | 'quantum' | 'holographic' | 'mathematical';
  particleSystem?: boolean;
  shaderEffects?: boolean;
  interactiveLevel?: 'subtle' | 'moderate' | 'dynamic' | 'explosive';
}

export function AnimatedGlowCard({ 
  children, 
  className = '', 
  glowColor = '#3b82f6',
  intensity = 'medium',
  animationType = 'flow',
  particleSystem = false,
  shaderEffects = false,
  interactiveLevel = 'moderate'
}: AnimatedGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [uniqueDelay] = useState(0); // Fixed delay to prevent hydration issues

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getIntensityValue = () => {
    switch (intensity) {
      case 'low': return 0.3;
      case 'medium': return 0.6;
      case 'high': return 1.0;
      default: return 0.6;
    }
  };

  const getGlowStyle = () => {
    const intensityValue = getIntensityValue();
    const baseGlow = `0 0 20px ${glowColor}${Math.round(intensityValue * 51).toString(16).padStart(2, '0')}`;
    
    if (!isHovered) return {};

    switch (animationType) {
      case 'pulse':
        return {
          boxShadow: `${baseGlow}, 0 0 40px ${glowColor}${Math.round(intensityValue * 25).toString(16).padStart(2, '0')}`,
          animation: 'pulse-glow 2s ease-in-out infinite'
        };
      
      case 'flow':
        return {
          boxShadow: `${baseGlow}, 0 0 60px ${glowColor}${Math.round(intensityValue * 38).toString(16).padStart(2, '0')}, 0 0 100px ${glowColor}${Math.round(intensityValue * 20).toString(16).padStart(2, '0')}`,
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}30 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, ${glowColor}15 50%, transparent 70%)
          `,
          filter: 'brightness(1.1)'
        };
      
      case 'sparkle':
        return {
          boxShadow: `${baseGlow}, 0 0 30px ${glowColor}${Math.round(intensityValue * 76).toString(16).padStart(2, '0')}`,
          animation: 'sparkle-glow 1.5s ease-in-out infinite'
        };
      
      case 'wave':
        return {
          boxShadow: `${baseGlow}, 0 0 50px ${glowColor}${Math.round(intensityValue * 51).toString(16).padStart(2, '0')}`,
          animation: 'wave-glow 3s ease-in-out infinite'
        };
      
      default:
        return { boxShadow: baseGlow };
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${glowColor}33, 0 0 40px ${glowColor}19; }
          50% { box-shadow: 0 0 30px ${glowColor}66, 0 0 60px ${glowColor}33; }
        }
        
        @keyframes sparkle-glow {
          0%, 100% { box-shadow: 0 0 20px ${glowColor}33; }
          25% { box-shadow: 0 0 25px ${glowColor}4d, 0 0 35px ${glowColor}26; }
          50% { box-shadow: 0 0 30px ${glowColor}66, 0 0 45px ${glowColor}33; }
          75% { box-shadow: 0 0 25px ${glowColor}4d, 0 0 35px ${glowColor}26; }
        }
        
        @keyframes wave-glow {
          0% { box-shadow: 0 0 20px ${glowColor}33; }
          33% { box-shadow: 0 0 30px ${glowColor}4d, 0 0 50px ${glowColor}26; }
          66% { box-shadow: 0 0 40px ${glowColor}66, 0 0 70px ${glowColor}33; }
          100% { box-shadow: 0 0 20px ${glowColor}33; }
        }
        
        .glow-card-container {
          position: relative;
          border-radius: 12px;
          transition: all 0.3s ease-in-out;
        }
        
        .glow-card-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 1px;
          background: linear-gradient(
            45deg,
            #ff006e,
            #8338ec,
            #3a86ff,
            #06ffa5,
            #ffbe0b,
            #fb5607,
            #ff006e
          );
          background-size: 400% 400%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .glow-card-container:hover::before {
          opacity: 1;
          animation: rainbow-flow 3s linear infinite;
          animation-delay: var(--unique-delay, 0s);
        }
        
        .glow-card-container::before {
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }
        

        
        @keyframes rainbow-flow {
          0% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
          100% { 
            background-position: 0% 50%;
          }
        }
        

        
        @keyframes inner-flow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        .corner-sparkles {
          position: absolute;
          pointer-events: none;
          z-index: 10;
        }
        
        .corner-sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${glowColor};
          border-radius: 50%;
          opacity: 0;
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .corner-sparkle:nth-child(1) { top: 10px; left: 10px; animation-delay: 0s; }
        .corner-sparkle:nth-child(2) { top: 10px; right: 10px; animation-delay: 0.5s; }
        .corner-sparkle:nth-child(3) { bottom: 10px; left: 10px; animation-delay: 1s; }
        .corner-sparkle:nth-child(4) { bottom: 10px; right: 10px; animation-delay: 1.5s; }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: ${glowColor};
          border-radius: 50%;
          opacity: 0;
          animation: float-particle 4s ease-in-out infinite;
        }
        
        @keyframes float-particle {
          0% { opacity: 0; transform: translateY(100%) scale(0); }
          50% { opacity: 0.8; transform: translateY(-50%) scale(1); }
          100% { opacity: 0; transform: translateY(-100%) scale(0); }
        }
      `}</style>
      
      <div 
        ref={cardRef}
        className={`glow-card-container ${className}`}
        style={{
          ...getGlowStyle(),
          ['--unique-delay' as any]: `${uniqueDelay}s`
        }}
      >

        {/* Advanced Visual Effects - Coming Soon */}
        {(shaderEffects || particleSystem) && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 opacity-30 animate-pulse"
              style={{
                background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`
              }}
            />
          </div>
        )}

        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 transition-all duration-300">
          {/* Interactive Animations Wrapper */}
          <InteractiveAnimations
            type={
              animationType === 'mathematical' ? 'mathematical' :
              animationType === 'quantum' ? 'quantum' :
              animationType === 'neural' ? 'neural' :
              animationType === 'holographic' ? 'holographic' : 'computational'
            }
            intensity={interactiveLevel === 'subtle' ? 'subtle' : 
                      interactiveLevel === 'moderate' ? 'moderate' : 
                      interactiveLevel === 'dynamic' ? 'dynamic' : 'explosive'}
            interactive={true}
            colorScheme={
              glowColor.includes('3b82f6') ? 'blue' :
              glowColor.includes('8b5cf6') ? 'purple' :
              glowColor.includes('ec4899') ? 'rainbow' :
              glowColor.includes('00ff') ? 'quantum' : 'blue'
            }
            className="w-full h-full"
          >
            {children}
          </InteractiveAnimations>
          
          {/* Corner Sparkles */}
          {isHovered && (
            <div className="corner-sparkles">
              <div className="corner-sparkle"></div>
              <div className="corner-sparkle"></div>
              <div className="corner-sparkle"></div>
              <div className="corner-sparkle"></div>
            </div>
          )}
          
          {/* Floating Particles */}
          {isHovered && animationType === 'sparkle' && (
            <div className="floating-particles">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${(i * 12.5)}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `3s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Mouse Follow Glow */}
          {isHovered && animationType === 'flow' && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: mousePosition.y - 50,
                left: mousePosition.x - 50,
                width: 100,
                height: 100,
                background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
                borderRadius: '50%',
                transition: 'all 0.1s ease-out'
              }}
            />
          )}
        </Card>
      </div>
    </>
  );
}
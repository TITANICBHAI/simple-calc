"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
// import { Canvas, useFrame, useThree } from '@react-three/fiber';
// import { Text, Sphere, Box, Torus, Cone } from '@react-three/drei';
// import * as THREE from 'three';

interface InteractiveAnimationProps {
  type: 'mathematical' | 'computational' | 'statistical' | 'quantum' | 'neural' | 'holographic';
  intensity?: 'subtle' | 'moderate' | 'dynamic' | 'explosive';
  interactive?: boolean;
  colorScheme?: 'blue' | 'purple' | 'rainbow' | 'matrix' | 'quantum' | 'fire';
  children?: React.ReactNode;
  className?: string;
}

// Floating mathematical symbols
const MathematicalFloaters = ({ intensity = 'moderate', colorScheme = 'blue' }: { intensity: string; colorScheme: string }) => {
  const symbols = ['∫', '∂', '∑', '∏', '√', '∞', 'π', 'φ', 'θ', 'λ', 'μ', 'σ', 'Ω', '∇', '∆', '≈', '≡', '≠', '≤', '≥'];
  const [floaters, setFloaters] = useState<Array<{ id: number; symbol: string; x: number; y: number; delay: number; duration: number }>>([]);

  const colorMap = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    rainbow: '#ec4899',
    matrix: '#00ff41',
    quantum: '#00ffff',
    fire: '#ff4500'
  };

  useEffect(() => {
    const count = intensity === 'subtle' ? 8 : intensity === 'moderate' ? 15 : intensity === 'dynamic' ? 25 : 40;
    const newFloaters = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4
    }));
    setFloaters(newFloaters);
  }, [intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {floaters.map((floater) => (
        <motion.div
          key={floater.id}
          className="absolute text-2xl font-bold opacity-30"
          style={{
            left: `${floater.x}%`,
            top: `${floater.y}%`,
            color: colorMap[colorScheme as keyof typeof colorMap]
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.3 }}
        >
          {floater.symbol}
        </motion.div>
      ))}
    </div>
  );
};

// 3D Geometric Visualizer - temporarily disabled for compatibility
const GeometricVisualizer = ({ type, intensity }: { type: string; intensity: string }) => {
  return <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg" />;
};

// Energy Ripples Effect
const EnergyRipples = ({ intensity, colorScheme }: { intensity: string; colorScheme: string }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);

  const colorMap = {
    blue: 'rgba(59, 130, 246, 0.4)',
    purple: 'rgba(139, 92, 246, 0.4)',
    rainbow: 'rgba(236, 72, 153, 0.4)',
    matrix: 'rgba(0, 255, 65, 0.4)',
    quantum: 'rgba(0, 255, 255, 0.4)',
    fire: 'rgba(255, 69, 0, 0.4)'
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (intensity === 'subtle') return;
    
    const newRipple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    };
    
    setRipples(prev => [...prev.slice(-5), newRipple]);
  }, [intensity]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Clean up old ripples
  useEffect(() => {
    const interval = setInterval(() => {
      setRipples(prev => prev.filter(ripple => Date.now() - ripple.timestamp < 2000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full border-2"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            borderColor: colorMap[colorScheme as keyof typeof colorMap]
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: intensity === 'explosive' ? 400 : 200, 
            height: intensity === 'explosive' ? 400 : 200, 
            opacity: 0 
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Holographic Grid
const HolographicGrid = ({ intensity }: { intensity: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <motion.div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: intensity === 'explosive' ? '20px 20px' : '40px 40px'
        }}
        animate={{}}
        transition={{}}
      />
    </div>
  );
};

// Neural Network Visualization
const NeuralNetworkViz = ({ intensity }: { intensity: string }) => {
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number; active: boolean }>>([]);
  const [connections, setConnections] = useState<Array<{ from: number; to: number; active: boolean }>>([]);

  useEffect(() => {
    const nodeCount = intensity === 'subtle' ? 12 : intensity === 'moderate' ? 20 : 30;
    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: 10 + (i % 6) * 80 + Math.random() * 20,
      y: 10 + Math.floor(i / 6) * 80 + Math.random() * 20,
      active: false
    }));
    
    const newConnections = [];
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        if (Math.random() < 0.3) {
          newConnections.push({ from: i, to: j, active: false });
        }
      }
    }
    
    setNodes(newNodes);
    setConnections(newConnections);
  }, [intensity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        active: Math.random() < 0.3
      })));
      
      setConnections(prev => prev.map(conn => ({
        ...conn,
        active: Math.random() < 0.2
      })));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full opacity-40">
        {/* Connections */}
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={nodes[conn.from]?.x}
            y1={nodes[conn.from]?.y}
            x2={nodes[conn.to]?.x}
            y2={nodes[conn.to]?.y}
            stroke={conn.active ? "#00ff88" : "#333"}
            strokeWidth={conn.active ? 2 : 1}
            animate={{
              opacity: conn.active ? 0.5 : 0.2
            }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.active ? 8 : 4}
            fill={node.active ? "#00ff88" : "#666"}
            animate={{
              opacity: node.active ? 0.8 : 0.5
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export function InteractiveAnimations({
  type = 'mathematical',
  intensity = 'moderate',
  interactive = true,
  colorScheme = 'blue',
  children,
  className = ''
}: InteractiveAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Removed all movement animations

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [interactive, mouseX, mouseY]);

  useEffect(() => {
    if (!interactive) return;
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, interactive]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{}}

    >
      {/* Background Effects */}
      {type === 'mathematical' && <MathematicalFloaters intensity={intensity} colorScheme={colorScheme} />}
      {type === 'holographic' && <HolographicGrid intensity={intensity} />}
      {type === 'neural' && <NeuralNetworkViz intensity={intensity} />}
      
      {/* Energy Ripples */}
      {interactive && <EnergyRipples intensity={intensity} colorScheme={colorScheme} />}
      
      {/* 3D Visualization */}
      {(type === 'quantum' || type === 'mathematical') && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <GeometricVisualizer type={type} intensity={intensity} />
        </div>
      )}
      
      {/* Particle Systems for different types */}
      {type === 'computational' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Code-like streaming effect */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                ${colorScheme === 'matrix' ? '#00ff41' : '#3b82f6'}22 2px,
                ${colorScheme === 'matrix' ? '#00ff41' : '#3b82f6'}22 4px
              )`
            }}
            animate={{}}
            transition={{}}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Intensity-based overlay effects */}
      {intensity === 'explosive' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, ${
              colorScheme === 'fire' ? 'rgba(255, 69, 0, 0.1)' : 
              colorScheme === 'quantum' ? 'rgba(0, 255, 255, 0.1)' : 
              'rgba(59, 130, 246, 0.1)'
            } 100%)`
          }}
          animate={{ opacity: 0.5 }}
        />
      )}
    </motion.div>
  );
}

export default InteractiveAnimations;
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { Play, Pause, Square, RotateCcw, Download, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  x: number;
  y: number;
  z?: number;
  timestamp: number;
  value: number;
}

interface VisualizationConfig {
  type: '2d_plot' | '3d_surface' | 'heatmap' | 'network' | 'flow_field' | 'particle_system';
  updateRate: number;
  dataPoints: number;
  colorScheme: 'rainbow' | 'plasma' | 'viridis' | 'cool' | 'hot';
  showGrid: boolean;
  showAxes: boolean;
  animated: boolean;
  realtime: boolean;
}

export default function RealtimeDataVisualizer() {
  const [isRunning, setIsRunning] = useState(false);
  const [dataStream, setDataStream] = useState<DataPoint[]>([]);
  const [config, setConfig] = useState<VisualizationConfig>({
    type: '2d_plot',
    updateRate: 50,
    dataPoints: 100,
    colorScheme: 'rainbow',
    showGrid: true,
    showAxes: true,
    animated: true,
    realtime: true
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dataGeneratorRef = useRef<NodeJS.Timeout>();

  // Mathematical function generators
  const generateMathematicalData = useCallback((type: string, time: number): DataPoint[] => {
    const data: DataPoint[] = [];
    const timestamp = Date.now();
    
    switch (type) {
      case 'sine_wave':
        for (let i = 0; i < config.dataPoints; i++) {
          const x = (i / config.dataPoints) * 4 * Math.PI;
          const y = Math.sin(x + time * 0.05) * Math.cos(x * 0.3);
          data.push({ x, y, timestamp, value: y });
        }
        break;
        
      case 'lorenz_attractor':
        // Lorenz system simulation
        let x = 1, y = 1, z = 1;
        const dt = 0.01;
        const sigma = 10, rho = 28, beta = 8/3;
        
        for (let i = 0; i < config.dataPoints; i++) {
          const dx = sigma * (y - x);
          const dy = x * (rho - z) - y;
          const dz = x * y - beta * z;
          
          x += dx * dt;
          y += dy * dt;
          z += dz * dt;
          
          data.push({ x, y, z, timestamp, value: Math.sqrt(x*x + y*y + z*z) });
        }
        break;
        
      case 'neural_activity':
        // Simulated neural network activity
        for (let i = 0; i < config.dataPoints; i++) {
          const baseActivity = Math.sin(i * 0.1 + time * 0.02);
          const noise = (Math.random() - 0.5) * 0.5;
          const spike = Math.random() < 0.1 ? Math.random() * 2 : 0;
          const y = baseActivity + noise + spike;
          data.push({ x: i, y, timestamp, value: y });
        }
        break;
        
      case 'quantum_field':
        // Quantum field fluctuations
        for (let i = 0; i < config.dataPoints; i++) {
          const x = (i / config.dataPoints) * 10 - 5;
          const waveFunction = Math.exp(-x*x/2) * Math.cos(x * 3 + time * 0.1);
          const uncertainty = (Math.random() - 0.5) * 0.2;
          const y = waveFunction + uncertainty;
          data.push({ x, y, timestamp, value: y * y }); // Probability density
        }
        break;
        
      case 'fractal_growth':
        // Fractal pattern generation
        const centerX = 0, centerY = 0;
        for (let i = 0; i < config.dataPoints; i++) {
          const angle = (i / config.dataPoints) * 4 * Math.PI;
          const radius = Math.sqrt(i) * 0.1;
          const fractalNoise = Math.sin(angle * 5 + time * 0.03) * 0.2;
          const x = centerX + radius * Math.cos(angle) * (1 + fractalNoise);
          const y = centerY + radius * Math.sin(angle) * (1 + fractalNoise);
          data.push({ x, y, timestamp, value: radius });
        }
        break;
        
      default:
        // Default: Random walk
        for (let i = 0; i < config.dataPoints; i++) {
          const x = i;
          const y = Math.random() * 2 - 1;
          data.push({ x, y, timestamp, value: y });
        }
    }
    
    return data;
  }, [config.dataPoints]);

  // Canvas rendering
  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataStream.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate bounds
    const xValues = dataStream.map(d => d.x);
    const yValues = dataStream.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / (maxX - minX);
    const scaleY = (canvas.height - 2 * padding) / (maxY - minY);
    
    // Transform coordinates
    const transform = (x: number, y: number) => ({
      x: padding + (x - minX) * scaleX,
      y: canvas.height - padding - (y - minY) * scaleY
    });
    
    // Draw grid
    if (config.showGrid) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * (canvas.width - 2 * padding);
        const y = padding + (i / 10) * (canvas.height - 2 * padding);
        
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }
    }
    
    // Draw axes
    if (config.showAxes) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      
      const origin = transform(0, 0);
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(padding, origin.y);
      ctx.lineTo(canvas.width - padding, origin.y);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(origin.x, padding);
      ctx.lineTo(origin.x, canvas.height - padding);
      ctx.stroke();
    }
    
    // Render based on visualization type
    switch (config.type) {
      case '2d_plot':
        renderLinePlot(ctx, dataStream, transform);
        break;
      case 'heatmap':
        renderHeatmap(ctx, dataStream, canvas.width, canvas.height, padding);
        break;
      case 'network':
        renderNetworkGraph(ctx, dataStream, canvas.width, canvas.height);
        break;
      case 'flow_field':
        renderFlowField(ctx, dataStream, canvas.width, canvas.height);
        break;
      case 'particle_system':
        renderParticleSystem(ctx, dataStream, canvas.width, canvas.height);
        break;
    }
    
  }, [dataStream, config]);

  const renderLinePlot = (ctx: CanvasRenderingContext2D, data: DataPoint[], transform: (x: number, y: number) => {x: number, y: number}) => {
    if (data.length < 2) return;
    
    // Create gradient based on color scheme
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    
    switch (config.colorScheme) {
      case 'rainbow':
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.16, '#ff8000');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.66, '#0080ff');
        gradient.addColorStop(0.83, '#8000ff');
        gradient.addColorStop(1, '#ff00ff');
        break;
      case 'plasma':
        gradient.addColorStop(0, '#0d0887');
        gradient.addColorStop(0.5, '#cc4778');
        gradient.addColorStop(1, '#f0f921');
        break;
      case 'viridis':
        gradient.addColorStop(0, '#440154');
        gradient.addColorStop(0.5, '#21908c');
        gradient.addColorStop(1, '#fde725');
        break;
      default:
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    const firstPoint = transform(data[0].x, data[0].y);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < data.length; i++) {
      const point = transform(data[i].x, data[i].y);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Add glow effect
    if (config.animated) {
      ctx.shadowColor = gradient;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw points
    data.forEach((point, index) => {
      const pos = transform(point.x, point.y);
      const alpha = config.animated ? 0.3 + 0.7 * (index / data.length) : 1;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = config.colorScheme === 'rainbow' ? 
        `hsl(${(index / data.length) * 360}, 100%, 50%)` : '#ffffff';
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
  };

  const renderHeatmap = (ctx: CanvasRenderingContext2D, data: DataPoint[], width: number, height: number, padding: number) => {
    const gridSize = 20;
    const cellWidth = (width - 2 * padding) / gridSize;
    const cellHeight = (height - 2 * padding) / gridSize;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = padding + i * cellWidth;
        const y = padding + j * cellHeight;
        
        // Calculate heat value based on data proximity
        let heat = 0;
        data.forEach(point => {
          const dx = (i / gridSize) - (point.x / 10);
          const dy = (j / gridSize) - (point.y / 10);
          const distance = Math.sqrt(dx * dx + dy * dy);
          heat += Math.exp(-distance * 10) * Math.abs(point.value);
        });
        
        const normalizedHeat = Math.min(1, heat / 5);
        const hue = (1 - normalizedHeat) * 240; // Blue to red
        
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${normalizedHeat})`;
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }
    }
  };

  const renderNetworkGraph = (ctx: CanvasRenderingContext2D, data: DataPoint[], width: number, height: number) => {
    const nodes = data.slice(0, 20); // Limit for performance
    
    // Draw connections
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 3) {
          const x1 = (nodes[i].x + 10) * width / 20;
          const y1 = (nodes[i].y + 10) * height / 20;
          const x2 = (nodes[j].x + 10) * width / 20;
          const y2 = (nodes[j].y + 10) * height / 20;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    nodes.forEach((node, index) => {
      const x = (node.x + 10) * width / 20;
      const y = (node.y + 10) * height / 20;
      const radius = 5 + Math.abs(node.value) * 10;
      
      ctx.fillStyle = `hsl(${index * 20}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pulse effect
      if (config.animated) {
        ctx.strokeStyle = `hsl(${index * 20}, 70%, 80%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  const renderFlowField = (ctx: CanvasRenderingContext2D, data: DataPoint[], width: number, height: number) => {
    const gridSize = 15;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * cellWidth + cellWidth / 2;
        const y = j * cellHeight + cellHeight / 2;
        
        // Calculate flow direction based on nearby data
        let angle = 0;
        let magnitude = 0;
        
        data.forEach(point => {
          const dx = x - (point.x + 10) * width / 20;
          const dy = y - (point.y + 10) * height / 20;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            angle += Math.atan2(dy, dx) * (1 / (1 + distance * 0.01));
            magnitude += Math.abs(point.value) * (1 / (1 + distance * 0.01));
          }
        });
        
        const arrowLength = Math.min(20, magnitude * 5);
        const endX = x + Math.cos(angle) * arrowLength;
        const endY = y + Math.sin(angle) * arrowLength;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrow head
        const headLength = 5;
        const headAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - headAngle),
          endY - headLength * Math.sin(angle - headAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle + headAngle),
          endY - headLength * Math.sin(angle + headAngle)
        );
        ctx.stroke();
      }
    }
  };

  const renderParticleSystem = (ctx: CanvasRenderingContext2D, data: DataPoint[], width: number, height: number) => {
    data.forEach((particle, index) => {
      const x = (particle.x + 10) * width / 20;
      const y = (particle.y + 10) * height / 20;
      const size = 2 + Math.abs(particle.value) * 5;
      
      // Particle trail effect
      const trailLength = 10;
      for (let i = 0; i < trailLength; i++) {
        const alpha = (trailLength - i) / trailLength * 0.5;
        const trailX = x - i * 2;
        const hue = (index * 10 + i * 5) % 360;
        
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(trailX, y, size * (1 - i / trailLength), 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Main particle
      const hue = (index * 10) % 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Glow effect
      if (config.animated) {
        ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  };

  // Data generation and animation loop
  useEffect(() => {
    if (isRunning && config.realtime) {
      let frameCount = 0;
      
      const generateData = () => {
        const newData = generateMathematicalData('sine_wave', frameCount);
        setDataStream(newData);
        frameCount++;
      };
      
      dataGeneratorRef.current = setInterval(generateData, config.updateRate);
      
      return () => {
        if (dataGeneratorRef.current) {
          clearInterval(dataGeneratorRef.current);
        }
      };
    }
  }, [isRunning, config.realtime, config.updateRate, generateMathematicalData]);

  // Render loop
  useEffect(() => {
    const animate = () => {
      renderVisualization();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderVisualization]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setDataStream([]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setDataStream([]);
    setConfig(prev => ({ ...prev }));
  };

  const generateStaticData = (type: string) => {
    const data = generateMathematicalData(type, 0);
    setDataStream(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Real-time Data Visualizer</h2>
          <p className="text-gray-600 mt-2">Interactive mathematical visualization with live data streaming</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRunning ? "default" : "secondary"} className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            {isRunning ? 'LIVE' : 'STOPPED'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatedGlowCard 
            glowColor="#3b82f6" 
            intensity="medium" 
            animationType="flow"
            className="h-fit"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Playback Controls */}
              <div className="flex space-x-2">
                <Button onClick={handleStart} disabled={isRunning} size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button onClick={handlePause} disabled={!isRunning} size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
                <Button onClick={handleStop} size="sm">
                  <Square className="h-4 w-4" />
                </Button>
                <Button onClick={handleReset} size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Visualization Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Visualization Type</label>
                <Select 
                  value={config.type} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2d_plot">2D Line Plot</SelectItem>
                    <SelectItem value="heatmap">Heatmap</SelectItem>
                    <SelectItem value="network">Network Graph</SelectItem>
                    <SelectItem value="flow_field">Flow Field</SelectItem>
                    <SelectItem value="particle_system">Particle System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Update Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Rate: {config.updateRate}ms</label>
                <Slider
                  value={[config.updateRate]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, updateRate: value }))}
                  min={10}
                  max={1000}
                  step={10}
                />
              </div>

              {/* Data Points */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Points: {config.dataPoints}</label>
                <Slider
                  value={[config.dataPoints]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, dataPoints: value }))}
                  min={10}
                  max={500}
                  step={10}
                />
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Scheme</label>
                <Select 
                  value={config.colorScheme} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, colorScheme: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainbow">Rainbow</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                    <SelectItem value="viridis">Viridis</SelectItem>
                    <SelectItem value="cool">Cool</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </AnimatedGlowCard>

          {/* Data Generator */}
          <AnimatedGlowCard 
            glowColor="#8b5cf6" 
            intensity="medium" 
            animationType="sparkle"
          >
            <CardHeader>
              <CardTitle>Data Generators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => generateStaticData('sine_wave')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Sine Wave
              </Button>
              <Button 
                onClick={() => generateStaticData('lorenz_attractor')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Lorenz Attractor
              </Button>
              <Button 
                onClick={() => generateStaticData('neural_activity')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Neural Activity
              </Button>
              <Button 
                onClick={() => generateStaticData('quantum_field')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Quantum Field
              </Button>
              <Button 
                onClick={() => generateStaticData('fractal_growth')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Fractal Growth
              </Button>
            </CardContent>
          </AnimatedGlowCard>
        </div>

        {/* Visualization Canvas */}
        <div className="lg:col-span-3">
          <AnimatedGlowCard 
            glowColor="#ec4899" 
            intensity="high" 
            animationType="mathematical"
            className="h-[600px]"
          >
            <CardContent className="p-6 h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full bg-black rounded-lg border border-gray-700"
                style={{ imageRendering: 'pixelated' }}
              />
            </CardContent>
          </AnimatedGlowCard>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedGlowCard glowColor="#10b981" intensity="low" animationType="pulse">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{dataStream.length}</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </CardContent>
        </AnimatedGlowCard>
        
        <AnimatedGlowCard glowColor="#f59e0b" intensity="low" animationType="pulse">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {dataStream.length > 0 ? Math.max(...dataStream.map(d => d.value)).toFixed(3) : '0.000'}
            </div>
            <div className="text-sm text-gray-600">Max Value</div>
          </CardContent>
        </AnimatedGlowCard>
        
        <AnimatedGlowCard glowColor="#ef4444" intensity="low" animationType="pulse">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {dataStream.length > 0 ? Math.min(...dataStream.map(d => d.value)).toFixed(3) : '0.000'}
            </div>
            <div className="text-sm text-gray-600">Min Value</div>
          </CardContent>
        </AnimatedGlowCard>
        
        <AnimatedGlowCard glowColor="#8b5cf6" intensity="low" animationType="pulse">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dataStream.length > 0 ? 
                (dataStream.reduce((sum, d) => sum + d.value, 0) / dataStream.length).toFixed(3) : 
                '0.000'
              }
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </CardContent>
        </AnimatedGlowCard>
      </div>
    </div>
  );
}
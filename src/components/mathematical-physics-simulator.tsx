"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Atom, Zap, GitBranch, Share2, Rocket, 
  Infinity, Activity, ChevronRight, BarChart3,
  BookOpen, Server, Wand2, Compass, Globe,
  Eye, Layers, Pause, Play
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimulationState {
  time: number;
  energy: number;
  position: { x: number; y: number; z: number };
  momentum: { px: number; py: number; pz: number };
  wavefunction: Array<{
    position: { x: number; y: number };
    probability: number;
    phase: number;
  }>;
  expectationValues: {
    position: number;
    momentum: number;
    energy: number;
    uncertainty: number;
  };
  quantumNumbers: {
    n: number; // Principal quantum number
    l: number; // Azimuthal quantum number
    m: number; // Magnetic quantum number
    s: number; // Spin quantum number
  };
}

interface PhysicsSystem {
  id: string;
  name: string;
  description: string;
  category: 'quantum' | 'relativity' | 'classical' | 'statistical';
  complexity: 'basic' | 'intermediate' | 'advanced' | 'research';
  parameters: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    step: number;
    default: number;
    unit: string;
    description: string;
  }>;
}

export default function MathematicalPhysicsSimulator() {
  // Primary simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [simulationTime, setSimulationTime] = useState(0);
  const [activeSystem, setActiveSystem] = useState('hydrogen_atom');
  const [activeTab, setActiveTab] = useState('quantum');
  const [renderQuality, setRenderQuality] = useState('high');
  
  // Canvas for real-time visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation frame ID for cleanup
  const animationRef = useRef<number>(0);
  
  // Parameter states for various systems
  const [potentialType, setPotentialType] = useState('harmonic');
  const [potentialWidth, setPotentialWidth] = useState(5.0);
  const [potentialHeight, setPotentialHeight] = useState(10.0);
  const [quantumN, setQuantumN] = useState(1);
  const [quantumL, setQuantumL] = useState(0);
  const [quantumM, setQuantumM] = useState(0);
  
  // Visualization parameters
  const [showProbabilityDensity, setShowProbabilityDensity] = useState(true);
  const [showPhase, setShowPhase] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [sliceView, setSliceView] = useState('xy');
  
  // Available physics systems for simulation
  const availableSystems: PhysicsSystem[] = [
    {
      id: 'hydrogen_atom',
      name: 'Hydrogen Atom',
      description: 'Quantum mechanical model of a hydrogen atom with electron orbitals',
      category: 'quantum',
      complexity: 'intermediate',
      parameters: [
        {
          id: 'n',
          name: 'Principal Quantum Number (n)',
          min: 1,
          max: 5,
          step: 1,
          default: 1,
          unit: '',
          description: 'Determines the energy level and overall size of the orbital'
        },
        {
          id: 'l',
          name: 'Azimuthal Quantum Number (l)',
          min: 0,
          max: 4,
          step: 1,
          default: 0,
          unit: '',
          description: 'Determines the shape of the orbital (s, p, d, f, etc.)'
        },
        {
          id: 'm',
          name: 'Magnetic Quantum Number (m)',
          min: -3,
          max: 3,
          step: 1,
          default: 0,
          unit: '',
          description: 'Determines the orientation of the orbital in space'
        }
      ]
    },
    {
      id: 'quantum_harmonic_oscillator',
      name: 'Quantum Harmonic Oscillator',
      description: 'Quantum mechanical model of a particle in a parabolic potential well',
      category: 'quantum',
      complexity: 'intermediate',
      parameters: [
        {
          id: 'n',
          name: 'Energy Level (n)',
          min: 0,
          max: 10,
          step: 1,
          default: 0,
          unit: '',
          description: 'Quantum number determining the energy state'
        },
        {
          id: 'omega',
          name: 'Angular Frequency (ω)',
          min: 0.1,
          max: 5.0,
          step: 0.1,
          default: 1.0,
          unit: 'rad/s',
          description: 'Determines the "stiffness" of the oscillator'
        },
        {
          id: 'mass',
          name: 'Particle Mass (m)',
          min: 0.1,
          max: 10.0,
          step: 0.1,
          default: 1.0,
          unit: 'kg',
          description: 'Effective mass of the quantum particle'
        }
      ]
    },
    {
      id: 'quantum_tunneling',
      name: 'Quantum Tunneling',
      description: 'Simulation of a quantum particle tunneling through a potential barrier',
      category: 'quantum',
      complexity: 'advanced',
      parameters: [
        {
          id: 'energy',
          name: 'Particle Energy (E)',
          min: 0.1,
          max: 20.0,
          step: 0.1,
          default: 5.0,
          unit: 'eV',
          description: 'Energy of the incoming particle'
        },
        {
          id: 'barrier_height',
          name: 'Barrier Height (V₀)',
          min: 1.0,
          max: 30.0,
          step: 0.5,
          default: 10.0,
          unit: 'eV',
          description: 'Height of the potential barrier'
        },
        {
          id: 'barrier_width',
          name: 'Barrier Width (a)',
          min: 0.1,
          max: 5.0,
          step: 0.1,
          default: 1.0,
          unit: 'nm',
          description: 'Width of the tunneling barrier'
        }
      ]
    },
    {
      id: 'double_slit',
      name: 'Double-Slit Experiment',
      description: 'Quantum interference demonstration with wave-particle duality',
      category: 'quantum',
      complexity: 'advanced',
      parameters: [
        {
          id: 'slit_separation',
          name: 'Slit Separation (d)',
          min: 0.1,
          max: 2.0,
          step: 0.05,
          default: 0.5,
          unit: 'μm',
          description: 'Distance between the two slits'
        },
        {
          id: 'wavelength',
          name: 'Particle Wavelength (λ)',
          min: 0.1,
          max: 1.0,
          step: 0.01,
          default: 0.5,
          unit: 'μm',
          description: 'de Broglie wavelength of the particles'
        },
        {
          id: 'screen_distance',
          name: 'Screen Distance (L)',
          min: 1.0,
          max: 10.0,
          step: 0.5,
          default: 5.0,
          unit: 'm',
          description: 'Distance from slits to detection screen'
        }
      ]
    }
  ];

  // Simulation functions
  const calculateWavefunction = (system: string, time: number, params: any) => {
    const wavefunction = [];
    const gridSize = 100;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i - gridSize/2) * 0.1;
        const y = (j - gridSize/2) * 0.1;
        
        let probability = 0;
        let phase = 0;
        
        switch (system) {
          case 'hydrogen_atom':
            // Simplified hydrogen orbital calculation
            const r = Math.sqrt(x*x + y*y);
            const n = params.n || 1;
            const l = params.l || 0;
            
            if (l === 0) { // s-orbital
              probability = Math.exp(-2*r/n) * Math.pow(r, l);
            } else if (l === 1) { // p-orbital
              probability = Math.exp(-r/n) * Math.pow(r, l) * Math.abs(x);
            }
            phase = time * 0.1;
            break;
            
          case 'quantum_harmonic_oscillator':
            // Quantum harmonic oscillator wavefunction
            const omega = params.omega || 1.0;
            const n_level = params.n || 0;
            const alpha = Math.sqrt(omega);
            
            probability = Math.exp(-alpha * alpha * (x*x + y*y) / 2) * 
                         Math.pow(alpha * Math.sqrt(x*x + y*y), n_level);
            phase = -omega * (n_level + 0.5) * time;
            break;
            
          case 'quantum_tunneling':
            // Wave packet for tunneling simulation
            const k = Math.sqrt(2 * (params.energy || 5.0));
            const barrier_pos = 0;
            const barrier_width = params.barrier_width || 1.0;
            
            if (Math.abs(x - barrier_pos) < barrier_width/2) {
              // Inside barrier - exponential decay
              probability = Math.exp(-Math.abs(x - barrier_pos)) * 
                           Math.exp(-(y*y)/2);
            } else {
              // Outside barrier - propagating wave
              probability = Math.exp(-(y*y)/2) * Math.exp(-((x-time)*k)/10);
            }
            phase = k * x - params.energy * time;
            break;
            
          case 'double_slit':
            // Double-slit interference pattern
            const slit_sep = params.slit_separation || 0.5;
            const wavelength = params.wavelength || 0.5;
            const k_wave = 2 * Math.PI / wavelength;
            
            const r1 = Math.sqrt((x - slit_sep/2)**2 + y**2);
            const r2 = Math.sqrt((x + slit_sep/2)**2 + y**2);
            
            // Simplified interference calculation (avoiding complex numbers for now)
            const phase1 = k_wave * r1;
            const phase2 = k_wave * r2;
            
            // Simplified interference calculation
            probability = Math.cos(k_wave * (r1 - r2))**2 * Math.exp(-y*y/2);
            phase = k_wave * (r1 + r2) / 2;
            break;
        }
        
        wavefunction.push({
          position: { x, y },
          probability: Math.max(0, probability),
          phase: phase % (2 * Math.PI)
        });
      }
    }
    
    return wavefunction;
  };

  const calculateExpectationValues = (wavefunction: SimulationState['wavefunction']) => {
    let avgPosition = 0;
    let avgMomentum = 0;
    let avgEnergy = 0;
    let totalProb = 0;
    
    wavefunction.forEach(point => {
      const prob = point.probability;
      avgPosition += prob * Math.sqrt(point.position.x**2 + point.position.y**2);
      avgMomentum += prob * Math.cos(point.phase); // Simplified momentum
      avgEnergy += prob * (point.position.x**2 + point.position.y**2 + Math.cos(point.phase)**2);
      totalProb += prob;
    });
    
    if (totalProb > 0) {
      avgPosition /= totalProb;
      avgMomentum /= totalProb;
      avgEnergy /= totalProb;
    }
    
    // Calculate uncertainty
    let variance = 0;
    wavefunction.forEach(point => {
      const pos = Math.sqrt(point.position.x**2 + point.position.y**2);
      variance += point.probability * (pos - avgPosition)**2;
    });
    variance /= totalProb || 1;
    
    return {
      position: avgPosition,
      momentum: avgMomentum,
      energy: avgEnergy,
      uncertainty: Math.sqrt(variance)
    };
  };

  const runSimulation = () => {
    if (!isSimulating) return;
    
    const currentSystem = availableSystems.find(s => s.id === activeSystem);
    if (!currentSystem) return;
    
    const params = {
      n: quantumN,
      l: quantumL,
      m: quantumM,
      omega: 1.0,
      mass: 1.0,
      energy: 5.0,
      barrier_height: potentialHeight,
      barrier_width: potentialWidth,
      slit_separation: 0.5,
      wavelength: 0.5,
      screen_distance: 5.0
    };
    
    const wavefunction = calculateWavefunction(activeSystem, simulationTime, params);
    const expectationValues = calculateExpectationValues(wavefunction);
    
    const newState: SimulationState = {
      time: simulationTime,
      energy: expectationValues.energy,
      position: { x: 0, y: 0, z: 0 },
      momentum: { px: expectationValues.momentum, py: 0, pz: 0 },
      wavefunction,
      expectationValues,
      quantumNumbers: { n: quantumN, l: quantumL, m: quantumM, s: 0.5 }
    };
    
    setSimulationState(newState);
    setSimulationTime(prev => prev + 0.1 * simulationSpeed);
    
    // Draw on canvas
    drawVisualization(newState);
    
    // Continue animation
    animationRef.current = requestAnimationFrame(runSimulation);
  };

  const drawVisualization = (state: SimulationState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20;
    
    // Draw probability density
    if (showProbabilityDensity) {
      state.wavefunction.forEach(point => {
        const x = centerX + point.position.x * scale;
        const y = centerY + point.position.y * scale;
        const intensity = Math.min(255, point.probability * 255);
        
        ctx.fillStyle = `rgba(0, 100, 255, ${intensity / 255})`;
        ctx.fillRect(x-1, y-1, 2, 2);
      });
    }
    
    // Draw phase information
    if (showPhase) {
      state.wavefunction.forEach(point => {
        if (point.probability > 0.1) { // Only show phase for significant probabilities
          const x = centerX + point.position.x * scale;
          const y = centerY + point.position.y * scale;
          const hue = (point.phase / (2 * Math.PI)) * 360;
          
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
          ctx.fillRect(x-0.5, y-0.5, 1, 1);
        }
      });
    }
    
    // Draw expectation value marker
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
      centerX + state.expectationValues.position * scale * Math.cos(state.time), 
      centerY + state.expectationValues.position * scale * Math.sin(state.time), 
      3, 0, 2 * Math.PI
    );
    ctx.fill();
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      toast({
        title: "Simulation Paused",
        description: "Physics simulation has been paused."
      });
    } else {
      setIsSimulating(true);
      toast({
        title: "Simulation Started",
        description: `Running ${availableSystems.find(s => s.id === activeSystem)?.name} simulation.`
      });
      runSimulation();
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationTime(0);
    setSimulationState(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    toast({
      title: "Simulation Reset",
      description: "All simulation parameters have been reset."
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const currentSystem = availableSystems.find(s => s.id === activeSystem);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Atom className="h-6 w-6 text-blue-500" />
            <CardTitle>Mathematical Physics Simulator</CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Advanced
            </Badge>
          </div>
          <CardDescription>
            Explore quantum mechanics, relativity, and advanced physics through interactive simulations
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* System Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Physics System</Label>
              <Badge variant="outline">
                {currentSystem?.complexity || 'intermediate'}
              </Badge>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quantum">Quantum</TabsTrigger>
                <TabsTrigger value="relativity">Relativity</TabsTrigger>
                <TabsTrigger value="classical">Classical</TabsTrigger>
                <TabsTrigger value="statistical">Statistical</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quantum" className="space-y-4">
                <Select value={activeSystem} onValueChange={setActiveSystem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSystems.filter(s => s.category === 'quantum').map(system => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.name} - {system.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="relativity" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Rocket className="h-12 w-12 mx-auto mb-2" />
                  <p>Relativity simulations coming soon!</p>
                  <p className="text-sm">Special & General Relativity models</p>
                </div>
              </TabsContent>
              
              <TabsContent value="classical" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2" />
                  <p>Classical mechanics simulations coming soon!</p>
                  <p className="text-sm">Newtonian dynamics & oscillations</p>
                </div>
              </TabsContent>
              
              <TabsContent value="statistical" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Statistical physics simulations coming soon!</p>
                  <p className="text-sm">Thermodynamics & kinetic theory</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Parameters */}
          {currentSystem && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Simulation Parameters</Label>
              
              {currentSystem.parameters.map(param => (
                <div key={param.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{param.name}</Label>
                    <Badge variant="outline" className="text-xs">
                      {param.unit}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[param.id === 'n' ? quantumN : param.id === 'l' ? quantumL : param.id === 'm' ? quantumM : param.default]}
                      onValueChange={(value) => {
                        if (param.id === 'n') setQuantumN(value[0]);
                        else if (param.id === 'l') setQuantumL(value[0]);
                        else if (param.id === 'm') setQuantumM(value[0]);
                      }}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono min-w-[3rem]">
                      {param.id === 'n' ? quantumN : param.id === 'l' ? quantumL : param.id === 'm' ? quantumM : param.default}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Visualization Canvas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Real-time Visualization</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showProbabilityDensity}
                  onCheckedChange={setShowProbabilityDensity}
                />
                <Label className="text-sm">Probability</Label>
                <Switch
                  checked={showPhase}
                  onCheckedChange={setShowPhase}
                />
                <Label className="text-sm">Phase</Label>
              </div>
            </div>
            
            <Card className="p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full border rounded-lg bg-black"
                style={{ maxHeight: '400px' }}
              />
            </Card>
          </div>

          {/* Simulation Results */}
          {simulationState && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Simulation Results</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {simulationState.expectationValues.energy.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Energy (eV)</div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {simulationState.expectationValues.position.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">⟨x⟩ (nm)</div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {simulationState.expectationValues.momentum.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">⟨p⟩ (ħ/nm)</div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {simulationState.expectationValues.uncertainty.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Δx (nm)</div>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Simulation Time:</span>
                  <span className="font-mono">{simulationState.time.toFixed(2)} fs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Quantum Numbers:</span>
                  <span className="font-mono">
                    n={simulationState.quantumNumbers.n}, 
                    l={simulationState.quantumNumbers.l}, 
                    m={simulationState.quantumNumbers.m}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button onClick={toggleSimulation}>
              {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isSimulating ? 'Pause' : 'Start'} Simulation
            </Button>
            
            <Button variant="outline" onClick={resetSimulation}>
              Reset
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Speed:</Label>
            <Select value={simulationSpeed.toString()} onValueChange={(value) => setSimulationSpeed(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">0.1x</SelectItem>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
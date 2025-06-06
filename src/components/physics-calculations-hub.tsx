"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Atom, Zap, Thermometer, Waves, Target, 
  Calculator, Brain, Star, Crown, Award
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhysicsCalculation {
  category: 'quantum' | 'thermodynamics' | 'mechanics' | 'electromagnetism' | 'optics' | 'nuclear';
  formula: string;
  result: number | string;
  unit: string;
  steps: string[];
  constants: { [key: string]: number };
}

export default function PhysicsCalculationsHub() {
  const [activeCategory, setActiveCategory] = useState<string>('quantum');
  const [calculation, setCalculation] = useState<PhysicsCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Physics Constants
  const physicsConstants = {
    c: 299792458, // Speed of light (m/s)
    h: 6.62607015e-34, // Planck constant (J⋅s)
    hbar: 1.054571817e-34, // Reduced Planck constant
    k: 1.380649e-23, // Boltzmann constant (J/K)
    e: 1.602176634e-19, // Elementary charge (C)
    me: 9.1093837015e-31, // Electron mass (kg)
    mp: 1.67262192369e-27, // Proton mass (kg)
    Na: 6.02214076e23, // Avogadro's number
    R: 8.314462618, // Gas constant (J/(mol⋅K))
    G: 6.67430e-11, // Gravitational constant
    ε0: 8.8541878128e-12, // Vacuum permittivity
    μ0: 1.25663706212e-6, // Vacuum permeability
    σ: 5.670374419e-8, // Stefan-Boltzmann constant
    α: 7.2973525693e-3, // Fine structure constant
  };

  const physicsCategories = [
    { 
      id: 'quantum', 
      name: 'Quantum Mechanics', 
      icon: Atom,
      color: 'from-purple-500 to-pink-500',
      topics: ['Schrödinger Equation', 'Wave Functions', 'Uncertainty Principle', 'Energy Levels']
    },
    { 
      id: 'thermodynamics', 
      name: 'Thermodynamics', 
      icon: Thermometer,
      color: 'from-red-500 to-orange-500',
      topics: ['Heat Transfer', 'Entropy', 'Gas Laws', 'Phase Transitions']
    },
    { 
      id: 'mechanics', 
      name: 'Classical Mechanics', 
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      topics: ['Lagrangian', 'Hamiltonian', 'Oscillations', 'Gravitation']
    },
    { 
      id: 'electromagnetism', 
      name: 'Electromagnetism', 
      icon: Zap,
      color: 'from-yellow-500 to-green-500',
      topics: ['Maxwell Equations', 'Electric Fields', 'Magnetic Fields', 'EM Waves']
    },
    { 
      id: 'optics', 
      name: 'Optics & Waves', 
      icon: Waves,
      color: 'from-indigo-500 to-purple-500',
      topics: ['Interference', 'Diffraction', 'Polarization', 'Laser Physics']
    },
    { 
      id: 'nuclear', 
      name: 'Nuclear Physics', 
      icon: Atom,
      color: 'from-green-500 to-blue-500',
      topics: ['Radioactive Decay', 'Nuclear Reactions', 'Binding Energy', 'Fission/Fusion']
    }
  ];

  const performPhysicsCalculation = async (category: string, inputs: any) => {
    setIsCalculating(true);
    setProgress(0);

    try {
      const steps = [
        'Parsing physics parameters...',
        'Applying fundamental constants...',
        'Solving differential equations...',
        'Computing numerical solutions...',
        'Verifying physical constraints...',
        'Generating results...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(((i + 1) / steps.length) * 100);
      }

      let result: PhysicsCalculation;

      switch (category) {
        case 'quantum':
          result = calculateQuantumMechanics(inputs);
          break;
        case 'thermodynamics':
          result = calculateThermodynamics(inputs);
          break;
        case 'mechanics':
          result = calculateMechanics(inputs);
          break;
        case 'electromagnetism':
          result = calculateElectromagnetism(inputs);
          break;
        case 'optics':
          result = calculateOptics(inputs);
          break;
        case 'nuclear':
          result = calculateNuclearPhysics(inputs);
          break;
        default:
          throw new Error('Unknown physics category');
      }

      setCalculation(result);
      toast({
        title: "Physics Calculation Complete",
        description: `${category} calculation completed successfully.`,
      });

    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to perform physics calculation.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
      setProgress(0);
    }
  };

  const calculateQuantumMechanics = (inputs: any): PhysicsCalculation => {
    // Example: Calculate energy levels of hydrogen atom
    const n = inputs.principalQuantumNumber || 1;
    const energy = -13.6 / (n * n); // eV
    
    return {
      category: 'quantum',
      formula: 'E_n = -13.6 eV / n²',
      result: energy,
      unit: 'eV',
      steps: [
        'Apply Bohr model for hydrogen atom',
        `Use principal quantum number n = ${n}`,
        'Calculate energy level using Rydberg formula',
        `Result: E_${n} = ${energy} eV`
      ],
      constants: { Rydberg: 13.6 }
    };
  };

  const calculateThermodynamics = (inputs: any): PhysicsCalculation => {
    // Example: Ideal gas law calculation
    const pressure = inputs.pressure || 101325; // Pa
    const volume = inputs.volume || 0.001; // m³
    const temperature = pressure * volume / (physicsConstants.R * inputs.moles || 1);
    
    return {
      category: 'thermodynamics',
      formula: 'PV = nRT',
      result: temperature,
      unit: 'K',
      steps: [
        'Apply ideal gas law',
        `P = ${pressure} Pa, V = ${volume} m³`,
        'Solve for temperature T',
        `T = PV/(nR) = ${temperature.toFixed(2)} K`
      ],
      constants: { R: physicsConstants.R }
    };
  };

  const calculateMechanics = (inputs: any): PhysicsCalculation => {
    // Example: Simple harmonic motion
    const mass = inputs.mass || 1; // kg
    const springConstant = inputs.springConstant || 100; // N/m
    const frequency = Math.sqrt(springConstant / mass) / (2 * Math.PI);
    
    return {
      category: 'mechanics',
      formula: 'f = (1/2π)√(k/m)',
      result: frequency,
      unit: 'Hz',
      steps: [
        'Apply simple harmonic motion formula',
        `m = ${mass} kg, k = ${springConstant} N/m`,
        'Calculate natural frequency',
        `f = ${frequency.toFixed(3)} Hz`
      ],
      constants: { pi: Math.PI }
    };
  };

  const calculateElectromagnetism = (inputs: any): PhysicsCalculation => {
    // Example: Electric field calculation
    const charge = inputs.charge || 1e-6; // C
    const distance = inputs.distance || 0.1; // m
    const electricField = charge / (4 * Math.PI * physicsConstants.ε0 * distance * distance);
    
    return {
      category: 'electromagnetism',
      formula: 'E = Q/(4πε₀r²)',
      result: electricField,
      unit: 'N/C',
      steps: [
        'Apply Coulomb\'s law for electric field',
        `Q = ${charge} C, r = ${distance} m`,
        'Calculate electric field strength',
        `E = ${electricField.toExponential(3)} N/C`
      ],
      constants: { ε0: physicsConstants.ε0 }
    };
  };

  const calculateOptics = (inputs: any): PhysicsCalculation => {
    // Example: Wavelength calculation
    const frequency = inputs.frequency || 5e14; // Hz
    const wavelength = physicsConstants.c / frequency;
    
    return {
      category: 'optics',
      formula: 'λ = c/f',
      result: wavelength * 1e9, // Convert to nm
      unit: 'nm',
      steps: [
        'Apply wave equation for electromagnetic radiation',
        `f = ${frequency.toExponential(2)} Hz`,
        'Calculate wavelength using speed of light',
        `λ = ${(wavelength * 1e9).toFixed(1)} nm`
      ],
      constants: { c: physicsConstants.c }
    };
  };

  const calculateNuclearPhysics = (inputs: any): PhysicsCalculation => {
    // Example: Radioactive decay
    const halfLife = inputs.halfLife || 3600; // seconds
    const decayConstant = Math.log(2) / halfLife;
    
    return {
      category: 'nuclear',
      formula: 'λ = ln(2)/t₁/₂',
      result: decayConstant,
      unit: 's⁻¹',
      steps: [
        'Apply radioactive decay law',
        `t₁/₂ = ${halfLife} s`,
        'Calculate decay constant',
        `λ = ${decayConstant.toExponential(3)} s⁻¹`
      ],
      constants: { ln2: Math.log(2) }
    };
  };

  const currentCategory = physicsCategories.find(cat => cat.id === activeCategory);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <CardTitle>Advanced Physics Calculations Hub</CardTitle>
            <Badge variant="secondary">Professional</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {physicsCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    <category.icon className="h-4 w-4 mr-1" />
                    {category.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {physicsCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className={`p-4 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="h-6 w-6" />
                    <h3 className="text-xl font-bold">{category.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <h4 className="font-semibold">Input Parameters</h4>
                      
                      {category.id === 'quantum' && (
                        <div>
                          <Label>Principal Quantum Number (n)</Label>
                          <Input type="number" defaultValue="1" min="1" />
                        </div>
                      )}
                      
                      {category.id === 'thermodynamics' && (
                        <>
                          <div>
                            <Label>Pressure (Pa)</Label>
                            <Input type="number" defaultValue="101325" />
                          </div>
                          <div>
                            <Label>Volume (m³)</Label>
                            <Input type="number" step="0.001" defaultValue="0.001" />
                          </div>
                          <div>
                            <Label>Amount (mol)</Label>
                            <Input type="number" step="0.1" defaultValue="1" />
                          </div>
                        </>
                      )}
                      
                      {category.id === 'mechanics' && (
                        <>
                          <div>
                            <Label>Mass (kg)</Label>
                            <Input type="number" step="0.1" defaultValue="1" />
                          </div>
                          <div>
                            <Label>Spring Constant (N/m)</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                        </>
                      )}
                      
                      {category.id === 'electromagnetism' && (
                        <>
                          <div>
                            <Label>Charge (C)</Label>
                            <Input type="number" step="1e-6" defaultValue="0.000001" />
                          </div>
                          <div>
                            <Label>Distance (m)</Label>
                            <Input type="number" step="0.01" defaultValue="0.1" />
                          </div>
                        </>
                      )}
                      
                      {category.id === 'optics' && (
                        <div>
                          <Label>Frequency (Hz)</Label>
                          <Input type="number" defaultValue="500000000000000" />
                        </div>
                      )}
                      
                      {category.id === 'nuclear' && (
                        <div>
                          <Label>Half-life (seconds)</Label>
                          <Input type="number" defaultValue="3600" />
                        </div>
                      )}

                      <Button 
                        onClick={() => performPhysicsCalculation(category.id, {})}
                        disabled={isCalculating}
                        className="w-full"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate {category.name}
                      </Button>

                      {isCalculating && (
                        <div className="space-y-2">
                          <Progress value={progress} />
                          <p className="text-sm text-muted-foreground text-center">
                            Processing physics calculation...
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {calculation && calculation.category === category.id && (
                    <Card>
                      <CardContent className="pt-4 space-y-4">
                        <h4 className="font-semibold">Calculation Results</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Formula:</span>
                            <code className="text-sm">{calculation.formula}</code>
                          </div>
                          <div className="flex justify-between">
                            <span>Result:</span>
                            <span className="font-mono">{calculation.result} {calculation.unit}</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Solution Steps:</h5>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            {calculation.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Constants Used:</h5>
                          <div className="grid grid-cols-1 gap-1 text-sm">
                            {Object.entries(calculation.constants).map(([name, value]) => (
                              <div key={name} className="flex justify-between">
                                <span>{name}:</span>
                                <span className="font-mono">{typeof value === 'number' ? value.toExponential(3) : value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
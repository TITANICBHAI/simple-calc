/**
 * Advanced Physics Engine
 * Comprehensive physics equation database and calculation engine
 */

export interface PhysicsEquation {
  id: string;
  name: string;
  category: string;
  formula: string;
  variables: { [key: string]: PhysicsVariable };
  description: string;
  units: string;
  derivation?: string;
  applications: string[];
  relatedEquations: string[];
}

export interface PhysicsVariable {
  symbol: string;
  name: string;
  unit: string;
  description: string;
  defaultValue?: number;
  constraints?: {
    min?: number;
    max?: number;
    positive?: boolean;
  };
}

export interface PhysicsCalculation {
  equation: PhysicsEquation;
  inputs: { [key: string]: number };
  result: number;
  units: string;
  steps: CalculationStep[];
  uncertaintyAnalysis?: UncertaintyAnalysis;
}

export interface CalculationStep {
  step: number;
  description: string;
  formula: string;
  substitution: string;
  result: string;
}

export interface UncertaintyAnalysis {
  inputUncertainties: { [key: string]: number };
  outputUncertainty: number;
  contributionsByVariable: { [key: string]: number };
  method: 'linear_propagation' | 'monte_carlo';
}

export interface PhysicsConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  uncertainty?: number;
  description: string;
}

export class AdvancedPhysicsEngine {
  private static readonly PHYSICS_CONSTANTS: { [key: string]: PhysicsConstant } = {
    c: {
      symbol: 'c',
      name: 'Speed of light in vacuum',
      value: 299792458,
      unit: 'm/s',
      uncertainty: 0,
      description: 'The speed of light in vacuum'
    },
    h: {
      symbol: 'h',
      name: 'Planck constant',
      value: 6.62607015e-34,
      unit: 'J⋅s',
      uncertainty: 0,
      description: 'Planck constant'
    },
    hbar: {
      symbol: 'ℏ',
      name: 'Reduced Planck constant',
      value: 1.054571817e-34,
      unit: 'J⋅s',
      uncertainty: 0,
      description: 'Reduced Planck constant (h/2π)'
    },
    e: {
      symbol: 'e',
      name: 'Elementary charge',
      value: 1.602176634e-19,
      unit: 'C',
      uncertainty: 0,
      description: 'Elementary charge'
    },
    me: {
      symbol: 'me',
      name: 'Electron rest mass',
      value: 9.1093837015e-31,
      unit: 'kg',
      uncertainty: 2.8e-40,
      description: 'Electron rest mass'
    },
    mp: {
      symbol: 'mp',
      name: 'Proton rest mass',
      value: 1.67262192369e-27,
      unit: 'kg',
      uncertainty: 5.1e-37,
      description: 'Proton rest mass'
    },
    NA: {
      symbol: 'NA',
      name: 'Avogadro constant',
      value: 6.02214076e23,
      unit: 'mol⁻¹',
      uncertainty: 0,
      description: 'Avogadro constant'
    },
    k: {
      symbol: 'k',
      name: 'Boltzmann constant',
      value: 1.380649e-23,
      unit: 'J/K',
      uncertainty: 0,
      description: 'Boltzmann constant'
    },
    R: {
      symbol: 'R',
      name: 'Universal gas constant',
      value: 8.314462618,
      unit: 'J/(mol⋅K)',
      uncertainty: 0,
      description: 'Universal gas constant'
    },
    G: {
      symbol: 'G',
      name: 'Gravitational constant',
      value: 6.67430e-11,
      unit: 'm³/(kg⋅s²)',
      uncertainty: 1.5e-15,
      description: 'Gravitational constant'
    },
    g: {
      symbol: 'g',
      name: 'Standard gravity',
      value: 9.80665,
      unit: 'm/s²',
      uncertainty: 0,
      description: 'Standard acceleration due to gravity'
    },
    epsilon0: {
      symbol: 'ε₀',
      name: 'Electric permittivity of free space',
      value: 8.8541878128e-12,
      unit: 'F/m',
      uncertainty: 1.3e-21,
      description: 'Electric permittivity of free space'
    },
    mu0: {
      symbol: 'μ₀',
      name: 'Magnetic permeability of free space',
      value: 1.25663706212e-6,
      unit: 'H/m',
      uncertainty: 1.9e-16,
      description: 'Magnetic permeability of free space'
    }
  };

  private static readonly PHYSICS_EQUATIONS: { [key: string]: PhysicsEquation } = {
    // Classical Mechanics
    newton_second_law: {
      id: 'newton_second_law',
      name: "Newton's Second Law",
      category: 'Classical Mechanics',
      formula: 'F = m * a',
      variables: {
        F: { symbol: 'F', name: 'Force', unit: 'N', description: 'Net force applied to object' },
        m: { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object', constraints: { positive: true } },
        a: { symbol: 'a', name: 'Acceleration', unit: 'm/s²', description: 'Acceleration of the object' }
      },
      description: 'The force acting on an object is equal to its mass times its acceleration',
      units: 'N',
      applications: ['Dynamics', 'Force analysis', 'Motion prediction'],
      relatedEquations: ['kinematic_equations', 'momentum']
    },

    kinematic_position: {
      id: 'kinematic_position',
      name: 'Kinematic Equation for Position',
      category: 'Classical Mechanics',
      formula: 's = ut + (1/2) * a * t^2',
      variables: {
        s: { symbol: 's', name: 'Displacement', unit: 'm', description: 'Displacement from initial position' },
        u: { symbol: 'u', name: 'Initial velocity', unit: 'm/s', description: 'Initial velocity' },
        a: { symbol: 'a', name: 'Acceleration', unit: 'm/s²', description: 'Constant acceleration' },
        t: { symbol: 't', name: 'Time', unit: 's', description: 'Time elapsed', constraints: { positive: true } }
      },
      description: 'Position as a function of time under constant acceleration',
      units: 'm',
      applications: ['Projectile motion', 'Free fall', 'Kinematics'],
      relatedEquations: ['kinematic_velocity', 'kinematic_velocity_squared']
    },

    kinematic_velocity: {
      id: 'kinematic_velocity',
      name: 'Kinematic Equation for Velocity',
      category: 'Classical Mechanics',
      formula: 'v = u + a * t',
      variables: {
        v: { symbol: 'v', name: 'Final velocity', unit: 'm/s', description: 'Final velocity' },
        u: { symbol: 'u', name: 'Initial velocity', unit: 'm/s', description: 'Initial velocity' },
        a: { symbol: 'a', name: 'Acceleration', unit: 'm/s²', description: 'Constant acceleration' },
        t: { symbol: 't', name: 'Time', unit: 's', description: 'Time elapsed', constraints: { positive: true } }
      },
      description: 'Velocity as a function of time under constant acceleration',
      units: 'm/s',
      applications: ['Motion analysis', 'Velocity calculations'],
      relatedEquations: ['kinematic_position', 'kinematic_velocity_squared']
    },

    momentum: {
      id: 'momentum',
      name: 'Linear Momentum',
      category: 'Classical Mechanics',
      formula: 'p = m * v',
      variables: {
        p: { symbol: 'p', name: 'Momentum', unit: 'kg⋅m/s', description: 'Linear momentum' },
        m: { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object', constraints: { positive: true } },
        v: { symbol: 'v', name: 'Velocity', unit: 'm/s', description: 'Velocity of the object' }
      },
      description: 'Linear momentum of an object',
      units: 'kg⋅m/s',
      applications: ['Collision analysis', 'Conservation laws'],
      relatedEquations: ['newton_second_law', 'impulse']
    },

    work_energy: {
      id: 'work_energy',
      name: 'Work-Energy Theorem',
      category: 'Classical Mechanics',
      formula: 'W = F * d * cos(θ)',
      variables: {
        W: { symbol: 'W', name: 'Work done', unit: 'J', description: 'Work done by the force' },
        F: { symbol: 'F', name: 'Force', unit: 'N', description: 'Applied force', constraints: { positive: true } },
        d: { symbol: 'd', name: 'Distance', unit: 'm', description: 'Distance moved', constraints: { positive: true } },
        θ: { symbol: 'θ', name: 'Angle', unit: 'rad', description: 'Angle between force and displacement' }
      },
      description: 'Work done by a constant force',
      units: 'J',
      applications: ['Energy calculations', 'Work analysis'],
      relatedEquations: ['kinetic_energy', 'potential_energy']
    },

    kinetic_energy: {
      id: 'kinetic_energy',
      name: 'Kinetic Energy',
      category: 'Classical Mechanics',
      formula: 'KE = (1/2) * m * v^2',
      variables: {
        KE: { symbol: 'KE', name: 'Kinetic energy', unit: 'J', description: 'Kinetic energy of the object' },
        m: { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object', constraints: { positive: true } },
        v: { symbol: 'v', name: 'Velocity', unit: 'm/s', description: 'Velocity of the object' }
      },
      description: 'Kinetic energy of a moving object',
      units: 'J',
      applications: ['Energy analysis', 'Collision problems'],
      relatedEquations: ['work_energy', 'potential_energy']
    },

    gravitational_potential_energy: {
      id: 'gravitational_potential_energy',
      name: 'Gravitational Potential Energy',
      category: 'Classical Mechanics',
      formula: 'PE = m * g * h',
      variables: {
        PE: { symbol: 'PE', name: 'Potential energy', unit: 'J', description: 'Gravitational potential energy' },
        m: { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the object', constraints: { positive: true } },
        g: { symbol: 'g', name: 'Gravitational acceleration', unit: 'm/s²', description: 'Acceleration due to gravity', defaultValue: 9.81 },
        h: { symbol: 'h', name: 'Height', unit: 'm', description: 'Height above reference point' }
      },
      description: 'Gravitational potential energy of an object',
      units: 'J',
      applications: ['Energy conservation', 'Gravitational systems'],
      relatedEquations: ['kinetic_energy', 'conservation_of_energy']
    },

    // Thermodynamics
    ideal_gas_law: {
      id: 'ideal_gas_law',
      name: 'Ideal Gas Law',
      category: 'Thermodynamics',
      formula: 'P * V = n * R * T',
      variables: {
        P: { symbol: 'P', name: 'Pressure', unit: 'Pa', description: 'Gas pressure', constraints: { positive: true } },
        V: { symbol: 'V', name: 'Volume', unit: 'm³', description: 'Gas volume', constraints: { positive: true } },
        n: { symbol: 'n', name: 'Amount of substance', unit: 'mol', description: 'Number of moles', constraints: { positive: true } },
        R: { symbol: 'R', name: 'Gas constant', unit: 'J/(mol⋅K)', description: 'Universal gas constant', defaultValue: 8.314 },
        T: { symbol: 'T', name: 'Temperature', unit: 'K', description: 'Absolute temperature', constraints: { positive: true } }
      },
      description: 'Equation of state for an ideal gas',
      units: 'Pa⋅m³',
      applications: ['Gas behavior', 'Thermodynamic processes'],
      relatedEquations: ['boyles_law', 'charles_law']
    },

    first_law_thermodynamics: {
      id: 'first_law_thermodynamics',
      name: 'First Law of Thermodynamics',
      category: 'Thermodynamics',
      formula: 'ΔU = Q - W',
      variables: {
        ΔU: { symbol: 'ΔU', name: 'Change in internal energy', unit: 'J', description: 'Change in internal energy' },
        Q: { symbol: 'Q', name: 'Heat added', unit: 'J', description: 'Heat added to the system' },
        W: { symbol: 'W', name: 'Work done by system', unit: 'J', description: 'Work done by the system' }
      },
      description: 'Energy conservation in thermodynamic processes',
      units: 'J',
      applications: ['Heat engines', 'Thermodynamic cycles'],
      relatedEquations: ['second_law_thermodynamics', 'heat_capacity']
    },

    heat_capacity: {
      id: 'heat_capacity',
      name: 'Heat Capacity',
      category: 'Thermodynamics',
      formula: 'Q = m * c * ΔT',
      variables: {
        Q: { symbol: 'Q', name: 'Heat energy', unit: 'J', description: 'Heat energy transferred' },
        m: { symbol: 'm', name: 'Mass', unit: 'kg', description: 'Mass of the substance', constraints: { positive: true } },
        c: { symbol: 'c', name: 'Specific heat capacity', unit: 'J/(kg⋅K)', description: 'Specific heat capacity', constraints: { positive: true } },
        ΔT: { symbol: 'ΔT', name: 'Temperature change', unit: 'K', description: 'Change in temperature' }
      },
      description: 'Heat required to change temperature',
      units: 'J',
      applications: ['Calorimetry', 'Heat transfer'],
      relatedEquations: ['first_law_thermodynamics', 'thermal_conductivity']
    },

    // Electromagnetism
    coulombs_law: {
      id: 'coulombs_law',
      name: "Coulomb's Law",
      category: 'Electromagnetism',
      formula: 'F = k * |q1 * q2| / r^2',
      variables: {
        F: { symbol: 'F', name: 'Electric force', unit: 'N', description: 'Electric force between charges' },
        k: { symbol: 'k', name: 'Coulomb constant', unit: 'N⋅m²/C²', description: 'Coulomb constant', defaultValue: 8.99e9 },
        q1: { symbol: 'q₁', name: 'First charge', unit: 'C', description: 'First electric charge' },
        q2: { symbol: 'q₂', name: 'Second charge', unit: 'C', description: 'Second electric charge' },
        r: { symbol: 'r', name: 'Distance', unit: 'm', description: 'Distance between charges', constraints: { positive: true } }
      },
      description: 'Force between two point charges',
      units: 'N',
      applications: ['Electrostatics', 'Electric field calculations'],
      relatedEquations: ['electric_field', 'electric_potential']
    },

    ohms_law: {
      id: 'ohms_law',
      name: "Ohm's Law",
      category: 'Electromagnetism',
      formula: 'V = I * R',
      variables: {
        V: { symbol: 'V', name: 'Voltage', unit: 'V', description: 'Voltage across resistor' },
        I: { symbol: 'I', name: 'Current', unit: 'A', description: 'Electric current through resistor' },
        R: { symbol: 'R', name: 'Resistance', unit: 'Ω', description: 'Electrical resistance', constraints: { positive: true } }
      },
      description: 'Relationship between voltage, current, and resistance',
      units: 'V',
      applications: ['Circuit analysis', 'Electrical engineering'],
      relatedEquations: ['electrical_power', 'kirchhoffs_laws']
    },

    electrical_power: {
      id: 'electrical_power',
      name: 'Electrical Power',
      category: 'Electromagnetism',
      formula: 'P = V * I',
      variables: {
        P: { symbol: 'P', name: 'Power', unit: 'W', description: 'Electrical power' },
        V: { symbol: 'V', name: 'Voltage', unit: 'V', description: 'Voltage' },
        I: { symbol: 'I', name: 'Current', unit: 'A', description: 'Electric current' }
      },
      description: 'Power dissipated in electrical circuit',
      units: 'W',
      applications: ['Power calculations', 'Energy efficiency'],
      relatedEquations: ['ohms_law', 'joule_heating']
    },

    // Wave Physics
    wave_equation: {
      id: 'wave_equation',
      name: 'Wave Equation',
      category: 'Wave Physics',
      formula: 'v = f * λ',
      variables: {
        v: { symbol: 'v', name: 'Wave speed', unit: 'm/s', description: 'Speed of the wave', constraints: { positive: true } },
        f: { symbol: 'f', name: 'Frequency', unit: 'Hz', description: 'Frequency of the wave', constraints: { positive: true } },
        λ: { symbol: 'λ', name: 'Wavelength', unit: 'm', description: 'Wavelength of the wave', constraints: { positive: true } }
      },
      description: 'Relationship between wave speed, frequency, and wavelength',
      units: 'm/s',
      applications: ['Sound waves', 'Light waves', 'Water waves'],
      relatedEquations: ['doppler_effect', 'wave_interference']
    },

    // Quantum Mechanics
    planck_energy: {
      id: 'planck_energy',
      name: 'Planck Energy Relation',
      category: 'Quantum Mechanics',
      formula: 'E = h * f',
      variables: {
        E: { symbol: 'E', name: 'Energy', unit: 'J', description: 'Energy of photon' },
        h: { symbol: 'h', name: 'Planck constant', unit: 'J⋅s', description: 'Planck constant', defaultValue: 6.626e-34 },
        f: { symbol: 'f', name: 'Frequency', unit: 'Hz', description: 'Frequency of electromagnetic radiation', constraints: { positive: true } }
      },
      description: 'Energy of a photon',
      units: 'J',
      applications: ['Quantum mechanics', 'Photoelectric effect'],
      relatedEquations: ['de_broglie_wavelength', 'photoelectric_effect']
    },

    de_broglie_wavelength: {
      id: 'de_broglie_wavelength',
      name: 'de Broglie Wavelength',
      category: 'Quantum Mechanics',
      formula: 'λ = h / p',
      variables: {
        λ: { symbol: 'λ', name: 'de Broglie wavelength', unit: 'm', description: 'Matter wave wavelength' },
        h: { symbol: 'h', name: 'Planck constant', unit: 'J⋅s', description: 'Planck constant', defaultValue: 6.626e-34 },
        p: { symbol: 'p', name: 'Momentum', unit: 'kg⋅m/s', description: 'Momentum of particle', constraints: { positive: true } }
      },
      description: 'Wavelength of matter waves',
      units: 'm',
      applications: ['Quantum mechanics', 'Electron microscopy'],
      relatedEquations: ['planck_energy', 'uncertainty_principle']
    },

    // Relativity
    mass_energy_equivalence: {
      id: 'mass_energy_equivalence',
      name: 'Mass-Energy Equivalence',
      category: 'Relativity',
      formula: 'E = m * c^2',
      variables: {
        E: { symbol: 'E', name: 'Energy', unit: 'J', description: 'Rest energy' },
        m: { symbol: 'm', name: 'Rest mass', unit: 'kg', description: 'Rest mass of object', constraints: { positive: true } },
        c: { symbol: 'c', name: 'Speed of light', unit: 'm/s', description: 'Speed of light in vacuum', defaultValue: 299792458 }
      },
      description: 'Equivalence between mass and energy',
      units: 'J',
      applications: ['Nuclear physics', 'Particle physics'],
      relatedEquations: ['relativistic_energy', 'time_dilation']
    },

    time_dilation: {
      id: 'time_dilation',
      name: 'Time Dilation',
      category: 'Relativity',
      formula: 'Δt = Δt₀ / √(1 - v²/c²)',
      variables: {
        dt: { symbol: 'Δt', name: 'Dilated time', unit: 's', description: 'Time measured by stationary observer' },
        dt0: { symbol: 'Δt₀', name: 'Proper time', unit: 's', description: 'Time measured in moving frame', constraints: { positive: true } },
        v: { symbol: 'v', name: 'Velocity', unit: 'm/s', description: 'Relative velocity', constraints: { positive: true } },
        c: { symbol: 'c', name: 'Speed of light', unit: 'm/s', description: 'Speed of light in vacuum', defaultValue: 299792458 }
      },
      description: 'Time dilation in special relativity',
      units: 's',
      applications: ['Special relativity', 'GPS satellites'],
      relatedEquations: ['length_contraction', 'mass_energy_equivalence']
    }
  };

  /**
   * Get all available physics equations
   */
  static getAllEquations(): PhysicsEquation[] {
    return Object.values(this.PHYSICS_EQUATIONS);
  }

  /**
   * Get equations by category
   */
  static getEquationsByCategory(category: string): PhysicsEquation[] {
    return Object.values(this.PHYSICS_EQUATIONS).filter(eq => eq.category === category);
  }

  /**
   * Get all available categories
   */
  static getCategories(): string[] {
    const categories = new Set(Object.values(this.PHYSICS_EQUATIONS).map(eq => eq.category));
    return Array.from(categories);
  }

  /**
   * Get physics equation by ID
   */
  static getEquation(id: string): PhysicsEquation | null {
    return this.PHYSICS_EQUATIONS[id] || null;
  }

  /**
   * Search equations by name or description
   */
  static searchEquations(query: string): PhysicsEquation[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.PHYSICS_EQUATIONS).filter(eq => 
      eq.name.toLowerCase().includes(lowerQuery) ||
      eq.description.toLowerCase().includes(lowerQuery) ||
      eq.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Calculate using a physics equation
   */
  static calculate(equationId: string, inputs: { [key: string]: number }): PhysicsCalculation {
    const equation = this.getEquation(equationId);
    if (!equation) {
      throw new Error(`Equation with ID '${equationId}' not found`);
    }

    // Validate inputs
    this.validateInputs(equation, inputs);

    // Determine what to solve for
    const unknownVariable = this.findUnknownVariable(equation, inputs);
    if (!unknownVariable) {
      throw new Error('No unknown variable to solve for');
    }

    // Calculate result
    const result = this.solveEquation(equation, inputs, unknownVariable);
    const steps = this.generateCalculationSteps(equation, inputs, unknownVariable, result);

    return {
      equation,
      inputs,
      result,
      units: equation.variables[unknownVariable].unit,
      steps
    };
  }

  /**
   * Calculate with uncertainty propagation
   */
  static calculateWithUncertainty(
    equationId: string,
    inputs: { [key: string]: number },
    uncertainties: { [key: string]: number }
  ): PhysicsCalculation {
    const calculation = this.calculate(equationId, inputs);
    
    // Linear uncertainty propagation
    const uncertaintyAnalysis = this.propagateUncertainty(
      calculation.equation,
      inputs,
      uncertainties,
      calculation.result
    );

    return {
      ...calculation,
      uncertaintyAnalysis
    };
  }

  /**
   * Get physics constants
   */
  static getConstants(): { [key: string]: PhysicsConstant } {
    return this.PHYSICS_CONSTANTS;
  }

  /**
   * Get constant by symbol
   */
  static getConstant(symbol: string): PhysicsConstant | null {
    return this.PHYSICS_CONSTANTS[symbol] || null;
  }

  /**
   * Unit conversion
   */
  static convertUnit(value: number, fromUnit: string, toUnit: string): number {
    // Implement unit conversion logic
    const conversionFactors = this.getConversionFactor(fromUnit, toUnit);
    return value * conversionFactors;
  }

  // === PRIVATE METHODS ===

  private static validateInputs(equation: PhysicsEquation, inputs: { [key: string]: number }): void {
    for (const [varName, value] of Object.entries(inputs)) {
      if (!(varName in equation.variables)) {
        throw new Error(`Variable '${varName}' is not part of equation '${equation.name}'`);
      }

      const variable = equation.variables[varName];
      const constraints = variable.constraints;

      if (constraints) {
        if (constraints.positive && value <= 0) {
          throw new Error(`Variable '${varName}' must be positive`);
        }
        if (constraints.min !== undefined && value < constraints.min) {
          throw new Error(`Variable '${varName}' must be >= ${constraints.min}`);
        }
        if (constraints.max !== undefined && value > constraints.max) {
          throw new Error(`Variable '${varName}' must be <= ${constraints.max}`);
        }
      }
    }
  }

  private static findUnknownVariable(equation: PhysicsEquation, inputs: { [key: string]: number }): string | null {
    const allVariables = Object.keys(equation.variables);
    const knownVariables = Object.keys(inputs);
    const unknownVariables = allVariables.filter(v => !knownVariables.includes(v));

    if (unknownVariables.length === 1) {
      return unknownVariables[0];
    }

    return null; // Either no unknowns or multiple unknowns
  }

  private static solveEquation(
    equation: PhysicsEquation,
    inputs: { [key: string]: number },
    unknownVariable: string
  ): number {
    // Add default values for constants
    const allInputs = { ...inputs };
    for (const [varName, variable] of Object.entries(equation.variables)) {
      if (variable.defaultValue !== undefined && !(varName in allInputs)) {
        allInputs[varName] = variable.defaultValue;
      }
    }

    // Solve based on equation ID (this would be more sophisticated in practice)
    switch (equation.id) {
      case 'newton_second_law':
        if (unknownVariable === 'F') return allInputs.m * allInputs.a;
        if (unknownVariable === 'm') return allInputs.F / allInputs.a;
        if (unknownVariable === 'a') return allInputs.F / allInputs.m;
        break;

      case 'kinematic_position':
        if (unknownVariable === 's') return allInputs.u * allInputs.t + 0.5 * allInputs.a * allInputs.t * allInputs.t;
        if (unknownVariable === 'u') return (allInputs.s - 0.5 * allInputs.a * allInputs.t * allInputs.t) / allInputs.t;
        if (unknownVariable === 'a') return 2 * (allInputs.s - allInputs.u * allInputs.t) / (allInputs.t * allInputs.t);
        if (unknownVariable === 't') {
          // Quadratic formula: at²/2 + ut - s = 0
          const discriminant = allInputs.u * allInputs.u + 2 * allInputs.a * allInputs.s;
          return (-allInputs.u + Math.sqrt(discriminant)) / allInputs.a;
        }
        break;

      case 'kinematic_velocity':
        if (unknownVariable === 'v') return allInputs.u + allInputs.a * allInputs.t;
        if (unknownVariable === 'u') return allInputs.v - allInputs.a * allInputs.t;
        if (unknownVariable === 'a') return (allInputs.v - allInputs.u) / allInputs.t;
        if (unknownVariable === 't') return (allInputs.v - allInputs.u) / allInputs.a;
        break;

      case 'momentum':
        if (unknownVariable === 'p') return allInputs.m * allInputs.v;
        if (unknownVariable === 'm') return allInputs.p / allInputs.v;
        if (unknownVariable === 'v') return allInputs.p / allInputs.m;
        break;

      case 'work_energy':
        if (unknownVariable === 'W') return allInputs.F * allInputs.d * Math.cos(allInputs.θ || 0);
        if (unknownVariable === 'F') return allInputs.W / (allInputs.d * Math.cos(allInputs.θ || 0));
        if (unknownVariable === 'd') return allInputs.W / (allInputs.F * Math.cos(allInputs.θ || 0));
        break;

      case 'kinetic_energy':
        if (unknownVariable === 'KE') return 0.5 * allInputs.m * allInputs.v * allInputs.v;
        if (unknownVariable === 'm') return 2 * allInputs.KE / (allInputs.v * allInputs.v);
        if (unknownVariable === 'v') return Math.sqrt(2 * allInputs.KE / allInputs.m);
        break;

      case 'gravitational_potential_energy':
        if (unknownVariable === 'PE') return allInputs.m * allInputs.g * allInputs.h;
        if (unknownVariable === 'm') return allInputs.PE / (allInputs.g * allInputs.h);
        if (unknownVariable === 'h') return allInputs.PE / (allInputs.m * allInputs.g);
        break;

      case 'ideal_gas_law':
        if (unknownVariable === 'P') return allInputs.n * allInputs.R * allInputs.T / allInputs.V;
        if (unknownVariable === 'V') return allInputs.n * allInputs.R * allInputs.T / allInputs.P;
        if (unknownVariable === 'n') return allInputs.P * allInputs.V / (allInputs.R * allInputs.T);
        if (unknownVariable === 'T') return allInputs.P * allInputs.V / (allInputs.n * allInputs.R);
        break;

      case 'heat_capacity':
        if (unknownVariable === 'Q') return allInputs.m * allInputs.c * allInputs.ΔT;
        if (unknownVariable === 'm') return allInputs.Q / (allInputs.c * allInputs.ΔT);
        if (unknownVariable === 'c') return allInputs.Q / (allInputs.m * allInputs.ΔT);
        if (unknownVariable === 'ΔT') return allInputs.Q / (allInputs.m * allInputs.c);
        break;

      case 'coulombs_law':
        if (unknownVariable === 'F') return allInputs.k * Math.abs(allInputs.q1 * allInputs.q2) / (allInputs.r * allInputs.r);
        if (unknownVariable === 'r') return Math.sqrt(allInputs.k * Math.abs(allInputs.q1 * allInputs.q2) / allInputs.F);
        break;

      case 'ohms_law':
        if (unknownVariable === 'V') return allInputs.I * allInputs.R;
        if (unknownVariable === 'I') return allInputs.V / allInputs.R;
        if (unknownVariable === 'R') return allInputs.V / allInputs.I;
        break;

      case 'electrical_power':
        if (unknownVariable === 'P') return allInputs.V * allInputs.I;
        if (unknownVariable === 'V') return allInputs.P / allInputs.I;
        if (unknownVariable === 'I') return allInputs.P / allInputs.V;
        break;

      case 'wave_equation':
        if (unknownVariable === 'v') return allInputs.f * allInputs.λ;
        if (unknownVariable === 'f') return allInputs.v / allInputs.λ;
        if (unknownVariable === 'λ') return allInputs.v / allInputs.f;
        break;

      case 'planck_energy':
        if (unknownVariable === 'E') return allInputs.h * allInputs.f;
        if (unknownVariable === 'f') return allInputs.E / allInputs.h;
        break;

      case 'de_broglie_wavelength':
        if (unknownVariable === 'λ') return allInputs.h / allInputs.p;
        if (unknownVariable === 'p') return allInputs.h / allInputs.λ;
        break;

      case 'mass_energy_equivalence':
        if (unknownVariable === 'E') return allInputs.m * allInputs.c * allInputs.c;
        if (unknownVariable === 'm') return allInputs.E / (allInputs.c * allInputs.c);
        break;

      case 'time_dilation':
        if (unknownVariable === 'Δt') {
          const gamma = 1 / Math.sqrt(1 - (allInputs.v * allInputs.v) / (allInputs.c * allInputs.c));
          return allInputs.Δt₀ * gamma;
        }
        break;

      default:
        throw new Error(`Solving for '${unknownVariable}' in equation '${equation.id}' is not implemented`);
    }

    throw new Error(`Unable to solve for '${unknownVariable}' in equation '${equation.id}'`);
  }

  private static generateCalculationSteps(
    equation: PhysicsEquation,
    inputs: { [key: string]: number },
    unknownVariable: string,
    result: number
  ): CalculationStep[] {
    const steps: CalculationStep[] = [];

    // Step 1: State the equation
    steps.push({
      step: 1,
      description: `Use ${equation.name}`,
      formula: equation.formula,
      substitution: '',
      result: ''
    });

    // Step 2: Substitute known values
    let substitutionFormula = equation.formula;
    for (const [varName, value] of Object.entries(inputs)) {
      const variable = equation.variables[varName];
      substitutionFormula = substitutionFormula.replace(
        new RegExp(`\\b${this.escapeRegex(variable.symbol)}\\b`, 'g'),
        `${value}`
      );
    }

    steps.push({
      step: 2,
      description: 'Substitute known values',
      formula: substitutionFormula,
      substitution: this.formatSubstitution(inputs, equation),
      result: ''
    });

    // Step 3: Solve for unknown
    steps.push({
      step: 3,
      description: `Solve for ${equation.variables[unknownVariable].symbol}`,
      formula: `${equation.variables[unknownVariable].symbol} = ${result.toExponential(4)}`,
      substitution: '',
      result: `${result.toExponential(4)} ${equation.variables[unknownVariable].unit}`
    });

    return steps;
  }

  private static propagateUncertainty(
    equation: PhysicsEquation,
    inputs: { [key: string]: number },
    uncertainties: { [key: string]: number },
    result: number
  ): UncertaintyAnalysis {
    // Linear uncertainty propagation using partial derivatives
    let totalUncertainty = 0;
    const contributions: { [key: string]: number } = {};

    for (const [varName, uncertainty] of Object.entries(uncertainties)) {
      if (varName in inputs) {
        // Calculate partial derivative numerically
        const delta = inputs[varName] * 0.001; // Small perturbation
        const inputsPlus = { ...inputs, [varName]: inputs[varName] + delta };
        const inputsMinus = { ...inputs, [varName]: inputs[varName] - delta };

        try {
          const unknownVar = this.findUnknownVariable(equation, inputs);
          if (unknownVar) {
            const resultPlus = this.solveEquation(equation, inputsPlus, unknownVar);
            const resultMinus = this.solveEquation(equation, inputsMinus, unknownVar);
            const partialDerivative = (resultPlus - resultMinus) / (2 * delta);

            const contribution = Math.pow(partialDerivative * uncertainty, 2);
            contributions[varName] = Math.sqrt(contribution);
            totalUncertainty += contribution;
          }
        } catch (error) {
          // Skip variables that can't be differentiated
          contributions[varName] = 0;
        }
      }
    }

    return {
      inputUncertainties: uncertainties,
      outputUncertainty: Math.sqrt(totalUncertainty),
      contributionsByVariable: contributions,
      method: 'linear_propagation'
    };
  }

  private static formatSubstitution(inputs: { [key: string]: number }, equation: PhysicsEquation): string {
    const substitutions = Object.entries(inputs).map(([varName, value]) => {
      const variable = equation.variables[varName];
      return `${variable.symbol} = ${value} ${variable.unit}`;
    });
    return substitutions.join(', ');
  }

  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private static getConversionFactor(fromUnit: string, toUnit: string): number {
    // Simplified unit conversion - would need comprehensive unit database
    const conversions: { [key: string]: { [key: string]: number } } = {
      'm': { 'cm': 100, 'mm': 1000, 'km': 0.001, 'ft': 3.28084, 'in': 39.3701 },
      'kg': { 'g': 1000, 'lb': 2.20462, 'oz': 35.274 },
      's': { 'min': 1/60, 'h': 1/3600, 'ms': 1000 },
      'J': { 'cal': 0.239006, 'kWh': 2.77778e-7, 'eV': 6.242e18 },
      'N': { 'lbf': 0.224809, 'kgf': 0.101972 },
      'Pa': { 'atm': 9.8692e-6, 'bar': 1e-5, 'psi': 0.000145038 },
      'K': { '°C': (k: number) => k - 273.15, '°F': (k: number) => (k - 273.15) * 9/5 + 32 },
      'V': { 'mV': 1000, 'kV': 0.001 },
      'A': { 'mA': 1000, 'µA': 1e6 },
      'W': { 'kW': 0.001, 'MW': 1e-6, 'hp': 0.00134102 }
    };

    if (fromUnit === toUnit) return 1;
    
    if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
      const factor = conversions[fromUnit][toUnit];
      return typeof factor === 'function' ? factor(1) : factor;
    }

    throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
  }
}
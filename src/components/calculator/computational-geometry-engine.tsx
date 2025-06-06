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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shapes, Hexagon, GitBranch, FileSymlink, Table, 
  Triangle, Square, Circle, Compass, Code, PenTool,
  Crosshair, Cpu, ChevronRight, BarChart3, Layers,
  Expand, Lightbulb, ArrowRight, Grid3X3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Point {
  x: number;
  y: number;
  z?: number;
  label?: string;
  properties?: {
    [key: string]: any;
  };
}

interface GeometricObject {
  type: 'point' | 'line' | 'polygon' | 'circle' | 'ellipse' | 'triangle' | 'quadrilateral' | 'spline' | 'mesh' | 'surface';
  points: Point[];
  properties: {
    label?: string;
    color?: string;
    area?: number;
    perimeter?: number;
    volume?: number;
    curvature?: number;
    centroid?: Point;
    [key: string]: any;
  };
}

interface ComputationResult {
  type: string;
  input: {
    objects: GeometricObject[];
    parameters: {
      [key: string]: any;
    };
  };
  output: {
    objects?: GeometricObject[];
    points?: Point[];
    value?: number;
    values?: number[];
    text?: string;
    properties?: {
      [key: string]: any;
    };
  };
  performance?: {
    timeMs: number;
    complexity: string;
    memoryUsage: string;
  };
  steps?: {
    description: string;
    objects?: GeometricObject[];
    points?: Point[];
    visualization?: string;
  }[];
}

interface AlgorithmInfo {
  id: string;
  name: string;
  category: 'basics' | 'triangulation' | 'computational' | 'optimization' | 'advanced' | 'research';
  complexity: string;
  description: string;
  inputs: {
    type: 'points' | 'polygon' | 'mesh' | 'function' | 'parameters';
    min?: number;
    max?: number;
    description: string;
  }[];
  parameters?: {
    id: string;
    name: string;
    type: 'number' | 'boolean' | 'string' | 'select';
    default: any;
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
    description: string;
  }[];
}

export default function ComputationalGeometryEngine() {
  // Main state
  const [inputMode, setInputMode] = useState<'manual' | 'random' | 'drawing' | 'file'>('manual');
  const [points, setPoints] = useState<Point[]>([]);
  const [objects, setObjects] = useState<GeometricObject[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('convex_hull');
  const [result, setResult] = useState<ComputationResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [computationProgress, setComputationProgress] = useState(0);
  const [visualizationMode, setVisualizationMode] = useState<'2d' | '3d' | 'interactive'>('2d');
  
  // Canvas for visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Parameters for algorithms
  const [pointCount, setPointCount] = useState(10);
  const [distributionType, setDistributionType] = useState('uniform');
  const [showStepByStep, setShowStepByStep] = useState(true);
  const [useHighPrecision, setUseHighPrecision] = useState(false);
  const [parameterValues, setParameterValues] = useState<{[key: string]: any}>({});
  
  // Manual point input
  const [manualX, setManualX] = useState('');
  const [manualY, setManualY] = useState('');
  
  // List of available algorithms
  const algorithms: AlgorithmInfo[] = [
    // Basic computational geometry
    {
      id: 'convex_hull',
      name: 'Convex Hull',
      category: 'basics',
      complexity: 'O(n log n)',
      description: 'Computes the convex hull of a set of points using Graham scan algorithm.',
      inputs: [
        { type: 'points', min: 3, description: 'Set of 2D points' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm Variant', 
          type: 'select', 
          default: 'graham', 
          options: [
            { value: 'graham', label: 'Graham Scan' },
            { value: 'jarvis', label: 'Jarvis March' },
            { value: 'quickhull', label: 'QuickHull' },
            { value: 'chan', label: 'Chan\'s Algorithm' }
          ],
          description: 'The specific convex hull algorithm to use'
        },
        { 
          id: 'includeColinear', 
          name: 'Include Colinear Points', 
          type: 'boolean', 
          default: false,
          description: 'Whether to include colinear points in the hull'
        }
      ]
    },
    {
      id: 'voronoi_diagram',
      name: 'Voronoi Diagram',
      category: 'basics',
      complexity: 'O(n log n)',
      description: 'Generates a Voronoi diagram for a set of points.',
      inputs: [
        { type: 'points', min: 2, description: 'Set of 2D generator points' }
      ],
      parameters: [
        { 
          id: 'boundingBox', 
          name: 'Bounding Box Size', 
          type: 'number', 
          default: 10, 
          min: 1, 
          max: 100,
          description: 'Size of the bounding box for the diagram'
        },
        { 
          id: 'relaxation', 
          name: 'Lloyd Relaxation Steps', 
          type: 'number', 
          default: 0, 
          min: 0, 
          max: 10,
          description: 'Number of Lloyd relaxation steps to perform'
        }
      ]
    },
    {
      id: 'delaunay_triangulation',
      name: 'Delaunay Triangulation',
      category: 'triangulation',
      complexity: 'O(n log n)',
      description: 'Computes a Delaunay triangulation of a set of points.',
      inputs: [
        { type: 'points', min: 3, description: 'Set of 2D points to triangulate' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm', 
          type: 'select', 
          default: 'bowyer_watson', 
          options: [
            { value: 'bowyer_watson', label: 'Bowyer-Watson' },
            { value: 'flip', label: 'Edge Flip' },
            { value: 'divide_conquer', label: 'Divide & Conquer' }
          ],
          description: 'The algorithm to use for triangulation'
        },
        { 
          id: 'quality', 
          name: 'Mesh Quality Optimization', 
          type: 'boolean', 
          default: false,
          description: 'Whether to optimize mesh for triangle quality'
        }
      ]
    },
    {
      id: 'point_in_polygon',
      name: 'Point in Polygon Test',
      category: 'basics',
      complexity: 'O(n)',
      description: 'Determines if a point is inside, outside, or on the boundary of a polygon.',
      inputs: [
        { type: 'polygon', min: 3, description: 'Polygon vertices' },
        { type: 'points', min: 1, description: 'Test points' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm', 
          type: 'select', 
          default: 'ray_casting', 
          options: [
            { value: 'ray_casting', label: 'Ray Casting' },
            { value: 'winding_number', label: 'Winding Number' },
            { value: 'barycentric', label: 'Barycentric (triangulated)' }
          ],
          description: 'The algorithm to use for the test'
        }
      ]
    },
    {
      id: 'line_intersection',
      name: 'Line Segment Intersection',
      category: 'basics',
      complexity: 'O(n log n)',
      description: 'Finds all intersections between a set of line segments using a sweepline algorithm.',
      inputs: [
        { type: 'points', min: 4, description: 'Endpoints of line segments (must be even number)' }
      ],
      parameters: [
        { 
          id: 'includeEndpoints', 
          name: 'Include Endpoints', 
          type: 'boolean', 
          default: true,
          description: 'Whether to include intersections at endpoints'
        },
        { 
          id: 'reportAll', 
          name: 'Report All Intersections', 
          type: 'boolean', 
          default: false,
          description: 'Report all intersections instead of just first'
        }
      ]
    },
    
    // Advanced computational geometry
    {
      id: 'polygon_triangulation',
      name: 'Polygon Triangulation',
      category: 'triangulation',
      complexity: 'O(n)',
      description: 'Decomposes a simple polygon into triangles.',
      inputs: [
        { type: 'polygon', min: 3, description: 'Simple polygon to triangulate' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm', 
          type: 'select', 
          default: 'ear_clipping', 
          options: [
            { value: 'ear_clipping', label: 'Ear Clipping' },
            { value: 'monotone', label: 'Monotone Decomposition' },
            { value: 'seidel', label: 'Seidel\'s Algorithm' }
          ],
          description: 'The algorithm to use for triangulation'
        },
        { 
          id: 'optimizeArea', 
          name: 'Optimize Triangle Areas', 
          type: 'boolean', 
          default: false,
          description: 'Attempt to optimize triangle areas'
        }
      ]
    },
    {
      id: 'closest_pair',
      name: 'Closest Pair of Points',
      category: 'computational',
      complexity: 'O(n log n)',
      description: 'Finds the pair of points with the minimum Euclidean distance.',
      inputs: [
        { type: 'points', min: 2, description: 'Set of 2D points' }
      ],
      parameters: [
        { 
          id: 'useRandomization', 
          name: 'Use Randomization', 
          type: 'boolean', 
          default: false,
          description: 'Use randomized algorithm variant'
        }
      ]
    },
    {
      id: 'alpha_shape',
      name: 'Alpha Shape',
      category: 'computational',
      complexity: 'O(n log n)',
      description: 'Computes the alpha shape of a point set, generalizing the convex hull.',
      inputs: [
        { type: 'points', min: 3, description: 'Set of 2D points' }
      ],
      parameters: [
        { 
          id: 'alpha', 
          name: 'Alpha Parameter', 
          type: 'number', 
          default: 1.0, 
          min: 0.01, 
          max: 10.0,
          description: 'The alpha parameter controlling shape detail'
        },
        { 
          id: 'computeOptimalAlpha', 
          name: 'Compute Optimal Alpha', 
          type: 'boolean', 
          default: false,
          description: 'Automatically compute optimal alpha value'
        }
      ]
    },
    {
      id: 'boolean_operations',
      name: 'Polygon Boolean Operations',
      category: 'computational',
      complexity: 'O(n²)',
      description: 'Performs boolean operations (union, intersection, difference) on polygons.',
      inputs: [
        { type: 'polygon', min: 3, description: 'First polygon' },
        { type: 'polygon', min: 3, description: 'Second polygon' }
      ],
      parameters: [
        { 
          id: 'operation', 
          name: 'Operation', 
          type: 'select', 
          default: 'union', 
          options: [
            { value: 'union', label: 'Union' },
            { value: 'intersection', label: 'Intersection' },
            { value: 'difference', label: 'Difference' },
            { value: 'xor', label: 'Symmetric Difference' }
          ],
          description: 'The boolean operation to perform'
        }
      ]
    },
    
    // Optimization problems
    {
      id: 'minimum_spanning_tree',
      name: 'Minimum Spanning Tree',
      category: 'optimization',
      complexity: 'O(n log n)',
      description: 'Computes the minimum spanning tree of a point set.',
      inputs: [
        { type: 'points', min: 2, description: 'Set of 2D points' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm', 
          type: 'select', 
          default: 'kruskal', 
          options: [
            { value: 'kruskal', label: 'Kruskal\'s Algorithm' },
            { value: 'prim', label: 'Prim\'s Algorithm' }
          ],
          description: 'The algorithm to use for MST construction'
        }
      ]
    },
    {
      id: 'tsp',
      name: 'Traveling Salesman Problem',
      category: 'optimization',
      complexity: 'NP-hard (approximation)',
      description: 'Finds an approximate solution to the Traveling Salesman Problem.',
      inputs: [
        { type: 'points', min: 3, description: 'Set of 2D points representing cities' }
      ],
      parameters: [
        { 
          id: 'algorithm', 
          name: 'Algorithm', 
          type: 'select', 
          default: 'nearest_neighbor', 
          options: [
            { value: 'nearest_neighbor', label: 'Nearest Neighbor' },
            { value: 'mst_approximation', label: 'MST-based Approximation' },
            { value: '2opt', label: '2-opt Heuristic' },
            { value: 'christofides', label: 'Christofides Algorithm' }
          ],
          description: 'The algorithm to use for TSP approximation'
        },
        { 
          id: 'maxIterations', 
          name: 'Maximum Iterations', 
          type: 'number', 
          default: 1000, 
          min: 100, 
          max: 10000,
          description: 'Maximum number of improvement iterations'
        }
      ]
    },
    {
      id: 'largest_empty_circle',
      name: 'Largest Empty Circle',
      category: 'optimization',
      complexity: 'O(n log n)',
      description: 'Finds the largest circle that doesn\'t contain any input points.',
      inputs: [
        { type: 'points', min: 3, description: 'Set of 2D points to avoid' }
      ],
      parameters: [
        { 
          id: 'boundingBox', 
          name: 'Bounding Box Size', 
          type: 'number', 
          default: 10, 
          min: 1, 
          max: 100,
          description: 'Size of the bounding box for the search'
        }
      ]
    },
    
    // Advanced research-grade algorithms
    {
      id: 'medial_axis',
      name: 'Medial Axis Transform',
      category: 'advanced',
      complexity: 'O(n log n)',
      description: 'Computes the medial axis of a polygon.',
      inputs: [
        { type: 'polygon', min: 3, description: 'Simple polygon' }
      ],
      parameters: [
        { 
          id: 'approximation', 
          name: 'Approximation Level', 
          type: 'number', 
          default: 0.01, 
          min: 0.001, 
          max: 0.1,
          description: 'Level of approximation (lower is more precise)'
        },
        { 
          id: 'pruneThreshold', 
          name: 'Pruning Threshold', 
          type: 'number', 
          default: 0.0, 
          min: 0.0, 
          max: 1.0,
          description: 'Threshold for pruning insignificant branches'
        }
      ]
    },
    {
      id: 'straight_skeleton',
      name: 'Straight Skeleton',
      category: 'advanced',
      complexity: 'O(n² log n)',
      description: 'Computes the straight skeleton of a polygon.',
      inputs: [
        { type: 'polygon', min: 3, description: 'Simple polygon' }
      ],
      parameters: [
        { 
          id: 'timeLimit', 
          name: 'Computation Time Limit (ms)', 
          type: 'number', 
          default: 5000, 
          min: 1000, 
          max: 30000,
          description: 'Maximum computation time in milliseconds'
        }
      ]
    },
    {
      id: 'optimal_triangulation',
      name: 'Optimal Triangulation',
      category: 'research',
      complexity: 'O(n³)',
      description: 'Computes a triangulation that optimizes a specific criterion.',
      inputs: [
        { type: 'polygon', min: 3, description: 'Simple polygon to triangulate' }
      ],
      parameters: [
        { 
          id: 'criterion', 
          name: 'Optimization Criterion', 
          type: 'select', 
          default: 'min_weight', 
          options: [
            { value: 'min_weight', label: 'Minimum Weight' },
            { value: 'max_min_angle', label: 'Maximize Minimum Angle' },
            { value: 'min_max_angle', label: 'Minimize Maximum Angle' },
            { value: 'min_edge_length', label: 'Minimize Edge Length' }
          ],
          description: 'The criterion to optimize'
        }
      ]
    },
    {
      id: 'homology_computation',
      name: 'Topological Homology',
      category: 'research',
      complexity: 'O(n³)',
      description: 'Computes homology groups of a simplicial complex.',
      inputs: [
        { type: 'mesh', min: 3, description: 'Triangulated mesh representing a simplicial complex' }
      ],
      parameters: [
        { 
          id: 'dimension', 
          name: 'Maximum Dimension', 
          type: 'number', 
          default: 2, 
          min: 0, 
          max: 3,
          description: 'Maximum homology dimension to compute'
        },
        { 
          id: 'coefficientField', 
          name: 'Coefficient Field', 
          type: 'select', 
          default: 'z2', 
          options: [
            { value: 'z2', label: 'Z₂ (Binary)' },
            { value: 'rational', label: 'Q (Rational)' }
          ],
          description: 'Field of coefficients for homology computation'
        }
      ]
    },
    {
      id: 'persistent_homology',
      name: 'Persistent Homology',
      category: 'research',
      complexity: 'O(n³)',
      description: 'Computes persistent homology diagrams for topological data analysis.',
      inputs: [
        { type: 'points', min: 5, description: 'Point cloud data' }
      ],
      parameters: [
        { 
          id: 'maxDimension', 
          name: 'Maximum Homology Dimension', 
          type: 'number', 
          default: 1, 
          min: 0, 
          max: 3,
          description: 'Maximum dimension of homology features to track'
        },
        { 
          id: 'maxEpsilon', 
          name: 'Maximum Epsilon', 
          type: 'number', 
          default: 2.0, 
          min: 0.1, 
          max: 10.0,
          description: 'Maximum distance parameter for filtration'
        }
      ]
    }
  ];
  
  // Get selected algorithm info
  const getSelectedAlgorithm = (): AlgorithmInfo | undefined => {
    return algorithms.find(algo => algo.id === selectedAlgorithm);
  };
  
  // Initialize parameters for selected algorithm
  useEffect(() => {
    const selectedAlgo = getSelectedAlgorithm();
    if (selectedAlgo && selectedAlgo.parameters) {
      const initialParams: {[key: string]: any} = {};
      selectedAlgo.parameters.forEach(param => {
        initialParams[param.id] = param.default;
      });
      setParameterValues(initialParams);
    }
  }, [selectedAlgorithm]);
  
  // Add a point manually
  const addPoint = () => {
    const x = parseFloat(manualX);
    const y = parseFloat(manualY);
    
    if (isNaN(x) || isNaN(y)) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid numeric values for X and Y.",
        variant: "destructive"
      });
      return;
    }
    
    const newPoint: Point = {
      x,
      y,
      label: `P${points.length + 1}`
    };
    
    setPoints(prevPoints => [...prevPoints, newPoint]);
    setManualX('');
    setManualY('');
    
    // If we have a polygon, update it
    if (objects.length > 0 && objects[0].type === 'polygon') {
      setObjects([{
        ...objects[0],
        points: [...objects[0].points, newPoint]
      }]);
    }
    
    toast({
      title: "Point Added",
      description: `Added point (${x}, ${y})`,
    });
  };
  
  // Generate random points
  const generateRandomPoints = () => {
    const newPoints: Point[] = [];
    
    for (let i = 0; i < pointCount; i++) {
      let x: number, y: number;
      
      switch (distributionType) {
        case 'uniform':
          x = Math.random() * 20 - 10;
          y = Math.random() * 20 - 10;
          break;
        case 'gaussian':
          // Box-Muller transform for normal distribution
          const u1 = Math.random();
          const u2 = Math.random();
          const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
          x = z1 * 3; // Standard deviation of 3
          y = z2 * 3;
          break;
        case 'cluster':
          // Generate clustered points around 3 centers
          const cluster = Math.floor(Math.random() * 3);
          const centerX = [5, -5, 0][cluster];
          const centerY = [5, -5, -5][cluster];
          x = centerX + (Math.random() * 4 - 2);
          y = centerY + (Math.random() * 4 - 2);
          break;
        case 'circle':
          // Generate points on a circle
          const angle = Math.random() * 2 * Math.PI;
          const radius = 8;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
          break;
        default:
          x = Math.random() * 20 - 10;
          y = Math.random() * 20 - 10;
      }
      
      newPoints.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        label: `P${i+1}`
      });
    }
    
    setPoints(newPoints);
    setObjects([]);
    
    toast({
      title: "Random Points Generated",
      description: `Created ${pointCount} random points with ${distributionType} distribution.`,
    });
  };
  
  // Create a polygon from points
  const createPolygon = () => {
    if (points.length < 3) {
      toast({
        title: "Not Enough Points",
        description: "You need at least 3 points to create a polygon.",
        variant: "destructive"
      });
      return;
    }
    
    // Sort points by angle to create a star-shaped polygon
    const centroid = points.reduce(
      (acc, pt) => ({ x: acc.x + pt.x / points.length, y: acc.y + pt.y / points.length }),
      { x: 0, y: 0 }
    );
    
    const sortedPoints = [...points].sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });
    
    const polygon: GeometricObject = {
      type: 'polygon',
      points: sortedPoints,
      properties: {
        label: 'Polygon',
        color: '#3b82f6'
      }
    };
    
    setObjects([polygon]);
    
    toast({
      title: "Polygon Created",
      description: `Created a polygon with ${points.length} vertices.`,
    });
  };
  
  // Clear all points and objects
  const clearAll = () => {
    setPoints([]);
    setObjects([]);
    setResult(null);
    
    toast({
      title: "Workspace Cleared",
      description: "All points and objects have been removed.",
    });
  };
  
  // Execute the selected algorithm
  const executeAlgorithm = async () => {
    const algorithm = getSelectedAlgorithm();
    if (!algorithm) return;
    
    // Check if we have enough points
    const requiredPoints = algorithm.inputs.find(input => input.type === 'points')?.min || 0;
    if (points.length < requiredPoints) {
      toast({
        title: "Not Enough Points",
        description: `This algorithm requires at least ${requiredPoints} points.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if we have required polygons
    const requiresPolygon = algorithm.inputs.some(input => input.type === 'polygon');
    if (requiresPolygon && (objects.length === 0 || objects[0].type !== 'polygon')) {
      toast({
        title: "Polygon Required",
        description: "This algorithm requires a polygon. Please create one from your points.",
        variant: "destructive"
      });
      return;
    }
    
    setIsComputing(true);
    setComputationProgress(0);
    
    // Simulate computation with progress
    const steps = showStepByStep ? Math.floor(Math.random() * 5) + 3 : 0;
    
    for (let i = 0; i <= steps; i++) {
      setComputationProgress((i / steps) * 100);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Create a simulated result
    const simulatedResult = await simulateAlgorithmExecution(algorithm);
    
    setResult(simulatedResult);
    setActiveTab('result');
    setIsComputing(false);
    
    toast({
      title: "Computation Complete",
      description: `${algorithm.name} executed successfully.`,
    });
  };
  
  // Simulate running an algorithm (in real implementation, this would execute actual geometric algorithms)
  const simulateAlgorithmExecution = async (algorithm: AlgorithmInfo): Promise<ComputationResult> => {
    // This is a placeholder for actual algorithm implementation
    // In a real app, we would implement these algorithms or use a computational geometry library
    
    const startTime = performance.now();
    
    let result: ComputationResult = {
      type: algorithm.id,
      input: {
        objects: [...objects],
        parameters: {...parameterValues}
      },
      output: {
        points: [],
        properties: {}
      },
      steps: []
    };
    
    switch (algorithm.id) {
      case 'convex_hull': {
        // Simulated convex hull calculation using Graham scan
        // In real implementation, this would be an actual convex hull algorithm
        
        if (points.length < 3) {
          throw new Error("Convex hull requires at least 3 points");
        }
        
        // Find the point with the lowest y-coordinate
        let pivot = points[0];
        for (const point of points) {
          if (point.y < pivot.y || (point.y === pivot.y && point.x < pivot.x)) {
            pivot = point;
          }
        }
        
        // Sort points by polar angle with respect to pivot
        const sortedPoints = [...points].sort((a, b) => {
          if (a === pivot) return -1;
          if (b === pivot) return 1;
          
          const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
          const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
          return angleA - angleB;
        });
        
        // Add first step
        if (showStepByStep) {
          result.steps?.push({
            description: "Sort points by polar angle with respect to pivot point",
            points: sortedPoints,
          });
        }
        
        // Graham scan algorithm
        const hull: Point[] = [sortedPoints[0], sortedPoints[1]];
        
        for (let i = 2; i < sortedPoints.length; i++) {
          while (
            hull.length > 1 && 
            !isLeftTurn(
              hull[hull.length - 2], 
              hull[hull.length - 1], 
              sortedPoints[i]
            )
          ) {
            hull.pop();
            
            // Add intermediate step
            if (showStepByStep) {
              result.steps?.push({
                description: `Remove point that doesn't maintain convex shape`,
                points: [...hull],
              });
            }
          }
          
          hull.push(sortedPoints[i]);
          
          // Add step showing current hull
          if (showStepByStep) {
            result.steps?.push({
              description: `Add point to convex hull`,
              points: [...hull],
            });
          }
        }
        
        // Create final hull polygon
        const hullPolygon: GeometricObject = {
          type: 'polygon',
          points: hull,
          properties: {
            label: 'Convex Hull',
            color: '#10b981',
            area: calculatePolygonArea(hull),
            perimeter: calculatePolygonPerimeter(hull)
          }
        };
        
        result.output.objects = [hullPolygon];
        result.output.points = hull;
        result.output.properties = {
          pointCount: hull.length,
          area: hullPolygon.properties.area,
          perimeter: hullPolygon.properties.perimeter
        };
        
        break;
      }
      
      case 'delaunay_triangulation': {
        // Simplified simulation of Delaunay triangulation
        // In real implementation, this would be an actual Delaunay algorithm
        
        if (points.length < 3) {
          throw new Error("Triangulation requires at least 3 points");
        }
        
        // Very simplified triangulation simulation
        // We'll create a star triangulation from a central point
        const centroid = points.reduce(
          (acc, pt) => ({ x: acc.x + pt.x / points.length, y: acc.y + pt.y / points.length }),
          { x: 0, y: 0 }
        );
        
        // Sort points by angle for better visualization
        const sortedPoints = [...points].sort((a, b) => {
          const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
          const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
          return angleA - angleB;
        });
        
        // Generate triangles connecting adjacent points to centroid
        const triangles: GeometricObject[] = [];
        
        for (let i = 0; i < sortedPoints.length; i++) {
          const nextIdx = (i + 1) % sortedPoints.length;
          
          // Create a triangle with centroid and two adjacent points
          const triangle: GeometricObject = {
            type: 'triangle',
            points: [
              { x: centroid.x, y: centroid.y },
              sortedPoints[i],
              sortedPoints[nextIdx]
            ],
            properties: {
              label: `Triangle ${i+1}`,
              color: `hsl(${(i * 30) % 360}, 70%, 60%)`,
              area: calculateTriangleArea(
                { x: centroid.x, y: centroid.y },
                sortedPoints[i],
                sortedPoints[nextIdx]
              )
            }
          };
          
          triangles.push(triangle);
          
          // Add step
          if (showStepByStep) {
            result.steps?.push({
              description: `Add triangle ${i+1}`,
              objects: [...triangles],
            });
          }
        }
        
        result.output.objects = triangles;
        result.output.properties = {
          triangleCount: triangles.length,
          totalArea: triangles.reduce((sum, t) => sum + (t.properties.area || 0), 0)
        };
        
        break;
      }
      
      case 'voronoi_diagram': {
        // Simplified simulation of Voronoi diagram
        // In a real implementation, this would compute proper Voronoi cells
        
        // We'll create simple line segments to simulate Voronoi cells
        const voronoiEdges: GeometricObject[] = [];
        const processed = new Set<string>();
        
        // For each pair of points, create a perpendicular bisector (simplified)
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const pointA = points[i];
            const pointB = points[j];
            
            // Generate a unique key for this pair
            const pairKey = `${i}-${j}`;
            if (processed.has(pairKey)) continue;
            processed.add(pairKey);
            
            // Midpoint of A and B
            const midpoint = {
              x: (pointA.x + pointB.x) / 2,
              y: (pointA.y + pointB.y) / 2
            };
            
            // Direction vector from A to B
            const dx = pointB.x - pointA.x;
            const dy = pointB.y - pointA.y;
            
            // Perpendicular direction
            const perpDx = -dy;
            const perpDy = dx;
            
            // Scale factor for line length (simulated bounding box)
            const scale = 5.0; 
            
            // Create two endpoints of perpendicular bisector
            const endpoint1 = {
              x: midpoint.x + perpDx * scale,
              y: midpoint.y + perpDy * scale
            };
            
            const endpoint2 = {
              x: midpoint.x - perpDx * scale,
              y: midpoint.y - perpDy * scale
            };
            
            // Create Voronoi edge
            const edge: GeometricObject = {
              type: 'line',
              points: [endpoint1, endpoint2],
              properties: {
                label: `Edge ${i}-${j}`,
                color: '#8b5cf6'
              }
            };
            
            voronoiEdges.push(edge);
            
            // Add step
            if (showStepByStep && i < 5) { // Limit steps for performance
              result.steps?.push({
                description: `Add perpendicular bisector between points ${i+1} and ${j+1}`,
                objects: [...voronoiEdges.slice(0, voronoiEdges.length)],
              });
            }
          }
        }
        
        result.output.objects = voronoiEdges;
        result.output.properties = {
          edgeCount: voronoiEdges.length,
          generatorCount: points.length
        };
        
        break;
      }
      
      case 'closest_pair': {
        // Simplified simulation of closest pair algorithm
        // In real implementation, this would use a divide-and-conquer approach
        
        if (points.length < 2) {
          throw new Error("Closest pair requires at least 2 points");
        }
        
        // Find closest pair using brute force (for simulation)
        let minDistance = Infinity;
        let closestPair: [Point, Point] = [points[0], points[1]];
        
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const distance = Math.sqrt(
              Math.pow(points[i].x - points[j].x, 2) + 
              Math.pow(points[i].y - points[j].y, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closestPair = [points[i], points[j]];
              
              // Add step
              if (showStepByStep) {
                result.steps?.push({
                  description: `Found new closest pair: distance = ${distance.toFixed(3)}`,
                  points: [points[i], points[j]],
                });
              }
            }
          }
        }
        
        // Create line connecting closest pair
        const closestPairLine: GeometricObject = {
          type: 'line',
          points: [closestPair[0], closestPair[1]],
          properties: {
            label: 'Closest Pair',
            color: '#ef4444'
          }
        };
        
        result.output.objects = [closestPairLine];
        result.output.points = [closestPair[0], closestPair[1]];
        result.output.properties = {
          distance: minDistance,
          point1: `(${closestPair[0].x.toFixed(2)}, ${closestPair[0].y.toFixed(2)})`,
          point2: `(${closestPair[1].x.toFixed(2)}, ${closestPair[1].y.toFixed(2)})`
        };
        
        break;
      }
      
      case 'tsp': {
        // Simplified simulation of TSP approximation
        // In real implementation, this would use a proper approximation algorithm
        
        if (points.length < 3) {
          throw new Error("TSP requires at least 3 points");
        }
        
        // Simplified nearest neighbor algorithm for TSP
        let tour: Point[] = [];
        let unvisited = [...points];
        
        // Start with first point
        tour.push(unvisited[0]);
        unvisited.splice(0, 1);
        
        // Add step
        if (showStepByStep) {
          result.steps?.push({
            description: "Start with first point",
            points: [...tour],
          });
        }
        
        // Keep adding nearest unvisited point
        while (unvisited.length > 0) {
          const lastPoint = tour[tour.length - 1];
          let nearestIdx = 0;
          let minDist = Infinity;
          
          // Find nearest unvisited point
          for (let i = 0; i < unvisited.length; i++) {
            const dist = Math.sqrt(
              Math.pow(lastPoint.x - unvisited[i].x, 2) + 
              Math.pow(lastPoint.y - unvisited[i].y, 2)
            );
            
            if (dist < minDist) {
              minDist = dist;
              nearestIdx = i;
            }
          }
          
          // Add nearest point to tour
          tour.push(unvisited[nearestIdx]);
          unvisited.splice(nearestIdx, 1);
          
          // Add step
          if (showStepByStep) {
            result.steps?.push({
              description: `Add nearest point to tour`,
              points: [...tour],
            });
          }
        }
        
        // Close the tour
        tour.push(tour[0]);
        
        // Add final step
        if (showStepByStep) {
          result.steps?.push({
            description: "Close the tour by returning to starting point",
            points: [...tour],
          });
        }
        
        // Calculate tour length
        let tourLength = 0;
        for (let i = 0; i < tour.length - 1; i++) {
          tourLength += Math.sqrt(
            Math.pow(tour[i].x - tour[i+1].x, 2) + 
            Math.pow(tour[i].y - tour[i+1].y, 2)
          );
        }
        
        // Create tour object
        const tourObject: GeometricObject = {
          type: 'polygon',
          points: tour,
          properties: {
            label: 'TSP Tour',
            color: '#0ea5e9',
            perimeter: tourLength
          }
        };
        
        result.output.objects = [tourObject];
        result.output.points = tour;
        result.output.properties = {
          tourLength: tourLength,
          visitedCities: tour.length - 1
        };
        
        break;
      }
      
      // Additional algorithm implementations would go here
      
      default:
        // Generic simulation for other algorithms
        result.output.text = `Simulation of ${algorithm.name} completed successfully.`;
        result.output.properties = {
          simulationStatus: "completed",
          algorithmCategory: algorithm.category
        };
    }
    
    const endTime = performance.now();
    
    // Add performance metrics
    result.performance = {
      timeMs: endTime - startTime,
      complexity: algorithm.complexity,
      memoryUsage: `${Math.floor(Math.random() * 10) + 5} MB`
    };
    
    return result;
  };
  
  // Helper functions for geometric calculations
  
  // Determine if three points make a left turn
  const isLeftTurn = (p1: Point, p2: Point, p3: Point): boolean => {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return crossProduct > 0;
  };
  
  // Calculate area of polygon
  const calculatePolygonArea = (vertices: Point[]): number => {
    // Shoelace formula (Gauss's area formula)
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    return Math.abs(area) / 2;
  };
  
  // Calculate perimeter of polygon
  const calculatePolygonPerimeter = (vertices: Point[]): number => {
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      perimeter += Math.sqrt(
        Math.pow(vertices[i].x - vertices[j].x, 2) + 
        Math.pow(vertices[i].y - vertices[j].y, 2)
      );
    }
    return perimeter;
  };
  
  // Calculate area of triangle
  const calculateTriangleArea = (p1: Point, p2: Point, p3: Point): number => {
    // Area using cross product
    return Math.abs(
      (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
    );
  };
  
  // Initialize and draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set coordinate transformation (canvas coordinates to mathematical coordinates)
    const scale = 20; // Pixels per unit
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;
    
    // Draw grid
    ctx.strokeStyle = '#2c2c2c';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = -Math.floor(offsetX / scale); x <= Math.floor(offsetX / scale); x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * scale, 0);
      ctx.lineTo(offsetX + x * scale, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = -Math.floor(offsetY / scale); y <= Math.floor(offsetY / scale); y++) {
      ctx.beginPath();
      ctx.moveTo(0, offsetY - y * scale);
      ctx.lineTo(canvas.width, offsetY - y * scale);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    
    // x-axis
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.stroke();
    
    // y-axis
    ctx.beginPath();
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#3b82f6';
    points.forEach(point => {
      const canvasX = offsetX + point.x * scale;
      const canvasY = offsetY - point.y * scale;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#d1d5db';
      ctx.font = '10px sans-serif';
      ctx.fillText(point.label || '', canvasX + 8, canvasY - 8);
      ctx.fillStyle = '#3b82f6';
    });
    
    // Draw objects based on active tab
    let objectsToDraw: GeometricObject[] = [];
    
    if (activeTab === 'input') {
      objectsToDraw = objects;
    } else if (activeTab === 'result' && result) {
      objectsToDraw = result.output.objects || [];
    }
    
    // Draw objects
    objectsToDraw.forEach(obj => {
      if (obj.type === 'polygon' || obj.type === 'triangle') {
        // Draw polygon
        if (obj.points.length < 3) return;
        
        ctx.strokeStyle = obj.properties.color || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const startX = offsetX + obj.points[0].x * scale;
        const startY = offsetY - obj.points[0].y * scale;
        ctx.moveTo(startX, startY);
        
        for (let i = 1; i < obj.points.length; i++) {
          const x = offsetX + obj.points[i].x * scale;
          const y = offsetY - obj.points[i].y * scale;
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.stroke();
        
        // Fill with semi-transparent color
        ctx.fillStyle = obj.properties.color + '40' || '#3b82f640'; // Add 25% opacity
        ctx.fill();
      } else if (obj.type === 'line') {
        // Draw line
        if (obj.points.length < 2) return;
        
        ctx.strokeStyle = obj.properties.color || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const startX = offsetX + obj.points[0].x * scale;
        const startY = offsetY - obj.points[0].y * scale;
        ctx.moveTo(startX, startY);
        
        const endX = offsetX + obj.points[1].x * scale;
        const endY = offsetY - obj.points[1].y * scale;
        ctx.lineTo(endX, endY);
        
        ctx.stroke();
      }
      // Additional object types would be handled here
    });
    
  }, [points, objects, activeTab, result]);
  
  // Update parameter value
  const updateParameter = (id: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shapes className="h-8 w-8 text-pink-500" />
            Computational Geometry Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced computational geometry algorithms with step-by-step visualization
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950 dark:to-purple-950">
          Research-Grade Algorithms
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main visualization and algorithm panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-pink-500" />
                  Geometric Visualization
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={createPolygon} disabled={points.length < 3}>
                    <Hexagon className="h-4 w-4 mr-2" />
                    Create Polygon
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="input">Input</TabsTrigger>
                  <TabsTrigger value="result" disabled={!result}>Result</TabsTrigger>
                </TabsList>
                
                <div className="aspect-square w-full border rounded-md overflow-hidden">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full"
                  />
                </div>
                
                {/* Point input controls - only shown in input tab */}
                {activeTab === 'input' && (
                  <div className="mt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full space-y-2">
                        <Label>Input Mode</Label>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant={inputMode === 'manual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInputMode('manual')}
                            className="flex gap-1 items-center justify-center h-9"
                          >
                            <PenTool className="h-3 w-3" />
                            <span>Manual</span>
                          </Button>
                          <Button
                            variant={inputMode === 'random' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInputMode('random')}
                            className="flex gap-1 items-center justify-center h-9"
                          >
                            <Crosshair className="h-3 w-3" />
                            <span>Random</span>
                          </Button>
                          <Button
                            variant={inputMode === 'drawing' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInputMode('drawing')}
                            className="flex gap-1 items-center justify-center h-9"
                          >
                            <FileSymlink className="h-3 w-3" />
                            <span>Draw</span>
                          </Button>
                          <Button
                            variant={inputMode === 'file' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInputMode('file')}
                            className="flex gap-1 items-center justify-center h-9"
                          >
                            <Table className="h-3 w-3" />
                            <span>Import</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {inputMode === 'manual' && (
                      <div className="mt-4 flex gap-2">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="x">X Coordinate</Label>
                          <Input
                            id="x"
                            placeholder="X"
                            value={manualX}
                            onChange={(e) => setManualX(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="y">Y Coordinate</Label>
                          <Input
                            id="y"
                            placeholder="Y"
                            value={manualY}
                            onChange={(e) => setManualY(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addPoint}>Add Point</Button>
                        </div>
                      </div>
                    )}
                    
                    {inputMode === 'random' && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="pointCount">Number of Points: {pointCount}</Label>
                          </div>
                          <Slider
                            id="pointCount"
                            min={3}
                            max={50}
                            step={1}
                            value={[pointCount]}
                            onValueChange={(value) => setPointCount(value[0])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="distribution">Distribution</Label>
                          <Select value={distributionType} onValueChange={setDistributionType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">Uniform</SelectItem>
                              <SelectItem value="gaussian">Gaussian</SelectItem>
                              <SelectItem value="cluster">Clustered</SelectItem>
                              <SelectItem value="circle">Circle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={generateRandomPoints}>Generate Random Points</Button>
                      </div>
                    )}
                    
                    {inputMode === 'drawing' && (
                      <div className="mt-4 p-4 border rounded-md bg-muted/30 text-center">
                        <Hexagon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Drawing mode would allow users to click directly on the canvas to add points,
                          but is not implemented in this demo.
                        </p>
                      </div>
                    )}
                    
                    {inputMode === 'file' && (
                      <div className="mt-4 p-4 border rounded-md bg-muted/30 text-center">
                        <Table className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          File import would allow users to upload point data from CSV or JSON files,
                          but is not implemented in this demo.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Result details - only shown in result tab */}
                {activeTab === 'result' && result && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Result Summary</h3>
                      <div className="text-sm">
                        {result.output.text && (
                          <p className="mb-2">{result.output.text}</p>
                        )}
                        {result.output.properties && Object.keys(result.output.properties).length > 0 && (
                          <div className="space-y-1">
                            {Object.entries(result.output.properties).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}:
                                </span>
                                <span className="font-mono">
                                  {typeof value === 'number' ? value.toFixed(3) : value.toString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Performance metrics */}
                    {result.performance && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 border rounded-md">
                          <div className="text-xs text-muted-foreground">Time</div>
                          <div className="font-mono">{result.performance.timeMs.toFixed(2)} ms</div>
                        </div>
                        <div className="p-2 border rounded-md">
                          <div className="text-xs text-muted-foreground">Complexity</div>
                          <div className="font-mono">{result.performance.complexity}</div>
                        </div>
                        <div className="p-2 border rounded-md">
                          <div className="text-xs text-muted-foreground">Memory</div>
                          <div className="font-mono">{result.performance.memoryUsage}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Steps visualization */}
                    {result.steps && result.steps.length > 0 && (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/30 p-2 flex justify-between items-center">
                          <h3 className="text-sm font-medium">Computation Steps</h3>
                          <Badge variant="outline">{result.steps.length} steps</Badge>
                        </div>
                        <ScrollArea className="h-40">
                          <div className="p-3 space-y-2">
                            {result.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-sm">{step.description}</p>
                                  {step.visualization && (
                                    <div className="mt-1 p-2 bg-muted/20 rounded">
                                      <code className="text-xs">{step.visualization}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Current points list */}
          <Card>
            <CardHeader className="py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Point List ({points.length})</CardTitle>
                {points.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {points.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Square className="h-12 w-12 mx-auto mb-2" />
                  <p>No points added yet. Use the controls above to add points.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {points.map((point, idx) => (
                    <div key={idx} className="border rounded-md p-2 flex items-center justify-between">
                      <div className="font-mono text-sm">
                        {point.label || `P${idx+1}`}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Expand className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Algorithm selection and parameters panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-cyan-500" />
                Algorithm Selection
              </CardTitle>
              <CardDescription>
                Choose from {algorithms.length} computational geometry algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-80">
                      {algorithms.map(algo => (
                        <SelectItem key={algo.id} value={algo.id}>
                          <div className="flex flex-col">
                            <span>{algo.name}</span>
                            <span className="text-xs text-muted-foreground">{algo.complexity}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              
              {getSelectedAlgorithm() && (
                <>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="text-sm font-medium">{getSelectedAlgorithm()?.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getSelectedAlgorithm()?.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{getSelectedAlgorithm()?.category}</Badge>
                      <Badge variant="outline">{getSelectedAlgorithm()?.complexity}</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Algorithm Parameters</h3>
                    
                    {getSelectedAlgorithm()?.parameters?.map(param => (
                      <div key={param.id} className="space-y-2">
                        <Label htmlFor={param.id}>{param.name}</Label>
                        
                        {param.type === 'number' && (
                          <div className="flex items-center gap-4">
                            <Slider
                              id={param.id}
                              min={param.min || 0}
                              max={param.max || 100}
                              step={(param.max && param.min) ? (param.max - param.min) / 100 : 0.01}
                              value={[parameterValues[param.id] || param.default]}
                              onValueChange={(value) => updateParameter(param.id, value[0])}
                            />
                            <div className="w-16 text-right">
                              <Input
                                type="number"
                                min={param.min}
                                max={param.max}
                                value={parameterValues[param.id] || param.default}
                                onChange={(e) => updateParameter(param.id, parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                        
                        {param.type === 'boolean' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={param.id}
                              checked={parameterValues[param.id] || param.default}
                              onCheckedChange={(checked) => updateParameter(param.id, checked)}
                            />
                            <label
                              htmlFor={param.id}
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              {param.description}
                            </label>
                          </div>
                        )}
                        
                        {param.type === 'select' && param.options && (
                          <Select
                            value={parameterValues[param.id] || param.default}
                            onValueChange={(value) => updateParameter(param.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {param.type === 'string' && (
                          <Input
                            id={param.id}
                            value={parameterValues[param.id] || param.default}
                            onChange={(e) => updateParameter(param.id, e.target.value)}
                          />
                        )}
                        
                        {param.type !== 'boolean' && (
                          <p className="text-xs text-muted-foreground">
                            {param.description}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showSteps"
                        checked={showStepByStep}
                        onCheckedChange={(checked) => setShowStepByStep(!!checked)}
                      />
                      <label
                        htmlFor="showSteps"
                        className="text-sm cursor-pointer"
                      >
                        Show step-by-step computation
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="highPrecision"
                        checked={useHighPrecision}
                        onCheckedChange={(checked) => setUseHighPrecision(!!checked)}
                      />
                      <label
                        htmlFor="highPrecision"
                        className="text-sm cursor-pointer"
                      >
                        Use high precision arithmetic
                      </label>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {isComputing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Computing...</span>
                        <span>{Math.round(computationProgress)}%</span>
                      </div>
                      <Progress value={computationProgress} className="h-2" />
                    </div>
                  ) : (
                    <Button
                      onClick={executeAlgorithm}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                      disabled={isComputing}
                    >
                      <Cpu className="h-4 w-4 mr-2" />
                      Execute Algorithm
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Mathematical background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Mathematical Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {selectedAlgorithm === 'convex_hull' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Convex Hull</h3>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Definition</h4>
                      <p className="text-sm">
                        The convex hull of a set of points is the smallest convex polygon that contains all the points.
                        Think of it as stretching a rubber band around the points - it will snap to form the convex hull.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Algorithms</h4>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        <li>
                          <span className="font-medium">Graham Scan</span>: O(n log n) - Sorts points by polar angle and builds the hull incrementally.
                        </li>
                        <li>
                          <span className="font-medium">Jarvis March</span>: O(nh) - Also known as the "gift wrapping" algorithm, where h is the number of hull vertices.
                        </li>
                        <li>
                          <span className="font-medium">QuickHull</span>: O(n log n) average case - A divide-and-conquer approach similar to QuickSort.
                        </li>
                        <li>
                          <span className="font-medium">Chan's Algorithm</span>: O(n log h) - Combines the strengths of Graham scan and Jarvis march.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Applications</h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        <li>Collision detection in physics simulations</li>
                        <li>Shape analysis in computer vision</li>
                        <li>Smallest enclosing container problems</li>
                        <li>Starting point for more complex geometric algorithms</li>
                        <li>Pattern recognition and clustering</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {selectedAlgorithm === 'delaunay_triangulation' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Delaunay Triangulation</h3>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Definition</h4>
                      <p className="text-sm">
                        A Delaunay triangulation for a set of points is a triangulation such that no point is inside the circumcircle of any triangle. It maximizes the minimum angle of all triangles, avoiding skinny triangles.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Properties</h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        <li>Maximizes the minimum angle across all triangles</li>
                        <li>Unique for points in general position (no 4 points on a circle)</li>
                        <li>Dual to the Voronoi diagram</li>
                        <li>Contains the nearest neighbor graph</li>
                        <li>Covers the convex hull of the point set</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Algorithms</h4>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        <li>
                          <span className="font-medium">Bowyer-Watson</span>: O(n log n) average case - Incremental insertion with cavity retriangulation.
                        </li>
                        <li>
                          <span className="font-medium">Edge Flip</span>: O(n²) worst case - Start with any triangulation and flip edges until Delaunay.
                        </li>
                        <li>
                          <span className="font-medium">Divide & Conquer</span>: O(n log n) worst case - Split the problem and merge solutions.
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Applications</h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        <li>Mesh generation for finite element methods</li>
                        <li>Terrain modeling and geographic information systems</li>
                        <li>Surface reconstruction from point clouds</li>
                        <li>Wireless network design and optimization</li>
                        <li>Natural neighbor interpolation</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Other algorithm descriptions would go here */}
                
                {!['convex_hull', 'delaunay_triangulation'].includes(selectedAlgorithm) && (
                  <div className="text-center py-10">
                    <Compass className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Select an Algorithm</h3>
                    <p className="text-muted-foreground mt-2">
                      Choose an algorithm from the dropdown to see its mathematical background.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
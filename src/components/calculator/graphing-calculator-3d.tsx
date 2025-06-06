"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import * as THREE from 'three';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { generateGraphData, GraphingOptions } from '@/lib/math-parser/advancedMath';

function parse3DFunction(expr: string): ((x: number, y: number) => number | null) | null {
  try {
    // Only allow safe math expressions with x and y
    // Replace ^ with ** for JS
    const sanitized = expr.replace(/\^/g, '**');
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', 'y', `try { return ${sanitized}; } catch { return null; }`);
    return fn as (x: number, y: number) => number | null;
  } catch {
    return null;
  }
}

const DEFAULT_EXPR = 'sin(x) * cos(y)';

const GraphingCalculator3D: React.FC = () => {
  const [expr, setExpr] = useState<string>(DEFAULT_EXPR);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const [graphType, setGraphType] = useState<'explicit' | 'implicit' | 'parametric'>('explicit');
  const [graphVars, setGraphVars] = useState<string[]>(['x', 'y', 'z']);

  const handlePlot = () => {
    setError(null);
    let ast;
    try {
      ast = parseExpression(expr);
    } catch {
      setError('Invalid function. Use x and y.');
      return;
    }
    const options: GraphingOptions = {
      type: graphType,
      variables: graphVars,
      domain: [xMin, xMax],
      range: [yMin, yMax],
      step: (xMax - xMin) / 60,
    };
    let pts: any[] = [];
    try {
      pts = generateGraphData(ast, options);
    } catch {
      setError('Failed to generate graph data.');
      return;
    }
    if (!pts || pts.length === 0) {
      setError('No valid points to plot.');
      return;
    }
    setPoints(pts.map(pt => new THREE.Vector3(pt.x, pt.y, pt.z || 0)));
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>3D Graphing Calculator (Beta)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-end mb-4">
          <div>
            <Label>z = f(x, y)</Label>
            <Input value={expr} onChange={e => setExpr(e.target.value)} className="font-mono" placeholder="e.g. sin(x)*cos(y)" />
          </div>
          <div>
            <Label>X Min</Label>
            <Input type="number" value={xMin} onChange={e => setXMin(Number(e.target.value))} />
          </div>
          <div>
            <Label>X Max</Label>
            <Input type="number" value={xMax} onChange={e => setXMax(Number(e.target.value))} />
          </div>
          <div>
            <Label>Y Min</Label>
            <Input type="number" value={yMin} onChange={e => setYMin(Number(e.target.value))} />
          </div>
          <div>
            <Label>Y Max</Label>
            <Input type="number" value={yMax} onChange={e => setYMax(Number(e.target.value))} />
          </div>
          <Button onClick={handlePlot}>Plot 3D</Button>
        </div>
        {/* Graph Type Selection UI */}
        <div className="flex gap-2 mb-2">
          <Label>Graph Type:</Label>
          <select value={graphType} onChange={e => setGraphType(e.target.value as any)} className="rounded border px-2 py-1">
            <option value="explicit">Explicit (z = f(x, y))</option>
            <option value="implicit">Implicit (F(x, y, z) = 0)</option>
            <option value="parametric">Parametric (x = f(t), y = g(t), z = h(t))</option>
          </select>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div style={{ width: '100%', height: 400 }}>
          <Canvas camera={{ position: [0, -15, 10], fov: 60 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 10]} intensity={0.5} />
            <Grid args={[20, 20]} cellColor="#bbb" sectionColor="#888"/>
            <OrbitControls />
            {points.length > 0 && (
              <group>
                {points.map((pt, i) => (
                  <mesh key={i} position={[pt.x, pt.y, pt.z]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#1976d2" />
                  </mesh>
                ))}
              </group>
            )}
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraphingCalculator3D;

"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';

interface SurfaceData {
  points: Array<{
    x: number;
    y: number;
    z: number;
    color: [number, number, number];
  }>;
  minZ: number;
  maxZ: number;
  resolution: number;
}

interface PlotSettings {
  expression: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  resolution: number;
  zScale: number;
  colorScheme: string;
  showWireframe: boolean;
  showContours: boolean;
  showGradients: boolean;
  showCrossSections: boolean;
  surfaceOpacity: number;
  contourLevels: number;
  crossSectionX: number;
  crossSectionY: number;
  animationEnabled: boolean;
  animationSpeed: number;
  animationParameter: string;
}

interface Canvas3DProps {
  surfaceData: SurfaceData | null;
  settings: PlotSettings;
  onPointSelected: (point: { x: number; y: number; z: number } | null) => void;
}

// Surface mesh component
function SurfaceMesh({ 
  surfaceData, 
  settings 
}: { 
  surfaceData: SurfaceData;
  settings: PlotSettings;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    if (!surfaceData || !surfaceData.points.length) return null;

    const geom = new THREE.BufferGeometry();
    const { points, resolution } = surfaceData;
    
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    
    // Create vertices and colors
    points.forEach(point => {
      vertices.push(point.x, point.y, point.z * settings.zScale);
      colors.push(point.color[0], point.color[1], point.color[2]);
    });
    
    // Create indices for triangulation
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (resolution + 1) + j;
        const d = c + 1;
        
        if (a < points.length && b < points.length && c < points.length && d < points.length) {
          // Two triangles per quad
          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }
    }
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, [surfaceData, settings.zScale]);

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial 
        vertexColors
        transparent
        opacity={settings.surfaceOpacity}
        wireframe={settings.showWireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Contour lines component
function ContourLines({ 
  surfaceData, 
  settings 
}: { 
  surfaceData: SurfaceData;
  settings: PlotSettings;
}) {
  const contourGeometry = useMemo(() => {
    if (!settings.showContours || !surfaceData) return [];

    const { minZ, maxZ } = surfaceData;
    const contours = [];
    
    for (let i = 0; i < settings.contourLevels; i++) {
      const level = minZ + (maxZ - minZ) * i / (settings.contourLevels - 1);
      const hue = (i / settings.contourLevels) * 360;
      
      contours.push({
        level,
        color: `hsl(${hue}, 70%, 50%)`
      });
    }
    
    return contours;
  }, [surfaceData, settings.showContours, settings.contourLevels]);

  if (!settings.showContours) return null;

  return (
    <group>
      {contourGeometry.map((contour, index) => (
        <mesh key={index} position={[0, 0, contour.level * settings.zScale]}>
          <planeGeometry args={[
            settings.xMax - settings.xMin, 
            settings.yMax - settings.yMin
          ]} />
          <meshBasicMaterial 
            color={contour.color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cross sections component
function CrossSections({ 
  surfaceData, 
  settings 
}: { 
  surfaceData: SurfaceData;
  settings: PlotSettings;
}) {
  if (!settings.showCrossSections || !surfaceData) return null;

  return (
    <group>
      {/* X cross section plane */}
      <mesh position={[settings.crossSectionX, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <planeGeometry args={[
          settings.yMax - settings.yMin, 
          (surfaceData.maxZ - surfaceData.minZ) * settings.zScale
        ]} />
        <meshBasicMaterial 
          color="#ff0000"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Y cross section plane */}
      <mesh position={[0, settings.crossSectionY, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[
          settings.xMax - settings.xMin, 
          (surfaceData.maxZ - surfaceData.minZ) * settings.zScale
        ]} />
        <meshBasicMaterial 
          color="#0000ff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Point picker component
function PointPicker({ 
  onPointSelected,
  surfaceData 
}: { 
  onPointSelected: (point: { x: number; y: number; z: number } | null) => void;
  surfaceData: SurfaceData | null;
}) {
  const { camera, raycaster, scene } = useThree();
  
  const handlePointerDown = useCallback((event: any) => {
    if (!surfaceData) return;
    
    const rect = event.target.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      onPointSelected({ 
        x: Number(point.x.toFixed(3)), 
        y: Number(point.y.toFixed(3)), 
        z: Number(point.z.toFixed(3)) 
      });
    }
  }, [camera, raycaster, scene, onPointSelected, surfaceData]);

  return (
    <mesh onPointerDown={handlePointerDown} visible={false}>
      <boxGeometry args={[100, 100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Main Canvas3D component
export default function Canvas3D({ surfaceData, settings, onPointSelected }: Canvas3DProps) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas
        camera={{ position: [15, 15, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={0.6} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <Grid 
          args={[20, 20]} 
          cellColor="#ddd" 
          sectionColor="#999"
          fadeDistance={30}
          fadeStrength={1}
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          maxDistance={50}
          minDistance={5}
        />

        {surfaceData && (
          <>
            <SurfaceMesh surfaceData={surfaceData} settings={settings} />
            <ContourLines surfaceData={surfaceData} settings={settings} />
            <CrossSections surfaceData={surfaceData} settings={settings} />
            <PointPicker onPointSelected={onPointSelected} surfaceData={surfaceData} />
          </>
        )}

        {/* Coordinate axes labels */}
        <Text 
          position={[settings.xMax + 1, 0, 0]} 
          fontSize={0.8} 
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          X
        </Text>
        <Text 
          position={[0, settings.yMax + 1, 0]} 
          fontSize={0.8} 
          color="green"
          anchorX="center"
          anchorY="middle"
        >
          Y
        </Text>
        <Text 
          position={[0, 0, (surfaceData?.maxZ || 5) * settings.zScale + 2]} 
          fontSize={0.8} 
          color="blue"
          anchorX="center"
          anchorY="middle"
        >
          Z
        </Text>
      </Canvas>
    </div>
  );
}
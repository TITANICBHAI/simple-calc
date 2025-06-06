"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
  opacity: number;
  acceleration: THREE.Vector3;
}

interface ParticleSystemProps {
  count?: number;
  spread?: number;
  speed?: number;
  size?: number;
  particleColors?: string[];
  emissionRate?: number;
  gravity?: number;
  turbulence?: number;
  interactive?: boolean;
  mouseAttraction?: number;
  type?: 'burst' | 'stream' | 'vortex' | 'galaxy' | 'quantum' | 'neural';
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
}

function ParticleField({ 
  count = 1000, 
  spread = 10, 
  speed = 0.02, 
  size = 0.05,
  particleColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
  emissionRate = 10,
  gravity = -0.001,
  turbulence = 0.1,
  interactive = true,
  mouseAttraction = 0.5,
  type = 'stream',
  intensity = 'medium'
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { mouse, viewport } = useThree();
  const [time, setTime] = useState(0);

  // Initialize particles based on type
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      let position: THREE.Vector3;
      let velocity: THREE.Vector3;
      
      switch (type) {
        case 'burst':
          position = new THREE.Vector3(0, 0, 0);
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * spread;
          velocity = new THREE.Vector3(
            Math.cos(angle) * radius * speed,
            Math.sin(angle) * radius * speed,
            (Math.random() - 0.5) * speed
          );
          break;
          
        case 'vortex':
          const vortexRadius = Math.random() * spread;
          const vortexAngle = Math.random() * Math.PI * 2;
          position = new THREE.Vector3(
            Math.cos(vortexAngle) * vortexRadius,
            (Math.random() - 0.5) * spread,
            Math.sin(vortexAngle) * vortexRadius
          );
          velocity = new THREE.Vector3(
            -Math.sin(vortexAngle) * speed,
            (Math.random() - 0.5) * speed * 0.5,
            Math.cos(vortexAngle) * speed
          );
          break;
          
        case 'galaxy':
          const armAngle = Math.random() * Math.PI * 2;
          const armRadius = Math.random() * spread;
          const spiral = armRadius * 0.3;
          position = new THREE.Vector3(
            Math.cos(armAngle + spiral) * armRadius,
            (Math.random() - 0.5) * spread * 0.3,
            Math.sin(armAngle + spiral) * armRadius
          );
          velocity = new THREE.Vector3(
            -Math.sin(armAngle) * speed * 0.5,
            (Math.random() - 0.5) * speed * 0.2,
            Math.cos(armAngle) * speed * 0.5
          );
          break;
          
        case 'quantum':
          position = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          );
          velocity = new THREE.Vector3(
            Math.sin(i * 0.1) * speed,
            Math.cos(i * 0.1) * speed,
            Math.sin(i * 0.05) * speed
          );
          break;
          
        case 'neural':
          const neuralLayer = Math.floor(i / (count / 5));
          position = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            neuralLayer - 2,
            (Math.random() - 0.5) * spread * 0.5
          );
          velocity = new THREE.Vector3(
            (Math.random() - 0.5) * speed * 0.3,
            speed * 0.1,
            (Math.random() - 0.5) * speed * 0.3
          );
          break;
          
        default: // stream
          position = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            -spread,
            (Math.random() - 0.5) * spread
          );
          velocity = new THREE.Vector3(
            (Math.random() - 0.5) * speed,
            speed,
            (Math.random() - 0.5) * speed
          );
      }
      
      const colorIndex = Math.floor(Math.random() * particleColors.length);
      const maxLife = 100 + Math.random() * 100;
      
      particles.push({
        position: position.clone(),
        velocity: velocity.clone(),
        life: maxLife,
        maxLife,
        size: size * (0.5 + Math.random() * 1.5),
        color: new THREE.Color(particleColors[colorIndex]),
        opacity: 1,
        acceleration: new THREE.Vector3(0, gravity, 0)
      });
    }
    
    particlesRef.current = particles;
  }, [count, spread, speed, size, particleColors, gravity, type]);

  // Update particles
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    setTime(state.clock.elapsedTime);
    const particles = particlesRef.current;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colorsArray = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;
    
    // Mouse interaction
    const mouseVector = new THREE.Vector3(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );
    
    particles.forEach((particle, i) => {
      // Apply physics
      particle.velocity.add(particle.acceleration);
      
      // Mouse attraction/repulsion
      if (interactive) {
        const mouseDistance = particle.position.distanceTo(mouseVector);
        if (mouseDistance < 5) {
          const force = mouseVector.clone().sub(particle.position).normalize();
          force.multiplyScalar(mouseAttraction / (mouseDistance + 1));
          particle.velocity.add(force);
        }
      }
      
      // Add turbulence
      particle.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * turbulence,
        (Math.random() - 0.5) * turbulence,
        (Math.random() - 0.5) * turbulence
      ));
      
      // Type-specific behaviors
      switch (type) {
        case 'vortex':
          const vortexCenter = new THREE.Vector3(0, 0, 0);
          const toCenter = vortexCenter.clone().sub(particle.position);
          const distance = toCenter.length();
          if (distance > 0.1) {
            const vortexForce = new THREE.Vector3(-toCenter.z, 0, toCenter.x);
            vortexForce.normalize().multiplyScalar(0.01 / distance);
            particle.velocity.add(vortexForce);
          }
          break;
          
        case 'quantum':
          // Quantum tunneling effect
          if (Math.random() < 0.001) {
            particle.position.set(
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread
            );
          }
          // Wave function
          particle.velocity.y += Math.sin(time * 2 + i * 0.1) * 0.002;
          break;
          
        case 'neural':
          // Neural network connection simulation
          const layerTarget = Math.floor(particle.position.y) + 1;
          if (layerTarget < 3) {
            particle.velocity.y += 0.001;
          }
          break;
      }
      
      // Update position
      particle.position.add(particle.velocity);
      
      // Update life and opacity
      particle.life--;
      particle.opacity = particle.life / particle.maxLife;
      
      // Reset particle if dead or out of bounds
      if (particle.life <= 0 || 
          Math.abs(particle.position.x) > spread * 2 ||
          Math.abs(particle.position.y) > spread * 2 ||
          Math.abs(particle.position.z) > spread * 2) {
        
        // Reinitialize based on type
        switch (type) {
          case 'burst':
            particle.position.set(0, 0, 0);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * spread;
            particle.velocity.set(
              Math.cos(angle) * radius * speed,
              Math.sin(angle) * radius * speed,
              (Math.random() - 0.5) * speed
            );
            break;
            
          default:
            particle.position.set(
              (Math.random() - 0.5) * spread,
              -spread,
              (Math.random() - 0.5) * spread
            );
            particle.velocity.set(
              (Math.random() - 0.5) * speed,
              speed,
              (Math.random() - 0.5) * speed
            );
        }
        
        particle.life = particle.maxLife;
        particle.opacity = 1;
      }
      
      // Update buffers
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;
      
      colorsArray[i3] = particle.color.r;
      colorsArray[i3 + 1] = particle.color.g;
      colorsArray[i3 + 2] = particle.color.b;
      
      sizes[i] = particle.size * particle.opacity;
    });
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  // Create geometry
  const positions = new Float32Array(count * 3);
  const colorsArray = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colorsArray}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <PointMaterial
        size={size}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function AdvancedParticleSystem(props: ParticleSystemProps) {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <ParticleField {...props} />
      </Canvas>
    </div>
  );
}

export default AdvancedParticleSystem;
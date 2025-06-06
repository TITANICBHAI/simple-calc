"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Advanced shader materials
const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uColor1: new THREE.Color('#3b82f6'),
    uColor2: new THREE.Color('#8b5cf6'),
    uColor3: new THREE.Color('#ec4899'),
    uIntensity: 1.0,
    uSpeed: 1.0,
    uComplexity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uComplexity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise functions
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 mouseUv = uMouse / uResolution;
      
      // Create flowing energy waves
      float time = uTime * uSpeed;
      
      // Multiple layers of noise for complexity
      float noise1 = snoise(vec3(uv * 3.0 * uComplexity, time * 0.5));
      float noise2 = snoise(vec3(uv * 6.0 * uComplexity, time * 0.8));
      float noise3 = snoise(vec3(uv * 12.0 * uComplexity, time * 1.2));
      
      // Combine noise layers
      float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Create ripples from mouse position
      float mouseDistance = distance(uv, mouseUv);
      float mouseRipple = sin(mouseDistance * 20.0 - time * 4.0) * exp(-mouseDistance * 3.0);
      
      // Energy field calculation
      float energy = combinedNoise + mouseRipple * 0.5;
      energy = smoothstep(-0.5, 0.5, energy);
      
      // Color mixing based on energy and position
      vec3 color1 = uColor1;
      vec3 color2 = uColor2;
      vec3 color3 = uColor3;
      
      // Create gradient zones
      float zone1 = smoothstep(0.0, 0.4, energy);
      float zone2 = smoothstep(0.3, 0.7, energy);
      float zone3 = smoothstep(0.6, 1.0, energy);
      
      vec3 finalColor = mix(color1, color2, zone1);
      finalColor = mix(finalColor, color3, zone2);
      
      // Add energy glow
      float glow = pow(energy, 2.0) * uIntensity;
      finalColor += glow * 0.3;
      
      // Add sparkle effects
      float sparkle = step(0.98, snoise(vec3(uv * 50.0, time * 2.0)));
      finalColor += sparkle * vec3(1.0, 1.0, 0.8) * 0.8;
      
      // Pulse effect
      float pulse = sin(time * 3.0) * 0.1 + 0.9;
      finalColor *= pulse;
      
      // Final alpha based on energy
      float alpha = energy * 0.7 + 0.1;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

const NeuralShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uNodeColor: new THREE.Color('#00ff88'),
    uConnectionColor: new THREE.Color('#0088ff'),
    uPulseColor: new THREE.Color('#ff0088'),
    uActivity: 1.0,
    uDensity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uNodeColor;
    uniform vec3 uConnectionColor;
    uniform vec3 uPulseColor;
    uniform float uActivity;
    uniform float uDensity;
    
    varying vec2 vUv;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 mouseUv = uMouse / uResolution;
      
      // Create neural network nodes
      vec2 nodeGrid = uv * 8.0 * uDensity;
      vec2 nodeId = floor(nodeGrid);
      vec2 nodeUv = fract(nodeGrid);
      
      // Node positions with some randomness
      vec2 nodePos = vec2(0.5) + 0.3 * (vec2(hash(nodeId), hash(nodeId + 100.0)) - 0.5);
      
      // Distance to node center
      float nodeDistance = distance(nodeUv, nodePos);
      
      // Create nodes
      float nodeRadius = 0.1 + 0.05 * sin(uTime * 2.0 + hash(nodeId) * 10.0);
      float node = 1.0 - smoothstep(nodeRadius - 0.02, nodeRadius, nodeDistance);
      
      // Node activity pulse
      float nodeActivity = sin(uTime * 3.0 + hash(nodeId) * 6.28) * 0.5 + 0.5;
      node *= nodeActivity * uActivity;
      
      // Create connections between nodes
      vec2 connection = vec2(0.0);
      
      // Check neighboring nodes
      for(int dx = -1; dx <= 1; dx++) {
        for(int dy = -1; dy <= 1; dy++) {
          if(dx == 0 && dy == 0) continue;
          
          vec2 neighborId = nodeId + vec2(float(dx), float(dy));
          vec2 neighborPos = vec2(0.5) + 0.3 * (vec2(hash(neighborId), hash(neighborId + 100.0)) - 0.5);
          neighborPos += vec2(float(dx), float(dy));
          
          // Connection strength based on activity
          float connectionStrength = hash(nodeId + neighborId);
          if(connectionStrength > 0.7) {
            // Draw connection line
            vec2 toNeighbor = normalize(neighborPos - (nodePos + nodeId));
            vec2 currentPos = nodeUv + nodeId;
            
            float lineDistance = abs(dot(currentPos - (nodePos + nodeId), vec2(-toNeighbor.y, toNeighbor.x)));
            float lineMask = 1.0 - smoothstep(0.02, 0.05, lineDistance);
            
            // Pulse along connection
            float pulsePos = fract(uTime * 2.0 + hash(neighborId) * 10.0);
            float connectionProgress = dot(currentPos - (nodePos + nodeId), toNeighbor) / distance(neighborPos, nodePos + nodeId);
            float pulse = exp(-abs(connectionProgress - pulsePos) * 50.0);
            
            connection += vec2(lineMask * (0.3 + pulse * 0.7));
          }
        }
      }
      
      // Mouse interaction - increase activity near mouse
      float mouseInfluence = 1.0 - smoothstep(0.0, 0.3, distance(uv, mouseUv));
      float totalActivity = (node + connection.x) * (1.0 + mouseInfluence * 2.0);
      
      // Color mixing
      vec3 nodeColor = uNodeColor * node;
      vec3 connectionColor = uConnectionColor * connection.x;
      vec3 pulseColor = uPulseColor * connection.y;
      
      vec3 finalColor = nodeColor + connectionColor + pulseColor;
      
      // Add background neural field
      float field = noise(uv * 20.0 + uTime * 0.5) * 0.1;
      finalColor += field * uNodeColor * 0.3;
      
      // Final alpha
      float alpha = totalActivity * 0.8 + 0.1;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

const QuantumShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uQuantumColor1: new THREE.Color('#00ffff'),
    uQuantumColor2: new THREE.Color('#ff00ff'),
    uEntanglementColor: new THREE.Color('#ffff00'),
    uCoherence: 1.0,
    uTunneling: 0.5,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uQuantumColor1;
    uniform vec3 uQuantumColor2;
    uniform vec3 uEntanglementColor;
    uniform float uCoherence;
    uniform float uTunneling;
    
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Wave function visualization
    float waveFunction(vec2 p, float t) {
      float wave1 = sin(p.x * 10.0 + t * 2.0) * cos(p.y * 8.0 + t * 1.5);
      float wave2 = cos(p.x * 6.0 - t * 1.8) * sin(p.y * 12.0 - t * 2.2);
      return (wave1 + wave2) * 0.5;
    }
    
    // Quantum tunneling effect
    float tunneling(vec2 p, float t) {
      float barrier = step(0.4, abs(p.x - 0.5)) * step(abs(p.y - 0.5), 0.1);
      float probability = exp(-abs(p.x - 0.5) * 5.0) * uTunneling;
      return barrier * probability * sin(t * 4.0);
    }
    
    // Entanglement visualization
    float entanglement(vec2 p1, vec2 p2, float t) {
      float distance = length(p1 - p2);
      float correlation = sin(distance * 15.0 - t * 3.0) * exp(-distance * 2.0);
      return correlation;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 mouseUv = uMouse / uResolution;
      
      // Quantum wave function
      float psi = waveFunction(uv, uTime);
      float probability = psi * psi * uCoherence;
      
      // Superposition effect
      float superposition = sin(uv.x * 20.0 + uTime * 3.0) * cos(uv.y * 15.0 + uTime * 2.5);
      superposition = abs(superposition) * 0.5;
      
      // Quantum tunneling
      float tunnel = tunneling(uv, uTime);
      
      // Entanglement between points
      vec2 entanglePoint1 = vec2(0.3, 0.3);
      vec2 entanglePoint2 = vec2(0.7, 0.7);
      float entangle = entanglement(uv, entanglePoint1, uTime) + entanglement(uv, entanglePoint2, uTime);
      
      // Mouse interaction - quantum measurement collapse
      float mouseDistance = distance(uv, mouseUv);
      float measurement = exp(-mouseDistance * 8.0);
      float collapse = measurement * sin(uTime * 10.0);
      
      // Interference patterns
      float interference = sin((uv.x + uv.y) * 25.0 + uTime * 4.0) * 0.3;
      
      // Quantum field fluctuations
      float vacuum = random(uv + uTime * 0.1) * 0.1;
      
      // Color composition
      float quantumField = probability + superposition + tunnel + entangle * 0.5;
      
      vec3 color1 = uQuantumColor1 * (probability + interference);
      vec3 color2 = uQuantumColor2 * (superposition + tunnel);
      vec3 entangleColor = uEntanglementColor * entangle;
      
      vec3 finalColor = color1 + color2 + entangleColor + vacuum;
      
      // Measurement effect
      finalColor = mix(finalColor, finalColor * collapse, measurement);
      
      // Uncertainty principle visualization
      float uncertainty = sin(uv.x * uv.y * 100.0 + uTime * 5.0) * 0.1;
      finalColor += uncertainty;
      
      // Final alpha with quantum probabilistic nature
      float alpha = quantumField * 0.7 + 0.2;
      alpha *= (1.0 + sin(uTime * 6.0) * 0.2); // Quantum fluctuations
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

// Extend materials for use in R3F
extend({ WaveShaderMaterial, NeuralShaderMaterial, QuantumShaderMaterial });

interface ShaderBackgroundProps {
  type: 'wave' | 'neural' | 'quantum';
  intensity?: number;
  speed?: number;
  interactive?: boolean;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

function ShaderPlane({ 
  type, 
  intensity = 1.0, 
  speed = 1.0, 
  interactive = true,
  colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899'
  }
}: ShaderBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMouse(new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      ));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as any;
    material.uTime = state.clock.elapsedTime * speed;
    material.uMouse = mouse;
    material.uResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // Update material-specific uniforms
    if (type === 'wave') {
      material.uIntensity = intensity;
      material.uSpeed = speed;
      material.uColor1 = new THREE.Color(colors.primary);
      material.uColor2 = new THREE.Color(colors.secondary);
      material.uColor3 = new THREE.Color(colors.accent);
    } else if (type === 'neural') {
      material.uActivity = intensity;
      material.uNodeColor = new THREE.Color(colors.primary);
      material.uConnectionColor = new THREE.Color(colors.secondary);
      material.uPulseColor = new THREE.Color(colors.accent);
    } else if (type === 'quantum') {
      material.uCoherence = intensity;
      material.uQuantumColor1 = new THREE.Color(colors.primary);
      material.uQuantumColor2 = new THREE.Color(colors.secondary);
      material.uEntanglementColor = new THREE.Color(colors.accent);
    }
  });

  const MaterialComponent = {
    wave: 'waveShaderMaterial',
    neural: 'neuralShaderMaterial',
    quantum: 'quantumShaderMaterial'
  }[type] as keyof JSX.IntrinsicElements;

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <MaterialComponent 
        transparent
        side={THREE.DoubleSide}
        key={type}
      />
    </mesh>
  );
}

export function ShaderEffects(props: ShaderBackgroundProps) {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <ShaderPlane {...props} />
      </Canvas>
    </div>
  );
}

export default ShaderEffects;
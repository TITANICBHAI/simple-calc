"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Shield,
  TestTube
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
  enabled: boolean;
  requirements?: string[];
  warnings?: string[];
}

const featureFlags: FeatureFlag[] = [
  {
    id: 'advanced-3d-viz',
    name: 'Advanced 3D Visualization',
    description: 'High-performance 3D mathematical plotting with WebGL',
    status: 'beta',
    enabled: true,
    requirements: ['WebGL 2.0 support'],
    warnings: ['May impact performance on older devices']
  },
  {
    id: 'ai-reasoning',
    name: 'AI Mathematical Reasoning',
    description: 'AI-powered problem solving and step-by-step solutions',
    status: 'experimental',
    enabled: false,
    requirements: ['Modern browser', 'Good network connection'],
    warnings: ['Results may vary', 'Requires validation']
  },
  {
    id: 'quantum-computing',
    name: 'Quantum Computing Simulator',
    description: 'Quantum circuit design and simulation tools',
    status: 'experimental',
    enabled: false,
    requirements: ['High-performance device'],
    warnings: ['Resource intensive', 'Limited functionality']
  },
  {
    id: 'symbolic-computation',
    name: 'Symbolic Mathematics',
    description: 'Advanced symbolic algebra and calculus operations',
    status: 'stable',
    enabled: true
  },
  {
    id: 'ml-integration',
    name: 'Machine Learning Tools',
    description: 'Statistical modeling and data analysis with ML',
    status: 'beta',
    enabled: true,
    warnings: ['Computationally intensive']
  }
];

export default function FeatureStabilizationSystem() {
  const [features, setFeatures] = useState<FeatureFlag[]>(featureFlags);
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    webglSupport: false,
    performanceLevel: 'unknown' as 'low' | 'medium' | 'high' | 'unknown'
  });

  // Check device capabilities
  useEffect(() => {
    const checkCapabilities = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      
      setDeviceCapabilities({
        webglSupport: !!gl,
        performanceLevel: navigator.hardwareConcurrency > 8 ? 'high' : 
                         navigator.hardwareConcurrency > 4 ? 'medium' : 'low'
      });
    };

    checkCapabilities();
  }, []);

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'experimental': return 'bg-orange-100 text-orange-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return <CheckCircle className="w-4 h-4" />;
      case 'beta': return <Zap className="w-4 h-4" />;
      case 'experimental': return <TestTube className="w-4 h-4" />;
      case 'deprecated': return <AlertTriangle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const enabledExperimentalCount = features.filter(f => 
    f.status === 'experimental' && f.enabled
  ).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="w-8 h-8" />
          Feature Management
        </h1>
        <p className="text-muted-foreground">
          Control experimental features and optimize app stability
        </p>
      </div>

      {enabledExperimentalCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {enabledExperimentalCount} experimental feature(s) enabled. 
            These may affect app stability and performance.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Device Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WebGL Support</Label>
              <Badge variant={deviceCapabilities.webglSupport ? "default" : "destructive"}>
                {deviceCapabilities.webglSupport ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>Performance Level</Label>
              <Badge variant="outline">
                {deviceCapabilities.performanceLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(feature.status)}
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  disabled={feature.status === 'deprecated'}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              
              {feature.requirements && (
                <div>
                  <Label className="text-xs font-semibold">Requirements:</Label>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {feature.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.warnings && feature.enabled && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <Label className="text-xs font-semibold text-yellow-800">Warnings:</Label>
                      <ul className="text-xs text-yellow-700 mt-1">
                        {feature.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {feature.status === 'experimental' && feature.enabled && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-orange-700">
                      This feature is experimental and may change or be removed in future updates.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stability Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deviceCapabilities.performanceLevel === 'low' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Consider disabling experimental features for better performance on your device.
              </AlertDescription>
            </Alert>
          )}
          
          {!deviceCapabilities.webglSupport && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                3D visualization features may not work properly without WebGL support.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>• <strong>Stable:</strong> Fully tested and reliable features</p>
            <p>• <strong>Beta:</strong> Well-tested but may have minor issues</p>
            <p>• <strong>Experimental:</strong> New features under development</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
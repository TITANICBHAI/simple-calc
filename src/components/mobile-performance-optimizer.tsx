"use client";

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizationConfig {
  enableLazyLoading: boolean;
  reduceAnimations: boolean;
  compressImages: boolean;
  limitConcurrentCalculations: boolean;
  useLowQualityRendering: boolean;
}

/**
 * Mobile Performance Optimizer
 * Automatically adjusts app behavior for better mobile performance
 */
export function useMobileOptimization() {
  const isMobile = useIsMobile();
  const [config, setConfig] = useState<MobileOptimizationConfig>({
    enableLazyLoading: true,
    reduceAnimations: false,
    compressImages: true,
    limitConcurrentCalculations: true,
    useLowQualityRendering: false
  });

  // Detect device capabilities
  const deviceCapabilities = useMemo(() => {
    if (typeof window === 'undefined') return { isLowEnd: false, hasGoodConnection: true };
    
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      isLowEnd: navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4,
      hasGoodConnection: !connection || connection.effectiveType === '4g',
      batteryLevel: navigator.getBattery?.()?.then?.((battery: any) => battery.level) || 1
    };
  }, []);

  // Auto-adjust settings based on device
  useEffect(() => {
    if (!isMobile) return;

    const optimizeForDevice = () => {
      setConfig(prev => ({
        ...prev,
        reduceAnimations: deviceCapabilities.isLowEnd,
        useLowQualityRendering: deviceCapabilities.isLowEnd,
        limitConcurrentCalculations: true,
        enableLazyLoading: true
      }));
    };

    optimizeForDevice();
  }, [isMobile, deviceCapabilities]);

  return { config, isMobile, deviceCapabilities };
}

/**
 * Performance-aware component wrapper
 */
interface PerformanceWrapperProps {
  children: React.ReactNode;
  highPerformance?: boolean;
  fallback?: React.ReactNode;
}

export function PerformanceWrapper({ 
  children, 
  highPerformance = false, 
  fallback 
}: PerformanceWrapperProps) {
  const { config, isMobile, deviceCapabilities } = useMobileOptimization();
  
  // Skip intensive components on low-end mobile devices
  if (isMobile && highPerformance && deviceCapabilities.isLowEnd) {
    return <>{fallback || <div className="p-4 text-center text-muted-foreground">Component optimized for desktop</div>}</>;
  }

  return <>{children}</>;
}
"use client";

import { useState, useEffect, type ReactNode } from 'react';

interface HydrationSafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component to prevent hydration mismatches
 * Only renders children after client-side hydration is complete
 */
export default function HydrationSafeWrapper({ 
  children, 
  fallback = null 
}: HydrationSafeWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
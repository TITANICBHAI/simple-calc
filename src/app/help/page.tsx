"use client";

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PerformanceWrapper } from '@/components/mobile-performance-optimizer';
import HydrationSafeWrapper from '@/components/hydration-safe-wrapper';

// Lazy load components for better performance
import dynamic from 'next/dynamic';

const UserGuideSystem = dynamic(() => import('@/components/user-guide-system'), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />
});

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator
            </Button>
          </Link>
        </div>

        <HydrationSafeWrapper>
          <PerformanceWrapper>
            <Suspense fallback={
              <div className="space-y-4">
                <div className="animate-pulse bg-muted h-12 rounded-lg w-1/2" />
                <div className="animate-pulse bg-muted h-32 rounded-lg" />
                <div className="animate-pulse bg-muted h-64 rounded-lg" />
              </div>
            }>
              <UserGuideSystem />
            </Suspense>
          </PerformanceWrapper>
        </HydrationSafeWrapper>
      </div>
    </div>
  );
}
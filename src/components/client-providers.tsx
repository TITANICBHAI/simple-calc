"use client";

import type { ReactNode } from 'react';
import { useEffect, Suspense } from 'react';
import { ThemeProvider as NextThemesProvider } from "@/components/theme-provider";
import { ColorThemeProvider } from '@/components/color-theme-provider';
import { Toaster } from "@/components/ui/toaster";
import HydrationSafeWrapper from '@/components/hydration-safe-wrapper';

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // This effect runs once on the client after initial hydration.
    // It dynamically imports Firebase to ensure it's client-side and to handle initialization.
    if (typeof window !== 'undefined') {
      import('@/lib/firebase').then(({ analytics, logEvent }) => {
        if (analytics) { // Check if analytics was successfully initialized
          logEvent('page_view', {
            page_path: window.location.pathname,
            page_title: document.title,
          });
        }
      }).catch(error => {
        console.error("Failed to load Firebase module for Analytics:", error);
      });
    }
  }, []);

  return (
    <HydrationSafeWrapper fallback={<div className="min-h-screen bg-background" />}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ColorThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-background animate-pulse" />}>
            {children}
          </Suspense>
          <Toaster />
        </ColorThemeProvider>
      </NextThemesProvider>
    </HydrationSafeWrapper>
  );
}

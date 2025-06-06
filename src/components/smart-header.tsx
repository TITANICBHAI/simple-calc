"use client";

import React from 'react';
import Link from 'next/link';
import { Calculator, Coffee, Settings, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KofiButton } from '@/components/ui/kofi-button';
import { HeaderAd } from '@/components/ui/adsense-ad';
import { Badge } from '@/components/ui/badge';

interface SmartHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  showAIBadge?: boolean;
  className?: string;
}

export function SmartHeader({
  title = "Calculator",
  subtitle = "Professional Mathematical Tools",
  showBackButton = false,
  backHref = "/",
  showAIBadge = true,
  className
}: SmartHeaderProps) {
  return (
    <div className={className}>

      
      {/* Main Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Title & Navigation */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={backHref}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Back to {backHref === "/" ? "Home" : "Calculator"}
                  </Link>
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-3">
              {/* AI Badge */}
              {showAIBadge && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}

              {/* Settings Button */}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>

              {/* Donate Button */}
              <KofiButton size="sm" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default SmartHeader;
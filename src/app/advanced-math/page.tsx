"use client";

import React from 'react';
import { SmartHeader } from '@/components/smart-header';
import AdvancedMathSuite from '@/components/advanced-math-suite';

export default function AdvancedMathPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <SmartHeader 
        title="MathCore AI Advanced Suite" 
        subtitle="Symbolic mathematics, calculus, and advanced equation solving"
        showBackButton={true}
        showAIBadge={true}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AdvancedMathSuite />
      </div>
    </div>
  );
}
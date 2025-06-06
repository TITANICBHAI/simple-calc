"use client";

import React from 'react';
import { SmartHeader } from '@/components/smart-header';
import { HeaderAd } from '@/components/ui/adsense-ad';
import { RedesignedMLQuantumLab } from '@/components/redesigned-ml-quantum-lab';

export default function MLQuantumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
      <SmartHeader 
        title="MathCore AI Lab" 
        subtitle="Advanced Machine Learning & Quantum Computing Platform"
        showBackButton={true}
        showAIBadge={true}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <RedesignedMLQuantumLab />
      </div>
    </div>
  );
}
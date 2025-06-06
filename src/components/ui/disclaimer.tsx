'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'default' | 'destructive' | 'warning';
  className?: string;
}

export function Disclaimer({ variant = 'warning', className = '' }: DisclaimerProps) {
  return (
    <Alert variant={variant === 'warning' ? 'destructive' : variant} className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 text-sm">
        <strong>⚠️ DISCLAIMER:</strong> This application is for educational and research purposes only. 
        We do not take responsibility for any errors, damage, wrong calculations, or consequences 
        arising from the use of this software. Users assume all liability and risk. 
        Always verify results independently before making any decisions.
      </AlertDescription>
    </Alert>
  );
}

export function MathDisclaimer({ className = '' }: { className?: string }) {
  return (
    <Alert variant="destructive" className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 text-sm">
        <strong>⚠️ MATHEMATICAL COMPUTATION DISCLAIMER:</strong> All calculations and algorithms 
        are provided "AS IS" without warranty. Results may contain numerical errors, precision 
        limitations, or algorithmic inaccuracies. Do not use for critical applications without 
        independent verification. No liability accepted for computational errors or damages.
      </AlertDescription>
    </Alert>
  );
}

export function QuantumDisclaimer({ className = '' }: { className?: string }) {
  return (
    <Alert variant="destructive" className={`border-purple-200 bg-purple-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-purple-600" />
      <AlertDescription className="text-purple-800 text-sm">
        <strong>⚠️ QUANTUM SIMULATION DISCLAIMER:</strong> Quantum simulations are approximations 
        and may not accurately represent real quantum systems. Results are for educational purposes 
        only and should not be used for actual quantum computing applications. No responsibility 
        for simulation accuracy or quantum algorithm correctness.
      </AlertDescription>
    </Alert>
  );
}

export function DataDisclaimer({ className = '' }: { className?: string }) {
  return (
    <Alert variant="destructive" className={`border-blue-200 bg-blue-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 text-sm">
        <strong>⚠️ DATA PROCESSING DISCLAIMER:</strong> Data analysis results may be inaccurate 
        or incomplete. Users are responsible for data quality and interpretation. We accept no 
        liability for data corruption, loss, privacy breaches, or incorrect analysis results. 
        Always backup your data and verify all outputs.
      </AlertDescription>
    </Alert>
  );
}
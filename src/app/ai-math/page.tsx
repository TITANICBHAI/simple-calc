"use client";
import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Star } from 'lucide-react';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import { SmartHeader } from '@/components/smart-header';

const EnhancedAIMathSolver = lazy(() => import('@/components/enhanced-ai-math-solver'));

export default function AiMathPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <SmartHeader 
        title="AI Math Solver" 
        subtitle="Intelligent problem solver with step-by-step explanations"
        showBackButton={true}
        showAIBadge={true}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">💡 Recommended: Enhanced AI Solver</h3>
                <p className="text-blue-700 text-sm">
                  For the best AI math experience, try our <strong>Enhanced AI Solver</strong> in the 
                  <Link href="/calculator" className="underline font-medium hover:text-blue-800 mx-1">
                    Professional Mathematics Toolkit
                  </Link>
                  (Calculator page, AI Solver tab). It's more accurate and reliable than this version.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
              <Suspense fallback={<div className="text-center py-8">Loading AI Math Assistant...</div>}>
                <EnhancedAIMathSolver />
              </Suspense>
            </Card>
          </div>

          {/* Side Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">✨ AI Math Tips</h3>
              <div className="space-y-3 text-sm text-purple-800">
                <p>• Be specific in your questions</p>
                <p>• Include all given information</p>
                <p>• Ask for step-by-step solutions</p>
                <p>• Verify important calculations</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Ad Area */}
        <div className="max-w-4xl mx-auto mt-12 mb-8 text-center">
          <AdSenseAd 
            adSlot="7890123456"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>
      </div>
    </div>
  );
}
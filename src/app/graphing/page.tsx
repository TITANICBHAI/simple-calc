"use client";
import { useState, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Layers, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { KofiButton } from '@/components/ui/kofi-button';
import AdSenseAd from '@/components/AdSenseAd';

const GraphingCalculator = lazy(() => import('@/components/calculator/graphing-calculator'));
const Working3DGrapher = lazy(() => import('@/components/working-3d-grapher'));

export default function GraphingPage() {
  const [activeTab, setActiveTab] = useState('2d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Floating Ko-fi Button */}
      <KofiButton variant="floating" />
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Graphing Calculator</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">


        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="flex space-x-4 mb-6 border-b">
                {[
                  { id: '2d', label: '2D Graphing', icon: BarChart3 },
                  { id: '3d', label: '3D Graphing', icon: Layers }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500' 
                        : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <Suspense fallback={<div className="text-center py-8">Loading graphing calculator...</div>}>
                {activeTab === '2d' && <GraphingCalculator />}
                {activeTab === '3d' && (
                  <Suspense fallback={<div className="text-center py-8">Loading 3D grapher...</div>}>
                    <Working3DGrapher />
                  </Suspense>
                )}
              </Suspense>
            </Card>
          </div>

          {/* Sidebar Ad */}
          <div className="lg:col-span-1">
            <AdSenseAd 
              adSlot="6789012345"
              adFormat="auto"
              className="mb-6"
              adStyle={{ display: 'block', minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Mathematical Graphing Disclaimer */}
        <Card className="mt-12 border-2 border-purple-200 bg-purple-50">
          <div className="p-6 text-purple-800 space-y-3">
            <h3 className="text-xl font-bold">⚠️ Graphing Calculator Disclaimer</h3>
            <p><strong>EDUCATIONAL PURPOSE:</strong> These graphing tools are for educational and visualization purposes only.</p>
            <p><strong>NO ACCURACY GUARANTEE:</strong> We make NO WARRANTY regarding the precision of graphs, mathematical plots, or calculations.</p>
            <p><strong>VERIFY CRITICAL WORK:</strong> Always verify important mathematical work with professional software and qualified instructors.</p>
            <p><strong>NOT EXAM SUBSTITUTE:</strong> Do not rely on these tools for exams, assignments, or professional mathematical work without verification.</p>
            <p><strong>USE AT YOUR OWN RISK:</strong> You are fully responsible for any consequences from using these graphing calculators.</p>
          </div>
        </Card>

        {/* Bottom Ad */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
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
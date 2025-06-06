"use client";
import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Ruler } from 'lucide-react';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

const UnitConverter = lazy(() => import('@/components/calculator/unit-converter'));

export default function UnitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to MathHub
              </Link>
            </Button>
            <Ruler className="h-8 w-8 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-900">Unit Converter</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <AdSenseAd 
            adSlot="8901234567"
            adFormat="rectangle"
            className="mb-6"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '280px' }}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-0">
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
              <Suspense fallback={<div className="text-center py-8">Loading unit converter...</div>}>
                <UnitConverter />
              </Suspense>
            </Card>
          </div>

          {/* Sidebar Ad */}
          <div className="lg:col-span-1">
            <AdSenseAd 
              adSlot="9012345678"
              adFormat="auto"
              className="mb-6"
              adStyle={{ display: 'block', minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Unit Conversion Disclaimer */}
        <Card className="mt-12 border-2 border-teal-200 bg-teal-50">
          <CardContent className="text-teal-800 space-y-3 p-6">
            <h3 className="text-xl font-bold">⚠️ Unit Conversion Disclaimer</h3>
            <p><strong>APPROXIMATION NOTICE:</strong> Unit conversions are mathematical approximations and may not be perfectly precise for all applications.</p>
            <p><strong>NO ACCURACY GUARANTEE:</strong> We make NO WARRANTY regarding the precision of these conversions for professional, scientific, or critical applications.</p>
            <p><strong>VERIFY CRITICAL MEASUREMENTS:</strong> Always verify important measurements with authoritative sources and professional instruments.</p>
            <p><strong>NOT FOR SAFETY-CRITICAL USE:</strong> Do not use these conversions for medical, engineering, aviation, or other safety-critical applications without professional verification.</p>
            <p><strong>USE AT YOUR OWN RISK:</strong> You are fully responsible for any consequences from using these unit conversions.</p>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <AdSenseAd 
            adSlot="0123456789"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>
      </div>
    </div>
  );
}
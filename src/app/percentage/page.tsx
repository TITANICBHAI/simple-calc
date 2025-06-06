"use client";
import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Percent } from 'lucide-react';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

const PercentageCalculator = lazy(() => import('@/components/calculator/percentage-calculator'));

export default function PercentagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Percent className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Percentage Calculator</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">


        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
              <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                <PercentageCalculator />
              </Suspense>
            </Card>
          </div>

          {/* Sidebar Ad */}
          <div className="lg:col-span-1">
            <AdSenseAd 
              adSlot="8901234567"
              adFormat="auto"
              className="mb-6"
              adStyle={{ display: 'block', minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Mathematical Disclaimer */}
        <Card className="mt-12 border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="text-yellow-800 space-y-3 p-6">
            <p><strong>⚠️ CALCULATION DISCLAIMER:</strong> These percentage calculations are for educational and informational purposes only.</p>
            <p><strong>NO ACCURACY GUARANTEE:</strong> While we strive for precision, we make NO WARRANTY regarding the accuracy of these calculations. Always verify important calculations independently.</p>
            <p><strong>NOT PROFESSIONAL ADVICE:</strong> These tools do not constitute professional, financial, or academic advice. Consult qualified professionals for important decisions.</p>
            <p><strong>USE AT YOUR OWN RISK:</strong> You assume full responsibility for any consequences resulting from the use of these calculators. We are NOT liable for any errors, losses, or damages.</p>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <AdSenseAd 
            adSlot="9012345678"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>
      </div>
    </div>
  );
}
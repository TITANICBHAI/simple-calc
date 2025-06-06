
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, CheckCircle2, LineChart, Sigma, Bot, Cpu, Ruler, Code2, BarChart3 } from 'lucide-react'; // Added BarChart3
import { logEvent } from '@/lib/firebase';

interface PremiumFeaturesDialogProps {
  onClose: () => void;
}

const PremiumFeaturesDialog: React.FC<PremiumFeaturesDialogProps> = ({ onClose }) => {
  const premiumFeaturesList = [
    {
      title: "Full Mathematical Expression Parser",
      description: "Type complex expressions like (2+3)*sin(pi/4)^2 and get accurate results with correct operator precedence. No more one-by-one operations!",
      icon: <Sigma className="h-5 w-5 text-primary" />,
    },
    {
      title: "Interactive Graphing Calculator",
      description: "Plot multiple functions, zoom and pan interactively, trace points on curves, and find roots, intersections, and local min/max values.",
      icon: <LineChart className="h-5 w-5 text-primary" />,
    },
    {
      title: "Comprehensive Unit Converter",
      description: "Access an expanded range of unit categories (Torque, Fuel Economy, Data Rates, Angle, etc.) and define your own custom units.",
      icon: <Ruler className="h-5 w-5 text-primary" />,
    },
    {
      title: "Advanced Matrix Solver",
      description: "Support for larger matrices (e.g., 5x5+), and step-by-step views for operations like Gaussian elimination or finding an inverse.",
      icon: <Code2 className="h-5 w-5 text-primary" />,
    },
    {
      title: "Advanced Statistics Visualizations",
      description: "Generate histograms and box plots directly within the Statistics Calculator to better understand data distributions.",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
    },
     {
      title: "Higher Precision Engine",
      description: "Enable arbitrary-precision arithmetic for calculations, avoiding common floating-point inaccuracies. Essential for finance, engineering, and science.",
      icon: <Cpu className="h-5 w-5 text-primary" />,
    },
    {
      title: "Complex Number Support",
      description: "Perform arithmetic and functions with complex numbers (e.g., (2+3i) * (1-i)).",
      icon: <Sigma className="h-5 w-5 text-primary transform rotate-90" />,
    },
  ];

  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle className="text-2xl font-semibold flex items-center">
          <Star className="mr-2 h-6 w-6 text-yellow-400" />
          Unlock Premium Features
        </DialogTitle>
        <DialogDescription>
          Supercharge your calculations with these advanced tools and capabilities!
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-4 -mr-4 mb-4">
        <div className="space-y-4">
          {premiumFeaturesList.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex-shrink-0 text-primary mt-1">{feature.icon || <CheckCircle2 className="h-5 w-5" />}</div>
              <div>
                <h4 className="font-semibold text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
           <div className="flex items-start space-x-3 p-3 bg-green-100/50 dark:bg-green-800/20 rounded-lg border border-green-500/30">
              <div className="flex-shrink-0 text-green-600 dark:text-green-400 mt-1"><Bot className="h-5 w-5" /></div>
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300">AI-Powered Features (Future Premium)</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Including natural language input, step-by-step AI problem solving, and more!
                </p>
              </div>
            </div>
        </div>
      </ScrollArea>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground mb-3">
          These features are in development. While direct in-app purchases are not yet available, you can support ongoing development through Ko-fi. Future updates aim to include direct upgrade paths.
        </p>
        <Button
            onClick={() => {
                window.open("https://ko-fi.com/s/22472af748", "_blank");
                logEvent('click_premium_support_kofi');
                onClose();
            }}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            size="lg"
        >
          <Coffee className="mr-2 h-5 w-5" /> Support Development (via Ko-fi)
        </Button>
      </div>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

// Add Coffee icon if not already globally available for this component
const Coffee: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
);


export default PremiumFeaturesDialog;

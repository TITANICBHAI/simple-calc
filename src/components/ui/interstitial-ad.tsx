"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onProceed: () => void;
}

export default function InterstitialAd({ isOpen, onClose, featureName, onProceed }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanSkip(true);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen) {
      // Load AdSense ad
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.log('AdSense not loaded');
      }
    }
  }, [isOpen]);

  const handleProceed = () => {
    onProceed();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Accessing {featureName}
            </DialogTitle>
            {canSkip && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Loading advanced mathematical features...
            </p>
            {!canSkip && (
              <p className="text-xs mt-2">
                Please wait {countdown} seconds
              </p>
            )}
          </div>

          {/* AdSense Ad Container */}
          <div className="ad-container bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-1074051846339488"
              data-ad-slot="1234567890" // You'll get this from AdSense dashboard
              data-ad-format="rectangle"
              data-full-width-responsive="true"
            />
          </div>

          <div className="flex gap-2">
            {canSkip && (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleProceed} className="flex-1">
                  Continue to {featureName}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
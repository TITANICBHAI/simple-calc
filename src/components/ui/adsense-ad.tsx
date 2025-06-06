"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdSenseAdProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'square';
  className?: string;
  adStyle?: React.CSSProperties;
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseAd({ 
  adSlot = "0123456789", 
  adFormat = "auto", 
  className,
  adStyle,
  fullWidthResponsive = true 
}: AdSenseAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense loading...');
    }
  }, []);

  const getAdStyles = () => {
    const baseStyles: React.CSSProperties = {
      display: 'block',
      minHeight: '100px',
      ...adStyle
    };

    switch (adFormat) {
      case 'rectangle':
        return { ...baseStyles, width: '300px', height: '250px' };
      case 'horizontal':
        return { ...baseStyles, width: '728px', height: '90px' };
      case 'vertical':
        return { ...baseStyles, width: '160px', height: '600px' };
      case 'square':
        return { ...baseStyles, width: '250px', height: '250px' };
      default:
        return baseStyles;
    }
  };

  return (
    <div className={cn("text-center my-4", className)}>
      <ins
        className="adsbygoogle"
        style={getAdStyles()}
        data-ad-client="ca-pub-1074051846339488"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}

// Specialized ad components for different placements
export function HeaderAd({ className }: { className?: string }) {
  return (
    <AdSenseAd
      adFormat="horizontal"
      className={cn("mb-4", className)}
      adStyle={{ margin: '0 auto' }}
    />
  );
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <AdSenseAd
      adFormat="vertical"
      className={cn("my-4", className)}
    />
  );
}

export function ContentAd({ className }: { className?: string }) {
  return (
    <AdSenseAd
      adFormat="rectangle"
      className={cn("my-6", className)}
      adStyle={{ margin: '0 auto' }}
    />
  );
}

export function FooterAd({ className }: { className?: string }) {
  return (
    <AdSenseAd
      adFormat="horizontal"
      className={cn("mt-4", className)}
      adStyle={{ margin: '0 auto' }}
    />
  );
}

export default AdSenseAd;
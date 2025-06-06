"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseAd({ 
  adSlot, 
  adFormat = "auto", 
  adStyle = { display: 'block' },
  className = "",
  responsive = true 
}: AdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className={`adsense-container ${className}`} style={{ minHeight: '280px', display: 'block' }}>
        <div style={{ 
          display: 'block', 
          textAlign: 'center', 
          minHeight: '280px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          minHeight: '280px',
          ...adStyle
        }}
        data-ad-client="ca-pub-1074051846339488"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
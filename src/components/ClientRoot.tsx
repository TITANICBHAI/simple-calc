"use client";
import ClientProviders from '@/components/client-providers';
import React, { useState, useEffect } from 'react';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('onboarded')) {
      setShowOnboarding(true);
      localStorage.setItem('onboarded', '1');
    }
  }, []);

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">👋 Welcome to Calculator Hub!</h2>
            <p className="mb-4">Explore our professional mathematical tools including scientific calculations, function visualization, and AI-powered problem solving. Everything you need for advanced mathematics!</p>
            <button className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={() => setShowOnboarding(false)}>Let's Go!</button>
          </div>
        </div>
      )}
      <ClientProviders>
        {children}
      </ClientProviders>
    </>
  );
}
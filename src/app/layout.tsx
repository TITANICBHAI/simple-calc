import type { Metadata } from 'next';
import './globals.css';
import ClientRoot from '@/components/ClientRoot';
import { KofiButton } from '@/components/ui/kofi-button';

export const metadata: Metadata = {
  title: 'Calculator Hub - Professional Mathematical Tools & Calculators',
  description: 'Professional calculator suite with scientific computation, function visualization, statistical analysis, financial planning, and AI-powered mathematical problem solving. Perfect for students, professionals, and researchers.',
  keywords: 'calculator, math, scientific calculator, graphing calculator, statistics, financial calculator, unit converter, percentage calculator, mathematical tools, free calculator online',
  // SEO meta tags
  openGraph: {
    title: 'MathHub - Free Online Calculator & Mathematical Tools',
    description: 'Free comprehensive mathematical toolkit with scientific calculator, graphing tools, statistics, financial calculators, and AI-powered problem solving.',
    url: 'https://simple-calc-kappa.vercel.app/',
    siteName: 'MathHub',
    locale: 'en_US',
    type: 'website',
  },
  metadataBase: new URL('https://simple-calc-kappa.vercel.app/'),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Google Search Console verification - you'll get this code when you add your property
  verification: {
    google: 'p_nM5UQGi4P-XxZWzkNBNK0htFxIVIZKhVT6H9Q4WJY'
    yandex: 'cd714801fdf5014d'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SEO meta tags */}
        <meta name="description" content="Free online calculator with advanced mathematical tools. Scientific calculator, graphing, statistics, financial calculators, unit converter, and AI-powered math solver." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-1074051846339488" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1074051846339488"
          crossOrigin="anonymous"
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="antialiased font-sans bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col">
        <ClientRoot>
          {children}
          {/* Global Ko-fi floating button on all pages */}
          <KofiButton variant="floating" />
        </ClientRoot>
        {/* Footer with friendly message and quick links */}
        <footer className="w-full text-center text-blue-600 py-4 bg-white/80 backdrop-blur border-t border-blue-100 mt-auto text-sm flex flex-col gap-2 animate-fade-in-up">
          <div>Simple Calc &mdash; Made for everyone who loves numbers.</div>
          <div className="flex justify-center gap-4 text-blue-500 text-xs">
            <a href="/privacy-policy.html" className="hover:underline">Privacy Policy</a>
            <a href="/terms.html" className="hover:underline">Terms</a>
            <a href="mailto:support@simplecalc.com" className="hover:underline">Contact</a>
          </div>
        </footer>

      </body>
    </html>
  );
}

import { Card } from '@/components/ui/card';
import { Calculator, FileText, Scale, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export const metadata = {
  title: 'Terms of Service - MathHub',
  description: 'MathHub terms of service - Legal terms and conditions for using our mathematical tools and calculators.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <header className="w-full border-b-2 border-gray-300 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">MathHub</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Scale className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-700">Legal terms and conditions for using MathHub</p>
          <p className="text-sm text-gray-600 mt-2">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>By accessing and using MathHub, you accept and agree to be bound by the terms and provision of this agreement.</p>
              <p>If you do not agree to abide by the above, please do not use this service.</p>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <Calculator className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Use of Service</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>MathHub provides free mathematical tools and calculators for educational and professional use. You may:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use all calculators and mathematical tools for personal, educational, or commercial purposes</li>
                <li>Access our services from any compatible device or browser</li>
                <li>Share results and calculations from our tools</li>
                <li>Use our tools in educational settings and professional environments</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Prohibited Uses</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>You may not use MathHub to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Attempt to reverse engineer, decompile, or hack our services</li>
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Transmit viruses or any malicious code</li>
                <li>Interfere with or disrupt our services or servers</li>
                <li>Create automated systems to access our services excessively</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Disclaimer</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>While we strive for accuracy, MathHub mathematical tools are provided "as is" without warranty of any kind. We do not guarantee:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>100% accuracy of all calculations (though we aim for it)</li>
                <li>Uninterrupted access to our services</li>
                <li>That our services will meet your specific requirements</li>
                <li>That our services will be error-free</li>
              </ul>
              <p className="mt-4 font-semibold">Always verify critical calculations using multiple sources.</p>
            </div>
          </Card>

          <Card className="p-8 border-2 border-red-200 bg-red-50">
            <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ MAXIMUM LIMITATION OF LIABILITY</h2>
            <div className="space-y-4 text-red-700">
              <p><strong>ZERO LIABILITY:</strong> MathHub and its operators shall have ZERO LIABILITY for ANY damages whatsoever, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Financial losses or investment decisions based on our calculators</li>
                <li>Academic failures or incorrect homework/exam answers</li>
                <li>Business losses or professional mistakes</li>
                <li>Medical, engineering, or safety-critical calculation errors</li>
                <li>Tax preparation errors or legal compliance issues</li>
                <li>Data loss, system downtime, or technical failures</li>
                <li>ANY direct, indirect, incidental, special, consequential, or punitive damages</li>
              </ul>
              <p><strong>COMPLETE DISCLAIMER:</strong> You acknowledge that you use our mathematical tools entirely at your own risk and discretion.</p>
              <p><strong>NO GUARANTEES:</strong> We make NO guarantees about accuracy, availability, or fitness for any purpose.</p>
              <p><strong>MAXIMUM LIABILITY LIMIT:</strong> Our total liability to you for ANY reason shall never exceed $0.00 (zero dollars).</p>
            </div>
          </Card>

          <div className="max-w-4xl mx-auto my-8 text-center">
            <AdSenseAd 
              adSlot="4567890123"
              adFormat="auto"
              className="mb-8"
              adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
            />
          </div>

          <Card className="p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.</p>
              <p>Continued use of MathHub after changes constitutes acceptance of the new terms.</p>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="text-gray-700">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <p className="mt-4">
                <strong>Email:</strong> legal@mathhub.com<br />
                <strong>Website:</strong> <Link href="/" className="text-blue-600 hover:underline">MathHub.com</Link>
              </p>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            ← Back to MathHub
          </Link>
        </div>
      </div>
    </div>
  );
}
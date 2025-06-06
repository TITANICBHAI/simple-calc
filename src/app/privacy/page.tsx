import { Card } from '@/components/ui/card';
import { Calculator, Shield, Eye, Lock, Users } from 'lucide-react';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export const metadata = {
  title: 'Privacy Policy - MathHub',
  description: 'MathHub privacy policy - How we protect your data and respect your privacy while using our mathematical tools.',
};

export default function PrivacyPolicy() {
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
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-700">How we protect your data and respect your privacy</p>
          <p className="text-sm text-gray-600 mt-2">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>MathHub is designed to protect your privacy. We collect minimal information to provide our mathematical tools:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our calculators</li>
                <li><strong>Technical Data:</strong> Basic technical information like browser type and device information</li>
                <li><strong>Calculations:</strong> Your calculations are processed locally and not stored on our servers</li>
                <li><strong>Cookies:</strong> We use essential cookies for website functionality and analytics</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How We Protect Your Data</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Local Processing:</strong> Most calculations happen in your browser, not on our servers</li>
                <li><strong>No Personal Data Storage:</strong> We don't store your mathematical calculations or personal information</li>
                <li><strong>Secure Connections:</strong> All data transmission uses HTTPS encryption</li>
                <li><strong>Third-party Services:</strong> We use Google AdSense for advertising, which may use cookies for ad personalization</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>MathHub uses the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Google AdSense:</strong> For displaying relevant advertisements. Google may use cookies to personalize ads.</li>
                <li><strong>Analytics:</strong> We may use analytics services to understand how our tools are used.</li>
                <li><strong>CDN Services:</strong> For faster loading of mathematical libraries and resources.</li>
              </ul>
              <p className="mt-4">These services have their own privacy policies that govern their data collection practices.</p>
            </div>
          </Card>

          <Card className="p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access information about data we collect</li>
                <li>Request deletion of any personal data we may have</li>
                <li>Opt-out of non-essential cookies and tracking</li>
                <li>Contact us with any privacy concerns</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 border-2 border-red-200 bg-red-50">
            <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ COMPREHENSIVE LIABILITY DISCLAIMER</h2>
            <div className="text-red-700 space-y-3">
              <p><strong>ABSOLUTE NO LIABILITY:</strong> MathHub and its operators are NOT responsible for ANY damages, losses, errors, inaccuracies, or consequences of any kind resulting from the use of our calculators and tools.</p>
              <p><strong>NO WARRANTIES:</strong> We provide ALL tools "AS IS" without any warranties, express or implied, including but not limited to warranties of accuracy, completeness, reliability, or fitness for any purpose.</p>
              <p><strong>USER RESPONSIBILITY:</strong> You use our tools entirely at your own risk and responsibility. You must verify all calculations independently before making any decisions.</p>
              <p><strong>NO PROFESSIONAL ADVICE:</strong> Our tools do not constitute professional, financial, medical, legal, academic, or technical advice of any kind.</p>
              <p><strong>LIMITATION OF LIABILITY:</strong> In no event shall MathHub be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to financial losses, academic consequences, or business impacts.</p>
              <p><strong>INDEMNIFICATION:</strong> By using our services, you agree to indemnify and hold harmless MathHub from any claims, damages, or expenses arising from your use of our tools.</p>
            </div>
          </Card>

          <div className="max-w-4xl mx-auto my-8 text-center">
            <AdSenseAd 
              adSlot="3456789012"
              adFormat="auto"
              className="mb-8"
              adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
            />
          </div>

          <Card className="p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-700">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <p className="mt-4">
                <strong>Email:</strong> privacy@mathhub.com<br />
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
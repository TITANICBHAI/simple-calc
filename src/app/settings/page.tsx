"use client";

import React, { useState } from 'react';
import { Settings, Palette, Brain, Coffee, Info, Sliders, Monitor, Smartphone, Volume2, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartHeader } from '@/components/smart-header';
import { ContentAd, SidebarAd } from '@/components/ui/adsense-ad';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState([16]);
  const [animations, setAnimations] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [calculatorMode, setCalculatorMode] = useState("standard");
  const [colorScheme, setColorScheme] = useState("blue");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SmartHeader 
        title="Customization Center" 
        subtitle="Personalize your Calculator Hub experience"
        showBackButton={true}
        showAIBadge={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Theme Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose between light, dark, or system theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Color Scheme</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select your preferred accent color
                    </p>
                  </div>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue (Default)</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Font Size</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust text size for better readability
                    </p>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Small</span>
                      <span>{fontSize[0]}px</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Animations</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and effects
                    </p>
                  </div>
                  <Switch checked={animations} onCheckedChange={setAnimations} />
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Assistant
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Smart AI-powered features and error correction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Primary AI</h4>
                    <p className="text-xs text-muted-foreground">Groq (Llama3)</p>
                    <Badge variant="outline" className="mt-1 text-xs">Online</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Backup AI</h4>
                    <p className="text-xs text-muted-foreground">Google Gemini</p>
                    <Badge variant="outline" className="mt-1 text-xs">Standby</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Fallback AI</h4>
                    <p className="text-xs text-muted-foreground">Hugging Face</p>
                    <Badge variant="outline" className="mt-1 text-xs">Ready</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Smart Features</h4>
                    <p className="text-xs text-muted-foreground">Error correction, suggestions</p>
                    <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 text-blue-800">
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Calculator Preferences
                </CardTitle>
                <CardDescription>
                  Customize your calculation experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Default Calculator Mode</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred starting calculator
                    </p>
                  </div>
                  <Select value={calculatorMode} onValueChange={setCalculatorMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select calculator mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Calculator</SelectItem>
                      <SelectItem value="scientific">Scientific Calculator</SelectItem>
                      <SelectItem value="graphing">Function Visualizer</SelectItem>
                      <SelectItem value="financial">Financial Calculator</SelectItem>
                      <SelectItem value="statistical">Statistical Engine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sound Effects</h3>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for button clicks and operations
                    </p>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Smart Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Get alerts for calculation updates and tips
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </CardContent>
            </Card>

            {/* Ad Content */}
            <ContentAd />

            {/* Support Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Support Development
                </CardTitle>
                <CardDescription>
                  Help keep Calculator Hub free and continuously improving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-pink-50 to-purple-50">
                  <Coffee className="h-12 w-12 mx-auto mb-4 text-pink-600" />
                  <h3 className="font-semibold text-lg mb-2">Love Calculator Hub?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your support helps us maintain servers, improve AI features, and keep the platform free for everyone.
                  </p>
                  <KofiButton className="w-full max-w-xs mx-auto" />
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About Calculator Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Version:</strong> 2.0 (AI Enhanced)
                  </p>
                  <p>
                    <strong>Features:</strong> Smart AI error correction, multi-provider fallback system, 
                    advanced mathematical tools, and comprehensive calculation suite.
                  </p>
                  <p>
                    <strong>AI Providers:</strong> Groq (Primary), Google Gemini (Backup), Hugging Face (Fallback)
                  </p>
                  <p className="text-muted-foreground">
                    Built with Next.js, TypeScript, and powered by multiple AI providers for maximum reliability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SidebarAd />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>AI Validations</span>
                  <Badge variant="outline">∞</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Calculations</span>
                  <Badge variant="outline">Unlimited</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Smart Suggestions</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold mb-2">Enjoying MathHub?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Consider supporting our development
                </p>
                <KofiButton variant="floating" className="relative static transform-none animate-none" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
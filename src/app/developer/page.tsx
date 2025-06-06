"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code, Hash, Binary, Palette, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { KofiButton } from '@/components/ui/kofi-button';
import AdSenseAd from '@/components/AdSenseAd';

export default function DeveloperToolsPage() {
  // Base Converter State
  const [numberInput, setNumberInput] = useState('255');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('16');

  // Hash Generator State
  const [textToHash, setTextToHash] = useState('Hello World');

  // URL Encoder State
  const [urlText, setUrlText] = useState('Hello World & Friends');

  // Color Converter State
  const [colorInput, setColorInput] = useState('#FF5733');

  // Base Converter Logic
  const convertBase = useMemo(() => {
    try {
      const decimal = parseInt(numberInput, parseInt(fromBase));
      if (isNaN(decimal)) return 'Invalid input';
      
      const converted = decimal.toString(parseInt(toBase));
      return converted.toUpperCase();
    } catch {
      return 'Invalid conversion';
    }
  }, [numberInput, fromBase, toBase]);

  // Hash Generator Logic
  const generateHashes = useMemo(() => {
    const text = textToHash;
    
    // Simple hash functions (for demo purposes)
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    };

    const djb2Hash = (str: string) => {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
      }
      return Math.abs(hash).toString(16);
    };

    return {
      simple: simpleHash(text),
      djb2: djb2Hash(text),
      length: text.length
    };
  }, [textToHash]);

  // URL Encoder Logic
  const urlOperations = useMemo(() => {
    const encoded = encodeURIComponent(urlText);
    const decoded = decodeURIComponent(urlText);
    
    return {
      encoded,
      decoded: decoded !== urlText ? decoded : 'Already decoded',
      length: urlText.length,
      encodedLength: encoded.length
    };
  }, [urlText]);

  // Color Converter Logic
  const convertColor = useMemo(() => {
    try {
      let hex = colorInput.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsl = rgbToHsl(r, g, b);
      
      return {
        hex: '#' + hex.toUpperCase(),
        rgb,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        values: { r, g, b, ...hsl }
      };
    } catch {
      return {
        hex: 'Invalid',
        rgb: 'Invalid',
        hsl: 'Invalid',
        values: { r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 }
      };
    }
  }, [colorInput]);

  // RGB to HSL conversion
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Floating Ko-fi Button */}
      <KofiButton variant="floating" />
      
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to MathHub
              </Link>
            </Button>
            <Code className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Developer Tools</h1>
          </div>
          <KofiButton size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="base" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="base">Base Converter</TabsTrigger>
            <TabsTrigger value="hash">Hash Generator</TabsTrigger>
            <TabsTrigger value="url">URL Encoder</TabsTrigger>
            <TabsTrigger value="color">Color Converter</TabsTrigger>
          </TabsList>

          {/* Base Converter */}
          <TabsContent value="base" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Binary className="h-5 w-5" />
                    Number Base Converter
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Convert numbers between different bases (2-36)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="number">Number to Convert</Label>
                    <Input
                      id="number"
                      value={numberInput}
                      onChange={(e) => setNumberInput(e.target.value)}
                      placeholder="255"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from">From Base</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={fromBase}
                        onChange={(e) => setFromBase(e.target.value)}
                      >
                        <option value="2">Binary (2)</option>
                        <option value="8">Octal (8)</option>
                        <option value="10">Decimal (10)</option>
                        <option value="16">Hexadecimal (16)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="to">To Base</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={toBase}
                        onChange={(e) => setToBase(e.target.value)}
                      >
                        <option value="2">Binary (2)</option>
                        <option value="8">Octal (8)</option>
                        <option value="10">Decimal (10)</option>
                        <option value="16">Hexadecimal (16)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setNumberInput('255')}>255</Button>
                    <Button variant="outline" size="sm" onClick={() => setNumberInput('1010')}>1010</Button>
                    <Button variant="outline" size="sm" onClick={() => setNumberInput('FF')}>FF</Button>
                    <Button variant="outline" size="sm" onClick={() => setNumberInput('777')}>777</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Result</p>
                      <p className="text-3xl font-bold text-indigo-600 font-mono">{convertBase}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">Input:</span> {numberInput} (base {fromBase})
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">Output:</span> {convertBase} (base {toBase})
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hash Generator */}
          <TabsContent value="hash" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Hash Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate hash values for text input
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="text">Text to Hash</Label>
                    <Textarea
                      id="text"
                      value={textToHash}
                      onChange={(e) => setTextToHash(e.target.value)}
                      placeholder="Enter text to generate hash"
                      className="min-h-32"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTextToHash('Hello World')}>Hello World</Button>
                    <Button variant="outline" size="sm" onClick={() => setTextToHash('Test123')}>Test123</Button>
                    <Button variant="outline" size="sm" onClick={() => setTextToHash('MathHub')}>MathHub</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hash Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Simple Hash</p>
                      <p className="text-lg font-mono text-blue-600 break-all">{generateHashes.simple}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">DJB2 Hash</p>
                      <p className="text-lg font-mono text-green-600 break-all">{generateHashes.djb2}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">Input Length:</span> {generateHashes.length} characters
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* URL Encoder */}
          <TabsContent value="url" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    URL Encoder/Decoder
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Encode or decode URL components
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="url">Text to Encode/Decode</Label>
                    <Textarea
                      id="url"
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      placeholder="Enter text or URL to encode/decode"
                      className="min-h-32"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setUrlText('Hello World & Friends')}>Sample Text</Button>
                    <Button variant="outline" size="sm" onClick={() => setUrlText('user@example.com')}>Email</Button>
                    <Button variant="outline" size="sm" onClick={() => setUrlText('100% success!')}>Special Chars</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Encoding Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">URL Encoded</p>
                      <p className="text-sm font-mono text-green-600 break-all">{urlOperations.encoded}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">URL Decoded</p>
                      <p className="text-sm font-mono text-blue-600 break-all">{urlOperations.decoded}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">Original:</span> {urlOperations.length} chars
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">Encoded:</span> {urlOperations.encodedLength} chars
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Color Converter */}
          <TabsContent value="color" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Color Converter
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Convert colors between HEX, RGB, and HSL formats
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="color">Color (HEX format)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        placeholder="#FF5733"
                        className="flex-1"
                      />
                      <div 
                        className="w-12 h-10 rounded border-2 border-gray-300"
                        style={{ backgroundColor: colorInput }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setColorInput('#FF5733')}>Orange</Button>
                    <Button variant="outline" size="sm" onClick={() => setColorInput('#3498DB')}>Blue</Button>
                    <Button variant="outline" size="sm" onClick={() => setColorInput('#2ECC71')}>Green</Button>
                    <Button variant="outline" size="sm" onClick={() => setColorInput('#E74C3C')}>Red</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Color Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="w-full h-16 rounded-lg border-2 border-gray-300 mb-4"
                      style={{ backgroundColor: colorInput }}
                    ></div>
                    
                    <div className="space-y-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">HEX</p>
                        <p className="text-lg font-mono text-red-600">{convertColor.hex}</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">RGB</p>
                        <p className="text-lg font-mono text-green-600">{convertColor.rgb}</p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">HSL</p>
                        <p className="text-lg font-mono text-blue-600">{convertColor.hsl}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
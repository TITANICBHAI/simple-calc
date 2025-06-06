"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, User, Palette, Save, RefreshCw, 
  Download, Upload, Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function UserCustomizationHub() {
  const [theme, setTheme] = useState('system');
  const [precision, setPrecision] = useState([10]);
  const [autoSave, setAutoSave] = useState(true);
  const [shortcuts, setShortcuts] = useState(true);

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your customization preferences have been saved.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            <CardTitle>User Customization Hub</CardTitle>
            <Badge variant="outline">Settings</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="calculation">Calculation</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="export">Export/Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme Preference</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Enable Animations</Label>
                  <Switch id="animations" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sounds">Sound Effects</Label>
                  <Switch id="sounds" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calculation" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Decimal Precision: {precision[0]} digits</Label>
                  <Slider
                    value={precision}
                    onValueChange={setPrecision}
                    min={2}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosave">Auto-save History</Label>
                  <Switch 
                    id="autosave" 
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="scientific">Scientific Notation</Label>
                  <Switch id="scientific" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shortcuts" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard">Keyboard Shortcuts</Label>
                  <Switch 
                    id="keyboard" 
                    checked={shortcuts}
                    onCheckedChange={setShortcuts}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Custom Shortcuts</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Calculate Expression</span>
                      <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Enter</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Clear Input</span>
                      <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+L</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Open History</span>
                      <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+H</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Export Calculations</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Import Settings</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Configuration
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup">Auto-backup to Cloud</Label>
                  <Switch id="backup" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
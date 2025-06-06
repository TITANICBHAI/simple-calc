"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Code2, Sigma, Braces, Replace, Link as LinkIcon, BinaryIcon, Calculator, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NumericalBaseConverter from './numerical-base-converter';
import RegexTester from './regex-tester';
import ByteCalculator from './byte-calculator';
import LogicGateSimulator from './logic-gate-simulator';
import UrlEncoderDecoder from './url-encoder-decoder';
import MatrixSolver from './matrix-solver';
import TimestampConverter from './timestamp-converter';
import JsonFormatterViewer from './json-formatter-viewer'; // New Import

const CodeToolsHub: React.FC = () => {
  return (
    <Card className="w-full shadow-lg relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center text-xl">
          <Code2 className="mr-2 h-6 w-6 text-accent" />
          Code Tools Hub (P)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="base-converter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 mb-4"> {/* Adjusted grid-cols */}
            <TabsTrigger value="base-converter" className="flex items-center gap-1 text-xs sm:text-sm">
              <Sigma className="h-4 w-4" /> Base Conv.
            </TabsTrigger>
            <TabsTrigger value="regex-tester" className="flex items-center gap-1 text-xs sm:text-sm">
                <Replace className="h-4 w-4" /> Regex Test
            </TabsTrigger>
            <TabsTrigger value="byte-logic" className="flex items-center gap-1 text-xs sm:text-sm">
                 <BinaryIcon className="h-4 w-4"/> Byte/Logic
            </TabsTrigger>
            <TabsTrigger value="url-tools" className="flex items-center gap-1 text-xs sm:text-sm">
                 <LinkIcon className="h-4 w-4"/> URL Tools
            </TabsTrigger>
            <TabsTrigger value="matrix-solver" className="flex items-center gap-1 text-xs sm:text-sm">
                 <Calculator className="h-4 w-4"/> Matrix
            </TabsTrigger>
            <TabsTrigger value="timestamp-converter" className="flex items-center gap-1 text-xs sm:text-sm">
                 <Calendar className="h-4 w-4"/> Timestamp
            </TabsTrigger>
            <TabsTrigger value="json-tools" className="flex items-center gap-1 text-xs sm:text-sm"> {/* New Tab Trigger */}
                 <Braces className="h-4 w-4"/> JSON Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="base-converter">
            <NumericalBaseConverter />
          </TabsContent>

          <TabsContent value="regex-tester">
            <RegexTester />
          </TabsContent>

          <TabsContent value="byte-logic" className="space-y-6">
            <ByteCalculator />
            <LogicGateSimulator />
          </TabsContent>

          <TabsContent value="url-tools">
            <UrlEncoderDecoder />
          </TabsContent>

          <TabsContent value="matrix-solver">
            <MatrixSolver />
          </TabsContent>

          <TabsContent value="timestamp-converter">
            <TimestampConverter />
          </TabsContent>

          <TabsContent value="json-tools"> {/* New Tab Content */}
            <JsonFormatterViewer />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};
export default CodeToolsHub;

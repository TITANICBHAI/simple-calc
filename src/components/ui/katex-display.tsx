"use client";

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

export interface KatexDisplayProps {
  math?: string;
  latexString?: string;
  displayMode?: boolean;
  className?: string;
}

export const KatexDisplay: React.FC<KatexDisplayProps> = ({
  math,
  latexString,
  displayMode = true,
  className
}) => {
  const latex = math || latexString || '';

  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust: true,
      strict: false
    });

    return (
      <div
        className={cn("katex-display", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.error('KaTeX error:', error);
    return (
      <div className={cn("text-destructive font-mono text-sm", className)}>
        Error rendering LaTeX: {latex}
      </div>
    );
  }
};

export default KatexDisplay;

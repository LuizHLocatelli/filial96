
import React from 'react';

interface PDFPageCounterProps {
  numPages: number;
}

export function PDFPageCounter({ numPages }: PDFPageCounterProps) {
  if (numPages === 0) return null;

  return (
    <div className="mb-4 text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-2">
      📄 {numPages} página{numPages !== 1 ? 's' : ''}
    </div>
  );
}

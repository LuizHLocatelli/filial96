import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { pdfjsLib } from './pdf-worker';

interface PDFPageViewProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  pdf: pdfjsLib.PDFDocumentProxy;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PDFPageView({
  pageNumber,
  scale,
  rotation,
  pdf,
  className,
  isSelected,
  onClick,
}: PDFPageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<{ promise: Promise<void>; cancel: () => void } | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current || !pdf) return;

      setIsLoading(true);
      setError(null);

      // Cancel any pending render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({
          scale: scale,
          rotation: rotation,
        });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          setError('Could not get canvas context');
          return;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'max-w-full h-auto';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;

        setIsLoading(false);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error(`Error rendering page ${pageNumber}:`, err);
          setError(err.message || 'Error rendering page');
        }
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, pageNumber, scale, rotation]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mx-auto mb-4 shadow-lg rounded border bg-white',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={onClick}
      style={{ maxWidth: '100%' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

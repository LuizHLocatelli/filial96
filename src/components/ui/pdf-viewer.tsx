
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';
import { PDFRenderer } from './pdf-viewer/PDFRenderer';
import { usePDFState } from './pdf-viewer/usePDFState';
import { useIsMobile } from "@/hooks/use-mobile";

interface PDFViewerProps {
  url?: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const rendererContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  
  const {
    status,
    error,
    numPages,
    loadAttempts,
    libraryLoaded,
    handleSuccess,
    handleError,
    handleRetry
  } = usePDFState(url);

  const openPdfInNewWindow = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Show library loading
  if (!libraryLoaded && status !== 'error') {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Carregando biblioteca PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <PDFLoadingState 
          loadAttempts={loadAttempts} 
          onOpenExternal={openPdfInNewWindow}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <PDFErrorState 
          error={error}
          url={url || ''}
          onOpenExternal={openPdfInNewWindow}
        />
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <PDFEmptyState onOpenExternal={openPdfInNewWindow} />
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
      {status === 'success' && !isMobile && numPages > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 p-2 border-b bg-background shadow-sm sticky top-0 z-10">
          <PDFPageCounter numPages={numPages} />
        </div>
      )}
      
      <div 
        ref={rendererContainerRef} 
        className="flex-1 overflow-auto overflow-x-hidden bg-muted/40 dark:bg-gray-900 p-0 sm:p-4 flex flex-col items-center justify-center"
      />
      
      {url && libraryLoaded && (
        <PDFRenderer
          url={url}
          containerRef={rendererContainerRef}
          onSuccess={handleSuccess}
          onError={handleError}
          loadAttempts={loadAttempts}
        />
      )}
    </div>
  );
}

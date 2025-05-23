
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { configurePDFWorker } from './pdf-viewer/PDFWorkerConfig';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFRenderer } from './pdf-viewer/PDFRenderer';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';

// Configure PDF.js worker on component load
configurePDFWorker();

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  
  const openPdfInNewWindow = () => {
    window.open(url, '_blank');
  };

  const handlePDFSuccess = (pages: number) => {
    setNumPages(pages);
    setLoading(false);
    setError(null);
  };

  const handlePDFError = (errorMessage: string) => {
    if (loadAttempts < 2) {
      console.log(`Tentativa ${loadAttempts + 1} falhou, tentando novamente...`);
      setLoadAttempts(prev => prev + 1);
      
      if (pdfBytes && loadAttempts === 0) {
        setPdfBytes(null);
      }
      
      setTimeout(() => {
        setError(null);
        setLoading(true);
      }, 1000);
      return;
    }
    
    setError(errorMessage);
    setLoading(false);
  };

  useEffect(() => {
    if (url) {
      console.log('URL do PDF mudou, iniciando carregamento:', url);
      setLoadAttempts(0);
      setPdfBytes(null);
      setLoading(true);
      setError(null);
      setNumPages(0);
    }
  }, [url]);

  if (loading) {
    return (
      <PDFLoadingState 
        className={className}
        loadAttempts={loadAttempts}
        onOpenExternal={openPdfInNewWindow}
      />
    );
  }

  if (error) {
    return (
      <PDFErrorState 
        className={className}
        error={error}
        url={url}
        onOpenExternal={openPdfInNewWindow}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <PDFPageCounter numPages={numPages} />
      
      <PDFRenderer
        pdfData={pdfBytes}
        url={url}
        onSuccess={handlePDFSuccess}
        onError={handlePDFError}
      />
      
      {!loading && numPages === 0 && !error && (
        <PDFEmptyState onOpenExternal={openPdfInNewWindow} />
      )}
    </div>
  );
}

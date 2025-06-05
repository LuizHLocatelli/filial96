import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { configurePDFWorker } from './pdf-viewer/PDFWorkerConfig';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFRenderer } from './pdf-viewer/PDFRenderer';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';
import { useIsMobile } from "@/hooks/use-mobile";

// Configure PDF.js worker on component load
configurePDFWorker();

interface PDFViewerProps {
  url: string | null | undefined;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'empty' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const prevUrlRef = useRef<string | null | undefined>(undefined);
  const rendererContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const openPdfInNewWindow = () => {
    if (url) window.open(url, '_blank');
  };

  const handlePDFSuccess = (pages: number) => {
    console.log("PDFViewer: PDF carregado com sucesso. Páginas:", pages);
    setNumPages(pages);
    setStatus(pages > 0 ? 'success' : 'empty');
    setErrorMessage(null);
  };

  const handlePDFError = (errMessage: string) => {
    console.log(`PDFViewer: Erro ao carregar PDF. Tentativa atual (0-indexed): ${loadAttempts}, Mensagem: ${errMessage}`);
    if (loadAttempts < 2) {
      setLoadAttempts(prev => prev + 1);
      setStatus('loading');
    } else {
      setErrorMessage(errMessage);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (url && url !== prevUrlRef.current) {
      console.log('PDFViewer Effect: Nova URL detectada ou mudança de URL. URL:', url);
      prevUrlRef.current = url;
      setLoadAttempts(0);
      setStatus('loading');
      setErrorMessage(null);
      setNumPages(0);
    }
    else if (!url && prevUrlRef.current) {
      console.log('PDFViewer Effect: URL tornou-se nula/undefined, anteriormente era:', prevUrlRef.current);
      prevUrlRef.current = url;
      setStatus('error');
      setErrorMessage('URL do PDF não fornecida ou inválida.');
      setLoadAttempts(0);
      setNumPages(0);
    }
    else if (!url && prevUrlRef.current === undefined && status === 'idle') {
        console.log('PDFViewer Effect: Montado inicialmente sem URL válida.');
        prevUrlRef.current = url;
        setStatus('error');
        setErrorMessage('URL do PDF não fornecida.');
    }
  }, [url, status]);

  if (status === 'idle' || (status === 'loading' && !url)) {
    if (!url && prevUrlRef.current === undefined) {
        return <PDFErrorState className={className} error={"URL do PDF não fornecida."} url="" onOpenExternal={openPdfInNewWindow} />;
    }
    return <PDFLoadingState className={className} loadAttempts={loadAttempts} onOpenExternal={openPdfInNewWindow} />;
  }

  if (status === 'loading' && url) {
    return (
      <div className={cn("w-full h-full relative", className)}>
        <PDFLoadingState 
          className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm"
          loadAttempts={loadAttempts} 
          onOpenExternal={openPdfInNewWindow} 
        />
        <div style={{ opacity: 0, position: 'absolute', zIndex: -1, width: 0, height: 0, overflow: 'hidden'}}>
            <PDFRenderer
            url={url}
            containerRef={rendererContainerRef}
            onSuccess={handlePDFSuccess}
            onError={handlePDFError}
            loadAttempts={loadAttempts}
            />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <PDFErrorState className={className} error={errorMessage!} url={url || ""} onOpenExternal={openPdfInNewWindow} />;
  }

  if (!url && (status === 'success' || status === 'empty')) {
      console.error("PDFViewer: Estado inválido - sucesso/vazio sem URL.");
      return <PDFErrorState className={className} error={"Erro interno: URL ausente em estado de sucesso/vazio."} url="" onOpenExternal={openPdfInNewWindow} />;
  }

  return (
    <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
      {status === 'success' && !isMobile && numPages > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 p-2 border-b bg-background shadow-sm sticky top-0 z-10">
          <PDFPageCounter numPages={numPages} />
        </div>
      )}
      
      <div ref={rendererContainerRef} className="flex-1 overflow-auto overflow-x-hidden bg-muted/40 dark:bg-gray-900 p-0 sm:p-4 flex items-center justify-center">
        {status === 'success' && url && (
          <PDFRenderer
            url={url}
            containerRef={rendererContainerRef}
            onSuccess={() => { /* Primary onSuccess handled by hidden renderer; this one might log or do nothing */ }}
            onError={handlePDFError}
            loadAttempts={loadAttempts}
          />
        )}
        {status === 'empty' && <PDFEmptyState onOpenExternal={openPdfInNewWindow} />}
      </div>
    </div>
  );
}

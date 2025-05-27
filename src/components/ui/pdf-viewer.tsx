import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { configurePDFWorker } from './pdf-viewer/PDFWorkerConfig';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFRenderer } from './pdf-viewer/PDFRenderer';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCcw, Expand, Shrink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Configure PDF.js worker on component load
configurePDFWorker();

interface PDFViewerProps {
  url: string | null | undefined;
  className?: string;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'empty' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const prevUrlRef = useRef<string | null | undefined>(undefined);
  const [scale, setScale] = useState(1.0);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width');
  const rendererContainerRef = useRef<HTMLDivElement>(null);
  const lastContainerDimsRef = useRef({ width: 0, height: 0 });
  const isMobile = useIsMobile();

  const handleScaleChangeFromRenderer = useCallback((newScaleFromRenderer: number) => {
    console.log('[PDFViewer] handleScaleChangeFromRenderer - received newScaleFromRenderer:', newScaleFromRenderer);
    setFitMode('custom'); 
    setScale(prevScale => {
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScaleFromRenderer));
      console.log('[PDFViewer] handleScaleChangeFromRenderer - prevScale:', prevScale, 'clampedScale set:', clampedScale);
      return clampedScale;
    });
  }, [setFitMode, setScale]);

  // Função para controle de escala via botões (recolocada)
  const handleSetScale = useCallback((newScale: number | ((prevScale: number) => number)) => {
    setFitMode('custom');
    setScale(prevScale => {
      const resolvedScale = typeof newScale === 'function' ? newScale(prevScale) : newScale;
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, resolvedScale));
    });
  }, []);

  // Funções de zoom para os botões (recolocadas)
  const zoomIn = () => handleSetScale(prev => prev + SCALE_STEP);
  const zoomOut = () => handleSetScale(prev => prev - SCALE_STEP);
  const resetZoom = () => {
    setFitMode('width'); 
    // A escala será resetada para 1.0 no useEffect que observa fitMode
  };
  const fitToPage = () => setFitMode('page');
  const fitToWidth = () => setFitMode('width');

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
      if (fitMode !== 'custom') {
        setScale(1.0);
      }
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
  }, [url, status, fitMode]);

  useEffect(() => {
    if (status === 'success' && url && (fitMode === 'width' || fitMode === 'page')) {
        console.log(`[PDFViewer] useEffect (fitMode) - FitMode mudou para ${fitMode}. Resetando scale para 1.0`);
        setScale(1.0);
    }
  }, [fitMode, status, url]);

  useLayoutEffect(() => {
    const container = rendererContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      if (fitMode !== 'custom' && 
          (Math.abs(width - lastContainerDimsRef.current.width) > 1 || Math.abs(height - lastContainerDimsRef.current.height) > 1)) {
        lastContainerDimsRef.current = { width, height };
        if (status === 'success') {
            setScale(1.0); 
        }
      }
    });

    observer.observe(container);
    return () => observer.unobserve(container);
  }, [status, fitMode]);

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
            scale={1.0}
            fitMode={'custom'}
            containerRef={rendererContainerRef}
            onSuccess={handlePDFSuccess}
            onError={handlePDFError}
            loadAttempts={loadAttempts}
            onScaleChange={handleScaleChangeFromRenderer}
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
      {status === 'success' && !isMobile && (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 p-2 border-b bg-background shadow-sm sticky top-0 z-10">
          <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= MIN_SCALE} title="Diminuir Zoom">
            <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= MAX_SCALE} title="Aumentar Zoom">
            <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <span className="text-xs sm:text-sm w-12 sm:w-16 text-center tabular-nums">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={resetZoom} title="Restaurar Zoom (Ajustar à Largura)">
            <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
           <Button variant="outline" size="icon" onClick={fitToWidth} title="Ajustar à Largura" className={cn("p-2", fitMode === 'width' && status === 'success' ? 'bg-accent text-accent-foreground' : '')}>
            <Shrink className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={fitToPage} title="Ajustar à Página" className={cn("p-2", fitMode === 'page' && status === 'success' ? 'bg-accent text-accent-foreground' : '')}>
            <Expand className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          {numPages > 0 && <PDFPageCounter numPages={numPages} />}
        </div>
      )}
      
      <div ref={rendererContainerRef} className="flex-1 overflow-auto overflow-x-hidden bg-muted/40 dark:bg-gray-900 p-0 sm:p-4 flex items-center justify-center">
        {status === 'success' && url && (
          <PDFRenderer
            url={url}
            scale={scale}
            fitMode={fitMode}
            containerRef={rendererContainerRef}
            onSuccess={() => { /* Primary onSuccess handled by hidden renderer; this one might log or do nothing */ }}
            onError={handlePDFError}
            loadAttempts={loadAttempts}
            onScaleChange={handleScaleChangeFromRenderer}
          />
        )}
        {status === 'empty' && <PDFEmptyState onOpenExternal={openPdfInNewWindow} />}
      </div>
    </div>
  );
}

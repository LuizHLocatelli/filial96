import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLibraryLoader } from '@/hooks/useLazyComponent';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load da biblioteca PDF.js
const loadPDFLibrary = () => ExternalLibraryLoader.loadLibrary(
  'pdfjs-dist',
  () => import('pdfjs-dist')
);

// Configuração do worker será feita sob demanda
let isWorkerConfigured = false;

const configurePDFWorkerLazy = async () => {
  if (isWorkerConfigured) return;
  
  const pdfjsLib = await loadPDFLibrary();
  
  try {
    const pdfjsVersion = pdfjsLib.version || '3.11.174';
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('[PDF.js] Worker configurado:', workerSrc);
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar worker:', error);
  }
};

interface PDFViewerProps {
  url?: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'empty'>('idle');
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);
  const [libraryLoaded, setLibraryLoaded] = useState<boolean>(false);
  const isMounted = useRef(true);
  const rendererContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Preload da biblioteca quando o componente monta
  useEffect(() => {
    const preloadLibrary = async () => {
      try {
        await loadPDFLibrary();
        await configurePDFWorkerLazy();
        if (isMounted.current) {
          setLibraryLoaded(true);
        }
      } catch (error) {
        console.error('[PDF.js] Erro ao precarregar biblioteca:', error);
        if (isMounted.current) {
          setError('Erro ao carregar biblioteca PDF');
          setStatus('error');
        }
      }
    };

    preloadLibrary();
  }, []);

  // Efeito principal para carregar PDF
  useEffect(() => {
    if (!libraryLoaded || !url || !isMounted.current) {
      if (!url) {
        setStatus('empty');
      }
      return;
    }

    const loadPDF = async () => {
      setStatus('loading');
      setError('');
      
      try {
        const pdfjsLib = await loadPDFLibrary();
        await configurePDFWorkerLazy();
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        if (!isMounted.current) return;
        
        const loadingTask = pdfjsLib.getDocument({
          data,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          enableXfa: true,
          isEvalSupported: false,
          disableAutoFetch: false,
          disableStream: false,
          rangeChunkSize: 65536,
          withCredentials: false
        });

        const pdf = await Promise.race([
          loadingTask.promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 20000)
          )
        ]) as any;

        if (!isMounted.current) return;

        setNumPages(pdf.numPages);
        setStatus('success');
        
        // Renderizar todas as páginas
        await renderAllPages(pdf, pdfjsLib);
        
      } catch (error: any) {
        console.error('[PDF.js] Erro ao carregar PDF:', error);
        if (isMounted.current) {
          setError(error.message || 'Erro desconhecido ao carregar PDF');
          setStatus('error');
        }
      }
    };

    loadPDF();
  }, [url, libraryLoaded, loadAttempts]);

  const renderAllPages = async (pdf: any, pdfjsLib: any) => {
    if (!rendererContainerRef.current || !isMounted.current) return;

    const container = rendererContainerRef.current;
    container.innerHTML = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (!isMounted.current) break;

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: isMobile ? 1.2 : 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'mx-auto mb-4 shadow-lg rounded border max-w-full h-auto';
        
        container.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        
      } catch (pageError) {
        console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
      }
    }
  };

  const handleRetry = () => {
    setLoadAttempts(prev => prev + 1);
  };

  const openPdfInNewWindow = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Exibir loading da biblioteca
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
    </div>
  );
}

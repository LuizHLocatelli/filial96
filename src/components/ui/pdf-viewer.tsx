
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
    // Tentar usar um worker local primeiro, depois CDN como fallback
    const workerUrls = [
      '/pdf.worker.min.js', // Worker local
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`, // unpkg como fallback
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` // CDN original
    ];
    
    let workerConfigured = false;
    
    for (const workerUrl of workerUrls) {
      try {
        // Testar se o worker está disponível
        const response = await fetch(workerUrl, { method: 'HEAD' });
        if (response.ok) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
          console.log('[PDF.js] Worker configurado com sucesso:', workerUrl);
          workerConfigured = true;
          break;
        }
      } catch (error) {
        console.warn('[PDF.js] Worker não disponível:', workerUrl);
      }
    }
    
    if (!workerConfigured) {
      // Fallback: usar worker inline
      const workerBlob = new Blob([
        `importScripts('https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js');`
      ], { type: 'application/javascript' });
      
      const workerUrl = URL.createObjectURL(workerBlob);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log('[PDF.js] Usando worker inline como fallback');
    }
    
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar worker:', error);
    // Último fallback: desabilitar worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
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
        
        // Buscar o PDF com headers apropriados
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf,*/*',
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        if (!isMounted.current) return;
        
        const loadingTask = pdfjsLib.getDocument({
          data,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          enableXfa: true,
          verbosity: 0, // Reduzir logs
        });

        const pdf = await Promise.race([
          loadingTask.promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 30000)
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
          let errorMessage = 'Erro ao carregar PDF';
          
          if (error.message?.includes('Timeout')) {
            errorMessage = 'Timeout: PDF muito grande ou conexão lenta';
          } else if (error.message?.includes('HTTP')) {
            errorMessage = `Erro de rede: ${error.message}`;
          } else if (error.message?.includes('worker')) {
            errorMessage = 'Erro no processamento do PDF';
          } else if (error.name === 'InvalidPDFException') {
            errorMessage = 'Arquivo PDF inválido ou corrompido';
          }
          
          setError(errorMessage);
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

    const scale = isMobile ? 1.0 : 1.2;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (!isMounted.current) break;

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;
        
        // Configurar canvas com alta qualidade
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';
        
        canvas.className = 'mx-auto mb-4 shadow-lg rounded border max-w-full h-auto block';
        
        // Aplicar transformação para alta qualidade
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        
        container.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: transform
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
        <div className="p-4 text-center">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
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
        className="flex-1 overflow-auto overflow-x-hidden bg-muted/40 dark:bg-gray-900 p-2 sm:p-4 flex flex-col items-center"
      />
    </div>
  );
}

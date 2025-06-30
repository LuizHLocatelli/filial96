
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { useIsMobile } from "@/hooks/use-mobile";

interface PDFViewerProps {
  url?: string;
  className?: string;
}

interface PDFDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<any>;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [workerConfigured, setWorkerConfigured] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const isMobile = useIsMobile();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Configure PDF.js worker
  useEffect(() => {
    const configureWorker = async () => {
      if (workerConfigured) return;
      
      try {
        const pdfjsLib = await import('pdfjs-dist');
        
        // Use a reliable CDN for the worker
        const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        
        console.log('[PDF.js] Worker configurado:', workerSrc);
        
        if (isMountedRef.current) {
          setWorkerConfigured(true);
        }
      } catch (error) {
        console.error('[PDF.js] Erro ao configurar worker:', error);
        if (isMountedRef.current) {
          setError('Erro ao configurar visualizador PDF');
          setStatus('error');
        }
      }
    };

    configureWorker();
  }, [workerConfigured]);

  // Handle URL changes
  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    if (workerConfigured && url) {
      setStatus('loading');
      setError('');
      loadPDF();
    }
  }, [url, workerConfigured]);

  const loadPDF = async () => {
    if (!url || !isMountedRef.current) return;

    // Wait for the renderer to be available
    if (!rendererRef.current) {
      console.error('[PDF.js] Renderer ref not available');
      setError('Erro interno: componente não inicializado');
      setStatus('error');
      return;
    }

    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Clear previous content
      if (rendererRef.current) {
        rendererRef.current.innerHTML = '';
      }
      
      // Load PDF with timeout
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        enableXfa: true,
        disableAutoFetch: false,
        disableStream: false,
        rangeChunkSize: 65536,
        withCredentials: false
      });

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: PDF demorou muito para carregar')), 15000)
      );

      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as PDFDocument;

      if (!isMountedRef.current) return;

      setNumPages(pdf.numPages);
      setStatus('success');

      // Render all pages
      await renderAllPages(pdf, pdfjsLib);
      
    } catch (error: any) {
      console.error('[PDF.js] Erro ao carregar PDF:', error);
      if (isMountedRef.current) {
        setError(error.message || 'Erro desconhecido ao carregar PDF');
        setStatus('error');
      }
    }
  };

  const renderAllPages = async (pdf: PDFDocument, pdfjsLib: any) => {
    if (!rendererRef.current || !isMountedRef.current) return;

    const container = rendererRef.current;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (!isMountedRef.current) break;

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

  const openPdfInNewWindow = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (status === 'loading' || !workerConfigured) {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {!workerConfigured ? 'Inicializando visualizador...' : 'Carregando PDF...'}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Se o carregamento demorar muito, você pode tentar abrir o PDF externamente.
            </p>
            {url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openPdfInNewWindow}
                className="mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive mb-2">Erro ao carregar PDF</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            {url && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={openPdfInNewWindow}
                className="mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Tentar abrir externamente
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum PDF selecionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800", className)}>
      {!isMobile && numPages > 0 && (
        <div className="flex items-center justify-center p-2 border-b bg-background shadow-sm">
          <p className="text-sm text-muted-foreground">
            {numPages} {numPages === 1 ? 'página' : 'páginas'}
          </p>
        </div>
      )}
      
      <div 
        ref={rendererRef}
        className="flex-1 overflow-auto bg-muted/40 dark:bg-gray-900 p-4 flex flex-col items-center"
      />
    </div>
  );
}

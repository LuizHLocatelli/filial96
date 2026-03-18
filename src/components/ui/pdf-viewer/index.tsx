import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFToolbar } from './PDFToolbar';
import { PDFPageView } from './PDFPageView';
import { pdfjsLib } from './pdf-worker';
import { useIsMobile } from '@/hooks/use-mobile';

interface PDFViewerProps {
  url?: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const isMobile = useIsMobile();

  // Initialize scale based on device
  useEffect(() => {
    if (!isMobile) {
      setScale(1.5);
    }
  }, [isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load PDF function
  const loadPDF = useCallback(async () => {
    if (!url || !isMountedRef.current) return;

    try {
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        enableXfa: true,
        disableAutoFetch: false,
        disableStream: false,
        rangeChunkSize: 65536,
        withCredentials: false,
      });

      const pdfDoc = await loadingTask.promise;

      if (!isMountedRef.current) {
        pdfDoc.destroy();
        return;
      }

      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
      setStatus('success');
    } catch (err) {
      console.error('[PDF.js] Error loading PDF:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar PDF';
        setError(errorMessage);
        setStatus('error');
      }
    }
  }, [url]);

  // Handle URL changes
  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    setError('');
    setNumPages(0);
    setCurrentPage(1);
    setPdf(null);
    loadPDF();
  }, [url, loadPDF]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const handleFitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32; // padding
      // Estimate page width at scale 1
      const baseWidth = 595; // A4 width in points at scale 1
      const newScale = containerWidth / baseWidth;
      setScale(Math.max(0.5, Math.min(newScale, 5)));
    }
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(() => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documento.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [url]);

  const handlePrint = useCallback(() => {
    if (url) {
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }, [url]);

  const handleSearch = useCallback(() => {
    // TODO: Implement text search functionality
    console.log('Search not implemented yet');
  }, []);

  if (status === 'loading') {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800',
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800',
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive mb-2">
                Erro ao carregar PDF
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            {url && (
              <Button variant="default" size="sm" onClick={handleDownload}>
                Baixar arquivo
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800',
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum PDF selecionado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col bg-gray-100 dark:bg-gray-800',
        className
      )}
    >
      <PDFToolbar
        numPages={numPages}
        currentPage={currentPage}
        scale={scale}
        isLoading={false}
        onPageChange={handlePageChange}
        onScaleChange={handleScaleChange}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSearch={handleSearch}
        onRotate={handleRotate}
        onFitToWidth={handleFitToWidth}
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/40 dark:bg-gray-900 p-4 flex flex-col items-center"
      >
        {pdf && (
          <div className="flex flex-col items-center w-full max-w-full">
            <PDFPageView
              key={`page-${currentPage}-${scale}-${rotation}`}
              pageNumber={currentPage}
              scale={scale}
              rotation={rotation}
              pdf={pdf}
              isSelected={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

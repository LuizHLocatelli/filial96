
import React, { useRef, useEffect, RefObject } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface PDFRendererProps {
  url: string;
  containerRef: RefObject<HTMLDivElement>;
  onSuccess: (numPages: number) => void;
  onError: (error: string) => void;
  loadAttempts: number;
}

export function PDFRenderer({ 
  url, 
  containerRef,
  onSuccess, 
  onError, 
  loadAttempts
}: PDFRendererProps) {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url || !isMounted.current) return;
    renderPDF();
  }, [url, loadAttempts]);

  const renderPDF = async () => {
    if (!containerRef.current || !isMounted.current) return;

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const { configurePDFWorkerLazy } = await import('./PDFWorkerConfig');
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

      onSuccess(pdf.numPages);
      await renderAllPages(pdf, pdfjsLib);
      
    } catch (error: any) {
      console.error('[PDF.js] Erro ao carregar PDF:', error);
      if (isMounted.current) {
        onError(error.message || 'Erro desconhecido ao carregar PDF');
      }
    }
  };

  const renderAllPages = async (pdf: any, pdfjsLib: any) => {
    if (!containerRef.current || !isMounted.current) return;

    const container = containerRef.current;
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

  return null; // This component doesn't render anything directly
}

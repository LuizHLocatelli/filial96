import React, { useRef, useEffect, RefObject, useLayoutEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFRendererProps {
  url: string;
  containerRef: RefObject<HTMLDivElement>;
  onSuccess: (numPages: number) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
  loadAttempts: number;
}

export function PDFRenderer({ 
  url, 
  containerRef,
  onSuccess, 
  onError, 
  onProgress, 
  loadAttempts
}: PDFRendererProps) {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const lastContainerWidthRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('[PDFRenderer] useEffect - url:', !!url);

    if (url) {
        renderPDF(); 
    } else {
        if (pageContainerRef.current) pageContainerRef.current.innerHTML = '';
    }

    return () => {
        isMountedRef.current = false;
    };
  }, [url, loadAttempts]);

  // Observer para redimensionamento do container
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width } = entry.contentRect;

      // Re-renderizar apenas se a largura mudou significativamente (mais de 10px)
      if (Math.abs(width - lastContainerWidthRef.current) > 10 && url && isMountedRef.current) {
        lastContainerWidthRef.current = width;
        console.log('[PDFRenderer] Container resized, re-rendering PDF');
        renderPDF();
      }
    });

    observer.observe(container);
    return () => observer.unobserve(container);
  }, [url]);

  const fetchPdfBytes = async (pdfUrl: string): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(pdfUrl, { method: 'GET', mode: 'cors', cache: 'no-cache', headers: { 'Accept': 'application/pdf,*/*' } });
      if (!response.ok) throw new Error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (err) {
      console.error('PDFRenderer: Erro ao baixar PDF como bytes:', err);
      return null;
    }
  };

  const renderPDF = async () => {
    if (!isMountedRef.current || !url) return;
    console.log('[PDFRenderer] renderPDF START');

    let pdf: pdfjsLib.PDFDocumentProxy | null = null;
    try {
      const data = await fetchPdfBytes(url);
      if (!isMountedRef.current || !data) {
        if (data === null && isMountedRef.current) throw new Error('Falha ao baixar PDF (dados nulos retornados após fetch bem-sucedido aparentemente)');
        return;
      }
      
      const pdfjsVersion = pdfjsLib.version;
      const loadingTask = pdfjsLib.getDocument({ data, cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/cmaps/`, cMapPacked: true, enableXfa: true, isEvalSupported: false, disableAutoFetch: false, disableStream: false, rangeChunkSize: 65536, withCredentials: false });
      
      if ('onProgress' in loadingTask && onProgress) {
        loadingTask.onProgress = (progressData: any) => {
          if (progressData && progressData.total > 0) {
            const percentage = Math.round(progressData.loaded / progressData.total * 100);
            if (onProgress) onProgress(percentage);
          }
        };
      }

      pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 20000))
      ]) as pdfjsLib.PDFDocumentProxy;
      
      if (!isMountedRef.current) return;
      onSuccess(pdf.numPages);    
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.error('PDFRenderer: Erro ao carregar DOCUMENTO PDF:', err);
      let errMsg = 'Não foi possível carregar o PDF.';
      if (err.name === 'InvalidPDFException') errMsg = 'O arquivo não é um PDF válido.';
      else if (err.name === 'MissingPDFException') errMsg = 'Arquivo PDF não encontrado.';
      else if (err.name === 'UnexpectedResponseException') errMsg = 'Erro de rede ao carregar o PDF.';
      else if (err.message?.includes('CORS')) errMsg = 'Erro de permissão (CORS) ao acessar o PDF.';
      else if (err.message?.includes('worker')) errMsg = 'Erro ao carregar o worker do PDF.js.';
      else if (err.message?.includes('Timeout')) errMsg = 'O carregamento do PDF demorou muito tempo.';
      else if (err.message?.includes('fetch')) errMsg = 'Erro ao baixar o arquivo PDF.';
      onError(`${errMsg} (${err.message || 'Erro desconhecido'})`);
      return;
    }

    if (!pdf) return;
    if (!pageContainerRef.current) {
      return;
    }

    pageContainerRef.current.innerHTML = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (!isMountedRef.current || !pageContainerRef.current) break;
      try {
        const page = await pdf.getPage(pageNum);
        if (!isMountedRef.current) break;

        const { current: renderOutputContainer } = containerRef;
        const { current: actualPageCanvasContainer } = pageContainerRef;

        if (!actualPageCanvasContainer) break; 

        let newScale = 1.0;
        const viewport = page.getViewport({ scale: 1 });

        // Ajustar à largura do container com margem para responsividade
        if (renderOutputContainer) {
          const containerWidth = renderOutputContainer.clientWidth;
          const paddingWidth = 32; // 16px de cada lado para margem

          if (containerWidth > paddingWidth) {
            newScale = (containerWidth - paddingWidth) / viewport.width;
          }
        }
        
        newScale = Math.max(0.1, Math.min(newScale, 5.0));

        const scaledViewport = page.getViewport({ scale: newScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) { console.error(`Ctx 2D falhou p/ pág ${pageNum}`); continue; }
        
        const outputScale = window.devicePixelRatio || 1;

        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.style.width = Math.floor(scaledViewport.width) + "px";
        canvas.style.height = Math.floor(scaledViewport.height) + "px";

        canvas.className = 'border border-border rounded-lg shadow-sm h-auto block bg-white mx-auto';
        actualPageCanvasContainer.appendChild(canvas);
        
        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        await page.render({ 
          canvasContext: context, 
          viewport: scaledViewport, 
          background: 'white', 
          intent: 'display',
          transform: transform
        }).promise;
        if (!isMountedRef.current) break;
      } catch (pageError) {
        if (!isMountedRef.current) break;
        console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
      }
    }

    console.log('[PDFRenderer] renderPDF END');
  };

  return (
    <div 
      ref={pageContainerRef}
      className="w-full h-full flex flex-col items-center space-y-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
    >
    </div>
  );
}

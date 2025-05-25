import React, { useRef, useEffect, RefObject, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFRendererProps {
  url: string;
  scale: number;
  fitMode: 'width' | 'page' | 'custom';
  containerRef: RefObject<HTMLDivElement>;
  onSuccess: (numPages: number) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
  loadAttempts: number;
}

export function PDFRenderer({ 
  url, 
  scale: userScale,
  fitMode,
  containerRef,
  onSuccess, 
  onError, 
  onProgress, 
  loadAttempts 
}: PDFRendererProps) {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    isMountedRef.current = true;
    if (url) {
        renderPDF();
    } else {
        if (pageContainerRef.current) pageContainerRef.current.innerHTML = '';
        setPanOffset({x:0, y:0});
    }
    return () => {
        isMountedRef.current = false;
    };
  }, [url, loadAttempts, userScale, fitMode]);

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

    if (fitMode !== 'custom') setPanOffset({ x: 0, y: 0 });
    pageContainerRef.current.innerHTML = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (!isMountedRef.current || !pageContainerRef.current) break;
      try {
        const page = await pdf.getPage(pageNum);
        if (!isMountedRef.current) break;

        const { current: renderOutputContainer } = containerRef;
        const { current: actualPageCanvasContainer } = pageContainerRef;

        if (!actualPageCanvasContainer) break; 

        let newScale = userScale;
        const viewport = page.getViewport({ scale: 1 });

        if (renderOutputContainer) {
          const containerWidth = renderOutputContainer.clientWidth;
          const containerHeight = renderOutputContainer.clientHeight;

          if (fitMode !== 'custom' && (containerWidth === 0 || containerHeight === 0) ) {
          } else if (fitMode === 'width' && containerWidth > 0) {
            newScale = containerWidth / viewport.width;
          } else if (fitMode === 'page' && containerWidth > 0 && containerHeight > 0) {
            const scaleWidth = containerWidth / viewport.width;
            const scaleHeight = containerHeight / viewport.height;
            newScale = Math.min(scaleWidth, scaleHeight);
          }
        } else if (fitMode !== 'custom') {
        }
        
        newScale = Math.max(0.1, Math.min(newScale, 5.0));

        const scaledViewport = page.getViewport({ scale: newScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) { console.error(`Ctx 2D falhou p/ pág ${pageNum}`); continue; }
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-none h-auto block mx-auto bg-white';
        actualPageCanvasContainer.appendChild(canvas);
        
        await page.render({ canvasContext: context, viewport: scaledViewport, background: 'white', intent: 'display' }).promise;
        if (!isMountedRef.current) break;
      } catch (pageError) {
        if (!isMountedRef.current) break;
        console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPanPosition({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    let targetElement = e.target as HTMLElement;
    if (targetElement.tagName === 'CANVAS') targetElement = targetElement.parentElement || targetElement;
    targetElement.style.cursor = 'grabbing';
    pageContainerRef.current?.style.setProperty('user-select', 'none');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - startPanPosition.x, y: e.clientY - startPanPosition.y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPanning(false);
    let targetElement = e.target as HTMLElement;
    if (targetElement.tagName === 'CANVAS') targetElement = targetElement.parentElement || targetElement;
    targetElement.style.cursor = 'grab';
    pageContainerRef.current?.style.removeProperty('user-select');
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false); 
      let targetElement = e.target as HTMLElement;
      if (targetElement.tagName === 'CANVAS') targetElement = targetElement.parentElement || targetElement;
      targetElement.style.cursor = 'grab';
      pageContainerRef.current?.style.removeProperty('user-select');
    }
  };

  return (
    <div 
      ref={pageContainerRef}
      className="w-full h-full flex flex-col items-center space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-grab select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave} 
      style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}
    >
    </div>
  );
}

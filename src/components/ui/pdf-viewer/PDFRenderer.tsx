import React, { useRef, useEffect, RefObject, useState, useCallback } from 'react';
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
  onScaleChange?: (newScale: number) => void;
}

export function PDFRenderer({ 
  url, 
  scale: userScale,
  fitMode,
  containerRef,
  onSuccess, 
  onError, 
  onProgress, 
  loadAttempts,
  onScaleChange
}: PDFRendererProps) {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Estados para o pinch-to-zoom
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(userScale);
  const [previewScale, setPreviewScale] = useState<number | null>(null);
  const [isFinalizingZoom, setIsFinalizingZoom] = useState(false);
  const finalizeZoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Para detecção de duplo toque
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const DOUBLE_TAP_DELAY = 300; // ms
  const DOUBLE_TAP_MAX_DISTANCE = 30; // pixels
  const DOUBLE_TAP_ZOOM_SCALE = 1.75; // Escala para aplicar no duplo toque

  // Definindo as constantes localmente para clamping do previewScale
  // Idealmente, poderiam vir como props se fossem dinâmicas no PDFViewer
  const RENDERER_MIN_SCALE = 0.25;
  const RENDERER_MAX_SCALE = 3.0;

  const getDistanceBetweenTouches = useCallback((touches: TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []); // Sem dependências, é uma função pura

  useEffect(() => {
    isMountedRef.current = true;
    console.log('[PDFRenderer] useEffect - userScale:', userScale, 'fitMode:', fitMode, 'url:', !!url);

    // Limpa qualquer timeout pendente de finalização de zoom se uma nova renderização/URL etc. começar
    if (finalizeZoomTimeoutRef.current) {
      clearTimeout(finalizeZoomTimeoutRef.current);
      finalizeZoomTimeoutRef.current = null;
    }

    if (url) {
        // Não resetamos previewScale ou a transformação aqui diretamente.
        // renderPDF cuidará da limpeza após a renderização.
        renderPDF(); 
    } else {
        if (pageContainerRef.current) pageContainerRef.current.innerHTML = '';
        setPanOffset({x:0, y:0});
        setPreviewScale(null); // Se não há URL, não há preview.
        if (pageContainerRef.current) {
            pageContainerRef.current.style.transform = `translate(0px, 0px) scale(1)`;
        }
    }
    setInitialScale(userScale); 

    return () => {
        isMountedRef.current = false;
        if (finalizeZoomTimeoutRef.current) {
          clearTimeout(finalizeZoomTimeoutRef.current);
        }
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
    console.log('[PDFRenderer] renderPDF START - userScale:', userScale, 'previewScale:', previewScale);

    // Se estivermos entrando em renderPDF e há um previewScale, 
    // significa que o usuário acabou de fazer um zoom por pinça.
    // Mantemos o container com esse previewScale visualmente enquanto renderizamos.
    if (pageContainerRef.current && previewScale !== null) {
        pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})`;
    }

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
        
        const outputScale = window.devicePixelRatio || 1;

        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.style.width = Math.floor(scaledViewport.width) + "px";
        canvas.style.height = Math.floor(scaledViewport.height) + "px";

        canvas.className = 'border border-border rounded-lg shadow-sm h-auto block bg-white';
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

    // Após todas as páginas serem renderizadas (ou tentativas de renderização):
    if (isMountedRef.current) {
      setPreviewScale(null); 
      if (pageContainerRef.current) {
        pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`;
      }
      
      // Limpa timeout anterior se houver, antes de setar um novo
      if (finalizeZoomTimeoutRef.current) {
        clearTimeout(finalizeZoomTimeoutRef.current);
      }
      // Atrasar a reativação da transição
      finalizeZoomTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) { // Verifica se o componente ainda está montado
            setIsFinalizingZoom(false); 
        }
        finalizeZoomTimeoutRef.current = null;
      }, 50); // 50ms de atraso
    }
    console.log('[PDFRenderer] renderPDF END - userScale:', userScale);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Ignorar se for um evento de toque (para não conflitar com onTouchStart)
    if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'touch') {
      return;
    }
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
    // Ignorar se for um evento de toque
    if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'touch') {
      return;
    }
    setIsPanning(false);
    let targetElement = e.target as HTMLElement;
    if (targetElement.tagName === 'CANVAS') targetElement = targetElement.parentElement || targetElement;
    targetElement.style.cursor = 'grab';
    pageContainerRef.current?.style.removeProperty('user-select');
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignorar se for um evento de toque
    if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'touch') {
      return;
    }
    if (isPanning) {
      setIsPanning(false); 
      let targetElement = e.target as HTMLElement;
      if (targetElement.tagName === 'CANVAS') targetElement = targetElement.parentElement || targetElement;
      targetElement.style.cursor = 'grab';
      pageContainerRef.current?.style.removeProperty('user-select');
    }
  };

  const handleTouchStart = useCallback((e: globalThis.TouchEvent) => {
    if (finalizeZoomTimeoutRef.current) {
        clearTimeout(finalizeZoomTimeoutRef.current);
        finalizeZoomTimeoutRef.current = null;
        setIsFinalizingZoom(false); 
    }
    if (pageContainerRef.current && previewScale !== null) {
        pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`;
    }
    setPreviewScale(null);

    if (e.touches.length === 1) {
      const currentTime = new Date().getTime();
      const currentTouch = e.touches[0];
      if (lastTapRef.current && 
          (currentTime - lastTapRef.current.time) < DOUBLE_TAP_DELAY &&
          Math.abs(currentTouch.clientX - lastTapRef.current.x) < DOUBLE_TAP_MAX_DISTANCE &&
          Math.abs(currentTouch.clientY - lastTapRef.current.y) < DOUBLE_TAP_MAX_DISTANCE) {
        console.log('[PDFRenderer] Double tap detected!');
        e.preventDefault(); 
        let newScaleTarget;
        if (Math.abs(userScale - 1.0) < 0.1) {
          newScaleTarget = DOUBLE_TAP_ZOOM_SCALE;
        } else {
          newScaleTarget = 1.0; 
        }
        console.log('[PDFRenderer] Double tap - newScaleTarget:', newScaleTarget);
        if (onScaleChange) {
          onScaleChange(newScaleTarget);
        }
        lastTapRef.current = null; 
        setIsPanning(false); 
        setIsPinching(false); 
        return; 
      }
      lastTapRef.current = { time: currentTime, x: currentTouch.clientX, y: currentTouch.clientY };
    }

    if (e.touches.length === 1 && !isPinching && !lastTapRef.current) {
      // Pan
      // Se estávamos com um previewScale de um pinch anterior que não foi finalizado, limpá-lo.
      if (previewScale !== null) {
          setPreviewScale(null);
          if (pageContainerRef.current) {
            // Reseta a transform do container para a userScale atual (que é implicitamente scale(1) para o container se previewScale for null)
            pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`;
          }
      }
      setIsPanning(true);
      setStartPanPosition({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
    } else if (e.touches.length === 2) {
      // Pinch
      e.preventDefault(); 
      setIsPanning(false); // Garante que o pan para se o segundo dedo descer
      setIsPinching(true);
      lastTapRef.current = null; 
      setInitialPinchDistance(getDistanceBetweenTouches(e.touches)); 
      setInitialScale(userScale); 
      setPreviewScale(userScale); // REINSERIDO: Inicia o preview CSS com a userScale atual.
      console.log('[PDFRenderer] Pinch Start - initialScale/previewScale:', userScale, 'initialPinchDistance:', getDistanceBetweenTouches(e.touches));
    } else if (e.touches.length === 0 && lastTapRef.current) { 
        // Se todos os dedos subiram mas tínhamos um lastTap (potencial primeiro toque de um duplo)
        // e não virou pan/pinch, resetar lastTap para que o próximo toque único não seja duplo toque.
        // No entanto, handleTouchEnd já lida com isPinching/isPanning. O lastTap para duplo toque é mais sobre o *próximo* touchStart.
        // Esta condição pode não ser necessária aqui se a lógica de duplo toque estiver robusta.
    }
  }, [userScale, panOffset.x, panOffset.y, onScaleChange, getDistanceBetweenTouches, DOUBLE_TAP_DELAY, DOUBLE_TAP_MAX_DISTANCE, DOUBLE_TAP_ZOOM_SCALE, initialScale, isPinching, previewScale]); // Adicionado previewScale de volta às dependências

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (e.touches.length === 1 && lastTapRef.current) {
        const currentTouch = e.touches[0];
        if (Math.abs(currentTouch.clientX - lastTapRef.current.x) > DOUBLE_TAP_MAX_DISTANCE ||
            Math.abs(currentTouch.clientY - lastTapRef.current.y) > DOUBLE_TAP_MAX_DISTANCE) {
            lastTapRef.current = null; 
        }
    }

    if (isPanning && e.touches.length === 1) {
      e.preventDefault(); 
      const newX = e.touches[0].clientX - startPanPosition.x;
      const newY = e.touches[0].clientY - startPanPosition.y;
      setPanOffset({ x: newX, y: newY });
      if (pageContainerRef.current) {
        const currentPreviewScale = previewScale !== null ? previewScale : 1;
        pageContainerRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${currentPreviewScale})`;
      }
    } else if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistanceBetweenTouches(e.touches);
      if (initialPinchDistance > 0) {
        let newCalculatedPreviewScale = initialScale * (currentDistance / initialPinchDistance);
        newCalculatedPreviewScale = Math.max(RENDERER_MIN_SCALE, Math.min(RENDERER_MAX_SCALE, newCalculatedPreviewScale));
        console.log('[PDFRenderer] handleTouchMove - PINCH newCalculatedPreviewScale:', newCalculatedPreviewScale);
        setPreviewScale(newCalculatedPreviewScale);
        if (pageContainerRef.current) {
          pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${newCalculatedPreviewScale})`;
        }
      }
    }
  }, [isPanning, isPinching, startPanPosition, panOffset.x, panOffset.y, previewScale, initialScale, initialPinchDistance, getDistanceBetweenTouches, DOUBLE_TAP_MAX_DISTANCE, RENDERER_MIN_SCALE, RENDERER_MAX_SCALE]);

  const handleTouchEnd = useCallback((e: globalThis.TouchEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isPinching) {
      setIsPinching(false);
      setIsFinalizingZoom(true); 
      setInitialPinchDistance(0);
      if (onScaleChange && previewScale !== null) {
        console.log('[PDFRenderer] handleTouchEnd - PINCH sending to onScaleChange:', previewScale);
        onScaleChange(previewScale); 
        const newInitial = Math.max(RENDERER_MIN_SCALE, Math.min(RENDERER_MAX_SCALE, previewScale));
        setInitialScale(newInitial);
      } else if (previewScale === null && onScaleChange) {
        if(isPinching) { 
            console.log('[PDFRenderer] handleTouchEnd - PINCH end no move, sending userScale:', userScale);
            onScaleChange(userScale);
        }
      }
    }
  }, [isPanning, isPinching, onScaleChange, previewScale, userScale, RENDERER_MIN_SCALE, RENDERER_MAX_SCALE]); 
  
  useEffect(() => {
    const el = pageContainerRef.current;
    if (!el) return;
    console.log('[PDFRenderer] Adding touch event listeners');
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true }); 
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true }); 

    return () => {
      console.log('[PDFRenderer] Removing touch event listeners');
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]); 

  return (
    <div 
      ref={pageContainerRef}
      className="w-full h-full flex flex-col items-center space-y-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave} 
      style={{
        transformOrigin: 'top left',
        transform: previewScale !== null 
            ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})` 
            : `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`,
        transition: isPanning || isPinching || isFinalizingZoom ? 'none' : 'transform 0.1s ease-out' 
      }}
    >
    </div>
  );
}

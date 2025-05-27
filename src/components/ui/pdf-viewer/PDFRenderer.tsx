import React, { useRef, useEffect, RefObject, useState, TouchEvent } from 'react';
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
  const scaleUpdateFrameRef = useRef<number | null>(null); // Ref para o requestAnimationFrame
  const [previewScale, setPreviewScale] = useState<number | null>(null); // Estado para a escala de preview do CSS
  const [isFinalizingZoom, setIsFinalizingZoom] = useState(false); // Novo estado

  // Definindo as constantes localmente para clamping do previewScale
  // Idealmente, poderiam vir como props se fossem dinâmicas no PDFViewer
  const RENDERER_MIN_SCALE = 0.25;
  const RENDERER_MAX_SCALE = 3.0;

  useEffect(() => {
    isMountedRef.current = true;
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
        if (scaleUpdateFrameRef.current) {
            cancelAnimationFrame(scaleUpdateFrameRef.current);
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
      setPreviewScale(null); // Limpa o estado de preview scale.
      if (pageContainerRef.current) {
        // A transformação agora deve ser apenas o pan, pois os canvases estão na escala correta.
        pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`;
        // Força um reflow/repaint, pode ajudar em alguns casos, mas use com cautela.
        // void pageContainerRef.current.offsetWidth;
      }
      setIsFinalizingZoom(false); // Reabilita transição após tudo pronto
    }
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

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (scaleUpdateFrameRef.current) {
        cancelAnimationFrame(scaleUpdateFrameRef.current);
        scaleUpdateFrameRef.current = null;
    }
    // Garante que não há preview scale residual ao iniciar novo toque
    if (pageContainerRef.current && previewScale !== null) {
        pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`;
    }
    setPreviewScale(null);

    if (e.touches.length === 1) {
      // Pan
      setIsPanning(true);
      setStartPanPosition({ 
        x: e.touches[0].clientX - panOffset.x, 
        y: e.touches[0].clientY - panOffset.y 
      });
      // Estilo para cursor de "agarrando" pode ser adicionado aqui se necessário para toque
    } else if (e.touches.length === 2) {
      // Pinch
      e.preventDefault(); // Prevenir zoom padrão do navegador
      setIsPinching(true);
      setInitialPinchDistance(getDistanceBetweenTouches(e.touches));
      // initialScale já deve estar sincronizado com userScale pelo useEffect ou pelo final do último pinch
      // setInitialScale(userScale); // Não é mais necessário aqui se o useEffect e o touchEnd cuidarem disso
      // Define o previewScale inicial igual à escala atual para evitar pulos
      setPreviewScale(userScale);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 1) {
      const newX = e.touches[0].clientX - startPanPosition.x;
      const newY = e.touches[0].clientY - startPanPosition.y;
      setPanOffset({ x: newX, y: newY });
      if (pageContainerRef.current) {
        const currentPreviewScale = previewScale !== null ? previewScale : 1; // Usa previewScale se estiver em pinch, senão 1
        pageContainerRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${currentPreviewScale})`;
      }
    } else if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistanceBetweenTouches(e.touches);
      if (initialPinchDistance > 0) {
        let newCalculatedPreviewScale = initialScale * (currentDistance / initialPinchDistance);
        // Aplicar clamping ao previewScale
        newCalculatedPreviewScale = Math.max(RENDERER_MIN_SCALE, Math.min(RENDERER_MAX_SCALE, newCalculatedPreviewScale));
        
        setPreviewScale(newCalculatedPreviewScale);

        if (pageContainerRef.current) {
          pageContainerRef.current.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${newCalculatedPreviewScale})`;
        }
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isPinching) {
      setIsPinching(false);
      setIsFinalizingZoom(true); // Desabilita transição para o "assentamento"
      setInitialPinchDistance(0);
      if (onScaleChange && previewScale !== null) {
        onScaleChange(previewScale); 
      }
    }
  };

  const getDistanceBetweenTouches = (touches: React.TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  return (
    <div 
      ref={pageContainerRef}
      className="w-full h-full flex flex-col items-center space-y-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transformOrigin: 'center',
        // A transformação aqui é gerenciada mais ativamente agora.
        // O useEffect e o renderPDF irão definir a transformação inicial/final.
        // handleTouchMove irá definir a transformação durante os gestos.
        // Se previewScale não for null, ele domina a escala.
        transform: previewScale !== null 
            ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewScale})` 
            : `translate(${panOffset.x}px, ${panOffset.y}px) scale(1)`,
        transition: isPanning || isPinching || isFinalizingZoom ? 'none' : 'transform 0.1s ease-out' // Modificada condição
      }}
    >
    </div>
  );
}

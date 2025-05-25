import React, { useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFRendererProps {
  url: string;
  onSuccess: (numPages: number) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
  loadAttempts: number;
}

export function PDFRenderer({ url, onSuccess, onError, onProgress, loadAttempts }: PDFRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false); // Rastreador de montagem

  useEffect(() => {
    isMountedRef.current = true;
    console.log(`PDFRenderer: Montado/Atualizado. URL: ${url}, Tentativa (0-indexed): ${loadAttempts}`);
    if (url) {
        renderPDF();
    } else {
        console.log("PDFRenderer: useEffect - URL ausente, não chamando renderPDF.");
    }
    return () => {
        console.log(`PDFRenderer: Desmontando. URL: ${url}`);
        isMountedRef.current = false;
    };
  }, [url, loadAttempts]);

  const fetchPdfBytes = async (pdfUrl: string): Promise<ArrayBuffer | null> => {
    try {
      console.log('PDFRenderer: Fazendo fetch direto do PDF:', pdfUrl, `Tentativa: ${loadAttempts}`);
      
      const response = await fetch(pdfUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/pdf,*/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('PDFRenderer: PDF baixado com sucesso, tamanho:', arrayBuffer.byteLength);
      return arrayBuffer;
    } catch (err) {
      console.error('PDFRenderer: Erro ao baixar PDF como bytes:', err);
      return null;
    }
  };

  const renderPDF = async () => {
    if (!isMountedRef.current) {
        console.log("PDFRenderer: renderPDF chamado mas componente não montado. Abortando.");
        return;
    }

    if (!containerRef.current || !url) {
        console.log("PDFRenderer: Container ou URL ausente, não renderizando.");
        if (!url && isMountedRef.current) onError("URL do PDF não fornecida ao renderer.");
        else if (!containerRef.current && isMountedRef.current) onError("Referência do container não está disponível no renderer.");
        return;
    }

    try {
      console.log('PDFRenderer: Iniciando carregamento do PDF:', url, `Tentativa: ${loadAttempts}`);
      
      const data = await fetchPdfBytes(url);
      if (!isMountedRef.current) return; // Verificar após await

      if (!data) {
        throw new Error('Falha ao baixar PDF (dados nulos retornados)');
      }
      
      const pdfjsVersion = pdfjsLib.version;
      const loadingTask = pdfjsLib.getDocument({ 
          data,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/cmaps/`,
          cMapPacked: true,
          enableXfa: true,
          isEvalSupported: false,
          disableAutoFetch: false,
          disableStream: false,
          rangeChunkSize: 65536,
          withCredentials: false
      });

      if ('onProgress' in loadingTask && onProgress) {
        loadingTask.onProgress = (progress: any) => {
          if (progress && progress.total > 0) {
            const percentage = Math.round(progress.loaded / progress.total * 100);
            onProgress(percentage);
          }
        };
      }
      
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 20000)
        )
      ]) as pdfjsLib.PDFDocumentProxy;
      if (!isMountedRef.current) return; // Verificar após await

      console.log('PDFRenderer: PDF carregado com sucesso. Páginas:', pdf.numPages);
      onSuccess(pdf.numPages);

      if (!isMountedRef.current || !containerRef.current) {
        console.warn("PDFRenderer: Componente desmontado ou containerRef nulo antes de limpar innerHTML.");
        return;
      }
      containerRef.current.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (!isMountedRef.current || !containerRef.current) {
            console.warn("PDFRenderer: Componente desmontado ou containerRef nulo durante renderização de páginas.");
            break;
        }
        try {
          const page = await pdf.getPage(pageNum);
          if (!isMountedRef.current) break; // Verificar após await

          console.log(`Renderizando página ${pageNum}`);
          
          const containerWidth = containerRef.current?.clientWidth || 800;
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(containerWidth / viewport.width, 2);
          const scaledViewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { alpha: false });
          
          if (!context) {
            console.error('Não foi possível criar o contexto 2D para o canvas');
            continue;
          }
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-full h-auto block mx-auto bg-white';
          
          if (!isMountedRef.current || !containerRef.current) {
            console.warn("PDFRenderer: Componente desmontado ou containerRef nulo antes de adicionar canvas à página.");
            break;
          }
          containerRef.current.appendChild(canvas);
          
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
            background: 'white',
            intent: 'display'
          };
          
          await page.render(renderContext).promise;
          if (!isMountedRef.current) break; // Verificar após await

          console.log(`Página ${pageNum} renderizada com sucesso`);
        } catch (pageError) {
          if (!isMountedRef.current) {
            console.warn("PDFRenderer: Erro ao renderizar página, mas componente desmontado.", pageError);
            break; 
          }
          console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
        }
      }
      
    } catch (err: any) {
      if (!isMountedRef.current) {
        console.warn("PDFRenderer: Erro principal capturado, mas componente desmontado.", err);
        return;
      }
      console.error('PDFRenderer: Erro ao carregar PDF (dentro do try/catch principal):', err);
      
      let errorMessage = 'Não foi possível carregar o PDF.';
      
      if (err.name === 'InvalidPDFException') {
        errorMessage = 'O arquivo não é um PDF válido.';
      } else if (err.name === 'MissingPDFException') {
        errorMessage = 'Arquivo PDF não encontrado.';
      } else if (err.name === 'UnexpectedResponseException') {
        errorMessage = 'Erro de rede ao carregar o PDF.';
      } else if (err.message?.includes('CORS')) {
        errorMessage = 'Erro de permissão (CORS) ao acessar o PDF.';
      } else if (err.message?.includes('worker')) {
        errorMessage = 'Erro ao carregar o worker do PDF.js.';
      } else if (err.message?.includes('Timeout')) {
        errorMessage = 'O carregamento do PDF demorou muito tempo.';
      } else if (err.message?.includes('fetch')) {
        errorMessage = 'Erro ao baixar o arquivo PDF.';
      }
      
      onError(`${errorMessage} (${err.message || 'Erro desconhecido'})`);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto flex flex-col items-center space-y-4 bg-gray-50 p-4 rounded-lg"
    />
  );
}

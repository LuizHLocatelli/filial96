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
    if (!containerRef.current || !url) {
        console.log("PDFRenderer: Container ou URL ausente, não renderizando.");
        if (!url) onError("URL do PDF não fornecida ao renderer.");
        return;
    }

    try {
      console.log('PDFRenderer: Iniciando carregamento do PDF:', url, `Tentativa: ${loadAttempts}`);
      
      const data = await fetchPdfBytes(url);
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

      console.log('PDF carregado com sucesso. Páginas:', pdf.numPages);
      onSuccess(pdf.numPages);

      // Clear previous content
      containerRef.current.innerHTML = '';

      // Render each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
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
          
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
          
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
            background: 'white',
            intent: 'display'
          };
          
          await page.render(renderContext).promise;
          console.log(`Página ${pageNum} renderizada com sucesso`);
        } catch (pageError) {
          console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
        }
      }
      
    } catch (err: any) {
      console.error('Erro ao carregar PDF:', err);
      
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

  useEffect(() => {
    console.log(`PDFRenderer: useEffect disparado. URL: ${url}, Tentativa (0-indexed): ${loadAttempts}`);
    if (url) {
        renderPDF();
    } else {
        console.log("PDFRenderer: useEffect - URL ausente, não chamando renderPDF.");
    }
  }, [url, loadAttempts]);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto flex flex-col items-center space-y-4 bg-gray-50 p-4 rounded-lg"
    />
  );
}

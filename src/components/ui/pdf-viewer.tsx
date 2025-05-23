
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure o worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);

  const clearCanvases = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  const renderPDF = async (pdfUrl: string) => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);
    clearCanvases();

    try {
      console.log('Carregando PDF:', pdfUrl);
      
      // Tentativa de carregamento mais robusta
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        enableXfa: true,
        isEvalSupported: false,
        disableAutoFetch: false,
        disableStream: false,
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF carregado com sucesso. Páginas:', pdf.numPages);
      
      setNumPages(pdf.numPages);

      // Renderizar cada página
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          console.log(`Renderizando página ${pageNum}`);
          
          // Calcular escala baseada na largura do container
          const containerWidth = containerRef.current?.clientWidth || 800;
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(containerWidth / viewport.width, 2.5);
          const scaledViewport = page.getViewport({ scale });
          
          // Criar canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-full h-auto block mx-auto';
          
          // Renderizar página
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          
          await page.render(renderContext).promise;
          console.log(`Página ${pageNum} renderizada`);
          
          // Adicionar ao container
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
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
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      console.log('URL do PDF mudou:', url);
      renderPDF(url);
    }
  }, [url]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8 min-h-[400px]", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Se o carregamento demorar muito, verifique se o link do PDF está correto.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8 min-h-[400px]", className)}>
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive mb-2">Erro ao carregar PDF</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2 break-all">
              URL: {url}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {numPages > 0 && (
        <div className="mb-4 text-sm text-muted-foreground text-center bg-muted/30 rounded-lg p-2">
          📄 {numPages} página{numPages !== 1 ? 's' : ''}
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto flex flex-col items-center space-y-4"
      />
    </div>
  );
}

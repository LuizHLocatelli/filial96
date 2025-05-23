
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      // Carrega o documento PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      setNumPages(pdf.numPages);

      // Renderiza cada página
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          
          // Calcula o viewport
          const viewport = page.getViewport({ scale: 1.5 });
          
          // Cria o canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Adiciona classes CSS para estilização
          canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-full h-auto';
          
          // Renderiza a página no canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          // Adiciona o canvas ao container
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
        } catch (pageError) {
          console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar PDF:', err);
      setError('Não foi possível carregar o PDF. Verifique se o arquivo é válido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      renderPDF(url);
    }
  }, [url]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Erro ao carregar PDF</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {numPages > 0 && (
        <div className="mb-4 text-sm text-muted-foreground text-center">
          {numPages} página{numPages !== 1 ? 's' : ''}
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto flex flex-col items-center"
      />
    </div>
  );
}

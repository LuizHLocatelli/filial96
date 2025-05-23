
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Configuração do worker do PDF.js - essencial para o funcionamento
const pdfjsVersion = pdfjsLib.version;
if (typeof window !== 'undefined') {
  const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  console.log('PDF.js worker configurado:', workerSrc);
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
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Função para abrir o PDF em nova janela se a renderização falhar
  const openInNewWindow = () => {
    window.open(url, '_blank');
  };

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
      console.log('Iniciando carregamento do PDF:', pdfUrl);
      
      // Configuração robusta para o carregamento do PDF
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
        cMapPacked: true,
        enableXfa: true,
        isEvalSupported: false,
        disableAutoFetch: false,
        disableStream: false,
        rangeChunkSize: 65536, // 64KB chunks
      });

      // Adicionar manipulador de progresso
      loadingTask.onProgress = (progress) => {
        console.log(`Progresso de carregamento: ${Math.round(progress.loaded / progress.total * 100)}%`);
      };
      
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 30000) // 30 segundos timeout
        )
      ]) as pdfjsLib.PDFDocumentProxy;

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
          const scale = Math.min(containerWidth / viewport.width, 2);
          const scaledViewport = page.getViewport({ scale });
          
          // Criar canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            console.error('Não foi possível criar o contexto 2D para o canvas');
            continue;
          }
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-full h-auto block mx-auto';
          
          // Adicionar ao container antes de renderizar para garantir que as dimensões sejam corretas
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
          
          // Renderizar página
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          
          await page.render(renderContext).promise;
          console.log(`Página ${pageNum} renderizada com sucesso`);
        } catch (pageError) {
          console.error(`Erro ao renderizar página ${pageNum}:`, pageError);
        }
      }
      
    } catch (err: any) {
      console.error('Erro ao carregar PDF:', err);
      
      // Se tiver tentado menos que 2 vezes, tente novamente
      if (loadAttempts < 2) {
        console.log(`Tentativa ${loadAttempts + 1} falhou, tentando novamente...`);
        setLoadAttempts(prev => prev + 1);
        setTimeout(() => renderPDF(pdfUrl), 2000); // Espera 2 segundos antes de tentar novamente
        return;
      }
      
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
      }
      
      setError(`${errorMessage} (${err.message || 'Erro desconhecido'})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      console.log('URL do PDF mudou, iniciando carregamento:', url);
      setLoadAttempts(0);
      renderPDF(url);
      
      return () => {
        // Cleanup ao desmontar componente
        clearCanvases();
      };
    }
  }, [url]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8 min-h-[400px]", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Se o carregamento demorar muito, você pode tentar abrir o PDF externamente.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openInNewWindow}
            className="mt-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em nova aba
          </Button>
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
          <Button 
            variant="default" 
            size="sm" 
            onClick={openInNewWindow}
            className="mt-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Tentar abrir externamente
          </Button>
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
      {!loading && numPages === 0 && !error && (
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">
            Nenhuma página encontrada no PDF.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openInNewWindow}
            className="mt-4"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir PDF externamente
          </Button>
        </div>
      )}
    </div>
  );
}

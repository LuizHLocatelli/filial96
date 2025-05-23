
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Configuração do worker do PDF.js - essencial para o funcionamento
const pdfjsVersion = pdfjsLib.version;
if (typeof window !== 'undefined') {
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
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
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  
  // Função para abrir o PDF em nova janela se a renderização falhar
  const openInNewWindow = () => {
    window.open(url, '_blank');
  };

  const clearCanvases = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  // Função para buscar o PDF como array de bytes primeiro
  // Isso evita problemas de CORS com o Supabase
  const fetchPdfBytes = async (pdfUrl: string): Promise<ArrayBuffer | null> => {
    try {
      console.log('Fazendo fetch direto do PDF:', pdfUrl);
      
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
      console.log('PDF baixado com sucesso, tamanho:', arrayBuffer.byteLength);
      return arrayBuffer;
    } catch (err) {
      console.error('Erro ao baixar PDF como bytes:', err);
      return null;
    }
  };

  const renderPDF = async (pdfUrl: string) => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);
    clearCanvases();

    try {
      console.log('Iniciando carregamento do PDF:', pdfUrl);
      
      // Tentar buscar o PDF como bytes primeiro
      let pdfData = pdfBytes;
      
      if (!pdfData) {
        pdfData = await fetchPdfBytes(pdfUrl);
        if (pdfData) {
          setPdfBytes(pdfData);
        }
      }
      
      // Configuração para carregar o PDF
      const loadingTask = pdfData 
        ? pdfjsLib.getDocument({ data: pdfData }) 
        : pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/cmaps/`,
            cMapPacked: true,
            enableXfa: true,
            isEvalSupported: false,
            disableAutoFetch: false,
            disableStream: false,
            rangeChunkSize: 65536, // 64KB chunks
            withCredentials: false
          });

      // Adicionar manipulador de progresso
      if ('onProgress' in loadingTask) {
        loadingTask.onProgress = (progress: any) => {
          if (progress && progress.total > 0) {
            const percentage = Math.round(progress.loaded / progress.total * 100);
            console.log(`Progresso de carregamento: ${percentage}%`);
          }
        };
      }
      
      // Usar Promise.race para ter um timeout
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar PDF')), 20000) // 20 segundos timeout
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
          const context = canvas.getContext('2d', { alpha: false });
          
          if (!context) {
            console.error('Não foi possível criar o contexto 2D para o canvas');
            continue;
          }
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          canvas.className = 'border border-border rounded-lg shadow-sm mb-4 max-w-full h-auto block mx-auto bg-white';
          
          // Adicionar ao container
          if (containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
          
          // Renderizar página
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
          // Continuar mesmo se uma página falhar
        }
      }
      
    } catch (err: any) {
      console.error('Erro ao carregar PDF:', err);
      
      // Se tiver tentado menos que 2 vezes, tente novamente com outra abordagem
      if (loadAttempts < 2) {
        console.log(`Tentativa ${loadAttempts + 1} falhou, tentando novamente com abordagem diferente...`);
        setLoadAttempts(prev => prev + 1);
        
        // Limpar os bytes anteriores na próxima tentativa
        if (pdfBytes && loadAttempts === 0) {
          setPdfBytes(null);
        }
        
        setTimeout(() => renderPDF(pdfUrl), 1000);
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
      } else if (err.message?.includes('fetch')) {
        errorMessage = 'Erro ao baixar o arquivo PDF.';
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
      setPdfBytes(null);
      renderPDF(url);
      
      return () => {
        // Cleanup ao desmontar componente
        clearCanvases();
      };
    }
  }, [url]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8 min-h-[400px] bg-muted/20 rounded-lg", className)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          {loadAttempts > 0 && (
            <p className="text-xs text-muted-foreground">
              Tentativa {loadAttempts + 1} de 3
            </p>
          )}
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
      <div className={cn("flex items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg", className)}>
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
        className="w-full overflow-x-auto flex flex-col items-center space-y-4 bg-gray-50 p-4 rounded-lg"
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

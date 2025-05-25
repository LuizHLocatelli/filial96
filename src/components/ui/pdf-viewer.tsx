import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { configurePDFWorker } from './pdf-viewer/PDFWorkerConfig';
import { PDFLoadingState } from './pdf-viewer/PDFLoadingState';
import { PDFErrorState } from './pdf-viewer/PDFErrorState';
import { PDFRenderer } from './pdf-viewer/PDFRenderer';
import { PDFPageCounter } from './pdf-viewer/PDFPageCounter';
import { PDFEmptyState } from './pdf-viewer/PDFEmptyState';

// Configure PDF.js worker on component load
configurePDFWorker();

interface PDFViewerProps {
  url: string | null | undefined; // Tornar URL opcional
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'empty' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const prevUrlRef = useRef<string | null | undefined>(undefined); // Armazena a URL processada anteriormente

  const openPdfInNewWindow = () => {
    if (url) window.open(url, '_blank');
  };

  const handlePDFSuccess = (pages: number) => {
    console.log("PDFViewer: PDF carregado com sucesso. Páginas:", pages);
    setNumPages(pages);
    setStatus(pages > 0 ? 'success' : 'empty'); // Define 'empty' se não houver páginas
    setErrorMessage(null);
  };

  const handlePDFError = (errMessage: string) => {
    console.log(`PDFViewer: Erro ao carregar PDF. Tentativa atual (0-indexed): ${loadAttempts}, Mensagem: ${errMessage}`);
    if (loadAttempts < 2) { // Permite 3 tentativas no total (0, 1, 2)
      setLoadAttempts(prev => prev + 1);
      setStatus('loading'); // Volta para o estado de carregamento para a próxima tentativa
    } else {
      setErrorMessage(errMessage);
      setStatus('error'); // Esgotou as tentativas
    }
  };

  useEffect(() => {
    // Caso 1: Nova URL válida é fornecida e é diferente da anterior
    if (url && url !== prevUrlRef.current) {
      console.log('PDFViewer Effect: Nova URL detectada ou mudança de URL. URL:', url);
      prevUrlRef.current = url;
      setLoadAttempts(0);
      setStatus('loading');
      setErrorMessage(null);
      setNumPages(0);
    } 
    // Caso 2: URL torna-se nula/undefined, mas antes tinha um valor
    else if (!url && prevUrlRef.current) {
      console.log('PDFViewer Effect: URL tornou-se nula/undefined, anteriormente era:', prevUrlRef.current);
      prevUrlRef.current = url; // Atualiza para null/undefined
      setStatus('error');
      setErrorMessage('URL do PDF não fornecida ou inválida.');
      setLoadAttempts(0);
      setNumPages(0);
    }
    // Caso 3: Componente montado inicialmente sem URL (ou URL é null/undefined desde o início)
    // e ainda não está em estado de erro por isso.
    else if (!url && prevUrlRef.current === undefined && status === 'idle') {
        console.log('PDFViewer Effect: Montado inicialmente sem URL válida.');
        prevUrlRef.current = url; // Marca como processado (null/undefined)
        setStatus('error');
        setErrorMessage('URL do PDF não fornecida.');
    }
  }, [url, status]); // Adicionar status para reavaliar se ele volta para 'idle' e !url

  // Renderização baseada no status
  if (status === 'idle') {
    // Se !url, o useEffect deve definir erro. Se url existe, useEffect deve definir loading.
    // Este estado é transitório. Mostrar loading como fallback seguro se houver URL.
    if (!url) {
        return <PDFErrorState className={className} error={errorMessage || "URL do PDF não fornecida."} url="" onOpenExternal={openPdfInNewWindow} />;
    }
    return <PDFLoadingState className={className} loadAttempts={loadAttempts} onOpenExternal={openPdfInNewWindow} />;
  }

  if (status === 'loading') {
    // Enquanto carrega, renderizamos o PDFRenderer "por baixo" para que ele possa trabalhar
    // e o PDFLoadingState como um indicador visual.
    return (
      <div className={cn("w-full relative", className)}>
        <PDFLoadingState 
          className={className} // Pode ser ajustado para ser um overlay
          loadAttempts={loadAttempts} 
          onOpenExternal={openPdfInNewWindow} 
        />
        {/* PDFRenderer é incluído mas não necessariamente visível; ele precisa executar. */}
        {/* Para garantir que funcione e não cause problemas de layout, podemos ocultá-lo se necessário, */}
        {/* mas idealmente PDFLoadingState é um overlay ou o PDFRenderer não renderiza nada até ter conteúdo. */}
        {url && ( /* Só renderiza PDFRenderer se houver URL para ele trabalhar */
            <div style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '100%', height: '100%'}}> {/* Oculto mas funcional */}
             <PDFRenderer
                url={url}
                onSuccess={handlePDFSuccess}
                onError={handlePDFError}
                loadAttempts={loadAttempts}
             />
            </div>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return <PDFErrorState className={className} error={errorMessage!} url={url || ""} onOpenExternal={openPdfInNewWindow} />;
  }

  // Status 'success' ou 'empty' implica que temos uma URL válida
  if (!url) {
      // Fallback de segurança, não deveria ser alcançado se a lógica do status for correta.
      console.error("PDFViewer: Atingiu estado de sucesso/vazio sem URL. Isso não deveria acontecer.");
      return <PDFErrorState className={className} error={"Erro interno: URL ausente após sucesso/vazio."} url="" onOpenExternal={openPdfInNewWindow} />;
  }

  return (
    <div className={cn("w-full", className)}>
      {status === 'success' && <PDFPageCounter numPages={numPages} />}
      <PDFRenderer
        url={url}
        onSuccess={handlePDFSuccess}
        onError={handlePDFError}
        loadAttempts={loadAttempts}
      />
      {status === 'empty' && <PDFEmptyState onOpenExternal={openPdfInNewWindow} />}
    </div>
  );
}

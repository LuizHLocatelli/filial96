
import { useState, useRef, useLayoutEffect } from 'react';
import { ExternalLibraryLoader } from '@/hooks/useLazyComponent';

export type PDFStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export function usePDFState(url?: string) {
  const [status, setStatus] = useState<PDFStatus>('idle');
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [loadAttempts, setLoadAttempts] = useState<number>(0);
  const [libraryLoaded, setLibraryLoaded] = useState<boolean>(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Preload library
  useLayoutEffect(() => {
    const preloadLibrary = async () => {
      try {
        await ExternalLibraryLoader.loadLibrary('pdfjs-dist', () => import('pdfjs-dist'));
        const { configurePDFWorkerLazy } = await import('./PDFWorkerConfig');
        await configurePDFWorkerLazy();
        
        if (isMounted.current) {
          setLibraryLoaded(true);
        }
      } catch (error) {
        console.error('[PDF.js] Erro ao precarregar biblioteca:', error);
        if (isMounted.current) {
          setError('Erro ao carregar biblioteca PDF');
          setStatus('error');
        }
      }
    };

    preloadLibrary();
  }, []);

  // Set status based on URL
  useLayoutEffect(() => {
    if (!url && status !== 'error') {
      setStatus('empty');
    } else if (url && libraryLoaded && status === 'idle') {
      setStatus('loading');
    }
  }, [url, libraryLoaded, status]);

  const handleSuccess = (pages: number) => {
    if (isMounted.current) {
      setNumPages(pages);
      setStatus('success');
    }
  };

  const handleError = (errorMessage: string) => {
    if (isMounted.current) {
      setError(errorMessage);
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setLoadAttempts(prev => prev + 1);
    setStatus('loading');
    setError('');
  };

  return {
    status,
    error,
    numPages,
    loadAttempts,
    libraryLoaded,
    isMounted,
    handleSuccess,
    handleError,
    handleRetry
  };
}

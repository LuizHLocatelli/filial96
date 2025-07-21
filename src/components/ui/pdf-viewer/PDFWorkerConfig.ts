
let isWorkerConfigured = false;

export const configurePDFWorkerLazy = async () => {
  if (isWorkerConfigured) return;
  
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Usar worker local em vez de CDN externo
    const workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('[PDF.js] Worker configurado:', workerSrc);
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar worker:', error);
    
    // Fallback: tentar sem worker
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      console.log('[PDF.js] Usando fallback sem worker');
      isWorkerConfigured = true;
    } catch (fallbackError) {
      console.error('[PDF.js] Fallback também falhou:', fallbackError);
      throw error;
    }
  }
};

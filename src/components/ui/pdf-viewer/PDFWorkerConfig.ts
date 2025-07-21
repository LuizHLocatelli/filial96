
let isWorkerConfigured = false;

export const configurePDFWorkerLazy = async () => {
  if (isWorkerConfigured) return;
  
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Desabilitar worker para evitar problemas de carregamento
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    console.log('[PDF.js] Worker desabilitado - funcionando sem worker');
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar PDF.js:', error);
    throw error;
  }
};

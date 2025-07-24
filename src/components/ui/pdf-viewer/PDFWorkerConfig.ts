
let isWorkerConfigured = false;

export const configurePDFWorkerLazy = async () => {
  if (isWorkerConfigured) return;
  
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Usar worker oficial do unpkg
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js`;
    
    console.log('[PDF.js] Worker configurado');
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar PDF.js:', error);
    throw error;
  }
};

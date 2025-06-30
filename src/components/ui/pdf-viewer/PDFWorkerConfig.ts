
let isWorkerConfigured = false;

export const configurePDFWorkerLazy = async () => {
  if (isWorkerConfigured) return;
  
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const pdfjsVersion = pdfjsLib.version || '3.11.174';
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('[PDF.js] Worker configurado:', workerSrc);
    isWorkerConfigured = true;
  } catch (error) {
    console.error('[PDF.js] Erro ao configurar worker:', error);
    throw error;
  }
};

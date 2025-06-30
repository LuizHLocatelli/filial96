import * as pdfjsLib from 'pdfjs-dist';

export const configurePDFWorker = () => {
  // const pdfjsVersion = pdfjsLib.version; // Não é mais necessário para a URL local
  if (typeof window !== 'undefined') {
    // Assume que o worker está na pasta public
    const workerSrc = '/pdf.worker.min.js'; 
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('PDF.js worker configurado para usar o arquivo local:', workerSrc);
  }
};

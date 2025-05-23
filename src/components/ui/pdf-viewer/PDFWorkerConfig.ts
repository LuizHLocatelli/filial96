
import * as pdfjsLib from 'pdfjs-dist';

export const configurePDFWorker = () => {
  const pdfjsVersion = pdfjsLib.version;
  if (typeof window !== 'undefined') {
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('PDF.js worker configurado:', workerSrc);
  }
};

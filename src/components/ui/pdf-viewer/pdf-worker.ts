import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize the worker using the local Vite asset URL
// This avoids CORS issues by bundling the worker locally
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjsLib };
export const getWorkerSrc = () => workerUrl;

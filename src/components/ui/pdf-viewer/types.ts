// Types for PDF viewer component
// Using standalone types instead of extending pdfjs-dist types due to version compatibility issues

export interface PDFViewerProps {
  url?: string;
  className?: string;
}

export interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  destroy: () => void;
}

export interface PDFPageProxy {
  getViewport: (options: { scale: number }) => PDFPageViewport;
  getTextContent: () => Promise<PDFTextContent>;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }) => { promise: Promise<void> };
  cleanup: () => void;
}

export interface PDFPageViewport {
  width: number;
  height: number;
  scale: number;
}

export interface PDFTextContent {
  items: Array<{
    str: string;
    transform: number[];
    width: number;
    height: number;
  }>;
}

export interface SearchResult {
  pageIndex: number;
  text: string;
  transform: number[];
}

export type ViewMode = 'single' | 'continuous';

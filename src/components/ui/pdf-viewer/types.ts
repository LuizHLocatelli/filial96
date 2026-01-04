import type * as pdfjsLib from 'pdfjs-dist';

export interface PDFViewerProps {
  url?: string;
  className?: string;
}

export interface PDFDocumentProxy extends pdfjsLib.PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

export interface PDFPageProxy extends pdfjsLib.PDFPageProxy {
  getViewport: (options: { scale: number }) => PDFPageViewport;
  getTextContent: () => Promise<PDFTextContent>;
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

import type { TFile } from 'obsidian';

export interface PDFViewerCore {
  pagesCount: number;
  currentPageNumber: number;
}

export interface PDFViewerWrapper {
  pdfLoadingTask?: { promise: Promise<any> };
  pdfViewer: PDFViewerCore | null;
}

export interface PDFViewerChild {
  file: TFile | null;
  pdfViewer: PDFViewerWrapper;
  highlightAnnotation(page: number, id: string): void;
}

export interface PDFView {
  viewer: {
    child: PDFViewerChild | null;
  };
}

export interface PDFPlus {
  lib: any;
  on(evt: string, callback: (...args: any[]) => any, context?: any): any;
}


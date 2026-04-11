import type { PDFPlus, PDFViewerChild } from './pdf-plus-shims';

export function highlightAnnotationInViewer(pdfPlus: PDFPlus, child: PDFViewerChild, page: number, id: string) {
  const pdfViewer = child.pdfViewer.pdfViewer;
  if (pdfViewer) {
    if (page >= 1 && page <= pdfViewer.pagesCount) {
      pdfViewer.currentPageNumber = page;
    }
  }

  // Laisser le temps à la couche d’annotations de se rendre
  setTimeout(() => {
    child.highlightAnnotation(page, id);
  }, 50);
}

export function scrollToPage(pdfPlus: PDFPlus, child: PDFViewerChild, page: number) {
  const pdfViewer = child.pdfViewer.pdfViewer;
  if (!pdfViewer) return;
  if (page < 1 || page > pdfViewer.pagesCount) return;
  pdfViewer.currentPageNumber = page;
}


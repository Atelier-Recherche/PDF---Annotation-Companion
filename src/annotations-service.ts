import { Notice, type RGB, type TFile, Platform } from 'obsidian';

import type { PDFPlus, PDFViewerChild } from './pdf-plus-shims';
import type { AnnotationItem } from './annotation-types';

type AnnotationCacheEntry = {
  annotations: AnnotationItem[];
  pageCount: number;
  updatedAt: number;
};

const CACHE_TTL_MS = 10_000;

export class AnnotationsService {
  private pdfPlus: PDFPlus;
  private cache = new Map<string, AnnotationCacheEntry>();

  constructor(pdfPlus: PDFPlus) {
    this.pdfPlus = pdfPlus;
  }

  clearForFile(file: TFile) {
    this.cache.delete(file.path);
  }

  clearAll() {
    this.cache.clear();
  }

  async getAnnotationsForViewer(child: PDFViewerChild): Promise<AnnotationCacheEntry | null> {
    const file = child.file;
    if (!file) return null;

    const cached = this.cache.get(file.path);
    const now = Date.now();
    if (cached && now - cached.updatedAt < CACHE_TTL_MS) {
      return cached;
    }

    const pdfViewer = child.pdfViewer;
    const pdfDoc = await pdfViewer.pdfLoadingTask?.promise;
    if (!pdfDoc) return null;

    const extractor = this.pdfPlus.lib.highlight.extract;
    const annotatedDoc = await extractor.getAnnotatedTextsInDocument(pdfDoc);

    const annotations: AnnotationItem[] = [];
    const pageCount = pdfDoc.numPages;

    for (let page = 1; page <= pageCount; page++) {
      const pageMap = annotatedDoc.get(page);
      if (!pageMap) continue;

      for (const [id, info] of pageMap.entries()) {
        annotations.push({
          id,
          page,
          color: info.rgb ? rgbToCss(info.rgb) : null,
          text: info.text,
          contents: info.comment ?? null,
          subtype: 'Highlight'
        });
      }
    }

    const entry: AnnotationCacheEntry = {
      annotations,
      pageCount,
      updatedAt: now
    };
    this.cache.set(file.path, entry);
    return entry;
  }

  getAnnotationsForPage(entry: AnnotationCacheEntry, page: number): AnnotationItem[] {
    return entry.annotations.filter((a) => a.page === page);
  }

  removeAnnotationFromCache(file: TFile, page: number, id: string) {
    const entry = this.cache.get(file.path);
    if (!entry) return;
    entry.annotations = entry.annotations.filter(
      (a) => !(a.page === page && a.id === id)
    );
    entry.updatedAt = Date.now();
  }
}

function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}


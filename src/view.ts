import { ItemView, WorkspaceLeaf, Menu, Notice } from 'obsidian';

import type PdfAnnotationCompanionPlugin from './main';
import Siderail from './ui/Siderail.svelte';
import type { AnnotationItem, AnnotationMode } from './annotation-types';
import type { PDFViewerChild } from './pdf-plus-shims';
import { highlightAnnotationInViewer } from './navigation';

export const SIDERAIL_VIEW_TYPE = 'pdf-annotation-siderail';

export class PdfAnnotationSiderailView extends ItemView {
  private plugin: PdfAnnotationCompanionPlugin;
  private component: Siderail | null = null;
  private mode: AnnotationMode = 'global';
  private currentPage = 1;
  private pageCount = 1;
  private annotations: AnnotationItem[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: PdfAnnotationCompanionPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SIDERAIL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Annotations PDF++';
  }

  getIcon(): string {
    // Icône Obsidian « highlighter », bien lisible en thème sombre.
    return 'highlighter';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('pdf-annotation-siderail-root');

    this.component = new Siderail({
      target: container,
      props: {
        annotations: this.annotations,
        mode: this.mode,
        currentPage: this.currentPage,
        pageCount: this.pageCount,
        onSelectAnnotation: (annot: AnnotationItem) => this.onSelectAnnotation(annot),
        onToggleMode: (mode: AnnotationMode) => this.onToggleMode(mode),
        onExportMarkdown: () => this.onExportMarkdown(),
        onDeleteAnnotation: (annot: AnnotationItem) => this.onDeleteAnnotation(annot),
        onSearch: (query: string) => this.onSearch(query),
        onContextMenu: (annot: AnnotationItem, evt: MouseEvent) => this.onContextMenu(annot, evt)
      }
    });

    this.refreshFromCurrentPdf();
  }

  async onClose(): Promise<void> {
    this.component?.$destroy();
    this.component = null;
  }

  private getCurrentPdfChild(): PDFViewerChild | null {
    return this.plugin.currentPdf?.child ?? null;
  }

  async refreshFromCurrentPdf() {
    const child = this.getCurrentPdfChild();
    if (!child || !this.plugin.annotations) {
      this.annotations = [];
      this.currentPage = 1;
      this.pageCount = 1;
      this.updateProps();
      return;
    }

    const entry = await this.plugin.annotations.getAnnotationsForViewer(child);
    if (!entry) {
      this.annotations = [];
      this.currentPage = 1;
      this.pageCount = 1;
      this.updateProps();
      return;
    }

    const pdfViewer = child.pdfViewer.pdfViewer;
    const currentPage = pdfViewer ? pdfViewer.currentPageNumber || 1 : 1;

    this.pageCount = entry.pageCount;
    this.currentPage = currentPage;

    if (this.mode === 'page') {
      this.annotations = this.plugin.annotations.getAnnotationsForPage(entry, currentPage);
    } else {
      this.annotations = entry.annotations;
    }

    this.updateProps();
  }

  private updateProps() {
    if (!this.component) return;
    this.component.$set({
      annotations: this.annotations,
      mode: this.mode,
      currentPage: this.currentPage,
      pageCount: this.pageCount
    });
  }

  private onSelectAnnotation(annotation: AnnotationItem) {
    const child = this.getCurrentPdfChild();
    const pdfPlus = this.plugin.pdfPlus;
    if (!child || !pdfPlus) return;

    highlightAnnotationInViewer(pdfPlus, child, annotation.page, annotation.id);
  }

  private onToggleMode(mode: AnnotationMode) {
    this.mode = mode;
    void this.refreshFromCurrentPdf();
  }

  private onExportMarkdown() {
    if (!this.annotations.length) return;

    const lines = this.annotations.map((a) => {
      const file = this.plugin.currentPdf?.file;
      const pageLink = file ? `[[${file.path}#page=${a.page}]]` : `p.${a.page}`;
      const text = a.text ? `"${a.text}"` : '""';
      const comment = a.contents ? ` – ${a.contents}` : '';
      return `- ${pageLink} ${text}${comment}`;
    });

    const markdown = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      void navigator.clipboard.writeText(markdown);
      return;
    }

    // Fallback simple : fenêtre native
    activeWindow.alert(markdown);
  }

  private onDeleteAnnotation(_annotation: AnnotationItem) {
    const ctx = this.plugin.currentPdf;
    const service = this.plugin.annotations;
    if (!ctx || !service) return;

    const { file } = ctx;
    const page = _annotation.page;
    const id = _annotation.id;

    this.plugin.pdfPlus?.lib.highlight.writeFile.deleteAnnotation(file, page, id);
    service.removeAnnotationFromCache(file, page, id);
    this.annotations = this.annotations.filter((a) => !(a.page === page && a.id === id));
    this.updateProps();
  }

  private onSearch(_query: string) {
    // Recherche textuelle appliquée côté plugin plus tard
  }

  private onContextMenu(annotation: AnnotationItem, evt: MouseEvent) {
    const menu = new Menu();

    menu.addItem((item: any) => {
      item
        .setTitle('Aller à l’annotation')
        .setIcon('locate-fixed')
        .onClick(() => {
          this.onSelectAnnotation(annotation);
        });
    });

    menu.addItem((item: any) => {
      item
        .setTitle('Copier le contenu')
        .setIcon('copy')
        .onClick(() => {
          const file = this.plugin.currentPdf?.file;
          const pageLink = file ? `[[${file.path}#page=${annotation.page}]]` : `p.${annotation.page}`;
          const text = annotation.text ? `"${annotation.text}"` : '""';
          const comment = annotation.contents ? ` – ${annotation.contents}` : '';
          const line = `${pageLink} ${text}${comment}`;

          if (navigator.clipboard && navigator.clipboard.writeText) {
            void navigator.clipboard.writeText(line);
          } else {
            new Notice(line);
          }
        });
    });

    menu.addItem((item: any) => {
      item
        .setTitle('Supprimer l’annotation')
        .setIcon('trash-2')
        .setWarning()
        .onClick(() => {
          this.onDeleteAnnotation(annotation);
        });
    });

    menu.showAtMouseEvent(evt);
  }
}


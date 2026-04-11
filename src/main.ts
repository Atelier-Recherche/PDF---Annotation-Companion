import { App, Notice, Plugin, WorkspaceLeaf, addIcon, TFile, Platform } from 'obsidian';

import type { PDFPlus, PDFView, PDFViewerChild } from './pdf-plus-shims';
import { AnnotationsService } from './annotations-service';
import { PdfAnnotationSiderailView, SIDERAIL_VIEW_TYPE } from './view';

export default class PdfAnnotationCompanionPlugin extends Plugin {
  pdfPlus: PDFPlus | null = null;
  annotations: AnnotationsService | null = null;
  currentPdf: { file: TFile; child: PDFViewerChild } | null = null;

  async onload() {
    this.registerIcons();

    if (!this.ensurePdfPlusEnabled()) {
      new Notice('PDF++ Annotation Companion: le plugin "PDF++" doit être activé.');
      return;
    }

    this.annotations = new AnnotationsService(this.pdfPlus!);

    this.registerView(
      SIDERAIL_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new PdfAnnotationSiderailView(leaf, this)
    );

    this.addCommand({
      id: 'toggle-pdf-annotation-siderail',
      name: 'Basculer la vue latérale des annotations PDF++',
      callback: () => this.toggleSiderail()
    });

    this.registerWorkspaceEvents();
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(SIDERAIL_VIEW_TYPE);
  }

  private registerIcons() {
    // On pourrait enregistrer une icône personnalisée plus tard si besoin.
  }

  private ensurePdfPlusEnabled(): boolean {
    const plugins = (this.app as any).plugins;
    const enabled = plugins.enabledPlugins.has('pdf-plus');
    if (!enabled) {
      this.pdfPlus = null;
      return false;
    }

    const instance = plugins.plugins['pdf-plus'];
    if (!instance) {
      this.pdfPlus = null;
      return false;
    }

    this.pdfPlus = instance as PDFPlus;
    return true;
  }

  private registerWorkspaceEvents() {
    const { workspace } = this.app;

    this.registerEvent(
      workspace.on('active-leaf-change', () => {
        this.updateCurrentPdfFromActiveLeaf();
      })
    );

    if (this.pdfPlus) {
      this.registerEvent(
        this.pdfPlus.on('highlight', () => {
          if (this.currentPdf && this.annotations) {
            this.annotations.clearForFile(this.currentPdf.file);
          }
        })
      );
    }

    this.app.workspace.onLayoutReady(() => {
      this.updateCurrentPdfFromActiveLeaf();
    });
  }

  private updateCurrentPdfFromActiveLeaf() {
    const workspace: any = this.app.workspace;
    const view = workspace.getActiveFileView?.();
    if (!view) {
      this.currentPdf = null;
      return;
    }

    const pdfView = view as PDFView;
    const child = pdfView?.viewer?.child;
    const file = child?.file;

    if (child && file) {
      this.currentPdf = { file, child };
      if (this.annotations) {
        this.annotations.clearForFile(file);
      }
    } else {
      this.currentPdf = null;
    }
  }

  async toggleSiderail() {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(SIDERAIL_VIEW_TYPE);

    if (leaves.length) {
      workspace.detachLeavesOfType(SIDERAIL_VIEW_TYPE);
      return;
    }

    const leaf = workspace.getRightLeaf(false);
    if (!leaf) return;

    await leaf.setViewState({
      type: SIDERAIL_VIEW_TYPE,
      active: true
    });

    workspace.revealLeaf(leaf);
  }
}


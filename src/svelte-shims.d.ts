declare module './ui/Siderail.svelte' {
  import type { SvelteComponentTyped } from 'svelte';

  export type AnnotationMode = 'global' | 'page';

  export interface AnnotationItem {
    id: string;
    page: number;
    color: string | null;
    text: string;
    contents: string | null;
    subtype: string;
  }

  export interface SiderailProps {
    annotations: AnnotationItem[];
    mode: AnnotationMode;
    currentPage: number;
    pageCount: number;
    onSelectAnnotation: (annotation: AnnotationItem) => void;
    onToggleMode: (mode: AnnotationMode) => void;
    onExportMarkdown: () => void;
    onDeleteAnnotation: (annotation: AnnotationItem) => void;
    onSearch: (query: string) => void;
  }

  export default class Siderail extends SvelteComponentTyped<SiderailProps> {}
}


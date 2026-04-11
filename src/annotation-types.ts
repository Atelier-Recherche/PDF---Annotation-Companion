export type AnnotationMode = 'global' | 'page';

export interface AnnotationItem {
  id: string;
  page: number;
  color: string | null;
  text: string;
  contents: string | null;
  subtype: string;
}


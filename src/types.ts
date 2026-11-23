export type ToolCategory = 
  | 'all'
  | 'popular'
  | 'edit-sign'
  | 'merge-split'
  | 'convert'
  | 'organize'
  | 'security';

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  category: ToolCategory[];
  icon: string;
  badge?: string;
  color?: string;
}

export interface PDFPageInfo {
  pageNumber: number;
  rotation: number;
  thumbnailUrl?: string;
  width: number;
  height: number;
  deleted?: boolean;
}

export interface PlacedElement {
  id: string;
  type: 'text' | 'signature' | 'image' | 'whiteout' | 'shape' | 'form' | 'highlight' | 'stamp' | 'symbol';
  pageNumber: number;
  x: number; // in percentage of page or points
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  dataUrl?: string;
  shapeType?: 'rectangle' | 'ellipse' | 'line' | 'arrow';
  formType?: 'checkbox' | 'radio' | 'textfield' | 'multiline' | 'dropdown' | 'signature-box';
  annotateType?: 'strikeout' | 'highlight' | 'underline' | 'draw';
  symbolType?: 'cross' | 'check' | 'dot';
  isChecked?: boolean;
  options?: string[];
  stampText?: string;
}

export interface EditedExistingText {
  id: string;
  pageNumber: number;
  pdfX: number; // in PDF points
  pdfY: number; // in PDF points
  originalPdfX?: number; // original PDF points before move
  originalPdfY?: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  originalText: string;
  text: string;
  fontSize: number;
  color?: string;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  bgColor?: string;
}


export interface ImageOcrTextBlock {
  id: string;
  text: string;
  originalText: string;
  x: number; // in pixels relative to original image width
  y: number; // in pixels relative to original image height
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bgColor: string; // sampled background color for in-painting
  isBold?: boolean;
  isItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  confidence?: number;
  isCustom?: boolean;
}

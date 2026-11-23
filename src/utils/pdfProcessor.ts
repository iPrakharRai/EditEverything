import * as pdfjsLib from 'pdfjs-dist';
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PlacedElement, EditedExistingText } from '../types';

export function hexToRgb(hexOrRgb: string) {
  if (!hexOrRgb) return { r: 0, g: 0, b: 0 };
  if (hexOrRgb.startsWith('rgb')) {
    const match = hexOrRgb.match(/\d+/g);
    if (match && match.length >= 3) {
      return {
        r: parseInt(match[0], 10) / 255,
        g: parseInt(match[1], 10) / 255,
        b: parseInt(match[2], 10) / 255,
      };
    }
  }
  let c = hexOrRgb.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16) || 0;
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
}

export async function splitPdf(pdfBuffer: Uint8Array, pageRanges: string): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const totalPages = srcPdf.getPageCount();
  const results: Uint8Array[] = [];

  // Parse ranges e.g. "1-2, 3-4" or "all"
  const rangeGroups = pageRanges.split(',').map(r => r.trim()).filter(Boolean);

  for (const group of rangeGroups) {
    const newPdf = await PDFDocument.create();
    let pageIndices: number[] = [];

    if (group.includes('-')) {
      const [startStr, endStr] = group.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      for (let i = start; i <= end; i++) pageIndices.push(i - 1);
    } else {
      const p = parseInt(group, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pageIndices.push(p - 1);
      }
    }

    if (pageIndices.length > 0) {
      const pages = await newPdf.copyPages(srcPdf, pageIndices);
      pages.forEach(p => newPdf.addPage(p));
      results.push(await newPdf.save());
    }
  }

  // Fallback: if no valid range parsed, split each page into a separate PDF
  if (results.length === 0) {
    for (let i = 0; i < totalPages; i++) {
      const singlePdf = await PDFDocument.create();
      const [page] = await singlePdf.copyPages(srcPdf, [i]);
      singlePdf.addPage(page);
      results.push(await singlePdf.save());
    }
  }

  return results;
}

export async function deletePages(pdfBuffer: Uint8Array, pagesToDelete: number[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  // Sort descending so indices don't shift when removing
  const sorted = [...new Set(pagesToDelete)].sort((a, b) => b - a);
  for (const p of sorted) {
    const idx = p - 1;
    if (idx >= 0 && idx < pdf.getPageCount()) {
      pdf.removePage(idx);
    }
  }
  return await pdf.save();
}

export async function rotatePdf(pdfBuffer: Uint8Array, rotations: Record<number, number>): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const totalPages = pdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const addDeg = rotations[pageNum] || 0;
    if (addDeg !== 0) {
      const page = pdf.getPage(i);
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + addDeg) % 360;
      page.setRotation(degrees(newAngle));
    }
  }
  return await pdf.save();
}

export async function addWatermark(
  pdfBuffer: Uint8Array,
  text: string,
  opacity: number = 0.35,
  rotationAngle: number = 45,
  fontSize: number = 48,
  colorHex: string = '#e74c3c'
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const totalPages = pdf.getPageCount();
  const c = hexToRgb(colorHex);

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font: font,
      color: rgb(c.r, c.g, c.b),
      opacity: opacity,
      rotate: degrees(rotationAngle),
    });
  }

  return await pdf.save();
}

export async function addPageNumbers(
  pdfBuffer: Uint8Array,
  format: 'page_of_total' | 'page_only' | 'custom_prefix' = 'page_of_total',
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left' = 'bottom-center',
  startFrom: number = 1
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const totalPages = pdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    const currentNumber = startFrom + i;

    let text = `${currentNumber}`;
    if (format === 'page_of_total') {
      text = `Page ${currentNumber} of ${totalPages}`;
    } else if (format === 'custom_prefix') {
      text = `- ${currentNumber} -`;
    }

    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 25;

    if (position === 'bottom-left') {
      x = 35;
      y = 25;
    } else if (position === 'bottom-right') {
      x = width - textWidth - 35;
      y = 25;
    } else if (position === 'top-center') {
      x = width / 2 - textWidth / 2;
      y = height - 30;
    } else if (position === 'top-right') {
      x = width - textWidth - 35;
      y = height - 30;
    } else if (position === 'top-left') {
      x = 35;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return await pdf.save();
}

export async function addHeaderFooter(
  pdfBuffer: Uint8Array,
  headerText: string,
  footerText: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const totalPages = pdf.getPageCount();
  const fontSize = 9;

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();

    if (headerText.trim()) {
      const headerWidth = font.widthOfTextAtSize(headerText, fontSize);
      page.drawText(headerText, {
        x: width / 2 - headerWidth / 2,
        y: height - 25,
        size: fontSize,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    if (footerText.trim()) {
      const footerWidth = font.widthOfTextAtSize(footerText, fontSize);
      page.drawText(footerText, {
        x: width / 2 - footerWidth / 2,
        y: 20,
        size: fontSize,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  return await pdf.save();
}

export async function addBatesNumbering(
  pdfBuffer: Uint8Array,
  prefix: string = 'CONFIDENTIAL-',
  startNumber: number = 1,
  padding: number = 6
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const font = await pdf.embedFont(StandardFonts.CourierBold);
  const totalPages = pdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = pdf.getPage(i);
    const { width } = page.getSize();
    const numStr = String(startNumber + i).padStart(padding, '0');
    const batesText = `${prefix}${numStr}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(batesText, fontSize);

    page.drawText(batesText, {
      x: width - textWidth - 30,
      y: 25,
      size: fontSize,
      font,
      color: rgb(0.8, 0.1, 0.1),
    });
  }

  return await pdf.save();
}

export async function resizePdf(
  pdfBuffer: Uint8Array,
  targetSize: 'A4' | 'Letter' | 'Legal' | 'A3'
): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const newPdf = await PDFDocument.create();

  // Dimensions in points (72 points = 1 inch)
  const SIZES: Record<string, [number, number]> = {
    A4: [595.28, 841.89],
    Letter: [612.0, 792.0],
    Legal: [612.0, 1008.0],
    A3: [841.89, 1190.55],
  };

  const [targetWidth, targetHeight] = SIZES[targetSize] || SIZES['A4'];
  const totalPages = srcPdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const [embeddedPage] = await newPdf.embedPdf(srcPdf, [i]);
    const newPage = newPdf.addPage([targetWidth, targetHeight]);

    const scale = Math.min(
      targetWidth / embeddedPage.width,
      targetHeight / embeddedPage.height
    );

    const scaledWidth = embeddedPage.width * scale;
    const scaledHeight = embeddedPage.height * scale;

    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    newPage.drawPage(embeddedPage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  return await newPdf.save();
}

export async function editMetadata(
  pdfBuffer: Uint8Array,
  meta: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
  }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  if (meta.title !== undefined) pdf.setTitle(meta.title);
  if (meta.author !== undefined) pdf.setAuthor(meta.author);
  if (meta.subject !== undefined) pdf.setSubject(meta.subject);
  if (meta.keywords !== undefined) {
    const kwArray = meta.keywords.split(',').map(k => k.trim()).filter(Boolean);
    pdf.setKeywords(kwArray);
  }
  if (meta.creator !== undefined) pdf.setCreator(meta.creator);
  if (meta.producer !== undefined) pdf.setProducer(meta.producer);

  return await pdf.save();
}

export async function imagesToPdf(imageUrls: string[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const url of imageUrls) {
    let embeddedImg;
    const isPng = url.startsWith('data:image/png');
    const base64Data = url.split(',')[1];
    const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    if (isPng) {
      embeddedImg = await pdf.embedPng(imgBytes);
    } else {
      embeddedImg = await pdf.embedJpg(imgBytes);
    }

    const { width, height } = embeddedImg;
    // Cap to standard A4 ratio or match image aspect
    const page = pdf.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdf.save();
}

// Safe text drawer with high-resolution Unicode/Devanagari/Multi-language fallback
async function drawTextSafely(
  pdf: PDFDocument,
  page: any,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    font: any;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    color?: { r: number; g: number; b: number };
  }
) {
  // Test if text contains only WinAnsi / ASCII characters
  const isAscii = /^[\x20-\x7E\xA0-\xFF\n\r\t]*$/.test(text);
  if (isAscii && options.font) {
    try {
      page.drawText(text, {
        x: options.x,
        y: options.y,
        size: options.size,
        font: options.font,
        color: options.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0),
      });
      return;
    } catch {
      // Fall through to high-resolution canvas render
    }
  }

  // Multi-lingual & Unicode support (Hindi, Devanagari, Arabic, CJK, Emoji, Symbols)
  if (typeof document !== 'undefined') {
    try {
      const scale = 3; // 3x high-DPI rasterization
      const fontSizePx = Math.round(options.size * scale);
      const weight = options.isBold ? 'bold' : 'normal';
      const style = options.isItalic ? 'italic' : 'normal';
      const family = options.fontFamily || 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${style} ${weight} ${fontSizePx}px ${family}`;
        const metrics = ctx.measureText(text);
        const fontWidth = Math.ceil(metrics.width) + 8;
        const fontHeight = Math.ceil(fontSizePx * 1.4);

        canvas.width = fontWidth;
        canvas.height = fontHeight;

        // Re-apply styles after dimension change
        ctx.font = `${style} ${weight} ${fontSizePx}px ${family}`;
        ctx.textBaseline = 'alphabetic';
        const c = options.color || { r: 0, g: 0, b: 0 };
        ctx.fillStyle = `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
        ctx.fillText(text, 2, fontSizePx);

        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
        const embeddedPng = await pdf.embedPng(bytes);

        page.drawImage(embeddedPng, {
          x: options.x,
          y: options.y - (options.size * 0.3),
          width: fontWidth / scale,
          height: fontHeight / scale,
        });
        return;
      }
    } catch (renderErr) {
      console.warn('Canvas unicode render warning:', renderErr);
    }
  }

  // Last fallback: ASCII sanitized draw
  try {
    const sanitized = text.replace(/[^\x20-\x7E]/g, '?');
    page.drawText(sanitized, {
      x: options.x,
      y: options.y,
      size: options.size,
      font: options.font,
      color: options.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0),
    });
  } catch (e) {
    console.error('Text draw fallback error:', e);
  }
}

export async function applyPdfEditorChanges(
  pdfBuffer: Uint8Array,
  elements: PlacedElement[],
  editedExistingTexts: EditedExistingText[] = []
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const fontHelvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdf.embedFont(StandardFonts.Courier);
  const fontTimes = await pdf.embedFont(StandardFonts.TimesRoman);

  // 1. Apply edits to existing PDF text lines (whiteout old text and redraw modified text)
  for (const item of editedExistingTexts) {
    const pageIndex = item.pageNumber - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) continue;
    const page = pdf.getPage(pageIndex);

    // Erase original text with whiteout rectangle at its original position
    const eraseX = Math.max(0, (item.originalPdfX ?? item.pdfX) - 2);
    const eraseY = Math.max(0, (item.originalPdfY ?? item.pdfY) - (item.fontSize * 0.40));
    const calcWidth = Math.max(item.originalWidth || item.width || 0, (item.originalText?.length || 1) * (item.fontSize * 0.60));
    const eraseWidth = Math.max(calcWidth, 10) + 8;
    const eraseHeight = (item.fontSize * 1.55) + 6;

    const bg = item.bgColor ? hexToRgb(item.bgColor) : { r: 1, g: 1, b: 1 };
    page.drawRectangle({
      x: eraseX,
      y: eraseY,
      width: eraseWidth,
      height: eraseHeight,
      color: rgb(bg.r, bg.g, bg.b),
    });

    // If new text is not empty, draw updated text at target coordinates
    if (item.text.trim()) {
      let chosenFont = fontHelvetica;
      if (item.fontFamily === 'Courier') chosenFont = fontCourier;
      else if (item.fontFamily === 'Times') chosenFont = fontTimes;
      else if (item.isBold) chosenFont = fontHelveticaBold;

      const c = hexToRgb(item.color || '#000000');
      await drawTextSafely(pdf, page, item.text, {
        x: item.pdfX,
        y: item.pdfY,
        size: item.fontSize || 12,
        font: chosenFont,
        fontFamily: item.fontFamily,
        isBold: item.isBold,
        isItalic: item.isItalic,
        color: c,
      });
    }
  }

  // 2. Apply newly added elements (text, signatures, images, whiteout, shapes, etc.)
  for (const el of elements) {
    const pageIndex = el.pageNumber - 1;
    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) continue;

    const page = pdf.getPage(pageIndex);
    const { width, height } = page.getSize();

    // Convert percentage coordinates (0-100) to PDF points
    const pdfX = (el.x / 100) * width;
    const pdfY = height - ((el.y / 100) * height);

    if (el.type === 'text' && el.text) {
      let chosenFont = fontHelvetica;
      if (el.fontFamily === 'Courier') chosenFont = fontCourier;
      else if (el.fontFamily === 'Times') chosenFont = fontTimes;
      else if (el.isBold) chosenFont = fontHelveticaBold;

      const c = hexToRgb(el.color || '#000000');
      await drawTextSafely(pdf, page, el.text, {
        x: pdfX,
        y: pdfY - (el.fontSize || 14),
        size: el.fontSize || 14,
        font: chosenFont,
        fontFamily: el.fontFamily,
        isBold: el.isBold,
        isItalic: el.isItalic,
        color: c,
      });
    } else if (el.type === 'whiteout') {
      const w = ((el.width || 15) / 100) * width;
      const h = ((el.height || 4) / 100) * height;
      page.drawRectangle({
        x: pdfX,
        y: pdfY - h,
        width: w,
        height: h,
        color: rgb(1, 1, 1),
      });
    } else if (el.type === 'signature' && el.dataUrl) {
      try {
        const base64Data = el.dataUrl.split(',')[1];
        const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const sigImg = await pdf.embedPng(imgBytes);

        const sigWidth = ((el.width || 20) / 100) * width;
        const sigHeight = ((el.height || 8) / 100) * height;

        page.drawImage(sigImg, {
          x: pdfX,
          y: pdfY - sigHeight,
          width: sigWidth,
          height: sigHeight,
        });
      } catch (e) {
        console.error('Failed to embed signature image', e);
      }
    } else if (el.type === 'image' && el.dataUrl) {
      try {
        const base64Data = el.dataUrl.split(',')[1];
        const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const img = el.dataUrl.startsWith('data:image/png') 
          ? await pdf.embedPng(imgBytes) 
          : await pdf.embedJpg(imgBytes);

        const imgWidth = ((el.width || 25) / 100) * width;
        const imgHeight = ((el.height || 15) / 100) * height;

        page.drawImage(img, {
          x: pdfX,
          y: pdfY - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });
      } catch (e) {
        console.error('Failed to embed image', e);
      }
    } else if (el.type === 'highlight') {
      const w = ((el.width || 30) / 100) * width;
      const h = ((el.height || 3) / 100) * height;
      const c = hexToRgb(el.color || '#ffeb3b');
      page.drawRectangle({
        x: pdfX,
        y: pdfY - h,
        width: w,
        height: h,
        color: rgb(c.r, c.g, c.b),
        opacity: 0.45,
      });
    } else if (el.type === 'shape') {
      const w = ((el.width || 25) / 100) * width;
      const h = ((el.height || 10) / 100) * height;
      const c = hexToRgb(el.color || '#e11d48');
      if (el.shapeType === 'ellipse') {
        page.drawEllipse({
          x: pdfX + w / 2,
          y: pdfY - h / 2,
          xScale: w / 2,
          yScale: h / 2,
          borderColor: rgb(c.r, c.g, c.b),
          borderWidth: 2,
          color: rgb(1, 1, 1),
          opacity: 0.05,
        });
      } else if (el.shapeType === 'line') {
        page.drawLine({
          start: { x: pdfX, y: pdfY },
          end: { x: pdfX + w, y: pdfY - h },
          thickness: 2,
          color: rgb(c.r, c.g, c.b),
        });
      } else if (el.shapeType === 'arrow') {
        page.drawLine({
          start: { x: pdfX, y: pdfY },
          end: { x: pdfX + w, y: pdfY - h },
          thickness: 2,
          color: rgb(c.r, c.g, c.b),
        });
        const angle = Math.atan2(-h, w);
        const headLen = 10;
        page.drawLine({
          start: { x: pdfX + w, y: pdfY - h },
          end: { 
            x: pdfX + w - headLen * Math.cos(angle - Math.PI / 6),
            y: pdfY - h - headLen * Math.sin(angle - Math.PI / 6)
          },
          thickness: 2,
          color: rgb(c.r, c.g, c.b),
        });
        page.drawLine({
          start: { x: pdfX + w, y: pdfY - h },
          end: { 
            x: pdfX + w - headLen * Math.cos(angle + Math.PI / 6),
            y: pdfY - h - headLen * Math.sin(angle + Math.PI / 6)
          },
          thickness: 2,
          color: rgb(c.r, c.g, c.b),
        });
      } else {
        page.drawRectangle({
          x: pdfX,
          y: pdfY - h,
          width: w,
          height: h,
          borderColor: rgb(c.r, c.g, c.b),
          borderWidth: 2,
          color: rgb(1, 1, 1),
          opacity: 0.05,
        });
      }
    } else if (el.type === 'form') {
      const size = 16;
      page.drawRectangle({
        x: pdfX,
        y: pdfY - size,
        width: size,
        height: size,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 1.5,
        color: rgb(1, 1, 1),
      });
      if (el.isChecked) {
        page.drawText('✓', {
          x: pdfX + 2,
          y: pdfY - size + 2,
          size: 14,
          font: fontHelveticaBold,
          color: rgb(0.1, 0.6, 0.2),
        });
      }
    }
  }

  return await pdf.save();
}

export function downloadBlob(data: Uint8Array | Blob, filename: string, mimeType = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ImageBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  isBackground: boolean;
}

export function multiplyTransform(m1: number[], m2: number[]): number[] {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

export function applyTransform(m: number[], x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

export async function detectPageImageBoxes(
  page: any,
  viewport: any
): Promise<ImageBoundingBox[]> {
  try {
    const opList = await page.getOperatorList();
    if (!opList || !opList.fnArray) return [];

    const OPS = (pdfjsLib as any).OPS || {};
    const saveOp = OPS.save ?? 10;
    const restoreOp = OPS.restore ?? 11;
    const transformOp = OPS.transform ?? 12;
    const formBeginOp = OPS.paintFormXObjectBegin ?? 73;
    const formEndOp = OPS.paintFormXObjectEnd ?? 74;

    // All PDF image drawing operators (paintImageXObject, paintInlineImageXObject, paintImageXObjectRepeat, groups)
    const imageOps = new Set<number>([
      OPS.paintImageXObject ?? 85,
      OPS.paintInlineImageXObject ?? 86,
      OPS.paintImageXObjectRepeat ?? 88,
      OPS.paintImageMaskXObjectGroup ?? 84,
      OPS.paintInlineImageXObjectGroup ?? 87,
      OPS.paintImageMaskXObjectRepeat ?? 89,
    ]);

    const stack: number[][] = [];
    let currentMatrix = [1, 0, 0, 1, 0, 0];
    const boxes: ImageBoundingBox[] = [];

    const canvasWidth = Math.floor(viewport.width);
    const canvasHeight = Math.floor(viewport.height);
    const pageArea = canvasWidth * canvasHeight;

    for (let i = 0; i < opList.fnArray.length; i++) {
      const fn = opList.fnArray[i];
      const args = opList.argsArray[i];

      if (fn === saveOp) {
        stack.push([...currentMatrix]);
      } else if (fn === restoreOp) {
        currentMatrix = stack.pop() || [1, 0, 0, 1, 0, 0];
      } else if (fn === transformOp && Array.isArray(args) && args.length >= 6) {
        currentMatrix = multiplyTransform(currentMatrix, args);
      } else if (fn === formBeginOp) {
        stack.push([...currentMatrix]);
        if (Array.isArray(args) && Array.isArray(args[0]) && args[0].length >= 6) {
          currentMatrix = multiplyTransform(currentMatrix, args[0]);
        }
      } else if (fn === formEndOp) {
        currentMatrix = stack.pop() || [1, 0, 0, 1, 0, 0];
      } else if (imageOps.has(fn)) {
        // PDF images map unit square [0,0] to [1,1]
        const p0 = applyTransform(currentMatrix, 0, 0);
        const p1 = applyTransform(currentMatrix, 1, 0);
        const p2 = applyTransform(currentMatrix, 1, 1);
        const p3 = applyTransform(currentMatrix, 0, 1);

        const v0 = viewport.convertToViewportPoint(p0[0], p0[1]);
        const v1 = viewport.convertToViewportPoint(p1[0], p1[1]);
        const v2 = viewport.convertToViewportPoint(p2[0], p2[1]);
        const v3 = viewport.convertToViewportPoint(p3[0], p3[1]);

        const minX = Math.max(0, Math.floor(Math.min(v0[0], v1[0], v2[0], v3[0])));
        const maxX = Math.min(canvasWidth, Math.ceil(Math.max(v0[0], v1[0], v2[0], v3[0])));
        const minY = Math.max(0, Math.floor(Math.min(v0[1], v1[1], v2[1], v3[1])));
        const maxY = Math.min(canvasHeight, Math.ceil(Math.max(v0[1], v1[1], v2[1], v3[1])));

        const w = maxX - minX;
        const h = maxY - minY;
        const boxArea = w * h;

        // An attached photo/image must have reasonable dimensions (at least 35x35 px, area >= 1500)
        const isPhoto = (
          w >= 35 && 
          h >= 35 && 
          boxArea >= 1500 && 
          (w / h) <= 10 && 
          (h / w) <= 10
        );

        if (isPhoto) {
          const isBackground = boxArea >= 0.88 * pageArea;
          boxes.push({ minX, minY, maxX, maxY, width: w, height: h, isBackground });
        }
      }
    }

    return boxes;
  } catch (err) {
    console.warn('Could not inspect operator list for image boxes:', err);
    return [];
  }
}

export function detectRasterPhotoBoxes(
  d: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number = 125
): ImageBoundingBox[] {
  const tileSize = 24;
  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);
  if (cols < 2 || rows < 2) return [];

  const tileIsPhoto = new Uint8Array(cols * rows);
  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      let colorCount = 0;
      const totalPixels = tileSize * tileSize;

      for (let py = 0; py < tileSize; py++) {
        const y = ty * tileSize + py;
        const rowOff = y * width * 4;
        for (let px = 0; px < tileSize; px++) {
          const x = tx * tileSize + px;
          const p = rowOff + x * 4;
          const r = d[p], g = d[p + 1], b = d[p + 2];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          if (sat > 35) colorCount++;
        }
      }

      // Only mark tiles with strong multi-color saturation (photos, pictures)
      if (colorCount > totalPixels * 0.40) {
        tileIsPhoto[ty * cols + tx] = 1;
      }
    }
  }

  // Find connected components of photo tiles
  const visited = new Uint8Array(cols * rows);
  const boxes: ImageBoundingBox[] = [];
  const pageArea = width * height;

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const idx = ty * cols + tx;
      if (tileIsPhoto[idx] === 1 && visited[idx] === 0) {
        let minTileX = tx, maxTileX = tx, minTileY = ty, maxTileY = ty;
        let count = 0;
        const queue: [number, number][] = [[tx, ty]];
        visited[idx] = 1;

        while (queue.length > 0) {
          const [cx, cy] = queue.pop()!;
          count++;
          if (cx < minTileX) minTileX = cx;
          if (cx > maxTileX) maxTileX = cx;
          if (cy < minTileY) minTileY = cy;
          if (cy > maxTileY) maxTileY = cy;

          const neighbors: [number, number][] = [
            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
          ];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              const nIdx = ny * cols + nx;
              if (tileIsPhoto[nIdx] === 1 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        const minX = minTileX * tileSize;
        const minY = minTileY * tileSize;
        const maxX = Math.min(width, (maxTileX + 1) * tileSize);
        const maxY = Math.min(height, (maxTileY + 1) * tileSize);
        const w = maxX - minX;
        const h = maxY - minY;
        const boxArea = w * h;

        // Substantial photo block: at least 100x70, ratio <= 5
        if (w >= 100 && h >= 70 && boxArea >= 8000 && (w / h) <= 5 && (h / w) <= 5 && count >= 8) {
          const isBackground = boxArea >= 0.88 * pageArea;
          boxes.push({ minX, minY, maxX, maxY, width: w, height: h, isBackground });
        }
      }
    }
  }

  return boxes;
}

export interface InvertPdfOptions {
  mode: 'smart-clean' | 'text-only' | 'monochrome' | 'full-invert';
  threshold?: number; // 0-255, default 125
  dpiScale?: number;  // 1.5 - 2.5, default 2.0
  preserveImages?: boolean; // default true
  isImageInput?: boolean;
}

export function processCanvasPixels(
  d: Uint8ClampedArray,
  origD: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    mode: 'smart-clean' | 'text-only' | 'monochrome' | 'full-invert';
    threshold: number;
    preserveImages: boolean;
    imageBoxes: ImageBoundingBox[];
    isImageInput?: boolean;
  }
) {
  const { mode, threshold, preserveImages, imageBoxes, isImageInput } = options;

  let isImagePixel: Uint8Array | null = null;
  if (preserveImages) {
    let candidateBoxes = imageBoxes.filter(b => !b.isBackground);

    // Only run raster detection if this was an explicit image file upload with no vector operators
    if (candidateBoxes.length === 0 && isImageInput) {
      candidateBoxes = detectRasterPhotoBoxes(origD, canvasWidth, canvasHeight, threshold).filter(b => !b.isBackground);
    }

    // All embedded attached images are preserved in 100% true natural colors
    const validPhotoBoxes = candidateBoxes;

    if (validPhotoBoxes.length > 0) {
      isImagePixel = new Uint8Array(canvasWidth * canvasHeight);
      for (const box of validPhotoBoxes) {
        for (let y = box.minY; y < box.maxY; y++) {
          const rowOff = y * canvasWidth;
          for (let x = box.minX; x < box.maxX; x++) {
            isImagePixel[rowOff + x] = 1;
          }
        }
      }
    }
  }

  for (let p = 0, pIdx = 0; p < d.length; p += 4, pIdx++) {
    // If pixel is within a validated attached photo and preserveImages is true, KEEP 100% ORIGINAL PIXEL!
    if (preserveImages && isImagePixel && isImagePixel[pIdx] === 1) {
      d[p] = origD[p];
      d[p + 1] = origD[p + 1];
      d[p + 2] = origD[p + 2];
      d[p + 3] = origD[p + 3];
      continue;
    }

    const r = origD[p];
    const g = origD[p + 1];
    const b = origD[p + 2];
    const a = origD[p + 3];

    // Transparent pixel -> Pure white paper
    if (a < 10) {
      d[p] = 255;
      d[p + 1] = 255;
      d[p + 2] = 255;
      d[p + 3] = 255;
      continue;
    }

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC - minC;

    if (mode === 'full-invert') {
      d[p] = 255 - r;
      d[p + 1] = 255 - g;
      d[p + 2] = 255 - b;
    } else if (mode === 'monochrome') {
      const isDarkBg = (maxC < threshold && sat < 40) || lum < 38;
      if (isDarkBg) {
        d[p] = 255;
        d[p + 1] = 255;
        d[p + 2] = 255;
      } else {
        d[p] = 0;
        d[p + 1] = 0;
        d[p + 2] = 0;
      }
    } else if (mode === 'text-only') {
      // Clean background & keep text only (Slide ink-saver)
      const isLightText = lum > Math.min(threshold + 25, 175) && sat < 45;
      const isDarkOutlineOrText = lum < 60 && sat < 30;

      if (isLightText || isDarkOutlineOrText) {
        d[p] = 0;
        d[p + 1] = 0;
        d[p + 2] = 0;
      } else {
        if (lum > 105) {
          d[p] = 255;
          d[p + 1] = 255;
          d[p + 2] = 255;
        } else {
          const bR = Math.min(255, Math.round(r * 1.8 + 80));
          const bG = Math.min(255, Math.round(g * 1.8 + 80));
          const bB = Math.min(255, Math.round(b * 1.8 + 80));
          const bLum = 0.299 * bR + 0.587 * bG + 0.114 * bB;
          if (bLum > 190) {
            d[p] = 255;
            d[p + 1] = 255;
            d[p + 2] = 255;
          } else {
            d[p] = bR;
            d[p + 1] = bG;
            d[p + 2] = bB;
          }
        }
      }
    } else {
      // smart-clean (Recommended)
      // Check if pixel is dark background (black, dark gray, dark navy, dark slate)
      const isDarkBackground = (maxC < threshold && sat < 40) || lum < 38;

      if (isDarkBackground) {
        // Clean to pure white paper
        d[p] = 255;
        d[p + 1] = 255;
        d[p + 2] = 255;
      } else {
        // Pixel is text, table border, or graphic element!
        // Check if it is a strong vivid chromatic color (like red, blue, green) vs light text (white, cream, gold, yellow, silver, gray)
        const isVividAccent = sat > 65 && minC < 100 && (maxC / (minC + 1) > 2.0);

        if (isVividAccent) {
          // Saturated accent (e.g. red badge, blue icon, green bullet):
          // Darken to a rich, high-contrast readable ink tone on white paper
          d[p] = Math.round(r * 0.45);
          d[p + 1] = Math.round(g * 0.45);
          d[p + 2] = Math.round(b * 0.45);
        } else {
          // Text / Borders (white, cream, gold, silver, gray, yellow):
          // Smooth anti-aliased edge calculation for crisp typographic quality
          const tDist = lum - threshold;
          if (tDist < 45 && tDist > 0) {
            const edgeFactor = tDist / 45;
            const v = Math.round(255 * (1 - edgeFactor));
            d[p] = v;
            d[p + 1] = v;
            d[p + 2] = v;
          } else {
            d[p] = 0;
            d[p + 1] = 0;
            d[p + 2] = 0;
          }
        }
      }
    }
  }
}

export async function invertPdfBackground(
  pdfBuffer: Uint8Array,
  options: InvertPdfOptions = { mode: 'smart-clean', threshold: 125, dpiScale: 2.0, preserveImages: true },
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const clonedBytes = new Uint8Array(pdfBuffer.slice(0));
  const loadingTask = pdfjsLib.getDocument({ data: clonedBytes });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const outDoc = await PDFDocument.create();
  const dpiScale = options.dpiScale || 2.0;
  const threshold = options.threshold ?? 125;
  const mode = options.mode || 'smart-clean';
  const preserveImages = options.preserveImages ?? true;

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) continue;

    // Detect image bounding boxes from PDF operator stream
    const imageBoxes = await detectPageImageBoxes(page, viewport);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    processCanvasPixels(imgData.data, origData.data, canvas.width, canvas.height, {
      mode,
      threshold,
      preserveImages,
      imageBoxes,
      isImageInput: false,
    });

    ctx.putImageData(imgData, 0, 0);

    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const pngBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
    if (pngBlob) {
      const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer());
      const embeddedPng = await outDoc.embedPng(pngBuffer);
      const outPage = outDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
      outPage.drawImage(embeddedPng, {
        x: 0,
        y: 0,
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      });
    }
  }

  return await outDoc.save();
}

export async function invertImageFile(
  imageBytes: Uint8Array,
  mimeType: string,
  options: InvertPdfOptions = { mode: 'smart-clean', threshold: 125, preserveImages: true }
): Promise<{ pdfBytes: Uint8Array; imageBlob: Blob }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([imageBytes as unknown as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = async () => {
      try {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const imageBoxes = detectRasterPhotoBoxes(origData.data, canvas.width, canvas.height, options.threshold ?? 125);

        processCanvasPixels(imgData.data, origData.data, canvas.width, canvas.height, {
          mode: options.mode || 'smart-clean',
          threshold: options.threshold ?? 125,
          preserveImages: options.preserveImages ?? true,
          imageBoxes,
          isImageInput: true,
        });

        ctx.putImageData(imgData, 0, 0);

        const outBlob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => b ? res(b) : rej(new Error('Failed to create image blob')), 'image/png');
        });

        const outPngBuffer = new Uint8Array(await outBlob.arrayBuffer());
        const outDoc = await PDFDocument.create();
        const embeddedPng = await outDoc.embedPng(outPngBuffer);
        const page = outDoc.addPage([canvas.width, canvas.height]);
        page.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        });
        const pdfBytes = await outDoc.save();

        resolve({ pdfBytes, imageBlob: outBlob });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + e));
    };

    img.src = url;
  });
}

import React, { useState, useEffect } from 'react';
import { 
  Contrast, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  Check, 
  Sun, 
  Sliders, 
  FileText, 
  RefreshCw,
  Printer,
  Eye,
  FileCheck2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileDropzone } from '../components/FileDropzone';
import { 
  invertPdfBackground, 
  invertImageFile, 
  detectPageImageBoxes, 
  processCanvasPixels, 
  downloadBlob,
  ImageBoundingBox
} from '../utils/pdfProcessor';
import { generateSamplePdfBytesAsync } from '../utils/samplePdfs';
import { useLanguage } from '../i18n/LanguageContext';

interface InvertPdfProps {
  onBack: () => void;
  initialFile?: { name: string; bytes: Uint8Array } | null;
}

export const InvertPdf: React.FC<InvertPdfProps> = ({ onBack, initialFile }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(initialFile || null);
  const [mode, setMode] = useState<'smart-clean' | 'text-only' | 'monochrome' | 'full-invert'>('smart-clean');
  const [threshold, setThreshold] = useState<number>(125);
  const [preserveImages, setPreserveImages] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string>('');
  const [previewCleaned, setPreviewCleaned] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(1);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const isImageFile = Boolean(
    file && 
    !file.name.toLowerCase().endsWith('.pdf') && 
    (file.name.match(/\.(png|jpe?g|webp|bmp|gif)$/i) !== null)
  );

  // Synchronize when initialFile arrives or resets
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);

  // Reset preview page to 1 when a new file is uploaded
  useEffect(() => {
    setPreviewPage(1);
  }, [file]);

  // Load and render Page 1 Preview (Original & Cleaned)
  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    const generatePreview = async () => {
      try {
        setIsPreviewLoading(true);

        if (isImageFile) {
          // Handle Image file input
          setTotalPages(1);
          const mimeType = file.name.endsWith('.png') ? 'image/png' : 'image/jpeg';
          const blob = new Blob([file.bytes as unknown as BlobPart], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const img = new Image();

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = url;
          });

          if (!isMounted) {
            URL.revokeObjectURL(url);
            return;
          }

          // Scale for preview if very large
          const maxDim = 1200;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > maxDim || h > maxDim) {
            const scale = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }

          const origCanvas = document.createElement('canvas');
          origCanvas.width = w;
          origCanvas.height = h;
          const origCtx = origCanvas.getContext('2d');
          if (!origCtx) return;
          origCtx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);

          if (!isMounted) return;
          setPreviewOriginal(origCanvas.toDataURL('image/png'));

          const cleanCanvas = document.createElement('canvas');
          cleanCanvas.width = w;
          cleanCanvas.height = h;
          const cleanCtx = cleanCanvas.getContext('2d');
          if (!cleanCtx) return;

          cleanCtx.drawImage(origCanvas, 0, 0);
          const imgData = cleanCtx.getImageData(0, 0, w, h);
          const origData = origCtx.getImageData(0, 0, w, h);

          processCanvasPixels(imgData.data, origData.data, w, h, {
            mode,
            threshold,
            preserveImages,
            imageBoxes: [],
            isImageInput: true,
          });

          cleanCtx.putImageData(imgData, 0, 0);
          if (isMounted) {
            setPreviewCleaned(cleanCanvas.toDataURL('image/png'));
          }
        } else {
          // Handle PDF input
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.bytes.slice(0)) });
          const doc = await loadingTask.promise;
          if (!isMounted) return;
          const numPages = doc.numPages || 1;
          setTotalPages(numPages);

          const pageToRender = Math.min(Math.max(1, previewPage), numPages);
          const page = await doc.getPage(pageToRender);
          const viewport = page.getViewport({ scale: 1.5 });

          // 1. Render Original Page
          const origCanvas = document.createElement('canvas');
          origCanvas.width = Math.floor(viewport.width);
          origCanvas.height = Math.floor(viewport.height);
          const origCtx = origCanvas.getContext('2d');
          if (!origCtx) return;

          // Detect image bounding boxes from PDF operator stream
          const imageBoxes: ImageBoundingBox[] = await detectPageImageBoxes(page, viewport);

          await page.render({ canvasContext: origCtx, viewport }).promise;
          if (!isMounted) return;
          setPreviewOriginal(origCanvas.toDataURL('image/png'));

          // 2. Generate Cleaned Page
          const cleanCanvas = document.createElement('canvas');
          cleanCanvas.width = origCanvas.width;
          cleanCanvas.height = origCanvas.height;
          const cleanCtx = cleanCanvas.getContext('2d');
          if (!cleanCtx) return;

          cleanCtx.drawImage(origCanvas, 0, 0);
          const imgData = cleanCtx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
          const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);

          processCanvasPixels(imgData.data, origData.data, cleanCanvas.width, cleanCanvas.height, {
            mode,
            threshold,
            preserveImages,
            imageBoxes,
            isImageInput: false,
          });

          cleanCtx.putImageData(imgData, 0, 0);
          if (isMounted) {
            setPreviewCleaned(cleanCanvas.toDataURL('image/png'));
          }
        }
      } catch (err) {
        console.error('Error generating preview:', err);
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [file, mode, threshold, preserveImages, previewPage]);

  const handleProcessAndDownloadPdf = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress({ current: 0, total: totalPages });

      const baseName = file.name.replace(/\.[^/.]+$/, '');

      if (isImageFile) {
        const mimeType = file.name.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const res = await invertImageFile(file.bytes, mimeType, {
          mode,
          threshold,
          preserveImages
        });
        downloadBlob(res.pdfBytes, `${baseName}_white_background.pdf`);
      } else {
        const cleanedBytes = await invertPdfBackground(
          file.bytes,
          { mode, threshold, dpiScale: 2.0, preserveImages },
          (current, total) => setProgress({ current, total })
        );
        downloadBlob(cleanedBytes, `${baseName}_white_background.pdf`);
      }
    } catch (err) {
      console.error('Error cleaning background:', err);
      alert('Error processing document. Please check the file and try again.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleProcessAndDownloadImage = async () => {
    if (!file || !isImageFile) return;

    try {
      setIsProcessing(true);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const mimeType = file.name.endsWith('.png') ? 'image/png' : 'image/jpeg';

      const res = await invertImageFile(file.bytes, mimeType, {
        mode,
        threshold,
        preserveImages
      });

      downloadBlob(res.imageBlob, `${baseName}_cleaned.png`, 'image/png');
    } catch (err) {
      console.error('Error cleaning image:', err);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleDarkModePdf = async () => {
    const bytes = await generateSamplePdfBytesAsync('dark-mode');
    setFile({
      name: 'Sample_Dark_Mode_Presentation.pdf',
      bytes,
    });
  };

  if (!file) {
    return (
      <div className="relative overflow-hidden min-h-[85vh] flex flex-col justify-center bg-transparent">
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 sm:py-14 w-full">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-500 hover:text-slate-800 mb-8 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> 
            <span>{t('dropzone.backToTools', 'Back to all tools')}</span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs sm:text-sm font-semibold mb-4 shadow-xs">
              <Contrast className="w-4 h-4 text-cyan-600" />
              <span>Dark to Light Converter — 100% Client-Side Privacy</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
              {t('invert.title', 'Invert & Clean Dark PDF')}
            </h2>
            <p className="text-base sm:text-xl text-slate-500 mt-2.5 font-medium max-w-2xl mx-auto">
              {t('invert.subtitle', 'If your PDF has a black or dark background, clean it into pure white paper with crisp black text, while keeping photos and diagrams in full color.')}
            </p>
          </div>

          <FileDropzone 
            onFileLoaded={(f) => setFile(f)}
            accept="application/pdf,image/*,.png,.jpg,.jpeg,.webp"
            title={t('invert.title', 'Upload Dark PDF or Image')}
            subtitle={t('invert.subtitle', 'Upload PDFs with dark background, black slides, or inverted scans. Files stay 100% private.')}
            buttonText={t('invert.downloadBtn', 'Choose Dark PDF or Image to Clean')}
          />

          {/* Quick Demo Sample Bar */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadSampleDarkModePdf}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-cyan-50 text-cyan-800 border-2 border-cyan-300 font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Contrast className="w-4 h-4 text-slate-700" />
              <span>{t('invert.demoBtn', 'Test with Sample Dark Mode PDF (Black Background)')}</span>
              <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded-full font-black">DEMO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <button
              onClick={() => setFile(null)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('editor.uploadAnother', 'Choose Another File')}</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2.5">
              <Contrast className="w-7 h-7 text-cyan-600" />
              <span>{t('invert.title', 'Clean Dark Background to White')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              File: <strong className="text-slate-700">{file.name}</strong> • {isImageFile ? '1 image' : `${totalPages} page${totalPages > 1 ? 's' : ''}`} • {(file.bytes.byteLength / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isImageFile && (
              <button
                onClick={handleProcessAndDownloadImage}
                disabled={isProcessing}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-bold text-sm sm:text-base rounded-2xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5 text-cyan-600" />
                <span>{t('invert.downloadImageBtn', 'Download Cleaned PNG')}</span>
              </button>
            )}

            <button
              onClick={handleProcessAndDownloadPdf}
              disabled={isProcessing}
              className="px-8 py-3.5 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>
                    {progress ? `Processing Page ${progress.current} of ${progress.total}...` : 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{t('invert.downloadBtn', 'Download Cleaned White PDF')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Control Settings Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Mode 1: Smart Clean Background */}
            <button
              type="button"
              onClick={() => setMode('smart-clean')}
              className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                mode === 'smart-clean'
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-cyan-600" />
                    {t('invert.smartClean', 'Smart Clean Background')}
                  </span>
                  {mode === 'smart-clean' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('invert.smartCleanDesc', 'Cleans black background into white paper, inverts light text to dark, and preserves attached photos in 100% natural color.')}
                </p>
              </div>
              <span className="text-[10px] font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full w-fit mt-3">
                RECOMMENDED
              </span>
            </button>

            {/* Mode 2: Clean Background & Keep Text Only (Image 3 & 4) */}
            <button
              type="button"
              onClick={() => setMode('text-only')}
              className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                mode === 'text-only'
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    {t('invert.textOnly', 'Clean Background (Keep Text Only)')}
                  </span>
                  {mode === 'text-only' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('invert.textOnlyDesc', 'Bleaches photo and colored backgrounds to white paper, turning all text into crisp bold black font. Saves maximum ink for lecture slides.')}
                </p>
              </div>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full w-fit mt-3">
                SLIDE INK-SAVER
              </span>
            </button>

            {/* Mode 3: High-Contrast Laser Print */}
            <button
              type="button"
              onClick={() => setMode('monochrome')}
              className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                mode === 'monochrome'
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-slate-700" />
                    {t('invert.monochrome', 'High-Contrast Laser Print')}
                  </span>
                  {mode === 'monochrome' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('invert.monochromeDesc', 'Pure black text on pure white paper. Eliminates all gray toner haze to save maximum ink.')}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-3">
                INK-SAVING
              </span>
            </button>

            {/* Mode 4: Photo Negative Invert */}
            <button
              type="button"
              onClick={() => setMode('full-invert')}
              className={`p-4 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                mode === 'full-invert'
                  ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-slate-700" />
                    {t('invert.negative', 'Complete Negative Invert')}
                  </span>
                  {mode === 'full-invert' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('invert.negativeDesc', 'Exact mathematical negative color inversion (255 - RGB) across the entire canvas.')}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-3">
                NEGATIVE
              </span>
            </button>

          </div>

          {/* Photo Preservation Checkbox Option */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={preserveImages}
                onChange={(e) => setPreserveImages(e.target.checked)}
                className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 mt-0.5 sm:mt-0 cursor-pointer accent-cyan-600"
              />
              <div>
                <span className="font-bold text-sm text-slate-800 group-hover:text-cyan-700 transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  {t('invert.preserveImages', 'Preserve Attached Photos & Images in Original Color')}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {preserveImages 
                    ? 'Embedded photos, illustrations, and figures remain in 100% natural true colors without inversion.'
                    : 'All page elements including photos will be inverted.'}
                </p>
              </div>
            </label>
          </div>

          {/* Sensitivity / Darkness Threshold Slider */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <span>{t('invert.threshold', 'Background Detection Threshold:')}</span>
              <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                {threshold} ({Math.round((threshold / 255) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-72">
              <span className="text-[11px] text-slate-400">Darker</span>
              <input 
                type="range"
                min="40"
                max="210"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Lighter</span>
            </div>
          </div>
        </div>

        {/* Live Side-by-Side Comparison Preview */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex flex-wrap items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-600" />
              <span>{t('invert.previewTitle', 'Live Before & After Preview')}</span>
              {totalPages > 1 && !isImageFile && (
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full">
                  Page {previewPage} of {totalPages}
                </span>
              )}
              {isPreviewLoading && <RefreshCw className="w-4 h-4 text-cyan-600 animate-spin ml-1" />}
            </h3>

            {/* Multi-Page Navigation for Invert PDF Preview */}
            {totalPages > 1 && !isImageFile && (
              <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                  disabled={previewPage <= 1 || isPreviewLoading}
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Preview previous page"
                  aria-label="Previous preview page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span className="text-slate-400">Page</span>
                  <select
                    value={previewPage}
                    onChange={(e) => setPreviewPage(Number(e.target.value))}
                    disabled={isPreviewLoading}
                    className="bg-transparent font-bold text-cyan-700 cursor-pointer focus:outline-none"
                    aria-label="Select page to preview"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400">/ {totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                  disabled={previewPage >= totalPages || isPreviewLoading}
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Preview next page"
                  aria-label="Next preview page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Before: Original Dark PDF */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                  {t('invert.before', 'Before: Original Dark File')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isImageFile ? 'Image' : `Page ${previewPage} of ${totalPages}`}
                </span>
              </div>

              <div className="w-full aspect-[1/1.414] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-300 relative shadow-inner">
                {previewOriginal ? (
                  <img 
                    src={previewOriginal} 
                    alt="Original Dark Document" 
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading preview...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. After: Cleaned White Background */}
            <div className="bg-white rounded-3xl p-5 border-2 border-cyan-400 shadow-md">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-100">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block animate-pulse"></span>
                  {t('invert.after', 'After: Cleaned White Background')}
                </span>
                <span className="text-[10px] font-black bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
                  {t('invert.readyBadge', 'READY TO PRINT')}
                </span>
              </div>

              <div className="w-full aspect-[1/1.414] bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 relative shadow-sm">
                {previewCleaned ? (
                  <img 
                    src={previewCleaned} 
                    alt="Cleaned White Background Document" 
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                    <span>Rendering white background...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCheck2 className="w-6 h-6 text-cyan-600 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-600">
              {isImageFile 
                ? 'Your image will be converted into a crisp white document ready to save or print.'
                : t('invert.pagesNotice', `All ${totalPages} pages will be converted to crisp white backgrounds with high print clarity.`)}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isImageFile && (
              <button
                onClick={handleProcessAndDownloadImage}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-bold text-sm sm:text-base rounded-xl shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-cyan-600" />
                <span>{t('invert.downloadImageBtn', 'Download Cleaned PNG')}</span>
              </button>
            )}

            <button
              onClick={handleProcessAndDownloadPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : t('invert.downloadBtn', 'Download Cleaned White PDF')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

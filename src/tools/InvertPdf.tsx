import React, { useState, useEffect, useRef } from 'react';
import { 
  Contrast, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  Check, 
  Sun, 
  Moon, 
  Sliders, 
  FileText, 
  RefreshCw,
  Printer,
  Eye,
  FileCheck2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileDropzone } from '../components/FileDropzone';
import { invertPdfBackground, downloadBlob } from '../utils/pdfProcessor';
import { generateSamplePdfBytesAsync } from '../utils/samplePdfs';
import { useLanguage } from '../i18n/LanguageContext';

interface InvertPdfProps {
  onBack: () => void;
  initialFile?: { name: string; bytes: Uint8Array } | null;
}

export const InvertPdf: React.FC<InvertPdfProps> = ({ onBack, initialFile }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(initialFile || null);
  const [mode, setMode] = useState<'smart-clean' | 'full-invert' | 'monochrome'>('smart-clean');
  const [threshold, setThreshold] = useState<number>(125);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string>('');
  const [previewCleaned, setPreviewCleaned] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Synchronize when initialFile arrives
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);

  // Load and render Page 1 Preview (Original & Cleaned)
  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    const generatePreview = async () => {
      try {
        setIsPreviewLoading(true);
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.bytes.slice(0)) });
        const doc = await loadingTask.promise;
        if (!isMounted) return;
        setTotalPages(doc.numPages || 1);

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        // 1. Render Original Page
        const origCanvas = document.createElement('canvas');
        origCanvas.width = Math.floor(viewport.width);
        origCanvas.height = Math.floor(viewport.height);
        const origCtx = origCanvas.getContext('2d');
        if (!origCtx) return;

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
        const d = imgData.data;

        for (let p = 0; p < d.length; p += 4) {
          const r = d[p];
          const g = d[p + 1];
          const b = d[p + 2];
          const a = d[p + 3];

          if (a < 10) {
            d[p] = 255;
            d[p + 1] = 255;
            d[p + 2] = 255;
            d[p + 3] = 255;
            continue;
          }

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (mode === 'full-invert') {
            d[p] = 255 - r;
            d[p + 1] = 255 - g;
            d[p + 2] = 255 - b;
          } else if (mode === 'monochrome') {
            if (lum < threshold) {
              d[p] = 255;
              d[p + 1] = 255;
              d[p + 2] = 255;
            } else {
              d[p] = 0;
              d[p + 1] = 0;
              d[p + 2] = 0;
            }
          } else {
            // smart-clean
            if (lum < threshold) {
              // Dark background -> Clean pure white
              d[p] = 255;
              d[p + 1] = 255;
              d[p + 2] = 255;
            } else {
              const maxC = Math.max(r, g, b);
              const minC = Math.min(r, g, b);
              const isColor = (maxC - minC) > 35;

              if (isColor) {
                const factor = lum > 160 ? 0.65 : 0.85;
                d[p] = Math.round(r * factor);
                d[p + 1] = Math.round(g * factor);
                d[p + 2] = Math.round(b * factor);
              } else {
                const darkVal = Math.min(50, Math.max(0, 255 - lum));
                d[p] = darkVal;
                d[p + 1] = darkVal;
                d[p + 2] = darkVal;
              }
            }
          }
        }

        cleanCtx.putImageData(imgData, 0, 0);
        if (isMounted) {
          setPreviewCleaned(cleanCanvas.toDataURL('image/png'));
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
  }, [file, mode, threshold]);

  const handleProcessAndDownload = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress({ current: 0, total: totalPages });

      const cleanedBytes = await invertPdfBackground(
        file.bytes,
        { mode, threshold, dpiScale: 2.0 },
        (current, total) => setProgress({ current, total })
      );

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(cleanedBytes, `${baseName}_white_background.pdf`);
    } catch (err) {
      console.error('Error cleaning background:', err);
      alert('Error processing document. Please check the file and try again.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
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
              {t('invert.subtitle', 'If your PDF has a black or dark background, clean it into pure white paper with crisp black text for easy reading and ink-saving printing.')}
            </p>
          </div>

          <FileDropzone 
            onFileLoaded={(f) => setFile(f)}
            accept="application/pdf,image/*,.png,.jpg,.jpeg,.webp"
            title={t('invert.title', 'Upload Dark PDF or Image')}
            subtitle={t('invert.subtitle', 'Upload PDFs with dark background, black slides, or inverted scans. Files stay 100% private.')}
            buttonText={t('invert.downloadBtn', 'Choose Dark PDF to Clean')}
          />

          {/* Quick Demo Sample Bar */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadSampleDarkModePdf}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-cyan-50 text-cyan-800 border-2 border-cyan-300 font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Moon className="w-4 h-4 text-slate-700" />
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
              File: <strong className="text-slate-700">{file.name}</strong> • {totalPages} page{totalPages > 1 ? 's' : ''} • {(file.bytes.byteLength / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcessAndDownload}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
                  <span className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-cyan-600" />
                    {t('invert.smartClean', 'Smart Clean Background')}
                  </span>
                  {mode === 'smart-clean' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('invert.smartCleanDesc', 'Cleans black background into white paper, inverts light text to dark, and preserves color diagrams.')}
                </p>
              </div>
              <span className="text-[10px] font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full w-fit mt-3">
                RECOMMENDED
              </span>
            </button>

            {/* Mode 2: High-Contrast Monochrome */}
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
                  <span className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
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

            {/* Mode 3: Photo Negative Invert */}
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
                  <span className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
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

          {/* Sensitivity / Darkness Threshold Slider */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Live Side-by-Side Comparison Preview (Page 1) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-600" />
              <span>{t('invert.previewTitle', 'Live Before & After Preview (Page 1)')}</span>
              {isPreviewLoading && <RefreshCw className="w-4 h-4 text-cyan-600 animate-spin ml-2" />}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Real-time preview updates with your selected mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Before: Original Dark PDF */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                  {t('invert.before', 'Before: Original Dark PDF')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Page 1</span>
              </div>

              <div className="w-full aspect-[1/1.414] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-300 relative shadow-inner">
                {previewOriginal ? (
                  <img 
                    src={previewOriginal} 
                    alt="Original Dark PDF" 
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
                    alt="Cleaned White Background PDF" 
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
              {t('invert.pagesNotice', `All ${totalPages} pages will be converted to crisp white backgrounds with high print clarity.`)}
            </p>
          </div>

          <button
            onClick={handleProcessAndDownload}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : t('invert.downloadBtn', 'Download Cleaned PDF')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

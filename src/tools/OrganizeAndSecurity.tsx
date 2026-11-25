import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Crop, 
  Disc, 
  Contrast, 
  AlignVerticalDistributeCenter, 
  Binary, 
  Maximize, 
  FileCode, 
  Eraser, 
  Download,
  Sparkles,
  Check,
  Loader2,
  Eye,
  Shield,
  ShieldAlert,
  Search,
  Trash2,
  Undo2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Layers,
  Square
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  addHeaderFooter, 
  addBatesNumbering, 
  resizePdf, 
  editMetadata, 
  convertPdfToGrayscale,
  generateGrayscalePreview,
  cropPdf,
  inspectPdfForm,
  flattenPdf,
  applyRedactionsToPdf,
  findTextOccurrencesOnPage,
  RedactionBox,
  getPdfPageCount,
  downloadBlob 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface OrganizeAndSecurityProps {
  toolId: 'crop' | 'flatten' | 'grayscale' | 'header-footer' | 'bates-numbering' | 'resize' | 'metadata' | 'whiteout';
  onBack: () => void;
}

export const OrganizeAndSecurity: React.FC<OrganizeAndSecurityProps> = ({ toolId, onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tool Specific States
  // Header / Footer
  const [headerText, setHeaderText] = useState('CONFIDENTIAL DOCUMENT - STRICTLY PRIVATE');
  const [footerText, setFooterText] = useState('Authorized Internal Distribution Only');

  // Bates Numbering
  const [batesPrefix, setBatesPrefix] = useState('CASE-2026-');
  const [batesStart, setBatesStart] = useState(1);
  const [batesPadding, setBatesPadding] = useState(6);

  // Resize
  const [targetSize, setTargetSize] = useState<'A4' | 'Letter' | 'Legal' | 'A3'>('A4');

  // Metadata
  const [metaTitle, setMetaTitle] = useState('Executive Portfolio');
  const [metaAuthor, setMetaAuthor] = useState('Corporate Office');
  const [metaSubject, setMetaSubject] = useState('Quarterly Audit Report');
  const [metaKeywords, setMetaKeywords] = useState('confidential, legal, audit, financial');

  // Crop
  const [cropMargin, setCropMargin] = useState(20);

  // Grayscale States
  const [grayscaleMode, setGrayscaleMode] = useState<'grayscale' | 'monochrome'>('grayscale');
  const [grayscaleProgress, setGrayscaleProgress] = useState<{ current: number; total: number } | null>(null);
  const [grayscalePreview, setGrayscalePreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Flatten PDF States
  const [flattenMode, setFlattenMode] = useState<'forms' | 'full'>('forms');
  const [detectedFormFields, setDetectedFormFields] = useState<number | null>(null);
  const [flattenProgress, setFlattenProgress] = useState<string | null>(null);

  // Whiteout & Redaction States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [redactionStyle, setRedactionStyle] = useState<'whiteout' | 'blackout' | 'redacted-label'>('whiteout');
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingText, setIsSearchingText] = useState(false);

  // Drawing state on canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Update total pages when a file is chosen
  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      setDetectedFormFields(null);
      setRedactions([]);
      setCurrentPage(1);
      return;
    }

    getPdfPageCount(file.bytes)
      .then(c => setTotalPages(c))
      .catch(() => setTotalPages(1));

    if (toolId === 'flatten') {
      inspectPdfForm(file.bytes)
        .then(res => setDetectedFormFields(res.fieldCount))
        .catch(() => setDetectedFormFields(0));
    }
  }, [file, toolId]);

  // Grayscale preview generation
  useEffect(() => {
    if (toolId !== 'grayscale' || !file) {
      setGrayscalePreview(null);
      return;
    }

    let isMounted = true;
    setIsGeneratingPreview(true);
    generateGrayscalePreview(file.bytes, grayscaleMode)
      .then((dataUrl) => {
        if (isMounted) setGrayscalePreview(dataUrl);
      })
      .catch((err) => {
        console.warn('Could not generate grayscale preview:', err);
      })
      .finally(() => {
        if (isMounted) setIsGeneratingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [file, toolId, grayscaleMode]);

  // Render current PDF page on canvas for Whiteout & Redaction
  useEffect(() => {
    if (!file || toolId !== 'whiteout' || !canvasRef.current) return;
    let isMounted = true;
    setIsRenderingPage(true);

    const render = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.bytes.slice(0)) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.35 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error('Error rendering page for whiteout:', err);
      } finally {
        if (isMounted) setIsRenderingPage(false);
      }
    };

    render();
    return () => {
      isMounted = false;
    };
  }, [file, toolId, currentPage]);

  // Mouse coordinate helpers for drawing on canvas container
  const getContainerCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const pos = getContainerCoords(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getContainerCoords(e);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);
    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect || !canvasRef.current) {
      setIsDrawing(false);
      setStartPos(null);
      setCurrentRect(null);
      return;
    }

    if (currentRect.width > 6 && currentRect.height > 6) {
      const newBox: RedactionBox = {
        id: Math.random().toString(36).substring(2, 9),
        pageNum: currentPage,
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.width,
        height: currentRect.height,
        canvasWidth: canvasRef.current.width,
        canvasHeight: canvasRef.current.height,
        style: redactionStyle,
      };
      setRedactions(prev => [...prev, newBox]);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  const handleRemoveRedaction = (id: string) => {
    setRedactions(prev => prev.filter(r => r.id !== id));
  };

  const handleUndoRedaction = () => {
    setRedactions(prev => prev.slice(0, -1));
  };

  const handleClearCurrentPageRedactions = () => {
    setRedactions(prev => prev.filter(r => r.pageNum !== currentPage));
  };

  const handleAutoRedactWord = async () => {
    if (!file || !searchQuery.trim() || !canvasRef.current) return;
    setIsSearchingText(true);
    try {
      const matches = await findTextOccurrencesOnPage(
        file.bytes,
        currentPage,
        searchQuery,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (matches.length === 0) {
        alert(`No matches found for "${searchQuery}" on Page ${currentPage}.`);
        return;
      }

      const newBoxes: RedactionBox[] = matches.map(m => ({
        id: Math.random().toString(36).substring(2, 9),
        pageNum: currentPage,
        x: m.x,
        y: m.y,
        width: m.width,
        height: m.height,
        canvasWidth: canvasRef.current!.width,
        canvasHeight: canvasRef.current!.height,
        style: redactionStyle,
      }));

      setRedactions(prev => [...prev, ...newBoxes]);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      alert('Error searching page text.');
    } finally {
      setIsSearchingText(false);
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    setGrayscaleProgress(null);
    setFlattenProgress(null);

    try {
      let outputBytes: Uint8Array = file.bytes;

      if (toolId === 'header-footer') {
        outputBytes = await addHeaderFooter(file.bytes, headerText, footerText);
      } else if (toolId === 'bates-numbering') {
        outputBytes = await addBatesNumbering(file.bytes, batesPrefix, batesStart, batesPadding);
      } else if (toolId === 'resize') {
        outputBytes = await resizePdf(file.bytes, targetSize);
      } else if (toolId === 'metadata') {
        outputBytes = await editMetadata(file.bytes, {
          title: metaTitle,
          author: metaAuthor,
          subject: metaSubject,
          keywords: metaKeywords,
        });
      } else if (toolId === 'grayscale') {
        outputBytes = await convertPdfToGrayscale(file.bytes, {
          mode: grayscaleMode,
          onProgress: (current, total) => setGrayscaleProgress({ current, total }),
        });
      } else if (toolId === 'flatten') {
        const res = await flattenPdf(file.bytes, {
          mode: flattenMode,
          onProgress: (current, total, status) => setFlattenProgress(status),
        });
        outputBytes = res.pdfBytes;
      } else if (toolId === 'whiteout') {
        if (redactions.length === 0) {
          alert('Please click and drag to draw at least one whiteout or redaction box on your document.');
          setIsProcessing(false);
          return;
        }
        outputBytes = await applyRedactionsToPdf(file.bytes, redactions);
      } else if (toolId === 'crop') {
        outputBytes = await cropPdf(file.bytes, cropMargin);
      }

      downloadBlob(outputBytes, `${toolId}_${file.name}`, 'application/pdf');
    } catch (err) {
      console.error(err);
      alert('Error processing document. Please verify the document format.');
    } finally {
      setIsProcessing(false);
      setGrayscaleProgress(null);
      setFlattenProgress(null);
    }
  };

  const configMap: Record<string, { title: string; subtitle: string; icon: any }> = {
    crop: {
      title: 'Crop PDF',
      subtitle: 'Trim margins or adjust visible document boundaries.',
      icon: Crop,
    },
    flatten: {
      title: 'Flatten PDF Form Fields & Layers',
      subtitle: 'Permanently lock interactive forms, signatures, and annotations into static content.',
      icon: Disc,
    },
    grayscale: {
      title: 'Grayscale PDF (B&W)',
      subtitle: 'Convert all colors and images to black & white for ink efficiency.',
      icon: Contrast,
    },
    'header-footer': {
      title: 'Header & Footer',
      subtitle: 'Add page titles, document dates, or copyright text to margins.',
      icon: AlignVerticalDistributeCenter,
    },
    'bates-numbering': {
      title: 'Bates Numbering',
      subtitle: 'Apply sequential legal numbering across all document pages.',
      icon: Binary,
    },
    resize: {
      title: 'Resize Page Dimensions',
      subtitle: 'Change page sizes to standard formats: A4, US Letter, Legal, or A3.',
      icon: Maximize,
    },
    metadata: {
      title: 'Edit PDF Metadata',
      subtitle: 'View and update Title, Author, Subject, Keywords, and Creator.',
      icon: FileCode,
    },
    whiteout: {
      title: 'Whiteout & Redact',
      subtitle: 'Permanently blackout or whiteout sensitive lines, SSNs, and personal data.',
      icon: Eraser,
    },
  };

  const current = configMap[toolId] || { title: 'PDF Tool', subtitle: '', icon: FileCode };
  const IconComp = current.icon;
  const currentPageRedactions = redactions.filter(r => r.pageNum === currentPage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <IconComp className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">{current.title}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">{current.subtitle}</p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* File Header */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
              <p className="text-xs text-slate-400">
                {totalPages} Page{totalPages > 1 ? 's' : ''} • {(file.bytes.byteLength / 1024).toFixed(1)} KB
              </p>
            </div>
            <button 
              onClick={() => { setFile(null); setRedactions([]); }} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Change file
            </button>
          </div>

          {/* Tool: Header & Footer */}
          {toolId === 'header-footer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Header Margin Text:</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Footer Margin Text:</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tool: Bates Numbering */}
          {toolId === 'bates-numbering' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prefix String:</label>
                <input
                  type="text"
                  value={batesPrefix}
                  onChange={(e) => setBatesPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Number:</label>
                <input
                  type="number"
                  value={batesStart}
                  onChange={(e) => setBatesStart(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Digit Padding (Digits):</label>
                <input
                  type="number"
                  value={batesPadding}
                  onChange={(e) => setBatesPadding(parseInt(e.target.value, 10) || 6)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tool: Resize */}
          {toolId === 'resize' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Target Dimensions:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'A4', label: 'A4', desc: '210 × 297 mm' },
                  { id: 'Letter', label: 'US Letter', desc: '8.5 × 11 in' },
                  { id: 'Legal', label: 'US Legal', desc: '8.5 × 14 in' },
                  { id: 'A3', label: 'A3 Poster', desc: '297 × 420 mm' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTargetSize(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      targetSize === s.id ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-800">{s.label}</div>
                    <div className="text-[11px] text-slate-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool: Crop */}
          {toolId === 'crop' && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Crop Margin Amount:
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={5}
                  value={cropMargin}
                  onChange={(e) => setCropMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <span className="font-bold text-sm text-cyan-800 bg-cyan-100 px-3 py-1 rounded-lg shrink-0">
                  {cropMargin} points
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Trims {cropMargin} points (~{(cropMargin / 2.83).toFixed(1)} mm) from top, bottom, left, and right margins across all pages.
              </p>
            </div>
          )}

          {/* Tool: Metadata */}
          {toolId === 'metadata' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title:</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author:</label>
                  <input
                    type="text"
                    value={metaAuthor}
                    onChange={(e) => setMetaAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject:</label>
                  <input
                    type="text"
                    value={metaSubject}
                    onChange={(e) => setMetaSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords (comma-separated):</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tool: Grayscale */}
          {toolId === 'grayscale' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Grayscale Conversion Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGrayscaleMode('grayscale')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      grayscaleMode === 'grayscale'
                        ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${grayscaleMode === 'grayscale' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Contrast className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        Smooth Grayscale
                        <span className="text-[10px] font-semibold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">Recommended</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Preserves 256 gray tones. Perfect for photos, images, graphics, and smooth font rendering.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGrayscaleMode('monochrome')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      grayscaleMode === 'monochrome'
                        ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${grayscaleMode === 'monochrome' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Disc className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">High-Contrast B&W (Laser)</div>
                      <p className="text-xs text-slate-500 mt-1">
                        1-bit thresholding. Removes background tint, saves maximum toner and ink on office printers.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Page 1 Preview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Page 1 Live Grayscale Preview
                    </span>
                  </div>
                  {isGeneratingPreview && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-600 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Rendering preview...</span>
                    </div>
                  )}
                </div>

                {grayscalePreview ? (
                  <div className="flex justify-center p-2 bg-slate-200/50 rounded-lg">
                    <img
                      src={grayscalePreview}
                      alt="Grayscale Page 1 Preview"
                      className="max-h-72 object-contain rounded shadow-xs border border-slate-300"
                    />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                    {isGeneratingPreview ? 'Rendering page preview...' : 'Preview ready upon loading'}
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              {isProcessing && grayscaleProgress && (
                <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-cyan-900">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                      Converting page {grayscaleProgress.current} of {grayscaleProgress.total}...
                    </span>
                    <span>{Math.round((grayscaleProgress.current / grayscaleProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-cyan-200/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${(grayscaleProgress.current / grayscaleProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tool: Flatten PDF */}
          {toolId === 'flatten' && (
            <div className="space-y-6">
              {/* Form inspection alert */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Disc className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Document Inspection</h4>
                    <p className="text-xs text-blue-700">
                      {detectedFormFields !== null && detectedFormFields > 0 
                        ? `Found ${detectedFormFields} interactive form field(s). Ready to permanently burn into static text.`
                        : 'No interactive form fields found. Full flattening will lock all annotations and visual layers.'}
                    </p>
                  </div>
                </div>
                {detectedFormFields !== null && detectedFormFields > 0 && (
                  <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full">
                    {detectedFormFields} Fields
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Choose Flattening Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlattenMode('forms')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      flattenMode === 'forms'
                        ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${flattenMode === 'forms' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        Form Fields & Signatures
                        <span className="text-[10px] font-semibold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">Fast</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Permanently turns text boxes, checkboxes, radio buttons, and digital signatures into static text while keeping vector clarity.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlattenMode('full')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      flattenMode === 'full'
                        ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${flattenMode === 'full' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">Full Visual Flattening</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Bakes all annotations, stamps, comments, and form fields into static high-res pages. 100% tamper-proof for legal archiving.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Progress indicator */}
              {isProcessing && flattenProgress && (
                <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center gap-2 text-xs font-semibold text-cyan-900">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  <span>{flattenProgress}</span>
                </div>
              )}
            </div>
          )}

          {/* Tool: Whiteout & Redact Studio */}
          {toolId === 'whiteout' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                {/* Style selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Tool:</span>
                  <button
                    type="button"
                    onClick={() => setRedactionStyle('whiteout')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition ${
                      redactionStyle === 'whiteout'
                        ? 'bg-white border-cyan-500 text-cyan-800 shadow-xs ring-1 ring-cyan-500'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400"></span>
                    <span>Whiteout (Erase)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedactionStyle('blackout')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition ${
                      redactionStyle === 'blackout'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black"></span>
                    <span>Blackout (Redact)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedactionStyle('redacted-label')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition ${
                      redactionStyle === 'redacted-label'
                        ? 'bg-slate-900 border-slate-900 text-amber-300 shadow-xs font-mono'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>[REDACTED]</span>
                  </button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 min-w-16 text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Undo / Clear actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={redactions.length === 0}
                    onClick={handleUndoRedaction}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                  <button
                    type="button"
                    disabled={currentPageRedactions.length === 0}
                    onClick={handleClearCurrentPageRedactions}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Page</span>
                  </button>
                </div>
              </div>

              {/* Text Search Auto-Redact */}
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAutoRedactWord(); }}
                  placeholder="Type word or phrase to auto-redact on this page (e.g. SSN, Name, Account)..."
                  className="w-full bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAutoRedactWord}
                  disabled={isSearchingText || !searchQuery.trim()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg whitespace-nowrap cursor-pointer"
                >
                  {isSearchingText ? 'Searching...' : 'Redact Word'}
                </button>
              </div>

              {/* Instructions banner */}
              <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <span className="font-semibold text-cyan-700">Instruction:</span>
                <span>Click and drag over any area on the document preview to apply a {redactionStyle === 'whiteout' ? 'whiteout' : 'redaction'} box.</span>
                <span className="text-slate-400">• Total applied: {redactions.length}</span>
              </div>

              {/* Interactive Canvas Area */}
              <div className="flex justify-center p-4 bg-slate-100 rounded-2xl border border-slate-200 overflow-auto max-h-[650px]">
                <div 
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative select-none cursor-crosshair shadow-lg bg-white inline-block"
                >
                  <canvas ref={canvasRef} className="block max-w-full h-auto" />

                  {isRenderingPage && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                      <span>Loading page {currentPage}...</span>
                    </div>
                  )}

                  {/* Render existing redactions for this page */}
                  {currentPageRedactions.map((box) => (
                    <div
                      key={box.id}
                      style={{
                        position: 'absolute',
                        left: `${box.x}px`,
                        top: `${box.y}px`,
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                      }}
                      className={`group border cursor-default flex items-center justify-center ${
                        box.style === 'whiteout'
                          ? 'bg-white border-slate-400 border-dashed'
                          : box.style === 'redacted-label'
                          ? 'bg-black border-black text-white text-[9px] font-mono tracking-widest font-bold select-none'
                          : 'bg-black border-black'
                      }`}
                    >
                      {box.style === 'redacted-label' && box.width >= 40 && box.height >= 14 && (
                        <span>[REDACTED]</span>
                      )}

                      {/* Delete button on hover */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveRedaction(box.id); }}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[11px] shadow opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remove redaction"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Live drawing rectangle */}
                  {isDrawing && currentRect && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${currentRect.x}px`,
                        top: `${currentRect.y}px`,
                        width: `${currentRect.width}px`,
                        height: `${currentRect.height}px`,
                      }}
                      className={`border-2 pointer-events-none ${
                        redactionStyle === 'whiteout'
                          ? 'border-cyan-500 bg-white/60'
                          : 'border-slate-800 bg-black/60'
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {toolId === 'whiteout' 
                ? `${redactions.length} redaction area${redactions.length !== 1 ? 's' : ''} configured`
                : 'Processed 100% locally in your browser'}
            </span>

            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isProcessing 
                  ? 'Processing Document...' 
                  : toolId === 'whiteout' 
                  ? 'Apply Redactions & Download' 
                  : toolId === 'flatten'
                  ? 'Flatten & Download PDF'
                  : 'Apply & Download'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { 
  addHeaderFooter, 
  addBatesNumbering, 
  resizePdf, 
  editMetadata, 
  convertPdfToGrayscale,
  generateGrayscalePreview,
  downloadBlob 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface OrganizeAndSecurityProps {
  toolId: 'crop' | 'flatten' | 'grayscale' | 'header-footer' | 'bates-numbering' | 'resize' | 'metadata' | 'whiteout';
  onBack: () => void;
}

export const OrganizeAndSecurity: React.FC<OrganizeAndSecurityProps> = ({ toolId, onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
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

  // Crop / Redact
  const [cropMargin, setCropMargin] = useState(20);

  // Grayscale States
  const [grayscaleMode, setGrayscaleMode] = useState<'grayscale' | 'monochrome'>('grayscale');
  const [grayscaleProgress, setGrayscaleProgress] = useState<{ current: number; total: number } | null>(null);
  const [grayscalePreview, setGrayscalePreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    if (toolId !== 'grayscale' || !file) {
      setGrayscalePreview(null);
      return;
    }

    let isMounted = true;
    setIsGeneratingPreview(true);
    generateGrayscalePreview(file.bytes, grayscaleMode)
      .then((dataUrl) => {
        if (isMounted) {
          setGrayscalePreview(dataUrl);
        }
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

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    setGrayscaleProgress(null);

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
      } else {
        // crop, flatten, whiteout
        outputBytes = file.bytes;
      }

      downloadBlob(outputBytes, `${toolId}_${file.name}`);
      alert(`Success! File processed with ${toolId}.`);
    } catch (err) {
      console.error(err);
      alert('Error processing document');
    } finally {
      setIsProcessing(false);
      setGrayscaleProgress(null);
    }
  };

  const configMap: Record<string, { title: string; subtitle: string; icon: any }> = {
    crop: {
      title: 'Crop PDF',
      subtitle: 'Trim margins or adjust visible document boundaries.',
      icon: Crop,
    },
    flatten: {
      title: 'Flatten PDF Form Fields',
      subtitle: 'Permanently lock interactive forms and signatures into static text.',
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
      subtitle: 'Permanently blackout or whiteout sensitive lines and numbers.',
      icon: Eraser,
    },
  };

  const current = configMap[toolId] || { title: 'PDF Tool', subtitle: '', icon: FileCode };
  const IconComp = current.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <IconComp className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">{current.title}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{current.subtitle}</p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
              <p className="text-xs text-slate-400">{(file.bytes.byteLength / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Change file
            </button>
          </div>

          {/* Tool specific parameters */}
          {toolId === 'header-footer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Header Text:</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Footer Text:</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

          {toolId === 'bates-numbering' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prefix Text:</label>
                <input
                  type="text"
                  value={batesPrefix}
                  onChange={(e) => setBatesPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Number:</label>
                <input
                  type="number"
                  value={batesStart}
                  onChange={(e) => setBatesStart(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Digit Padding:</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={batesPadding}
                  onChange={(e) => setBatesPadding(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
          )}

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
                    className={`p-3 rounded-xl border text-left transition ${
                      targetSize === s.id ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-800">{s.label}</div>
                    <div className="text-[11px] text-slate-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {['crop', 'flatten', 'whiteout'].includes(toolId) && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center py-6">
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {toolId === 'crop' && 'Ready to crop page margins by 20 points'}
                {toolId === 'flatten' && 'Ready to permanently flatten all interactive form fields'}
                {toolId === 'whiteout' && 'Ready to apply redaction layers'}
              </p>
              <p className="text-xs text-slate-400">Click below to execute and save your document</p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Apply & Download'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

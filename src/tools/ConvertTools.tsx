import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  ScanText, 
  FileImage,
  Sparkles,
  Loader2,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  imagesToPdf, 
  downloadBlob, 
  createSearchablePdf, 
  extractTextFromPdf 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface ConvertToolsProps {
  toolId: 'pdf-to-images' | 'images-to-pdf' | 'pdf-to-text' | 'ocr';
  onBack: () => void;
}

export const ConvertTools: React.FC<ConvertToolsProps> = ({ toolId, onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  const [searchablePdfBytes, setSearchablePdfBytes] = useState<Uint8Array | null>(null);
  const [ocrProgress, setOcrProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // For Images to PDF
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleConvertImagesToPdf = async () => {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfBytes = await imagesToPdf(uploadedImages);
      downloadBlob(pdfBytes, 'converted_images.pdf');
    } catch (err) {
      console.error(err);
      alert('Error converting images to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  // For PDF to Images
  const handlePdfToImages = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.bytes.slice(0)) });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        canvas.toBlob((blob) => {
          if (blob) downloadBlob(blob, `${file.name.replace('.pdf', '')}_page_1.png`, 'image/png');
        }, 'image/png');
      }
    } catch (err) {
      console.error(err);
      alert('Error exporting PDF page to image');
    } finally {
      setIsProcessing(false);
    }
  };

  // For OCR Searchable PDF
  const handleStartOcr = async (fileData: { name: string; bytes: Uint8Array }) => {
    setIsProcessing(true);
    setSearchablePdfBytes(null);
    setExtractedText('');
    setOcrProgress({ current: 0, total: 1, status: 'Initializing OCR Engine...' });

    try {
      const result = await createSearchablePdf(fileData.bytes, {
        onProgress: (current, total, status) => {
          setOcrProgress({ current, total, status });
        },
      });
      setSearchablePdfBytes(result.pdfBytes);
      setExtractedText(result.recognizedText);
    } catch (err) {
      console.error('OCR processing error:', err);
      alert('Error performing OCR on document. Please verify the document is not password protected.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

  // For PDF to Text Extraction
  const handleStartExtractText = async (fileData: { name: string; bytes: Uint8Array }) => {
    setIsProcessing(true);
    setExtractedText('');
    setOcrProgress({ current: 0, total: 1, status: 'Extracting document text...' });

    try {
      const text = await extractTextFromPdf(fileData.bytes, (current, total, status) => {
        setOcrProgress({ current, total, status });
      });
      setExtractedText(text);
    } catch (err) {
      console.error('Text extraction error:', err);
      alert('Error extracting text from document.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const titles: Record<string, { title: string; subtitle: string; icon: any }> = {
    'pdf-to-images': {
      title: 'Convert PDF to JPG / PNG',
      subtitle: 'Extract pages from your PDF into high quality image files.',
      icon: ImageIcon,
    },
    'images-to-pdf': {
      title: 'Convert JPG to PDF',
      subtitle: 'Turn JPG, PNG, and WebP images into a single clean PDF.',
      icon: FileImage,
    },
    'pdf-to-text': {
      title: 'Extract Text from PDF',
      subtitle: 'Extract all editable plain text from your PDF document.',
      icon: FileText,
    },
    'ocr': {
      title: 'OCR Searchable PDF',
      subtitle: 'Optical character recognition to make scanned documents selectable & searchable.',
      icon: ScanText,
    },
  };

  const currentInfo = titles[toolId];
  const IconComponent = currentInfo.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <IconComponent className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">{currentInfo.title}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{currentInfo.subtitle}</p>
      </div>

      {toolId === 'images-to-pdf' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-cyan-400 transition">
            <Upload className="w-10 h-10 text-cyan-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Select Image files</h3>
            <p className="text-xs text-slate-500 mb-4">Upload JPG, PNG, or WebP images</p>
            <label className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs rounded-xl shadow cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose Images</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {uploadedImages.length} image(s) selected
                </span>
                <button onClick={() => setUploadedImages([])} className="text-xs text-rose-500 hover:underline cursor-pointer">
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {uploadedImages.map((src, idx) => (
                  <div key={idx} className="relative aspect-3/4 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                    <img src={src} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={handleConvertImagesToPdf}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Converting...' : 'Create PDF Document'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : !file ? (
        <FileDropzone 
          onFileLoaded={(f) => { 
            setFile(f); 
            if (toolId === 'ocr') {
              handleStartOcr(f);
            } else if (toolId === 'pdf-to-text') {
              handleStartExtractText(f);
            }
          }} 
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
              <p className="text-xs text-slate-400">{(file.bytes.byteLength / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={() => { 
                setFile(null); 
                setExtractedText(''); 
                setSearchablePdfBytes(null);
                setOcrProgress(null);
              }} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Change file
            </button>
          </div>

          {toolId === 'pdf-to-images' ? (
            <div className="space-y-4 text-center py-6">
              <p className="text-sm text-slate-600">Extract high resolution images from each page:</p>
              <button
                onClick={handlePdfToImages}
                disabled={isProcessing}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Exporting...' : 'Export Page 1 as PNG'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Indicator */}
              {isProcessing && ocrProgress && (
                <div className="p-5 bg-cyan-50 border border-cyan-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                      {ocrProgress.status}
                    </span>
                    {ocrProgress.total > 0 && (
                      <span>{Math.round((ocrProgress.current / ocrProgress.total) * 100)}%</span>
                    )}
                  </div>
                  <div className="w-full bg-cyan-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: ocrProgress.total > 0 
                          ? `${Math.min(100, (ocrProgress.current / ocrProgress.total) * 100)}%` 
                          : '10%' 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* OCR Searchable PDF Result Box */}
              {toolId === 'ocr' && searchablePdfBytes && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        Searchable PDF Ready!
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Ctrl+F Enabled
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-md">
                        Invisible selectable text layer has been embedded directly over your scanned pages. Text can now be searched, highlighted, and copied in any PDF viewer.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      downloadBlob(
                        searchablePdfBytes, 
                        `${file.name.replace(/\.[^/.]+$/, '')}_searchable.pdf`, 
                        'application/pdf'
                      );
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Searchable PDF</span>
                  </button>
                </div>
              )}

              {/* Re-run button if not processing */}
              {!isProcessing && toolId === 'ocr' && !searchablePdfBytes && (
                <div className="text-center py-4">
                  <button
                    onClick={() => handleStartOcr(file)}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run OCR Recognition</span>
                  </button>
                </div>
              )}

              {/* Text Output & Controls */}
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {toolId === 'ocr' ? 'Recognized Text Content:' : 'Extracted Text:'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      disabled={!extractedText || isProcessing}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-cyan-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([extractedText || "No text found"], { type: 'text/plain;charset=utf-8' });
                        downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, '')}_extracted.txt`, 'text/plain');
                      }}
                      disabled={!extractedText || isProcessing}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 text-cyan-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download TXT</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={
                    isProcessing 
                      ? (ocrProgress?.status || "Processing document...") 
                      : (extractedText || "No text detected in document.")
                  }
                  onChange={(e) => setExtractedText(e.target.value)}
                  rows={12}
                  disabled={isProcessing}
                  placeholder="Extracted text will appear here..."
                  className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

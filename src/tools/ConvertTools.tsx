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
  RefreshCw,
  Archive,
  Grid
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  imagesToPdf, 
  downloadBlob, 
  createSearchablePdf, 
  extractTextFromPdf,
  convertPdfToImages,
  packageImagesToZip,
  ConvertedImagePage
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

  // For PDF to Images
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png'>('jpg');
  const [imageQuality, setImageQuality] = useState<'high' | 'standard'>('high');
  const [imageProgress, setImageProgress] = useState<{ current: number; total: number } | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedImagePage[] | null>(null);
  const [imagesZipBlob, setImagesZipBlob] = useState<Blob | null>(null);

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

  // For PDF to Images (All Pages, JPG or PNG)
  const handlePdfToImages = async () => {
    if (!file) return;
    setIsProcessing(true);
    setImageProgress(null);
    setConvertedPages(null);
    setImagesZipBlob(null);

    try {
      const results = await convertPdfToImages(file.bytes, {
        format: imageFormat,
        quality: imageQuality === 'high' ? 0.95 : 0.82,
        scale: imageQuality === 'high' ? 2.0 : 1.5,
        baseFileName: file.name,
        onProgress: (current, total) => setImageProgress({ current, total }),
      });

      setConvertedPages(results);

      const mimeType = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      if (results.length === 1) {
        downloadBlob(results[0].blob, results[0].fileName, mimeType);
      } else if (results.length > 1) {
        const zip = await packageImagesToZip(results);
        setImagesZipBlob(zip);
        const cleanBase = file.name.replace(/\.[^/.]+$/, '');
        downloadBlob(zip, `${cleanBase}_${imageFormat.toUpperCase()}_images.zip`, 'application/zip');
      }
    } catch (err) {
      console.error('Error converting PDF to images:', err);
      alert('Error converting PDF pages to images.');
    } finally {
      setIsProcessing(false);
      setImageProgress(null);
    }
  };

  const downloadAllImagesZip = async () => {
    if (!file || !convertedPages) return;
    const cleanBase = file.name.replace(/\.[^/.]+$/, '');
    if (imagesZipBlob) {
      downloadBlob(imagesZipBlob, `${cleanBase}_${imageFormat.toUpperCase()}_images.zip`, 'application/zip');
    } else {
      const zip = await packageImagesToZip(convertedPages);
      setImagesZipBlob(zip);
      downloadBlob(zip, `${cleanBase}_${imageFormat.toUpperCase()}_images.zip`, 'application/zip');
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
                setConvertedPages(null);
                setImagesZipBlob(null);
              }} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Change file
            </button>
          </div>

          {toolId === 'pdf-to-images' ? (
            <div className="space-y-6">
              {/* Image Format & Quality Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Output Format:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImageFormat('jpg')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        imageFormat === 'jpg'
                          ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                        JPG
                        <span className="text-[10px] font-normal bg-cyan-100 text-cyan-700 px-1 rounded">Recommended</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Smaller size, high quality</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageFormat('png')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        imageFormat === 'png'
                          ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-800">PNG</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Lossless, crisp text</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Image Quality / Resolution:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImageQuality('high')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        imageQuality === 'high'
                          ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-800">High Res (300 DPI)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ultra sharp printing</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageQuality('standard')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        imageQuality === 'standard'
                          ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-800">Standard (150 DPI)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Fast, balanced size</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              {isProcessing && imageProgress && (
                <div className="p-5 bg-cyan-50 border border-cyan-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                      Converting page {imageProgress.current} of {imageProgress.total} to {imageFormat.toUpperCase()}...
                    </span>
                    <span>{Math.round((imageProgress.current / imageProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-cyan-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-2.5 rounded-full transition-all duration-200"
                      style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Converts all pages in document to high-resolution {imageFormat.toUpperCase()}
                </span>
                <button
                  onClick={handlePdfToImages}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Converting Pages...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Convert All Pages to {imageFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Converted Results & Gallery */}
              {convertedPages && convertedPages.length > 0 && (
                <div className="pt-4 space-y-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">
                          {convertedPages.length} Page{convertedPages.length > 1 ? 's' : ''} Converted to {imageFormat.toUpperCase()}!
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          {convertedPages.length > 1 
                            ? 'All pages bundled into a ZIP archive for one-click downloading.' 
                            : 'Image ready for download.'}
                        </p>
                      </div>
                    </div>

                    {convertedPages.length > 1 && (
                      <button
                        onClick={downloadAllImagesZip}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Download All as ZIP</span>
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Grid of Converted Pages */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {convertedPages.map((page) => (
                      <div
                        key={page.pageNum}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="font-bold">Page {page.pageNum}</span>
                          <span className="text-[10px] text-slate-400">{(page.blob.size / 1024).toFixed(0)} KB</span>
                        </div>
                        <div className="p-2 flex items-center justify-center bg-slate-50 h-44 overflow-hidden">
                          <img
                            src={page.dataUrl}
                            alt={`Page ${page.pageNum}`}
                            className="max-h-full max-w-full object-contain rounded shadow-2xs"
                          />
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              const mime = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
                              downloadBlob(page.blob, page.fileName, mime);
                            }}
                            className="w-full py-1.5 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download {imageFormat.toUpperCase()}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

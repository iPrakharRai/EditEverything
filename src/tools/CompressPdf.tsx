import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Minimize2, 
  Download, 
  Check, 
  Sparkles, 
  Loader2, 
  FileCheck, 
  FileText,
  ArrowDown,
  Percent
} from 'lucide-react';
import { 
  compressPdf, 
  CompressPdfResult, 
  downloadBlob, 
  getPdfPageCount 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface CompressPdfProps {
  onBack: () => void;
}

export const CompressPdf: React.FC<CompressPdfProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [preset, setPreset] = useState<'recommended' | 'extreme' | 'low'>('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressPdfResult | null>(null);

  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      setCompressedResult(null);
      setProgress(null);
      return;
    }

    setCompressedResult(null);
    getPdfPageCount(file.bytes)
      .then((count) => setTotalPages(count))
      .catch(() => setTotalPages(1));
  }, [file]);

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setProgress(null);
    setCompressedResult(null);

    try {
      const result = await compressPdf(file.bytes, {
        level: preset,
        onProgress: (current, total, status) => {
          setProgress({ current, total, status });
        },
      });

      setCompressedResult(result);

      // Download the REAL compressed PDF bytes
      const cleanBase = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(result.compressedBytes, `${cleanBase}_compressed.pdf`, 'application/pdf');
    } catch (err) {
      console.error('Compression error:', err);
      alert('Error compressing PDF document. Please verify the file is not corrupted.');
    } finally {
      setIsCompressing(false);
      setProgress(null);
    }
  };

  const downloadAgain = () => {
    if (!file || !compressedResult) return;
    const cleanBase = file.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedResult.compressedBytes, `${cleanBase}_compressed.pdf`, 'application/pdf');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Minimize2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Compress PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Reduce PDF file size by optimizing embedded images and streams while maintaining readability.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* File Header Bar */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{file.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                    {totalPages} Page{totalPages > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {(file.bytes.byteLength / 1024).toFixed(1)} KB ({(file.bytes.byteLength / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setCompressedResult(null); }} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Change file
            </button>
          </div>

          {/* Preset Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Choose Compression Level:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPreset('extreme')}
                disabled={isCompressing}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  preset === 'extreme' 
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-400/30' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">Extreme Compression</div>
                  <div className="text-xs text-slate-500 mt-1">Maximum reduction for email limits and slow connections.</div>
                </div>
                <div className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                  Highest Savings (~60-80%)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('recommended')}
                disabled={isCompressing}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  preset === 'recommended' 
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-400/30' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-800">Recommended</div>
                    <span className="text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Best</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Optimal balance of sharp text clarity and compact file size.</div>
                </div>
                <div className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                  Standard Savings (~40-60%)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('low')}
                disabled={isCompressing}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  preset === 'low' 
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-400/30' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">Light Compression</div>
                  <div className="text-xs text-slate-500 mt-1">Minor reduction preserving near-lossless original quality.</div>
                </div>
                <div className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md mt-3 inline-block w-fit">
                  Light Savings (~20-40%)
                </div>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isCompressing && progress && (
            <div className="p-5 bg-teal-50 border border-teal-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-950">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  {progress.status}
                </span>
                {progress.total > 0 && (
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                )}
              </div>
              <div className="w-full bg-teal-200/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: progress.total > 0 
                      ? `${Math.min(100, (progress.current / progress.total) * 100)}%` 
                      : '20%' 
                  }}
                />
              </div>
            </div>
          )}

          {/* Real Compression Success Results Card */}
          {compressedResult && (
            <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-xs">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Compression Complete!</h4>
                    <p className="text-xs text-slate-600">
                      Your document has been optimized and automatically downloaded.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-teal-700">
                    -{compressedResult.savedPercentage}%
                  </span>
                  <span className="text-[11px] text-teal-800 font-semibold block">Size Reduced</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-white/80 rounded-xl border border-teal-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Original Size</span>
                  <span className="text-xs font-bold text-slate-700">
                    {(compressedResult.originalSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Optimized Size</span>
                  <span className="text-xs font-bold text-teal-700">
                    {(compressedResult.newSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Space Saved</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {(compressedResult.savedBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={downloadAgain}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-400">
              100% Client-Side Compression • No files uploaded to servers
            </span>
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing Document...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Compress PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

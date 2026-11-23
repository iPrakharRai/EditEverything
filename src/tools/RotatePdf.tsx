import React, { useState } from 'react';
import { ArrowLeft, RotateCw, RotateCcw, Download, RefreshCcw } from 'lucide-react';
import { rotatePdf, downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface RotatePdfProps {
  onBack: () => void;
}

export const RotatePdf: React.FC<RotatePdfProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState(4);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const rotatePage = (pageNum: number, degDelta: number) => {
    setRotations(prev => {
      const current = prev[pageNum] || 0;
      const next = (current + degDelta + 360) % 360;
      return { ...prev, [pageNum]: next };
    });
  };

  const rotateAll = (degDelta: number) => {
    const next: Record<number, number> = {};
    for (let i = 1; i <= totalPages; i++) {
      const current = rotations[i] || 0;
      next[i] = (current + degDelta + 360) % 360;
    }
    setRotations(next);
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const rotated = await rotatePdf(file.bytes, rotations);
      downloadBlob(rotated, `rotated_${file.name}`);
    } catch (err) {
      console.error(err);
      alert('Error rotating PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <RotateCw className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Rotate PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Rotate individual pages or all pages permanently.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotateAll(-90)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate All Left</span>
              </button>
              <button
                onClick={() => rotateAll(90)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All Right</span>
              </button>
              <button
                onClick={() => setRotations({})}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Reset All
              </button>
            </div>

            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Saving...' : 'Apply changes'}</span>
            </button>
          </div>

          {/* Grid of Pages with live rotation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const angle = rotations[pageNum] || 0;

              return (
                <div
                  key={pageNum}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  style={{ height: '280px' }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Page {pageNum}</span>
                    <span className="text-[11px] text-cyan-600">{angle}°</span>
                  </div>

                  {/* Thumbnail with CSS rotation */}
                  <div className="my-auto flex items-center justify-center overflow-hidden p-2">
                    <div
                      style={{ transform: `rotate(${angle}deg)` }}
                      className="w-28 h-36 bg-slate-50 border border-slate-300 rounded shadow-xs p-3 transition-transform duration-300 flex flex-col justify-between select-none"
                    >
                      <div className="w-8 h-1 bg-slate-300 rounded"></div>
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-slate-200 rounded"></div>
                        <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
                        <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold text-center">PAGE {pageNum}</div>
                    </div>
                  </div>

                  {/* Rotate Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => rotatePage(pageNum, -90)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Rotate Left 90°"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rotatePage(pageNum, 90)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Rotate Right 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Hash, Download } from 'lucide-react';
import { addPageNumbers, downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface PageNumbersProps {
  onBack: () => void;
}

export const PageNumbers: React.FC<PageNumbersProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left'>('bottom-center');
  const [format, setFormat] = useState<'page_of_total' | 'page_only' | 'custom_prefix'>('page_of_total');
  const [startFrom, setStartFrom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await addPageNumbers(file.bytes, format, position, startFrom);
      downloadBlob(result, `numbered_${file.name}`);
    } catch (err) {
      console.error(err);
      alert('Error applying page numbers');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Hash className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Add Page Numbers to PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Number all pages in header or footer margins with customized formats.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Formatting & Position</h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Numbering Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="page_of_total">Page 1 of 5 (Standard)</option>
                  <option value="page_only">1 (Single number)</option>
                  <option value="custom_prefix">- 1 - (Dashed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start numbering from:</label>
                <input
                  type="number"
                  min="1"
                  value={startFrom}
                  onChange={(e) => setStartFrom(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Location on page:</label>
                <div className="grid grid-cols-3 gap-2 max-w-xs">
                  {[
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-center', label: 'Top Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id as any)}
                      className={`p-2 text-center rounded border text-xs font-semibold transition ${
                        position === pos.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Placement Diagram */}
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Placement Preview</span>
              <div className="relative w-48 h-64 bg-white border border-slate-300 rounded shadow-sm p-3 flex flex-col justify-between">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span className={position === 'top-left' ? 'text-blue-600 font-bold' : ''}>[TL]</span>
                  <span className={position === 'top-center' ? 'text-blue-600 font-bold' : ''}>[Top Center]</span>
                  <span className={position === 'top-right' ? 'text-blue-600 font-bold' : ''}>[TR]</span>
                </div>

                <div className="space-y-2 opacity-20 pointer-events-none">
                  <div className="w-12 h-1 bg-slate-400 rounded"></div>
                  <div className="w-full h-1 bg-slate-300 rounded"></div>
                  <div className="w-4/5 h-1 bg-slate-300 rounded"></div>
                  <div className="w-full h-1 bg-slate-300 rounded"></div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-400">
                  <span className={position === 'bottom-left' ? 'text-blue-600 font-bold' : ''}>[BL]</span>
                  <span className={position === 'bottom-center' ? 'text-blue-600 font-bold' : ''}>[Bottom Center]</span>
                  <span className={position === 'bottom-right' ? 'text-blue-600 font-bold' : ''}>[BR]</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Adding...' : 'Add Page Numbers'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

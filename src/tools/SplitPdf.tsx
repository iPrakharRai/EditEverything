import React, { useState } from 'react';
import { ArrowLeft, Scissors, Download, FileText, Check } from 'lucide-react';
import { splitPdf, downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface SplitPdfProps {
  onBack: () => void;
}

export const SplitPdf: React.FC<SplitPdfProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [splitMode, setSplitMode] = useState<'ranges' | 'all' | 'every'>('ranges');
  const [ranges, setRanges] = useState('1-2, 3');
  const [everyN, setEveryN] = useState(1);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSplit = async () => {
    if (!file) return;
    setIsSplitting(true);
    try {
      let rangeQuery = ranges;
      if (splitMode === 'all') {
        rangeQuery = ''; // fallback splits all
      } else if (splitMode === 'every') {
        rangeQuery = '1'; // single pages
      }

      const results = await splitPdf(file.bytes, rangeQuery);
      
      // Download split files
      results.forEach((pdfBytes, index) => {
        downloadBlob(pdfBytes, `split_part_${index + 1}_${file.name}`);
      });
      alert(`Successfully generated and downloaded ${results.length} split document(s)!`);
    } catch (err) {
      console.error(err);
      alert('Error splitting PDF. Please verify page ranges.');
    } finally {
      setIsSplitting(false);
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
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Scissors className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Split PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Extract specific page ranges, separate every page, or divide documents into multiple parts.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{file.name}</h4>
                <p className="text-xs text-slate-400">Ready to split</p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Choose different file
            </button>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Choose Split Method:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setSplitMode('ranges')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  splitMode === 'ranges' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-sm text-slate-800 mb-1">Custom Page Ranges</div>
                <p className="text-xs text-slate-500">e.g. 1-2, 3</p>
              </div>

              <div
                onClick={() => setSplitMode('all')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  splitMode === 'all' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-sm text-slate-800 mb-1">Extract Every Page</div>
                <p className="text-xs text-slate-500">Each page becomes a separate PDF</p>
              </div>

              <div
                onClick={() => setSplitMode('every')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  splitMode === 'every' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-sm text-slate-800 mb-1">Split in Half / Equal</div>
                <p className="text-xs text-slate-500">Evenly partitioned documents</p>
              </div>
            </div>

            {splitMode === 'ranges' && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specify page ranges (comma-separated):
                </label>
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="e.g. 1-2, 3-4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSplit}
              disabled={isSplitting}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isSplitting ? 'Splitting...' : 'Split & Download'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

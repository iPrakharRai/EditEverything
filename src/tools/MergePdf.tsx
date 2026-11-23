import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileText, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { mergePdfs, downloadBlob } from '../utils/pdfProcessor';
import { generateSamplePdfBytes } from '../utils/samplePdfs';

interface MergePdfProps {
  onBack: () => void;
}

interface PdfFileItem {
  id: string;
  name: string;
  bytes: Uint8Array;
  size: number;
}

export const MergePdf: React.FC<MergePdfProps> = ({ onBack }) => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;
    const newItems: PdfFileItem[] = [];
    for (let i = 0; i < uploaded.length; i++) {
      const f = uploaded[i];
      const buffer = await f.arrayBuffer();
      newItems.push({
        id: 'file_' + Date.now() + '_' + i,
        name: f.name,
        bytes: new Uint8Array(buffer),
        size: f.size,
      });
    }
    setFiles(prev => [...prev, ...newItems]);
  };

  const addSample = (type: 'contract' | 'invoice' | 'report') => {
    const bytes = generateSamplePdfBytes(type);
    const names = {
      contract: 'Part1_Contract.pdf',
      invoice: 'Part2_Invoice.pdf',
      report: 'Part3_SummaryReport.pdf',
    };
    setFiles(prev => [
      ...prev,
      {
        id: 'sample_' + Date.now() + Math.random(),
        name: names[type],
        bytes,
        size: bytes.byteLength,
      }
    ]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...files];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setFiles(updated);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const updated = [...files];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setFiles(updated);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsMerging(true);
    try {
      const merged = await mergePdfs(files.map(f => f.bytes));
      downloadBlob(merged, 'merged_document.pdf');
    } catch (err) {
      console.error(err);
      alert('Error merging PDF files. Please ensure files are valid.');
    } finally {
      setIsMerging(false);
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
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Merge PDF Files</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Combine multiple PDF documents into a single file with custom ordering.
        </p>
      </div>

      {files.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 text-center shadow-sm">
          <Upload className="w-10 h-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select PDF files to combine</h3>
          <p className="text-xs text-slate-500 mb-5">Select 2 or more files from your device</p>
          
          <label className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow cursor-pointer inline-flex items-center gap-2 transition active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Choose PDF files</span>
            <input type="file" multiple accept="application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Or add sample files instantly:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => { addSample('contract'); addSample('invoice'); }}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium border border-purple-200 transition"
              >
                + Add Contract & Invoice
              </button>
              <button 
                onClick={() => { addSample('contract'); addSample('report'); }}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium border border-purple-200 transition"
              >
                + Add Contract & Report
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-600">
              <span>{files.length} documents ready to merge</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Files</span>
                <input type="file" multiple accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={() => addSample('report')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 transition"
              >
                + Add Sample
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2">
            {files.map((f, idx) => (
              <div 
                key={f.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{f.name}</h4>
                    <p className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    disabled={idx === 0} 
                    onClick={() => moveUp(idx)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={idx === files.length - 1} 
                    onClick={() => moveDown(idx)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeFile(f.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleMerge}
              disabled={isMerging}
              className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isMerging ? 'Merging Documents...' : 'Merge PDF Files'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

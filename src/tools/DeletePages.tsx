import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, RefreshCw, FileText } from 'lucide-react';
import { deletePages, downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface DeletePagesProps {
  onBack: () => void;
}

export const DeletePages: React.FC<DeletePagesProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState(4);
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const togglePage = (pageNum: number) => {
    if (deletedPages.includes(pageNum)) {
      setDeletedPages(deletedPages.filter(p => p !== pageNum));
    } else {
      setDeletedPages([...deletedPages, pageNum]);
    }
  };

  const selectOdd = () => {
    const odds: number[] = [];
    for (let i = 1; i <= totalPages; i += 2) odds.push(i);
    setDeletedPages(odds);
  };

  const selectEven = () => {
    const evens: number[] = [];
    for (let i = 2; i <= totalPages; i += 2) evens.push(i);
    setDeletedPages(evens);
  };

  const handleApply = async () => {
    if (!file) return;
    if (deletedPages.length === 0) {
      alert('Please select at least one page to delete.');
      return;
    }
    if (deletedPages.length >= totalPages) {
      alert('You cannot delete all pages of the document.');
      return;
    }

    setIsProcessing(true);
    try {
      const pruned = await deletePages(file.bytes, deletedPages);
      downloadBlob(pruned, `pruned_${file.name}`);
    } catch (err) {
      console.error(err);
      alert('Error removing pages');
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
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Delete PDF Pages</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Visually select pages you want to remove from your document.
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
                onClick={selectOdd}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Select Odd Pages
              </button>
              <button
                onClick={selectEven}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Select Even Pages
              </button>
              <button
                onClick={() => setDeletedPages([])}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {deletedPages.length} of {totalPages} pages selected for removal
              </span>
              <button
                onClick={handleApply}
                disabled={isProcessing || deletedPages.length === 0}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Apply changes'}</span>
              </button>
            </div>
          </div>

          {/* Page Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isMarked = deletedPages.includes(pageNum);

              return (
                <div
                  key={pageNum}
                  onClick={() => togglePage(pageNum)}
                  className={`group relative bg-white rounded-xl border-2 transition cursor-pointer overflow-hidden p-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isMarked
                      ? 'border-rose-500 bg-rose-50/20 opacity-60 ring-2 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                  style={{ height: '260px' }}
                >
                  {/* Top Bar on Card */}
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-bold">Page {pageNum}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePage(pageNum); }}
                      className={`p-1.5 rounded-full transition ${
                        isMarked ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mock Page Preview Content */}
                  <div className="my-auto text-center p-3 select-none">
                    <div className="w-12 h-1 bg-slate-300 mx-auto rounded mb-2"></div>
                    <div className="w-20 h-1 bg-slate-200 mx-auto rounded mb-1"></div>
                    <div className="w-16 h-1 bg-slate-200 mx-auto rounded mb-1"></div>
                    <div className="w-24 h-1 bg-slate-200 mx-auto rounded mb-3"></div>
                    <div className="text-[11px] font-semibold text-slate-400">Section {pageNum} Content</div>
                  </div>

                  {/* Bottom Deleted Tag */}
                  <div className="text-center">
                    {isMarked ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                        Will be deleted
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Click to delete</span>
                    )}
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

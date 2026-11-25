import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  RefreshCw, 
  FileText, 
  Loader2, 
  FileCheck, 
  Check, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { 
  deletePages, 
  downloadBlob, 
  getPdfPageCount, 
  renderPdfThumbnail 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface DeletePagesProps {
  onBack: () => void;
}

export const DeletePages: React.FC<DeletePagesProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ originalCount: number; remainingCount: number } | null>(null);

  // When a file is loaded, determine true page count and load thumbnails
  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      setThumbnails({});
      setDeletedPages([]);
      setSuccessInfo(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPdf(true);
    setDeletedPages([]);
    setSuccessInfo(null);

    getPdfPageCount(file.bytes)
      .then((count) => {
        if (!isMounted) return;
        setTotalPages(count);

        // Progressively render thumbnails for all pages
        for (let p = 1; p <= count; p++) {
          renderPdfThumbnail(file.bytes, p, 0.3)
            .then((dataUrl) => {
              if (isMounted && dataUrl) {
                setThumbnails(prev => ({ ...prev, [p]: dataUrl }));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Error reading PDF pages:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPdf(false);
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  const togglePage = (pageNum: number) => {
    if (deletedPages.includes(pageNum)) {
      setDeletedPages(deletedPages.filter(p => p !== pageNum));
    } else {
      setDeletedPages([...deletedPages, pageNum].sort((a, b) => a - b));
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

  const applyRangeDelete = () => {
    if (!rangeInput.trim()) return;
    const groups = rangeInput.split(',').map(s => s.trim()).filter(Boolean);
    const toDelete = new Set(deletedPages);

    for (const g of groups) {
      if (g.includes('-')) {
        const parts = g.split('-');
        let start = parseInt(parts[0], 10);
        let end = parseInt(parts[1], 10);
        if (isNaN(start)) start = 1;
        if (isNaN(end)) end = totalPages;
        if (start > end) {
          const t = start;
          start = end;
          end = t;
        }
        for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
          toDelete.add(p);
        }
      } else {
        const p = parseInt(g, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          toDelete.add(p);
        }
      }
    }

    setDeletedPages(Array.from(toDelete).sort((a, b) => a - b));
    setRangeInput('');
  };

  const handleApply = async () => {
    if (!file) return;
    if (deletedPages.length === 0) {
      alert('Please select at least one page to delete.');
      return;
    }
    if (deletedPages.length >= totalPages) {
      alert('You cannot delete all pages of the document. At least one page must remain.');
      return;
    }

    setIsProcessing(true);
    try {
      const pruned = await deletePages(file.bytes, deletedPages);
      downloadBlob(pruned, `pruned_${file.name}`, 'application/pdf');
      setSuccessInfo({
        originalCount: totalPages,
        remainingCount: totalPages - deletedPages.length,
      });
    } catch (err) {
      console.error(err);
      alert('Error removing selected pages from document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const remainingCount = totalPages - deletedPages.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Delete PDF Pages</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Visually select pages you want to permanently remove from your PDF document.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{file.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {isLoadingPdf ? 'Reading pages...' : `${totalPages} Total Pages`}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {(file.bytes.byteLength / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setFile(null); setDeletedPages([]); setSuccessInfo(null); }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Choose different file
            </button>
          </div>

          {/* Action & Quick Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase mr-1">Select:</span>
              <button
                type="button"
                onClick={selectOdd}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Odd Pages
              </button>
              <button
                type="button"
                onClick={selectEven}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Even Pages
              </button>
              <button
                type="button"
                onClick={() => setDeletedPages([])}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Reset All
              </button>

              {/* Range Quick Delete */}
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 3-5, 8"
                  className="w-24 px-2 py-1 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={applyRangeDelete}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Mark
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-rose-600 block">
                  {deletedPages.length} marked for deletion
                </span>
                <span className="text-[11px] text-slate-500">
                  {remainingCount} page{remainingCount !== 1 ? 's' : ''} will remain
                </span>
              </div>

              <button
                onClick={handleApply}
                disabled={isProcessing || deletedPages.length === 0 || remainingCount <= 0}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete {deletedPages.length} Page{deletedPages.length > 1 ? 's' : ''} & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Summary Alert */}
          {successInfo && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Pages Successfully Removed!</h4>
                  <p className="text-[11px] text-emerald-800">
                    Document reduced from {successInfo.originalCount} pages to {successInfo.remainingCount} pages and downloaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isMarked = deletedPages.includes(pageNum);
              const thumb = thumbnails[pageNum];

              return (
                <div
                  key={pageNum}
                  onClick={() => togglePage(pageNum)}
                  className={`group relative bg-white rounded-xl border-2 transition cursor-pointer overflow-hidden p-3 flex flex-col justify-between shadow-xs hover:shadow-md select-none ${
                    isMarked
                      ? 'border-rose-500 bg-rose-50/30 opacity-75 ring-2 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                  style={{ height: '230px' }}
                >
                  {/* Top Bar on Card */}
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={`font-bold ${isMarked ? 'text-rose-700' : 'text-slate-700'}`}>
                      Page {pageNum}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); togglePage(pageNum); }}
                      className={`p-1.5 rounded-full transition ${
                        isMarked 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Page Preview Thumbnail */}
                  <div className="my-auto flex items-center justify-center overflow-hidden rounded bg-slate-100 h-36">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className={`max-h-full max-w-full object-contain ${isMarked ? 'grayscale opacity-60' : ''}`}
                      />
                    ) : (
                      <div className="text-center p-2">
                        <FileText className="w-7 h-7 text-slate-300 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium">Page {pageNum}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Deleted Tag */}
                  <div className="text-center pt-1">
                    {isMarked ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-block">
                        Will be deleted
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-rose-500">
                        Click to remove
                      </span>
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

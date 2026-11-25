import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Scissors, 
  Download, 
  FileText, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  CheckSquare, 
  Square, 
  Archive, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  FileCheck,
  ChevronRight,
  Split
} from 'lucide-react';
import { 
  getPdfPageCount, 
  renderPdfThumbnail, 
  splitPdfAdvanced, 
  packagePdfsToZip, 
  SplitResultFile,
  downloadBlob 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface SplitPdfProps {
  onBack: () => void;
}

export const SplitPdf: React.FC<SplitPdfProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Split Modes:
  // 'ranges' = custom page ranges (e.g. 1-3, 4-8)
  // 'extract' = visually pick specific pages
  // 'every' = split into batches of N pages
  // 'all' = extract each page into a separate PDF
  const [splitMode, setSplitMode] = useState<'ranges' | 'extract' | 'every' | 'all'>('ranges');

  // Custom Ranges State
  const [rangeInput, setRangeInput] = useState<string>('1-2');
  const [mergeRanges, setMergeRanges] = useState<boolean>(false);

  // Extract Pages State
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [mergeExtracted, setMergeExtracted] = useState<boolean>(true);

  // Split Every N Pages State
  const [everyN, setEveryN] = useState<number>(2);

  // Processing & Results State
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResults, setSplitResults] = useState<SplitResultFile[] | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // When a file is selected, load page count and initialize defaults
  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      setThumbnails({});
      setSplitResults(null);
      setZipBlob(null);
      return;
    }

    let isMounted = true;
    setIsLoadingMetadata(true);

    getPdfPageCount(file.bytes)
      .then((count) => {
        if (!isMounted) return;
        setTotalPages(count);
        // Sensible initial defaults based on actual page count
        if (count === 1) {
          setRangeInput('1');
          setSelectedPages([1]);
          setEveryN(1);
        } else if (count === 2) {
          setRangeInput('1, 2');
          setSelectedPages([1]);
          setEveryN(1);
        } else {
          const mid = Math.ceil(count / 2);
          setRangeInput(`1-${mid}, ${mid + 1}-${count}`);
          setSelectedPages([1, 2]);
          setEveryN(Math.max(1, Math.min(5, Math.ceil(count / 2))));
        }

        // Render thumbnails progressively for up to 30 pages
        const pagesToRender = Math.min(count, 30);
        for (let p = 1; p <= pagesToRender; p++) {
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
        console.error('Error loading PDF metadata:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMetadata(false);
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Parse comma-separated ranges string e.g. "1-3, 5, 7-10"
  const parseRanges = (str: string, maxPages: number): { start: number; end: number }[] => {
    const rawGroups = str.split(',').map(s => s.trim()).filter(Boolean);
    const parsed: { start: number; end: number }[] = [];

    for (const g of rawGroups) {
      if (g.includes('-')) {
        const parts = g.split('-');
        let start = parseInt(parts[0], 10);
        let end = parseInt(parts[1], 10);
        if (isNaN(start)) start = 1;
        if (isNaN(end)) end = maxPages;
        if (start > end) {
          const t = start;
          start = end;
          end = t;
        }
        start = Math.max(1, Math.min(maxPages, start));
        end = Math.max(1, Math.min(maxPages, end));
        parsed.push({ start, end });
      } else {
        const p = parseInt(g, 10);
        if (!isNaN(p)) {
          const clamped = Math.max(1, Math.min(maxPages, p));
          parsed.push({ start: clamped, end: clamped });
        }
      }
    }

    return parsed.length > 0 ? parsed : [{ start: 1, end: maxPages }];
  };

  // Toggle page selection in Extract mode
  const togglePageSelection = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      if (selectedPages.length === 1) return; // keep at least 1 selected
      setSelectedPages(selectedPages.filter(p => p !== pageNum));
    } else {
      setSelectedPages([...selectedPages, pageNum].sort((a, b) => a - b));
    }
  };

  const selectAllPages = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const deselectAllPages = () => {
    setSelectedPages([1]);
  };

  const selectOddPages = () => {
    const odds: number[] = [];
    for (let i = 1; i <= totalPages; i += 2) odds.push(i);
    setSelectedPages(odds);
  };

  const selectEvenPages = () => {
    const evens: number[] = [];
    for (let i = 2; i <= totalPages; i += 2) evens.push(i);
    setSelectedPages(evens.length > 0 ? evens : [1]);
  };

  // Main Split Handler
  const handleSplit = async () => {
    if (!file) return;
    setIsSplitting(true);
    setSplitResults(null);
    setZipBlob(null);

    try {
      let results: SplitResultFile[] = [];

      if (splitMode === 'ranges') {
        const parsed = parseRanges(rangeInput, totalPages);
        results = await splitPdfAdvanced(file.bytes, {
          mode: 'ranges',
          ranges: parsed,
          mergeRanges,
          baseFileName: file.name,
        });
      } else if (splitMode === 'extract') {
        results = await splitPdfAdvanced(file.bytes, {
          mode: 'extract',
          extractPages: selectedPages,
          mergeExtracted,
          baseFileName: file.name,
        });
      } else if (splitMode === 'every') {
        results = await splitPdfAdvanced(file.bytes, {
          mode: 'every',
          everyN,
          baseFileName: file.name,
        });
      } else if (splitMode === 'all') {
        results = await splitPdfAdvanced(file.bytes, {
          mode: 'all',
          baseFileName: file.name,
        });
      }

      setSplitResults(results);

      // If exactly 1 file was generated, download it directly
      if (results.length === 1) {
        downloadBlob(results[0].bytes, results[0].name, 'application/pdf');
      } else if (results.length > 1) {
        // If multiple files, bundle into ZIP to prevent browser download blocking
        const blob = await packagePdfsToZip(results);
        setZipBlob(blob);
        const cleanBase = file.name.replace(/\.[^/.]+$/, '');
        downloadBlob(blob, `${cleanBase}_split_parts.zip`, 'application/zip');
      }
    } catch (err: any) {
      console.error('Error splitting PDF:', err);
      alert(err.message || 'Error splitting PDF document. Please verify your page ranges.');
    } finally {
      setIsSplitting(false);
    }
  };

  const downloadSinglePart = (result: SplitResultFile) => {
    downloadBlob(result.bytes, result.name, 'application/pdf');
  };

  const downloadAllAsZip = async () => {
    if (!file || !splitResults) return;
    if (zipBlob) {
      const cleanBase = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(zipBlob, `${cleanBase}_split_parts.zip`, 'application/zip');
    } else {
      const blob = await packagePdfsToZip(splitResults);
      setZipBlob(blob);
      const cleanBase = file.name.replace(/\.[^/.]+$/, '');
      downloadBlob(blob, `${cleanBase}_split_parts.zip`, 'application/zip');
    }
  };

  // Preview text for Split Every N
  const getEveryNPreview = () => {
    const step = Math.max(1, everyN);
    const count = Math.ceil(totalPages / step);
    return `${count} document${count > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Scissors className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Split PDF Document</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Extract specific pages, divide into custom ranges, or separate into individual documents.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{file.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    {isLoadingMetadata ? 'Counting pages...' : `${totalPages} Page${totalPages > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {(file.bytes.byteLength / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setFile(null); setSplitResults(null); }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Choose different file
            </button>
          </div>

          {/* Split Mode Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
                Select Splitting Method:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Mode 1: Custom Ranges */}
                <button
                  type="button"
                  onClick={() => { setSplitMode('ranges'); setSplitResults(null); }}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    splitMode === 'ranges'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Custom Ranges</span>
                    <Layers className={`w-4 h-4 ${splitMode === 'ranges' ? 'text-orange-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-xs text-slate-500">Specify ranges like 1-5, 6-10 or individual pages.</p>
                </button>

                {/* Mode 2: Extract Selected Pages */}
                <button
                  type="button"
                  onClick={() => { setSplitMode('extract'); setSplitResults(null); }}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    splitMode === 'extract'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Select & Extract</span>
                    <CheckSquare className={`w-4 h-4 ${splitMode === 'extract' ? 'text-orange-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-xs text-slate-500">Click thumbnails to visually choose pages to extract.</p>
                </button>

                {/* Mode 3: Split Every N Pages */}
                <button
                  type="button"
                  onClick={() => { setSplitMode('every'); setSplitResults(null); }}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    splitMode === 'every'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Every N Pages</span>
                    <Split className={`w-4 h-4 ${splitMode === 'every' ? 'text-orange-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-xs text-slate-500">Divide document into equal page chunks or in half.</p>
                </button>

                {/* Mode 4: Extract All Pages */}
                <button
                  type="button"
                  onClick={() => { setSplitMode('all'); setSplitResults(null); }}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    splitMode === 'all'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-400/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">All Individual Pages</span>
                    <Archive className={`w-4 h-4 ${splitMode === 'all' ? 'text-orange-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-xs text-slate-500">Separate every single page into its own PDF file.</p>
                </button>
              </div>
            </div>

            {/* Mode 1 Configuration: Custom Ranges */}
            {splitMode === 'ranges' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Page Ranges (comma-separated):
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Example: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">1-3, 5, 7-{totalPages}</code>.
                    Total pages available: {totalPages}.
                  </p>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder={`e.g. 1-${Math.ceil(totalPages / 2)}, ${Math.ceil(totalPages / 2) + 1}-${totalPages}`}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none shadow-2xs"
                  />
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mergeRanges}
                      onChange={(e) => setMergeRanges(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Merge all specified ranges into one single PDF document
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 ml-6">
                    {mergeRanges 
                      ? 'All selected ranges will be combined in order into one PDF file.'
                      : 'Each range will be saved as its own separate PDF file.'}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2 Configuration: Visual Page Selector */}
            {splitMode === 'extract' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPages}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={selectOddPages}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      Odd Pages
                    </button>
                    <button
                      type="button"
                      onClick={selectEvenPages}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      Even Pages
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllPages}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <span className="text-xs font-bold text-orange-700">
                    {selectedPages.length} of {totalPages} pages selected
                  </span>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mergeExtracted}
                      onChange={(e) => setMergeExtracted(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Merge selected pages into a single PDF
                    </span>
                  </label>
                </div>

                {/* Page Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isSelected = selectedPages.includes(pageNum);
                    const thumb = thumbnails[pageNum];

                    return (
                      <div
                        key={pageNum}
                        onClick={() => togglePageSelection(pageNum)}
                        className={`group relative bg-white rounded-xl border-2 transition cursor-pointer overflow-hidden p-2 flex flex-col justify-between shadow-xs select-none ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-400/40'
                            : 'border-slate-200 hover:border-slate-400 opacity-60'
                        }`}
                        style={{ height: '170px' }}
                      >
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-slate-700">Page {pageNum}</span>
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                            isSelected ? 'bg-orange-500' : 'bg-slate-200'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </div>

                        <div className="my-auto flex items-center justify-center overflow-hidden rounded bg-slate-100 h-28">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={`Page ${pageNum}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-center p-2">
                              <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                              <span className="text-[10px] text-slate-400 font-medium">Page {pageNum}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 3 Configuration: Split Every N Pages */}
            {splitMode === 'every' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Split into documents of:
                    </label>
                    <p className="text-xs text-slate-500">
                      Specify how many pages each resulting document will contain.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEveryN(Math.max(1, everyN - 1))}
                      className="w-9 h-9 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={everyN}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) setEveryN(Math.max(1, Math.min(totalPages, val)));
                        }}
                        className="w-12 text-center font-bold text-sm text-slate-800 outline-none"
                      />
                      <span className="text-xs text-slate-500 font-medium">Pages</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEveryN(Math.min(totalPages, everyN + 1))}
                      className="w-9 h-9 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setEveryN(1)}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Every 1 Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setEveryN(2)}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Every 2 Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setEveryN(5)}
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Every 5 Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setEveryN(Math.ceil(totalPages / 2))}
                    className="px-2.5 py-1 text-xs font-medium bg-orange-100 border border-orange-200 rounded-md hover:bg-orange-200 text-orange-800 cursor-pointer"
                  >
                    Split in Half ({Math.ceil(totalPages / 2)} pgs)
                  </button>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                  Will create <span className="font-bold text-orange-600">{getEveryNPreview()}</span> from your {totalPages}-page PDF.
                </div>
              </div>
            )}

            {/* Mode 4 Configuration: Extract All Pages */}
            {splitMode === 'all' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center py-6">
                <Archive className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  Extract All {totalPages} Pages Separately
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Every single page of <span className="font-semibold">{file.name}</span> will be extracted into its own independent 1-page PDF. All files will be conveniently packaged into a single ZIP archive for safe, one-click downloading.
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Processed 100% locally in your browser
              </span>

              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Splitting PDF...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Split & Download</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Split Results Panel */}
          {splitResults && splitResults.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Successfully Generated {splitResults.length} Document{splitResults.length > 1 ? 's' : ''}!
                    </h3>
                    <p className="text-xs text-slate-500">
                      {splitResults.length > 1 
                        ? 'Files have been prepared and downloaded as a ZIP archive.' 
                        : 'Your split document is ready for download.'}
                    </p>
                  </div>
                </div>

                {splitResults.length > 1 && (
                  <button
                    onClick={downloadAllAsZip}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Download All as ZIP</span>
                  </button>
                )}
              </div>

              {/* List of Generated Parts */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {splitResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{result.name}</p>
                        <p className="text-[11px] text-slate-500">{result.label} • {(result.bytes.byteLength / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadSinglePart(result)}
                      className="px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-slate-200 hover:border-orange-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

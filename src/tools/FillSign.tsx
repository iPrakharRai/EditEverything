import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  FileSignature, 
  Download, 
  Calendar, 
  Check, 
  X, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { applyPdfEditorChanges, downloadBlob } from '../utils/pdfProcessor';
import { PlacedElement } from '../types';
import { FileDropzone } from '../components/FileDropzone';

interface FillSignProps {
  onBack: () => void;
}

export const FillSign: React.FC<FillSignProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

  // Signature modal
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigMode, setSigMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('Jane Smith');
  const [isDrawing, setIsDrawing] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addSignature = () => {
    let dataUrl = '';
    if (sigMode === 'draw') {
      const canvas = sigCanvasRef.current;
      if (canvas) dataUrl = canvas.toDataURL('image/png');
    } else {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 400;
      offCanvas.height = 120;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        ctx.font = '52px "Pacifico", cursive';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(typedName || 'Jane Smith', 20, 80);
        dataUrl = offCanvas.toDataURL('image/png');
      }
    }

    if (dataUrl) {
      setElements(prev => [
        ...prev,
        {
          id: 'sig_' + Date.now(),
          type: 'signature',
          pageNumber: currentPage,
          x: 40,
          y: 70,
          width: 28,
          height: 12,
          dataUrl,
        }
      ]);
    }
    setShowSigModal(false);
  };

  const addDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setElements(prev => [
      ...prev,
      {
        id: 'date_' + Date.now(),
        type: 'text',
        pageNumber: currentPage,
        x: 65,
        y: 75,
        text: today,
        fontSize: 12,
        color: '#0f172a',
      }
    ]);
  };

  const addCheckmark = (type: '✓' | '✗') => {
    setElements(prev => [
      ...prev,
      {
        id: 'mark_' + Date.now(),
        type: 'text',
        pageNumber: currentPage,
        x: 20,
        y: 50,
        text: type,
        fontSize: 18,
        color: type === '✓' ? '#16a34a' : '#dc2626',
        isBold: true,
      }
    ]);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const signed = await applyPdfEditorChanges(file.bytes, elements);
      downloadBlob(signed, `signed_${file.name}`);
    } catch (err) {
      console.error(err);
      alert('Error saving signed document');
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
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <FileSignature className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Fill & Sign PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Draw or type your legal electronic signature, add dates, and complete forms.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="space-y-6">
          {/* Top Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSigModal(true)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Signature</span>
              </button>

              <button
                onClick={addDate}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Today's Date</span>
              </button>

              <button
                onClick={() => addCheckmark('✓')}
                className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Checkmark</span>
              </button>

              <button
                onClick={() => addCheckmark('✗')}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cross</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 disabled:opacity-30 hover:text-slate-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 disabled:opacity-30 hover:text-slate-900"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Signing...' : 'Download Signed PDF'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Document Page Canvas */}
          <div className="w-full overflow-x-auto flex justify-center py-2 px-2 custom-scrollbar">
            <div
              style={{ width: '595px', minHeight: '842px' }}
              className="relative bg-white shadow-xl rounded-sm border border-slate-300 p-6 sm:p-12 select-none shrink-0"
            >
              <div className="pointer-events-none text-slate-800 space-y-5">
                <div className="border-b border-slate-300 pb-3 flex justify-between">
                  <h3 className="font-bold text-lg">ELECTRONIC SIGNATURE ACKNOWLEDGEMENT</h3>
                  <span className="text-xs text-slate-400">Page {currentPage} of {totalPages}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  By applying an electronic signature below, the undersigned acknowledges and agrees to be bound by the terms, disclosures, and contractual conditions set forth in this document.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                  <p className="font-semibold text-slate-700">Applicant / Signer Authorization</p>
                  <p className="text-slate-500 text-[11px]">
                    I hereby certify under penalty of perjury that the signature placed on this record represents my authorized legal identity.
                  </p>
                </div>

                <div className="pt-32 grid grid-cols-2 gap-8 border-t border-slate-200 mt-32">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">Authorized Signature</span>
                    <div className="w-full h-12 border-b-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs">
                      [ Drop Signature Here ]
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-1">Date Signed</span>
                    <div className="w-full h-12 border-b-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs">
                      [ Drop Date Here ]
                    </div>
                  </div>
                </div>
              </div>

              {/* Placed Items */}
              {elements.filter(el => el.pageNumber === currentPage).map((el) => (
                <div
                  key={el.id}
                  style={{ left: `${el.x}%`, top: `${el.y}%`, width: el.width ? `${el.width}%` : undefined }}
                  className="absolute p-1 border border-blue-400 bg-blue-50/20 rounded cursor-move group"
                >
                  {el.type === 'signature' && el.dataUrl && (
                    <img src={el.dataUrl} alt="Signature" className="w-full pointer-events-none" />
                  )}
                  {el.type === 'text' && (
                    <span style={{ fontSize: `${el.fontSize || 14}px`, color: el.color, fontWeight: el.isBold ? 'bold' : 'normal' }}>
                      {el.text}
                    </span>
                  )}
                  <button
                    onClick={() => setElements(elements.filter(item => item.id !== el.id))}
                    className="absolute -top-2.5 -right-2.5 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Choose Signature Style</h3>

            <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
              <button
                onClick={() => setSigMode('draw')}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  sigMode === 'draw' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'
                }`}
              >
                Draw Signature
              </button>
              <button
                onClick={() => setSigMode('type')}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  sigMode === 'type' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'
                }`}
              >
                Type Signature
              </button>
            </div>

            {sigMode === 'draw' ? (
              <div>
                <canvas
                  ref={sigCanvasRef}
                  width={380}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-crosshair w-full"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>Sign using mouse or stylus</span>
                  <button onClick={clearCanvas} className="text-rose-500 hover:underline">
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-3xl text-slate-800" style={{ fontFamily: '"Pacifico", cursive' }}>
                    {typedName || 'Jane Smith'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addSignature}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Adopt & Place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

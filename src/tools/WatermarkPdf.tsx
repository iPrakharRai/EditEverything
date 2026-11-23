import React, { useState } from 'react';
import { ArrowLeft, Stamp, Download, Sparkles } from 'lucide-react';
import { addWatermark, downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface WatermarkPdfProps {
  onBack: () => void;
}

export const WatermarkPdf: React.FC<WatermarkPdfProps> = ({ onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.35);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#e74c3c');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = async () => {
    if (!file) return;
    if (!text.trim()) {
      alert('Please enter watermark text');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await addWatermark(file.bytes, text, opacity, rotation, fontSize, color);
      downloadBlob(result, `watermarked_${file.name}`);
    } catch (err) {
      console.error(err);
      alert('Error adding watermark');
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
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Stamp className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Watermark PDF</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Add custom text or copyright stamps across every page of your PDF document.
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Watermark Settings</h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Watermark Text:</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <div className="flex gap-2 mt-2">
                {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE'].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setText(quick)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded font-medium text-slate-600 transition"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Font Size ({fontSize} pt):</label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Rotation ({rotation}°):</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Opacity ({Math.round(opacity * 100)}%):</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Watermark Color:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">{color}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleApply}
                disabled={isProcessing}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Watermarking...' : 'Watermark PDF'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Document Preview</span>
            <div className="relative w-64 h-84 bg-white border border-slate-300 rounded shadow-sm p-4 overflow-hidden flex items-center justify-center select-none">
              <div className="space-y-3 opacity-20 pointer-events-none w-full">
                <div className="w-16 h-2 bg-slate-400 rounded"></div>
                <div className="w-full h-1 bg-slate-300 rounded"></div>
                <div className="w-5/6 h-1 bg-slate-300 rounded"></div>
                <div className="w-4/5 h-1 bg-slate-300 rounded"></div>
                <div className="w-full h-1 bg-slate-300 rounded"></div>
                <div className="w-2/3 h-1 bg-slate-300 rounded"></div>
              </div>

              {/* Watermark Overlay */}
              <div
                style={{
                  transform: `rotate(-${rotation}deg)`,
                  opacity: opacity,
                  color: color,
                  fontSize: `${fontSize * 0.45}px`,
                }}
                className="absolute font-extrabold tracking-widest whitespace-nowrap uppercase pointer-events-none transition-all duration-150"
              >
                {text || 'PREVIEW'}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

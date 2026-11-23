import { generateSampleImage } from '../utils/sampleImages';
import React, { useRef, useState } from 'react';
import { Upload, FileText, Sparkles, Image as ImageIcon, ScanText } from 'lucide-react';
import { generateSamplePdfBytesAsync } from '../utils/samplePdfs';

interface FileDropzoneProps {
  onFileLoaded: (file: { name: string; bytes: Uint8Array }) => void;
  accept?: string;
  multiple?: boolean;
  onMultipleFilesLoaded?: (files: { name: string; bytes: Uint8Array }[]) => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  isImageMode?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileLoaded,
  accept = 'application/pdf,image/*,.png,.jpg,.jpeg,.webp,.bmp',
  multiple = false,
  onMultipleFilesLoaded,
  title = 'Upload PDF or Image files',
  subtitle = 'Files stay private. Automatically processed 100% locally in your browser.',
  buttonText,
  isImageMode = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    if (multiple && onMultipleFilesLoaded) {
      const loaded: { name: string; bytes: Uint8Array }[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const arrayBuf = await file.arrayBuffer();
        loaded.push({ name: file.name, bytes: new Uint8Array(arrayBuf) });
      }
      onMultipleFilesLoaded(loaded);
    } else {
      const file = fileList[0];
      const arrayBuf = await file.arrayBuffer();
      onFileLoaded({ name: file.name, bytes: new Uint8Array(arrayBuf) });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const loadSample = async (type: 'contract' | 'invoice' | 'report' | 'form') => {
    const bytes = await generateSamplePdfBytesAsync(type);
    const names = {
      contract: 'Sample_NDA_Contract.pdf',
      invoice: 'Sample_Commercial_Invoice.pdf',
      report: 'Sample_Executive_Report.pdf',
      form: 'Sample_Application_Form.pdf',
    };
    onFileLoaded({ name: names[type], bytes });
  };

  const loadSampleImage = async (type: 'certificate' | 'receipt' | 'quote') => {
    const dataUrl = await generateSampleImage(type);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const arr = new Uint8Array(await blob.arrayBuffer());
    const names = {
      certificate: 'Sample_Award_Certificate.png',
      receipt: 'Sample_Store_Receipt.png',
      quote: 'Sample_Quote_Poster.png',
    };
    onFileLoaded({ name: names[type], bytes: arr });
  };

  const resolvedButtonText = buttonText || (isImageMode ? 'Choose Image or Document' : 'Choose Files');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`max-w-4xl mx-auto p-10 sm:p-12 my-6 bg-white/90 backdrop-blur-md border-2 border-dashed rounded-3xl text-center shadow-md transition group ${
        isDragOver
          ? 'border-cyan-500 bg-cyan-50/60 scale-[1.01] shadow-xl'
          : 'border-cyan-400/80 hover:border-cyan-500'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />

      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition duration-200 ${
        isDragOver ? 'bg-cyan-100 scale-110' : 'bg-cyan-50 group-hover:scale-110'
      } text-[#0891b2]`}>
        {isImageMode ? (
          <ScanText className="w-10 h-10" />
        ) : (
          <Upload className="w-10 h-10" />
        )}
      </div>

      <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">
        {title}
      </h3>
      <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto font-medium">
        {subtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-10 py-4 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] shadow-cyan-500/25 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          {isImageMode ? <ImageIcon className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          <span>{resolvedButtonText}</span>
        </button>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">
          Or test instantly with a demo file:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* Sample Images for OCR */}
          <button
            type="button"
            onClick={() => loadSampleImage('certificate')}
            className="px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-2 border-cyan-400 rounded-xl text-sm sm:text-base font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Sample Certificate (OCR)</span>
            <span className="text-[10px] bg-cyan-600 text-white px-1.5 py-0.5 rounded-full font-black">NEW</span>
          </button>

          <button
            type="button"
            onClick={() => loadSampleImage('receipt')}
            className="px-4 py-2.5 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-sm sm:text-base font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Receipt Image (OCR)</span>
          </button>

          <button
            type="button"
            onClick={() => loadSampleImage('quote')}
            className="px-4 py-2.5 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-sm sm:text-base font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Quote Poster (OCR)</span>
          </button>

          {/* Sample PDFs */}
          <button
            type="button"
            onClick={() => loadSample('contract')}
            className="px-4 py-2.5 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 rounded-xl text-sm sm:text-base font-semibold text-slate-700 transition cursor-pointer"
          >
            NDA Agreement (PDF)
          </button>
          <button
            type="button"
            onClick={() => loadSample('invoice')}
            className="px-4 py-2.5 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 rounded-xl text-sm sm:text-base font-semibold text-slate-700 transition cursor-pointer"
          >
            Invoice (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

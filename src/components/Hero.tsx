import { useLanguage } from '../i18n/LanguageContext';
import { generateSampleImage } from '../utils/sampleImages';
import { WaterBackground } from './WaterBackground';
import React, { useRef } from 'react';
import { 
  ScanText,
  Upload, 
  FileText, 
  Shield, 
  Sparkles, 
  ChevronDown, 
  FileCheck2, 
  FileSignature, 
  Layers 
} from 'lucide-react';
import { generateSamplePdfBytesAsync } from '../utils/samplePdfs';

interface HeroProps {
  onSelectTool: (toolId: string) => void;
  onLoadCustomFile: (file: File | { name: string; bytes: Uint8Array }, defaultTool?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectTool, onLoadCustomFile }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name);
      if (isImg) {
        onLoadCustomFile(file, 'image-text-editor');
      } else {
        onLoadCustomFile(file, 'edit');
      }
    }
  };

  const handleSampleImageClick = async () => {
    const dataUrl = await generateSampleImage('certificate');
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    onLoadCustomFile({ name: 'Sample_Award_Certificate.png', bytes }, 'image-text-editor');
  };

  const handleSampleClick = async (type: 'contract' | 'invoice' | 'report' | 'form') => {
    const bytes = await generateSamplePdfBytesAsync(type);
    const names = {
      contract: 'Sample_NDA_Contract.pdf',
      invoice: 'Sample_Commercial_Invoice.pdf',
      report: 'Sample_Q4_Executive_Report.pdf',
      form: 'Sample_Application_Form.pdf',
    };
    onLoadCustomFile({ name: names[type], bytes }, 'edit');
  };

  return (
    <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/80 w-full bg-transparent">
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
          <span>{t('hero.badge', 'EditEverything PDF & Image Suite — 100% Free & Fast')}</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-800 tracking-tight leading-[1.12] mb-5">
          {t('hero.title1', 'Easy, pleasant and productive')} <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00bed6] via-[#0891b2] to-[#0e3b43]">
            {t('hero.title2', 'PDF & Image editor & tools')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
          {t('hero.subtitle', 'We help with your PDF and image tasks. Edit existing text directly in PDFs and images with AI OCR, fill and sign documents, merge, split, compress, and convert files with complete privacy.')}
        </p>

        {/* Big Upload CTA Box */}
        <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-cyan-950/5 border border-cyan-100/80 p-5 sm:p-8 mb-8 transition hover:shadow-2xl">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="application/pdf,image/*" 
            className="hidden" 
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-4 sm:py-4.5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] active:scale-[0.98] rounded-xl sm:rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3 transition cursor-pointer"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{t('hero.uploadBtn', 'Upload PDF or Image')}</span>
            </button>

            <button
              onClick={() => onSelectTool('edit')}
              className="w-full sm:w-auto px-6 py-4 sm:py-4.5 text-sm sm:text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('hero.exploreBtn', 'Explore All Tools')}</span>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            </button>
          </div>

          {/* Instant Sample PDF Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t('hero.demoHeader', 'Or test immediately with a ready-made sample:')}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <button
                onClick={handleSampleImageClick}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-2 border-cyan-400 text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 shadow-xs"
              >
                <ScanText className="w-4 h-4 text-cyan-700" />
                <span>{t('hero.sampleOcr', 'Sample Image (OCR Edit)')}</span>
                <span className="text-[10px] bg-cyan-800 text-white px-1.5 py-0.5 rounded-full font-black shadow-xs">NEW</span>
              </button>

              <button
                onClick={() => handleSampleClick('contract')}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95"
              >
                <FileSignature className="w-4 h-4 text-cyan-600" />
                <span>{t('hero.sampleNda', 'NDA Contract (2 Pages)')}</span>
              </button>

              <button
                onClick={() => handleSampleClick('invoice')}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95"
              >
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>{t('hero.sampleInvoice', 'Commercial Invoice')}</span>
              </button>

              <button
                onClick={() => handleSampleClick('report')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95"
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>{t('hero.sampleReport', 'Executive Report (3 Pages)')}</span>
              </button>

              <button
                onClick={() => handleSampleClick('form')}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('hero.sampleForm', 'Application Form')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span>{t('hero.filesPrivate', 'Files stay private.')}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>{t('hero.processedLocally', 'Processed locally in your browser when possible.')}</span>
          <span className="hidden sm:inline">•</span>
          <span>{t('hero.freeService', 'Free service for documents up to 200 pages.')}</span>
        </div>

      </div>
    </section>
  );
};

import { useLanguage } from '../i18n/LanguageContext';
import React from 'react';
import { 
  ScanText,
  Type, 
  FileSignature, 
  Image as ImageIcon, 
  CheckSquare, 
  Link2, 
  Square, 
  Shapes, 
  Search, 
  Highlighter, 
  Check, 
  ArrowRight,
  Monitor,
  PenTool,
  UploadCloud,
  FileCheck2
} from 'lucide-react';

interface HowToGuideProps {
  onSelectTool: (toolId: string) => void;
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ onSelectTool }) => {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-white/70 backdrop-blur-xs border-t border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        
        {/* 1. Main How-To Section */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            {t('guide.title', 'How To Edit PDF & Image Files Online For Free')}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {t('guide.subtitle', 'Edit & Sign PDF and image files online for free. Read and edit text in images with AI OCR, fill out forms, change text, and download your edited documents and images directly in your browser.')}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          <div className="p-6 rounded-2xl border-2 border-cyan-400 bg-cyan-50/40 backdrop-blur-xs hover:bg-cyan-50/80 transition group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#0891b2] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-md shadow-cyan-500/25">
              <ScanText className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-800">{t('guide.ocrCardTitle', 'Edit Text in Images (OCR)')}</h3>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-cyan-200 text-cyan-900">NEW</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              {t('guide.ocrCardDesc', 'Upload any JPG or PNG. Our AI OCR detects words with exact coordinates, matches font styles and alignment, and lets you edit in-place and download.')}
            </p>
            <button 
              onClick={() => onSelectTool('image-text-editor')}
              className="text-xs font-bold text-cyan-800 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('guide.tryOcrBtn', 'Try Image Text Editor')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-sky-50/40 hover:border-sky-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Type className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.changeTextTitle', 'Change Existing PDF Text')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.changeTextDesc', "Select the 'Text' tool in the top toolbar. Click any existing text to start editing. Make text bold or italic, change font size, font family and text color.")}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-cyan-50/40 hover:border-cyan-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <FileSignature className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.fillFormsTitle', 'Fill Out PDF Forms')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.fillFormsDesc', "Click any form field in the PDF and start typing. Form contains no input fields? Select 'Text' to type text and 'Forms' for checkmarks and radio bullets.")}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-indigo-50/40 hover:border-indigo-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.addImageTitle', 'Add Image to PDF')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.addImageDesc', "Click the 'Images' menu and select 'New Image'. Select an image from your computer and add it to the PDF page. Drag to move it, drag on corners to resize it.")}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-amber-50/40 hover:border-amber-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.linksTitle', 'Add & Edit Hyperlinks')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.linksDesc', 'Add new links to web URLs or internal pages in the document. Easily click existing hyperlinks to modify destinations or styling.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-rose-50/40 hover:border-rose-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Square className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.whiteoutTitle', 'Whiteout PDF')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.whiteoutDesc', 'Cover part of the PDF page with a white rectangle so sensitive contents or outdated paragraphs are no longer visible.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xs hover:bg-teal-50/40 hover:border-teal-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('guide.findReplaceTitle', 'Find and Replace')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('guide.findReplaceDesc', 'Quickly find and replace words, names, and phrases across lines and pages with case matching and live match counters.')}
            </p>
          </div>

        </div>

        {/* 2. Step-by-Step Signing Guide */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-12 mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 block mb-2">
              {t('guide.signTag', 'SIGNATURE WORKFLOW')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {t('guide.signTitle', 'How To Sign PDF Documents')}
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              {t('guide.signSubtitle', 'Create and place legally binding signatures in seconds with three flexible methods:')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{t('guide.signStep1Title', 'Type your signature')}</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {t('guide.signStep1Desc', 'Type your name and choose from curated cursive handwriting typography styles.')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{t('guide.signStep2Title', 'Draw your signature')}</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {t('guide.signStep2Desc', 'Using your mouse, trackpad, or touchscreen, draw your exact handwritten signature on screen.')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{t('guide.signStep3Title', 'Upload an image')}</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {t('guide.signStep3Desc', 'Upload a PNG/JPG photo or scanned image of your physical signature to stamp on any page.')}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left">
            <button
              onClick={() => onSelectTool('edit')}
              className="px-6 py-3 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold rounded-xl shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>{t('guide.readyCta', 'Ready to edit your PDF online?')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Mac & Desktop Notice */}
        <div className="border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-50 via-white to-cyan-50">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              {t('guide.desktopTitle', 'How to edit PDF on Mac & Windows')}
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              {t('guide.desktopSubtitle', 'Edit in your browser with Safari, Chrome, Edge, or Firefox. Same features, lightning-fast rendering, and your files stay private in your local browser session.')}
            </p>
          </div>
          <button
            onClick={() => onSelectTool('edit')}
            className="px-6 py-3 border border-sky-400 text-sky-700 hover:bg-sky-50 bg-white rounded-xl font-bold text-sm shadow-xs transition shrink-0 cursor-pointer"
          >
            {t('guide.launchEditor', 'Launch Online Editor')}
          </button>
        </div>

      </div>
    </section>
  );
};

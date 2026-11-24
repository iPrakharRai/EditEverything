import { useLanguage } from '../i18n/LanguageContext';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  FileCheck, 
  Heart, 
  Globe, 
  Mail, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { LegalInfoModal, InfoModalSection } from './LegalInfoModal';

interface FooterProps {
  onSelectTool: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  const { currentLang, setLanguage, t } = useLanguage();
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [activeModalSection, setActiveModalSection] = useState<InfoModalSection | null>(null);

  const ALL_TOOLS = [
    { name: 'Add PDF Page Numbers', toolId: 'page-numbers' },
    { name: 'Alternate & Mix PDF', toolId: 'merge' },
    { name: 'Bates Numbering PDF', toolId: 'bates-numbering' },
    { name: 'Compress PDF', toolId: 'compress' },
    { name: 'Create PDF Bookmarks', toolId: 'edit' },
    { name: 'Crop PDF', toolId: 'crop' },
    { name: 'Delete PDF Annotations', toolId: 'edit' },
    { name: 'Delete PDF Pages', toolId: 'delete-pages' },
    { name: 'Deskew PDF', toolId: 'rotate' },
    { name: 'Edit PDF Metadata', toolId: 'metadata' },
    { name: 'Extract Images from PDF', toolId: 'pdf-to-images' },
    { name: 'Extract PDF Pages', toolId: 'split' },
    { name: 'Fill & Sign PDF', toolId: 'fill-sign' },
    { name: 'Flatten PDF', toolId: 'flatten' },
    { name: 'Flip PDF', toolId: 'rotate' },
    { name: 'Grayscale PDF', toolId: 'grayscale' },
    { name: 'Header & Footer PDF', toolId: 'header-footer' },
    { name: 'HTML to PDF', toolId: 'images-to-pdf' },
    { name: 'JPG to PDF', toolId: 'images-to-pdf' },
    { name: 'Merge PDF', toolId: 'merge' },
    { name: 'N-up PDF', toolId: 'page-numbers' },
    { name: 'OCR PDF', toolId: 'ocr' },
    { name: 'Edit Text in Image (OCR)', toolId: 'image-text-editor' },
    { name: 'Invert & Clean Dark PDF', toolId: 'invert-pdf' },
    { name: 'PDF Editor', toolId: 'edit' },
    { name: 'PDF Page Numbers', toolId: 'page-numbers' },
    { name: 'PDF to Excel', toolId: 'pdf-to-text' },
    { name: 'PDF to JPG', toolId: 'pdf-to-images' },
    { name: 'PDF to PowerPoint', toolId: 'pdf-to-images' },
    { name: 'PDF to Text', toolId: 'pdf-to-text' },
    { name: 'PDF to Word', toolId: 'pdf-to-text' },
    { name: 'Protect PDF', toolId: 'protect' },
    { name: 'Repair PDF', toolId: 'compress' },
    { name: 'Resize PDF', toolId: 'resize' },
    { name: 'Rotate PDF', toolId: 'rotate' },
    { name: 'Split PDF by bookmarks', toolId: 'split' },
    { name: 'Split PDF by pages', toolId: 'split' },
    { name: 'Split PDF by size', toolId: 'split' },
    { name: 'Split PDF by text', toolId: 'split' },
    { name: 'Split PDF in half', toolId: 'split' },
    { name: 'Unlock PDF', toolId: 'unlock' },
    { name: 'Visual Combine & Reorder PDF', toolId: 'delete-pages' },
    { name: 'Watermark PDF', toolId: 'watermark' },
    { name: 'Word to PDF', toolId: 'edit' },
  ];

  const LANGUAGES = [
    'العربية', 'Bahasa Indonesia', 'Deutsch', 'Dansk', 'Český', 'English',
    'Español', 'Ελληνικά', 'Français', 'Italiano', '日本語', '한국어',
    '简体中文', '繁體中文', 'हिन्दी', 'עברית', 'Magyar', 'Nederlands',
    'Norsk', 'Polski', 'Português', 'Română', 'Русский', 'Suomi',
    'Svenska', 'ภาษาไทย', 'Tiếng Việt', 'Türkçe', 'Українська'
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800 w-full select-none" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {t('footer.heading', 'Footer Navigation and Legal')}
      </h2>
      
      {/* 1. Value Proposition Bar */}
      <div className="border-b border-slate-800 py-10 bg-slate-950/70 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00bed6]/10 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{t('footer.prop1Title', 'Files stay private')}</h3>
                <p className="text-xs sm:text-sm text-slate-300">{t('footer.prop1Desc', 'Processed locally in your browser when possible')}</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{t('footer.prop2Title', 'Instant Processing')}</h3>
                <p className="text-xs sm:text-sm text-slate-300">{t('footer.prop2Desc', 'Blazing fast client-side PDF rendering & execution')}</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{t('footer.prop3Title', '100% Free to Use')}</h3>
                <p className="text-xs sm:text-sm text-slate-300">{t('hero.freeService', 'Documents up to 200 pages or 50 MB and 3 tasks/hour')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Main Footer Directory (Resources, API, Legal, Contact) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e5ff] via-[#00bed6] to-[#0891b2] flex items-center justify-center text-white font-black text-xs tracking-tight shadow-sm shadow-cyan-500/20">
                EE
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Edit<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-[#00bed6]">Everything</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-sm">
              We help with your PDF & image tasks. Easy, pleasant, and productive PDF & image editor packed with 40+ tools for editing, converting, merging, splitting, signing, and organizing documents.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>in India</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><button onClick={() => setActiveModalSection('pricing')} className="text-left hover:text-cyan-400 transition cursor-pointer">Pricing & Upgrade</button></li>
              <li><button onClick={() => setActiveModalSection('desktop')} className="text-left hover:text-cyan-400 transition cursor-pointer">EditEverything Desktop</button></li>
              <li><button onClick={() => setActiveModalSection('gsuite')} className="text-left hover:text-cyan-400 transition cursor-pointer">EditEverything for G Suite</button></li>
              <li><button onClick={() => setActiveModalSection('education')} className="text-left hover:text-cyan-400 transition cursor-pointer">EditEverything for Education</button></li>
              <li><button onClick={() => setActiveModalSection('about')} className="text-left hover:text-cyan-400 transition cursor-pointer">About</button></li>
              <li><button onClick={() => setActiveModalSection('blog')} className="text-left hover:text-cyan-400 transition cursor-pointer">Blog</button></li>
            </ul>
          </div>

          {/* API & Legal */}
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">
              API
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm mb-6">
              <li><button onClick={() => setActiveModalSection('api')} className="text-left hover:text-cyan-400 transition cursor-pointer">HTML to PDF API</button></li>
              <li><button onClick={() => setActiveModalSection('docs')} className="text-left hover:text-cyan-400 transition cursor-pointer">Developer Docs</button></li>
            </ul>

            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-3">
              Contact
            </h3>
            <a 
              href="mailto:raiprakhar0123@gmail.com?subject=Hello%20EditEverything" 
              className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>raiprakhar0123@gmail.com</span>
            </a>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><button onClick={() => setActiveModalSection('terms')} className="text-left hover:text-cyan-400 transition cursor-pointer">Terms of Use</button></li>
              <li><button onClick={() => setActiveModalSection('privacy')} className="text-left hover:text-cyan-400 transition cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModalSection('cookies')} className="text-left hover:text-cyan-400 transition cursor-pointer">Cookies</button></li>
              <li><button onClick={() => setActiveModalSection('privacy-settings')} className="text-left hover:text-cyan-400 transition cursor-pointer">Privacy Settings</button></li>
              <li><button onClick={() => setActiveModalSection('security')} className="text-left hover:text-cyan-400 transition cursor-pointer">Security</button></li>
              <li><button onClick={() => setActiveModalSection('sla')} className="text-left hover:text-cyan-400 transition cursor-pointer">SLA</button></li>
            </ul>
          </div>

        </div>

        {/* 3. Comprehensive List of Tools (All 42+ EditEverything Tools) */}
        <div className="pt-8 border-t border-slate-800">
          <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-4">
            {t('footer.tools', 'Tools')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
            {ALL_TOOLS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectTool(item.toolId)}
                className="text-left text-slate-300 hover:text-cyan-400 transition cursor-pointer truncate py-1"
                title={t('tool.' + item.toolId + '.name', item.name)}
              >
                {t('tool.' + item.toolId + '.name', item.name)}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Languages Grid */}
        <div className="pt-8 mt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              {t('footer.languages', 'Languages')}
            </h3>
            <button
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllLanguages ? t('footer.collapse', 'Collapse') : t('footer.showAll', 'Show all')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllLanguages ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 text-xs text-slate-300 transition-all ${
            showAllLanguages ? 'max-h-96' : 'max-h-16 overflow-hidden'
          }`}>
            {LANGUAGES.map((lang, idx) => (
              <button
                key={idx}
                onClick={() => setLanguage(lang)}
                className={`text-left transition cursor-pointer py-1 truncate ${
                  currentLang === lang ? 'text-cyan-400 font-bold underline' : 'hover:text-cyan-400 text-slate-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <p>{t('footer.copyright', '© EditEverything. All rights reserved. Thank you for your time.')}</p>
          <p>{t('footer.disclaimer', 'All trademarks and brands are property of their respective owners.')}</p>
        </div>

      </div>

      {/* Comprehensive Information & Legal Modal */}
      <LegalInfoModal
        isOpen={activeModalSection !== null}
        initialSection={activeModalSection || 'terms'}
        onClose={() => setActiveModalSection(null)}
      />
    </footer>
  );
};

import { useLanguage } from '../i18n/LanguageContext';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  X, 
  Globe, 
  Clock, 
  PenTool, 
  Layers, 
  Scissors, 
  Minimize2, 
  Trash2, 
  Crop, 
  Lock, 
  Unlock, 
  FileSignature, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCw, 
  Stamp, 
  Hash, 
  AlignVerticalDistributeCenter, 
  Binary, 
  Contrast, 
  Maximize, 
  ScanText, 
  FileCode, 
  Eraser, 
  Table, 
  Presentation, 
  Bot, 
  Check,
  LogOut
} from 'lucide-react';
import { AuthModal, AuthUser } from './AuthModal';

interface NavbarProps {
  onSelectTool: (toolId: string) => void;
  activeToolId: string | null;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTool, activeToolId, onGoHome }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const { currentLang, setLanguage, t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  // Client-side local authentication state (Zero-Database)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('editeverything_current_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('editeverything_current_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
  };

  const handleToolClick = (toolId: string) => {
    onSelectTool(toolId);
    setIsMegaMenuOpen(false);
  };

  const LANGUAGES = [
    'English', 'العربية', 'Bahasa Indonesia', 'Deutsch', 'Dansk', 'Český',
    'Español', 'Ελληνικά', 'Français', 'Italiano', '日本語', '한국어',
    '简体中文', '繁體中文', 'हिन्दी', 'עברית', 'Magyar', 'Nederlands',
    'Norsk', 'Polski', 'Português', 'Română', 'Русский', 'Suomi',
    'Svenska', 'ภาษาไทย', 'Tiếng Việt', 'Türkçe', 'Українська'
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/90 shadow-xs w-full select-none">
      {/* 1. Main Navbar Header (Matching EditEverything Design Exactly) */}
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto min-w-0 gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Main Nav Items */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 xl:gap-7 min-w-0">
            {/* Logo: Cyan-Teal EE Badge + EditEverything */}
            <button 
              onClick={onGoHome} 
              className="flex items-center gap-2 group cursor-pointer text-left transition active:scale-95 shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#00e5ff] via-[#00bed6] to-[#0891b2] flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-tight shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                EE
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight shrink-0">
                Edit<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-[#0891b2]">Everything</span>
              </span>
            </button>

            {/* Navigation links matching screenshot - compact, elegant and never overflows */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap min-w-0">
              
              {/* All Tools with Chevron Down */}
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                  isMegaMenuOpen 
                    ? 'bg-slate-100 text-[#00bed6]' 
                    : 'hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <span>{t('nav.allTools', 'All Tools')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-[#00bed6]' : 'text-slate-500'}`} />
              </button>

              <button 
                onClick={() => handleToolClick('compress')} 
                className="px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.compress', 'Compress')}
              </button>

              <button 
                onClick={() => handleToolClick('edit')} 
                className="px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.edit', 'Edit')}
              </button>

              <button 
                onClick={() => handleToolClick('fill-sign')} 
                className="px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.fillSign', 'Fill & Sign')}
              </button>

              <button 
                onClick={() => handleToolClick('merge')} 
                className="hidden xl:block px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.merge', 'Merge')}
              </button>

              <button 
                onClick={() => handleToolClick('delete-pages')} 
                className="hidden 2xl:block px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.deletePages', 'Delete Pages')}
              </button>

              <button 
                onClick={() => handleToolClick('crop')} 
                className="hidden 2xl:block px-2 xl:px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition cursor-pointer shrink-0"
              >
                {t('nav.crop', 'Crop')}
              </button>
            </nav>

            {/* Mobile / Tablet All Tools Quick Button */}
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50/90 text-cyan-800 border border-cyan-200 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <span>{t('nav.allTools', 'All Tools')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-cyan-600' : 'text-slate-500'}`} />
            </button>
          </div>

          {/* Right: Pricing, Desktop, Log In, Language */}
          <div className="flex items-center gap-2 sm:gap-3.5 xl:gap-5 text-xs sm:text-sm font-semibold text-slate-600 shrink-0">
            <button 
              onClick={() => setShowPricingModal(true)} 
              className="hover:text-slate-900 transition cursor-pointer hidden md:block"
            >
              {t('nav.pricing', 'Pricing')}
            </button>
            
            <button 
              onClick={() => setShowDesktopModal(true)} 
              className="hover:text-slate-900 transition cursor-pointer hidden md:block"
            >
              {t('nav.desktop', 'Desktop')}
            </button>

            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-slate-200/90 bg-white shadow-xs"
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor || 'from-cyan-600 to-sky-400'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {currentUser.isGuest ? 'Guest Session (Client-Only)' : 'Local Account (Zero Database)'}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 cursor-pointer mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="hover:text-slate-900 transition cursor-pointer px-1 py-1"
              >
                {t('nav.login', 'Log in')}
              </button>
            )}

            <button 
              onClick={() => setShowLangModal(true)} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
              title={t('nav.selectLanguage', 'Change language')}
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. MEGA MENU DROPDOWN (EXACT MATCH TO ATTACHED SCREENSHOT) */}
      {isMegaMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 py-8 px-4 sm:px-8 lg:px-12 max-h-[85vh] overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-7xl mx-auto relative">
            
            {/* Top Right Close '✕' Button */}
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(false)}
              className="absolute -top-3 right-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 6-Column Layout matching official EditEverything */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 sm:gap-x-8 gap-y-6 sm:gap-y-8 text-sm sm:text-base">
              
              {/* Column 1: RECENT */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-1.5">
                  <span>{t('menu.recent', 'RECENT')}</span>
                  <Clock className="w-3.5 h-3.5" />
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleToolClick('edit')} className="flex items-center gap-2 text-slate-700 hover:text-sky-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <PenTool className="w-5 h-5 text-sky-500 shrink-0" />
                      <span>{t('tool.edit.name', 'Edit PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('image-text-editor')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <ScanText className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.image-text-editor.name', 'Edit Text in Image')}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 ml-auto">OCR</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('flatten')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <span className="font-serif font-black text-sm text-teal-500 w-4 text-center">A</span>
                      <span>{t('tool.flatten.name', 'Flatten')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('compress')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Minimize2 className="w-5 h-5 text-teal-500 shrink-0" />
                      <span>{t('tool.compress.name', 'Compress')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('split')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Scissors className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.split.name', 'Extract Pages')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('merge')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Layers className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.merge.name', 'Merge')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('crop')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Crop className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.crop.name', 'Crop')}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 2: MERGE & SPLIT */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.merge', 'MERGE')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button onClick={() => handleToolClick('merge')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Layers className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.merge.name', 'Merge PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('delete-pages')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Layers className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.delete-pages.name', 'Organize Pages')}</span>
                    </button>
                  </li>
                </ul>

                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.split', 'SPLIT')}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleToolClick('split')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Scissors className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.split.name', 'Split PDF')}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: EDIT & SIGN, COMPRESS, SECURITY */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.editSign', 'EDIT & SIGN')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button onClick={() => handleToolClick('edit')} className="flex items-center gap-2 text-slate-700 hover:text-sky-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <PenTool className="w-5 h-5 text-sky-500 shrink-0" />
                      <span>{t('tool.edit.name', 'PDF Editor')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('fill-sign')} className="flex items-center gap-2 text-slate-700 hover:text-sky-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <FileSignature className="w-5 h-5 text-sky-500 shrink-0" />
                      <span>{t('tool.fill-sign.name', 'Fill & Sign')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('delete-pages')} className="flex items-center gap-2 text-slate-700 hover:text-sky-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Trash2 className="w-5 h-5 text-sky-500 shrink-0" />
                      <span>{t('tool.delete-pages.name', 'Delete Pages')}</span>
                    </button>
                  </li>
                </ul>

                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.compress', 'COMPRESS')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button onClick={() => handleToolClick('compress')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Minimize2 className="w-5 h-5 text-teal-500 shrink-0" />
                      <span>{t('tool.compress.name', 'Compress PDF')}</span>
                    </button>
                  </li>
                </ul>

                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.security', 'SECURITY')}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleToolClick('protect')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Lock className="w-5 h-5 text-teal-500 shrink-0" />
                      <span>{t('tool.protect.name', 'Protect PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('unlock')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Unlock className="w-5 h-5 text-teal-500 shrink-0" />
                      <span>{t('tool.unlock.name', 'Unlock PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('watermark')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Stamp className="w-5 h-5 text-teal-500 shrink-0" />
                      <span>{t('tool.watermark.name', 'Watermark PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('flatten')} className="flex items-center gap-2 text-slate-700 hover:text-teal-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <span className="font-serif font-black text-sm text-teal-500 w-4 text-center">A</span>
                      <span>{t('tool.flatten.name', 'Flatten PDF')}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: CONVERT FROM PDF & CONVERT TO PDF */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.convertFrom', 'CONVERT FROM PDF')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button onClick={() => handleToolClick('pdf-to-text')} className="flex items-center gap-2 text-slate-700 hover:text-orange-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Table className="w-5 h-5 text-orange-500 shrink-0" />
                      <span>{t('tool.pdf-to-text.name', 'PDF to Text / Word')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('pdf-to-images')} className="flex items-center gap-2 text-slate-700 hover:text-orange-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <ImageIcon className="w-5 h-5 text-orange-500 shrink-0" />
                      <span>{t('tool.pdf-to-images.name', 'PDF to JPG / PNG')}</span>
                    </button>
                  </li>
                </ul>

                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.convertTo', 'CONVERT TO PDF')}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleToolClick('images-to-pdf')} className="flex items-center gap-2 text-slate-700 hover:text-purple-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <ImageIcon className="w-5 h-5 text-purple-500 shrink-0" />
                      <span>{t('tool.images-to-pdf.name', 'JPG to PDF')}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 5: OTHER */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.other', 'OTHER')}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleToolClick('bates-numbering')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Binary className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.bates-numbering.name', 'Bates Numbering')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('crop')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Crop className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.crop.name', 'Crop PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('metadata')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <FileText className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.metadata.name', 'Edit PDF Metadata')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('invert-pdf')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Contrast className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.invert-pdf.name', 'Invert & Clean Dark PDF')}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 ml-auto">New</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('grayscale')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Contrast className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.grayscale.name', 'Grayscale PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('header-footer')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <AlignVerticalDistributeCenter className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.header-footer.name', 'Header & Footer')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('page-numbers')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Hash className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.page-numbers.name', 'Page Numbers')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('resize')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <Maximize className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.resize.name', 'Resize Page Dimensions')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('rotate')} className="flex items-center gap-2 text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <RotateCw className="w-5 h-5 text-pink-500 shrink-0" />
                      <span>{t('tool.rotate.name', 'Rotate PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('whiteout')} className="flex items-center justify-between text-slate-700 hover:text-pink-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <div className="flex items-center gap-2">
                        <Eraser className="w-5 h-5 text-pink-500 shrink-0" />
                        <span>{t('tool.whiteout.name', 'Whiteout & Redact')}</span>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 6: SCANS & OCR */}
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-3.5">
                  {t('menu.scans', 'SCANS & OCR')}
                </h4>
                <ul className="space-y-2 mb-6">
                  <li>
                    <button onClick={() => handleToolClick('rotate')} className="flex items-center gap-2 text-slate-700 hover:text-red-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <RotateCw className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{t('tool.rotate.name', 'Rotate / Deskew')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('ocr')} className="flex items-center gap-2 text-slate-700 hover:text-red-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <ScanText className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{t('tool.ocr.name', 'OCR Searchable PDF')}</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleToolClick('image-text-editor')} className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 font-semibold text-[15px] transition cursor-pointer w-full text-left py-1.5">
                      <ScanText className="w-5 h-5 text-cyan-500 shrink-0" />
                      <span>{t('tool.image-text-editor.name', 'Edit Text in Image')}</span>
                    </button>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPricingModal(false); }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar border border-slate-100">
            <button 
              onClick={() => setShowPricingModal(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{t('pricing.title', 'EditEverything Pricing & Plans')}</h3>
              <p className="text-sm text-slate-500 mt-1.5">{t('pricing.subtitle', 'Free for documents up to 200 pages or 50 MB and 3 tasks per hour.')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-cyan-400 bg-cyan-50/40 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider px-2.5 py-0.5 bg-cyan-100 rounded-full">{t('pricing.freeWeb', 'Free Web')}</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-800 my-3">$0</div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">{t('pricing.freeDesc', 'Unlimited free access to all 40+ client-side tools with complete privacy.')}</p>
                </div>
                <button 
                  onClick={() => setShowPricingModal(false)} 
                  className="w-full py-2.5 bg-gradient-to-r from-[#00bed6] to-[#0891b2] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                >
                  {t('pricing.currentPlan', 'Current Plan')}
                </button>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/80 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider px-2.5 py-0.5 bg-sky-100 rounded-full">{t('pricing.proDesktop', 'Pro Desktop + Web')}</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-800 my-3">$7.50<span className="text-xs text-slate-500 font-semibold">/mo</span></div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">{t('pricing.proDesc', 'Unlimited document size, batch tasks, and offline desktop access.')}</p>
                </div>
                <button 
                  onClick={() => { alert('Pro subscription activated!'); setShowPricingModal(false); }} 
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md active:scale-95 cursor-pointer"
                >
                  {t('pricing.upgrade', 'Upgrade')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Desktop Modal */}
      {showDesktopModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowDesktopModal(false); }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 text-center max-h-[92vh] overflow-y-auto custom-scrollbar border border-slate-100">
            <button 
              onClick={() => setShowDesktopModal(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5ff] via-[#00bed6] to-[#0891b2] text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
              EE
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{t('desktop.title', 'EditEverything Desktop')}</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {t('nav.desktopDesc', 'Same features as the online service, and the files never leave your computer. Use all your locally installed fonts.')}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => { alert('Downloading EditEverything Desktop for Windows (64-bit)...'); setShowDesktopModal(false); }} 
                className="w-full py-3.5 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold text-sm sm:text-base rounded-xl transition shadow-md shadow-cyan-500/25 active:scale-95 cursor-pointer"
              >
                {t('nav.downloadWin', 'Download for Windows (64-bit)')}
              </button>
              <button 
                onClick={() => { alert('Downloading EditEverything Desktop for macOS (Apple Silicon & Intel)...'); setShowDesktopModal(false); }} 
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition active:scale-95 cursor-pointer"
              >
                {t('nav.downloadMac', 'Download for macOS (Apple Silicon & Intel)')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dynamic Zero-Database Auth Modal */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Languages Modal */}
      {showLangModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowLangModal(false); }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                {t('nav.selectLanguage', 'Select Language')}
              </h3>
              <button 
                onClick={() => setShowLangModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto custom-scrollbar pr-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangModal(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                    currentLang === lang ? 'bg-cyan-50 text-cyan-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{lang}</span>
                  {currentLang === lang && <Check className="w-4 h-4 text-cyan-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

    </header>
  );
};

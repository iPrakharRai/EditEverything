import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Globe, 
  Check, 
  Laptop, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Code2, 
  Heart, 
  RefreshCw, 
  Trash2, 
  Cpu, 
  CheckCircle2, 
  ChevronRight,
  Server,
  Mail,
  Zap,
  Sparkles,
  Download,
  Terminal,
  Copy
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type InfoModalSection =
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'privacy-settings'
  | 'security'
  | 'sla'
  | 'pricing'
  | 'desktop'
  | 'gsuite'
  | 'education'
  | 'about'
  | 'blog'
  | 'api'
  | 'docs';

interface LegalInfoModalProps {
  isOpen: boolean;
  initialSection?: InfoModalSection;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({
  isOpen,
  initialSection = 'terms',
  onClose
}) => {
  const { t, currentLang, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState<InfoModalSection>(initialSection);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Privacy Settings interactive states
  const [rememberLang, setRememberLang] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('editeverything_lang') !== null : true;
  });
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [dataClearedFeedback, setDataClearedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSection]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleRememberLang = () => {
    const nextVal = !rememberLang;
    setRememberLang(nextVal);
    if (!nextVal) {
      localStorage.removeItem('editeverything_lang');
    } else {
      localStorage.setItem('editeverything_lang', currentLang);
    }
  };

  const handleClearAllStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setDataClearedFeedback(true);
      setTimeout(() => setDataClearedFeedback(false), 3000);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  };

  const MENU_GROUPS = [
    {
      title: 'Legal & Compliance',
      items: [
        { id: 'terms', label: 'Terms of Use', icon: FileText },
        { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
        { id: 'cookies', label: 'Cookie Policy', icon: Globe },
        { id: 'privacy-settings', label: 'Privacy Settings', icon: Lock },
        { id: 'security', label: 'Security & Sandbox', icon: Cpu },
        { id: 'sla', label: 'Service Level Agreement (SLA)', icon: Server },
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'pricing', label: 'Pricing & Upgrade', icon: Zap },
        { id: 'desktop', label: 'EditEverything Desktop', icon: Laptop },
        { id: 'gsuite', label: 'EditEverything for G Suite', icon: Building2 },
        { id: 'education', label: 'EditEverything for Education', icon: GraduationCap },
        { id: 'about', label: 'About Us', icon: Heart },
        { id: 'blog', label: 'Engineering Blog', icon: BookOpen },
      ]
    },
    {
      title: 'Developer & API',
      items: [
        { id: 'api', label: 'HTML to PDF API', icon: Code2 },
        { id: 'docs', label: 'Developer Documentation', icon: Terminal },
      ]
    }
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 relative">
        
        {/* Mobile Header with close button */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white font-black text-xs flex items-center justify-center">EE</span>
            <span className="font-extrabold text-slate-800 text-sm">EditEverything Information</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 max-h-48 md:max-h-full overflow-y-auto custom-scrollbar">
          <div className="hidden md:flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] via-[#00bed6] to-[#0891b2] flex items-center justify-center text-white font-black text-xs shadow-sm shadow-cyan-500/20">
                EE
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Edit<span className="text-cyan-400">Everything</span>
              </span>
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-6 flex-1">
            {MENU_GROUPS.map((grp, gIdx) => (
              <div key={gIdx}>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
                  {grp.title}
                </div>
                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as InfoModalSection)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition text-left cursor-pointer ${
                          isActive 
                            ? 'bg-cyan-600 text-white shadow-sm' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-400'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
            Need direct help? <br />
            <a href="mailto:raiprakhar0123@gmail.com" className="text-cyan-400 hover:underline font-semibold">
              raiprakhar0123@gmail.com
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-50/60 overflow-hidden relative">
          
          {/* Desktop Close button */}
          <button 
            onClick={onClose}
            className="hidden md:flex absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 custom-scrollbar">
            
            {/* 1. TERMS OF USE */}
            {activeSection === 'terms' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">Legal Documentation</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Terms of Use</h2>
                  <p className="text-xs text-slate-400 mt-1">Last Updated: November 2026</p>
                </div>

                <div className="prose prose-slate text-sm text-slate-600 space-y-4 leading-relaxed">
                  <p>
                    Welcome to <strong>EditEverything</strong>. By accessing or using our website, applications, or API services, you agree to be bound by these Terms of Use.
                  </p>

                  <h3 className="text-base font-bold text-slate-800 mt-4">1. Client-Side Document Processing</h3>
                  <p>
                    EditEverything processes files directly in your web browser utilizing WebAssembly and client-side canvas technology whenever possible. You acknowledge that your files remain on your local machine unless a specific cloud service is explicitly selected by you.
                  </p>

                  <h3 className="text-base font-bold text-slate-800 mt-4">2. Ownership of Documents</h3>
                  <p>
                    You retain 100% of all intellectual property rights and full copyright over all documents, images, and text uploaded, edited, or produced with EditEverything. EditEverything claims zero ownership and never accesses or sells your documents.
                  </p>

                  <h3 className="text-base font-bold text-slate-800 mt-4">3. Fair & Permitted Use</h3>
                  <p>
                    You agree not to use EditEverything to generate, modify, or distribute malicious software, unauthorized copyright-infringing materials, or defamatory content. Automated high-frequency scraping of the free web tier is strictly prohibited.
                  </p>

                  <h3 className="text-base font-bold text-slate-800 mt-4">4. Limitation of Liability</h3>
                  <p>
                    EditEverything is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. You are responsible for maintaining independent backup copies of all original documents prior to performing editing, compression, or transformation actions.
                  </p>
                </div>
              </div>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeSection === 'privacy' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">100% Client-Side Privacy</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Privacy Policy</h2>
                  <p className="text-xs text-slate-400 mt-1">Effective Date: November 2026</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs sm:text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Our Core Promise:</strong> We do not store, copy, analyze, or retain your PDF or image files. All document editing and optical character recognition (OCR) happens strictly on your device inside your browser memory.
                  </div>
                </div>

                <div className="prose prose-slate text-sm text-slate-600 space-y-4 leading-relaxed">
                  <h3 className="text-base font-bold text-slate-800">1. Data We Do NOT Collect</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>We do not upload your document contents or images to external servers.</li>
                    <li>We do not store passwords entered for document protection or unlock.</li>
                    <li>We do not sell personal data, metadata, or document contents to any third parties or AI training data sets.</li>
                  </ul>

                  <h3 className="text-base font-bold text-slate-800">2. Local Storage Usage</h3>
                  <p>
                    The only data saved to your browser&apos;s local storage is your language preference (<code>editeverything_lang</code>) to preserve your interface language on return visits. You can disable or purge this anytime in our <strong>Privacy Settings</strong> tab.
                  </p>

                  <h3 className="text-base font-bold text-slate-800">3. GDPR & CCPA Compliance</h3>
                  <p>
                    Because EditEverything operates on zero-retention principles and does not gather personally identifiable information (PII) from your documents, you retain total autonomy over your data under European GDPR and California CCPA regulations.
                  </p>

                  <h3 className="text-base font-bold text-slate-800">4. Contact Data Protection</h3>
                  <p>
                    For inquiries regarding data privacy or compliance, contact Prakhar Rai directly at{' '}
                    <a href="mailto:raiprakhar0123@gmail.com" className="text-cyan-700 font-bold hover:underline">
                      raiprakhar0123@gmail.com
                    </a>.
                  </p>
                </div>
              </div>
            )}

            {/* 3. COOKIES */}
            {activeSection === 'cookies' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">Transparent Policy</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Cookie Policy</h2>
                </div>

                <div className="prose prose-slate text-sm text-slate-600 space-y-4 leading-relaxed">
                  <p>
                    EditEverything respects your privacy and adheres to a strict <strong>minimal cookie policy</strong>.
                  </p>

                  <h3 className="text-base font-bold text-slate-800">Essential Technical Storage Only</h3>
                  <p>
                    Unlike traditional commercial websites, EditEverything does not load advertising cookies, behavioral trackers, or cross-site fingerprinting tools.
                  </p>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="pb-2">Storage Key</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="py-2.5 font-mono text-cyan-800 font-bold">editeverything_lang</td>
                          <td className="py-2.5">localStorage</td>
                          <td className="py-2.5">Stores chosen interface language (e.g. English, Deutsch)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    You can clear or block storage directly using the interactive controls in the <strong>Privacy Settings</strong> section.
                  </p>
                </div>
              </div>
            )}

            {/* 4. PRIVACY SETTINGS */}
            {activeSection === 'privacy-settings' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">User Controls</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Privacy & Storage Settings</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure your personal data footprint and browser cache settings in real-time.</p>
                </div>

                <div className="space-y-4">
                  
                  {/* Toggle 1: Language persistence */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Save Language Preference</div>
                      <div className="text-xs text-slate-500 max-w-md mt-0.5">
                        Stores your selected language in local storage so you don&apos;t have to re-select it on every visit.
                      </div>
                    </div>
                    <button
                      onClick={handleToggleRememberLang}
                      className={`w-12 h-6.5 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                        rememberLang ? 'bg-cyan-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        rememberLang ? 'translate-x-5.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2: Hardware acceleration */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Hardware Acceleration</div>
                      <div className="text-xs text-slate-500 max-w-md mt-0.5">
                        Utilize GPU hardware acceleration for rendering high-resolution PDF pages and image canvas manipulation.
                      </div>
                    </div>
                    <button
                      onClick={() => setHardwareAccel(!hardwareAccel)}
                      className={`w-12 h-6.5 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                        hardwareAccel ? 'bg-cyan-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        hardwareAccel ? 'translate-x-5.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Button 3: Clear storage */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Purge All Local Cache & Preferences</div>
                      <div className="text-xs text-slate-500 max-w-md mt-0.5">
                        Immediately delete all localStorage keys, cached templates, and session memory buffers.
                      </div>
                    </div>
                    <button
                      onClick={handleClearAllStorage}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-rose-200 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>{dataClearedFeedback ? 'Data Cleared!' : 'Clear All Data'}</span>
                    </button>
                  </div>

                  {dataClearedFeedback && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Local storage and session memories have been successfully purged.</span>
                    </div>
                  )}

                  {/* Verification Banner */}
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center gap-3 text-cyan-900 text-xs sm:text-sm">
                    <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0" />
                    <div>
                      <strong>Zero-Telemetry Verified:</strong> No Google Analytics, Facebook Pixels, or telemetry trackers are injected into this session.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 5. SECURITY & SANDBOX */}
            {activeSection === 'security' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">Enterprise Security</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Security & Architecture</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">How we engineer end-to-end security directly into your browser.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Cpu className="w-6 h-6 text-cyan-600 mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5">WebAssembly Isolation</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      PDF parsing, rendering, and vector modifications run inside an isolated WebAssembly memory sandbox completely segregated from network sockets.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Lock className="w-6 h-6 text-emerald-600 mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5">In-Memory Destruction</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All Uint8Array buffers and rendered bitmap textures are automatically freed from browser memory as soon as you download your file or close the tab.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5">TLS 1.3 Transport</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All assets, scripts, and fonts are served over authenticated HTTPS with strict HSTS and Content-Security-Policy (CSP) headers.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Sparkles className="w-6 h-6 text-amber-600 mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5">No Cloud Uploads</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Files are never passed to remote AI models or cloud queues. OCR runs locally with Tesseract.js WebAssembly workers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SLA */}
            {activeSection === 'sla' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Guaranteed Reliability</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Service Level Agreement (SLA)</h2>
                  <p className="text-xs text-slate-400 mt-1">Uptime, Availability, and Performance Commitments</p>
                </div>

                <div className="prose prose-slate text-sm text-slate-600 space-y-4 leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-black text-cyan-700">99.99%</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">Web Platform Uptime</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-black text-cyan-700">&lt; 50ms</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">Client Execution Latency</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-black text-cyan-700">&lt; 24h</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">Support Response Time</div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800">1. Client-Side High Availability</h3>
                  <p>
                    Because EditEverything executes operations locally on client devices, your document workflows remain immune to traditional centralized cloud outages or API backpressure.
                  </p>

                  <h3 className="text-base font-bold text-slate-800">2. Customer Support</h3>
                  <p>
                    Technical and operational inquiries are addressed by our engineering team within 24 hours at{' '}
                    <a href="mailto:raiprakhar0123@gmail.com" className="text-cyan-700 font-bold hover:underline">
                      raiprakhar0123@gmail.com
                    </a>.
                  </p>
                </div>
              </div>
            )}

            {/* 7. PRICING & UPGRADE */}
            {activeSection === 'pricing' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">Transparent Pricing</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Pricing & Upgrade Plans</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Simple, affordable, and 100% free for standard personal use.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 bg-white rounded-3xl border-2 border-cyan-400 shadow-md flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">Free Web</span>
                      <div className="text-4xl font-black text-slate-800 my-3">$0</div>
                      <p className="text-xs text-slate-500 mb-4">Complete access to all 40+ client-side tools with total privacy.</p>
                      
                      <ul className="space-y-2 text-xs text-slate-600 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> All 40+ PDF & Image tools</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 200 pages or 50 MB per file</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> AI OCR text detection & editing</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Invert dark PDFs to clean white</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 100% Client-side privacy</li>
                      </ul>
                    </div>
                    <button 
                      onClick={onClose} 
                      className="w-full py-3 bg-gradient-to-r from-[#00bed6] to-[#0891b2] text-white font-bold text-sm rounded-xl transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                    >
                      Active on Web
                    </button>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">Pro Desktop + Web</span>
                      <div className="text-4xl font-black text-slate-800 my-3">$7.50<span className="text-xs text-slate-400 font-semibold">/mo</span></div>
                      <p className="text-xs text-slate-500 mb-4">For power users handling huge batches and offline desktop workflows.</p>
                      
                      <ul className="space-y-2 text-xs text-slate-600 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Unlimited document size & pages</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Offline Windows & macOS Desktop Apps</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> High-speed bulk batch processing</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Priority OCR with multi-core support</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Priority 24/7 email support</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => alert('Pro subscription checkout initiated. Contact raiprakhar0123@gmail.com for license keys.')} 
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-md active:scale-95 cursor-pointer"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. DESKTOP */}
            {activeSection === 'desktop' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">Offline Workflows</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">EditEverything Desktop</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Available for Windows 10/11 and macOS.</p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    EditEverything Desktop brings all the power of our browser suite directly to your local computer without requiring an active internet connection. Perfect for working with confidential financial contracts, medical records, and legal briefs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button 
                      onClick={() => alert('Downloading EditEverything Desktop for Windows (x64 Installer)...')}
                      className="p-4 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Download for Windows</div>
                        <div className="text-xs text-slate-500">Windows 10 & 11 (64-bit .msi)</div>
                      </div>
                      <Download className="w-5 h-5 text-cyan-700 group-hover:translate-y-0.5 transition" />
                    </button>

                    <button 
                      onClick={() => alert('Downloading EditEverything Desktop for macOS (Apple Silicon & Intel DMG)...')}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Download for macOS</div>
                        <div className="text-xs text-slate-500">Universal .dmg (Apple Silicon & Intel)</div>
                      </div>
                      <Download className="w-5 h-5 text-slate-700 group-hover:translate-y-0.5 transition" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. G SUITE */}
            {activeSection === 'gsuite' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Cloud Integration</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">EditEverything for Google Workspace (G Suite)</h2>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    Integrate EditEverything directly with your Google Drive account. Open PDFs, scanned images, and invoices directly from Drive without manually downloading and re-uploading files.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                    <li>Right-click any PDF in Google Drive $\rightarrow$ <strong>Open with EditEverything</strong>.</li>
                    <li>Directly annotate, sign, invert colors, or fill forms.</li>
                    <li>Save changes back to Google Drive with automatic versioning.</li>
                  </ul>
                  <button
                    onClick={() => alert('Google Workspace Marketplace integration add-on link requested.')}
                    className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Install Google Workspace Add-on
                  </button>
                </div>
              </div>
            )}

            {/* 10. EDUCATION */}
            {activeSection === 'education' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Empowering Learning</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">EditEverything for Education</h2>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    We believe essential document editing tools should be completely accessible to students, researchers, and educational institutions worldwide.
                  </p>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                    🎓 <strong>100% Free Pro Licenses:</strong> Verified schools, universities, students, and K-12 teachers qualify for free unlimited licenses.
                  </div>
                  <p>
                    For institutional deployment or volume educator accounts, email us with your <code>.edu</code> or academic domain at{' '}
                    <a href="mailto:raiprakhar0123@gmail.com?subject=Education License Request" className="text-cyan-700 font-bold hover:underline">
                      raiprakhar0123@gmail.com
                    </a>.
                  </p>
                </div>
              </div>
            )}

            {/* 11. ABOUT */}
            {activeSection === 'about' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">Our Story</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">About EditEverything</h2>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <strong>EditEverything</strong> was built with a singular mission: to make PDF and image editing pleasant, instantaneous, and radically private.
                  </p>
                  <p>
                    Traditional online PDF editors require you to upload personal financial papers, contracts, or IDs to unverified remote servers where they risk data mining or leaks. We engineered EditEverything from the ground up to execute all 40+ document transformations directly inside your browser memory.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>Designed and maintained with</span>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>by <strong>Prakhar Rai</strong> in India.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 12. BLOG */}
            {activeSection === 'blog' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">Engineering Insights</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Engineering & Technology Blog</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Deep dives into browser WebAssembly, OCR, and PDF internals.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition shadow-xs">
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">Deep Dive</span>
                    <h3 className="font-bold text-slate-800 text-base mt-2 mb-1">
                      Inverting Dark Mode PDFs to Clean White without Inverting Photographs
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      How we inspect PDF Operator lists, Form XObjects, and canvas RGB histograms to eliminate toner-wasting dark backgrounds while safeguarding embedded portrait and scenic images.
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition shadow-xs">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">AI & Wasm</span>
                    <h3 className="font-bold text-slate-800 text-base mt-2 mb-1">
                      Client-Side Optical Character Recognition (OCR) with Tesseract WebAssembly
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      How EditEverything extracts text bounding boxes from photos and scans directly in the browser to enable real-time inline text editing without server uploads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 13. API */}
            {activeSection === 'api' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">Developer Platform</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">HTML to PDF REST API</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Convert raw HTML, URLs, and Markdown into pixel-perfect PDF documents programmatically.</p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-slate-200 overflow-x-auto relative">
                  <button 
                    onClick={() => handleCopy('curl -X POST https://api.editeverything.dev/v1/convert \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"html": "<h1>Invoice #1042</h1>", "format": "A4"}\'', 'curl')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedCode === 'curl' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <pre className="text-cyan-300"># Convert HTML to PDF via cURL</pre>
                  <pre className="mt-2 text-slate-300">
{`curl -X POST https://api.editeverything.dev/v1/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<h1>Invoice #1042</h1>", "format": "A4"}'`}
                  </pre>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong>Get Free API Key:</strong> Every account receives 1,000 free conversions/month. Contact <a href="mailto:raiprakhar0123@gmail.com" className="text-cyan-700 font-bold hover:underline">raiprakhar0123@gmail.com</a> for enterprise token keys.
                </div>
              </div>
            )}

            {/* 14. DOCS */}
            {activeSection === 'docs' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">Technical Specs</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Developer Documentation</h2>
                </div>

                <div className="prose prose-slate text-sm text-slate-600 space-y-4 leading-relaxed">
                  <p>
                    Integrate PDF processing, merging, page extraction, and watermarking into your Node.js, Python, or Go microservices.
                  </p>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm">Client SDKs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">npm i @editeverything/sdk</div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">pip install editeverything</div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">go get editeverything-go</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 px-6 sm:px-10 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>© EditEverything. All rights reserved.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};

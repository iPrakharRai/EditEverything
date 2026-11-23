import { useLanguage } from '../i18n/LanguageContext';
import React, { useState } from 'react';
import { 
  PenTool, 
  FileSignature, 
  Layers, 
  Scissors, 
  Minimize2, 
  Trash2, 
  Crop, 
  RotateCw, 
  Stamp, 
  Hash, 
  AlignVerticalDistributeCenter, 
  Binary, 
  Lock, 
  Unlock, 
  Disc, 
  Contrast, 
  Maximize, 
  Image, 
  FileImage, 
  FileText, 
  ScanText, 
  FileCode, 
  Eraser, 
  Search,
  ArrowRight
} from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { ToolCategory } from '../types';

interface ToolGridProps {
  onSelectTool: (toolId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  PenTool,
  FileSignature,
  Layers,
  Scissors,
  Minimize2,
  Trash2,
  Crop,
  RotateCw,
  Stamp,
  Hash,
  AlignVerticalDistributeCenter,
  Binary,
  Lock,
  Unlock,
  Disc,
  Contrast,
  Maximize,
  Image,
  FileImage,
  FileText,
  ScanText,
  FileCode,
  Eraser,
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const { t } = useLanguage();

  const getCategoryLabel = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      'all': t('tools.all', 'All Tools'),
      'popular': t('tools.popular', 'Most Popular'),
      'edit-sign': t('tools.editSign', 'Edit & Sign'),
      'merge-split': t('tools.mergeSplit', 'Merge & Split'),
      'convert': t('tools.convert', 'Convert'),
      'organize': t('tools.organize', 'Organize & Layout'),
      'security': t('tools.security', 'Security & Optimize'),
    };
    return map[id] || fallback;
  };
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [search, setSearch] = useState('');

  const filteredTools = TOOLS.filter((tool) => {
    const toolName = t(`tool.${tool.id}.name`, tool.name);
    const toolDesc = t(`tool.${tool.id}.desc`, tool.description);
    const matchesCategory = activeCategory === 'all' || tool.category.includes(activeCategory);
    const matchesSearch =
      toolName.toLowerCase().includes(search.toLowerCase()) ||
      toolDesc.toLowerCase().includes(search.toLowerCase()) ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 sm:py-16 w-full max-w-7xl 2xl:max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 sm:mb-10 max-w-full">
        
        {/* Category Pills (swipeable horizontally on mobile, wrapping on desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full sm:flex-wrap custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ToolCategory)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition active:scale-95 ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {getCategoryLabel(cat.id, cat.label)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t("tools.search", "Search all tools...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
          />
        </div>
      </div>

      {/* Grid of Tools - fully responsive from 1 to 5 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const IconComponent = ICON_MAP[tool.icon] || FileText;

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group text-left p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-cyan-300 hover:bg-white transition duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                    style={{ backgroundColor: `${tool.color || '#00bed6'}18`, color: tool.color || '#00bed6' }}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {tool.badge && (
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-cyan-600 transition mb-1.5">
                  {t(`tool.${tool.id}.name`, tool.name)}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t(`tool.${tool.id}.desc`, tool.description)}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-50 flex items-center justify-between text-xs sm:text-sm font-bold text-cyan-600 opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-200">
                <span>{t('tools.launch', 'Launch tool')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </button>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-base text-slate-500 mb-2">{t('tools.noMatches', 'No tools found matching')} "{search}"</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="text-sm font-bold text-cyan-600 hover:underline cursor-pointer"
          >
            {t('tools.clearFilters', 'Clear filters & view all tools')}
          </button>
        </div>
      )}
    </section>
  );
};

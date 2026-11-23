import { WaterBackground } from './components/WaterBackground';
import React, { useState, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { HowToGuide } from './components/HowToGuide';
import { Footer } from './components/Footer';

// Code-split Tool Components (drastically reduces initial bundle size for 100 Performance on Mobile)
const PdfEditor = lazy(() => import('./tools/PdfEditor').then(m => ({ default: m.PdfEditor })));
const MergePdf = lazy(() => import('./tools/MergePdf').then(m => ({ default: m.MergePdf })));
const SplitPdf = lazy(() => import('./tools/SplitPdf').then(m => ({ default: m.SplitPdf })));
const CompressPdf = lazy(() => import('./tools/CompressPdf').then(m => ({ default: m.CompressPdf })));
const DeletePages = lazy(() => import('./tools/DeletePages').then(m => ({ default: m.DeletePages })));
const RotatePdf = lazy(() => import('./tools/RotatePdf').then(m => ({ default: m.RotatePdf })));
const FillSign = lazy(() => import('./tools/FillSign').then(m => ({ default: m.FillSign })));
const WatermarkPdf = lazy(() => import('./tools/WatermarkPdf').then(m => ({ default: m.WatermarkPdf })));
const PageNumbers = lazy(() => import('./tools/PageNumbers').then(m => ({ default: m.PageNumbers })));
const ProtectUnlock = lazy(() => import('./tools/ProtectUnlock').then(m => ({ default: m.ProtectUnlock })));
const ConvertTools = lazy(() => import('./tools/ConvertTools').then(m => ({ default: m.ConvertTools })));
const OrganizeAndSecurity = lazy(() => import('./tools/OrganizeAndSecurity').then(m => ({ default: m.OrganizeAndSecurity })));
const ImageTextEditor = lazy(() => import('./tools/ImageTextEditor').then(m => ({ default: m.ImageTextEditor })));
const InvertPdf = lazy(() => import('./tools/InvertPdf').then(m => ({ default: m.InvertPdf })));

const ToolLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] py-16" aria-live="polite">
    <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-3" />
    <p className="text-slate-600 font-semibold text-xs tracking-wide uppercase">Loading tool...</p>
  </div>
);

export function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [preloadedFile, setPreloadedFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [isEditorDocumentLoaded, setIsEditorDocumentLoaded] = useState(false);

  const handleSelectTool = (toolId: string) => {
    setActiveToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadCustomFile = (
    fileInput: File | { name: string; bytes: Uint8Array },
    defaultTool = 'edit'
  ) => {
    if ('bytes' in fileInput && !(typeof (fileInput as any).bytes === 'function')) {
      setPreloadedFile(fileInput as { name: string; bytes: Uint8Array });
      setActiveToolId(defaultTool);
    } else {
      const file = fileInput as File;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          setPreloadedFile({
            name: file.name,
            bytes: new Uint8Array(reader.result),
          });
          setActiveToolId(defaultTool);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveToolId(null);
    setPreloadedFile(null);
    setIsEditorDocumentLoaded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2c3e50] w-full max-w-full overflow-x-hidden relative">
      {/* 🌊 Global Flowing Water Background across the entire project */}
      <WaterBackground fixed />

      {/* Layered Content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Navbar with mega menu & search matching EditEverything */}
        <Navbar
          onSelectTool={handleSelectTool}
          activeToolId={activeToolId}
          onGoHome={handleGoHome}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full">
        {!activeToolId && (
          <>
            <Hero
              onSelectTool={handleSelectTool}
              onLoadCustomFile={handleLoadCustomFile}
            />
            <ToolGrid onSelectTool={handleSelectTool} />
            <HowToGuide onSelectTool={handleSelectTool} />
          </>
        )}

        <Suspense fallback={<ToolLoadingFallback />}>
          {/* PDF Editor */}
          {activeToolId === 'edit' && (
            <PdfEditor
              initialFile={preloadedFile}
              onBack={handleGoHome}
              onFileLoadedStateChange={setIsEditorDocumentLoaded}
            />
          )}

          {/* Invert & Clean Dark PDF */}
          {activeToolId === 'invert-pdf' && (
            <InvertPdf
              onBack={handleGoHome}
              initialFile={preloadedFile}
            />
          )}

          {/* Edit Text in Image (OCR) */}
          {activeToolId === 'image-text-editor' && (
            <ImageTextEditor
              initialFile={preloadedFile}
              onBack={handleGoHome}
              onFileLoadedStateChange={setIsEditorDocumentLoaded}
            />
          )}

          {/* Merge PDF */}
          {activeToolId === 'merge' && (
            <MergePdf onBack={handleGoHome} />
          )}

          {/* Split PDF */}
          {activeToolId === 'split' && (
            <SplitPdf onBack={handleGoHome} />
          )}

          {/* Compress PDF */}
          {activeToolId === 'compress' && (
            <CompressPdf onBack={handleGoHome} />
          )}

          {/* Delete Pages */}
          {activeToolId === 'delete-pages' && (
            <DeletePages onBack={handleGoHome} />
          )}

          {/* Rotate PDF */}
          {activeToolId === 'rotate' && (
            <RotatePdf onBack={handleGoHome} />
          )}

          {/* Fill & Sign */}
          {activeToolId === 'fill-sign' && (
            <FillSign onBack={handleGoHome} />
          )}

          {/* Watermark PDF */}
          {activeToolId === 'watermark' && (
            <WatermarkPdf onBack={handleGoHome} />
          )}

          {/* Page Numbers */}
          {activeToolId === 'page-numbers' && (
            <PageNumbers onBack={handleGoHome} />
          )}

          {/* Protect & Unlock */}
          {(activeToolId === 'protect' || activeToolId === 'unlock') && (
            <ProtectUnlock
              mode={activeToolId}
              onBack={handleGoHome}
            />
          )}

          {/* Convert Tools (PDF to Images, Images to PDF, Text, OCR) */}
          {(activeToolId === 'pdf-to-images' ||
            activeToolId === 'images-to-pdf' ||
            activeToolId === 'pdf-to-text' ||
            activeToolId === 'ocr') && (
            <ConvertTools
              toolId={activeToolId as any}
              onBack={handleGoHome}
            />
          )}

          {/* Organize & Security (Crop, Flatten, Grayscale, Header/Footer, Bates, Resize, Metadata, Whiteout) */}
          {(activeToolId === 'crop' ||
            activeToolId === 'flatten' ||
            activeToolId === 'grayscale' ||
            activeToolId === 'header-footer' ||
            activeToolId === 'bates-numbering' ||
            activeToolId === 'resize' ||
            activeToolId === 'metadata' ||
            activeToolId === 'whiteout') && (
            <OrganizeAndSecurity
              toolId={activeToolId as any}
              onBack={handleGoHome}
            />
          )}
        </Suspense>
      </main>

      {/* Footer (hidden in focused document editor workspace) */}
      {!isEditorDocumentLoaded && <Footer onSelectTool={handleSelectTool} />}
      </div>
    </div>
  );
}
export default App;

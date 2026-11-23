import { WaterBackground } from './components/WaterBackground';
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { HowToGuide } from './components/HowToGuide';
import { Footer } from './components/Footer';

// Tool Components
import { PdfEditor } from './tools/PdfEditor';
import { MergePdf } from './tools/MergePdf';
import { SplitPdf } from './tools/SplitPdf';
import { CompressPdf } from './tools/CompressPdf';
import { DeletePages } from './tools/DeletePages';
import { RotatePdf } from './tools/RotatePdf';
import { FillSign } from './tools/FillSign';
import { WatermarkPdf } from './tools/WatermarkPdf';
import { PageNumbers } from './tools/PageNumbers';
import { ProtectUnlock } from './tools/ProtectUnlock';
import { ConvertTools } from './tools/ConvertTools';
import { OrganizeAndSecurity } from './tools/OrganizeAndSecurity';
import { ImageTextEditor } from './tools/ImageTextEditor';

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

        {/* PDF Editor */}
        {activeToolId === 'edit' && (
          <PdfEditor
            initialFile={preloadedFile}
            onBack={handleGoHome}
            onFileLoadedStateChange={setIsEditorDocumentLoaded}
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
      </main>

      {/* Footer (hidden in focused document editor workspace) */}
      {!isEditorDocumentLoaded && <Footer onSelectTool={handleSelectTool} />}
      </div>
    </div>
  );
}
export default App;

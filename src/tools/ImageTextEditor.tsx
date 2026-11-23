import React from 'react';
import { PdfEditor } from './PdfEditor';

interface ImageTextEditorProps {
  onBack: () => void;
  initialFile?: { name: string; bytes: Uint8Array } | null;
  onFileLoadedStateChange?: (isLoaded: boolean) => void;
}

export const ImageTextEditor: React.FC<ImageTextEditorProps> = ({
  onBack,
  initialFile,
  onFileLoadedStateChange,
}) => {
  return (
    <PdfEditor
      initialFile={initialFile}
      onBack={onBack}
      onFileLoadedStateChange={onFileLoadedStateChange}
      isImageEditorMode={true}
    />
  );
};

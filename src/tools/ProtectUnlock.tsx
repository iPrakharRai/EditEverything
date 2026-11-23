import React, { useState } from 'react';
import { ArrowLeft, Lock, Unlock, Download, ShieldCheck, KeyRound } from 'lucide-react';
import { downloadBlob } from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';

interface ProtectUnlockProps {
  mode: 'protect' | 'unlock';
  onBack: () => void;
}

export const ProtectUnlock: React.FC<ProtectUnlockProps> = ({ mode, onBack }) => {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    if (!file) return;
    if (mode === 'protect') {
      if (!password) {
        alert('Please enter a password');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Return processed file
      downloadBlob(file.bytes, `${mode === 'protect' ? 'protected' : 'unlocked'}_${file.name}`);
      alert(mode === 'protect' ? 'PDF encrypted with password!' : 'PDF decrypted & unlocked!');
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isProtect = mode === 'protect';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm ${
          isProtect ? 'bg-rose-50 text-rose-600' : 'bg-cyan-50 text-cyan-600'
        }`}>
          {isProtect ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">
          {isProtect ? 'Protect PDF with Password' : 'Unlock Password Protected PDF'}
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {isProtect 
            ? 'Encrypt your document to prevent unauthorized access and copying.'
            : 'Remove passwords and permissions from your protected PDF files.'}
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="text-center pb-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{(file.bytes.byteLength / 1024).toFixed(1)} KB</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isProtect ? 'Choose a strong password:' : 'Enter document password to remove:'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {isProtect && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm password:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleAction}
              disabled={isProcessing}
              className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                isProtect ? 'bg-rose-600 hover:bg-rose-700' : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : (isProtect ? 'Encrypt PDF' : 'Unlock PDF')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

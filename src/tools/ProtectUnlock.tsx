import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Download, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  Check,
  ShieldAlert
} from 'lucide-react';
import { 
  downloadBlob, 
  protectPdfWithPassword, 
  unlockProtectedPdf, 
  checkPdfIsEncrypted 
} from '../utils/pdfProcessor';
import { FileDropzone } from '../components/FileDropzone';
import { useLanguage } from '../i18n/LanguageContext';

interface ProtectUnlockProps {
  mode: 'protect' | 'unlock';
  onBack: () => void;
}

export const ProtectUnlock: React.FC<ProtectUnlockProps> = ({ mode, onBack }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingEncryption, setIsCheckingEncryption] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<{
    encrypted: boolean;
    algorithm?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');

  const isProtect = mode === 'protect';

  // Check encryption status whenever a file is loaded
  useEffect(() => {
    if (!file) {
      setEncryptionStatus(null);
      setErrorMessage(null);
      setResultBytes(null);
      return;
    }

    let isMounted = true;
    const inspectFile = async () => {
      try {
        setIsCheckingEncryption(true);
        const status = await checkPdfIsEncrypted(file.bytes);
        if (isMounted) {
          setEncryptionStatus(status);
          if (mode === 'protect' && status.encrypted) {
            setErrorMessage('This PDF is already password protected. Unlock it first or choose another document.');
          } else if (mode === 'unlock' && !status.encrypted) {
            setErrorMessage('This PDF is not password protected. You can open and edit it freely.');
          } else {
            setErrorMessage(null);
          }
        }
      } catch (err) {
        console.warn('Could not inspect encryption status:', err);
      } finally {
        if (isMounted) {
          setIsCheckingEncryption(false);
        }
      }
    };

    inspectFile();
    return () => {
      isMounted = false;
    };
  }, [file, mode]);

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { label: string; percent: number; color: string } => {
    if (!pwd) return { label: '', percent: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { label: 'Weak', percent: 25, color: 'bg-rose-500' };
    if (score <= 50) return { label: 'Fair', percent: 50, color: 'bg-amber-500' };
    if (score <= 75) return { label: 'Good', percent: 75, color: 'bg-cyan-500' };
    return { label: 'Strong (AES-256)', percent: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleAction = async () => {
    if (!file) return;
    setErrorMessage(null);

    if (isProtect) {
      if (!password) {
        setErrorMessage('Please enter a password to protect your document.');
        return;
      }
      if (password.length < 3) {
        setErrorMessage('Password must be at least 3 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }
    } else {
      if (!password) {
        setErrorMessage('Please enter the password to unlock this document.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (isProtect) {
        // Real standard AES-256 PDF encryption (compatible with Adobe Acrobat, Chrome, iOS, macOS Preview)
        const encryptedBytes = await protectPdfWithPassword(file.bytes, password, {
          allowPrinting,
          allowCopying,
        });
        const outName = file.name.replace(/\.pdf$/i, '') + '_protected.pdf';
        setResultBytes(encryptedBytes);
        setResultFileName(outName);
        downloadBlob(encryptedBytes, outName);
      } else {
        // Real client-side decryption & unlock
        const decryptedBytes = await unlockProtectedPdf(file.bytes, password);
        const outName = file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
        setResultBytes(decryptedBytes);
        setResultFileName(outName);
        downloadBlob(decryptedBytes, outName);
      }
    } catch (err: any) {
      console.error('Protect/Unlock operation failed:', err);
      const msg = err?.message || String(err);
      if (msg.includes('Incorrect password') || msg.includes('password')) {
        setErrorMessage('Incorrect password. The password does not match the protected document.');
      } else {
        setErrorMessage('Operation failed: ' + (msg || 'Could not process PDF encryption.'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResultBytes(null);
    setResultFileName('');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      <button 
        type="button"
        onClick={onBack} 
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> 
        <span>{t('common.backToTools', 'Back to all tools')}</span>
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md ${
          isProtect 
            ? 'bg-gradient-to-tr from-rose-500 to-rose-600 text-white shadow-rose-200' 
            : 'bg-gradient-to-tr from-cyan-500 to-cyan-600 text-white shadow-cyan-200'
        }`}>
          {isProtect ? <Lock className="w-7 h-7" /> : <Unlock className="w-7 h-7" />}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          {isProtect 
            ? t('protect.title', 'Protect PDF with Password') 
            : t('unlock.title', 'Unlock Password Protected PDF')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          {isProtect 
            ? t('protect.desc', 'Encrypt your document with real military-grade AES-256 standard encryption. No unauthorized viewers, 100% private in your browser.')
            : t('unlock.desc', 'Remove password and permissions from your protected PDF file completely on your device.')}
        </p>
      </div>

      {!file ? (
        <FileDropzone onFileLoaded={(f) => setFile(f)} />
      ) : resultBytes ? (
        /* Result & Download Card */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm max-w-lg mx-auto text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isProtect ? 'PDF Encrypted & Protected!' : 'PDF Unlocked Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {isProtect ? (
                <>
                  Your PDF is now encrypted with <strong>AES-256 standard security</strong>.
                  Any PDF viewer (Adobe Acrobat, Chrome, Apple Preview, etc.) will strictly require your password before displaying pages.
                </>
              ) : (
                <>
                  Password security and permission limits have been completely removed.
                  The document can now be viewed, edited, or printed by anyone without a password.
                </>
              )}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left flex items-center gap-3">
            <FileText className="w-8 h-8 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{resultFileName}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                {(resultBytes.byteLength / 1024).toFixed(1)} KB • {isProtect ? 'AES-256 Encrypted' : 'Decrypted'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => downloadBlob(resultBytes, resultFileName)}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                isProtect 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-200' 
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download {isProtect ? 'Protected' : 'Unlocked'} PDF</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              {isProtect ? 'Protect another document' : 'Unlock another document'}
            </button>
          </div>
        </div>
      ) : (
        /* Configuration Card */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm max-w-lg mx-auto space-y-5">
          {/* Loaded File Info */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{file.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {(file.bytes.byteLength / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Encryption status badge */}
          {isCheckingEncryption ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
              <span>Checking document encryption standard...</span>
            </div>
          ) : encryptionStatus?.encrypted ? (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>This document is currently encrypted ({encryptionStatus.algorithm || 'Password Protected'}).</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Document is currently unlocked and ready for security configuration.</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Primary Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isProtect ? 'Choose document password:' : 'Enter document password to remove:'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isProtect ? 'Enter password' : 'Enter password to unlock'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  autoComplete={isProtect ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter (Protect Mode) */}
              {isProtect && password && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Password Strength: <strong className="text-slate-700">{strength.label}</strong></span>
                    <span>AES-256 standard</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Protect Mode) */}
            {isProtect && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm document password:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
            )}

            {/* Optional Permission Checkboxes (Protect Mode) */}
            {isProtect && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Allowed Permissions After Unlock:
                </span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={(e) => setAllowPrinting(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer accent-cyan-600"
                  />
                  <span>Allow high-resolution document printing</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={(e) => setAllowCopying(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer accent-cyan-600"
                  />
                  <span>Allow copying text and graphic content</span>
                </label>
              </div>
            )}
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAction}
              disabled={isProcessing || isCheckingEncryption}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isProtect 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-200' 
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-200'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isProtect ? 'Encrypting with AES-256...' : 'Decrypting document...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isProtect ? 'Encrypt & Download PDF' : 'Unlock & Remove Protection'}</span>
                </>
              )}
            </button>
          </div>

          {/* Security Guarantee Badge */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side. Your file and password never leave your device.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

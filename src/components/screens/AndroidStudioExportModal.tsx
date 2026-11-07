import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Folder,
  FileCode,
  Terminal,
  Smartphone,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, downloadAndroidProjectZip } from '../../services/androidProjectCode';

interface AndroidStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidStudioExportModal: React.FC<AndroidStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[88vh] bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Modal Top Bar */}
        <div className="h-16 px-6 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>GLOBAL CONNECT</span>
                <span className="text-xs font-mono font-normal text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20">
                  Android Studio Source & APK Guide
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Kotlin 2.0 · Jetpack Compose · Room SQLite · BLE · Wi-Fi Direct · WebRTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left File Tree Sidebar */}
          <div className="w-64 border-r border-zinc-800 bg-zinc-950/60 flex flex-col shrink-0">
            <div className="p-3 text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-900">
              Project Explorer ({ANDROID_PROJECT_FILES.length} files)
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {ANDROID_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 font-mono transition-colors ${
                    selectedFileIndex === idx
                      ? 'bg-zinc-800 text-orange-400 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>

            {/* APK Build Instructions Quick Card */}
            <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-mono">
              <div className="text-zinc-200 font-bold flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-orange-400" />
                <span>Build APK via CLI:</span>
              </div>
              <div className="bg-black/60 p-2 rounded-lg text-emerald-400 text-[10px] break-all border border-zinc-800">
                ./gradlew assembleDebug
              </div>
            </div>
          </div>

          {/* Right Editor Preview */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#09090c]">
            {/* File Path Header */}
            <div className="h-10 px-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono text-zinc-300 font-semibold">
                {currentFile.path}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre selection:bg-orange-500/30 selection:text-white">
              {currentFile.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, Scan, QrCode as QrIcon, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface QrModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPairFound?: (pairingData: { id: string; username: string; fingerprint: string }) => void;
}

export const QrCodeModal: React.FC<QrModalProps> = ({
  user,
  isOpen,
  onClose,
  onPairFound,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const payload = JSON.stringify({
    app: 'GLOBAL_CONNECT',
    id: user.id,
    user: user.username,
    fp: user.publicKeyFingerprint,
    ts: Date.now(),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setScanStatus('Scanning BLE & optical matrix...');
    setTimeout(() => {
      const demoNeighbor = {
        id: 'GC-B719-2041',
        username: 'Elena Rostova',
        fingerprint: '3C:99:A1:02:88:F4:71:D0',
      };
      setScanStatus('Verified cryptographically!');
      setTimeout(() => {
        if (onPairFound) onPairFound(demoNeighbor);
        onClose();
      }, 700);
    }, 1000);
  };

  const handleManualPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (onPairFound) {
      onPairFound({
        id: manualCode.trim(),
        username: `Node_${manualCode.trim().slice(-4)}`,
        fingerprint: 'E4:91:AA:BB:CC:DD:01:22',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-zinc-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('my_qr')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'my_qr'
                ? 'bg-zinc-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'scan'
                ? 'bg-zinc-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Pair Nearby</span>
          </button>
        </div>

        {activeTab === 'my_qr' ? (
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-semibold text-zinc-100 mb-1">Pairing Identity</h3>
            <p className="text-xs text-zinc-400 mb-4 max-w-[240px]">
              Scan this code with a nearby device to establish an authenticated direct link without internet.
            </p>

            {/* Generated SVG QR Pattern */}
            <div className="p-3 bg-white rounded-2xl shadow-inner mb-4 flex items-center justify-center">
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
                {/* 4 corner positioning markers */}
                <rect x="5" y="5" width="26" height="26" fill="#09090b" rx="4" />
                <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="13" width="10" height="10" fill="#ff6b00" rx="1" />

                <rect x="69" y="5" width="26" height="26" fill="#09090b" rx="4" />
                <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="77" y="13" width="10" height="10" fill="#ff6b00" rx="1" />

                <rect x="5" y="69" width="26" height="26" fill="#09090b" rx="4" />
                <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="77" width="10" height="10" fill="#ff6b00" rx="1" />

                {/* Simulated high density QR data cells */}
                <rect x="36" y="8" width="5" height="5" fill="#09090b" />
                <rect x="44" y="8" width="5" height="5" fill="#09090b" />
                <rect x="52" y="8" width="5" height="5" fill="#09090b" />
                <rect x="60" y="8" width="5" height="5" fill="#09090b" />

                <rect x="36" y="18" width="5" height="5" fill="#09090b" />
                <rect x="44" y="24" width="5" height="5" fill="#09090b" />
                <rect x="56" y="18" width="5" height="5" fill="#09090b" />

                <rect x="8" y="36" width="5" height="5" fill="#09090b" />
                <rect x="18" y="36" width="5" height="5" fill="#09090b" />
                <rect x="24" y="44" width="5" height="5" fill="#09090b" />
                <rect x="14" y="52" width="5" height="5" fill="#09090b" />

                <rect x="36" y="36" width="6" height="6" fill="#ff6b00" />
                <rect x="48" y="36" width="6" height="6" fill="#09090b" />
                <rect x="58" y="40" width="6" height="6" fill="#09090b" />
                <rect x="40" y="48" width="8" height="8" fill="#09090b" />
                <rect x="52" y="52" width="6" height="6" fill="#ff6b00" />

                <rect x="70" y="36" width="5" height="5" fill="#09090b" />
                <rect x="80" y="42" width="5" height="5" fill="#09090b" />
                <rect x="74" y="52" width="5" height="5" fill="#09090b" />
                <rect x="88" y="52" width="5" height="5" fill="#09090b" />

                <rect x="36" y="70" width="5" height="5" fill="#09090b" />
                <rect x="44" y="78" width="5" height="5" fill="#09090b" />
                <rect x="56" y="72" width="5" height="5" fill="#09090b" />
                <rect x="62" y="80" width="5" height="5" fill="#09090b" />
                <rect x="48" y="88" width="5" height="5" fill="#09090b" />

                <rect x="72" y="72" width="6" height="6" fill="#09090b" />
                <rect x="82" y="76" width="6" height="6" fill="#09090b" />
                <rect x="76" y="86" width="6" height="6" fill="#09090b" />
                <rect x="86" y="88" width="6" height="6" fill="#09090b" />
              </svg>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 w-full justify-between mb-2">
              <div className="text-left">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Device ID</div>
                <div className="text-xs font-mono font-bold text-orange-400">{user.id}</div>
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-[10px] truncate max-w-[240px]">
                FP: {user.publicKeyFingerprint}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-semibold text-zinc-100 mb-1">Scan to Connect</h3>
            <p className="text-xs text-zinc-400 mb-4 max-w-[240px]">
              Align nearby device screen or enter their unique ID to initiate secure BLE key exchange.
            </p>

            {/* Viewfinder simulator */}
            <div className="relative w-48 h-48 bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center mb-4 overflow-hidden">
              <div className="absolute inset-x-4 top-2 h-0.5 bg-orange-500 animate-pulse" />
              <Scan className="w-12 h-12 text-zinc-600 mb-2" />
              <span className="text-[11px] text-zinc-400 px-4">
                {scanStatus || 'Point camera at peer QR code'}
              </span>

              <button
                onClick={handleSimulateScan}
                className="mt-3 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Scan Test Peer
              </button>
            </div>

            {/* Manual ID fallback */}
            <form onSubmit={handleManualPair} className="w-full flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. GC-89A1-44B2"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors shrink-0"
              >
                Pair
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

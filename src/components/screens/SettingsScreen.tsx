import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  KeyRound,
  Lock,
  Database,
  Radio,
  Trash2,
  Download,
  AlertTriangle,
  UserX,
  CheckCircle2,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../../types';

interface SettingsScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onResetIdentity: () => void;
  onOpenAndroidStudio: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onNavigate,
  onResetIdentity,
  onOpenAndroidStudio,
}) => {
  const [dbEncryption, setDbEncryption] = useState(true);
  const [bleEnabled, setBleEnabled] = useState(true);
  const [wifiDirectEnabled, setWifiDirectEnabled] = useState(true);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleExportKey = () => {
    const keyData = JSON.stringify(
      {
        app: 'GLOBAL_CONNECT_IDENTITY_BACKUP',
        userId: user.id,
        username: user.username,
        fingerprint: user.publicKeyFingerprint,
        format: 'PKCS#8_AES256_WRAPPED',
        timestamp: Date.now(),
      },
      null,
      2
    );

    const blob = new Blob([keyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GlobalConnect-KeyBackup-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupNotice('Encrypted private key bundle downloaded safely!');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onNavigate('profile')}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Security & Settings</h2>
          <p className="text-xs text-zinc-400">Cryptographic Invariants & Physical Radios</p>
        </div>
      </div>

      {backupNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Security Section */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
          <Shield className="w-4 h-4" />
          <span>End-to-End Cryptography</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-zinc-200">Room Database SQLCipher</div>
            <div className="text-[11px] text-zinc-400">AES-256 PBKDF2 Encrypted SQLite at rest</div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
            ENCRYPTED
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
          <div>
            <div className="font-semibold text-zinc-200">Hardware Key Protection</div>
            <div className="text-[11px] text-zinc-400">
              Private keys stored in Android KeyStore StrongBox
            </div>
          </div>
          <button
            onClick={handleExportKey}
            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3 text-orange-400" />
            <span>Export Key</span>
          </button>
        </div>
      </div>

      {/* Physical Hardware Radios */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Physical Radio Tranceivers</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-zinc-200">Bluetooth Low Energy (BLE 5.2)</div>
            <div className="text-[11px] text-zinc-400">Nearby discovery & advertising beacons</div>
          </div>
          <button
            onClick={() => setBleEnabled(!bleEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              bleEnabled ? 'bg-orange-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                bleEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
          <div>
            <div className="font-semibold text-zinc-200">Wi-Fi Direct (P2P High-Speed)</div>
            <div className="text-[11px] text-zinc-400">Direct TCP sockets for voice & video</div>
          </div>
          <button
            onClick={() => setWifiDirectEnabled(!wifiDirectEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              wifiDirectEnabled ? 'bg-orange-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                wifiDirectEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Android Studio Developer Tools */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-zinc-200">Android Studio Project</div>
            <div className="text-[11px] text-zinc-400">
              Inspect Kotlin source, Room schemas, and build APK
            </div>
          </div>
          <button
            onClick={onOpenAndroidStudio}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer"
          >
            Open Inspector
          </button>
        </div>
      </div>

      {/* Dangerous Actions */}
      <div className="p-4 rounded-3xl bg-zinc-950 border border-rose-950/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Reset Device Identity</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-normal">
          Wipes local private keys and clears all Room message histories. A new cryptographic user ID
          will be minted.
        </p>
        <button
          onClick={onResetIdentity}
          className="mt-2 w-full py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Wipe Database & Generate New Node</span>
        </button>
      </div>
    </div>
  );
};

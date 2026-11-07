import React, { useState } from 'react';
import {
  QrCode,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Settings,
  Code2,
  Smartphone,
  LogOut,
  Mail,
  User,
  Database,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../../types';
import { Avatar } from '../Avatar';
import { AuthApiService } from '../../services/authApi';
import { sound } from '../../services/sound';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenQr: () => void;
  onOpenAndroidStudio: () => void;
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onOpenQr,
  onOpenAndroidStudio,
  onLogout,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(user.fullName || user.username);
  const [editBio, setEditBio] = useState(user.bio);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDiscoverable = () => {
    onUpdateUser({ isDiscoverable: !user.isDiscoverable });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    await AuthApiService.updateProfile({
      fullName: editFullName.trim(),
    });
    onUpdateUser({
      fullName: editFullName.trim(),
      bio: editBio.trim(),
    });
    setIsEditing(false);
    setSaveNotice('Profile synchronized with MongoDB!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">User Profile</h2>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono mt-0.5">
            <Database className="w-3 h-3" />
            <span>{user.token ? 'MongoDB Authenticated' : 'Offline Mode'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Security & Radio Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-950/60 border border-rose-600/30 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden">
        <div className="relative mb-3">
          <Avatar seed={user.username} bg={user.avatarBg} size="xl" showStatus status="online" />
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="w-full space-y-2 mb-3">
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-orange-500"
            />
            <input
              type="text"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Status bio"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-300 text-center focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-1 px-3 bg-zinc-800 rounded-xl text-xs text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1 px-3 bg-orange-600 rounded-xl text-xs font-semibold text-white"
              >
                Save to DB
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-base font-bold text-white">{user.fullName || user.username}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-zinc-500 hover:text-white"
                title="Edit name and bio"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-orange-400 font-mono mb-1">@{user.username}</div>
            {user.email && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-2 font-mono">
                <Mail className="w-3 h-3 text-zinc-500" />
                <span>{user.email}</span>
              </div>
            )}
            <p className="text-xs text-zinc-400 mb-3 max-w-[240px]">{user.bio}</p>
          </>
        )}

        {/* Node ID Badge with Copy */}
        <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl px-3 py-1.5 mb-4">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Node ID:</span>
          <span className="text-xs font-mono font-bold text-orange-400">{user.id}</span>
          <button
            onClick={handleCopyId}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title="Copy ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={onOpenQr}
          className="w-full py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-orange-400" />
          <span>Show My Pairing QR Code</span>
        </button>
      </div>

      {/* Android Studio & APK Export Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Android Studio Source Code</h4>
            <p className="text-[11px] text-zinc-400">
              Kotlin, Jetpack Compose, Room, Auth & APK guide
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAndroidStudio}
          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Radio & Cryptographic Parameters */}
      <div className="p-4 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-300">
            {user.isDiscoverable ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-zinc-500" />
            )}
            <div>
              <div className="font-semibold text-zinc-200">BLE Spectrum Visibility</div>
              <div className="text-[10px] text-zinc-500">
                {user.isDiscoverable ? 'Visible to nearby scanners' : 'Stealth mode active'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleDiscoverable}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              user.isDiscoverable ? 'bg-emerald-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                user.isDiscoverable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-800 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>KEY FINGERPRINT</span>
            <span className="text-zinc-200">{user.publicKeyFingerprint}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>ALGORITHM</span>
            <span className="text-zinc-200">ECDH-P256 / AES-256-GCM</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>DATABASE</span>
            <span className="text-emerald-400">MongoDB Atlas / Mongoose</span>
          </div>
        </div>
      </div>
    </div>
  );
};

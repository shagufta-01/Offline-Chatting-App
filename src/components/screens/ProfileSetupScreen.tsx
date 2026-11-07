import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';
import { CryptoService } from '../../services/crypto';
import { Avatar } from '../Avatar';

interface ProfileSetupScreenProps {
  onProfileCreated: (profile: UserProfile) => void;
}

const AVATAR_COLORS = [
  '#FF6B00',
  '#E11D48',
  '#059669',
  '#2563EB',
  '#7C3AED',
  '#D97706',
  '#0D9488',
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onProfileCreated,
}) => {
  const [username, setUsername] = useState('Alex Rivera');
  const [bio, setBio] = useState('Emergency Mesh Responder · Relay Active');
  const [userId, setUserId] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fingerprint, setFingerprint] = useState('7B:8A:F4:11:09:DE:33:51');

  useEffect(() => {
    const id = CryptoService.generateUserId();
    setUserId(id);
    generateKeys();
  }, []);

  const generateKeys = async () => {
    setIsGenerating(true);
    const keys = await CryptoService.generateIdentityKeyPair();
    setFingerprint(keys.publicKeyFingerprint);
    setIsGenerating(false);
  };

  const handleRegenerateId = () => {
    setUserId(CryptoService.generateUserId());
    generateKeys();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const profile: UserProfile = {
      id: userId || CryptoService.generateUserId(),
      username: username.trim(),
      avatarSeed: username.trim(),
      avatarBg: selectedColor,
      bio: bio.trim(),
      publicKeyFingerprint: fingerprint,
      publicKeyPem: 'PUB_KEY_ED25519_VALID',
      createdAt: Date.now(),
      isDiscoverable: true,
      meshRelayEnabled: true,
      maxHops: 5,
      batteryLevel: 92,
      signalStrength: -48,
    };

    onProfileCreated(profile);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black text-zinc-100 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400">
            Step 1 of 1 · Local Identity
          </span>
          <button
            onClick={handleRegenerateId}
            disabled={isGenerating}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            title="Roll new cryptographic identity"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Set Up Your Node</h2>
        <p className="text-xs text-zinc-400 mb-6">
          This profile lives exclusively on your phone's encrypted Room SQLite database.
        </p>

        {/* Avatar Preview & Palette */}
        <div className="flex flex-col items-center mb-6">
          <Avatar
            seed={username || 'GC'}
            bg={selectedColor}
            size="xl"
            className="mb-3"
          />
          <div className="flex items-center gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Radio Call Sign / Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Status Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. In basecamp · Relay ready"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Cryptographic Node Card */}
          <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                <span>Node ID</span>
              </span>
              <span className="font-mono text-orange-400 font-semibold">{userId}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Key Fingerprint</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-300 truncate max-w-[160px]">
                {fingerprint}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <span>Initialize Node & Enter App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <p className="text-[10px] text-center text-zinc-500 mt-4">
        Protected by hardware-backed Android KeyStore & SQLiteCipher
      </p>
    </div>
  );
};

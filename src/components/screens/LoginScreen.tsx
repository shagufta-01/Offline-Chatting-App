import React, { useState } from 'react';
import {
  Radio,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Database,
  WifiOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../../types';
import { AuthApiService } from '../../services/authApi';
import { sound } from '../../services/sound';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (screen: ScreenType) => void;
  onContinueOfflineGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigate,
  onContinueOfflineGuest,
}) => {
  const [identifier, setIdentifier] = useState('alex@globalconnect.org');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    sound.playTap();

    try {
      const res = await AuthApiService.login({
        identifier: identifier.trim(),
        password,
      });

      if (res.success && res.user) {
        sound.playConnected();
        setSuccessMessage(res.message || 'Logged in successfully!');

        const profile: UserProfile = {
          id: res.user.id,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          profilePicture: res.user.profilePicture,
          token: res.token,
          isAuthenticated: true,
          avatarSeed: res.user.username,
          avatarBg: '#FF6B00',
          bio: 'Verified Global Connect User · Relay Active',
          publicKeyFingerprint: res.user.publicKey || '8F:42:0B:99:A1:77:E2:30',
          publicKeyPem: 'PUB_KEY_VERIFIED',
          createdAt: typeof res.user.createdAt === 'number' ? res.user.createdAt : Date.now(),
          isDiscoverable: true,
          meshRelayEnabled: true,
          maxHops: 5,
          batteryLevel: 94,
          signalStrength: -40,
        };

        setTimeout(() => {
          onLoginSuccess(profile);
        }, 400);
      } else {
        setErrorMessage(res.message || 'Invalid username/email or password.');
      }
    } catch (err) {
      setErrorMessage('Connection error. You can continue in Offline Mesh Mode below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (user: 'alex' | 'sam') => {
    if (user === 'alex') {
      setIdentifier('alex@globalconnect.org');
      setPassword('Password123!');
    } else {
      setIdentifier('sam@globalconnect.org');
      setPassword('Password123!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black text-zinc-100 overflow-y-auto">
      {/* Top Header & Branding */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">GLOBAL CONNECT</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-400">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>MongoDB Auth</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
        <p className="text-xs text-zinc-400 mb-5">
          Sign in to sync your cryptographic profile and connect with nearby devices.
        </p>

        {/* Demo Fast Login Pills */}
        <div className="mb-4 p-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-[11px] space-y-1.5">
          <div className="text-zinc-400 flex items-center justify-between">
            <span>Quick Test Credentials:</span>
            <span className="text-[10px] text-zinc-500 font-mono">pwd: Password123!</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('alex')}
              className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-left truncate font-mono text-[10px]"
            >
              alex@globalconnect.org
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('sam')}
              className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-left truncate font-mono text-[10px]"
            >
              sam@globalconnect.org
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-600/40 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Email or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@domain.com or username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot_password')}
                className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verifying with MongoDB...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sign up prompt */}
        <div className="mt-4 text-center">
          <span className="text-xs text-zinc-400">Don't have an account? </span>
          <button
            onClick={() => onNavigate('register')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
          >
            Create New Account
          </button>
        </div>
      </div>

      {/* Offline Guest Option */}
      <div className="pt-4 border-t border-zinc-900 mt-4">
        <button
          onClick={onContinueOfflineGuest}
          className="w-full py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
        >
          <WifiOff className="w-4 h-4 text-orange-400" />
          <span>Continue in Offline Mesh Mode (No Internet)</span>
        </button>
        <p className="text-[10px] text-center text-zinc-500 mt-2">
          Local BLE & Wi-Fi Direct operate completely without an internet connection
        </p>
      </div>
    </div>
  );
};

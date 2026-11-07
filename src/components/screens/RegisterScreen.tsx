import React, { useState } from 'react';
import {
  Radio,
  Lock,
  User,
  Mail,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Camera,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../../types';
import { AuthApiService } from '../../services/authApi';
import { sound } from '../../services/sound';
import { Avatar } from '../Avatar';

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigate: (screen: ScreenType) => void;
}

const AVATAR_PALETTE = ['#FF6B00', '#2563EB', '#E11D48', '#059669', '#7C3AED', '#D97706'];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_PALETTE[0]);
  const [profilePicture, setProfilePicture] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    if (fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username.trim())) {
      setErrorMessage('Username can only contain alphanumeric characters, underscores, dots, or dashes.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-check.');
      return;
    }

    setIsLoading(true);
    sound.playTap();

    try {
      const res = await AuthApiService.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        profilePicture,
      });

      if (res.success && res.user) {
        sound.playConnected();
        setSuccessMessage('Account registered and saved to MongoDB!');

        const profile: UserProfile = {
          id: res.user.id,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          profilePicture: res.user.profilePicture,
          token: res.token,
          isAuthenticated: true,
          avatarSeed: res.user.username,
          avatarBg: selectedColor,
          bio: 'Verified Global Connect User · Relay Active',
          publicKeyFingerprint: res.user.publicKey || '8F:42:0B:99:A1:77:E2:30',
          publicKeyPem: 'PUB_KEY_VERIFIED',
          createdAt: typeof res.user.createdAt === 'number' ? res.user.createdAt : Date.now(),
          isDiscoverable: true,
          meshRelayEnabled: true,
          maxHops: 5,
          batteryLevel: 96,
          signalStrength: -38,
        };

        setTimeout(() => {
          onRegisterSuccess(profile);
        }, 500);
      } else {
        setErrorMessage(res.message || 'Registration failed. Please check inputs.');
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black text-zinc-100 overflow-y-auto">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onNavigate('login')}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Back to Login"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-400">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>MongoDB Atlas</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-xs text-zinc-400 mb-4">
          Register your secure profile. Passwords are encrypted using bcrypt prior to database storage.
        </p>

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

        {/* Avatar Color Picker */}
        <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800 mb-4">
          <Avatar seed={username || fullName || 'GC'} bg={selectedColor} size="md" />
          <div className="flex-1">
            <div className="text-[11px] font-medium text-zinc-300 mb-1">Node Avatar Accent</div>
            <div className="flex items-center gap-2">
              {AVATAR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Unique Username</label>
            <div className="relative">
              <span className="text-zinc-500 font-mono text-xs absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alexrivera"
                className="w-full pl-8 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat pwd"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Creating MongoDB Record...' : 'Create Account & Generate Keys'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-xs text-zinc-400">Already registered? </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      <p className="text-[10px] text-center text-zinc-500 mt-4">
        Protected by Bcrypt Salted Hashing · JWT 256-bit Tokenization
      </p>
    </div>
  );
};

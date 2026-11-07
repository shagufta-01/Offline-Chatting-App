import React, { useState } from 'react';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ScreenType } from '../../types';
import { sound } from '../../services/sound';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address or username.');
      return;
    }

    setIsLoading(true);
    sound.playTap();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        sound.playConnected();
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || 'Unable to process request.');
      }
    } catch {
      // Offline fallback
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black text-zinc-100 overflow-y-auto">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('login')}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Back to Login"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400">
            Account Recovery
          </span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Enter your registered email address or username to receive password reset instructions.
        </p>

        {isSubmitted ? (
          <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Recovery Dispatched</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              If an account is associated with <span className="font-mono text-white">{identifier}</span> in MongoDB, instructions and a verification token have been dispatched.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors mt-2"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-600/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex@globalconnect.org"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verifying with Database...' : 'Send Recovery Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => onNavigate('login')}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Remember your password? <span className="text-orange-400 font-semibold">Sign In</span>
        </button>
      </div>
    </div>
  );
};

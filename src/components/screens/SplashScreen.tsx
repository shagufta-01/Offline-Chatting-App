import React, { useEffect } from 'react';
import { Radio, ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 bg-black text-zinc-100 select-none">
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Animated Radio Mesh Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-orange-600/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/20 border border-orange-400/30">
            <Radio className="w-10 h-10 text-white stroke-[2.2]" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-wider text-white">
          GLOBAL <span className="text-orange-500">CONNECT</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-2 font-mono tracking-wide">
          OFFLINE P2P MESH NETWORK
        </p>
      </div>

      {/* Bottom status badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero Server · Zero SIM · Zero Internet</span>
        </div>
        <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

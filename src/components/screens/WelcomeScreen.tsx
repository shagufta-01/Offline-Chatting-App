import React from 'react';
import { ArrowRight, Radio, Shield, Users, WifiOff, LogIn, Database } from 'lucide-react';
import { ScreenType } from '../../types';

interface WelcomeScreenProps {
  onStartAuth: () => void;
  onStartOffline: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartAuth,
  onStartOffline,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black text-zinc-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-400">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>MongoDB Auth Ready</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Global Connect Platform
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Decentralized offline mesh communication coupled with MongoDB secure user authentication.
        </p>
      </div>

      {/* Feature Pillars */}
      <div className="my-5 space-y-2.5">
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0 mt-0.5">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">BLE 5.2 & Wi-Fi Direct Mesh</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
              Direct device-to-device voice calls, video streaming, and encrypted chats without cell towers.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">MongoDB Atlas Cloud Authentication</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
              Bcrypt salted password encryption and JWT sessions with offline cache persistence.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">Multi-Hop Store & Forward</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
              Relay encrypted packets across intermediate nodes with duplicate message prevention.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2.5 pb-1">
        <button
          onClick={onStartAuth}
          className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Create Account</span>
        </button>

        <button
          onClick={onStartOffline}
          className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 font-medium text-xs flex items-center justify-center gap-2 border border-zinc-800 transition-all cursor-pointer"
        >
          <WifiOff className="w-4 h-4 text-orange-400" />
          <span>Continue in Offline Mesh Mode</span>
        </button>

        <p className="text-[10px] text-center text-zinc-500 pt-1">
          Operates seamlessly both online with MongoDB and 100% off-grid
        </p>
      </div>
    </div>
  );
};

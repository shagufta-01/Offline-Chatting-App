import React, { useState, useEffect } from 'react';
import { Bluetooth, Wifi, BatteryCharging, Radio, ShieldCheck } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  deviceName?: string;
  isMeshActive?: boolean;
  batteryLevel?: number;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  deviceName = 'Pixel 8 Pro (Offline Mode)',
  isMeshActive = true,
  batteryLevel = 88,
}) => {
  const [time, setTime] = useState('10:42');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[420px] h-[850px] max-h-[92vh] bg-black text-zinc-100 rounded-[44px] flex flex-col overflow-hidden border-[8px] border-zinc-900 shadow-2xl ring-1 ring-zinc-800/80">
      {/* Front camera notch / hole-punch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rounded-full border border-zinc-800 z-50 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
      </div>

      {/* Android Status Bar */}
      <div className="h-9 px-6 pt-1.5 flex items-center justify-between text-[11px] font-mono tracking-tight text-zinc-400 select-none shrink-0 z-40 bg-black/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">{time}</span>
          <div className="flex items-center gap-1 text-[10px] text-orange-500 font-sans font-medium px-1.5 py-0.2 rounded bg-orange-950/60 border border-orange-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse text-orange-400" />
            <span>P2P</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span title="BLE 5.2 Active">
            <Bluetooth className="w-3.5 h-3.5 text-zinc-300" />
          </span>
          <span title="Wi-Fi Direct Active">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] tabular-nums text-zinc-300">{batteryLevel}%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Screen Body */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-[#070709]">
        {children}
      </div>

      {/* Android Bottom Home Gesture Indicator */}
      <div className="h-5 flex items-center justify-center shrink-0 bg-black">
        <div className="w-28 h-1 bg-zinc-700/80 rounded-full" />
      </div>
    </div>
  );
};

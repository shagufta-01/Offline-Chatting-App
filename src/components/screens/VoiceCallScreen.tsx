import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Phone,
  ShieldCheck,
  Radio,
  RadioTower,
} from 'lucide-react';
import { CallSession, ScreenType } from '../../types';
import { Avatar } from '../Avatar';

interface VoiceCallScreenProps {
  session: CallSession;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  session,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
  onNavigate,
}) => {
  const [seconds, setSeconds] = useState(session.durationSeconds || 0);

  useEffect(() => {
    let interval: number | null = null;
    if (session.state === 'connected') {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.state]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isIncoming = session.state === 'incoming_ringing';
  const isOutgoing = session.state === 'outgoing_ringing';
  const isConnected = session.state === 'connected';

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-zinc-100 select-none">
      {/* Top Bar */}
      <div className="flex flex-col items-center pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Direct WebRTC P2P Voice (Opus 48kHz)</span>
        </div>
        <div className="text-xs text-zinc-400 font-mono tracking-wider">
          {isConnected ? (
            <span className="text-emerald-400 font-semibold">{formatDuration(seconds)}</span>
          ) : isIncoming ? (
            <span className="text-orange-400 animate-pulse font-medium">INCOMING P2P CALL...</span>
          ) : (
            <span className="text-zinc-400 animate-pulse">DIALING DIRECT RF SOCKET...</span>
          )}
        </div>
      </div>

      {/* Center Avatar & Audio Waveform */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          {/* Pulsing ring during ringing or active speech */}
          <div
            className={`absolute -inset-4 rounded-full border-2 ${
              isConnected
                ? 'border-emerald-500/30 animate-pulse'
                : 'border-orange-500/30 animate-ping'
            }`}
          />
          <Avatar
            seed={session.remoteUser.username}
            bg={session.remoteUser.avatarBg}
            size="xl"
            showStatus
            status={isConnected ? 'online' : 'relaying'}
          />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {session.remoteUser.username}
        </h2>
        <span className="text-xs font-mono text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20 mb-4">
          {session.remoteUser.id}
        </span>

        {/* Audio waveform visualization */}
        {isConnected && (
          <div className="flex items-center gap-1 h-8 px-4 py-1 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            {[40, 75, 30, 90, 60, 45, 85, 35, 70, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full animate-pulse"
                style={{
                  height: `${session.isMuted ? 4 : h}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="pb-4">
        {isIncoming ? (
          <div className="flex items-center justify-around gap-6">
            <button
              onClick={onReject}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">Decline</span>
            </button>

            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 transition-all cursor-pointer animate-bounce"
              title="Accept Call"
            >
              <Phone className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Toggle bar */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onToggleMute}
                className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  session.isMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
                title={session.isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {session.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={onToggleSpeaker}
                className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  session.isSpeakerOn
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
                title={session.isSpeakerOn ? 'Speakerphone Active' : 'Earpiece Mode'}
              >
                {session.isSpeakerOn ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* End Call Button */}
            <div className="flex justify-center">
              <button
                onClick={onEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">End</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

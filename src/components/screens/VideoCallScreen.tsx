import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  SwitchCamera,
  PhoneOff,
  ShieldCheck,
  Radio,
  Settings2,
} from 'lucide-react';
import { CallSession, ScreenType } from '../../types';
import { webRtcMedia } from '../../services/webrtc';
import { Avatar } from '../Avatar';

interface VideoCallScreenProps {
  session: CallSession;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCameraFacing: () => void;
  onChangeQuality: (quality: '480p' | '720p' | '1080p') => void;
  onNavigate: (screen: ScreenType) => void;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  session,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onSwitchCameraFacing,
  onChangeQuality,
  onNavigate,
}) => {
  const [seconds, setSeconds] = useState(session.durationSeconds || 0);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCam = async () => {
      try {
        const stream = await webRtcMedia.acquireMedia(
          !session.isCameraOff,
          !session.isMuted,
          session.isFrontCamera ? 'user' : 'environment'
        );
        activeStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (remoteVideoRef.current) {
          // For local simulation, remote video mirrors synthetic stream or active stream
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Could not initialize video feed:', err);
      }
    };
    startCam();

    return () => {
      webRtcMedia.stopMedia();
    };
  }, [session.isFrontCamera, session.isCameraOff]);

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

  return (
    <div className="relative flex-1 flex flex-col bg-black text-zinc-100 overflow-hidden select-none">
      {/* Main Remote Video Feed (Full Screen) */}
      <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Top Floating App Bar */}
      <div className="relative z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            seed={session.remoteUser.username}
            bg={session.remoteUser.avatarBg}
            size="sm"
          />
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">
              {session.remoteUser.username}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatDuration(seconds)}</span>
              <span>·</span>
              <span className="uppercase text-zinc-400 font-sans">{session.videoQuality}</span>
            </div>
          </div>
        </div>

        {/* Quality switch button */}
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu((prev) => !prev)}
            className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Adjust Video Quality"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {showQualityMenu && (
            <div className="absolute right-0 top-11 w-32 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-xl text-xs space-y-1 z-30">
              {(['480p', '720p', '1080p'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    onChangeQuality(q);
                    setShowQualityMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg transition-colors ${
                    session.videoQuality === q
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {q} {q === '720p' ? '(Recommended)' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Picture-in-Picture Local Camera View */}
      <div className="absolute top-16 right-4 z-20 w-28 h-36 rounded-2xl bg-zinc-900 border-2 border-white/20 shadow-2xl overflow-hidden">
        {session.isCameraOff ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
            <VideoOff className="w-6 h-6 mb-1 text-zinc-600" />
            <span className="text-[9px]">Camera Off</span>
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
      </div>

      {/* Bottom Floating Control Strip */}
      <div className="relative z-20 mt-auto p-5 flex flex-col items-center gap-4">
        {/* Security badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Wi-Fi Direct Stream · Direct WebRTC VP9</span>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
              session.isMuted
                ? 'bg-rose-500/80 text-white'
                : 'bg-zinc-900/80 backdrop-blur-md text-zinc-200 hover:bg-zinc-800 border border-white/10'
            }`}
            title={session.isMuted ? 'Unmute' : 'Mute'}
          >
            {session.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleCamera}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
              session.isCameraOff
                ? 'bg-rose-500/80 text-white'
                : 'bg-zinc-900/80 backdrop-blur-md text-zinc-200 hover:bg-zinc-800 border border-white/10'
            }`}
            title={session.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {session.isCameraOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <VideoIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onSwitchCameraFacing}
            className="w-12 h-12 rounded-2xl bg-zinc-900/80 backdrop-blur-md text-zinc-200 hover:bg-zinc-800 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Flip Front/Back Camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>

          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-all cursor-pointer"
            title="End Video Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

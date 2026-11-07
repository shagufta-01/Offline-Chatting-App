import React from 'react';
import {
  Radio,
  Wifi,
  ShieldCheck,
  QrCode,
  Users,
  Send,
  PhoneCall,
  Video,
  Network,
  Share2,
  ChevronRight,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Conversation, NearbyDevice, ScreenType, UserProfile } from '../../types';
import { Avatar } from '../Avatar';

interface DashboardScreenProps {
  user: UserProfile;
  nearbyDevices: NearbyDevice[];
  conversations: Conversation[];
  onNavigate: (screen: ScreenType) => void;
  onOpenQr: () => void;
  onSelectConversation: (convoId: string) => void;
  onTriggerSos: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  nearbyDevices,
  conversations,
  onNavigate,
  onOpenQr,
  onSelectConversation,
  onTriggerSos,
}) => {
  const connectedCount = nearbyDevices.filter(d => d.connectionState === 'connected').length;

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Avatar
            seed={user.username}
            bg={user.avatarBg}
            size="md"
            showStatus
            status="online"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {user.fullName || user.username}
              </h2>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/20">
                {user.id}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span className="font-mono text-orange-400/90">@{user.username}</span>
              <span>·</span>
              <span className={user.token ? 'text-emerald-400' : 'text-zinc-500'}>
                {user.token ? 'MongoDB Synced' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQr}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/30 transition-colors"
            title="Show QR Code"
            aria-label="QR Pairing"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={onTriggerSos}
            className="p-2 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
            title="Emergency Mesh Broadcast"
            aria-label="Emergency SOS"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Connectivity Status Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800/90 relative overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                P2P MESH ACTIVE
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Local Off-Grid Net</h3>
            <p className="text-[11px] text-zinc-400">Zero Internet · Direct RF Channels</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
          <div className="p-2 rounded-xl bg-zinc-900/80">
            <div className="text-base font-bold text-white tabular-nums">{nearbyDevices.length}</div>
            <div className="text-[10px] text-zinc-400">Nearby Nodes</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80">
            <div className="text-base font-bold text-emerald-400 tabular-nums">{connectedCount}</div>
            <div className="text-[10px] text-zinc-400">Connected</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80">
            <div className="text-base font-bold text-orange-400 tabular-nums">5 Hops</div>
            <div className="text-[10px] text-zinc-400">Max Relay</div>
          </div>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Direct Actions
          </span>
          <button
            onClick={() => onNavigate('mesh_network')}
            className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-0.5"
          >
            <span>Network Map</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigate('nearby')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-zinc-300">Radar</span>
          </button>

          <button
            onClick={() => onNavigate('group_chat')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-zinc-300">Mesh Hub</span>
          </button>

          <button
            onClick={() => onNavigate('voice_call')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-zinc-300">Voice Call</span>
          </button>

          <button
            onClick={() => onNavigate('video_call')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-zinc-300">Video Call</span>
          </button>
        </div>
      </div>

      {/* Nearby Peers Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Detected Peers ({nearbyDevices.length})
          </span>
          <button
            onClick={() => onNavigate('nearby')}
            className="text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            View all
          </button>
        </div>

        <div className="space-y-2">
          {nearbyDevices.slice(0, 3).map((device) => (
            <div
              key={device.id}
              className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  seed={device.username}
                  bg={device.avatarBg}
                  size="sm"
                  showStatus
                  status={device.connectionState === 'connected' ? 'online' : 'relaying'}
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{device.username}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                    <span>{device.id}</span>
                    <span>·</span>
                    <span className="text-orange-400 font-sans">{device.protocol}</span>
                    <span>·</span>
                    <span className="tabular-nums">{device.rssi} dBm</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {device.connectionState === 'connected' ? (
                  <button
                    onClick={() => onNavigate('individual_chat')}
                    className="px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Chat
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-medium">Ready</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Chats Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recent Communications
          </span>
          <button
            onClick={() => onNavigate('chat_list')}
            className="text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            All chats
          </button>
        </div>

        <div className="space-y-2">
          {conversations.slice(0, 2).map((convo) => (
            <div
              key={convo.id}
              onClick={() => onSelectConversation(convo.id)}
              className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar seed={convo.name} bg={convo.avatarBg} size="sm" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{convo.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                    {convo.lastMessage ? convo.lastMessage.content : 'No messages yet'}
                  </div>
                </div>
              </div>

              {convo.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {convo.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

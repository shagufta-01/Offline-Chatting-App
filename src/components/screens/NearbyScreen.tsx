import React, { useState } from 'react';
import {
  Radio,
  Bluetooth,
  Wifi,
  Shield,
  UserPlus,
  Check,
  Clock,
  Filter,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { NearbyDevice, ScreenType } from '../../types';
import { Avatar } from '../Avatar';

interface NearbyScreenProps {
  devices: NearbyDevice[];
  onConnectRequest: (deviceId: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onRefreshDiscovery: () => void;
  isScanning: boolean;
  pendingRequestsCount: number;
}

export const NearbyScreen: React.FC<NearbyScreenProps> = ({
  devices,
  onConnectRequest,
  onNavigate,
  onRefreshDiscovery,
  isScanning,
  pendingRequestsCount,
}) => {
  const [filter, setFilter] = useState<'all' | 'connected' | 'relay'>('all');

  const filteredDevices = devices.filter((d) => {
    if (filter === 'connected') return d.connectionState === 'connected';
    if (filter === 'relay') return d.isRelayNode;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Nearby People</h2>
          <p className="text-xs text-zinc-400">Bluetooth LE & Wi-Fi Direct Scanning</p>
        </div>

        <div className="flex items-center gap-2">
          {pendingRequestsCount > 0 && (
            <button
              onClick={() => onNavigate('requests')}
              className="px-2.5 py-1 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Requests</span>
              <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            </button>
          )}

          <button
            onClick={onRefreshDiscovery}
            disabled={isScanning}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Scan nearby spectrum"
            aria-label="Refresh Scan"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Interactive Radar Visualizer */}
      <div className="relative h-44 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden">
        {/* Radar concentric rings */}
        <div className="absolute w-64 h-64 rounded-full border border-zinc-800/40 pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-zinc-800/60 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full border border-orange-500/20 pointer-events-none" />

        {/* Radar sweeping beam */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-orange-500/10 to-orange-500/20 rounded-tl-full origin-bottom-right animate-[spin_4s_linear_infinite]" />
        </div>

        {/* Center node (local device) */}
        <div className="relative z-10 w-9 h-9 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center shadow-lg shadow-orange-600/40">
          <Radio className="w-4 h-4 text-white animate-pulse" />
        </div>

        {/* Discovered nodes positioned on radar */}
        {filteredDevices.slice(0, 5).map((device, index) => {
          const angles = [0.4, 1.8, 3.2, 4.6, 5.8];
          const dists = [45, 65, 55, 75, 40];
          const angle = angles[index % angles.length];
          const dist = dists[index % dists.length];
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;

          return (
            <div
              key={device.id}
              className="absolute z-10 transition-transform duration-500 flex flex-col items-center group cursor-pointer"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => onConnectRequest(device.id)}
            >
              <Avatar
                seed={device.username}
                bg={device.avatarBg}
                size="xs"
                showStatus
                status={device.connectionState === 'connected' ? 'online' : 'relaying'}
              />
              <span className="text-[9px] font-mono text-zinc-300 bg-zinc-950/80 px-1 rounded border border-zinc-800 mt-0.5 whitespace-nowrap">
                {device.username.split(' ')[0]}
              </span>
            </div>
          );
        })}

        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-zinc-500">
          {filteredDevices.length} NODES IN RANGE
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors ${
            filter === 'all'
              ? 'bg-zinc-800 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({devices.length})
        </button>
        <button
          onClick={() => setFilter('connected')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors ${
            filter === 'connected'
              ? 'bg-zinc-800 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Connected ({devices.filter(d => d.connectionState === 'connected').length})
        </button>
        <button
          onClick={() => setFilter('relay')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors ${
            filter === 'relay'
              ? 'bg-zinc-800 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Relay Nodes
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-2 pb-2">
        {filteredDevices.map((device) => {
          const isConnected = device.connectionState === 'connected';
          const isRequested = device.connectionState === 'requested';

          return (
            <div
              key={device.id}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  seed={device.username}
                  bg={device.avatarBg}
                  size="md"
                  showStatus
                  status={isConnected ? 'online' : 'relaying'}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-100">{device.username}</span>
                    {device.isRelayNode && (
                      <span className="text-[9px] text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-500/20">
                        Relay
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                    <span>{device.id}</span>
                    <span>·</span>
                    <span className="text-orange-400 font-sans">{device.protocol}</span>
                    <span>·</span>
                    <span className="tabular-nums">{device.rssi} dBm</span>
                    <span>·</span>
                    <span className="tabular-nums">~{device.distanceMeters}m</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate max-w-[170px] mt-0.5">
                    FP: {device.publicKeyFingerprint}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isConnected ? (
                  <button
                    onClick={() => onNavigate('individual_chat')}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Message</span>
                  </button>
                ) : isRequested ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-medium flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Pending</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onConnectRequest(device.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                    <span>Pair</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

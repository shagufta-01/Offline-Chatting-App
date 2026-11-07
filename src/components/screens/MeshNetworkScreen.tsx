import React, { useState } from 'react';
import {
  Network,
  Radio,
  Share2,
  ShieldCheck,
  Send,
  Zap,
  Layers,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { MeshNodeTopology, UserProfile } from '../../types';

interface MeshNetworkScreenProps {
  user: UserProfile;
  nodes: MeshNodeTopology[];
  onDispatchTestPacket: () => void;
  onUpdateMaxHops: (hops: number) => void;
  onToggleRelay: (enabled: boolean) => void;
  activePacketRoute: string[];
}

export const MeshNetworkScreen: React.FC<MeshNetworkScreenProps> = ({
  user,
  nodes,
  onDispatchTestPacket,
  onUpdateMaxHops,
  onToggleRelay,
  activePacketRoute,
}) => {
  const [selectedHops, setSelectedHops] = useState(user.maxHops || 5);
  const [relayEnabled, setRelayEnabled] = useState(user.meshRelayEnabled);

  const handleHopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSelectedHops(val);
    onUpdateMaxHops(val);
  };

  const handleToggle = () => {
    const next = !relayEnabled;
    setRelayEnabled(next);
    onToggleRelay(next);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Mesh Networking</h2>
          <p className="text-xs text-zinc-400">Decentralized Multi-Hop Relay Infrastructure</p>
        </div>

        <button
          onClick={onDispatchTestPacket}
          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-orange-600/20 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Test Relay</span>
        </button>
      </div>

      {/* Interactive Topology Graph Canvas */}
      <div className="relative h-64 rounded-3xl bg-zinc-950 border border-zinc-800/80 p-2 overflow-hidden flex flex-col justify-between">
        {/* SVG connection lines between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node) =>
            node.connectedTo.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;
              const isRouteActive =
                activePacketRoute.includes(node.id) &&
                activePacketRoute.includes(target.id);

              return (
                <line
                  key={`${node.id}-${target.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={isRouteActive ? '#ff6b00' : '#27272a'}
                  strokeWidth={isRouteActive ? '3' : '1.5'}
                  strokeDasharray={isRouteActive ? '4 2' : undefined}
                  className={isRouteActive ? 'animate-pulse' : ''}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isLocal = node.id === user.id;
          const isInActiveRoute = activePacketRoute.includes(node.id);

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center select-none"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-xs font-bold border transition-all shadow-md ${
                  isLocal
                    ? 'bg-orange-600 border-white text-white ring-4 ring-orange-500/30'
                    : isInActiveRoute
                    ? 'bg-emerald-600 border-white text-white scale-110'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {isLocal ? <Radio className="w-4 h-4 text-white" /> : node.name.slice(0, 2)}
              </div>
              <span
                className={`text-[9px] font-mono mt-1 px-1.5 py-0.2 rounded whitespace-nowrap ${
                  isLocal
                    ? 'bg-orange-950 text-orange-400 font-bold border border-orange-500/30'
                    : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800'
                }`}
              >
                {node.name}
              </span>
            </div>
          );
        })}

        {/* Overlay Route Banner */}
        <div className="relative z-20 flex items-center justify-between px-2 pt-1 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DYNAMIC TOPOLOGY MAP</span>
          </div>
          <div>5 ACTIVE PEERS</div>
        </div>

        <div className="relative z-20 px-2 pb-1 text-[10px] text-zinc-400 bg-black/60 backdrop-blur-sm rounded-xl p-1.5 border border-white/5">
          {activePacketRoute.length > 0 ? (
            <span className="text-orange-400 font-mono">
              Packet in transit: {activePacketRoute.join(' ➔ ')}
            </span>
          ) : (
            <span>Tap "Test Relay" to broadcast simulated multi-hop packet.</span>
          )}
        </div>
      </div>

      {/* Mesh Configuration Controls */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Mesh Relay Engine Settings
        </h3>

        {/* Toggle Relay Mode */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-100">Participate in Packet Relaying</div>
            <div className="text-[11px] text-zinc-400">
              Forward encrypted packets for peers out of direct range
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              relayEnabled ? 'bg-orange-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                relayEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Max Hops Slider */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-200">Maximum Relay Hops (TTL)</span>
            <span className="font-mono font-bold text-orange-400 tabular-nums">
              {selectedHops} hops
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            step={1}
            value={selectedHops}
            onChange={handleHopChange}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>1 (Direct only)</span>
            <span>3 (Standard)</span>
            <span>7 (Deep Mesh)</span>
          </div>
        </div>
      </div>

      {/* Store and forward stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Deduplication</span>
          </div>
          <div className="text-sm font-bold text-white tabular-nums">1,248 packets</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">SHA-256 Bloom Filter cache</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Store & Forward</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 tabular-nums">0 queued</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">All offline buffers flushed</div>
        </div>
      </div>
    </div>
  );
};

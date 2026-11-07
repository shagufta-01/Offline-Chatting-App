import React from 'react';
import { ArrowLeft, Check, X, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { ConnectionRequest, ScreenType } from '../../types';
import { Avatar } from '../Avatar';

interface RequestsScreenProps {
  requests: ConnectionRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const RequestsScreen: React.FC<RequestsScreenProps> = ({
  requests,
  onAccept,
  onReject,
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-1 mb-4">
        <button
          onClick={() => onNavigate('nearby')}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Pairing Requests</h2>
          <p className="text-xs text-zinc-400">Incoming BLE Key Exchange Invitations</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
          <Clock className="w-12 h-12 text-zinc-700 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300 mb-1">No Pending Requests</h3>
          <p className="text-xs text-zinc-500 max-w-xs">
            Nearby users within radio range will appear here when they request to connect.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    seed={req.fromUser.username}
                    bg={req.fromUser.avatarBg}
                    size="md"
                    showStatus
                    status="online"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{req.fromUser.username}</h3>
                    <div className="text-[11px] font-mono text-orange-400">{req.fromUser.id}</div>
                    <div className="text-[10px] text-zinc-400 tabular-nums">
                      RSSI: {req.fromUser.rssi} dBm (Direct BLE)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Fingerprint check */}
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[10px] font-mono text-zinc-400">
                <span className="text-zinc-500 uppercase mr-1">Public Key:</span>
                <span className="text-zinc-300 break-all">{req.fromUser.fingerprint}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onReject(req.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => onAccept(req.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Pair</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Plus, Users, MessageSquare, ShieldCheck, CheckCheck } from 'lucide-react';
import { Conversation, ScreenType } from '../../types';
import { Avatar } from '../Avatar';

interface ChatListScreenProps {
  conversations: Conversation[];
  onSelectConversation: (convoId: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  conversations,
  onSelectConversation,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'groups'>('all');

  const filtered = conversations.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'direct') return !c.isGroup;
    if (filter === 'groups') return c.isGroup;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 bg-black text-zinc-100 overflow-y-auto space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Offline Chats</h2>
          <p className="text-xs text-zinc-400">Encrypted Local Room DB Storage</p>
        </div>

        <button
          onClick={() => onNavigate('group_chat')}
          className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer"
          title="New Mesh Group Hub"
          aria-label="New Group"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search peers or mesh groups..."
          className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs font-medium">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({conversations.length})
        </button>
        <button
          onClick={() => setFilter('direct')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            filter === 'direct' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Direct (1-on-1)
        </button>
        <button
          onClick={() => setFilter('groups')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            filter === 'groups' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Mesh Hubs
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-1.5 flex-1">
        {filtered.map((convo) => {
          const lastMsg = convo.lastMessage;
          const timeStr = lastMsg
            ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })
            : '';

          return (
            <div
              key={convo.id}
              onClick={() => onSelectConversation(convo.id)}
              className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  seed={convo.name}
                  bg={convo.avatarBg}
                  size="md"
                  showStatus={!convo.isGroup}
                  status="online"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100 truncate">{convo.name}</span>
                    {convo.isGroup && (
                      <span className="text-[9px] text-blue-400 bg-blue-950/60 px-1 py-0.2 rounded border border-blue-500/20">
                        Mesh Hub
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-[190px]">
                    {lastMsg ? (
                      <span className="flex items-center gap-1">
                        {lastMsg.status === 'read' && (
                          <CheckCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
                        )}
                        <span>{lastMsg.content}</span>
                      </span>
                    ) : (
                      'Direct link open'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                <span className="text-[10px] font-mono text-zinc-500">{timeStr}</span>
                {convo.unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {convo.unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

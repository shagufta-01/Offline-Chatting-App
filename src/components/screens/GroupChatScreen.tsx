import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Send,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ChatMessage, Conversation, ScreenType, UserProfile } from '../../types';
import { Avatar } from '../Avatar';

interface GroupChatScreenProps {
  conversation: Conversation;
  messages: ChatMessage[];
  currentUser: UserProfile;
  onSendMessage: (content: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const GroupChatScreen: React.FC<GroupChatScreenProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-zinc-100 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-3 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => onNavigate('chat_list')}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar seed={conversation.name} bg={conversation.avatarBg} size="sm" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white truncate">{conversation.name}</h3>
              <span className="text-[9px] text-blue-400 bg-blue-950/60 px-1 rounded border border-blue-500/20">
                Broadcast Hub
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
              <Radio className="w-2.5 h-2.5 text-orange-400 animate-pulse" />
              <span>{conversation.participantIds.length} Nodes in Local Mesh</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('mesh_network')}
          className="px-2 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1"
          title="Inspect Mesh Nodes"
        >
          <Info className="w-3.5 h-3.5 text-orange-400" />
          <span>Topology</span>
        </button>
      </div>

      {/* Broadcast Notice Banner */}
      <div className="px-3 py-1.5 bg-zinc-950/90 border-b border-zinc-900 flex items-center gap-2 text-[10px] text-zinc-400">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Packets sent here are store-and-forwarded up to 5 hops across the area.</span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {!isMe && (
                <span className="text-[10px] font-semibold text-orange-400 mb-0.5 ml-1">
                  {msg.senderName}
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                  isMe
                    ? 'bg-orange-600 text-white rounded-br-xs'
                    : 'bg-zinc-900 text-zinc-100 rounded-bl-xs border border-zinc-800'
                }`}
              >
                <p className="leading-relaxed break-words">{msg.content}</p>
                <div
                  className={`flex items-center justify-end gap-1.5 text-[9px] mt-1 font-mono ${
                    isMe ? 'text-orange-200' : 'text-zinc-500'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    <Radio className="w-2.5 h-2.5" />
                    <span>{msg.hops} hops</span>
                  </span>
                  <span>·</span>
                  <span>{time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-2.5 bg-zinc-950 border-t border-zinc-900 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Broadcast mesh update..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white transition-all cursor-pointer shadow-md shadow-orange-600/20"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

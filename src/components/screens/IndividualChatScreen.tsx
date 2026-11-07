import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  PhoneCall,
  Video,
  Send,
  Paperclip,
  Smile,
  ShieldCheck,
  Check,
  CheckCheck,
  Radio,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { ChatMessage, Conversation, ScreenType, UserProfile } from '../../types';
import { Avatar } from '../Avatar';

interface IndividualChatScreenProps {
  conversation: Conversation;
  messages: ChatMessage[];
  currentUser: UserProfile;
  onSendMessage: (content: string, attachment?: ChatMessage['attachment']) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onNavigate: (screen: ScreenType) => void;
}

const QUICK_EMOJIS = ['👍', '📻', '🔥', '📍', '⚠️', '🛡️', '✅', '👋'];

export const IndividualChatScreen: React.FC<IndividualChatScreenProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onStartCall,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    url: string;
    type: 'image' | 'file';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;

    onSendMessage(
      inputText.trim() || (selectedAttachment ? `[Shared ${selectedAttachment.name}]` : ''),
      selectedAttachment
        ? {
            type: selectedAttachment.type,
            name: selectedAttachment.name,
            url: selectedAttachment.url,
          }
        : undefined
    );

    setInputText('');
    setSelectedAttachment(null);
    setShowEmojiBar(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setSelectedAttachment({
        name: file.name,
        url,
        type: file.type.startsWith('image/') ? 'image' : 'file',
      });
    };
    reader.readAsDataURL(file);
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

          <Avatar
            seed={conversation.name}
            bg={conversation.avatarBg}
            size="sm"
            showStatus
            status="online"
          />

          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate">{conversation.name}</h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Wi-Fi P2P · E2EE</span>
            </div>
          </div>
        </div>

        {/* Call Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Start Offline Voice Call"
            aria-label="Voice Call"
          >
            <PhoneCall className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-purple-400 transition-colors cursor-pointer"
            title="Start Offline Video Call"
            aria-label="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="px-3 py-1 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>AES-GCM 256 E2E Encrypted · Zero Cloud Transit</span>
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
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                  isMe
                    ? 'bg-orange-600 text-white rounded-br-xs'
                    : 'bg-zinc-900 text-zinc-100 rounded-bl-xs border border-zinc-800/80'
                }`}
              >
                {/* Image / File attachment */}
                {msg.attachment && (
                  <div className="mb-2">
                    {msg.attachment.type === 'image' ? (
                      <img
                        src={msg.attachment.url}
                        alt="attachment"
                        className="rounded-xl max-h-40 w-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-2 rounded-xl bg-black/30 flex items-center gap-2 border border-white/10">
                        <Paperclip className="w-4 h-4 text-orange-300" />
                        <span className="text-[11px] truncate">{msg.attachment.name}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="leading-relaxed break-words">{msg.content}</p>

                {/* Message footer metadata */}
                <div
                  className={`flex items-center justify-end gap-1 text-[9px] mt-1 font-mono ${
                    isMe ? 'text-orange-200' : 'text-zinc-500'
                  }`}
                >
                  {msg.hops > 0 && (
                    <span className="flex items-center gap-0.5" title={`Relayed via ${msg.hops} mesh hops`}>
                      <Radio className="w-2.5 h-2.5" />
                      <span>{msg.hops}h</span>
                    </span>
                  )}
                  <span>{time}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-emerald-300 inline" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3 h-3 text-zinc-300 inline" />
                      ) : (
                        <Check className="w-3 h-3 text-zinc-300 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Strip */}
      {showEmojiBar && (
        <div className="px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-base p-1 hover:bg-zinc-800 rounded-lg transition-transform active:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Selected Attachment Preview */}
      {selectedAttachment && (
        <div className="px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="truncate">{selectedAttachment.name}</span>
          </div>
          <button
            onClick={() => setSelectedAttachment(null)}
            className="p-1 hover:text-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-2.5 bg-zinc-950 border-t border-zinc-900 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Attach Image or File"
          aria-label="Attach File"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiBar((prev) => !prev)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Emoji bar"
          aria-label="Emoji Picker"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Offline direct message..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedAttachment}
          className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white transition-all cursor-pointer shadow-md shadow-orange-600/20"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

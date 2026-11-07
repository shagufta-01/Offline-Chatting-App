import React from 'react';
import { Home, Radio, MessageSquare, Network, User } from 'lucide-react';
import { ScreenType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadCount?: number;
  nearbyCount?: number;
}

export const BottomNavigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  unreadCount = 0,
  nearbyCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ScreenType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'nearby' as ScreenType,
      label: 'Nearby',
      icon: Radio,
      badge: nearbyCount > 0 ? nearbyCount : undefined,
    },
    {
      id: 'chat_list' as ScreenType,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'mesh_network' as ScreenType,
      label: 'Mesh',
      icon: Network,
    },
    {
      id: 'profile' as ScreenType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="h-16 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 grid grid-cols-5 items-center px-1 shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          currentScreen === tab.id ||
          (tab.id === 'chat_list' &&
            (currentScreen === 'individual_chat' || currentScreen === 'group_chat')) ||
          (tab.id === 'profile' && currentScreen === 'settings');

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center justify-center h-full py-1 group relative transition-colors focus:outline-none"
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform duration-150 group-active:scale-90 ${
                  isActive ? 'text-orange-500 scale-105' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-zinc-950">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive ? 'text-orange-500 font-semibold' : 'text-zinc-500 font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

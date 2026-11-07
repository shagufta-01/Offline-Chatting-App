import React from 'react';

interface AvatarProps {
  seed: string;
  bg?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'relaying' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  seed,
  bg = '#ff6b00',
  size = 'md',
  showStatus = false,
  status = 'online',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-20 h-20 text-2xl font-bold',
  }[size];

  const statusSize = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size];

  const statusBg = {
    online: 'bg-emerald-500',
    offline: 'bg-zinc-600',
    relaying: 'bg-orange-500',
    busy: 'bg-rose-500',
  }[status];

  // Derive 2 letter monogram from seed
  const letters = seed
    .split(/[\s_-]+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'GC';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center text-white tracking-wider border border-white/10 select-none shadow-sm`}
        style={{
          background: `linear-gradient(135deg, ${bg}, #18181b)`,
        }}
      >
        {letters}
      </div>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusSize} ${statusBg} rounded-full ring-2 ring-zinc-950`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = '', size = 'md', className }) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold overflow-hidden border border-indigo-200/60 shadow-xs shrink-0 select-none',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name) || '?'}</span>
      )}
    </div>
  );
};

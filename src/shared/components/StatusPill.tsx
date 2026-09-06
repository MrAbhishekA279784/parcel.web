import React from 'react';
import { getStatusTheme } from '../lib/formatters';

interface StatusPillProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '', size = 'md' }) => {
  const theme = getStatusTheme(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border whitespace-nowrap ${theme.bg} ${theme.text} ${theme.border} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{theme.label}</span>
    </span>
  );
};

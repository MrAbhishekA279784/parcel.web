import React, { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-10 h-10 text-zinc-400 stroke-1" />,
  title = 'No items to display',
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-zinc-100/80 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-base font-medium text-zinc-900">{title}</h4>
      <p className="text-sm text-zinc-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

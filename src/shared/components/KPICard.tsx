import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  delta,
  deltaType = 'positive',
  icon,
  subtext,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-zinc-300 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        {icon && <div className="p-2 rounded-lg bg-zinc-50 text-zinc-600 shrink-0">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-mono">
          {value}
        </span>
      </div>
      {(delta || subtext) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded text-[11px] ${
                deltaType === 'positive'
                  ? 'text-emerald-700 bg-emerald-50'
                  : deltaType === 'negative'
                  ? 'text-red-700 bg-red-50'
                  : 'text-zinc-600 bg-zinc-100'
              }`}
            >
              {deltaType === 'positive' && <TrendingUp className="w-3 h-3" />}
              {deltaType === 'negative' && <TrendingDown className="w-3 h-3" />}
              {delta}
            </span>
          )}
          {subtext && <span className="text-zinc-400 truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

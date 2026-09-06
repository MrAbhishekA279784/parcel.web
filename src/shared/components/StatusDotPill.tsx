import React from 'react';

export interface StatusDotPillProps {
  label: string;
  state: 'online' | 'offline' | 'warning' | 'active' | 'busy' | 'ready' | 'idle';
  detail?: string;
  className?: string;
}

export const StatusDotPill: React.FC<StatusDotPillProps> = ({ label, state, detail, className = '' }) => {
  const isHealthy = ['online', 'active', 'ready'].includes(state.toLowerCase());
  const isWarning = ['busy', 'warning', 'idle'].includes(state.toLowerCase());
  const isDanger = ['offline', 'fault', 'disconnected'].includes(state.toLowerCase());

  const dotColor = isHealthy
    ? 'bg-emerald-500 ring-emerald-200'
    : isWarning
    ? 'bg-amber-500 ring-amber-200'
    : 'bg-red-500 ring-red-200';

  const badgeBg = isHealthy
    ? 'bg-emerald-50/70 border-emerald-200/80 text-zinc-800'
    : isWarning
    ? 'bg-amber-50/70 border-amber-200/80 text-zinc-800'
    : 'bg-red-50/70 border-red-200/80 text-zinc-800';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium shadow-2xs ${badgeBg} ${className}`}
      title={`${label}: ${state.toUpperCase()}${detail ? ` (${detail})` : ''}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ring-2 ${dotColor} ${isHealthy ? 'animate-pulse' : ''}`} />
      <span className="font-semibold text-zinc-700">{label}:</span>
      <span className="capitalize text-zinc-900">{detail || state}</span>
    </div>
  );
};

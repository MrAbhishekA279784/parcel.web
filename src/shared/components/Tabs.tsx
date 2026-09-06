import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = ''
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-zinc-200 gap-6 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map(t => {
          const isActive = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-zinc-900 text-zinc-900 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-zinc-900 text-zinc-50' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap p-1 bg-zinc-100/90 rounded-xl gap-1 ${className}`}>
      {tabs.map(t => {
        const isActive = t.id === activeTab;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-zinc-900 text-zinc-50' : 'bg-zinc-200/80 text-zinc-600'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

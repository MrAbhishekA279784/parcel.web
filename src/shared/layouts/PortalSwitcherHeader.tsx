import React from 'react';
import { useAuth } from '../store/authContext';
import { UserCheck, LogOut } from 'lucide-react';

export const PortalSwitcherHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside aria-label="ParcelFlow Global Bar" className="bg-zinc-900 text-zinc-300 border-b border-zinc-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-zinc-100 tracking-wide">PARCELFLOW</span>
          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline">Unified E-Commerce &amp; Warehouse Platform</span>
        </div>

        {/* Right: Logged-in user chip + Log Out button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-800">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] text-zinc-300 font-medium truncate max-w-[200px]">
              {user?.name || 'User'} ({user?.role})
            </span>
          </div>

          <button
            id="app-header-logout-btn"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};


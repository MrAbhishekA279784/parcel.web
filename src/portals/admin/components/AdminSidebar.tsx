import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  ListOrdered,
  FileText,
  Activity,
  Sliders,
  Settings
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount = 0
}) => {
  const menuItems = [
    { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'catalog', label: 'Catalog Management', icon: <ShoppingBag className="w-4 h-4" /> },
    {
      id: 'inventory',
      label: 'Inventory & Restock',
      icon: <PackageCheck className="w-4 h-4" />,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined
    },
    { id: 'orders', label: 'Orders Master Ledger', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'machine-analytics', label: 'Conveyor Analytics', icon: <Activity className="w-4 h-4" /> },
    { id: 'destinations', label: 'Destination Bins', icon: <Sliders className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-60 bg-zinc-950 text-zinc-300 border-r border-zinc-800 flex flex-col shrink-0 min-h-[calc(100vh-80px)] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-2">
        Business Operations
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-800/80 px-3 py-2 text-[11px] text-zinc-500 space-y-1">
        <p>Tenant: <strong className="text-zinc-400">ParcelFlow HQ</strong></p>
        <p>Database: <strong className="text-zinc-400 font-mono">SQLite (Persistent)</strong></p>
      </div>
    </aside>
  );
};

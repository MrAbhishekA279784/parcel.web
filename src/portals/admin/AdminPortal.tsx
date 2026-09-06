import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../shared/lib/api';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminCatalog } from './pages/AdminCatalog';
import { AdminInventory } from './pages/AdminInventory';
import { AdminOrders } from './pages/AdminOrders';
import { AdminBilling } from './pages/AdminBilling';
import { AdminMachineAnalytics } from './pages/AdminMachineAnalytics';
import { AdminDestinations } from './pages/AdminDestinations';
import { AdminSettings } from './pages/AdminSettings';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  const fetchLowStockCount = () => {
    apiFetch<any>('/analytics/dashboard')
      .then(d => {
        if (d?.overview?.lowStockCount) {
          setLowStockCount(d.overview.lowStockCount);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchLowStockCount();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      <AdminHeader onRefresh={fetchLowStockCount} />

      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
          {activeTab === 'overview' && <AdminAnalytics />}
          {activeTab === 'catalog' && <AdminCatalog />}
          {activeTab === 'inventory' && <AdminInventory />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'billing' && <AdminBilling />}
          {activeTab === 'machine-analytics' && <AdminMachineAnalytics />}
          {activeTab === 'destinations' && <AdminDestinations />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

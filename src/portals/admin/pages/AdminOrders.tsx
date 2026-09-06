import React, { useState, useEffect } from 'react';
import { Order, OrderStatusHistory } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR, formatDateTime } from '../../../shared/lib/formatters';
import { StatusPill } from '../../../shared/components/StatusPill';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { Search, Eye, ListOrdered, ArrowRight } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderStatusHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    apiFetch<Order[]>('/orders')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const data = await apiFetch<any>(`/orders/${order.id}`);
      setOrderHistory(data.history || []);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.destination_city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Orders Master Ledger</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete transaction history, warehouse routing coordinates, and lifecycle state changes.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchOrders}>
          Refresh Ledger
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer, city..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-800"
        >
          <option value="all">All Fulfillment Stages</option>
          <option value="PLACED">PLACED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKING">PICKING</option>
          <option value="PACKING">PACKING</option>
          <option value="PACKED">PACKED</option>
          <option value="ON_CONVEYOR">ON_CONVEYOR</option>
          <option value="SORTED">SORTED</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Sorting Bin</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-mono">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-zinc-900">{order.id}</td>
                <td className="py-3 px-4 text-zinc-500 font-sans">{formatDateTime(order.created_at)}</td>
                <td className="py-3 px-4 font-sans font-medium text-zinc-800">{order.customer_name}</td>
                <td className="py-3 px-4 font-sans">{order.destination_city}</td>
                <td className="py-3 px-4 font-bold text-teal-700">{order.assigned_bin || 'Allocating...'}</td>
                <td className="py-3 px-4 font-bold text-zinc-900">{formatINR(order.total_amount)}</td>
                <td className="py-3 px-4 font-sans">
                  <StatusPill status={order.status} size="sm" />
                </td>
                <td className="py-3 px-4 text-right font-sans">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="p-1.5 rounded text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="View Lifecycle Audit Trail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order Audit Trail: ${selectedOrder.id}`}
          subtitle={`Destination: ${selectedOrder.destination_city} | Customer: ${selectedOrder.customer_name}`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">
              Lifecycle Milestones
            </h4>

            <div className="space-y-2 border-l-2 border-zinc-200 ml-2 pl-4">
              {orderHistory.map(h => (
                <div key={h.id} className="relative pb-2">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 font-mono">{h.status}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{formatDateTime(h.changed_at)}</span>
                  </div>
                  {h.note && <p className="text-zinc-600 mt-0.5">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR, formatDateTime } from '../../../shared/lib/formatters';
import { StatusPill } from '../../../shared/components/StatusPill';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Tabs } from '../../../shared/components/Tabs';
import { useToast } from '../../../shared/store/toastContext';
import { Package, FileText, ArrowRight, Ban, RotateCcw, MapPin, Eye } from 'lucide-react';

interface CustomerOrdersProps {
  onTrackOrder: (orderId: string) => void;
  onViewInvoice: (orderId: string) => void;
  onNavigateToCatalog: () => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  onTrackOrder,
  onViewInvoice,
  onNavigateToCatalog
}) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    try {
      await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Customer requested cancellation via portal' })
      });
      showToast('Order cancelled successfully', 'info');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    const reason = prompt('Please specify return reason (e.g. Defective, Wrong item, Changed mind):');
    if (!reason) return;
    try {
      await apiFetch(`/orders/${orderId}/return`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showToast('Return request submitted for warehouse review', 'info');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit return', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') {
      return ['PLACED', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'ON_CONVEYOR', 'DETECTED', 'SORTING', 'SORTED', 'DISPATCHED'].includes(order.status);
    }
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    if (activeTab === 'cancelled') return order.status === 'CANCELLED';
    if (activeTab === 'returns') return order.status.startsWith('RETURN_');
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: orders.filter(o => ['PLACED', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'ON_CONVEYOR', 'DETECTED', 'SORTING', 'SORTED', 'DISPATCHED'].includes(o.status)).length
    },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length },
    { id: 'returns', label: 'Returns', count: orders.filter(o => o.status.startsWith('RETURN_')).length }
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Order History</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track real-time movement, conveyor sorting, and official GST invoices.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchOrders}>
          Refresh Status
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12">
          <EmptyState
            icon={<Package className="w-10 h-10 text-zinc-400 stroke-1" />}
            title="No orders found"
            message="You don't have any orders in this view yet."
            action={
              <Button variant="orange" size="sm" onClick={onNavigateToCatalog}>
                Start Shopping
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const canCancel = ['PLACED', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKING'].includes(order.status);
            const canReturn = order.status === 'DELIVERED';

            return (
              <div
                key={order.id}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs hover:border-zinc-300 transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-zinc-900">{order.id}</span>
                    <span className="text-zinc-400">&bull;</span>
                    <span className="text-zinc-500">{formatDateTime(order.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusPill status={order.status} />
                    {order.assigned_bin && (
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                        Bin: {order.assigned_bin}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body with item thumbnail */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {order.primary_item_image ? (
                      <img
                        src={order.primary_item_image}
                        alt="Product"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-zinc-400 stroke-1" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate">
                        {order.primary_item_name || 'Parcel Order'}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {order.item_count ? `${order.item_count} items` : '1 item'} &bull; Payment:{' '}
                        <span className="font-medium text-zinc-800">{order.payment_method}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Destination Hub: <strong className="text-zinc-800">{order.destination_city}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-end">
                    <span className="text-xs text-zinc-400">Total Invoiced</span>
                    <span className="text-lg font-bold text-zinc-900 font-mono">
                      {formatINR(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                        onClick={() => handleCancelOrder(order.id)}
                        icon={<Ban className="w-3.5 h-3.5" />}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {canReturn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-700 hover:bg-amber-50 text-xs h-8"
                        onClick={() => handleRequestReturn(order.id)}
                        icon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Request Return
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onViewInvoice(order.id)}
                      icon={<FileText className="w-3.5 h-3.5 text-zinc-500" />}
                    >
                      Tax Invoice
                    </Button>
                    <Button
                      variant="orange"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onTrackOrder(order.id)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Track Parcel
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

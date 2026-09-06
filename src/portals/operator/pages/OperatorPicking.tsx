import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useToast } from '../../../shared/store/toastContext';
import { ScanLine, CheckCircle2, MapPin, Box, ArrowRight } from 'lucide-react';

interface OperatorPickingProps {
  selectedOrderId?: string;
  onPickingCompleted: (orderId: string) => void;
}

export const OperatorPicking: React.FC<OperatorPickingProps> = ({
  selectedOrderId,
  onPickingCompleted
}) => {
  const { showToast } = useToast();
  const [activeTasks, setActiveTasks] = useState<{ order: Order; items: OrderItem[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const queue = await apiFetch<any>('/warehouse/queue');
      const pickingOrders: Order[] = [...queue.newOrders, ...queue.picking];

      // Fetch items for each order
      const tasksWithItems = await Promise.all(
        pickingOrders.map(async ord => {
          try {
            const data = await apiFetch<any>(`/orders/${ord.id}`);
            return { order: ord, items: data.items || [] };
          } catch {
            return { order: ord, items: [] };
          }
        })
      );
      setActiveTasks(tasksWithItems);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedOrderId]);

  const handleStartPicking = async (orderId: string) => {
    try {
      await apiFetch(`/warehouse/orders/${orderId}/start-picking`, { method: 'POST' });
      showToast(`Started picking task for ${orderId}`, 'info');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Error starting pick', 'error');
    }
  };

  const handleMarkPicked = async (orderId: string) => {
    try {
      await apiFetch(`/warehouse/orders/${orderId}/picked`, { method: 'POST' });
      showToast(`Order ${orderId} successfully picked! Moving to Packing Bay.`, 'success');
      onPickingCompleted(orderId);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Error marking picked', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Floor Picking Station</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pick items from warehouse racks according to designated shelf coordinates.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchTasks}>
          Refresh Pick List
        </Button>
      </div>

      {activeTasks.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12">
          <EmptyState
            icon={<ScanLine className="w-10 h-10 text-zinc-400 stroke-1" />}
            title="All picking tasks completed"
            message="No orders currently awaiting floor picking."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTasks.map(({ order, items }) => (
            <div
              key={order.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs space-y-5 transition-all ${
                selectedOrderId === order.id ? 'border-teal-500 ring-2 ring-teal-100' : 'border-zinc-200/80'
              }`}
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-zinc-900">{order.id}</span>
                  <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
                    {order.status}
                  </span>
                  <span className="text-zinc-500">
                    City: <strong className="text-zinc-800">{order.destination_city}</strong>
                  </span>
                </div>

                <div>
                  {order.status !== 'PICKING' ? (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => handleStartPicking(order.id)}
                      icon={<ScanLine className="w-3.5 h-3.5" />}
                    >
                      Assign &amp; Begin Pick
                    </Button>
                  ) : (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => handleMarkPicked(order.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Confirm All Items Picked
                    </Button>
                  )}
                </div>
              </div>

              {/* Items rack pick grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-start gap-4"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Large prominent rack badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-900 text-teal-100 font-mono font-bold text-xs tracking-wider">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>RACK: {item.warehouse_rack_location || 'A-01'}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-zinc-900 truncate mt-1">
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-zinc-600">
                        <span>Quantity Needed: <strong className="text-zinc-900 text-sm font-mono">{item.quantity}</strong></span>
                        <span>Weight: {item.weight_grams ? `${item.weight_grams}g` : '350g'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

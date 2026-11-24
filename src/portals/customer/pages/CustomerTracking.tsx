import React, { useState, useEffect } from 'react';
import { Order, OrderItem, OrderStatusHistory } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR, formatDateTime } from '../../../shared/lib/formatters';
import { OrderTimeline } from '../../../shared/components/Stepper';
import { StatusPill } from '../../../shared/components/StatusPill';
import { Button } from '../../../shared/components/Button';
import { getSocket } from '../../../shared/lib/socket';
import { ArrowLeft, FileText, Ban, RotateCcw, Truck, MapPin, Cpu, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../shared/store/toastContext';

interface CustomerTrackingProps {
  orderId: string;
  onBack: () => void;
  onViewInvoice: (orderId: string) => void;
}

export const CustomerTracking: React.FC<CustomerTrackingProps> = ({
  orderId,
  onBack,
  onViewInvoice
}) => {
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTracking = () => {
    setIsLoading(true);
    apiFetch<{ order: Order; items: OrderItem[]; history: OrderStatusHistory[] }>(`/orders/${orderId}`)
      .then(data => {
        setOrder(data.order);
        setItems(data.items || []);
        setHistory(data.history || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTracking();

    // Listen for live updates via Socket.io
    const socket = getSocket();
    const handleStatusUpdate = (data: { orderId: string; status: any; note?: string; changedAt: string }) => {
      if (data.orderId === orderId) {
        showToast(`Order status updated to: ${data.status}`, 'info');
        setOrder(prev => prev ? { ...prev, status: data.status } : prev);
        setHistory(prev => [
          ...prev,
          { id: `hist-${Date.now()}`, order_id: orderId, status: data.status, note: data.note, changed_at: data.changedAt }
        ]);
      }
    };

    socket.on('order:status:changed', handleStatusUpdate);

    return () => {
      socket.off('order:status:changed', handleStatusUpdate);
    };
  }, [orderId]);

  if (isLoading || !order) {
    return (
      <div className="py-20 text-center text-zinc-500">
        Loading real-time tracking data...
      </div>
    );
  }

  const isConveyorActive = ['ON_CONVEYOR', 'DETECTED', 'SORTING'].includes(order.status);
  const canCancel = ['PLACED', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKING'].includes(order.status);
  const canReturn = order.status === 'DELIVERED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewInvoice(order.id)}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            View Tax Invoice
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchTracking}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900 font-mono">{order.id}</h2>
              <StatusPill status={order.status} />
            </div>
            <p className="text-xs text-zinc-400 mt-1">Placed on {formatDateTime(order.created_at)}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-400">Total Order Value</span>
            <div className="text-xl font-bold text-zinc-900 font-mono">{formatINR(order.total_amount)}</div>
          </div>
        </div>

        {/* Real-time Tracking Stage Badge Banner */}
        {(() => {
          const isDelivered = order.status === 'DELIVERED';
          const isInTransit = order.status === 'DISPATCHED';
          return (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDelivered ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              isInTransit ? 'bg-blue-50 border-blue-200 text-blue-900' :
              'bg-orange-50 border-orange-200 text-orange-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  isDelivered ? 'bg-emerald-600' : isInTransit ? 'bg-blue-600' : 'bg-orange-600'
                }`}>
                  {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : isInTransit ? <Truck className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Live Item Tracking Status</span>
                  <h4 className="text-sm font-bold">
                    {isDelivered ? 'Order Delivered Successfully' : isInTransit ? 'Order In Transit (Out for Delivery)' : 'Warehouse Processing & Conveyor Sorting'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isDelivered ? 'Your items have been safely delivered to your destination address.' :
                     isInTransit ? 'Your package has been dispatched and is traveling via logistics carrier.' :
                     'Your items (12V SMPS, GPS module, or ESP 32) are currently being processed, picked, or sorted on the warehouse conveyor.'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider shrink-0 bg-white shadow-xs ${
                isDelivered ? 'text-emerald-700 border border-emerald-300' :
                isInTransit ? 'text-blue-700 border border-blue-300' :
                'text-orange-700 border border-orange-300'
              }`}>
                {isDelivered ? 'DELIVERED' : isInTransit ? 'IN TRANSIT' : 'PROCESSING'}
              </span>
            </div>
          );
        })()}

        {/* Color-Coded Progress Bar with Status-Specific Icons for Processing, Transit, and Delivered States */}
        {(() => {
          const isDelivered = order.status === 'DELIVERED';
          const isInTransit = order.status === 'DISPATCHED';
          const isProcessing = !isDelivered && !isInTransit;

          const progressPercent = isDelivered ? 100 : isInTransit ? 66 : 33;
          const progressColor = isDelivered ? 'bg-emerald-600' : isInTransit ? 'bg-blue-600' : 'bg-orange-600';

          return (
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/85 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600">
                <span>Fulfillment State Roadmap</span>
                <span className="font-mono text-zinc-500">{progressPercent}% Completed</span>
              </div>

              {/* Progress bar container */}
              <div className="relative w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${progressColor}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 3 State Icons & Labels */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Processing State */}
                <div className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                  isProcessing
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-500'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white mb-1.5 ${
                    isProcessing ? 'bg-orange-600 animate-pulse' : 'bg-emerald-600'
                  }`}>
                    {isProcessing ? <Cpu className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold">1. Processing</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Picking, packing &amp; sorting</span>
                </div>

                {/* Transit State */}
                <div className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                  isInTransit
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : isDelivered
                    ? 'bg-white border-zinc-200 text-zinc-700'
                    : 'bg-white border-zinc-200 text-zinc-400 opacity-60'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white mb-1.5 ${
                    isInTransit ? 'bg-blue-600 animate-pulse' : isDelivered ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}>
                    {isDelivered ? <CheckCircle2 className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold">2. In Transit</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Dispatched to carrier</span>
                </div>

                {/* Delivered State */}
                <div className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                  isDelivered
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-400 opacity-60'
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white mb-1.5 ${
                    isDelivered ? 'bg-emerald-600 animate-bounce' : 'bg-zinc-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">3. Delivered</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Safely handed over</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Live Conveyor / Hardware Active Alert Banner */}
        {isConveyorActive && (
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Live Warehouse Automation Active</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Your parcel is currently on the motorized conveyor belt undergoing infrared scanning and robotic arm sorting for {order.destination_city}.
                </p>
              </div>
            </div>
            {order.assigned_bin && (
              <span className="bg-white text-blue-900 font-bold px-3 py-1 rounded-lg text-xs border border-blue-200 shrink-0 font-mono">
                Target: {order.assigned_bin}
              </span>
            )}
          </div>
        )}

        {/* Tracking Timeline and Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Left: Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Live Fulfillment Stages
            </h3>
            <OrderTimeline currentStatus={order.status} history={history} />
          </div>

          {/* Right: Destination & Items breakdown */}
          <div className="space-y-6">
            {/* Delivery address */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <p className="font-bold text-zinc-900 text-sm">{order.recipient_name || order.customer_name}</p>
              <p className="text-zinc-600">{order.line1}{order.line2 ? `, ${order.line2}` : ''}</p>
              <p className="text-zinc-700 font-medium">
                {order.city}, {order.state} - <span className="font-mono">{order.pincode}</span>
              </p>
              <p className="text-zinc-500 font-mono">Contact: {order.recipient_phone || order.customer_phone}</p>
              <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-zinc-700">
                <span>Destination Sorting Bin:</span>
                <span className="font-mono font-bold text-orange-600">{order.assigned_bin || 'Allocating...'}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Package Contents ({items.length})
              </h4>
              <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-xl overflow-hidden bg-white">
                {items.map(item => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                      />
                      <div className="truncate">
                        <p className="font-medium text-zinc-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-400">Qty: {item.quantity} &bull; Rack: {item.warehouse_rack_location}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 font-mono shrink-0">
                      {formatINR(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

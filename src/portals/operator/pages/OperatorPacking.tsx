import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useToast } from '../../../shared/store/toastContext';
import { Boxes, CheckSquare, Square, Printer, Barcode, ArrowRight, ShieldCheck } from 'lucide-react';

interface OperatorPackingProps {
  selectedOrderId?: string;
  onPackingCompleted: (orderId: string) => void;
}

export const OperatorPacking: React.FC<OperatorPackingProps> = ({
  selectedOrderId,
  onPackingCompleted
}) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string>(selectedOrderId || '');
  const [activeItems, setActiveItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Packing Form
  const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
  const [weightGrams, setWeightGrams] = useState<number>(480);
  const [dimensions, setDimensions] = useState<string>('24x18x12 cm');

  // Label Modal
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const fetchPackingQueue = async () => {
    setIsLoading(true);
    try {
      const queue = await apiFetch<any>('/warehouse/queue');
      const packingList: Order[] = queue.packing || [];
      setOrders(packingList);

      const targetId = selectedOrderId || (packingList.length > 0 ? packingList[0].id : '');
      if (targetId) {
        setActiveOrderId(targetId);
        loadOrderDetails(targetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderDetails = async (id: string) => {
    try {
      const data = await apiFetch<any>(`/orders/${id}`);
      setActiveItems(data.items || []);
      const verObj: Record<string, boolean> = {};
      (data.items || []).forEach((i: OrderItem) => {
        verObj[i.id] = false;
      });
      setVerifiedItems(verObj);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPackingQueue();
  }, [selectedOrderId]);

  const handleToggleItemVerify = (itemId: string) => {
    setVerifiedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const allItemsVerified =
    activeItems.length > 0 &&
    activeItems.every(i => verifiedItems[i.id]);

  const handleConfirmPacked = async () => {
    if (!allItemsVerified) {
      showToast('Please check and verify all items before sealing carton', 'error');
      return;
    }

    try {
      await apiFetch(`/warehouse/orders/${activeOrderId}/packed`, {
        method: 'POST',
        body: JSON.stringify({
          weightGrams,
          dimensions
        })
      });
      showToast(`Carton sealed and labeled for ${activeOrderId}! Ready for Conveyor.`, 'success');
      onPackingCompleted(activeOrderId);
      fetchPackingQueue();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark packed', 'error');
    }
  };

  const currentOrder = orders.find(o => o.id === activeOrderId);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Packing &amp; Barcode Station</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Perform physical inspection, seal corrugated box, weigh parcel, and apply shipping barcode.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPackingQueue}>
          Refresh Station
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12">
          <EmptyState
            icon={<Boxes className="w-10 h-10 text-zinc-400 stroke-1" />}
            title="Packing table is clear"
            message="No orders currently awaiting packing and barcoding."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Orders in packing queue */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-3 h-fit">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-100">
              Orders at Packing Bay ({orders.length})
            </h3>
            <div className="space-y-2">
              {orders.map(ord => {
                const isSelected = ord.id === activeOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setActiveOrderId(ord.id);
                      loadOrderDetails(ord.id);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-100'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-zinc-900">{ord.id}</span>
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {ord.destination_city}
                      </span>
                    </div>
                    <p className="text-zinc-600 mt-1 truncate">
                      {ord.recipient_name || ord.customer_name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Packing Workbench */}
          {currentOrder && (
            <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-zinc-900">{currentOrder.id}</span>
                    <span className="bg-teal-900 text-teal-100 font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                      HUB: {currentOrder.destination_city.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Customer: {currentOrder.recipient_name || currentOrder.customer_name} ({currentOrder.city})
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsLabelModalOpen(true)}
                  icon={<Barcode className="w-3.5 h-3.5" />}
                >
                  Preview Shipping Label
                </Button>
              </div>

              {/* Barcode Scanner Station (3 Items + Disposal) */}
              <div className="p-4 rounded-xl bg-teal-950 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-teal-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-5 h-5 text-teal-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-200">
                      Packing Table Barcode Station (3 Items + Disposal)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-900 text-teal-300 px-2 py-0.5 rounded">
                    STATION 01 ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-teal-200">
                  Scan barcode for item verification or route to dustbin if defective/disposal required.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => {
                      showToast('Scanned: 12V SMPS Barcode Verified', 'success');
                      if (activeItems.length > 0) handleToggleItemVerify(activeItems[0].id);
                    }}
                    className="p-2.5 rounded-lg bg-teal-900 hover:bg-teal-800 border border-teal-700 text-teal-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>1. 12V SMPS</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Scanned: GPS Module Barcode Verified', 'success');
                      if (activeItems.length > 1) handleToggleItemVerify(activeItems[1].id);
                      else if (activeItems.length > 0) handleToggleItemVerify(activeItems[0].id);
                    }}
                    className="p-2.5 rounded-lg bg-teal-900 hover:bg-teal-800 border border-teal-700 text-teal-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>2. GPS Module</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Scanned: ESP32 Barcode Verified', 'success');
                      if (activeItems.length > 2) handleToggleItemVerify(activeItems[2].id);
                      else if (activeItems.length > 0) handleToggleItemVerify(activeItems[0].id);
                    }}
                    className="p-2.5 rounded-lg bg-teal-900 hover:bg-teal-800 border border-teal-700 text-teal-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>3. ESP 32</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Disposal Alert: Item routed to Dustbin (Disposal Bin D)', 'warning');
                    }}
                    className="p-2.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Disposal / Dustbin</span>
                  </button>
                </div>
              </div>

              {/* Item checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Physical Verification Checklist
                  </span>
                  <span className="text-xs text-zinc-500">
                    {Object.values(verifiedItems).filter(Boolean).length} of {activeItems.length} verified
                  </span>
                </div>

                <div className="space-y-2">
                  {activeItems.map(item => {
                    const isChecked = !!verifiedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItemVerify(item.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button className="shrink-0 text-emerald-600">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 fill-current text-emerald-600 bg-white" />
                            ) : (
                              <Square className="w-5 h-5 text-zinc-400" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-zinc-900 truncate">{item.name}</h4>
                            <p className="text-xs text-zinc-500">Qty required: <strong className="text-zinc-800 font-mono">{item.quantity}</strong> &bull; Rack: {item.warehouse_rack_location}</p>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-medium text-zinc-500 shrink-0">
                          {item.weight_grams ? `${item.weight_grams}g` : '350g'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box Measurements Form */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 block">
                  Package Specifications &amp; Gross Weight
                </span>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-600 font-medium">Gross Scaled Weight (grams)</label>
                    <input
                      type="number"
                      value={weightGrams}
                      onChange={e => setWeightGrams(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-600 font-medium">Carton Dimensions (L x W x H)</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={e => setDimensions(e.target.value)}
                      placeholder="e.g. 24x18x12 cm"
                      className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {allItemsVerified ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Ready to seal carton
                    </span>
                  ) : (
                    'Verify all contents above to proceed'
                  )}
                </span>

                <Button
                  variant="teal"
                  size="lg"
                  disabled={!allItemsVerified}
                  onClick={handleConfirmPacked}
                  icon={<Boxes className="w-4 h-4" />}
                >
                  Seal &amp; Mark as Packed
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shipping Label Preview Modal */}
      {currentOrder && (
        <Modal
          isOpen={isLabelModalOpen}
          onClose={() => setIsLabelModalOpen(false)}
          title="Fulfillment Shipping Label"
          subtitle="Printed sticker applied to top of carton"
          maxWidth="md"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsLabelModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => {
                  window.print();
                  setIsLabelModalOpen(false);
                }}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Label
              </Button>
            </>
          }
        >
          <div className="border-2 border-dashed border-zinc-800 p-6 rounded-xl bg-white text-zinc-950 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-start border-b-2 border-zinc-950 pb-3">
              <div>
                <h3 className="font-bold text-base tracking-tight">PARCELFLOW LOGISTICS</h3>
                <p className="text-[10px] text-zinc-600">Smart Automated Warehouse Bay 01</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black bg-black text-white px-2 py-0.5 rounded">
                  {currentOrder.destination_city.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-500">SHIP TO:</span>
              <p className="font-bold text-sm">{currentOrder.recipient_name || currentOrder.customer_name}</p>
              <p>{currentOrder.line1}</p>
              <p>{currentOrder.city}, {currentOrder.state} - {currentOrder.pincode}</p>
              <p>PH: {currentOrder.recipient_phone || currentOrder.customer_phone}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-zinc-950 py-2 text-center text-[10px]">
              <div>
                <span className="text-zinc-500 block">WEIGHT</span>
                <span className="font-bold">{weightGrams}g</span>
              </div>
              <div>
                <span className="text-zinc-500 block">DEST BIN</span>
                <span className="font-bold text-teal-800">{currentOrder.assigned_bin || 'AUTO'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">PAYMENT</span>
                <span className="font-bold">{currentOrder.payment_method}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-center justify-center pt-2 space-y-1">
              <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_5px,#000_5px,#000_8px,#fff_8px,#fff_10px,#000_10px,#000_14px)]" />
              <span className="text-[10px] font-bold tracking-widest">{currentOrder.id}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

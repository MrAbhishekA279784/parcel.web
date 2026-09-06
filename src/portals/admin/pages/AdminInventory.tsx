import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { useToast } from '../../../shared/store/toastContext';
import { PackageCheck, AlertTriangle, Plus, MapPin, Search } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = () => {
    setIsLoading(true);
    apiFetch<Product[]>('/inventory/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQuickRestock = async (product: Product, delta: number) => {
    try {
      const newStock = product.stock_quantity + delta;
      await apiFetch(`/inventory/adjust/${product.id}`, {
        method: 'POST',
        body: JSON.stringify({
          newStockQuantity: newStock,
          reason: `Admin quick restock (+${delta} units)`
        })
      });
      showToast(`Restocked +${delta} units of "${product.name}"`, 'success');
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Restock failed', 'error');
    }
  };

  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.warehouse_rack_location.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Inventory Control &amp; Restock</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor SKU velocity thresholds, trigger replenishment, and prevent out-of-stock sorting stalls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchInventory}>
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* Grid of Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(prod => {
          const isCritical = prod.stock_quantity <= 3;
          const isLow = prod.stock_quantity > 3 && prod.stock_quantity <= 8;
          const percentage = Math.min(100, Math.round((prod.stock_quantity / 40) * 100));

          return (
            <div
              key={prod.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                isCritical
                  ? 'border-red-300 ring-2 ring-red-50'
                  : isLow
                  ? 'border-amber-300'
                  : 'border-zinc-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-zinc-900 truncate">{prod.name}</h4>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      Rack {prod.warehouse_rack_location}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-base px-2 py-0.5 rounded ${
                      isCritical
                        ? 'bg-red-100 text-red-800'
                        : isLow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {prod.stock_quantity}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">units left</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Threshold: 5 units</span>
                  <span>Target: 40 units</span>
                </div>
              </div>

              {/* Quick Restock Action Buttons */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500 font-medium">Quick Restock:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickRestock(prod, 10)}
                    className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => handleQuickRestock(prod, 25)}
                    className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    +25
                  </button>
                  <button
                    onClick={() => handleQuickRestock(prod, 50)}
                    className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    +50
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

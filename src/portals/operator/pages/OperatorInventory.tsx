import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { useToast } from '../../../shared/store/toastContext';
import { PackageCheck, Search, Plus, Minus, Edit, MapPin } from 'lucide-react';

export const OperatorInventory: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjust Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Cycle count reconciliation');
  const [isAdjusting, setIsAdjusting] = useState(false);

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

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setNewStock(prod.stock_quantity);
    setIsAdjusting(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await apiFetch(`/inventory/adjust/${selectedProduct.id}`, {
        method: 'POST',
        body: JSON.stringify({
          newStockQuantity: newStock,
          reason: adjustReason
        })
      });
      showToast(`Stock updated for ${selectedProduct.name}`, 'success');
      setIsAdjusting(false);
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.warehouse_rack_location.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Floor Inventory Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time shelf rack locations, physical quantity counts, and bay cycle audits.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rack or product..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-teal-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={fetchInventory}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Shelf Rack</th>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Unit Price</th>
              <th className="py-3 px-4">Stock on Hand</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(prod => {
              const isLow = prod.stock_quantity <= 5;
              return (
                <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-teal-950 text-teal-200 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      {prod.warehouse_rack_location}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                      />
                      <span className="font-semibold text-zinc-900 truncate max-w-xs">{prod.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-500">{prod.category_name}</td>
                  <td className="py-3 px-4 font-mono font-medium">{formatINR(prod.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {prod.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAdjust(prod)}
                      icon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Audit / Adjust
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isAdjusting}
          onClose={() => setIsAdjusting(false)}
          title={`Adjust Inventory - ${selectedProduct.name}`}
          subtitle={`Location: Rack ${selectedProduct.warehouse_rack_location}`}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsAdjusting(false)}>
                Cancel
              </Button>
              <Button variant="teal" size="sm" onClick={handleSaveStock}>
                Confirm Adjustment
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-600 font-medium">Verified Physical Count</label>
              <input
                type="number"
                min={0}
                required
                value={newStock}
                onChange={e => setNewStock(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-mono text-base font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-600 font-medium">Adjustment Reason / Audit Note</label>
              <select
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-800"
              >
                <option value="Cycle count reconciliation">Cycle count reconciliation</option>
                <option value="Received inbound shipment replenishment">Inbound replenishment</option>
                <option value="Damaged goods write-off">Damaged / expired goods</option>
                <option value="Customer return restocked">Customer return restocked</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

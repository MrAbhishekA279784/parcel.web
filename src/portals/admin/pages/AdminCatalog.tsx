import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { useToast } from '../../../shared/store/toastContext';
import { Plus, Edit2, Trash2, Search, MapPin, Tag } from 'lucide-react';

export const AdminCatalog: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Electronics');
  const [price, setPrice] = useState(1999);
  const [stockQuantity, setStockQuantity] = useState(25);
  const [rackLocation, setRackLocation] = useState('A-01');
  const [weightGrams, setWeightGrams] = useState(450);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const fetchProducts = () => {
    setIsLoading(true);
    apiFetch<Product[]>('/catalog/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategoryName('Electronics');
    setPrice(1999);
    setStockQuantity(20);
    setRackLocation('A-05');
    setWeightGrams(400);
    setImageUrl('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600');
    setDescription('High performance warehouse tracked SKU.');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryName(prod.category_name || 'Electronics');
    setPrice(prod.price);
    setStockQuantity(prod.stock_quantity);
    setRackLocation(prod.warehouse_rack_location);
    setWeightGrams(prod.weight_grams || 400);
    setImageUrl(prod.image_url);
    setDescription(prod.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiFetch(`/catalog/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            categoryName,
            price,
            stockQuantity,
            rackLocation,
            weightGrams,
            imageUrl,
            description
          })
        });
        showToast(`Updated product "${name}"`, 'success');
      } else {
        await apiFetch('/catalog/products', {
          method: 'POST',
          body: JSON.stringify({
            name,
            categoryName,
            price,
            stockQuantity,
            rackLocation,
            weightGrams,
            imageUrl,
            description
          })
        });
        showToast(`Added new product "${name}" to warehouse catalog`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to remove "${prodName}" from catalog?`)) return;
    try {
      await apiFetch(`/catalog/products/${id}`, { method: 'DELETE' });
      showToast(`Product deleted`, 'info');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.warehouse_rack_location.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category_name === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Catalog Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Maintain SKU definitions, warehouse shelf coordinate assignments, and product pricing.
          </p>
        </div>

        <Button variant="indigo" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-3.5 h-3.5" />}>
          Add New Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by SKU name or shelf rack..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-800"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Wearables">Wearables</option>
            <option value="Audio">Audio</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Shelf Location</th>
              <th className="py-3 px-4">Weight</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(prod => (
              <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
                    />
                    <div>
                      <div className="font-semibold text-zinc-900">{prod.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{prod.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-600">{prod.category_name}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                    <MapPin className="w-3 h-3 text-indigo-600" />
                    {prod.warehouse_rack_location}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-500 font-mono">{prod.weight_grams}g</td>
                <td className="py-3 px-4 font-mono font-bold text-zinc-900">{formatINR(prod.price)}</td>
                <td className="py-3 px-4 font-mono font-bold text-zinc-800">{prod.stock_quantity} units</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 rounded text-zinc-500 hover:text-red-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Warehouse Product'}
        subtitle="Configures automated picking and conveyor sorting telemetry"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="indigo" size="sm" onClick={handleSave}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-600 font-medium">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900"
              />
            </div>

            <div>
              <label className="text-zinc-600 font-medium">Category</label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900"
              >
                <option value="Electronics">Electronics</option>
                <option value="Wearables">Wearables</option>
                <option value="Audio">Audio</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-600 font-medium">Unit Price (₹)</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900"
              />
            </div>

            <div>
              <label className="text-zinc-600 font-medium">Stock Count</label>
              <input
                type="number"
                required
                min={0}
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900"
              />
            </div>

            <div>
              <label className="text-zinc-600 font-medium">Shelf Rack Location</label>
              <input
                type="text"
                required
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                placeholder="e.g. A-01"
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-600 font-medium">Weight (grams)</label>
              <input
                type="number"
                required
                min={10}
                value={weightGrams}
                onChange={e => setWeightGrams(Number(e.target.value))}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg font-mono text-zinc-900"
              />
            </div>

            <div>
              <label className="text-zinc-600 font-medium">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-600 font-medium">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

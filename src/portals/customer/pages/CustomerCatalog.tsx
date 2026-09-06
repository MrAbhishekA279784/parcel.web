import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Heart, ShoppingCart, Star, Filter, RotateCcw, Search } from 'lucide-react';

interface CustomerCatalogProps {
  initialCategory?: string;
  searchQuery: string;
  onNavigate: (page: string, param?: any) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  initialCategory,
  searchQuery,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlistIds
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [priceMax, setPriceMax] = useState<number>(3500);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiFetch<Product[]>('/catalog/products'),
      apiFetch<Category[]>('/catalog/categories')
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
        if (cat && p.category_id !== cat.id) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchCat = p.category_name?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      // Price
      if (p.price > priceMax) return false;
      // Rating
      if (p.rating < minRating) return false;
      // In Stock
      if (inStockOnly && p.stock_quantity <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price_asc') return a.price - b.price;
      if (selectedSort === 'price_desc') return b.price - a.price;
      if (selectedSort === 'rating_desc') return b.rating - a.rating;
      return 0; // default order
    });
  }, [products, categories, selectedCategory, searchQuery, priceMax, minRating, inStockOnly, selectedSort]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceMax(3500);
    setMinRating(0);
    setInStockOnly(false);
    setSelectedSort('newest');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top title & Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {selectedCategory === 'all'
              ? 'All Products'
              : categories.find(c => c.slug === selectedCategory)?.name || 'Products'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {filteredProducts.length} verified warehouse items
            {searchQuery && <span> for &ldquo;<span className="text-zinc-900 font-semibold">{searchQuery}</span>&rdquo;</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="text-xs text-zinc-500 font-medium">Sort by:</label>
          <select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
            className="h-9 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer shadow-2xs"
          >
            <option value="newest">Featured &amp; Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6 bg-white border border-zinc-200/80 rounded-xl p-5 shadow-2xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span>Filters</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
              Category
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:text-zinc-900">
                <input
                  type="radio"
                  name="cat"
                  checked={selectedCategory === 'all'}
                  onChange={() => setSelectedCategory('all')}
                  className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span>All Categories ({products.length})</span>
              </label>
              {categories.map(c => {
                const count = products.filter(p => p.category_id === c.id).length;
                return (
                  <label key={c.id} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:text-zinc-900">
                    <input
                      type="radio"
                      name="cat"
                      checked={selectedCategory === c.slug}
                      onChange={() => setSelectedCategory(c.slug)}
                      className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>{c.name} ({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold uppercase tracking-wider text-zinc-500">Max Price</label>
              <span className="font-bold text-zinc-900 font-mono">{formatINR(priceMax)}</span>
            </div>
            <input
              type="range"
              min={300}
              max={3500}
              step={100}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>₹300</span>
              <span>₹3,500</span>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
              Minimum Rating
            </label>
            <div className="space-y-1">
              {[4, 3, 2].map(star => (
                <label key={star} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === star}
                    onChange={() => setMinRating(minRating === star ? 0 : star)}
                    className="text-orange-600 cursor-pointer"
                  />
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: star }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-zinc-500">&amp; above</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock filter */}
          <div className="pt-3 border-t border-zinc-100">
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200/80 rounded-xl p-12">
              <EmptyState
                icon={<Search className="w-10 h-10 text-zinc-400 stroke-1" />}
                title="No products matched your criteria"
                message="Try adjusting your filters, price range, or search terms."
                action={
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(product => {
                const inWishlist = wishlistIds.has(product.id);
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
                const isOutOfStock = product.stock_quantity <= 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:shadow-sm hover:border-zinc-300 transition-all flex flex-col group"
                  >
                    <div
                      className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer"
                      onClick={() => onNavigate('product', product.id)}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      {product.discount_percent > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white font-bold text-[11px] px-2 py-0.5 rounded shadow-xs">
                          {product.discount_percent}% OFF
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                          inWishlist ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{product.category_name}</span>
                          <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                            <span className="text-zinc-400 font-normal">({product.rating_count})</span>
                          </div>
                        </div>

                        <h3
                          onClick={() => onNavigate('product', product.id)}
                          className="text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors mt-1 line-clamp-2 cursor-pointer leading-snug"
                        >
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold text-zinc-900 font-mono">
                            {formatINR(product.price)}
                          </div>
                          <div className="text-[11px]">
                            {isOutOfStock ? (
                              <span className="text-red-600 font-medium">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="text-amber-600 font-medium">Low stock: {product.stock_quantity} left</span>
                            ) : (
                              <span className="text-zinc-400">In Stock: {product.stock_quantity}</span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="orange"
                          size="sm"
                          disabled={isOutOfStock}
                          onClick={() => onAddToCart(product)}
                          icon={<ShoppingCart className="w-3.5 h-3.5" />}
                        >
                          {isOutOfStock ? 'Sold Out' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

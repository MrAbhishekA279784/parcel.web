import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { ShoppingCart, Heart, ArrowRight, ShieldCheck, Truck, RotateCcw, Star, Zap } from 'lucide-react';

interface CustomerHomeProps {
  onNavigate: (page: string, param?: any) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlistIds
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const featuredProduct = products.find(p => p.id === 'prod-1') || products[0];
  const bestSellers = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner - restrained warm neutral tones (zinc-900 to zinc-800) per Section 5.1 */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-lg border border-zinc-800">
        <div className="max-w-6xl mx-auto p-8 sm:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Automated Warehouse Fulfillment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Next-Gen Delivery Powered by Robotics
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Experience lightning-fast dispatch. Orders placed on ParcelFlow flow instantly from digital checkout to automated conveyor belts and robotic sorting arms.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="orange"
                size="lg"
                onClick={() => onNavigate('catalog')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Shop Full Catalog
              </Button>
              {featuredProduct && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
                  onClick={() => onNavigate('product', featuredProduct.id)}
                >
                  View Featured Deal
                </Button>
              )}
            </div>
          </div>

          {featuredProduct && (
            <div className="w-full md:w-80 lg:w-96 bg-zinc-900/90 backdrop-blur-md rounded-2xl p-5 border border-zinc-700/60 shadow-2xl shrink-0">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-800">
                <img
                  src={featuredProduct.image_url}
                  alt={featuredProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-orange-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                  {featuredProduct.discount_percent}% OFF
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                  {featuredProduct.category_name}
                </span>
                <h3 className="text-base font-semibold text-white truncate mt-0.5">
                  {featuredProduct.name}
                </h3>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white font-mono">
                      {formatINR(featuredProduct.price)}
                    </span>
                    <span className="text-xs text-zinc-400 line-through font-mono">
                      {formatINR(Math.round(featuredProduct.price * 1.25))}
                    </span>
                  </div>
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={() => onAddToCart(featuredProduct)}
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Value props strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Automated Smart Dispatch</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Robotic arm sorts packages in under 2 seconds.</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Genuine &amp; GST Invoiced</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Official invoices with 18% GST tax breakdown.</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Instant Real-Time Tracking</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Watch your parcel move through picking &amp; sorting.</p>
          </div>
        </div>
      </section>

      {/* Category Pills Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Explore by Category</h2>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', cat.slug)}
              className="bg-white border border-zinc-200/80 rounded-xl p-4 text-center hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-100 group-hover:bg-orange-50 text-zinc-700 group-hover:text-orange-600 flex items-center justify-center font-bold text-sm transition-colors">
                {cat.name.substring(0, 2).toUpperCase()}
              </div>
              <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-orange-600 mt-2.5 transition-colors">
                {cat.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Best Sellers</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Top-rated items dispatched daily across India.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('catalog')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            See More
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {bestSellers.map(product => {
            const inWishlist = wishlistIds.has(product.id);
            return (
              <div
                key={product.id}
                className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:shadow-sm hover:border-zinc-300 transition-all flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onNavigate('product', product.id)}>
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

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
                      <span className="truncate">{product.category_name}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
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
                      <div className="text-[10px] text-zinc-400">
                        {product.stock_quantity <= 5 ? (
                          <span className="text-amber-600 font-medium">Only {product.stock_quantity} left</span>
                        ) : (
                          <span>In Stock</span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="orange"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      icon={<ShoppingCart className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">New Arrivals</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Recently stocked in our smart fulfillment bays.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('catalog')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            See More
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {newArrivals.map(product => {
            const inWishlist = wishlistIds.has(product.id);
            return (
              <div
                key={product.id}
                className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:shadow-sm hover:border-zinc-300 transition-all flex flex-col group"
              >
                <div className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onNavigate('product', product.id)}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
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
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                      {product.category_name}
                    </span>
                    <h3
                      onClick={() => onNavigate('product', product.id)}
                      className="text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors mt-1 line-clamp-2 cursor-pointer leading-snug"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-base font-bold text-zinc-900 font-mono">
                      {formatINR(product.price)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      icon={<ShoppingCart className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

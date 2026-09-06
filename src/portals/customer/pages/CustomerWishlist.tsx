import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { apiFetch } from '../../../shared/lib/api';
import { formatINR } from '../../../shared/lib/formatters';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

interface CustomerWishlistProps {
  onAddToCart: (product: Product) => void;
  onNavigateToCatalog: () => void;
  onNavigateToProduct: (productId: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: Set<string>;
}

export const CustomerWishlist: React.FC<CustomerWishlistProps> = ({
  onAddToCart,
  onNavigateToCatalog,
  onNavigateToProduct,
  onToggleWishlist,
  wishlistIds
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch<Product[]>('/catalog/products')
      .then(allProds => {
        setProducts(allProds.filter(p => wishlistIds.has(p.id)));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [wishlistIds]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Items you have bookmarked for future warehouse orders ({products.length})
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onNavigateToCatalog} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Explore Catalog
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12">
          <EmptyState
            icon={<Heart className="w-10 h-10 text-zinc-400 stroke-1" />}
            title="Your wishlist is empty"
            message="Tap the heart icon on any product in our catalog to save it here."
            action={
              <Button variant="orange" size="sm" onClick={onNavigateToCatalog}>
                Browse Products
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(prod => (
            <div
              key={prod.id}
              className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div
                className="relative aspect-square bg-zinc-100 cursor-pointer"
                onClick={() => onNavigateToProduct(prod.id)}
              >
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(prod);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-red-600 shadow-xs flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider">{prod.category_name}</span>
                  <h3
                    onClick={() => onNavigateToProduct(prod.id)}
                    className="text-sm font-semibold text-zinc-900 truncate hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {prod.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-base font-bold text-zinc-900 font-mono">
                    {formatINR(prod.price)}
                  </span>
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={() => onAddToCart(prod)}
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Drawer } from '../../../shared/components/Drawer';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { CartItem } from '../../../types';
import { formatINR } from '../../../shared/lib/formatters';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  onUpdateQuantity: (cartItemId: string, qty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  gst,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Shopping Cart (${items.reduce((acc, i) => acc + i.quantity, 0)})`}
      subtitle="Orders placed ship directly from our smart automated warehouse."
      width="lg"
      footer={
        items.length > 0 ? (
          <div className="space-y-3 w-full">
            <div className="space-y-1.5 text-xs text-zinc-600 border-b border-zinc-200/80 pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-mono text-zinc-900">{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-zinc-900 pt-1">
                <span>Total Amount</span>
                <span className="font-mono text-base text-orange-600 font-bold">{formatINR(total)}</span>
              </div>
            </div>

            <Button
              variant="orange"
              size="lg"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-10 h-10 text-zinc-400 stroke-1" />}
          title="Your cart is empty"
          message="Explore our wide range of electronics, accessories, and home items."
          action={
            <Button variant="secondary" size="sm" onClick={onClose}>
              Continue Shopping
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-zinc-100">
          {items.map(item => (
            <div key={item.cart_item_id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
              <img
                src={item.image_url}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-18 h-18 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200/60"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 truncate">{item.name}</h4>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-zinc-900 font-mono">
                      {formatINR(item.price)}
                    </span>
                    {item.discount_percent > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">
                        {item.discount_percent}% off
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Stepper */}
                  <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                    <button
                      onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-zinc-900 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.cart_item_id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

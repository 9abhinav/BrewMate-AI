import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Calculator, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { OrderCalculationResponse } from '../types';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
}

interface OrderCalculatorModalProps {
  cart: CartItem[];
  onUpdateCart: (newCart: CartItem[]) => void;
  onClose: () => void;
}

export const OrderCalculatorModal: React.FC<OrderCalculatorModalProps> = ({
  cart,
  onUpdateCart,
  onClose
}) => {
  const [calculation, setCalculation] = useState<OrderCalculationResponse | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  useEffect(() => {
    if (cart.length > 0) {
      recalculate();
    } else {
      setCalculation(null);
    }
  }, [cart]);

  const recalculate = async () => {
    try {
      const itemsInput = cart.map(item => ({
        product_id: item.name,
        size: item.size,
        quantity: item.quantity
      }));
      const res = await api.calculateOrder(itemsInput);
      setCalculation(res);
    } catch (e) {
      console.error('Order calculation error', e);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    onUpdateCart(updated);
  };

  const updateSize = (index: number, size: string) => {
    const updated = [...cart];
    updated[index].size = size;
    onUpdateCart(updated);
  };

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    onUpdateCart(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-[#161210] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              Order Cost Estimator
            </h2>
            <p className="text-xs text-stone-400">Calculated via Agent Tool: calculate_order()</p>
          </div>
        </div>

        {orderPlaced ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Order Estimated Successfully!</h3>
            <p className="text-stone-300 text-xs max-w-sm mx-auto">
              Your estimated total is <span className="text-amber-400 font-bold">₹{calculation?.total}</span>. Show this to our barista at Indiranagar counter or confirm for delivery!
            </p>
            <button
              onClick={() => {
                onUpdateCart([]);
                onClose();
              }}
              className="coffee-gold-btn px-6 py-2.5 rounded-xl text-xs"
            >
              Back to Assistant
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">
            <ShoppingBag className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <p className="font-semibold text-stone-300 mb-1">Your order cart is empty</p>
            <p>Add recommendations or menu items to calculate order cost.</p>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            
            {/* Cart Items List */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/80 border border-stone-800">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-amber-400 font-semibold text-xs">₹{item.price}</span>
                  </div>

                  {/* Size Selector */}
                  <select
                    value={item.size}
                    onChange={(e) => updateSize(index, e.target.value)}
                    className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-200"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Large">Large (+20%)</option>
                  </select>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-stone-800 p-1 rounded-lg border border-stone-700">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Price Summary Breakdown */}
            {calculation && (
              <div className="bg-stone-950 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal</span>
                  <span>₹{calculation.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>GST Tax (5%)</span>
                  <span>₹{calculation.tax}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Delivery Fee {calculation.subtotal >= 500 && '(Free above ₹500)'}</span>
                  <span>{calculation.delivery_fee === 0 ? 'FREE' : `₹${calculation.delivery_fee}`}</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total</span>
                  <span className="text-amber-400 text-base">₹{calculation.total}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setOrderPlaced(true)}
              className="w-full coffee-gold-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Confirm & Place Order Estimate
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

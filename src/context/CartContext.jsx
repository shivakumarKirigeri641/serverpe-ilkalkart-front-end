import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const MAX_QTY = 5;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ilkal_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ilkal_cart', JSON.stringify(items));
  }, [items]);

  const add = (saree) => {
    setItems(prev => {
      const found = prev.find(i => i.id === saree.id);
      if (found) {
        if (found.qty >= MAX_QTY) { toast.error('Max 5 per saree'); return prev; }
        toast.success('Added to bag');
        return prev.map(i => i.id === saree.id ? { ...i, qty: i.qty + 1 } : i);
      }
      toast.success('Added to bag');
      return [...prev, { ...saree, qty: 1 }];
    });
  };

  const inc = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) } : i));
  const dec = (id) => setItems(prev => prev.flatMap(i => {
    if (i.id !== id) return [i];
    if (i.qty <= 1) return [];
    return [{ ...i, qty: i.qty - 1 }];
  }));
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const gstRate = 0.05; // 5% inclusive
  const baseAmount = +(subtotal / (1 + gstRate)).toFixed(2);
  const gstAmount = +(subtotal - baseAmount).toFixed(2);

  const value = useMemo(() => ({
    items, add, inc, dec, remove, clear,
    count, subtotal, baseAmount, gstAmount, gstRate, MAX_QTY
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

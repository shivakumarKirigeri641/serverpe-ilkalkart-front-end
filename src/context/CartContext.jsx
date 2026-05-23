import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useOffers } from '../api/queries.js';

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

  const offersQuery = useOffers();
  const activeOffer = (offersQuery.data || []).reduce(
    (best, o) => (o.percent > (best?.percent || 0) ? o : best),
    null
  );

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const gstRate = 0.05; // 5% inclusive

  // Bulk-order discount (driven by front-end for now; will move to back-end later).
  const BULK_MIN_QTY = 8;
  const BULK_DISCOUNT_RATE = 0.10;
  const bulkEligible = count >= BULK_MIN_QTY;
  const bulkDiscount = bulkEligible ? +(subtotal * BULK_DISCOUNT_RATE).toFixed(2) : 0;

  const offerPercent = activeOffer?.percent || 0;
  const afterBulk = +(subtotal - bulkDiscount).toFixed(2);
  const offerDiscount = offerPercent > 0 ? +(afterBulk * (offerPercent / 100)).toFixed(2) : 0;
  const payable = +(afterBulk - offerDiscount).toFixed(2);
  const baseAmount = +(payable / (1 + gstRate)).toFixed(2);
  const gstAmount = +(payable - baseAmount).toFixed(2);

  const value = useMemo(() => ({
    items, add, inc, dec, remove, clear,
    count, subtotal, payable, baseAmount, gstAmount, gstRate, MAX_QTY,
    bulkEligible, bulkDiscount, bulkMinQty: BULK_MIN_QTY, bulkDiscountRate: BULK_DISCOUNT_RATE,
    offer: activeOffer, offerPercent, offerDiscount,
  }), [items, count, subtotal, payable, baseAmount, gstAmount, bulkEligible, bulkDiscount, activeOffer, offerPercent, offerDiscount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

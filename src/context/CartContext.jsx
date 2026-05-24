import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useOffers } from '../api/queries.js';
import { apiClient } from '../utils/api.js';

const CartContext = createContext(null);
const MAX_QTY = 5;
const SAREE_CACHE_KEY = 'ilkal_saree_cache';

const loadCache = () => {
  try { return JSON.parse(localStorage.getItem(SAREE_CACHE_KEY)) || {}; } catch { return {}; }
};
const saveCache = (c) => {
  try { localStorage.setItem(SAREE_CACHE_KEY, JSON.stringify(c)); } catch {}
};

function mapApiItem(api, cache) {
  const code = api.combined_code;
  const c = cache[code] || {};
  const price = Number(api.base_price) || 0;
  const mrp = Number(api.comparable_price) || 0;
  return {
    id: api.id,
    code,
    combined_code: code,
    inventoryId: api.inventory_id,
    name: api.title,
    color: api.color,
    material: api.material,
    border: api.border,
    pallu: api.pallu,
    blouse: api.blouse,
    handloom: api.handloom ? 'Handloom' : '',
    isHandloom: Boolean(api.handloom),
    rating: Number(api.ratings) || 0,
    lengthM: Number(api.dimension_length) || '',
    width: Number(api.dimension_width) || 0,
    thickness: Number(api.dimension_thickness) || 0,
    qty: Number(api.quantity) || 0,
    price,
    mrp,
    discount: mrp > price ? Math.round((1 - price / mrp) * 100) : 0,
    totalPrice: Number(api.total_price) || price * (Number(api.quantity) || 0),
    stockMessage: api.custom_message,
    imgDirectory: api.img_directory,
    videoDirectory: api.video_directory,
    images: c.images || [],
    gallery: c.gallery || [],
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const ingest = useCallback((data) => {
    const cache = loadCache();
    const list = Array.isArray(data?.items) ? data.items.map((it) => mapApiItem(it, cache)) : [];
    setItems(list);
    setGrandTotal(Number(data?.grand_total_price) || 0);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/cart-items');
      ingest(res.data?.data);
    } catch {
      // silent — cart will show empty
    } finally {
      setLoading(false);
    }
  }, [ingest]);

  useEffect(() => { refresh(); }, [refresh]);

  const callCart = useCallback(async (method, path, body) => {
    try {
      const res = await apiClient.request({ method, url: path, data: body });
      const ok = res.data?.successstatus;
      if (ok) ingest(res.data.data);
      else toast.error(res.data?.message || 'Cart update failed');
      return ok;
    } catch (e) {
      toast.error(e.message || 'Cart update failed');
      return false;
    }
  }, [ingest]);

  const add = useCallback(async (saree) => {
    if (!saree?.code) { toast.error('Missing product code'); return; }
    const existing = items.find((i) => i.code === saree.code);
    if (existing && existing.qty >= MAX_QTY) { toast.error(`Max ${MAX_QTY} per saree`); return; }
    const cache = loadCache();
    cache[saree.code] = { images: saree.images || [], gallery: saree.gallery || [] };
    saveCache(cache);
    const ok = await callCart('post', '/add-to-cart', { combined_code: saree.code });
    if (ok) toast.success('Added to bag');
  }, [items, callCart]);

  const inc = useCallback(async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.qty >= MAX_QTY) { toast.error(`Max ${MAX_QTY} per saree`); return; }
    await callCart('post', '/add-to-cart', { combined_code: item.code });
  }, [items, callCart]);

  const dec = useCallback(async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await callCart('put', '/reduce-item-from-cart', { combined_code: item.code });
  }, [items, callCart]);

  const remove = useCallback(async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await callCart('delete', '/remove-item-from-cart', { combined_code: item.code });
  }, [items, callCart]);

  const clear = useCallback(async () => {
    await callCart('delete', '/clear-cart');
  }, [callCart]);

  const offersQuery = useOffers();
  const activeOffer = (offersQuery.data || []).reduce(
    (best, o) => (o.percent > (best?.percent || 0) ? o : best),
    null
  );

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotalFromItems = items.reduce((s, i) => s + i.qty * i.price, 0);
  const subtotal = grandTotal || subtotalFromItems;
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
    items, loading, refresh,
    add, inc, dec, remove, clear,
    count, subtotal, grandTotal, payable, baseAmount, gstAmount, gstRate, MAX_QTY,
    bulkEligible, bulkDiscount, bulkMinQty: BULK_MIN_QTY, bulkDiscountRate: BULK_DISCOUNT_RATE,
    offer: activeOffer, offerPercent, offerDiscount,
  }), [items, loading, refresh, add, inc, dec, remove, clear, count, subtotal, grandTotal, payable, baseAmount, gstAmount, bulkEligible, bulkDiscount, activeOffer, offerPercent, offerDiscount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

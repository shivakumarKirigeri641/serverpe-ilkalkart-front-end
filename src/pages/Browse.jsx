import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Minus, Star, ShoppingBag, Search, Camera, Heart, Eye,
  SlidersHorizontal, ArrowDownUp, ChevronDown, ChevronUp, X, Trash2,
  Flame, TrendingUp
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import SareeGallery from '../components/SareeGallery.jsx';
import WhatsAppOrderCard from '../components/WhatsAppOrderCard.jsx';

const RATINGS = [4.5, 4.0];
const SORTS = [
  { key: 'pop',       label: 'Popularity'      },
  { key: 'priceAsc',  label: 'Price — Low to High' },
  { key: 'priceDesc', label: 'Price — High to Low' },
  { key: 'rating',    label: 'Customer Rating' }
];

const COLOR_SWATCH = {
  Maroon:  '#7B1E3A', Red: '#C0212F', Pink: '#E2719C', Gold: '#C9A227',
  Green:   '#1F6F4A', Blue: '#1B4F8C', Mustard: '#D2A02A', White: '#F4EFE6',
  Black:   '#1A1A1A', Purple: '#5B2A86', Orange: '#D2691E',  Teal: '#1F8C8C'
};

const initialFilters = () => ({
  q: '',
  priceBuckets: [],
  materials: [],
  borders:   [],
  pallus:    [],
  blouses:   [],
  handlooms: [],
  lengths:   [],
  colors:    [],
  minRating: 0,
  sort: 'pop'
});

const PAGE_SIZE = 16;

export default function Browse() {
  const {
    sarees, loading,
    MATERIALS, BORDERS, PALLUS, BLOUSES, HANDLOOMS, LENGTHS, COLORS, PRICE_BUCKETS,
  } = useCatalog();
  const { items, add, inc, dec, clear, count } = useCart();

  const clearBag = () => {
    if (items.length === 0) return;
    if (window.confirm(`Remove all ${count} saree${count === 1 ? '' : 's'} from your bag?`)) {
      clear();
      toast.success('Bag cleared');
    }
  };
  const [f, setF] = useState(initialFilters());
  const [active, setActive] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const toggle = (key, value) => setF(prev => {
    const arr = prev[key];
    return { ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
  });
  const reset = () => setF(initialFilters());

  const filtered = useMemo(() => {
    let list = sarees.filter(s => {
      if (f.q && !(s.name + ' ' + s.color + ' ' + s.desc).toLowerCase().includes(f.q.toLowerCase())) return false;
      if (f.priceBuckets.length && !f.priceBuckets.some(i => s.price >= PRICE_BUCKETS[i].min && s.price <= PRICE_BUCKETS[i].max)) return false;
      if (f.materials.length && !f.materials.includes(s.material)) return false;
      if (f.borders.length   && !f.borders.includes(s.border))     return false;
      if (f.pallus.length    && !f.pallus.includes(s.pallu))       return false;
      if (f.blouses.length   && !f.blouses.includes(s.blouse))     return false;
      if (f.handlooms.length && !f.handlooms.includes(s.handloom)) return false;
      if (f.lengths.length   && !f.lengths.includes(s.lengthM))    return false;
      if (f.colors.length    && !f.colors.includes(s.color))       return false;
      if (f.minRating && s.rating < f.minRating) return false;
      return true;
    });
    switch (f.sort) {
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':    list.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return list;
  }, [f, sarees, PRICE_BUCKETS]);

  // Reset to first page whenever the filtered result set changes.
  useEffect(() => { setVisible(PAGE_SIZE); }, [f]);

  // IntersectionObserver — load the next batch when the sentinel scrolls into view.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + PAGE_SIZE, filtered.length));
      }
    }, { rootMargin: '0px', threshold: 0.1 });
    io.observe(node);
    return () => io.disconnect();
  }, [filtered.length]);

  const qtyOf = (id) => items.find(i => i.id === id)?.qty || 0;
  const visibleList = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Show the "go to top" button after the user has scrolled past one viewport height.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active filter chips — all from raw details.txt fields
  const chips = [];
  f.priceBuckets.forEach(i => chips.push({ k: 'priceBuckets', v: i, label: PRICE_BUCKETS[i].label }));
  f.materials.forEach(o => chips.push({ k: 'materials', v: o, label: `Material: ${o}` }));
  f.borders.forEach(o   => chips.push({ k: 'borders',   v: o, label: `Border: ${o}` }));
  f.pallus.forEach(o    => chips.push({ k: 'pallus',    v: o, label: `Pallu: ${o}` }));
  f.blouses.forEach(o   => chips.push({ k: 'blouses',   v: o, label: `Blouse: ${o}` }));
  f.handlooms.forEach(o => chips.push({ k: 'handlooms', v: o, label: `Handloom: ${o}` }));
  f.lengths.forEach(o   => chips.push({ k: 'lengths',   v: o, label: `Length: ${o} m` }));
  f.colors.forEach(o    => chips.push({ k: 'colors',    v: o, label: o }));
  if (f.minRating) chips.push({ special: 'rating', label: `${f.minRating}★ & above` });

  const FilterPanel = (
    <div className="space-y-1">
      {PRICE_BUCKETS.length > 0 && (
        <FilterSection title="Price" defaultOpen>
          <CheckList
            values={PRICE_BUCKETS.map((b, i) => i)}
            render={(i) => PRICE_BUCKETS[i].label}
            selected={f.priceBuckets} onToggle={v => toggle('priceBuckets', v)}
            counts={PRICE_BUCKETS.reduce((a, b, i) => ({ ...a, [i]: sarees.filter(s => s.price >= b.min && s.price <= b.max).length }), {})}
          />
        </FilterSection>
      )}

      {MATERIALS.length > 0 && (
        <FilterSection title="Material" defaultOpen>
          <CheckList values={MATERIALS} selected={f.materials} onToggle={v => toggle('materials', v)} counts={countBy(sarees, s => s.material)} />
        </FilterSection>
      )}

      {BORDERS.length > 0 && (
        <FilterSection title="Border" defaultOpen>
          <CheckList values={BORDERS} selected={f.borders} onToggle={v => toggle('borders', v)} counts={countBy(sarees, s => s.border)} />
        </FilterSection>
      )}

      {PALLUS.length > 0 && (
        <FilterSection title="Pallu">
          <CheckList values={PALLUS} selected={f.pallus} onToggle={v => toggle('pallus', v)} counts={countBy(sarees, s => s.pallu)} />
        </FilterSection>
      )}

      {BLOUSES.length > 0 && (
        <FilterSection title="Blouse">
          <CheckList values={BLOUSES} selected={f.blouses} onToggle={v => toggle('blouses', v)} counts={countBy(sarees, s => s.blouse)} />
        </FilterSection>
      )}

      {HANDLOOMS.length > 0 && (
        <FilterSection title="Handloom">
          <CheckList values={HANDLOOMS} selected={f.handlooms} onToggle={v => toggle('handlooms', v)} counts={countBy(sarees, s => s.handloom)} />
        </FilterSection>
      )}

      {LENGTHS.length > 0 && (
        <FilterSection title="Saree length">
          <CheckList values={LENGTHS} render={v => `${v} m`} selected={f.lengths} onToggle={v => toggle('lengths', v)} counts={countBy(sarees, s => s.lengthM)} />
        </FilterSection>
      )}

      {COLORS.length > 0 && (
        <FilterSection title="Colour" defaultOpen>
          <div className="grid grid-cols-2 gap-1.5">
            {COLORS.map(c => {
              const sel = f.colors.includes(c);
              return (
                <button key={c} onClick={() => toggle('colors', c)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm border transition ${
                    sel ? 'border-ilkal-maroon bg-ilkal-maroon/10' : 'border-ilkal-gold/30 hover:bg-ilkal-cream'
                  }`}>
                  <span className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ background: COLOR_SWATCH[c] || '#999' }} />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Customer Rating">
        {RATINGS.map(r => (
          <Radio key={r} label={<span className="inline-flex items-center gap-1">{r}<Star className="w-3.5 h-3.5 fill-ilkal-gold text-ilkal-gold" /> & above</span>}
            checked={f.minRating === r}
            onChange={() => setF(p => ({ ...p, minRating: p.minRating === r ? 0 : r }))} />
        ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-6">
      {/* No-login reassurance banner */}
      <div className="mb-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-white to-ilkal-cream/60 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold tracking-wide border border-green-200">
            NO LOGIN • NO SIGNUP • NO ACCOUNT
          </span>
          <span className="text-xs opacity-70 hidden sm:inline">Just shop, like a friendly local shop.</span>
        </div>
        <ol className="flex items-center gap-1 sm:gap-2 flex-wrap text-[11px] sm:text-xs font-medium text-ilkal-deep">
          {['Shortlist', 'Add to cart', 'Fill details', 'Pay', 'Done', 'Doorstep'].map((s, i, a) => (
            <li key={s} className="flex items-center gap-1 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-ilkal-gold/30 shadow-sm">
                <span className="w-4 h-4 rounded-full silk-gradient text-white text-[9px] font-bold grid place-items-center">{i + 1}</span>
                {s}
              </span>
              {i < a.length - 1 && <span className="text-ilkal-gold">→</span>}
            </li>
          ))}
        </ol>
      </div>

      {/* WhatsApp alternative — for sisters who prefer chatting */}
      <div className="mb-4">
        <WhatsAppOrderCard variant="inline" />
      </div>

      {/* Header / search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-3xl text-ilkal-maroon leading-tight">Browse Ilkal Sarees</h1>
            <p className="text-xs opacity-70 mt-0.5">{filtered.length} of {sarees.length} sarees</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
              <Camera className="w-3 h-3" /> Live · natural light · zero edits
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {items.length > 0 && (
              <button
                onClick={clearBag}
                aria-label="Clear bag"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-full bg-white border border-ilkal-maroon/30 text-ilkal-maroon text-xs sm:text-sm font-semibold hover:bg-ilkal-maroon/5 transition">
                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <Link to="/checkout" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
              <ShoppingBag className="w-4 h-4" /> Bag
            </Link>
          </div>
        </div>
        <p className="text-[11px] italic text-ilkal-deep/70 -mt-1">
          📷 A slight variation in colour is possible due to natural lighting.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ilkal-maroon" />
            <input value={f.q} onChange={e => setF({ ...f, q: e.target.value })}
              placeholder="Search by name, colour, occasion…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-ilkal-gold/30 focus:border-ilkal-maroon focus:outline-none shadow-sm" />
          </div>
          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white border border-ilkal-gold/30 shadow-sm text-sm font-medium text-ilkal-deep">
              <ArrowDownUp className="w-4 h-4 text-ilkal-maroon" />
              <span className="hidden sm:inline">Sort: {SORTS.find(s => s.key === f.sort)?.label}</span>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-ilkal-gold/30 z-20 overflow-hidden">
                  {SORTS.map(s => (
                    <button key={s.key} onClick={() => { setF(p => ({ ...p, sort: s.key })); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-ilkal-cream ${f.sort === s.key ? 'bg-ilkal-maroon/10 text-ilkal-maroon font-semibold' : ''}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-full silk-gradient text-white shadow text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" /> Filter
            {chips.length > 0 && <span className="bg-white text-ilkal-maroon text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center">{chips.length}</span>}
          </button>
        </div>
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {chips.map((c, i) => (
            <button key={i} onClick={() => {
              if (c.special === 'discount') setF(p => ({ ...p, minDiscount: 0 }));
              else if (c.special === 'rating') setF(p => ({ ...p, minRating: 0 }));
              else toggle(c.k, c.v);
            }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ilkal-maroon text-white text-xs shadow">
              {c.label} <X className="w-3 h-3" />
            </button>
          ))}
          <button onClick={reset} className="text-xs text-ilkal-maroon font-semibold underline">Clear all</button>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block bg-white rounded-2xl shadow-sm border border-ilkal-gold/20 h-fit lg:sticky lg:top-20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ilkal-gold/20">
            <h2 className="font-serif text-lg text-ilkal-maroon flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h2>
            <button onClick={reset} className="text-xs text-ilkal-maroon font-semibold">CLEAR ALL</button>
          </div>
          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto">
            {FilterPanel}
          </div>
        </aside>

        {/* Product grid */}
        <section>
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-ilkal-gold/20">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-ilkal-gold/40 border-t-ilkal-maroon animate-spin" />
              <p className="mt-3 opacity-80">Loading sarees…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-ilkal-gold/20">
              <div className="text-5xl">🌸</div>
              <p className="mt-3 opacity-80">No sarees match your filters.</p>
              <button onClick={reset} className="btn-primary mt-4 inline-flex">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleList.map((s, i) => (
                  <SareeCard key={`${s.id}-${i}`} s={s} index={i}
                    qty={qtyOf(s.id)} add={add} inc={inc} dec={dec}
                    onOpen={() => setActive(s)} />
                ))}
              </div>

              {hasMore ? (
                <div ref={sentinelRef} className="mt-8 flex flex-col items-center gap-3 py-6">
                  <div className="w-8 h-8 rounded-full border-2 border-ilkal-gold/40 border-t-ilkal-maroon animate-spin" />
                  <p className="text-xs opacity-70">Loading more sarees… {visible} of {filtered.length} shown</p>
                  <button onClick={() => setVisible(v => Math.min(v + PAGE_SIZE, filtered.length))}
                    className="text-xs text-ilkal-maroon font-semibold underline">
                    Load more manually
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-center py-4 text-xs opacity-60">
                  🌸 You've reached the end — {filtered.length} {filtered.length === 1 ? 'saree' : 'sarees'} shown.
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-ilkal-deep/60 backdrop-blur-sm z-50" />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-[88%] max-w-sm bg-white z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 silk-gradient text-white">
                <h2 className="font-serif text-lg flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h2>
                <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-full bg-white/15 grid place-items-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{FilterPanel}</div>
              <div className="grid grid-cols-2 gap-2 p-3 border-t border-ilkal-gold/20 bg-ilkal-cream">
                <button onClick={reset} className="px-4 py-3 rounded-full bg-white border border-ilkal-gold/40 text-ilkal-maroon font-semibold">Clear All</button>
                <button onClick={() => setDrawerOpen(false)} className="btn-primary">Show {filtered.length}</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && <SareeGallery saree={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      {/* Go-to-top floating button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Go to top"
            className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-12 h-12 rounded-full silk-gradient text-white shadow-2xl grid place-items-center hover:scale-110 transition">
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Filter UI primitives ---------- */
function FilterSection({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-ilkal-gold/15">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ilkal-deep">
        <span className="uppercase tracking-wide text-xs">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckList({ values, selected, onToggle, render, counts = {} }) {
  return (
    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
      {values.map(v => {
        const key = typeof v === 'object' ? v.toString() : v;
        const label = render ? render(v) : v;
        const isSel = selected.includes(v);
        const count = counts[v] ?? 0;
        return (
          <label key={key} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
            <input type="checkbox" checked={isSel} onChange={() => onToggle(v)}
              className="w-4 h-4 accent-ilkal-maroon" />
            <span className={`flex-1 ${isSel ? 'text-ilkal-maroon font-semibold' : 'text-ilkal-deep'}`}>{label}</span>
            {count > 0 && <span className="text-[10px] opacity-50">({count})</span>}
          </label>
        );
      })}
    </div>
  );
}

function Radio({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer text-sm">
      <input type="radio" checked={checked} onChange={onChange} onClick={onChange}
        className="w-4 h-4 accent-ilkal-maroon" />
      <span className={checked ? 'text-ilkal-maroon font-semibold' : 'text-ilkal-deep'}>{label}</span>
    </label>
  );
}

function countBy(arr, fn) {
  const m = {};
  arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; });
  return m;
}

/* ---------- Product card (unchanged from previous version, kept inline) ---------- */
const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23FFF8F0"/><text x="50%" y="50%" font-family="Poppins,sans-serif" font-size="14" fill="%237B1E3A" text-anchor="middle" dominant-baseline="middle">No photo yet</text></svg>';

function SareeCard({ s, index, qty, add, inc, dec, onOpen }) {
  const [hover, setHover] = useState(false);
  const [liked, setLiked] = useState(false);

  const photoCount = s.gallery.length;
  const primarySrc = s.gallery[0]?.src || PLACEHOLDER_IMG;
  const altSrc = s.gallery[1]?.src || primarySrc;

  const onAdd = (e) => { e.stopPropagation(); add(s); };
  const onInc = (e) => { e.stopPropagation(); inc(s.id); };
  const onDec = (e) => { e.stopPropagation(); dec(s.id); };
  const onLike = (e) => { e.stopPropagation(); setLiked((l) => !l); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${s.name}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group cursor-pointer
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-ilkal-maroon">
      {/* PHOTO — taller 3:4 portrait for fabric feel */}
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="relative aspect-[3/4] overflow-hidden bg-ilkal-cream">
        <motion.img
          src={primarySrc} alt={s.name} loading="lazy"
          animate={{ scale: hover ? 1.08 : 1, opacity: hover ? 0 : 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover" />
        <motion.img
          src={altSrc} alt="" loading="lazy" aria-hidden
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: hover ? 1.02 : 1.1, opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ilkal-deep/55 via-transparent to-transparent pointer-events-none" />

        {/* TL badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none">
          {s.popular && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ilkal-gold/95 text-ilkal-deep text-[10px] font-bold shadow">
              <Flame className="w-3 h-3" /> Popular
            </span>
          )}
          {s.trending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ilkal-rose/95 text-white text-[10px] font-bold shadow">
              <TrendingUp className="w-3 h-3" /> Trending
            </span>
          )}
          {s.handloom && /^(yes|pure|s|handloom)/i.test(s.handloom) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/95 text-ilkal-maroon text-[10px] font-semibold shadow">
              Handloom
            </span>
          )}
        </div>

        {/* TR rating + like */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold shadow">
            <Star className="w-3 h-3 fill-ilkal-gold text-ilkal-gold" />{s.rating}
          </span>
          <button onClick={onLike}
            aria-label="Save"
            className={`w-8 h-8 rounded-full grid place-items-center shadow transition-all duration-300 ${
              liked ? 'bg-ilkal-rose text-white scale-110' : 'bg-white/95 text-ilkal-maroon hover:scale-110'
            }`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* BL — live capture badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-medium">
            <Camera className="w-3 h-3" /> {photoCount}
          </span>
        </div>

        {/* BR — Saree ID highlight pill */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span className="inline-block text-[10px] font-bold text-ilkal-deep bg-ilkal-gold shadow px-2 py-0.5 rounded-full">
            ID:{s.id}
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        <h3 className="font-serif text-[15px] sm:text-base text-ilkal-maroon leading-tight line-clamp-1">
          {s.name}
        </h3>
        <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1">
          {s.color}{s.material ? ` · ${s.material}` : ''}
        </p>

        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="font-bold text-base sm:text-lg text-ilkal-maroon">
            ₹{s.price.toLocaleString('en-IN')}
          </span>
          {s.mrp > s.price && (
            <>
              <span className="text-[11px] line-through opacity-50">₹{s.mrp.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-green-700 font-semibold">{s.discount}% off</span>
            </>
          )}
        </div>

        {/* Action — single primary CTA */}
        <div className="mt-2.5">
          {qty === 0 ? (
            <button onClick={onAdd}
              className="w-full text-[13px] py-2 rounded-full silk-gradient text-white font-semibold shadow-sm hover:shadow active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add to bag
            </button>
          ) : (
            <div className="flex items-center justify-between bg-ilkal-cream rounded-full border border-ilkal-gold/40 p-0.5">
              <button onClick={onDec}
                className="w-8 h-8 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-ilkal-maroon text-xs sm:text-sm">{qty} in bag</span>
              <button onClick={onInc} disabled={qty >= 5}
                className="w-8 h-8 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90 disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

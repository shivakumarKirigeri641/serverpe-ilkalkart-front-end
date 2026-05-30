import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Minus, Star, ShoppingBag, Search, Camera, Heart,
  SlidersHorizontal, ChevronDown, ChevronUp, X, Trash2,
  Flame, TrendingUp, Layers, ArrowUpRight, Check,
  Sparkles, CreditCard, CheckCircle2, Home, MessageCircle, ArrowRight,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import SareeGallery from '../components/SareeGallery.jsx';
import { waOrderHref, FOUNDER_WHATSAPP_DISPLAY } from '../components/WhatsAppOrderCard.jsx';

const RATINGS = [4.5, 4.0];
const SORTS = [
  { key: 'pop',       label: 'Popularity' },
  { key: 'priceAsc',  label: 'Price — Low to High' },
  { key: 'priceDesc', label: 'Price — High to Low' },
  { key: 'rating',    label: 'Customer Rating' },
];

// Stone-tone material swatches for the colour filter.
const COLOR_SWATCH = {
  Maroon: '#7B1E3A', Red: '#C0212F', Pink: '#E2719C', Gold: '#A67B5B',
  Green: '#1F6F4A', Blue: '#1B4F8C', Mustard: '#D2A02A', White: '#F4EFE6',
  Black: '#1A1A1A', Purple: '#5B2A86', Orange: '#D2691E', Teal: '#1F8C8C',
  Cream: '#EDE6DC', Violet: '#6D4AA8', Ivory: '#F4EFE6',
};

const PROCESS = [
  { t: 'Shortlist',   d: 'Browse & save the weaves you love', icon: Sparkles },
  { t: 'Add to cart', d: 'No login screen, ever',             icon: ShoppingBag },
  { t: 'Fill details',d: 'Just name, mobile & address',       icon: Search },
  { t: 'Pay',         d: 'Secure gateway, one tap',           icon: CreditCard },
  { t: 'Done',        d: 'Order confirmed instantly',         icon: CheckCircle2 },
  { t: 'Doorstep',    d: 'Hand-packed & shipped to you',      icon: Home },
];

const initialFilters = () => ({
  q: '',
  priceBuckets: [],
  materials: [], borders: [], pallus: [], blouses: [],
  handlooms: [], lengths: [], colors: [],
  minRating: 0,
  sort: 'pop',
});

const PAGE_SIZE = 16;
const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

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

  useEffect(() => { setVisible(PAGE_SIZE); }, [f]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible(v => Math.min(v + PAGE_SIZE, filtered.length));
    }, { rootMargin: '0px', threshold: 0.1 });
    io.observe(node);
    return () => io.disconnect();
  }, [filtered.length]);

  const qtyOf = (id) => items.find(i => i.id === id)?.qty || 0;
  const visibleList = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active filter chips
  const chips = [];
  f.priceBuckets.forEach(i => chips.push({ k: 'priceBuckets', v: i, label: PRICE_BUCKETS[i].label }));
  f.materials.forEach(o => chips.push({ k: 'materials', v: o, label: `Material · ${o}` }));
  f.borders.forEach(o   => chips.push({ k: 'borders',   v: o, label: `Border · ${o}` }));
  f.pallus.forEach(o    => chips.push({ k: 'pallus',    v: o, label: `Pallu · ${o}` }));
  f.blouses.forEach(o   => chips.push({ k: 'blouses',   v: o, label: `Blouse · ${o}` }));
  f.handlooms.forEach(o => chips.push({ k: 'handlooms', v: o, label: `Handloom · ${o}` }));
  f.lengths.forEach(o   => chips.push({ k: 'lengths',   v: o, label: `Length · ${o} m` }));
  f.colors.forEach(o    => chips.push({ k: 'colors',    v: o, label: o }));
  if (f.minRating) chips.push({ special: 'rating', label: `${f.minRating}★ & above` });

  const FilterPanel = (
    <div className="divide-y divide-stone-200">
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
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map(c => {
              const sel = f.colors.includes(c);
              return (
                <button key={c} onClick={() => toggle('colors', c)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border-2 transition-colors duration-300 ${
                    sel ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}>
                  <span className="w-4 h-4 rounded-full ring-1 ring-black/10 shrink-0" style={{ background: COLOR_SWATCH[c] || '#A8A29E' }} />
                  <span className="truncate">{c}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
      <FilterSection title="Customer rating">
        <div className="space-y-1.5">
          {RATINGS.map(r => {
            const checked = f.minRating === r;
            return (
              <button key={r}
                onClick={() => setF(p => ({ ...p, minRating: p.minRating === r ? 0 : r }))}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-sm border-2 transition-colors duration-300 ${
                  checked ? 'border-stone-900 bg-stone-100 text-stone-900 font-medium' : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}>
                <span className={`grid place-items-center w-4 h-4 rounded-full border-2 ${checked ? 'border-stone-900 bg-stone-900' : 'border-stone-300'}`}>
                  {checked && <Check className="w-2.5 h-2.5 text-stone-50" strokeWidth={3} />}
                </span>
                <span className="inline-flex items-center gap-1">{r}<Star className="w-3.5 h-3.5 fill-wood text-wood" /> &amp; above</span>
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 bg-stone-50">
      {/* ============================================================
          HOW IT WORKS — editorial process strip with a live track line.
          Numbers sit ON a continuous rail; each step has an icon + line.
         ============================================================ */}
      <div className="rounded-4xl border border-stone-200 bg-white shadow-card overflow-hidden">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-6 sm:px-8 pt-7">
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 font-display font-extrabold tracking-display text-2xl sm:text-3xl text-stone-900 leading-[0.95]">
              Shop like it’s your local shop.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full border-2 border-stone-200 text-xs font-bold uppercase tracking-wide text-stone-700">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            No login · No signup · No account
          </span>
        </div>

        {/* Step rail */}
        <div className="px-6 sm:px-8 pt-9 pb-7">
          <ol className="relative grid grid-cols-3 gap-y-8 md:grid-cols-6 md:gap-y-0">
            {/* continuous track behind the nodes (desktop) */}
            <span className="hidden md:block absolute top-6 left-[8.33%] right-[8.33%] h-0.5 bg-stone-200" aria-hidden />
            {PROCESS.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === PROCESS.length - 1;
              return (
                <motion.li key={s.t}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="relative flex flex-col items-center text-center group">
                  {/* node */}
                  <div className={`relative grid place-items-center w-12 h-12 rounded-full ring-4 ring-white transition-transform duration-300 ease-showroom group-hover:-translate-y-1 ${
                    isLast ? 'bg-wood text-stone-900' : 'bg-stone-900 text-stone-50'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-white border border-stone-200 text-[10px] font-bold text-stone-900">
                      {i + 1}
                    </span>
                  </div>
                  <span className="mt-4 font-display font-bold tracking-display text-sm text-stone-900">{s.t}</span>
                  <span className="mt-1 text-[11px] text-stone-400 leading-snug max-w-[8.5rem]">{s.d}</span>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* WhatsApp footer row — folded into the same panel */}
        <a href={waOrderHref()} target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-4 px-6 sm:px-8 py-5 border-t border-stone-200 bg-stone-100/60 hover:bg-stone-100 transition-colors">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-emerald-600 text-white shrink-0">
            <MessageCircle className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-700 leading-relaxed">
              <b className="text-stone-900">Prefer WhatsApp?</b> Send the <b>Saree ID</b> on any card, the
              quantity and your address — I’ll share a secure payment link and take care of the rest.
            </p>
            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              Chat · {FOUNDER_WHATSAPP_DISPLAY}
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      {/* ============================================================
          EDITORIAL MASTHEAD
         ============================================================ */}
      <div className="mt-9 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* title + subhead */}
          <div className="min-w-0 max-w-2xl">
            <span className="eyebrow">The collection</span>
            <h1 className="mt-3 font-display font-extrabold tracking-display text-4xl sm:text-6xl text-stone-900 leading-[0.92]">
              Browse Ilkal sarees
            </h1>
            <p className="mt-4 text-base sm:text-lg text-stone-500 leading-relaxed">
              Each piece hand-picked at the loom and shot in raw daylight — the weave
              you see here is the weave that arrives at your door.
            </p>
          </div>

          {/* metric + actions */}
          <div className="flex items-end justify-between lg:flex-col lg:items-end gap-4 shrink-0">
            <div className="text-left lg:text-right">
              <div className="font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900 leading-none tabular-nums">
                {filtered.length}
                <span className="text-stone-300">/{sarees.length}</span>
              </div>
              <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                {filtered.length === sarees.length ? 'Pieces woven' : 'Pieces showing'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button onClick={clearBag} aria-label="Clear bag"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-stone-200 text-stone-700 text-sm font-medium hover:border-stone-900 hover:text-stone-900 transition-colors">
                  <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Clear bag</span>
                </button>
              )}
              <Link to="/checkout" className="btn-primary !py-2.5 !px-5 text-sm">
                <ShoppingBag className="w-4 h-4" /> Bag{count > 0 && <span className="ml-0.5 grid place-items-center min-w-[1.25rem] h-5 px-1 rounded-full bg-stone-50 text-stone-900 text-[11px] font-bold">{count}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* meta strip — provenance notes on a hairline */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 border-y border-stone-200">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-700">
            <Camera className="w-3.5 h-3.5 text-wood" /> Live · natural light · zero edits
          </span>
          <span className="hidden sm:inline h-3.5 w-px bg-stone-200" />
          <span className="text-xs text-stone-400">
            A slight variation in colour is possible due to natural lighting.
          </span>
        </div>

        {/* ============================================================
            TOOLBAR — unified search + sort + mobile filter
           ============================================================ */}
        <div className="flex gap-2.5">
          {/* command bar: search | divider | sort */}
          <div className="flex-1 flex items-stretch rounded-full bg-white border-2 border-stone-200 focus-within:border-stone-900 transition-colors overflow-hidden">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-[18px] h-[18px] text-stone-400 pointer-events-none" />
              <input value={f.q} onChange={e => setF({ ...f, q: e.target.value })}
                placeholder="Search by name, colour, occasion…"
                className="w-full pl-11 pr-3 py-3 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none" />
              {f.q && (
                <button onClick={() => setF({ ...f, q: '' })} aria-label="Clear search"
                  className="mr-1 grid place-items-center w-7 h-7 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative hidden sm:flex items-stretch border-l-2 border-stone-200">
              <button onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-2 pl-4 pr-4 text-sm font-medium text-stone-900 hover:bg-stone-100 transition-colors">
                <span className="text-stone-400 font-normal">Sort</span>
                <span className="whitespace-nowrap">{SORTS.find(s => s.key === f.sort)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-3xl shadow-card-hover border border-stone-200 z-20 overflow-hidden p-1.5">
                    {SORTS.map(s => (
                      <button key={s.key} onClick={() => { setF(p => ({ ...p, sort: s.key })); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm transition-colors ${
                          f.sort === s.key ? 'bg-stone-900 text-stone-50 font-medium' : 'text-stone-700 hover:bg-stone-100'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* mobile sort (own pill, since command bar hides it < sm) */}
          <div className="relative sm:hidden">
            <button onClick={() => setSortOpen(o => !o)}
              className="h-full flex items-center gap-1.5 px-4 rounded-full bg-white border-2 border-stone-200 text-sm font-medium text-stone-900">
              Sort <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-card-hover border border-stone-200 z-20 overflow-hidden p-1.5">
                  {SORTS.map(s => (
                    <button key={s.key} onClick={() => { setF(p => ({ ...p, sort: s.key })); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm transition-colors ${
                        f.sort === s.key ? 'bg-stone-900 text-stone-50 font-medium' : 'text-stone-700 hover:bg-stone-100'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-stone-900 text-stone-50 text-sm font-medium shrink-0">
            <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
            {chips.length > 0 && <span className="bg-stone-50 text-stone-900 text-[11px] font-bold rounded-full w-5 h-5 grid place-items-center">{chips.length}</span>}
          </button>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {chips.map((c, i) => (
              <button key={i} onClick={() => {
                if (c.special === 'rating') setF(p => ({ ...p, minRating: 0 }));
                else toggle(c.k, c.v);
              }}
                className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-full bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-700 transition-colors">
                {c.label} <X className="w-3.5 h-3.5" />
              </button>
            ))}
            <button onClick={reset} className="text-xs text-stone-500 font-medium underline underline-offset-2 hover:text-stone-900">Clear all</button>
          </div>
        )}
      </div>

      {/* ============================================================
          GRID + STICKY SIDEBAR
         ============================================================ */}
      <div className="mt-7 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block bg-white rounded-4xl border border-stone-200 shadow-card h-fit lg:sticky lg:top-24 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Refine</span>
              <h2 className="font-display font-bold tracking-display text-lg text-stone-900">Filters</h2>
            </div>
            {chips.length > 0 && (
              <button onClick={reset} className="text-xs text-stone-500 font-medium underline underline-offset-2 hover:text-stone-900">Clear all</button>
            )}
          </div>
          <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-1">
            {FilterPanel}
          </div>
        </aside>

        {/* Product grid */}
        <section>
          {loading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-4xl border border-stone-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 grid place-items-center">
                <Search className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="mt-5 font-display font-bold tracking-display text-2xl text-stone-900">Nothing matches — yet.</h3>
              <p className="mt-2 text-stone-500">Loosen a filter or two and the weaves will reappear.</p>
              <button onClick={reset} className="btn-primary mt-6 inline-flex">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleList.map((s, i) => (
                  <SareeCard key={`${s.id}-${i}`} s={s} index={i}
                    qty={qtyOf(s.id)} add={add} inc={inc} dec={dec}
                    onOpen={() => setActive(s)} />
                ))}
              </div>

              {hasMore ? (
                <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3 py-6">
                  <div className="w-7 h-7 rounded-full border-2 border-stone-200 border-t-stone-900 animate-spin" />
                  <p className="text-xs text-stone-400">Loading more · {visible} of {filtered.length} shown</p>
                  <button onClick={() => setVisible(v => Math.min(v + PAGE_SIZE, filtered.length))}
                    className="btn-link text-sm">Load more <ArrowUpRight className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="mt-10 flex flex-col items-center gap-2 py-6 text-center">
                  <span className="h-px w-16 bg-stone-200" />
                  <p className="text-sm text-stone-400">
                    That’s the full loom — {filtered.length} {filtered.length === 1 ? 'saree' : 'sarees'} shown.
                  </p>
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
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50" />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-[88%] max-w-sm bg-stone-50 z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-stone-50">
                <h2 className="font-display font-bold tracking-display text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h2>
                <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white">{FilterPanel}</div>
              <div className="grid grid-cols-2 gap-2.5 p-4 border-t border-stone-200 bg-stone-50">
                <button onClick={reset} className="btn-gold !py-3">Clear all</button>
                <button onClick={() => setDrawerOpen(false)} className="btn-primary !py-3">Show {filtered.length}</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && <SareeGallery saree={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      {/* Go-to-top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Go to top"
            className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 w-12 h-12 rounded-full bg-stone-900 text-stone-50 shadow-card-hover grid place-items-center hover:scale-105 transition-transform">
            <ChevronUp className="w-5 h-5" />
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
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-stone-900">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckList({ values, selected, onToggle, render, counts = {} }) {
  return (
    <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
      {values.map(v => {
        const key = typeof v === 'object' ? v.toString() : v;
        const label = render ? render(v) : v;
        const isSel = selected.includes(v);
        const cnt = counts[v] ?? 0;
        return (
          <button key={key} onClick={() => onToggle(v)}
            className="w-full flex items-center gap-2.5 py-1.5 group text-left">
            <span className={`grid place-items-center w-[18px] h-[18px] rounded-md border-2 transition-colors duration-200 shrink-0 ${
              isSel ? 'border-stone-900 bg-stone-900' : 'border-stone-300 group-hover:border-stone-500'
            }`}>
              {isSel && <Check className="w-3 h-3 text-stone-50" strokeWidth={3} />}
            </span>
            <span className={`flex-1 text-sm ${isSel ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>{label}</span>
            {cnt > 0 && <span className="text-[11px] text-stone-400 tabular-nums">{cnt}</span>}
          </button>
        );
      })}
    </div>
  );
}

function countBy(arr, fn) {
  const m = {};
  arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; });
  return m;
}

/* ---------- Skeleton loader ---------- */
function CardSkeleton() {
  return (
    <div className="rounded-4xl border border-stone-200 bg-white p-3 animate-pulse">
      <div className="aspect-[3/4] rounded-4xl bg-stone-100" />
      <div className="mt-4 h-4 w-3/4 rounded-full bg-stone-100" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-stone-100" />
      <div className="mt-4 h-9 rounded-full bg-stone-100" />
    </div>
  );
}

/* ---------- Tactile saree card ---------- */
const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23F5F5F4"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%23A8A29E" text-anchor="middle" dominant-baseline="middle">No photo yet</text></svg>';

function SareeCard({ s, index, qty, add, inc, dec, onOpen }) {
  const [hover, setHover] = useState(false);
  const [liked, setLiked] = useState(false);

  const photoCount = s.gallery.length;
  const primarySrc = s.gallery[0]?.src || PLACEHOLDER_IMG;
  const altSrc = s.gallery[1]?.src || primarySrc;
  const trait = s.isHandloom ? 'Pure handloom' : (s.material || s.border || s.length || 'Handwoven');

  const onAdd = (e) => { e.stopPropagation(); add(s); };
  const onInc = (e) => { e.stopPropagation(); inc(s.id); };
  const onDec = (e) => { e.stopPropagation(); dec(s.id); };
  const onLike = (e) => { e.stopPropagation(); setLiked(l => !l); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${s.name}`}
      className="group bg-white rounded-4xl border-2 border-transparent hover:border-stone-300 shadow-card hover:shadow-card-hover transition-all duration-300 ease-showroom flex flex-col cursor-pointer overflow-hidden p-3
                 focus:outline-none focus-visible:border-stone-900">
      {/* IMAGE BAY — stone-100 surface with multiply-blend image */}
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="relative aspect-[3/4] rounded-4xl overflow-hidden bg-stone-100">
        <motion.img
          src={primarySrc} alt={s.name} loading="lazy"
          animate={{ scale: hover ? 1.05 : 1, opacity: hover ? 0 : 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="model-img absolute inset-0 w-full h-full object-cover" />
        <motion.img
          src={altSrc} alt="" loading="lazy" aria-hidden
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: hover ? 1.02 : 1.08, opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="model-img absolute inset-0 w-full h-full object-cover" />

        {/* TL — status badges (minimal) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {s.popular && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full glass-white text-stone-900 text-[10px] font-bold uppercase tracking-wide shadow-card">
              <Flame className="w-3 h-3 text-wood" /> Popular
            </span>
          )}
          {s.trending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full glass-white text-stone-900 text-[10px] font-bold uppercase tracking-wide shadow-card">
              <TrendingUp className="w-3 h-3 text-wood" /> Trending
            </span>
          )}
        </div>

        {/* TR — like (rating moved to footer) */}
        <button onClick={onLike} aria-label="Save"
          className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center transition-all duration-300 ${
            liked ? 'bg-stone-900 text-stone-50 scale-105' : 'glass-white text-stone-700 hover:text-stone-900'
          }`}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-stone-50' : ''}`} />
        </button>

        {/* BL — photo count */}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full glass-white text-stone-700 text-[10px] font-medium shadow-card">
          <Camera className="w-3 h-3" /> {photoCount}
        </span>

        {/* BR — Saree ID */}
        <span className="absolute bottom-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-900 text-stone-50 text-[10px] font-bold tabular-nums">
          ID {s.id}
        </span>
      </div>

      {/* INFO */}
      <div className="px-1.5 pt-4 pb-1 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold tracking-display text-base text-stone-900 leading-tight line-clamp-1">{s.name}</h3>
          <span className="inline-flex items-center gap-0.5 text-xs text-stone-500 shrink-0 mt-0.5">
            <Star className="w-3 h-3 fill-wood text-wood" />{s.rating}
          </span>
        </div>
        <p className="mt-1 text-xs text-stone-400 line-clamp-1">{s.color}{s.material ? ` · ${s.material}` : ''}</p>

        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-display font-bold text-lg text-stone-900">{rupee(s.price)}</span>
          {s.mrp > s.price && (
            <>
              <span className="text-xs line-through text-stone-400">{rupee(s.mrp)}</span>
              <span className="text-xs font-semibold text-wood-dark">{s.discount}% off</span>
            </>
          )}
        </div>

        {/* Key-trait footer line */}
        <div className="mt-3 pt-3 flex items-center gap-2 border-t border-stone-100 text-stone-500">
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-medium uppercase tracking-wide truncate">{trait}</span>
        </div>

        {/* Action */}
        <div className="mt-3">
          {qty === 0 ? (
            <button onClick={onAdd}
              className="w-full text-sm py-2.5 rounded-full bg-stone-900 text-stone-50 font-medium hover:bg-stone-700 active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Add to bag
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-full border-2 border-stone-900 p-1">
              <button onClick={onDec}
                className="w-8 h-8 rounded-full bg-stone-900 text-stone-50 grid place-items-center active:scale-90 transition">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium text-stone-900 text-sm tabular-nums">{qty} in bag</span>
              <button onClick={onInc} disabled={qty >= 5}
                className="w-8 h-8 rounded-full bg-stone-900 text-stone-50 grid place-items-center active:scale-90 disabled:opacity-30 transition">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

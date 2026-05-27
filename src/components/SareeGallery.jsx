import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Plus, Minus, Heart, Share2, Star, Camera,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';

export default function SareeGallery({ saree, onClose }) {
  const { items, add, inc, dec } = useCart();
  const qty = items.find((i) => i.id === saree.id)?.qty || 0;

  const list = useMemo(() => {
    if (saree.gallery && saree.gallery.length > 0) return saree.gallery;
    return (saree.images || []).map((src) => ({
      src, angle: 'View', label: 'View', group: 'Saree',
    }));
  }, [saree.gallery, saree.images]);

  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(false);
  const stripRef = useRef(null);

  const go = (i) => {
    if (list.length === 0) return;
    const next = ((i % list.length) + list.length) % list.length;
    setActive(next);
  };
  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  // Keyboard arrows + body scroll lock
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, list.length]);

  // Keep thumbnail strip aligned with the active photo
  useEffect(() => {
    const node = stripRef.current?.querySelector(`[data-thumb="${active}"]`);
    if (node && stripRef.current) {
      node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: saree.name, text: saree.desc, url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied');
      }
    } catch { /* user cancelled */ }
  };

  const current = list[active];

  return (
    <div
      className="fixed inset-0 z-50 bg-ilkal-deep/85 backdrop-blur-md grid place-items-stretch sm:place-items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[95vh] sm:rounded-3xl overflow-hidden shadow-2xl
                   flex flex-col lg:grid lg:grid-cols-[1.15fr_1fr] relative"
      >
        {/* HERO SWIPE GALLERY */}
        <div className="relative bg-ilkal-cream flex-shrink-0">
          {/* Top floating actions */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <span className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                             bg-white/95 backdrop-blur shadow text-[10px] sm:text-[11px] font-semibold text-ilkal-maroon">
              <Camera className="w-3 h-3" /> Live • Natural light
            </span>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setLiked((l) => !l)}
                aria-label="like"
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow grid place-items-center hover:scale-105 transition"
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-ilkal-rose text-ilkal-rose' : 'text-ilkal-maroon'}`} />
              </button>
              <button
                onClick={share}
                aria-label="share"
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow grid place-items-center hover:scale-105 transition"
              >
                <Share2 className="w-4 h-4 text-ilkal-maroon" />
              </button>
              <button
                onClick={onClose}
                aria-label="close"
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow grid place-items-center hover:scale-105 transition"
              >
                <X className="w-4 h-4 text-ilkal-maroon" />
              </button>
            </div>
          </div>

          {/* Swipeable hero photo */}
          <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-ilkal-cream">
            <AnimatePresence mode="wait">
              <motion.img
                key={current?.src || active}
                src={current?.src}
                alt={current?.angle || saree.name}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full object-cover select-none"
                draggable={false}
              />
            </AnimatePresence>

            {/* Swipe layer */}
            <motion.div
              className="absolute inset-0"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
            />

            {/* Gradient + caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ilkal-deep/65 via-ilkal-deep/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest opacity-80">{current?.group}</div>
                <div className="font-serif text-base sm:text-lg leading-tight truncate">{current?.angle}</div>
              </div>
              <span className="shrink-0 text-[10px] sm:text-xs font-semibold bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                {active + 1} / {list.length}
              </span>
            </div>

            {/* Desktop arrows */}
            {list.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous photo"
                  className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow place-items-center hover:scale-105 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-ilkal-maroon" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next photo"
                  className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow place-items-center hover:scale-105 transition"
                >
                  <ChevronRight className="w-5 h-5 text-ilkal-maroon" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {list.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-2.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? 'w-6 bg-ilkal-maroon' : 'w-1.5 bg-ilkal-gold/40 hover:bg-ilkal-gold'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip */}
          {list.length > 1 && (
            <div
              ref={stripRef}
              className="flex gap-2 px-3 pb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {list.map((p, i) => (
                <button
                  key={p.key || i}
                  data-thumb={i}
                  onClick={() => go(i)}
                  className={`shrink-0 w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition ${
                    i === active
                      ? 'border-ilkal-maroon shadow ring-2 ring-ilkal-gold/40'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Open ${p.label || p.angle}`}
                >
                  <img src={p.src} alt={p.label || p.angle}
                    className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SIDE */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-4 sm:p-6 space-y-4 pb-32 lg:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-ilkal-maroon leading-tight">
                  {saree.name}
                </h2>
                <p className="text-sm opacity-70 mt-0.5">{saree.color}</p>
                <span className="inline-block mt-1.5 text-[11px] font-bold text-ilkal-maroon bg-ilkal-gold/20 border border-ilkal-gold/40 px-2 py-0.5 rounded-full">
                  {saree.id}
                </span>
              </div>
              {saree.handloom && /^(yes|pure|s|handloom)/i.test(saree.handloom) && (
                <span className="chip shrink-0">Handloom</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" /> {saree.rating}
              </span>
              <span className="opacity-70 text-xs">Loved by 2,300+ women</span>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-2xl sm:text-3xl text-ilkal-maroon">
                ₹{saree.price.toLocaleString('en-IN')}
              </span>
              {saree.mrp > saree.price && (
                <>
                  <span className="text-sm sm:text-base line-through opacity-50">
                    ₹{saree.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-green-700 font-semibold text-xs sm:text-sm">
                    {saree.discount}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-70 -mt-1">Inclusive of all taxes • Free shipping across India</p>

            <p className="text-sm leading-relaxed opacity-90">{saree.desc}</p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Spec label="Material" value={saree.material || '—'} />
              <Spec label="Border" value={saree.border || '—'} />
              <Spec label="Pallu" value={saree.pallu || '—'} />
              <Spec label="Blouse" value={saree.blouse || '—'} />
              <Spec label="Handloom" value={saree.isHandloom ? 'Yes' : 'No'} />
              <Spec label="Length" value={saree.lengthM ? `${saree.lengthM} m` : '—'} />
            </div>

            <div className="p-3 rounded-2xl bg-ilkal-cream border border-ilkal-gold/30 text-xs leading-relaxed">
              💛 <b className="text-ilkal-maroon">Hand-picked promise:</b> personally selected from a
              weaver&apos;s loom in Ilkal village. Washed, ironed and packed in muslin cloth before reaching you.
            </div>

            <div className="p-3 rounded-2xl bg-yellow-50 border border-yellow-200 text-[11px] leading-relaxed text-yellow-900">
              📷 <b>Disclaimer:</b> A slight variation in the colour of the saree is possible due to natural lighting while taking the photo.
            </div>
          </div>

          {/* STICKY ACTION BAR */}
          <div className="fixed lg:sticky bottom-0 inset-x-0 lg:inset-x-auto z-10 bg-white border-t border-ilkal-gold/30 px-4 py-3 shadow-[0_-4px_20px_rgba(123,30,58,0.10)]"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
            {qty === 0 ? (
              <button onClick={() => add(saree)} className="btn-primary w-full text-base py-3.5">
                <Plus className="w-5 h-5" /> Add to Bag · ₹{saree.price.toLocaleString('en-IN')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-ilkal-cream rounded-full border border-ilkal-gold/40 p-1">
                  <button onClick={() => dec(saree.id)}
                    className="w-9 h-9 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-ilkal-maroon text-sm">{qty}</span>
                  <button onClick={() => inc(saree.id)} disabled={qty >= 5}
                    className="w-9 h-9 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90 disabled:opacity-40">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={onClose} className="btn-primary flex-1 py-3">Keep browsing</button>
              </div>
            )}
            <p className="mt-1.5 text-[10px] text-center opacity-60">
              Max 5 per saree · Hand-packed & shipped with care
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="bg-ilkal-cream/60 rounded-xl p-2.5 border border-ilkal-gold/20">
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-ilkal-maroon font-semibold text-sm truncate">{value}</div>
    </div>
  );
}

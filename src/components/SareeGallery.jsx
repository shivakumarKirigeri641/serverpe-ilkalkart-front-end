import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus, Minus, Heart, Share2, Star, ZoomIn } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { PHOTO_GROUPS } from '../data/sarees.js';
import toast from 'react-hot-toast';

export default function SareeGallery({ saree, onClose }) {
  const { items, add, inc, dec } = useCart();
  const qty = items.find(i => i.id === saree.id)?.qty || 0;

  const list = saree.gallery || saree.images.map(src => ({ src, angle: 'View', label: 'View', group: 'Saree' }));
  const [enlargedIdx, setEnlargedIdx] = useState(null);
  const [liked, setLiked] = useState(false);

  const grouped = PHOTO_GROUPS.map(g => ({
    group: g,
    items: list.map((p, i) => ({ ...p, idx: i })).filter(p => p.group === g)
  })).filter(s => s.items.length > 0);

  const closeEnlarged = () => setEnlargedIdx(null);
  const nextPhoto = () => setEnlargedIdx(i => (i + 1) % list.length);
  const prevPhoto = () => setEnlargedIdx(i => (i - 1 + list.length) % list.length);

  useEffect(() => {
    const onKey = (e) => {
      if (enlargedIdx !== null) {
        if (e.key === 'Escape') closeEnlarged();
        else if (e.key === 'ArrowRight') nextPhoto();
        else if (e.key === 'ArrowLeft') prevPhoto();
      } else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [enlargedIdx]);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: saree.name, text: saree.desc, url: location.href });
      else { await navigator.clipboard.writeText(location.href); toast.success('Link copied'); }
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ilkal-deep/85 backdrop-blur-md grid place-items-center px-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-6xl max-h-[95vh] rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-[1.3fr_1fr] relative">

        {/* GALLERY SIDE — grouped photo sections */}
        <div className="relative bg-ilkal-cream overflow-y-auto max-h-[95vh]">
          {/* Top bar with actions */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-ilkal-cream/95 backdrop-blur border-b border-ilkal-gold/20">
            <span className="chip bg-white shadow text-[11px] capitalize">{saree.material || 'Ilkal'} collection</span>
            <div className="flex gap-2">
              <button onClick={() => setLiked(l => !l)} aria-label="like"
                className="w-9 h-9 rounded-full bg-white shadow grid place-items-center hover:scale-110 transition">
                <Heart className={`w-4 h-4 ${liked ? 'fill-ilkal-rose text-ilkal-rose' : 'text-ilkal-maroon'}`} />
              </button>
              <button onClick={share} aria-label="share"
                className="w-9 h-9 rounded-full bg-white shadow grid place-items-center hover:scale-110 transition">
                <Share2 className="w-4 h-4 text-ilkal-maroon" />
              </button>
              <button onClick={onClose} aria-label="close"
                className="w-9 h-9 rounded-full bg-white shadow grid place-items-center hover:scale-110 transition lg:hidden">
                <X className="w-4 h-4 text-ilkal-maroon" />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-4">
            <div className="text-[11px] text-green-900 bg-green-50 rounded-xl px-3 py-2 border border-green-200 shadow-sm flex items-start gap-2">
              <span className="inline-block w-2 h-2 mt-1 rounded-full bg-green-600 animate-pulse" />
              <span>
                <b>Live footage.</b> Every photo & video on this page was captured live on my mobile, in
                <b> natural daylight</b> — no AI, no editing, no filters, no studio.
              </span>
            </div>
            {grouped.map(({ group, items }) => (
              <section key={group}>
                <h3 className="font-serif text-base sm:text-lg text-ilkal-maroon mb-2 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-ilkal-gold" />
                  {group}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {items.map(p => (
                    <PhotoTile key={p.key || p.idx} photo={p} onClick={() => setEnlargedIdx(p.idx)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* DETAILS SIDE */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[95vh] relative">
          <button onClick={onClose} aria-label="close"
            className="hidden lg:grid absolute top-3 right-3 w-9 h-9 rounded-full bg-ilkal-cream shadow place-items-center hover:scale-110 transition z-10">
            <X className="w-4 h-4 text-ilkal-maroon" />
          </button>

          <div className="flex items-start justify-between gap-2 pr-10">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-ilkal-maroon">{saree.name}</h2>
              <p className="text-sm opacity-70">{saree.color}</p>
            </div>
            {saree.handloom && /^(yes|pure|s|handloom)/i.test(saree.handloom) && (
              <span className="chip">Handloom</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
              <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" /> {saree.rating}
            </span>
            <span className="opacity-70 text-xs">2,300+ happy women</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ilkal-maroon">₹{saree.price.toLocaleString('en-IN')}</span>
            {saree.mrp > saree.price && (
              <>
                <span className="text-base line-through opacity-50">₹{saree.mrp.toLocaleString('en-IN')}</span>
                <span className="text-green-700 font-semibold text-sm">{saree.discount}% off</span>
              </>
            )}
          </div>
          <p className="text-xs opacity-70">Inclusive of all taxes • Free shipping across India</p>

          <p className="mt-4 text-sm leading-relaxed opacity-90">{saree.desc}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Spec label="Material" value={saree.material || '—'} />
            <Spec label="Border"   value={saree.border   || '—'} />
            <Spec label="Pallu"    value={saree.pallu    || '—'} />
            <Spec label="Blouse"   value={saree.blouse   || '—'} />
            <Spec label="Handloom" value={saree.handloom || '—'} />
            <Spec label="Length"   value={saree.length   || '—'} />
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-ilkal-cream border border-ilkal-gold/30 text-xs leading-relaxed">
            💛 <b className="text-ilkal-maroon">Hand-picked promise:</b> I personally selected this saree from the loom in Ilkal village.
            Each piece is washed gently, ironed, and packed in muslin cloth before reaching you.
          </div>

          <div className="mt-5 sticky bottom-0 bg-white pt-3">
            {qty === 0 ? (
              <button onClick={() => add(saree)} className="btn-primary w-full text-base py-4">
                <Plus className="w-5 h-5" /> Add to Bag — ₹{saree.price.toLocaleString('en-IN')}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-ilkal-cream rounded-full border border-ilkal-gold/40 p-1">
                  <button onClick={() => dec(saree.id)} className="w-10 h-10 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-bold text-ilkal-maroon">{qty}</span>
                  <button onClick={() => inc(saree.id)} disabled={qty >= 5} className="w-10 h-10 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon active:scale-90 disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={onClose} className="btn-primary flex-1">Continue Shopping</button>
              </div>
            )}
            <p className="mt-2 text-[11px] text-center opacity-60">Max 5 per saree • Hand-picked & shipped with care</p>
          </div>
        </div>

        {/* Enlarged photo lightbox (inside modal) */}
        <AnimatePresence>
          {enlargedIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeEnlarged}
              className="absolute inset-0 z-20 bg-ilkal-deep/90 backdrop-blur grid place-items-center p-4">
              <motion.img
                key={enlargedIdx}
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                src={list[enlargedIdx].src} alt={list[enlargedIdx].angle}
                onClick={e => e.stopPropagation()}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" />
              <div className="absolute top-3 left-3 chip bg-white/95 shadow">{list[enlargedIdx].angle}</div>
              <button onClick={(e) => { e.stopPropagation(); closeEnlarged(); }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow grid place-items-center">
                <X className="w-5 h-5 text-ilkal-maroon" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow grid place-items-center">
                <ChevronLeft className="w-5 h-5 text-ilkal-maroon" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow grid place-items-center">
                <ChevronRight className="w-5 h-5 text-ilkal-maroon" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/55 text-white text-xs font-medium backdrop-blur">
                {enlargedIdx + 1} / {list.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PhotoTile({ photo, onClick }) {
  return (
    <button onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-white border border-ilkal-gold/20 shadow-sm hover:shadow-md transition">
      <img src={photo.src} alt={photo.angle}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-ilkal-deep/70 via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
        <span className="text-[11px] font-medium drop-shadow">{photo.label}</span>
        <ZoomIn className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
      </div>
    </button>
  );
}

function Spec({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-2.5 border border-ilkal-gold/20">
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-ilkal-maroon font-semibold">{value}</div>
    </div>
  );
}

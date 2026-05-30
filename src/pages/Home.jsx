import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, Plane, Camera, QrCode,
  PhoneCall, BellRing, Gift, PackageCheck, Star, Quote, ChevronLeft, ChevronRight,
  Layers, Scissors, Ruler, Sparkles, Sun, Coffee, MessageCircle, ShieldCheck,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiClient, uploadsUrl } from '../utils/api.js';
import { waOrderHref } from '../components/WhatsAppOrderCard.jsx';

const SEED_TESTIMONIALS = [
  { id: 's1', n: 'Lakshmi, Bengaluru', t: 'I wore the Tope Teni for my pooja and got compliments all day. The fabric feels like a hug from my ajji.', rating: 5 },
  { id: 's2', n: 'Priya, Pune',        t: 'Shiva personally called to confirm the saree — that level of care is rare today. Will buy again!',       rating: 5 },
  { id: 's3', n: 'Anitha, Hyderabad',  t: 'The Kasuti embroidery is unbelievable. Worth every rupee. Felt like a queen at my sister’s wedding.',     rating: 5 },
];

const TESTIMONIALS_PER_PAGE = 3;

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Map a saree to its single most descriptive "material trait" for the cards.
const keyTraitOf = (s) =>
  s?.isHandloom ? { icon: Layers, label: 'Pure handloom weave' }
  : s?.material  ? { icon: Layers, label: s.material }
  : s?.border    ? { icon: Scissors, label: `${s.border} border` }
  : { icon: Ruler, label: s?.length || 'Full-length drape' };

export default function Home() {
  const { sarees, offers = [] } = useCatalog();
  const { add } = useCart();

  // The three "models" presented in the Interactive Model Selection theatre.
  const models = useMemo(() => sarees.slice(0, 3), [sarees]);
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => { if (activeIdx >= models.length) setActiveIdx(0); }, [models.length, activeIdx]);
  const active = models[activeIdx];

  const hero = sarees[0];
  const [occasion, setOccasion] = useState(0);
  const [testimonials, setTestimonials] = useState(SEED_TESTIMONIALS);
  const [tPage, setTPage] = useState(0);
  const tPageCount = Math.max(1, Math.ceil(testimonials.length / TESTIMONIALS_PER_PAGE));
  useEffect(() => { if (tPage >= tPageCount) setTPage(0); }, [tPageCount, tPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/feedbacks');
        const body = res.data;
        if (cancelled) return;
        if (body?.successstatus && Array.isArray(body.data) && body.data.length > 0) {
          setTestimonials(body.data.slice(0, 20).map(f => ({
            id: f.id, n: f.user_name, t: f.message,
            rating: Number(f.rating) || 5,
            image: f.pic_path ? uploadsUrl(f.pic_path) : null,
          })));
        }
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="overflow-hidden bg-stone-50">
      {/* ============================================================
          PRODUCT THEATER (HERO)
          Atmospheric radial gradient, editorial 72px headline,
          21:9 hero image with floating Material Highlight Badge.
         ============================================================ */}
      <section className="relative pt-28 md:pt-36 pb-16 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-wood" /> Hand-picked · Loom to doorstep
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 font-display font-extrabold tracking-display text-[2.75rem] leading-[0.95] sm:text-6xl lg:text-7xl text-stone-900">
            A saree you can <span className="shimmer-text">feel</span><br className="hidden sm:block" /> before you wear it.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-stone-500 leading-relaxed">
            Photographs flatten texture. So we shoot every Ilkal saree in raw daylight —
            no AI, no edits — and pick each one by hand at the loom, so the weave you
            see is the weave that arrives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mt-9 flex flex-wrap items-center justify-center gap-5">
            <Link to="/browse" className="btn-primary text-base">
              Explore the collection <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#models" className="btn-link text-base">Compare three weaves</a>
          </motion.div>
        </div>

        {/* 21:9 hero image with 32px radii + floating material badge */}
        {hero && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative mt-14 max-w-6xl mx-auto">
            <div className="aspect-[21/9] rounded-4xl overflow-hidden bg-stone-200 ring-1 ring-stone-200">
              <img src={hero.images?.[0]} alt={hero.name}
                className="w-full h-full object-cover" loading="eager" />
            </div>
            <div className="material-badge absolute left-5 bottom-5 sm:left-8 sm:bottom-8 max-w-[14rem]">
              <span className="label">Material</span>
              <span className="value">{hero.material || hero.handloom || 'Handwoven Ilkal cotton-silk'}</span>
            </div>
            <div className="material-badge absolute right-5 top-5 sm:right-8 sm:top-8 hidden sm:block">
              <span className="label">Captured in</span>
              <span className="value">Natural daylight · No AI</span>
            </div>
          </motion.div>
        )}
      </section>

      {/* ============================================================
          OFFERS STRIP — minimalist, only if backend returns offers
         ============================================================ */}
      {offers.length > 0 && (
        <section className="border-y border-stone-200 bg-stone-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {offers.map((o, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-stone-900 text-stone-50">
                  <Gift className="w-4 h-4" />
                </span>
                <div className="leading-tight">
                  <span className="text-sm font-bold text-stone-900">{o.title}</span>
                  <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-wood">{o.percent}% off</span>
                  {o.description && <p className="text-xs text-stone-500 line-clamp-1">{o.description}</p>}
                </div>
              </div>
            ))}
            <span className="text-[11px] tracking-wide text-stone-400">Applied automatically at checkout.</span>
          </div>
        </section>
      )}

      {/* ============================================================
          INTERACTIVE MODEL SELECTION — Tactile Model Cards
         ============================================================ */}
      {models.length > 0 && (
        <section id="models" className="py-20 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <span className="eyebrow">The Selection</span>
              <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
                Pick the weave that fits your hands.
              </h2>
              <p className="mt-4 text-stone-500 text-lg">
                Three pieces from the loom this week. Select one to see it carried
                through to checkout — the bar at the bottom updates as you choose.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {models.map((s, i) => {
                const trait = keyTraitOf(s);
                const TraitIcon = trait.icon;
                const isActive = i === activeIdx;
                return (
                  <motion.button
                    type="button" key={s.id}
                    onClick={() => setActiveIdx(i)}
                    initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                    className={`model-card text-left flex flex-col min-h-[480px] ${isActive ? 'model-active' : ''}`}>
                    <span className={`absolute top-6 right-6 text-[11px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>
                      {isActive ? 'Selected' : `0${i + 1}`}
                    </span>

                    <div className="aspect-square rounded-4xl bg-stone-100 overflow-hidden grid place-items-center">
                      <img src={s.images?.[0]} alt={s.name}
                        className="model-img w-full h-full object-cover" loading="lazy" />
                    </div>

                    <div className="mt-6 flex items-baseline justify-between gap-3">
                      <h3 className="font-display font-bold tracking-display text-xl text-stone-900 line-clamp-1">{s.name}</h3>
                      <span className="font-display font-bold text-lg text-stone-900 shrink-0">{rupee(s.price)}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-500 leading-relaxed line-clamp-2">
                      {s.color}{s.border ? ` · ${s.border} border` : ''}{s.pallu ? ` · ${s.pallu} pallu` : ''}.
                    </p>

                    <div className="mt-auto pt-6 flex items-center gap-3 border-t border-stone-200">
                      <span className="grid place-items-center w-10 h-10 rounded-full bg-stone-100 text-stone-700">
                        <TraitIcon className="w-[18px] h-[18px]" />
                      </span>
                      <div className="leading-tight">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Key trait</span>
                        <span className="block text-sm font-medium text-stone-900 line-clamp-1">{trait.label}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          EDITORIAL PHILOSOPHY — split, staggered grayscale grid
         ============================================================ */}
      <section className="py-20 px-5 sm:px-8 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">Our philosophy</span>
            <h2 className="mt-5 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900 leading-[1.05]">
              We never drape it on a model.<br />You are the first to wear it.
            </h2>
            <p className="mt-6 text-stone-600 text-lg leading-relaxed">
              Every saree leaves our hands freshly folded. We unfold it once — only
              to record clean, honest proof of its condition — then wrap it again.
              No call centre, no scripted agents: you speak directly with the founder,
              before and after the purchase.
            </p>
            <p className="mt-4 text-stone-500 leading-relaxed">
              That is also why we don’t offer returns. What you approve on screen,
              in raw daylight, is exactly what reaches your doorstep.
            </p>
            <Link to="/about" className="btn-link mt-7 text-base">
              Read the founder’s story <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { src: sarees[0]?.photos?.palluFar  || sarees[0]?.images?.[0], h: 'h-64' },
              { src: sarees[6]?.photos?.blouseFar || sarees[6]?.images?.[0], h: 'h-80' },
              { src: sarees[3]?.photos?.borderFar || sarees[3]?.images?.[0], h: 'h-80' },
              { src: sarees[1]?.photos?.full      || sarees[1]?.images?.[0], h: 'h-64' },
            ].map((c, i) => c.src && (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group rounded-4xl overflow-hidden bg-stone-200 ${c.h} ${i % 2 ? 'mt-0' : 'mt-8'}`}>
                <img src={c.src} alt="Ilkal detail"
                  className="img-grayscale w-full h-full object-cover transition-transform duration-700 ease-showroom group-hover:scale-105" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          OCCASION SWITCHER — dark immersive showcase, one scene at a time
         ============================================================ */}
      {(() => {
        const OCCASIONS = [
          { src: sarees[2]?.images?.[0], icon: Sparkles, t: 'For the wedding', tag: 'Festive & celebratory',
            line: 'When every eye is on you — zari that catches candlelight and a pallu that tells a story.',
            pts: ['Gold-zari Chikki Paras border', 'Signature Tope Teni pallu', 'Photographs true in candlelight'] },
          { src: sarees[4]?.images?.[0], icon: Sun, t: 'For the pooja', tag: 'Sacred & all-day comfort',
            line: 'Hours of sitting, standing, serving — fabric that stays soft and breathes with you.',
            pts: ['Breathable handloom cotton-silk', 'Soft against skin all day', 'Kasuti motifs, hand-stitched'] },
          { src: sarees[5]?.images?.[0], icon: Coffee, t: 'For everyday', tag: 'Easy & effortless',
            line: 'Office, errands, a friend’s place — drape it in minutes, wash it without worry.',
            pts: ['Easy to drape, easy to wash', 'Holds colour wash after wash', 'Light enough for the commute'] },
        ];
        const oc = OCCASIONS[occasion];
        const OcIcon = oc.icon;
        return (
          <section className="py-20 px-5 sm:px-8 bg-stone-900 text-stone-100">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-2xl">
                <span className="eyebrow !text-stone-400 before:!bg-wood">How it carries</span>
                <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-50">
                  One saree, every occasion.
                </h2>
                <p className="mt-4 text-stone-400 text-lg">Pick a moment — see how the same weave rises to it.</p>
              </div>

              <div className="mt-12 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 lg:items-center">
                {/* image stage — swaps with the selected occasion */}
                <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-4xl overflow-hidden bg-stone-800">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={occasion}
                      src={oc.src}
                      alt={oc.t}
                      loading="lazy"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent" />
                  {/* floating caption badge */}
                  <div className="absolute left-5 bottom-5 right-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 text-[11px] font-bold uppercase tracking-wide text-stone-100">
                      <OcIcon className="w-3.5 h-3.5 text-wood" /> {oc.tag}
                    </span>
                  </div>
                </div>

                {/* occasion tabs + detail */}
                <div>
                  {/* tab selectors */}
                  <div className="flex flex-wrap gap-2.5">
                    {OCCASIONS.map((o, i) => {
                      const Icon = o.icon;
                      const on = i === occasion;
                      return (
                        <button key={i} onClick={() => setOccasion(i)}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                            on ? 'bg-wood text-stone-900' : 'bg-white/5 ring-1 ring-white/10 text-stone-300 hover:bg-white/10'
                          }`}>
                          <Icon className="w-4 h-4" /> {o.t}
                        </button>
                      );
                    })}
                  </div>

                  {/* detail panel */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={occasion}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="mt-8">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-extrabold tracking-display text-2xl text-white/15 tabular-nums">
                          0{occasion + 1}
                        </span>
                        <h3 className="font-display font-extrabold tracking-display text-3xl text-stone-50">{oc.t}</h3>
                      </div>
                      <p className="mt-3 text-stone-400 leading-relaxed max-w-md">{oc.line}</p>
                      <ul className="mt-6 space-y-3">
                        {oc.pts.map((p, k) => (
                          <li key={k} className="flex items-start gap-3">
                            <span className="mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-wood text-stone-900 shrink-0">
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            </span>
                            <span className="text-stone-200 leading-relaxed">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ============================================================
          SPECIFICATION TABLE — compare the three models, featured col
         ============================================================ */}
      {models.length > 0 && (
        <section className="py-20 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl">
              <span className="eyebrow">Side by side</span>
              <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
                The specifications, no fluff.
              </h2>
              <p className="mt-4 text-stone-500 text-lg">
                The piece you selected above is highlighted here too.
              </p>
            </div>

            <div className="mt-10 overflow-x-auto">
              <table className="spec-table min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-44">Specification</th>
                    {models.map((s, i) => (
                      <th key={s.id} className={i === activeIdx ? 'spec-col-featured' : ''}>
                        <span className="block font-display font-bold text-base text-stone-900 normal-case tracking-normal">{s.name}</span>
                        <span className="block text-stone-400 normal-case tracking-normal">{i === activeIdx ? 'Your selection' : 'Tap a card to select'}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Colour',   (s) => s.color || '—'],
                    ['Material', (s) => s.material || (s.isHandloom ? 'Handloom' : '—')],
                    ['Border',   (s) => s.border || '—'],
                    ['Pallu',    (s) => s.pallu || '—'],
                    ['Blouse',   (s) => s.blouse || '—'],
                    ['Length',   (s) => s.length || '—'],
                    ['Price',    (s) => rupee(s.price)],
                  ].map(([label, get]) => (
                    <tr key={label}>
                      <td className="text-stone-500 font-medium">{label}</td>
                      {models.map((s, i) => (
                        <td key={s.id} className={i === activeIdx ? 'spec-col-featured' : 'text-stone-700'}>
                          {get(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          TRUST PROMISES — restyled stone grid (content preserved)
         ============================================================ */}
      <section className="py-20 px-5 sm:px-8 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Why women choose us</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
              Seven promises, one founder.
            </h2>
            <p className="mt-4 text-stone-500 text-lg">
              Ilkal Kart isn’t a marketplace — it’s a personal commitment. Every saree
              passes through my own hands before it reaches yours.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Plane,        t: 'Hand-picked in Ilkal',           d: 'I travel to Ilkal, walk into weavers’ homes and select each saree on the loom. Care begins at the source.' },
              { icon: PhoneCall,    t: 'No call centre — only me',       d: 'No scripted agents, no ticket queues. Speak directly with the founder for every question, before and after.' },
              { icon: BellRing,     t: 'Proactive live updates',         d: 'You never chase a tracking link. I share every milestone — packed, dispatched, in-transit, delivered.' },
              { icon: Camera,       t: 'Real photos & videos — zero AI', d: 'Captured on my phone in natural daylight. No AI, no editing, no filters, no colour grading. Screen = doorstep.' },
              { icon: QrCode,       t: 'Scannable authenticity code',    d: 'Every premium pack carries a unique QR code. Scan it at delivery to verify a genuine, hand-picked Ilkal piece.' },
              { icon: PackageCheck, t: 'Never draped, never worn',       d: 'No saree is photographed on a person or doll. It reaches you freshly folded, unfolded only to record non-damage proof.' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="bg-white rounded-4xl p-7 border border-stone-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 ease-showroom">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-50">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 font-display font-bold tracking-display text-xl text-stone-900">{c.t}</h3>
                  <p className="mt-2 text-sm text-stone-500 leading-relaxed">{c.d}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Honest no-return note */}
          <div className="mt-6 rounded-4xl bg-stone-900 text-stone-100 p-8 sm:p-10">
            <span className="eyebrow !text-stone-400 before:!bg-wood">A clear, honest policy</span>
            <h3 className="mt-4 font-display font-bold tracking-display text-2xl sm:text-3xl text-stone-50">
              No returns — by design, not by loophole.
            </h3>
            <p className="mt-4 max-w-3xl text-stone-300 leading-relaxed">
              Because every saree leaves my hands with complete photo and video proof of
              its clean, pristine condition, I don’t offer returns or replacements. You buy
              with full confidence — exactly what you approve on screen is what arrives.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-6 font-medium text-stone-50 border-b-2 border-wood pb-0.5 hover:border-stone-50 transition-colors">
              Read the full story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOUNDER QUOTE
         ============================================================ */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-10 h-10 mx-auto text-wood" />
          <p className="mt-6 font-display font-extrabold tracking-display text-3xl sm:text-4xl leading-[1.15] text-stone-900">
            “When I unwrap an Ilkal saree, I don’t just see colour — I see the weaver’s
            rough hands, her patient smile, her prayer for the woman who will wear it.”
          </p>
          <p className="mt-6 text-stone-500">— Shivakumar Kirigeri, Founder, Ilkal Kart</p>
          <Link to="/about" className="btn-gold mt-8 inline-flex">Read my journey</Link>
        </div>
      </section>

      {/* ============================================================
          ANATOMY OF AN ILKAL — craft storytelling (Home-unique)
         ============================================================ */}
      <section className="py-20 px-5 sm:px-8 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Read the weave</span>
            <h2 className="mt-3 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
              Anatomy of an Ilkal.
            </h2>
            <p className="mt-4 text-stone-500 text-lg">
              Four signatures that separate a true handloom from a power-loom copy — look for these in every saree.
            </p>
          </div>

          {/* bento: one tall feature tile + three detail tiles */}
          <div className="mt-12 grid gap-5 md:grid-cols-3 md:auto-rows-fr">
            {/* feature tile */}
            <div className="md:row-span-2 relative rounded-4xl overflow-hidden bg-stone-900 min-h-[20rem] flex">
              {sarees[1]?.images?.[0] && (
                <img src={sarees[1].images[0]} alt="Tope Teni pallu" loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-55" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
              <div className="relative mt-auto p-7">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood text-stone-900 text-[10px] font-bold uppercase tracking-widest">
                  The pallu
                </span>
                <h3 className="mt-3 font-display font-extrabold tracking-display text-3xl text-stone-50">Tope Teni</h3>
                <p className="mt-2 text-stone-300 text-sm leading-relaxed max-w-xs">
                  The serrated, temple-tower end-piece unique to Ilkal — woven, never printed. Its rhythm is the loom’s signature.
                </p>
              </div>
            </div>

            {[
              { icon: Layers,   label: 'The border', t: 'Chikki Paras', d: 'Tightly interlocked gold-zari edge that holds its line wash after wash.' },
              { icon: Scissors, label: 'The motifs', t: 'Kasuti', d: 'Hand-stitched folk embroidery — small imperfections prove a human hand.' },
              { icon: Ruler,    label: 'The body',  t: 'Cotton-silk', d: 'Breathable handloom blend: soft against skin, true to the colour you see.' },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="group rounded-4xl bg-white border-2 border-transparent hover:border-stone-300 shadow-card hover:shadow-card-hover transition-all duration-300 ease-showroom p-6 flex items-start gap-4">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 shrink-0 transition-colors group-hover:bg-wood group-hover:text-stone-900">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">{a.label}</span>
                    <h3 className="font-display font-bold tracking-display text-lg text-stone-900 leading-tight">{a.t}</h3>
                    <p className="mt-1 text-sm text-stone-500 leading-relaxed">{a.d}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <Link to="/browse" className="btn-primary">See it in the collection <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
         ============================================================ */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="eyebrow">In their words</span>
              <h2 className="mt-3 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900">What our beauties say</h2>
            </div>
            <Link to="/feedback" className="btn-link shrink-0">Share yours <ArrowRight className="w-4 h-4" /></Link>
          </div>

          <div className="mt-10 relative overflow-hidden">
            <motion.div
              animate={{ x: `-${tPage * 100}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex">
              {Array.from({ length: tPageCount }).map((_, p) => (
                <div key={p} className="shrink-0 w-full grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {testimonials.slice(p * TESTIMONIALS_PER_PAGE, (p + 1) * TESTIMONIALS_PER_PAGE).map((r, i) => (
                    <div key={r.id || i} className="bg-white rounded-4xl p-7 border border-stone-200 shadow-card">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star key={k} className={`w-4 h-4 ${k < (r.rating || 5) ? 'fill-wood text-wood' : 'text-stone-300'}`} />
                        ))}
                      </div>
                      {r.image && (
                        <img src={r.image} alt={r.n}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="mt-4 rounded-2xl object-cover w-full max-h-48 border border-stone-200" />
                      )}
                      <p className="mt-4 text-stone-700 leading-relaxed">“{r.t}”</p>
                      <p className="mt-4 font-display font-bold tracking-display text-stone-900">{r.n}</p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>

            {tPageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button type="button" aria-label="Previous"
                  onClick={() => setTPage(p => Math.max(0, p - 1))} disabled={tPage === 0}
                  className="grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-900 hover:border-stone-900 disabled:opacity-30 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: tPageCount }).map((_, i) => (
                    <button key={i} type="button" aria-label={`Page ${i + 1}`} onClick={() => setTPage(i)}
                      className={`h-2 rounded-full transition-all ${i === tPage ? 'w-6 bg-stone-900' : 'w-2 bg-stone-300 hover:bg-stone-400'}`} />
                  ))}
                </div>
                <button type="button" aria-label="Next"
                  onClick={() => setTPage(p => Math.min(tPageCount - 1, p + 1))} disabled={tPage === tPageCount - 1}
                  className="grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-900 hover:border-stone-900 disabled:opacity-30 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          BUY YOUR WAY + SHOP SAFE — compact Home bands that link out
          (full WhatsApp flow lives on /contact, full scam guide on /verify)
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-5">
          {/* buy your way */}
          <a href={waOrderHref()} target="_blank" rel="noopener noreferrer"
            className="group relative rounded-4xl bg-stone-900 text-stone-50 p-8 sm:p-10 overflow-hidden">
            <MessageCircle className="absolute -bottom-6 -right-4 w-44 h-44 text-white/[0.04] pointer-events-none" />
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-600 text-white">
              <MessageCircle className="w-6 h-6" />
            </span>
            <h2 className="mt-5 font-display font-extrabold tracking-display text-3xl text-stone-50 leading-tight">
              Prefer to just chat?
            </h2>
            <p className="mt-3 text-stone-400 leading-relaxed max-w-sm">
              Skip checkout — WhatsApp me the Saree ID, quantity and address. I’ll send a secure payment
              link and handle the rest, personally.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
              Start a WhatsApp order
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          {/* shop safe */}
          <Link to="/verify"
            className="group relative rounded-4xl bg-white border border-stone-200 shadow-card hover:shadow-card-hover transition-shadow p-8 sm:p-10 overflow-hidden">
            <ShieldCheck className="absolute -bottom-6 -right-4 w-44 h-44 text-stone-100 pointer-events-none" />
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-wood text-stone-900">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h2 className="mt-5 font-display font-extrabold tracking-display text-3xl text-stone-900 leading-tight">
              Shop safe, sister.
            </h2>
            <p className="mt-3 text-stone-500 leading-relaxed max-w-sm">
              Three signals beat every fake: SMS only from <span className="font-mono text-stone-700">*-SRVRPE-*</span>,
              an <b className="text-stone-700">ilkalkart</b> watermark on every photo, and a QR that verifies here.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-wood-dark">
              Verify a saree &amp; spot scams
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ============================================================
          STICKY CHECKOUT BAR — reflects the active model selection
         ============================================================ */}
      {active && (
        <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 px-3 sm:px-6 pb-3 md:pb-4 pointer-events-none">
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto max-w-5xl mx-auto glass-white border border-stone-200 rounded-full shadow-card-hover px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-5">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 shrink-0 hidden sm:block">
              <img src={active.images?.[0]} alt={active.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold tracking-display text-sm sm:text-base text-stone-900 truncate">{active.name}</div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {active.quantity > 0 ? 'In stock' : 'Made to order'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-widest text-stone-400 leading-none">Price</div>
              <div className="font-display font-bold text-base sm:text-lg text-stone-900 leading-tight">{rupee(active.price)}</div>
            </div>
            <button type="button" onClick={() => add(active)}
              className="btn-primary !py-3 !px-5 sm:!px-7 text-sm shrink-0">
              Add to cart <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

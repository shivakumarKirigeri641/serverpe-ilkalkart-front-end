import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ShieldCheck, X, Check, MessageSquare, Stamp, QrCode,
  Sparkles, Layers, ScanLine, Instagram, UserX, Star, MessageCircle, ImageOff,
  ChevronRight, ChevronLeft, Pause, Play,
} from 'lucide-react';

const SLIDE_MS = 5000;

const SCAM_PATTERNS = [
  {
    icon: Sparkles, short: 'AI & edited photos',
    t: 'AI-generated & over-edited photos',
    d: "Colours look unnaturally vivid, the model's hand has 6 fingers, or every photo looks identical-perfect — that's AI or heavy editing. Real Ilkal has texture, slight folds and natural-light shadows.",
    bad: 'Studio lighting · DSLR bokeh · “showroom” sets',
    good: 'Mobile shots in daylight · visible weave · zero filters',
  },
  {
    icon: Layers, short: 'Power-loom copies',
    t: 'Power-loom copies sold as “handloom”',
    d: 'A genuine Ilkal handloom takes 4–7 days to weave. A power-loom copy costs a fifth and is finished in hours. Most ₹999 “Ilkal” sarees online are power-loom polyester-cotton blends.',
    bad: 'Suspiciously cheap · perfect symmetric border · plastic feel',
    good: 'Subtle weave variations · soft cotton · honest pricing',
  },
  {
    icon: ScanLine, short: 'Fake QR & brand lifting',
    t: 'Fake QR & brand-name lifting',
    d: 'Sellers paste a meaningless QR sticker or steal “Ilkal Kart” in their handle. Always scan the QR — only ours verifies on this website. Always check the URL: it must be ours.',
    bad: 'QR opens random links · look-alike Instagram handles',
    good: 'QR opens /verify on this site · single founder, one number',
  },
  {
    icon: Instagram, short: 'Instagram-only sellers',
    t: 'Instagram-only sellers, no records',
    d: '“DM to buy”, GPay-only, no invoice, no order ID, no GST, no return address. If something goes wrong, you have zero recourse. Genuine Ilkal Kart issues a tax invoice and order ID for every purchase.',
    bad: 'No invoice · UPI to personal name · ghost after delivery',
    good: 'Order ID · GST invoice · founder personally on WhatsApp',
  },
  {
    icon: UserX, short: 'Drape-and-discard',
    t: 'Drape-and-discard scams',
    d: 'Some sellers photograph a saree draped on a model, then resell that same draped saree as “new”. Worn, creased, sometimes even washed. Never accept a saree photographed while worn.',
    bad: 'Saree draped on a model in the product photo',
    good: 'I never drape a saree on anyone — folded photos only',
  },
  {
    icon: Star, short: 'Fake reviews',
    t: 'Photoshopped customer reviews',
    d: 'Fake review screenshots, stolen testimonial photos, identical 5-star ratings from suspiciously similar accounts. Look for real, recent feedback with photos — like the ones on our Feedback page.',
    bad: 'Reviews with no dates · stock-photo customers',
    good: 'Live customer photos & videos · real names · dates',
  },
  {
    icon: MessageCircle, short: 'Spoofed SMS / OTP',
    t: 'Spoofed SMS & OTP traps',
    d: 'Scammers mimic brand names with SMS headers like “ILKAL”, “IKART” or “ILKLKT” to steal OTPs. Our legitimate SMS always lands from the official sender header — anything else is phishing.',
    bad: 'OTP from “ILKAL”, “IKART” · “share OTP” calls',
    good: 'SMS only from *-SRVRPE-* · OTP never asked over a call',
  },
  {
    icon: ImageOff, short: 'Stolen photos',
    t: 'Stolen photos passed off as their own',
    d: 'Some sellers screenshot our live saree photos and re-post them as their own stock. Every photo & video that leaves our site carries an “ilkalkart” watermark and a capture-timestamp baked in.',
    bad: 'Cropped photos · no watermark · no timestamp',
    good: 'Visible ilkalkart watermark · live timestamp on every frame',
  },
];

const SIGNALS = [
  { n: '01', icon: MessageSquare, t: 'SMS sender ID', d: 'Every OTP & transactional SMS arrives only from the header *-SRVRPE-*. Anything else — ignore it.' },
  { n: '02', icon: Stamp,        t: 'Photo watermark', d: 'Every saree photo & video carries an “ilkalkart” watermark and a live capture timestamp. No watermark = not us.' },
  { n: '03', icon: QrCode,       t: 'Scannable QR', d: 'The QR on the label opens only on this site’s /verify page and shows your real order.' },
];

export default function ScamWarning({ compact = false }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const total = SCAM_PATTERNS.length;
  const trap = SCAM_PATTERNS[active];
  const TrapIcon = trap.icon;

  const go = (next) => {
    setDir(next > active || (active === total - 1 && next === 0) ? 1 : -1);
    setActive((next + total) % total);
  };
  const step = (delta) => { setDir(delta); setActive((a) => (a + delta + total) % total); };

  // Auto-advance unless paused.
  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      setDir(1);
      setActive((a) => (a + 1) % total);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  return (
    <section className={`px-4 sm:px-6 ${compact ? 'py-10' : 'py-16 sm:py-20'} bg-stone-50`}>
      <div className="max-w-7xl mx-auto">

        {/* ============================================================
            HERO — dark banner with a "8 traps / 3 signals" framing
           ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-4xl bg-stone-900 text-stone-50 overflow-hidden shadow-card-hover">
          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <div className="p-8 sm:p-11">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 ring-1 ring-rose-500/30 text-rose-300 text-[11px] font-bold uppercase tracking-[0.18em]">
                <AlertTriangle className="w-3.5 h-3.5" /> Stay safe
              </span>
              <h2 className="mt-5 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-50 leading-[0.92]">
                Beware of Ilkal saree scams.
              </h2>
              <p className="mt-4 max-w-xl text-stone-400 leading-relaxed">
                The Ilkal saree’s fame brought a sad reality — <b className="text-rose-300">power-loom copies,
                polyester replicas and AI-edited photos</b> flood social media. Many sisters paid for
                “genuine Ilkal” and received a machine-made imitation, or nothing at all. A sister-to-sister
                warning from your founder: here’s how to spot — and dodge — every trap.
              </p>
            </div>
            {/* stat block */}
            <div className="flex sm:flex-col divide-x sm:divide-x-0 sm:divide-y divide-stone-700 border-t lg:border-t-0 lg:border-l border-stone-700">
              <div className="flex-1 p-7 sm:p-8 flex items-center gap-4">
                <span className="font-display font-extrabold tracking-display text-5xl text-rose-400 leading-none">8</span>
                <span className="text-sm text-stone-400 leading-tight">common traps,<br />explained below.</span>
              </div>
              <div className="flex-1 p-7 sm:p-8 flex items-center gap-4">
                <span className="font-display font-extrabold tracking-display text-5xl text-emerald-400 leading-none">3</span>
                <span className="text-sm text-stone-400 leading-tight">signals that<br />beat all eight.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            SCAM REEL — auto-playing carousel, one trap on screen at a time
           ============================================================ */}
        <div
          className="mt-8 rounded-4xl bg-stone-900 overflow-hidden shadow-card-hover"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>

          {/* top progress segments — one per trap */}
          <div className="flex gap-1.5 px-7 sm:px-10 pt-7">
            {SCAM_PATTERNS.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Trap ${i + 1}`}
                className="relative h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                {i < active && <span className="absolute inset-0 bg-rose-500/60" />}
                {i === active && (
                  <motion.span
                    key={`${active}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-rose-500"
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? '8%' : '100%' }}
                    transition={{ duration: paused ? 0.3 : SLIDE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* header + controls */}
          <div className="px-7 sm:px-10 pt-6 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow !text-stone-400 before:!bg-rose-500">The field guide</span>
              <h3 className="mt-3 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-50 leading-[0.95]">
                Eight traps, on a loop.
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'}
                className="grid place-items-center w-10 h-10 rounded-full border border-white/15 text-stone-300 hover:bg-white/10 transition">
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button onClick={() => step(-1)} aria-label="Previous"
                className="grid place-items-center w-10 h-10 rounded-full border border-white/15 text-stone-300 hover:bg-white/10 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => step(1)} aria-label="Next"
                className="grid place-items-center w-10 h-10 rounded-full border border-white/15 text-stone-300 hover:bg-white/10 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* the slide */}
          <div className="relative px-7 sm:px-10 pt-8 pb-8 min-h-[24rem] overflow-hidden">
            <span className="absolute -top-6 right-4 sm:right-8 font-display font-extrabold tracking-display text-[9rem] sm:text-[12rem] leading-none text-white/[0.04] select-none pointer-events-none tabular-nums">
              {String(active + 1).padStart(2, '0')}
            </span>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                initial={(d) => ({ opacity: 0, x: d * 60 })}
                animate={{ opacity: 1, x: 0 }}
                exit={(d) => ({ opacity: 0, x: d * -60 })}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-rose-500/15 ring-1 ring-rose-500/30 text-rose-400 shrink-0">
                    <TrapIcon className="w-7 h-7" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                    Trap {String(active + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}
                  </span>
                </div>
                <h4 className="mt-5 font-display font-extrabold tracking-display text-2xl sm:text-4xl text-stone-50 leading-tight max-w-2xl">
                  {trap.t}
                </h4>
                <p className="mt-3 max-w-2xl text-stone-400 leading-relaxed">{trap.d}</p>

                <div className="mt-7 grid sm:grid-cols-2 gap-3 max-w-3xl">
                  <div className="rounded-4xl bg-rose-500/10 ring-1 ring-rose-500/20 p-5">
                    <div className="flex items-center gap-2 text-rose-300">
                      <span className="grid place-items-center w-6 h-6 rounded-full bg-rose-500 text-white"><X className="w-3.5 h-3.5" strokeWidth={3} /></span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]">The trap</span>
                    </div>
                    <p className="mt-2.5 text-sm text-rose-100/90 leading-snug">{trap.bad}</p>
                  </div>
                  <div className="rounded-4xl bg-emerald-500/10 ring-1 ring-emerald-500/20 p-5">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <span className="grid place-items-center w-6 h-6 rounded-full bg-emerald-500 text-white"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]">The genuine</span>
                    </div>
                    <p className="mt-2.5 text-sm text-emerald-100/90 leading-snug">{trap.good}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* thumbnail rail */}
          <div className="border-t border-stone-700 px-5 sm:px-8 py-3">
            <ul className="flex gap-2 overflow-x-auto no-scrollbar">
              {SCAM_PATTERNS.map((s, i) => {
                const Icon = s.icon;
                const on = i === active;
                return (
                  <li key={i} className="shrink-0">
                    <button onClick={() => go(i)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-300 ${
                        on ? 'bg-rose-500 text-white' : 'text-stone-400 hover:bg-white/5'
                      }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium whitespace-nowrap">{s.short}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ============================================================
            AUTHENTICITY CHECKLIST — three rows, each with a realistic
            "proof artifact" so no two signals look alike.
           ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 rounded-4xl bg-stone-100 border border-stone-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-8 sm:px-10 pt-8 sm:pt-10">
            <div>
              <span className="eyebrow before:!bg-emerald-500">Memorise these three</span>
              <h3 className="mt-3 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900 leading-[0.95]">
                Three signals beat all eight traps.
              </h3>
            </div>
            <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide shrink-0">
              <ShieldCheck className="w-4 h-4" /> Check on arrival
            </span>
          </div>

          {/* three checklist rows */}
          <ul className="mt-7 divide-y divide-stone-200 border-t border-stone-200">
            {SIGNALS.map(({ n, icon: Icon, t, d }, i) => (
              <motion.li
                key={n}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="group flex flex-col sm:flex-row sm:items-center gap-5 px-8 sm:px-10 py-6 hover:bg-white transition-colors">
                {/* index + tick */}
                <div className="flex items-center gap-4 sm:w-56 shrink-0">
                  <span className="font-display font-extrabold tracking-display text-4xl text-stone-200 tabular-nums leading-none">{n}</span>
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-emerald-500 text-white shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                {/* text */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold tracking-display text-lg text-stone-900">{t}</h4>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed max-w-xl">{d}</p>
                </div>
                {/* realistic proof artifact — unique per signal */}
                <div className="shrink-0 sm:w-52 flex sm:justify-end">
                  {i === 0 && (
                    <div className="w-full sm:w-44 rounded-2xl bg-stone-900 p-3 shadow-card">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Sender</div>
                      <div className="mt-0.5 font-mono text-sm font-bold text-emerald-400 tracking-wider">*-SRVRPE-*</div>
                      <div className="mt-2 h-1.5 w-3/4 rounded-full bg-white/10" />
                      <div className="mt-1 h-1.5 w-1/2 rounded-full bg-white/10" />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl bg-gradient-to-br from-stone-300 to-stone-200 overflow-hidden shadow-card">
                      <span className="absolute inset-0 grid place-items-center text-stone-400"><Stamp className="w-7 h-7" /></span>
                      <span className="absolute bottom-1.5 right-2 inline-flex items-center gap-1 text-[10px] font-bold text-white/90 drop-shadow">
                        <Check className="w-3 h-3" strokeWidth={3} /> ilkalkart · live
                      </span>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="w-full sm:w-44 rounded-2xl bg-white ring-1 ring-stone-200 p-3 flex items-center gap-3 shadow-card">
                      <span className="grid place-items-center w-12 h-12 rounded-xl bg-stone-900 text-stone-50 shrink-0"><QrCode className="w-6 h-6" /></span>
                      <div className="leading-tight min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Opens</div>
                        <div className="font-mono text-sm font-bold text-stone-900 truncate">/verify</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>

          {/* conclusion stamp */}
          <div className="px-8 sm:px-10 py-5 bg-emerald-500 flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-white/20 text-white shrink-0"><ShieldCheck className="w-5 h-5" /></span>
            <p className="font-display font-bold tracking-display text-white text-base sm:text-lg">
              All three match? It’s genuinely us. Any one missing? Walk away.
            </p>
          </div>
        </motion.div>

        {/* ============================================================
            FOUNDER'S PROMISE — signature band
           ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-6 rounded-4xl bg-stone-900 text-stone-50 overflow-hidden">
          <div className="relative p-8 sm:p-12">
            <ShieldCheck className="absolute -top-6 -right-4 w-44 h-44 text-white/[0.03] pointer-events-none" />
            <span className="eyebrow !text-stone-400 before:!bg-wood">My promise to you</span>
            <p className="mt-5 font-display font-extrabold tracking-display text-3xl sm:text-5xl text-stone-50 leading-[1.02]">
              One founder. <span className="text-wood">One WhatsApp number.</span> One website.
            </p>
            <p className="mt-5 max-w-2xl text-stone-400 leading-relaxed">
              Every saree carries a unique scannable QR that verifies only on this domain. If anyone — an
              Instagram page, a WhatsApp forward or a random website — claims to be “Ilkal Kart” but doesn’t
              match what you see here, it isn’t us.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-display font-bold tracking-display text-lg text-wood">— Shivakumar, Founder</span>
              <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-50 border-b-2 border-wood pb-0.5 hover:border-stone-50 transition-colors">
                When in doubt, message me <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* report bar — docked along the bottom edge */}
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
            className="group flex items-center gap-3 px-8 sm:px-12 py-5 border-t border-stone-700 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="flex-1 text-sm text-stone-300 leading-snug">
              <b className="text-stone-50">Already cheated by another “Ilkal” seller?</b> Don’t stay silent — your report protects another sister.
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 whitespace-nowrap">
              Report · dial 1930 <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

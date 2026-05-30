import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Truck, Gift, PackageCheck,
  Users, HeartHandshake, Camera, PhoneCall, Check, Search, CreditCard,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import WhatsAppOrderCard from '../components/WhatsAppOrderCard.jsx';

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Bulk() {
  const { count, bulkMinQty, bulkDiscountRate, bulkEligible, subtotal, bulkDiscount } = useCart();

  const pctLabel = `${(bulkDiscountRate * 100).toFixed(0)}%`;
  const progress = Math.min(100, Math.round((count / bulkMinQty) * 100));
  const remaining = Math.max(0, bulkMinQty - count);

  const STEPS = [
    { t: 'Browse',     d: `Pick at least ${bulkMinQty} sarees from the catalogue.`,   icon: Search },
    { t: 'Checkout',   d: `${pctLabel} off auto-applied on the total — no coupon.`,    icon: ShoppingBag },
    { t: 'Fill details', d: 'Share name, mobile and delivery address.',               icon: Users },
    { t: 'Pay securely', d: 'Pay through a trusted gateway, one go.',                  icon: CreditCard },
    { t: 'Dispatch',   d: 'I hand-pack every saree and ship to your door.',           icon: Truck },
  ];

  const AUDIENCE = [
    { icon: HeartHandshake, t: 'Wedding trousseau',  d: 'Sarees for the bride, mother, sisters, aunts — one curated order, one discount.' },
    { icon: Users,          t: 'Family functions',   d: 'Coordinate the same weave or palette across the family for poojas and ceremonies.' },
    { icon: Gift,           t: 'Festive gifting',     d: 'Diwali, Sankranti or staff appreciation — gift authentic Ilkal sarees in volume.' },
    { icon: Sparkles,       t: 'Temple & seva',      d: 'Sarees for temple offerings, charitable distribution and community programmes.' },
    { icon: ShieldCheck,    t: 'Boutique re-sellers', d: 'Small boutique owners looking for genuine, hand-picked Ilkal pieces.' },
    { icon: Camera,         t: 'Event stylists',     d: 'Photo shoots and themed events — every piece backed by live, unedited photos.' },
  ];

  return (
    <div className="overflow-hidden bg-stone-50">
      {/* ============================================================
          HERO — Product-Theater treatment for the offer
         ============================================================ */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}>
            <span className="eyebrow">Bulk orders · Flat {pctLabel} off</span>
            <h1 className="mt-5 font-display font-extrabold tracking-display text-5xl sm:text-7xl text-stone-900 leading-[0.92]">
              Buy {bulkMinQty}, <span className="shimmer-text">save {pctLabel}</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-500 leading-relaxed">
              Planning a wedding trousseau, a family function, a temple offering or simply
              gifting your loved ones? Order <b className="text-stone-700">{bulkMinQty} sarees or more</b> in a single
              purchase and a flat <b className="text-stone-700">{pctLabel} discount</b> lands on your total —
              automatically, no coupon needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/browse" className="btn-primary">
                Start browsing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/checkout" className="btn-gold">
                <ShoppingBag className="w-4 h-4" /> Go to bag
              </Link>
            </div>
          </motion.div>

          {/* Big offer "tile" with floating material badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="relative">
            <div className="rounded-4xl bg-stone-900 text-stone-50 p-9 sm:p-11 shadow-card-hover">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Single-order discount</span>
              <div className="mt-3 font-display font-extrabold tracking-display text-7xl sm:text-8xl leading-none text-wood">
                {pctLabel}
              </div>
              <div className="mt-2 font-display font-bold tracking-display text-2xl text-stone-50">off the total</div>
              <div className="mt-6 pt-6 border-t border-stone-700 flex items-center gap-3 text-sm text-stone-300">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-wood text-stone-900 shrink-0">
                  <Check className="w-5 h-5" strokeWidth={3} />
                </span>
                Applied automatically — no coupon to remember.
              </div>
            </div>
            <div className="material-badge absolute -bottom-5 -left-3 sm:-left-5">
              <span className="label">Minimum</span>
              <span className="value">{bulkMinQty} sarees · any mix</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          LIVE BULK PROGRESS — gauge with pip markers
         ============================================================ */}
      <section className="px-5 sm:px-8 pb-4">
        <div className="max-w-4xl mx-auto rounded-4xl bg-white border border-stone-200 shadow-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Your bulk-offer status</span>
              <p className="mt-2 text-stone-700 text-lg leading-snug max-w-md">
                {bulkEligible
                  ? `You qualify — flat ${pctLabel} off on ${rupee(subtotal)} means ${rupee(bulkDiscount)} saved.`
                  : remaining === bulkMinQty
                    ? `Add ${bulkMinQty} sarees to your bag to unlock ${pctLabel} off.`
                    : `Add ${remaining} more saree${remaining === 1 ? '' : 's'} to unlock ${pctLabel} off your total.`}
              </p>
            </div>
            <Link to={bulkEligible ? '/checkout' : '/browse'} className="btn-primary !py-2.5 !px-5 text-sm shrink-0">
              {bulkEligible ? 'Proceed to checkout' : 'Browse sarees'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <span className="font-display font-extrabold tracking-display text-3xl text-stone-900 tabular-nums leading-none">
                {count}<span className="text-stone-300 text-xl">/{bulkMinQty}</span>
              </span>
              <span className={`text-xs font-bold uppercase tracking-wide ${bulkEligible ? 'text-emerald-600' : 'text-stone-400'}`}>
                {bulkEligible ? 'Unlocked' : `${remaining} to go`}
              </span>
            </div>
            {/* track with pip markers */}
            <div className="relative h-3 w-full rounded-full bg-stone-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                className={`h-full rounded-full ${bulkEligible ? 'bg-emerald-500' : 'bg-stone-900'}`} />
            </div>
            <div className="mt-2 flex justify-between">
              {Array.from({ length: bulkMinQty }).map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < count ? (bulkEligible ? 'bg-emerald-500' : 'bg-stone-900') : 'bg-stone-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — connected rail
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
              Same simple flow, bigger savings.
            </h2>
            <p className="mt-4 text-stone-500 text-lg">
              Bulk orders follow the exact same trusted process as a single saree — only the discount changes.
            </p>
          </div>

          <ol className="mt-12 relative grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-0">
            <span className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-stone-200" aria-hidden />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === STEPS.length - 1;
              return (
                <motion.li key={s.t}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="relative flex flex-col items-center text-center group">
                  <div className={`relative grid place-items-center w-12 h-12 rounded-full ring-4 ring-stone-50 transition-transform duration-300 ease-showroom group-hover:-translate-y-1 ${
                    isLast ? 'bg-wood text-stone-900' : 'bg-stone-900 text-stone-50'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-white border border-stone-200 text-[10px] font-bold text-stone-900">{i + 1}</span>
                  </div>
                  <span className="mt-4 font-display font-bold tracking-display text-sm text-stone-900">{s.t}</span>
                  <span className="mt-1 text-[11px] text-stone-400 leading-snug max-w-[9rem]">{s.d}</span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============================================================
          WHO IT'S FOR — editorial stone cards
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8 bg-stone-100 border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Made for</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900">
              Big moments &amp; gestures.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="group bg-white rounded-4xl p-7 border-2 border-transparent hover:border-stone-300 shadow-card hover:shadow-card-hover transition-all duration-300 ease-showroom">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 transition-colors group-hover:bg-wood group-hover:text-stone-900">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 font-display font-bold tracking-display text-xl text-stone-900">{c.t}</h3>
                  <p className="mt-2 text-sm text-stone-500 leading-relaxed">{c.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT YOU GET — "order docket": sticky guarantee card +
          itemised ledger of inclusions (numbered line-items).
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-12 lg:items-start">

          {/* LEFT — dark guarantee docket (sticky) */}
          <div className="lg:sticky lg:top-24 rounded-4xl bg-stone-900 text-stone-50 p-8 sm:p-9 shadow-card-hover">
            <span className="eyebrow !text-stone-400 before:!bg-wood">Included</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-50 leading-[0.95]">
              What every bulk order carries.
            </h2>

            <div className="mt-7 flex items-end gap-3">
              <span className="font-display font-extrabold tracking-display text-6xl leading-none text-wood">7</span>
              <span className="text-sm text-stone-400 leading-tight pb-1">promises,<br />on every order.</span>
            </div>

            {/* core stats */}
            <dl className="mt-7 pt-6 border-t border-stone-700 space-y-4">
              {[
                { icon: Truck,        title: 'Free shipping',   sub: 'Pan-India, every PIN' },
                { icon: PackageCheck, title: 'Never worn',      sub: 'Folded & wrapped fresh' },
                { icon: PhoneCall,    title: 'Founder support', sub: 'Call before dispatch' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3.5">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 text-wood shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="leading-tight">
                    <dt className="font-display font-bold tracking-display text-sm text-stone-50">{title}</dt>
                    <dd className="text-[11px] text-stone-400">{sub}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-2.5">
              <Link to="/browse" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-50 text-stone-900 font-medium hover:bg-white transition active:scale-[0.98]">
                Start browsing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-stone-600 text-stone-100 font-medium hover:border-wood hover:text-wood transition active:scale-[0.98]">
                <PhoneCall className="w-4 h-4" /> Talk to the founder
              </Link>
            </div>
          </div>

          {/* RIGHT — itemised ledger of inclusions */}
          <ol className="divide-y divide-stone-200 border-y border-stone-200">
            {[
              { lead: `Flat ${pctLabel} discount`, rest: 'on the entire order, applied automatically at checkout.', highlight: true },
              { lead: `Minimum ${bulkMinQty} sarees`, rest: 'in a single order — any mix of designs, colours and prices counts.' },
              { lead: 'Free pan-India shipping', rest: 'every order, every PIN code, no hidden charges.' },
              { lead: 'A personal founder call', rest: 'to confirm your selection before dispatch.' },
              { lead: 'Live, unedited photos & videos', rest: 'of every saree before it is packed.' },
              { lead: 'Never draped, never worn', rest: 'each saree is unfolded only to record non-damage proof, then folded and wrapped fresh.' },
              { lead: 'Honest no-returns policy', rest: 'you approve every saree on screen, then it ships.' },
            ].map((item, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="group flex items-start gap-5 py-5 px-3 -mx-3 rounded-2xl hover:bg-stone-100 transition-colors">
                <span className={`font-display font-extrabold tracking-display text-lg tabular-nums leading-none pt-1 shrink-0 w-7 ${item.highlight ? 'text-wood' : 'text-stone-300'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="flex-1 leading-relaxed">
                  <span className="font-display font-bold tracking-display text-stone-900">{item.lead}</span>
                  <span className="text-stone-500"> — {item.rest}</span>
                </p>
                <Check className="w-5 h-5 text-stone-300 shrink-0 mt-0.5 transition-colors group-hover:text-wood" strokeWidth={2.5} />
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <WhatsAppOrderCard />
    </div>
  );
}

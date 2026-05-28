import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Truck, Gift, PackageCheck,
  Users, HeartHandshake, Camera, BadgePercent, CheckCircle2, PhoneCall
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import WhatsAppOrderCard from '../components/WhatsAppOrderCard.jsx';

export default function Bulk() {
  const { count, bulkMinQty, bulkDiscountRate, bulkEligible, subtotal, bulkDiscount } = useCart();

  const pctLabel = `${(bulkDiscountRate * 100).toFixed(0)}%`;
  const progress = Math.min(100, Math.round((count / bulkMinQty) * 100));
  const remaining = Math.max(0, bulkMinQty - count);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 silk-gradient" />
        <div className="absolute inset-0 bg-ilkal-deep/30" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-white">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/30 text-xs tracking-widest">
              <BadgePercent className="w-3.5 h-3.5 text-ilkal-gold" /> BULK ORDERS • FLAT {pctLabel} OFF
            </span>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight">
              Buy {bulkMinQty} or more sarees, <span className="shimmer-text">save {pctLabel} on the total</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg opacity-95">
              Planning a wedding trousseau, a family function, a temple offering or simply gifting your loved ones?
              Order <b>{bulkMinQty} sarees or more</b> in a single purchase and a flat <b>{pctLabel} discount</b> is
              applied to your total — automatically, no coupon needed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/browse" className="btn-primary">
                Start Browsing Sarees <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/checkout" className="btn-gold">
                <ShoppingBag className="w-4 h-4" /> Go to Bag
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LIVE BAG PROGRESS */}
      <section className="bg-white border-y border-ilkal-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-3xl bg-ilkal-cream/70 border border-ilkal-gold/30 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-serif text-xl text-ilkal-maroon">Your bulk-offer status</h2>
                <p className="text-xs sm:text-sm opacity-80">
                  {bulkEligible
                    ? `You qualify! Flat ${pctLabel} off on ₹${subtotal.toLocaleString('en-IN')} = ₹${bulkDiscount.toLocaleString('en-IN')} saved.`
                    : remaining === bulkMinQty
                      ? `Add ${bulkMinQty} sarees to your bag to unlock ${pctLabel} off.`
                      : `Add ${remaining} more saree${remaining === 1 ? '' : 's'} to unlock ${pctLabel} off your total.`}
                </p>
              </div>
              <Link to={bulkEligible ? '/checkout' : '/browse'} className="btn-primary text-sm">
                {bulkEligible ? 'Proceed to Checkout' : 'Browse Sarees'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-white border border-ilkal-gold/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }}
                  className={`h-full ${bulkEligible ? 'bg-green-500' : 'silk-gradient'}`} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] opacity-70">
                <span>{count} in bag</span>
                <span>Goal: {bulkMinQty} sarees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon">
              Same simple flow, <span className="shimmer-text">bigger savings</span>
            </h2>
            <p className="mt-3 opacity-80 text-sm sm:text-base max-w-2xl mx-auto">
              Bulk orders follow the exact same trusted process as a single saree — only the discount changes.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n: '1', t: 'Browse',            d: `Pick at least ${bulkMinQty} sarees from the catalogue.` },
              { n: '2', t: 'Checkout',          d: `${pctLabel} off is auto-applied on the total — no coupon.` },
              { n: '3', t: 'Fill details',      d: 'Share name, mobile and delivery address.' },
              { n: '4', t: 'Pay securely',      d: 'Pay through a trusted gateway, one go.' },
              { n: '5', t: 'Dispatch & deliver', d: 'I hand-pack every saree and ship to your door.' }
            ].map((s, i) => (
              <motion.li key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 border border-ilkal-gold/20 shadow-sm relative">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full silk-gradient text-white font-bold grid place-items-center shadow-lg">
                  {s.n}
                </div>
                <h3 className="font-semibold text-ilkal-maroon mt-2">{s.t}</h3>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-ilkal-cream/60 py-14 px-4 sm:px-6 border-y border-ilkal-gold/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon text-center">
            Made for big <span className="shimmer-text">moments & gestures</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: HeartHandshake, t: 'Wedding trousseau', d: 'Sarees for the bride, mother, sisters, aunts — one curated order, one discount.' },
              { icon: Users,          t: 'Family functions',  d: 'Coordinate the same weave or palette across the family for poojas and ceremonies.' },
              { icon: Gift,           t: 'Festive gifting',   d: 'Diwali, Sankranti or staff appreciation — gift authentic Ilkal sarees in volume.' },
              { icon: Sparkles,       t: 'Temple & seva',     d: 'Sarees for temple offerings, charitable distribution and community programmes.' },
              { icon: ShieldCheck,    t: 'Boutique re-sellers',d: 'Small boutique owners looking for genuine, hand-picked Ilkal pieces.' },
              { icon: Camera,         t: 'Event stylists',    d: 'Photo shoots and themed events — every piece backed by live, unedited photos.' }
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-3xl p-5 shadow-md border border-ilkal-gold/20 flex gap-4">
                <div className="w-12 h-12 rounded-2xl silk-gradient grid place-items-center shrink-0">
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-ilkal-maroon">{c.t}</h3>
                  <p className="text-sm opacity-80 mt-1 leading-relaxed">{c.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMS / WHAT'S INCLUDED */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-md border border-ilkal-gold/20 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-ilkal-maroon">What you get with every bulk order</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              `Flat ${pctLabel} discount on the entire order, applied automatically at checkout.`,
              `Minimum ${bulkMinQty} sarees in a single order — any mix of designs, colours and prices counts.`,
              'Free pan-India shipping — every order, every PIN code, no hidden charges.',
              'Personal call from the founder to confirm your selection before dispatch.',
              'Live, unedited photos and videos of every saree before it is packed.',
              'Never draped on a lady, never worn — each saree is unfolded only to record non-damage proof, then folded and wrapped fresh.',
              'Same honest no-returns policy — you approve every saree on screen, then it ships.'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="opacity-90">{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <Pill icon={Truck}        title="Free shipping"    sub="Pan-India, every PIN" />
            <Pill icon={PackageCheck} title="Never worn"       sub="Folded & wrapped fresh" />
            <Pill icon={PhoneCall}    title="Founder support"  sub="Call before dispatch" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/browse" className="btn-primary">
              Start Browsing Sarees <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-gold">
              <PhoneCall className="w-4 h-4" /> Talk to the founder
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppOrderCard />
    </div>
  );
}

function Pill({ icon: Icon, title, sub }) {
  return (
    <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl silk-gradient grid place-items-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="leading-tight">
        <div className="font-semibold text-ilkal-maroon text-sm">{title}</div>
        <div className="text-[11px] opacity-70">{sub}</div>
      </div>
    </div>
  );
}

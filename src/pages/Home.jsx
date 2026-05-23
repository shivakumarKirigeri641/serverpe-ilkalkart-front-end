import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Plane, HeartHandshake, Star, Quote, PhoneCall, BellRing, Camera, QrCode, Gift, AlertTriangle, PackageCheck } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';

const SEED_TESTIMONIALS = [
  { id: 's1', n: 'Lakshmi, Bengaluru', t: 'I wore the Tope Teni for my pooja and got compliments all day. The fabric feels like a hug from my ajji.',           rating: 5 },
  { id: 's2', n: 'Priya, Pune',        t: 'Shiva personally called to confirm the saree — that level of care is rare today. Will buy again!',                       rating: 5 },
  { id: 's3', n: 'Anitha, Hyderabad',  t: 'The Kasuti embroidery is unbelievable. Worth every rupee. Felt like a queen at my sister’s wedding.',                     rating: 5 }
];

export default function Home() {
  const { sarees, heroMedia, offers = [] } = useCatalog();
  const [slide, setSlide] = useState(0);
  const [testimonials, setTestimonials] = useState(SEED_TESTIMONIALS);

  useEffect(() => {
    if (heroMedia.length === 0) return;
    const t = setInterval(() => setSlide(s => (s + 1) % heroMedia.length), 4500);
    return () => clearInterval(t);
  }, [heroMedia.length]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ilkal_feedbacks')) || [];
      const mapped = saved.map(f => ({
        id: f.id, n: f.name, t: f.message, rating: f.rating, image: f.image
      }));
      const merged = [...mapped, ...SEED_TESTIMONIALS].slice(0, 6);
      setTestimonials(merged);
    } catch {}
  }, []);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] w-full">
        {heroMedia.map((m, i) => (
          <motion.div key={i}
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${m.src})` }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: slide === i ? 1 : 0, scale: slide === i ? 1 : 1.1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ilkal-deep/40 via-ilkal-maroon/30 to-ilkal-deep/80" />
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-12 sm:pb-0 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/30 text-xs tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-ilkal-gold" /> PURE • AUTHENTIC • GENUINE • ELEGANCE
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-tight">
                Drape a piece of <span className="shimmer-text">Karnataka’s soul</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg opacity-95 max-w-xl">
                Every Ilkal saree on this store is hand-picked in person from the looms of Ilkal village —
                six centuries of weaving tradition, delivered to your doorstep with love and trust.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/browse" className="btn-primary">
                  Start Browsing Sarees <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/about" className="btn-gold">Our Story</Link>
              </div>
              <p className="mt-4 font-script text-2xl text-ilkal-gold drop-shadow">{heroMedia[slide]?.caption}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur border border-ilkal-gold/40 text-[11px] sm:text-xs">
                <Camera className="w-3.5 h-3.5 text-ilkal-gold" />
                <span className="tracking-wide">Every photo & video is <b className="text-ilkal-gold">live footage</b> in natural daylight — no AI, no edits.</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* slide dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {heroMedia.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${slide === i ? 'w-8 bg-ilkal-gold' : 'w-3 bg-white/60'}`} />
          ))}
        </div>
      </section>

      {/* OFFERS STRIP */}
      {offers.length > 0 && (
        <section className="bg-gradient-to-r from-ilkal-maroon via-ilkal-deep to-ilkal-maroon text-ilkal-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap justify-center gap-3">
            {offers.map((o, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl border border-ilkal-gold/40 px-4 py-3 shadow w-full sm:w-[360px] lg:w-[380px]">
                <div className="w-12 h-12 rounded-full bg-ilkal-gold text-ilkal-deep grid place-items-center font-bold text-lg shadow">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-ilkal-gold truncate">{o.title}</span>
                    <span className="text-[11px] font-bold bg-ilkal-gold text-ilkal-deep rounded-full px-2 py-0.5 shrink-0">
                      {o.percent}% OFF
                    </span>
                  </div>
                  {o.description && (
                    <p className="text-xs opacity-90 line-clamp-2">{o.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pb-3 text-[11px] tracking-wide text-ilkal-gold/80">
            Applied automatically at checkout — no coupon code needed.
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="bg-white border-y border-ilkal-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: HeartHandshake, t: 'Hand-picked in person', s: 'I travel to Ilkal myself' },
            { icon: ShieldCheck, t: 'Verified authenticity', s: 'Scannable QR on every pack' },
            { icon: Plane, t: 'Free pan-India shipping', s: 'On every order, every PIN' },
            { icon: Camera, t: '100% AI-free photos', s: 'Mobile-only, natural light, zero edits' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full silk-gradient grid place-items-center shadow-lg">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-ilkal-maroon text-sm">{f.t}</div>
              <div className="text-xs opacity-70">{f.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY ILKAL — emotional */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-serif text-3xl sm:text-5xl text-ilkal-maroon">
            Where every thread <span className="shimmer-text">whispers a story</span>
          </motion.h2>
          <p className="mt-4 max-w-2xl mx-auto opacity-80">
            The Ilkal saree isn’t just fabric — it’s the song of a weaver’s wife humming at dawn,
            the prayer of a mother folding it for her daughter’s wedding, the warmth of grandmother’s
            embrace. Drape it, and you drape generations of love.
          </p>
        </div>

        <div className="mt-10 max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          {[
            { src: sarees[0]?.photos.palluFar  || sarees[0]?.images[0], title: 'Tope Teni Pallu',     desc: 'The signature three-band pallu — Ilkal’s identity worldwide.' },
            { src: sarees[6]?.photos.blouseFar || sarees[6]?.images[0], title: 'Kasuti Embroidery',   desc: 'Tiny hand-stitched motifs by Karnataka’s women — pure art.' },
            { src: sarees[3]?.photos.borderFar || sarees[3]?.images[0], title: 'Chikki Paras Border', desc: 'Gold-zari borders that catch every candle’s glow.' }
          ].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-3xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition group">
              <div className="aspect-[4/5] overflow-hidden bg-ilkal-cream">
                <img src={c.src}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl text-ilkal-maroon">{c.title}</h3>
                <p className="text-sm opacity-80 mt-1">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — no signup required */}
      <section className="py-14 px-4 sm:px-6 bg-white border-y border-ilkal-gold/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold tracking-widest border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5" /> NO SIGNUP • NO LOGIN • NO ACCOUNTS
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-ilkal-maroon">
              Five quiet steps from <span className="shimmer-text">browsing to your doorstep</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto opacity-80 text-sm sm:text-base">
              You don’t need to create an account, remember a password, or share any extra detail.
              Browse, place your order, and I take it from there.
            </p>
          </div>

          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { n: '1', t: 'Browse',    d: 'Open the catalogue and find the saree that speaks to you.' },
              { n: '2', t: 'Checkout',  d: 'Add to bag and continue — no login screen, ever.' },
              { n: '3', t: 'Fill details', d: 'Share only your name, mobile and delivery address.' },
              { n: '4', t: 'Pay securely', d: 'Complete payment through a trusted gateway.' },
              { n: '5', t: 'Dispatch & deliver', d: 'I hand-pack your saree and ship it to your door.' }
            ].map((s, i) => (
              <motion.li key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-ilkal-cream/60 rounded-2xl p-4 border border-ilkal-gold/20 relative">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full silk-gradient text-white font-bold grid place-items-center shadow-lg">
                  {s.n}
                </div>
                <h3 className="font-semibold text-ilkal-maroon mt-2">{s.t}</h3>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">{s.d}</p>
              </motion.li>
            ))}
          </ol>

          <p className="mt-6 text-center text-xs sm:text-sm opacity-80">
            Login is <b>completely optional</b> — required only if you’d like access to
            your <b>dashboard</b>, <b>purchase history</b>, <b>profile updates</b> and more.
          </p>
        </div>
      </section>

      {/* OUR PROMISE — trust grid */}
      <section className="py-16 px-4 sm:px-6 bg-ilkal-cream/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ilkal-maroon/10 text-ilkal-maroon text-xs font-semibold tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> WHY WOMEN CHOOSE ILKAL KART
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-ilkal-maroon">
              Seven promises, <span className="shimmer-text">one founder</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto opacity-80 text-sm sm:text-base">
              Ilkal Kart isn’t a marketplace — it’s a personal commitment. Every saree passes through my own hands
              before it reaches yours. Here is exactly what you can expect.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Plane,         t: 'Hand-picked in Ilkal',           d: 'I personally travel to Ilkal, walk into weavers’ homes and select each saree on the loom. Safety, security and delicate care begin at the source.' },
              { icon: PhoneCall,     t: 'No call centre — only me',       d: 'No scripted agents, no ticket queues. Speak directly with the founder for every question, before and after your purchase.' },
              { icon: BellRing,      t: 'Proactive live updates',         d: 'You will never have to chase a tracking link. I personally share each milestone — packed, dispatched, in-transit, delivered.' },
              { icon: Camera,        t: 'Real photos & videos — zero AI', d: 'Every photo and video is captured by me on my mobile phone in natural daylight. No AI generation, no editing, no filters, no DSLR depth-of-field, no colour grading — what you see on screen is exactly what arrives at your doorstep.' },
              { icon: QrCode,        t: 'Scannable authenticity code',    d: 'Every premium pack carries a unique QR code. Scan it at delivery to verify the saree is a genuine, hand-picked Ilkal piece.' },
              { icon: Gift,          t: 'A heartfelt unboxing',           d: 'Thank-you card, wrap proof, saree-care guide and the live photo & video taken the moment your saree was packed — every detail is intentional.' },
              { icon: PackageCheck,  t: 'Never draped, never worn',       d: 'I never photograph a saree draped on a lady or any doll. Your saree reaches you freshly folded and properly wrapped — it is unfolded only to record clear proof of its non-damaged condition, and is never worn by anyone before you.' }
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-3xl p-5 shadow-md hover:shadow-xl border border-ilkal-gold/20 transition flex gap-4">
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

          {/* Honest no-return note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-6 rounded-3xl bg-ilkal-deep text-ilkal-cream p-5 sm:p-6 flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-ilkal-gold/20 grid place-items-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-ilkal-gold" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ilkal-gold">A clear, honest no-return policy</h3>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">
                Because every saree leaves my hands with complete photo and video proof of its clean, pristine
                condition, we don’t offer returns or replacements. You buy with full confidence — exactly what
                you approve on screen is what arrives at your doorstep. No saree is ever draped on a lady for
                photos and none is ever worn before it reaches you — it is unfolded only to record the
                non-damage proof, then folded and wrapped fresh.
              </p>
              <Link to="/about" className="inline-flex items-center gap-1 mt-3 text-ilkal-gold font-semibold text-sm hover:underline">
                Read the full story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-gradient-to-b from-white to-ilkal-cream py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon">Loved by women</h2>
              <p className="opacity-70 text-sm">Our most cherished picks this season</p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full px-2.5 py-1">
                <Camera className="w-3 h-3" /> Live footage • Natural daylight • Zero edits
              </span>
            </div>
            <Link to="/browse" className="hidden sm:inline-flex items-center gap-1 text-ilkal-maroon font-semibold">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
            {sarees.slice(0, 6).map(s => (
              <Link key={s.id} to="/browse" className="snap-start shrink-0 w-60 sm:w-72 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ilkal-maroon">{s.name}</h3>
                    <span className="flex items-center gap-0.5 text-xs"><Star className="w-3.5 h-3.5 fill-ilkal-gold text-ilkal-gold" />{s.rating}</span>
                  </div>
                  <p className="text-xs opacity-70">{s.color}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-ilkal-maroon">₹{s.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs line-through opacity-50">₹{s.mrp.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO / IMMERSIVE */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 silk-gradient opacity-95" />
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: sarees[0] ? `url(${sarees[0].images[0]})` : 'none' }} />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <Quote className="w-10 h-10 mx-auto text-ilkal-gold animate-float" />
          <p className="mt-4 font-serif text-2xl sm:text-3xl leading-relaxed">
            “When I unwrap an Ilkal saree, I don’t just see colour — I see the weaver’s rough hands,
            her patient smile, her prayer for the woman who will one day wear it.”
          </p>
          <p className="mt-4 font-script text-3xl text-ilkal-gold">— Shivakumar Kirigeri, Founder, Ilkal Kart</p>
          <div className="mt-8">
            <Link to="/about" className="btn-gold">Read my journey</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <h2 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon">What our beauties say?</h2>
            <Link to="/feedback" className="text-ilkal-maroon font-semibold text-sm inline-flex items-center gap-1">
              Share yours <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((r, i) => (
              <motion.div key={r.id || i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-ilkal-gold/20">
                <div className="flex gap-1 text-ilkal-gold">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={`w-4 h-4 ${k < (r.rating || 5) ? 'fill-ilkal-gold' : 'text-ilkal-gold/30'}`} />
                  ))}
                </div>
                {r.image && (
                  <img src={r.image} alt={r.n} className="mt-3 rounded-2xl object-cover w-full max-h-48 border border-ilkal-gold/20" />
                )}
                <p className="mt-3 text-sm leading-relaxed opacity-90">“{r.t}”</p>
                <p className="mt-3 font-semibold text-ilkal-maroon text-sm">{r.n}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 silk-gradient" />
        <div className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: sarees[1] ? `url(${sarees[1].images[0]})` : 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center text-white">
          <Sparkles className="w-10 h-10 mx-auto text-ilkal-gold" />
          <h2 className="mt-4 font-serif text-3xl sm:text-5xl leading-tight">
            Your next favourite saree <span className="shimmer-text">is waiting on a loom in Ilkal</span>
          </h2>
          <p className="mt-4 opacity-95">
            Browse the full collection — each piece hand-picked, hand-photographed and hand-packed by me.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/browse" className="btn-primary text-base px-6 py-3">
              Start Browsing Sarees <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/about" className="btn-gold">Read my journey</Link>
          </div>
          <p className="mt-6 text-xs sm:text-sm opacity-90">
            Built & maintained on my own parent platform — <b className="text-ilkal-gold">ServerPe App Solutions</b>.
            One founder. One accountability. One promise.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

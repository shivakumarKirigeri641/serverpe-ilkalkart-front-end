import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plane, Sparkles, PhoneCall, BellRing, Camera, QrCode, Gift,
  AlertTriangle, Code2, ArrowRight, ArrowUpRight,
  Heart, Eye, Lightbulb, Compass, PackageCheck,
} from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';

const HERO_IMG =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80';

const STATS = [
  { k: '14+', v: 'years in engineering' },
  { k: '800', v: 'years of Ilkal weaving' },
  { k: '1', v: 'founder, end-to-end' },
];

const STORY = [
  {
    icon: Heart, kicker: 'The wedding',
    body: (
      <>The story of Ilkal Kart begins with a simple wedding invitation. My wife and I travelled to
      <b className="text-stone-900"> Ilkal</b> for the celebration, and — since the town is renowned the world over for its
      handwoven sarees — we stopped by one of its most respected wholesale houses to browse.</>
    ),
  },
  {
    icon: Eye, kicker: 'The moment',
    body: (
      <>I’ll be honest: sarees were never a subject I paid much attention to. My wife was the enthusiast.
      But the moment I saw those sarees up close — the depth of the colours, the precision of the borders,
      the patience woven into every Tope Teni pallu — something shifted.</>
    ),
    quote: 'This craft is far too beautiful to remain locked inside a single town.',
  },
  {
    icon: Lightbulb, kicker: 'The question',
    body: (
      <>That visit planted a question I couldn’t put down: <b className="text-stone-900">why not build a platform that carries
      these beautiful sarees to the equally beautiful women who would treasure them?</b> Ilkal Kart is the
      answer to that question.</>
    ),
  },
  {
    icon: Compass, kicker: 'The pivot',
    body: (
      <>By training, I’m a software engineer with over <b className="text-stone-900">14 years</b> in the IT industry. I’ve since
      stepped away from that career to pursue something far more personal — building this brand from the
      ground up, on the same foundations of trust, discipline and craftsmanship.</>
    ),
  },
  {
    icon: PackageCheck, kicker: 'Today', last: true,
    body: (
      <>I run Ilkal Kart end-to-end: I visit the looms in person, hand-pick every saree, photograph it,
      pack it, and ship it to you myself. No middlemen. No inflated markups. Just the saree, the weaver,
      and you — connected directly.</>
    ),
  },
];

// variant: 'dark' (hero, spans 2 cols), 'wood' (accent feature), 'plain' (white).
// span: tailwind column-span classes for the lg bento grid.
const COMMITMENTS = [
  { icon: Plane,         variant: 'dark',  span: 'lg:col-span-2',                 t: 'Hand-picked in person, in Ilkal', d: 'I travel to Ilkal in Bagalkot district, walk into weavers’ homes, inspect each weave on the loom, and select every saree by hand. The delicate care these sarees deserve begins with the very first touch.' },
  { icon: PhoneCall,     variant: 'plain', span: '',                              t: 'Speak directly with me — no call centre', d: 'No helpline, no scripted agent, no ticket queue. Because I run Ilkal Kart single-handedly, every call, message and concern reaches me directly. You will always be heard by the founder.' },
  { icon: BellRing,      variant: 'plain', span: '',                              t: 'Proactive live updates — no chasing', d: 'You never refresh a tracking page wondering where your saree is. From dispatch to doorstep, I push live updates myself — less like an online order, more like a friend bringing you a gift.' },
  { icon: Camera,        variant: 'wood',  span: 'lg:col-span-2',                 t: 'Real photos & videos — zero AI, zero edits', d: 'Every saree is captured by me, on my phone, in natural daylight. No AI imagery, no editing, no filters, no studio lighting, no colour grading. What you see on screen is exactly what arrives.' },
  { icon: QrCode,        variant: 'plain', span: '',                              t: 'Premium packing with scannable code', d: 'Each saree is sealed in a premium pack carrying a unique QR code. Scan it on delivery to instantly verify it’s a genuine, hand-picked Ilkal piece — your built-in proof of purity.' },
  { icon: Gift,          variant: 'plain', span: '',                              t: 'A heartfelt unboxing — not just a parcel', d: 'Inside: a personal thank-you card, a documented wrap proof, a saree-care guide, and the live photo & video I captured the moment your saree was packed. Every detail is meant to feel like the gift it is.' },
  { icon: AlertTriangle, variant: 'plain', span: 'sm:col-span-2 lg:col-span-3',  t: 'A clear, honest no-return policy', d: 'There are no returns or replacements — and that’s by design. Because I provide complete photo and video proof of condition before dispatch, what reaches you is exactly what you approved: clean, untouched, verified.' },
];

export default function About() {
  return (
    <div className="bg-stone-50 overflow-hidden">
      {/* ============================================================
          HERO — editorial masthead with image + material badges
         ============================================================ */}
      <section className="relative pt-16 sm:pt-24 pb-14 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-stone-100 ring-1 ring-stone-200 grid place-items-center overflow-hidden shrink-0">
                <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain mix-blend-multiply" />
              </span>
              <span className="eyebrow">The story</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="mt-6 font-display font-extrabold tracking-display text-5xl sm:text-7xl text-stone-900 leading-[0.9]">
              From a wedding in Ilkal — to your wardrobe.
            </motion.h1>
            <p className="mt-6 max-w-xl text-lg text-stone-500 leading-relaxed">
              An engineer’s second innings, devoted to carrying authentic Ilkal sarees to discerning
              women across India — hand-picked, hand-shot, hand-packed.
            </p>
          </div>

          {/* hero image with floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative mt-12">
            <div className="aspect-[21/9] rounded-4xl overflow-hidden bg-stone-200 ring-1 ring-stone-200">
              <img src={HERO_IMG} alt="Ilkal weaving" className="w-full h-full object-cover" />
            </div>
            <div className="material-badge absolute left-5 bottom-5 sm:left-8 sm:bottom-8 max-w-[14rem]">
              <span className="label">Origin</span>
              <span className="value">Ilkal, Bagalkot · Karnataka</span>
            </div>
            <div className="material-badge absolute right-5 top-5 sm:right-8 sm:top-8 hidden sm:block">
              <span className="label">Run by</span>
              <span className="value">One founder, end-to-end</span>
            </div>
          </motion.div>

          {/* stat strip */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.v} className="rounded-4xl bg-white border border-stone-200 shadow-card p-5 text-center sm:text-left">
                <div className="font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900 leading-none">{s.k}</div>
                <div className="mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          STORY — editorial split with sticky label + drop-cap prose
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8 border-y border-stone-200 bg-stone-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[18rem_1fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24 h-fit">
            <span className="eyebrow">In his words</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900 leading-[0.95]">
              Namaskara, I’m Shivakumar. 🙏
            </h2>
            <p className="mt-4 text-sm text-stone-500 leading-relaxed">
              Software engineer turned saree custodian — building this brand the way I built systems: on trust,
              discipline and craft.
            </p>
          </div>

          {/* journey timeline — story told as connected chapters */}
          <ol className="relative max-w-2xl">
            {/* the rail */}
            <span className="absolute left-6 top-3 bottom-3 w-0.5 bg-stone-300" aria-hidden />
            {STORY.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.li key={i}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="relative pl-20 pb-10 last:pb-0">
                  {/* marker */}
                  <span className={`absolute left-0 top-0 grid place-items-center w-12 h-12 rounded-full ring-4 ring-stone-100 ${
                    s.last ? 'bg-wood text-stone-900' : 'bg-stone-900 text-stone-50'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Chapter {String(i + 1).padStart(2, '0')} · {s.kicker}
                  </span>
                  <p className="mt-2 text-stone-600 leading-relaxed">{s.body}</p>
                  {s.quote && (
                    <p className="mt-4 font-display font-extrabold tracking-display text-2xl sm:text-3xl text-stone-900 leading-[1.1] border-l-2 border-wood pl-5">
                      “{s.quote}”
                    </p>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============================================================
          SEVEN COMMITMENTS — numbered editorial grid
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Why women trust us</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-900 leading-[0.95]">
              Seven personal commitments.
            </h2>
            <p className="mt-4 text-stone-500 text-lg">
              The reasons hundreds of ladies place their saree purchase in my hands — not a faceless marketplace.
            </p>
          </div>

          {/* bento mosaic — varied tile sizes & treatments, no two alike */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
            {COMMITMENTS.map((c, i) => {
              const Icon = c.icon;
              const n = String(i + 1).padStart(2, '0');

              // shared classes by variant
              const base = 'group relative rounded-4xl p-7 sm:p-8 overflow-hidden transition-all duration-300 ease-showroom';
              if (c.variant === 'dark') {
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.5 }}
                    className={`${base} ${c.span} bg-stone-900 text-stone-50 flex flex-col justify-between min-h-[15rem]`}>
                    <Icon className="absolute -bottom-5 -right-3 w-40 h-40 text-white/[0.04] pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <span className="grid place-items-center w-12 h-12 rounded-2xl bg-wood text-stone-900">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="font-display font-extrabold tracking-display text-3xl text-white/15 tabular-nums">{n}</span>
                    </div>
                    <div className="relative mt-6">
                      <h3 className="font-display font-extrabold tracking-display text-2xl sm:text-3xl text-stone-50 leading-[0.95] max-w-md">{c.t}</h3>
                      <p className="mt-3 text-stone-400 leading-relaxed max-w-lg">{c.d}</p>
                    </div>
                  </motion.div>
                );
              }
              if (c.variant === 'wood') {
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.5 }}
                    className={`${base} ${c.span} bg-wood text-stone-900 flex flex-col sm:flex-row sm:items-center gap-6`}>
                    <span className="grid place-items-center w-16 h-16 rounded-3xl bg-stone-900/10 ring-1 ring-stone-900/10 shrink-0">
                      <Icon className="w-7 h-7" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-900/50">No. {n}</span>
                      <h3 className="mt-1 font-display font-extrabold tracking-display text-2xl text-stone-900 leading-tight">{c.t}</h3>
                      <p className="mt-2 text-sm text-stone-900/75 leading-relaxed max-w-xl">{c.d}</p>
                    </div>
                  </motion.div>
                );
              }
              const wide = c.span.includes('col-span-3');
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.5 }}
                  className={`${base} ${c.span} bg-white border-2 border-transparent hover:border-stone-300 shadow-card hover:shadow-card-hover ${wide ? 'flex flex-col sm:flex-row sm:items-center gap-5' : ''}`}>
                  <span className="absolute top-6 right-7 font-display font-extrabold tracking-display text-2xl text-stone-200 tabular-nums">{n}</span>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 shrink-0 transition-colors group-hover:bg-wood group-hover:text-stone-900">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className={wide ? '' : 'mt-5'}>
                    <h3 className="font-display font-bold tracking-display text-lg text-stone-900 leading-tight max-w-[16rem]">{c.t}</h3>
                    <p className="mt-2 text-sm text-stone-500 leading-relaxed max-w-2xl">{c.d}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          ILKAL — immersive photographic band with overlaid 800y stat
         ============================================================ */}
      <section className="px-5 sm:px-8">
        <div className="relative max-w-6xl mx-auto rounded-4xl overflow-hidden shadow-card-hover min-h-[26rem] flex items-end">
          <img src={HERO_IMG} alt="Ilkal town & looms" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-stone-900/20" />

          {/* big overlaid stat, top-right */}
          <div className="absolute top-8 right-8 text-right">
            <div className="font-display font-extrabold tracking-display text-7xl sm:text-8xl text-stone-50 leading-none drop-shadow">800</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-300">years on the loom</div>
          </div>

          <div className="relative p-8 sm:p-11 text-stone-50">
            <span className="eyebrow !text-stone-300 before:!bg-wood">Where it all begins</span>
            <h3 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-50 leading-[0.92]">
              Ilkal, Karnataka.
            </h3>
            <p className="mt-4 max-w-xl text-stone-300 leading-relaxed">
              A small town in Bagalkot district that has been weaving sarees for over eight centuries. Every
              saree you buy here keeps a family’s loom running for another month.
            </p>
            {/* signature elements as chips — broken out of the paragraph */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                ['Tope Teni', 'the pallu'],
                ['Kasuti', 'the motifs'],
                ['Chikki Paras', 'the border'],
              ].map(([name, role]) => (
                <span key={name} className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15">
                  <b className="font-display font-bold tracking-display text-sm text-stone-50">{name}</b>
                  <span className="text-[11px] text-stone-400">{role}</span>
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-stone-400 italic">They aren’t designs — they’re identity.</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SERVERPE — "two hands meet": craft × code = one owner
         ============================================================ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">The technology behind the weave</span>
            <h3 className="mt-4 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900 leading-[0.95]">
              Proudly powered by <span className="text-wood-dark">ServerPe App Solutions</span>.
            </h3>
          </div>

          {/* two-hands diagram */}
          <div className="mt-10 grid lg:grid-cols-[1fr_auto_1fr] gap-5 lg:items-stretch">
            <div className="rounded-4xl bg-white border border-stone-200 shadow-card p-7 sm:p-8">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-stone-100 text-wood-dark">
                <Plane className="w-5 h-5" />
              </span>
              <h4 className="mt-5 font-display font-bold tracking-display text-lg text-stone-900">The saree, hand-picked</h4>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Chosen on the loom in Ilkal, photographed in daylight, packed by hand.
              </p>
            </div>

            {/* center seal */}
            <div className="grid place-items-center">
              <div className="grid place-items-center w-16 h-16 rounded-full bg-stone-900 text-wood font-display font-extrabold text-2xl shadow-card">
                ×
              </div>
            </div>

            <div className="rounded-4xl bg-stone-900 text-stone-50 shadow-card p-7 sm:p-8">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/5 ring-1 ring-white/10 text-wood">
                <Code2 className="w-5 h-5" />
              </span>
              <h4 className="mt-5 font-display font-bold tracking-display text-lg text-stone-50">The platform, hand-built</h4>
              <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                Storefront, order flow, live updates, security & uptime — engineered on ServerPe across 14+ years of IT discipline.
              </p>
            </div>
          </div>

          {/* one-owner conclusion bar */}
          <div className="mt-5 rounded-4xl bg-wood text-stone-900 px-7 sm:px-9 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <Sparkles className="w-6 h-6 shrink-0" />
            <p className="font-display font-bold tracking-display text-lg sm:text-xl leading-tight">
              The saree and the platform are built by the same person.
              <span className="text-stone-900/60"> One owner, one accountability, one promise.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SIGN-OFF — founder signature card
         ============================================================ */}
      <section className="pb-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto rounded-4xl bg-stone-100 border border-stone-200 p-10 sm:p-14 text-center">
          <span className="text-sm text-stone-400 tracking-wide">With love and care,</span>
          <p className="mt-3 font-display font-extrabold tracking-display text-4xl sm:text-6xl text-stone-900 leading-none">
            Shivakumar Kirigeri
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <span className="h-px w-8 bg-stone-300" /> Founder, Ilkal Kart <span className="h-px w-8 bg-stone-300" />
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link to="/browse" className="btn-primary">
              Start browsing sarees <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-gold">
              Talk to me <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

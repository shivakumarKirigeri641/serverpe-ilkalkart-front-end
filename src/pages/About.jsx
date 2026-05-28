import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Plane, Sparkles, PhoneCall, BellRing, Camera, QrCode, Gift, AlertTriangle, Code2 } from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';
import ScamWarning from '../components/ScamWarning.jsx';

export default function About() {
  return (
    <div>
      {/* Banner */}
      <section className="relative h-72 sm:h-96">
        <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"
          className="absolute inset-0 w-full h-full object-cover" alt="Ilkal weaving" />
        <div className="absolute inset-0 bg-gradient-to-b from-ilkal-deep/40 to-ilkal-deep/80" />
        <div className="relative h-full grid place-items-center text-center text-white px-4">
          <div>
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-2xl ring-2 ring-ilkal-gold/60 overflow-hidden">
              <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain p-1.5" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl">From a wedding in Ilkal — to your wardrobe</h1>
            <p className="mt-2 opacity-90 max-w-xl mx-auto">An engineer’s second innings, devoted to bringing authentic Ilkal sarees to discerning women across India.</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl text-ilkal-maroon">Namaskara, I’m Shivakumar Kirigeri 🙏</h2>
          <p className="mt-4 leading-relaxed opacity-90">
            The story of Ilkal Kart begins with a simple wedding invitation. My wife and I travelled to
            <b> Ilkal</b> for the celebration, and — since the town is renowned the world over for its handwoven
            sarees — we stopped by one of its most respected wholesale houses to browse.
          </p>
          <p className="mt-3 leading-relaxed opacity-90">
            I’ll be honest: sarees were never a subject I paid much attention to. My wife was the enthusiast.
            But the moment I walked in and saw those sarees up close — the depth of the colours, the precision
            of the borders, the patience woven into every Tope Teni pallu — something shifted. I stood there
            quietly, thinking: <i>this craft is far too beautiful to remain locked inside a single town.</i>
          </p>
          <p className="mt-3 leading-relaxed opacity-90">
            That visit planted a question I couldn’t put down: <b>why not build a platform that carries these
            beautiful sarees to the equally beautiful women who would treasure them?</b> Ilkal Kart is the
            answer to that question.
          </p>
          <p className="mt-3 leading-relaxed opacity-90">
            By training, I’m a software engineer with over <b>14 years</b> of experience in IT industry. I’ve since stepped away from that career to pursue something far more
            personal — building this brand from the ground up, on the same foundations of trust, discipline,
            and craftsmanship that defined my engineering practice.
          </p>
          <p className="mt-3 leading-relaxed opacity-90">
            Today I run Ilkal Kart end-to-end: I visit the looms in person, hand-pick every saree, photograph
            it, pack it, and ship it to you myself. No middlemen. No inflated markups. Just the saree, the
            weaver, and you — connected directly.
          </p>
        </motion.div>

        {/* Why women trust Ilkal Kart */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl text-ilkal-maroon">Why women trust Ilkal Kart</h2>
            <p className="text-sm opacity-75 mt-1 max-w-2xl mx-auto">
              Seven personal commitments — the reasons hundreds of ladies have chosen to place their saree purchase
              in my hands rather than the hands of a faceless marketplace.
            </p>
          </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Plane, t: 'Hand-picked in person, in Ilkal', d: 'I personally travel to Ilkal in Bagalkot district, walk into weavers’ homes, inspect each weave on the loom, and select every saree by hand. Safety, security and the delicate care these sarees deserve are non-negotiable — and that begins with the very first touch.' },
            { icon: PhoneCall, t: 'Speak directly with me — no call centre', d: 'There is no customer-care helpline, no scripted agent, no ticket queue. Because I run Ilkal Kart single-handedly, every call, message and concern reaches me directly. You will always be heard by the founder.' },
            { icon: BellRing, t: 'Proactive live updates — no chasing', d: 'You will never need to refresh a tracking page or wonder where your saree is. From dispatch to doorstep, I push live updates to you myself, so the experience feels less like an online order and more like a friend bringing you a gift.' },
            { icon: Camera, t: 'Real photos & videos — zero AI, zero edits', d: 'Every saree on this platform is captured by me, on my mobile phone, in natural daylight. No AI-generated imagery, no editing, no filters, no studio lighting, no DSLR depth-of-field, no colour grading. What you see on screen is exactly what arrives at your doorstep.' },
            { icon: QrCode, t: 'Premium packing with scannable authenticity code', d: 'Each saree is sealed inside a premium pack carrying a unique QR code. Scan it on delivery to instantly verify that the saree is a genuine, hand-picked Ilkal piece — your built-in proof of purity.' },
            { icon: Gift, t: 'A heartfelt unboxing — not just a parcel', d: 'Inside the box you’ll find a personal thank-you card, a documented wrap proof, a saree-care guide, and the live photo and video I captured the moment your saree was packed. Every detail is meant to feel like the gift it is.' },
            { icon: AlertTriangle, t: 'A clear, honest no-return/replace policy', d: 'In keeping with the transparency you deserve: there are no returns or replacements. Because I provide complete photographic and video proof of the saree’s condition before dispatch, what reaches you is exactly what you approved — clean, untouched and verified.' }
          ].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-5 shadow-md border border-ilkal-gold/20 flex gap-4">
              <div className="w-12 h-12 rounded-2xl silk-gradient grid place-items-center shrink-0">
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-ilkal-maroon">{c.t}</h3>
                <p className="text-sm opacity-80 mt-1">{c.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
        </div>

        {/* Location card */}
        <div className="mt-10 rounded-3xl overflow-hidden shadow-xl silk-gradient text-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 text-ilkal-gold shrink-0" />
            <div>
              <h3 className="font-serif text-2xl">Where it all begins — Ilkal</h3>
              <p className="opacity-95 mt-2 leading-relaxed">
                A small town in Bagalkot district, Karnataka, that has been weaving sarees for over <b>800 years</b>.
                The unique Tope Teni pallu, the kasuti motifs, the chikki paras border — they’re not designs. They’re identity.
                Every saree you buy here keeps a family’s loom running for another month.
              </p>
            </div>
          </div>
        </div>

        {/* ServerPe parent platform */}
        <div className="mt-10 rounded-3xl bg-white border border-ilkal-gold/30 shadow-md p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl silk-gradient grid place-items-center shrink-0 shadow-lg">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ilkal-maroon/10 text-ilkal-maroon text-[10px] font-semibold tracking-widest">
                <Sparkles className="w-3 h-3 text-ilkal-gold" /> THE TECHNOLOGY BEHIND THE WEAVE
              </span>
              <h3 className="mt-2 font-serif text-2xl text-ilkal-maroon">
                Proudly powered by <span className="text-ilkal-gold">ServerPe App Solutions</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Ilkal Kart is hosted, designed and engineered on <b>ServerPe App Solutions</b> — my own
                parent technology platform that takes carefully chosen projects from idea to
                production-grade product. The same engineering discipline I built across 14+ years in
                IT now serves Ilkal Kart end-to-end: the storefront, the order flow, the live updates,
                the security and the uptime are all maintained by me through ServerPe.
              </p>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                In short — the saree is hand-picked from Ilkal, and the platform that delivers it to you
                is hand-built by the same person. <b>One owner, one accountability, one promise.</b>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="font-script text-3xl text-ilkal-maroon">With love and care,</p>
          <p className="font-serif text-2xl text-ilkal-maroon flex items-center justify-center gap-2">
            Shivakumar Kirigeri <Sparkles className="w-5 h-5 text-ilkal-gold" />
          </p>
          <Link to="/browse" className="btn-primary mt-6 inline-flex">Start Browsing Sarees</Link>
        </div>
      </section>

      <ScamWarning />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const SCAM_PATTERNS = [
  {
    t: 'AI-generated &amp; over-edited photos',
    d: "If colours look unnaturally vivid, the model's hand has 6 fingers, or every saree photo looks identical-perfect — it's AI or heavily edited. Real Ilkal has texture, slight folds, and natural light shadows.",
    bad: 'Studio lighting · DSLR bokeh · &quot;showroom&quot; sets',
    good: 'Mobile shots in daylight · visible weave · zero filters',
  },
  {
    t: 'Power-loom copies sold as &quot;handloom&quot;',
    d: "A genuine Ilkal handloom takes 4–7 days to weave. A power-loom copy costs a fifth and is finished in hours. Most ₹999 &quot;Ilkal&quot; sarees online are power-loom polyester-cotton blends.",
    bad: 'Suspiciously cheap · perfect symmetric border · plastic feel',
    good: 'Subtle weave variations · soft cotton · honest pricing',
  },
  {
    t: 'Fake QR &amp; brand-name lifting',
    d: "Sellers paste a meaningless QR sticker or steal &quot;Ilkal Kart&quot; in their handle. Always scan the QR — only ours verifies on this website. Always check the website URL: it must be ours.",
    bad: 'QR that opens random links · look-alike Instagram handles',
    good: 'QR opens /verify on this site · single founder, one number',
  },
  {
    t: 'Instagram-only sellers, no records',
    d: "&quot;DM to buy&quot;, GPay-only, no invoice, no order ID, no GST, no return address. If something goes wrong, you have zero recourse. Genuine Ilkal Kart issues a tax invoice and an order ID for every purchase.",
    bad: 'No invoice · UPI to personal name · ghost after delivery',
    good: 'Order ID · GST invoice · founder personally on WhatsApp',
  },
  {
    t: 'Drape-and-discard scams',
    d: 'Some sellers photograph a saree draped on a model, then resell that same draped saree to a buyer as &quot;new&quot;. Worn, creased, sometimes even washed. Never accept a saree photographed while worn.',
    bad: 'Saree draped on a model in product photo',
    good: 'I never drape a saree on anyone — folded photos only',
  },
  {
    t: 'Photoshopped customer reviews',
    d: "Fake review screenshots, stolen testimonial photos, identical 5-star ratings from suspiciously similar accounts. Look for real, recent feedback with photos &mdash; like the ones on our Feedback page.",
    bad: 'Reviews with no dates · stock-photo customers',
    good: 'Live customer photos &amp; videos · real names · dates',
  },
  {
    t: 'Spoofed SMS &amp; OTP traps',
    d: "Scammers love mimicking brand names with SMS headers like &quot;ILKAL&quot;, &quot;IKART&quot; or &quot;ILKLKT&quot; to steal OTPs. Our legitimate SMS always lands with the official sender header — anything else, no matter how convincing the wording is, is a phishing attempt.",
    bad: 'OTP from &quot;ILKAL&quot;, &quot;IKART&quot;, random numbers · &quot;share OTP&quot; calls',
    good: 'SMS only from the <b>*-SRVRPE-*</b> sender header · OTP never asked over a call',
  },
  {
    t: 'Stolen photos passed off as their own',
    d: "Some sellers screenshot our live saree photos and re-post them as their own stock. Every photo &amp; every video that leaves our site carries an &quot;ilkalkart&quot; watermark and a capture-timestamp baked in — if you see our saree elsewhere without those marks, it&apos;s not us.",
    bad: 'Cropped photos · no watermark · no timestamp',
    good: 'Visible <b>ilkalkart</b> watermark · live capture timestamp on every frame',
  },
];

export default function ScamWarning({ compact = false }) {
  return (
    <section className={`px-4 sm:px-6 ${compact ? 'py-8' : 'py-10 sm:py-14'} bg-gradient-to-b from-red-50 via-white to-ilkal-cream`}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white border-2 border-red-200 shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-5 sm:px-6 py-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xl sm:text-2xl">Beware of Ilkal Saree Scams</h2>
              <p className="text-[11px] sm:text-xs opacity-95">
                A sister-to-sister warning from your founder
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-sm sm:text-[15px] leading-relaxed text-ilkal-deep">
              The Ilkal saree&apos;s fame has brought a sad reality with it —{' '}
              <b className="text-red-700">power-loom copies, polyester replicas and AI-edited photos</b>{' '}
              are flooding social media. Many sisters have paid for &quot;genuine Ilkal&quot; sarees only
              to receive a shiny machine-made imitation, or worse, never receive anything at all.
              Here&apos;s how to spot — and avoid — every common trap.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {SCAM_PATTERNS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-red-100 bg-white p-4 hover:shadow-md transition"
                >
                  <h3
                    className="font-semibold text-red-800 text-sm sm:text-[15px] flex items-start gap-2"
                    dangerouslySetInnerHTML={{ __html: `<span>🚩</span><span>${s.t}</span>` }}
                  />
                  <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">{s.d}</p>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px]">
                    <div
                      className="rounded-lg bg-red-50 border border-red-100 px-2 py-1 text-red-900"
                      dangerouslySetInnerHTML={{ __html: `<b>Red flag:</b> ${s.bad}` }}
                    />
                    <div
                      className="rounded-lg bg-green-50 border border-green-100 px-2 py-1 text-green-900"
                      dangerouslySetInnerHTML={{ __html: `<b>Safe sign:</b> ${s.good}` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-white to-green-50 p-4 sm:p-5">
              <h3 className="font-serif text-base sm:text-lg text-green-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-700" />
                The 3 safety signals — memorise these
              </h3>
              <ul className="mt-3 grid sm:grid-cols-3 gap-2.5 text-[12px] sm:text-[13px] text-green-950">
                <li className="rounded-xl bg-white border border-green-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-green-700">1 · SMS sender ID</div>
                  <p className="mt-1 leading-relaxed">
                    Every OTP &amp; transactional SMS arrives <b>only</b> from the header
                    <span className="font-mono mx-1 px-1.5 py-0.5 rounded bg-green-100 border border-green-200">*-SRVRPE-*</span>.
                    Anything else &mdash; ignore it.
                  </p>
                </li>
                <li className="rounded-xl bg-white border border-green-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-green-700">2 · Photo watermark</div>
                  <p className="mt-1 leading-relaxed">
                    Every saree photo &amp; video carries an <b>&quot;ilkalkart&quot;</b> watermark and a
                    live <b>capture timestamp</b>. No watermark = not from us.
                  </p>
                </li>
                <li className="rounded-xl bg-white border border-green-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-green-700">3 · Scannable QR</div>
                  <p className="mt-1 leading-relaxed">
                    The QR on the label opens <b>only</b> on this website&apos;s
                    <span className="font-mono mx-1">/verify</span> page and shows your real order.
                  </p>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-ilkal-deep text-ilkal-cream p-4 sm:p-5 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-ilkal-gold shrink-0 mt-0.5" />
              <div className="text-[13px] sm:text-sm leading-relaxed">
                <b className="text-ilkal-gold">Our promise:</b> One founder. One WhatsApp number. One website.
                Every saree carries a unique scannable QR that verifies only on this domain. If anyone — Instagram
                page, WhatsApp forward, or random website — claims to be &quot;Ilkal Kart&quot; but doesn&apos;t
                match what you see here, it isn&apos;t us. When in doubt, message me directly through the{' '}
                <Link to="/contact" className="text-ilkal-gold font-semibold underline">
                  Contact
                </Link>{' '}
                page.
              </div>
            </div>

            <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-3 sm:p-4 text-[12px] sm:text-[13px] text-yellow-900 leading-relaxed flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <span>
                <b>If you&apos;ve been cheated by another &quot;Ilkal&quot; seller</b> — please don&apos;t stay silent.
                Report it to the{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold"
                >
                  National Cyber Crime portal
                </a>{' '}
                (or dial <b>1930</b>). Your report protects another sister from the same trap.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

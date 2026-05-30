import { motion } from 'framer-motion';

export const FOUNDER_WHATSAPP = '916363271302';
export const FOUNDER_WHATSAPP_DISPLAY = '+91 63632 71302';

const DEFAULT_MESSAGE =
  "Namaste Ilkal Kart 🙏 I'd like to order. Here are the details:\n\n" +
  "• Saree ID(s) & quantity:\n" +
  "• Full name:\n" +
  "• Shipping address (with PIN):\n" +
  "• Email (optional):\n\n" +
  "Please share the secure payment link. Thank you!";

export const waOrderHref = (msg = DEFAULT_MESSAGE) =>
  `https://wa.me/${FOUNDER_WHATSAPP}?text=${encodeURIComponent(msg)}`;

const WAIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.4 0 .02 5.38.02 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0 0 12.02 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.21-3.5-8.52ZM12.02 21.8a9.8 9.8 0 0 1-5-1.37l-.36-.22-3.66.96.98-3.57-.23-.37A9.79 9.79 0 1 1 21.82 12a9.78 9.78 0 0 1-9.8 9.8Zm5.62-7.34c-.31-.16-1.83-.9-2.11-1-.28-.1-.49-.16-.7.15-.21.31-.8 1-.98 1.21-.18.2-.36.23-.67.07-.31-.16-1.31-.48-2.5-1.55-.92-.82-1.55-1.83-1.73-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.51.1-.21.05-.39-.03-.54-.08-.16-.7-1.68-.96-2.3-.25-.6-.51-.52-.7-.53l-.6-.01c-.21 0-.54.08-.83.39-.28.31-1.08 1.06-1.08 2.58 0 1.51 1.11 2.98 1.26 3.18.16.21 2.18 3.32 5.28 4.66.74.32 1.32.51 1.77.66.74.23 1.41.2 1.94.12.59-.09 1.83-.74 2.09-1.46.26-.72.26-1.34.18-1.46-.08-.13-.28-.21-.59-.36Z"
    />
  </svg>
);

export default function WhatsAppOrderCard({ compact = false, variant = 'full' }) {
  if (variant === 'pill') {
    return (
      <a
        href={waOrderHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-600 text-white font-semibold shadow-md hover:shadow-lg hover:bg-green-700 transition text-sm"
      >
        <WAIcon className="w-4 h-4" /> Order on WhatsApp · {FOUNDER_WHATSAPP_DISPLAY}
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={waOrderHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-4xl border border-stone-200 bg-white shadow-card px-5 sm:px-6 py-4 hover:shadow-card-hover transition-shadow"
      >
        <span className="grid place-items-center w-11 h-11 rounded-full bg-emerald-600 text-white shrink-0">
          <WAIcon className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-700 leading-relaxed">
            <b className="text-stone-900">Prefer WhatsApp?</b> Send the <b>Saree ID</b> on any card, the
            quantity and your address — I&apos;ll share a secure payment link and take care of the rest.
          </p>
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            Chat · {FOUNDER_WHATSAPP_DISPLAY}
          </span>
        </div>
        <span className="text-stone-300 shrink-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>
    );
  }

  const STEPS = [
    { n: '1', t: 'Saree ID(s) + quantity', d: 'The dark ID pill on each saree card is the Saree ID. Share that ID and how many you want.' },
    { n: '2', t: 'Shipping address',       d: 'Full name, complete address with landmark and PIN — same as you would on a courier.' },
    { n: '3', t: 'A secure payment link',  d: "I'll personally share a secure payment link (same gateway as the website) — pay in one tap." },
    { n: '4', t: 'Rest, I take care of',   d: 'Order confirmation, packing photos, packing video, tracking & doorstep delivery — all on WhatsApp.' },
  ];

  return (
    <section className={`px-4 sm:px-6 ${compact ? 'py-10' : 'py-16 sm:py-20'} bg-stone-50`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="grid lg:grid-cols-[1fr_1.15fr] rounded-4xl overflow-hidden border border-stone-200 shadow-card-hover bg-white"
        >
          {/* LEFT — dark panel with a faux chat preview */}
          <div className="relative bg-stone-900 text-stone-50 p-8 sm:p-10 flex flex-col">
            <span className="eyebrow !text-stone-400 before:!bg-emerald-500">Order on WhatsApp</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-50 leading-[0.95]">
              Not into website checkout? Just chat.
            </h2>
            <p className="mt-4 text-stone-400 leading-relaxed">
              Message the founder directly — no app, no signup. Here&apos;s exactly what a message looks like:
            </p>

            {/* faux chat bubble */}
            <div className="mt-7 space-y-2.5">
              <div className="max-w-[19rem] rounded-2xl rounded-tl-md bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm text-stone-200 leading-relaxed">
                Namaste 🙏 I&apos;d like to order:<br />
                <span className="text-stone-400">• Saree ID 57 × 2</span><br />
                <span className="text-stone-400">• Name + address with PIN</span>
              </div>
              <div className="ml-auto max-w-[17rem] rounded-2xl rounded-tr-md bg-emerald-600 px-4 py-3 text-sm text-white leading-relaxed">
                Got it! Sharing your secure payment link now ✅
              </div>
            </div>

            {/* official number trust note */}
            <div className="mt-auto pt-8">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-start gap-3">
                <WAIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-stone-300 leading-relaxed">
                  <b className="text-stone-50">Official WhatsApp:</b>{' '}
                  <a href={waOrderHref()} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">
                    {FOUNDER_WHATSAPP_DISPLAY}
                  </a>{' '}
                  — the same number that sends your packing photos & tracking. <b className="text-stone-50">This is the only one.</b> Lookalike numbers asking for UPI transfers are not us.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — steps ledger + CTA */}
          <div className="p-8 sm:p-10 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Four steps</span>
            <ol className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
              {STEPS.map((step, i) => (
                <motion.li
                  key={step.n}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-start gap-4 py-4"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-stone-900 text-stone-50 text-sm font-bold shrink-0">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display font-bold tracking-display text-stone-900">{step.t}</h3>
                    <p className="mt-0.5 text-sm text-stone-500 leading-relaxed">{step.d}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <a
              href={waOrderHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-[0.98]"
            >
              <WAIcon className="w-5 h-5" /> Start a WhatsApp order
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

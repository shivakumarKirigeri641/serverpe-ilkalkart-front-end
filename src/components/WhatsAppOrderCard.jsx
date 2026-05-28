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
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-green-600 text-white grid place-items-center shrink-0">
          <WAIcon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] sm:text-sm text-green-900 leading-relaxed">
            <b>Prefer ordering on WhatsApp?</b> Send me the <b>Saree ID</b> shown on each card, the
            <b> quantity</b> and your <b>shipping address</b>. I&apos;ll share a secure payment link &mdash; the
            rest, I take care of.
          </p>
          <a
            href={waOrderHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 underline"
          >
            <WAIcon className="w-3.5 h-3.5" /> Chat: {FOUNDER_WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className={`px-4 sm:px-6 ${compact ? 'py-8' : 'py-12 sm:py-16'} bg-gradient-to-br from-green-50 via-white to-ilkal-cream`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white border-2 border-green-200 shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-white px-5 sm:px-6 py-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
              <WAIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xl sm:text-2xl">Prefer to order on WhatsApp?</h2>
              <p className="text-[11px] sm:text-xs opacity-95">
                Talk to the founder directly — no app, no signup
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-sm sm:text-[15px] leading-relaxed text-ilkal-deep">
              Not comfortable with website checkout? <b>Just message me on WhatsApp</b> with the
              following — that&apos;s all I need to start preparing your saree:
            </p>

            <ol className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  n: '1',
                  t: 'Saree ID(s) + quantity',
                  d: 'The gold pill on each saree card is the Saree ID. Share that ID and how many you want.',
                },
                {
                  n: '2',
                  t: 'Shipping address',
                  d: 'Full name, complete address with landmark and PIN — same as you would on a courier.',
                },
                {
                  n: '3',
                  t: 'I send a secure payment link',
                  d: "I'll personally share a secure payment link (same gateway as the website) — pay in one tap.",
                },
                {
                  n: '4',
                  t: 'Rest, I take care of',
                  d: 'Order confirmation, packing photos, packing video, tracking & doorstep delivery — all on WhatsApp.',
                },
              ].map((step, i) => (
                <motion.li
                  key={step.n}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/40 p-3.5 relative"
                >
                  <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full silk-gradient text-white font-bold grid place-items-center shadow-lg text-sm">
                    {step.n}
                  </div>
                  <h3 className="font-semibold text-ilkal-maroon text-sm mt-1">{step.t}</h3>
                  <p className="text-[12px] sm:text-[13px] opacity-85 mt-1 leading-relaxed">{step.d}</p>
                </motion.li>
              ))}
            </ol>

            <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
              <WAIcon className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
              <div className="text-[12px] sm:text-[13px] text-green-900 leading-relaxed">
                <b>Founder&apos;s WhatsApp:</b>{' '}
                <a
                  href={waOrderHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  {FOUNDER_WHATSAPP_DISPLAY}
                </a>{' '}
                · same number that sends your packing photos and tracking updates. <b>This is the only
                official WhatsApp.</b> Lookalike numbers asking for UPI transfers are not us.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={waOrderHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:shadow-lg hover:bg-green-700 transition flex-1"
              >
                <WAIcon className="w-5 h-5" /> Start a WhatsApp order
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

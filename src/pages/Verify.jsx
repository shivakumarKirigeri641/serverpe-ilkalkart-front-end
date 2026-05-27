import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, BadgeCheck, Sparkles, Loader2, ShieldAlert, ScanLine,
  Hash, Heart, Camera, MessageCircle, ExternalLink, Package, Truck,
  ReceiptText, User, Calendar, Download,
} from 'lucide-react';
import { apiClient, uploadsUrl } from '../utils/api.js';
import ScamWarning from '../components/ScamWarning.jsx';

export default function Verify() {
  const { qrcode } = useParams();
  const [state, setState] = useState({
    loading: true, ok: false, alreadyScanned: false, message: '', data: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiClient.post('/qrcode', { qrcode });
        const body = res.data;
        if (!alive) return;
        setState({
          loading: false,
          ok: Boolean(body?.verified) && Boolean(body?.data),
          alreadyScanned: Boolean(body?.already_scanned),
          message: body?.message || '',
          data: body?.data || null,
        });
      } catch (e) {
        if (!alive) return;
        setState({
          loading: false,
          ok: false,
          alreadyScanned: false,
          message: e?.message || 'Could not verify this code right now. Please try again.',
          data: null,
        });
      }
    })();
    return () => { alive = false; };
  }, [qrcode]);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-10 bg-gradient-to-b from-ilkal-cream/50 via-white to-ilkal-cream/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ilkal-maroon/10 text-ilkal-maroon text-[11px] font-semibold tracking-widest border border-ilkal-maroon/20">
            <ScanLine className="w-3.5 h-3.5" /> AUTHENTICITY CHECK
          </span>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-ilkal-maroon">
            Saree Verification
          </h1>
          <p className="mt-2 text-sm opacity-70">
            Scanning the QR tag printed on your saree label.
          </p>

        </div>

        <AnimatePresence mode="wait">
          {state.loading ? (
            <LoadingCard key="loading" qrcode={qrcode} />
          ) : state.ok ? (
            <GenuineCard key="ok" data={state.data} qrcode={qrcode} alreadyScanned={state.alreadyScanned} message={state.message} />
          ) : (
            <InvalidCard key="bad" message={state.message} qrcode={qrcode} />
          )}
        </AnimatePresence>
      </div>

      <ScamWarning />
    </div>
  );
}

function LoadingCard({ qrcode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="mt-8 bg-white rounded-3xl border border-ilkal-gold/20 shadow-xl p-8 text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-ilkal-gold/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-ilkal-maroon border-r-ilkal-maroon animate-spin" />
        <Loader2 className="absolute inset-0 m-auto w-7 h-7 text-ilkal-maroon opacity-0" />
        <ShieldCheck className="absolute inset-0 m-auto w-7 h-7 text-ilkal-maroon" />
      </div>
      <p className="mt-5 text-ilkal-maroon font-serif text-lg">Verifying your saree…</p>
      <p className="mt-1 text-xs opacity-60 break-all">Code: <Hash className="inline w-3 h-3" /> {qrcode}</p>
    </motion.div>
  );
}

function GenuineCard({ data, qrcode, alreadyScanned, message }) {
  const last4 = data?.buyer?.mobile_last4 || null;
  const accent = alreadyScanned
    ? {
        border: 'border-amber-300',
        gradient: 'from-amber-600 via-orange-500 to-amber-600',
        iconColor: 'text-amber-600',
        halo: 'bg-amber-500/40',
        title: 'Verification already done',
        subtitle:
          'This saree has already been verified once. Repeat scans are normal — but the first scan was recorded at delivery.',
      }
    : {
        border: 'border-green-300',
        gradient: 'from-green-600 via-emerald-500 to-green-600',
        iconColor: 'text-green-600',
        halo: 'bg-green-500/40',
        title: '100% Genuine',
        subtitle: 'This is an authentic Ilkal Kart saree, personally hand-picked from the loom.',
      };

  return (
    <motion.div
      key="genuine"
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      className="mt-8 relative">

      {/* Animated halo */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.4, 1.8], opacity: [0.35, 0.15, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          className={`w-40 h-40 rounded-full ${accent.halo} blur-2xl`} />
      </div>

      <div className={`relative bg-white rounded-3xl border-2 ${accent.border} shadow-2xl overflow-hidden`}>
        <div className={`bg-gradient-to-r ${accent.gradient} px-6 py-6 text-white text-center relative overflow-hidden`}>
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="mx-auto w-20 h-20 rounded-full bg-white grid place-items-center shadow-2xl">
            {alreadyScanned ? (
              <ShieldAlert className={`w-12 h-12 ${accent.iconColor}`} strokeWidth={2.5} />
            ) : (
              <BadgeCheck className={`w-12 h-12 ${accent.iconColor}`} strokeWidth={2.5} />
            )}
          </motion.div>
          <h2 className="mt-4 font-serif text-2xl sm:text-3xl">{accent.title}</h2>
          <p className="mt-1 text-sm opacity-95">{accent.subtitle}</p>
          <Sparkles className="absolute top-4 left-4 w-5 h-5 opacity-50" />
          <Sparkles className="absolute bottom-4 right-6 w-4 h-4 opacity-60" />
          <Sparkles className="absolute top-6 right-10 w-3 h-3 opacity-70" />
        </div>

        <div className="p-6 space-y-4">
          {/* Buyer mobile last-4 — prominent confirmation */}
          {last4 && (
            <div className="rounded-2xl border-2 border-ilkal-gold/40 bg-ilkal-cream/60 p-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-ilkal-maroon/70 font-semibold">
                Registered to purchaser
              </div>
              <div className="mt-1 font-serif text-xl sm:text-2xl text-ilkal-maroon">
                +91 ✱✱✱✱✱✱ <span className="font-mono tracking-widest">{last4}</span>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-ilkal-deep/75">
                If the last 4 digits match the mobile number you used at purchase, this saree is truly yours.
                If not, please <Link to="/contact" className="underline font-semibold text-ilkal-maroon">contact us</Link> immediately.
              </p>
            </div>
          )}

          {alreadyScanned ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed">
              <h3 className="font-semibold text-amber-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Saree verification is already done
              </h3>
              <p className="mt-1 text-amber-900/90">
                {message ||
                  'This QR was verified earlier. The saree is genuine; you&apos;re simply seeing the verification record again.'}
              </p>
              <div className="mt-2 text-[12px] text-amber-900/80">
                Each saree only needs to be verified <b>once</b>. Repeat scans are fine — they don&apos;t change anything.
              </div>
            </div>
          ) : (
            <p className="text-center text-sm leading-relaxed text-ilkal-deep">
              Thank you for trusting Ilkal Kart. Your saree has been verified against our records and is
              confirmed as a <b className="text-green-700">genuine, original</b> piece — not a replica.
              This QR is now marked as <b>verified</b>; future scans will simply show this same confirmation.
            </p>
          )}

          {data?.saree && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wide opacity-70 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-ilkal-gold" /> Saree details
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.saree.title && <Detail label="Title" value={data.saree.title} />}
                {data.saree.id != null && <Detail label="Saree ID" value={`#${data.saree.id}`} />}
                {data.saree.type_name && <Detail label="Type" value={data.saree.type_name} />}
                {data.saree.color && <Detail label="Colour" value={data.saree.color} />}
                {data.saree.material && <Detail label="Material" value={data.saree.material} />}
                {data.saree.border && <Detail label="Border" value={data.saree.border} />}
                {data.saree.pallu && <Detail label="Pallu" value={data.saree.pallu} />}
                {data.saree.blouse && <Detail label="Blouse" value={data.saree.blouse} />}
                {data.saree.handloom != null && (
                  <Detail label="Handloom" value={data.saree.handloom ? 'Yes' : 'No'} />
                )}
                {data.saree.combined_code && (
                  <Detail label="Saree code" value={data.saree.combined_code} mono />
                )}
                {data.saree.dimension_length && (
                  <Detail label="Length" value={`${data.saree.dimension_length} m`} />
                )}
                {data.saree.dimension_width && (
                  <Detail label="Width" value={`${data.saree.dimension_width} m`} />
                )}
              </div>
              {(data.saree.description1 || data.saree.description2) && (
                <p className="mt-2 text-[13px] leading-relaxed opacity-90">
                  {[data.saree.description1, data.saree.description2].filter(Boolean).join(' ')}
                </p>
              )}
            </section>
          )}

          {(data?.order || data?.suborder || data?.buyer) && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wide opacity-70 mb-2 flex items-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 text-ilkal-gold" /> Purchase details
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {data?.order?.order_id && (
                  <Detail label="Order ID" value={data.order.order_id} mono />
                )}
                {data?.order?.placed_on && (
                  <Detail
                    label="Order placed on"
                    value={new Date(data.order.placed_on).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    icon={Calendar}
                  />
                )}
                {data?.order?.invoice_id && (
                  <Detail
                    label="Invoice"
                    value={data.order.invoice_id}
                    extra={data?.order?.invoice_path ? (
                      <a href={uploadsUrl(data.order.invoice_path)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-ilkal-maroon font-semibold underline">
                        <Download className="w-3 h-3" /> Download PDF
                      </a>
                    ) : null}
                  />
                )}
                {data?.order?.delivery_status_name && (
                  <Detail
                    label="Delivery"
                    value={data.order.delivery_status_name}
                    icon={Truck}
                    extra={data?.order?.delivery_partner_name ? (
                      <span className="text-xs opacity-70">via {data.order.delivery_partner_name}</span>
                    ) : null}
                  />
                )}
                {data?.suborder?.quantity != null && (
                  <Detail label="Quantity on this label" value={String(data.suborder.quantity)} />
                )}
                {data?.suborder?.base_price != null && (
                  <Detail
                    label="Base price"
                    value={`₹${Number(data.suborder.base_price).toLocaleString('en-IN')}`}
                  />
                )}
                {data?.buyer?.name && (
                  <Detail
                    label="Buyer"
                    value={data.buyer.name}
                    icon={User}
                    extra={data?.buyer?.mobile_last4 ? (
                      <span className="text-xs opacity-70">+91 ****** {data.buyer.mobile_last4}</span>
                    ) : null}
                  />
                )}
              </div>
            </section>
          )}

          <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4 text-sm">
            <h3 className="font-semibold text-ilkal-maroon flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-ilkal-rose text-ilkal-rose" /> What this confirms
            </h3>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed opacity-90">
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                Personally selected from a weaver&apos;s loom in Ilkal village.
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                Hand-inspected, washed, ironed and packed in muslin cloth before dispatch.
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                Never worn, never draped before reaching you.
              </li>
              <li className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-ilkal-maroon mt-0.5 shrink-0" />
                Real photos &amp; videos — no AI, no editing, no filters. Every frame carries an
                <b> &quot;ilkalkart&quot; watermark</b> and a live capture timestamp.
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                All our SMS arrive only from the sender header
                <span className="font-mono mx-1 px-1 py-0.5 rounded bg-ilkal-cream border border-ilkal-gold/30">*-SRVRPE-*</span>.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-[12px] text-yellow-900 leading-relaxed">
            <b>⚠️ Important:</b> If anyone other than the original buyer is selling this saree as new,
            or if this QR is found on a different product, it is being misused. Please report it to
            us via the <Link to="/contact" className="underline font-semibold">Contact</Link> page.
            <br />
            <span className="opacity-80">
              📷 A slight variation in the colour of the saree is possible due to natural lighting while taking the photo.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/browse" className="btn-primary flex-1 justify-center">
              Browse more sarees
            </Link>
            <Link to="/feedback" className="flex-1 justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-ilkal-gold/40 text-ilkal-maroon font-semibold hover:bg-ilkal-cream transition">
              <MessageCircle className="w-4 h-4" /> Share your experience
            </Link>
          </div>

          <p className="text-center text-[11px] opacity-60 break-all">
            Verified code: <Hash className="inline w-3 h-3" /> {qrcode}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function InvalidCard({ message, qrcode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      className="mt-8 bg-white rounded-3xl border-2 border-red-300 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 px-6 py-6 text-white text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          className="mx-auto w-20 h-20 rounded-full bg-white grid place-items-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-600" strokeWidth={2.5} />
        </motion.div>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl">Not Verified</h2>
        <p className="mt-1 text-sm opacity-95">
          We couldn&apos;t confirm this QR code in our system.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-center leading-relaxed text-ilkal-deep">
          {message || 'Saree details not found for this QR code. Please scan again.'}
        </p>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
          <h3 className="font-semibold text-red-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> What this might mean
          </h3>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-red-900/90">
            <li>• The QR may have been scanned incorrectly — try again with steady focus.</li>
            <li>• The code might be from a different platform or be a replica label.</li>
            <li>• If you bought this as &quot;Ilkal Kart&quot;, this saree may not be genuine.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4 text-sm">
          <h3 className="font-semibold text-ilkal-maroon">Need help?</h3>
          <p className="mt-1 text-[13px] opacity-90">
            If you believe this is a genuine Ilkal Kart purchase, please reach out so we can verify
            your order manually.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Link to="/contact" className="btn-primary flex-1 justify-center">
              <ExternalLink className="w-4 h-4" /> Contact us
            </Link>
            <Link to="/purchase-history" className="flex-1 justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-ilkal-gold/40 text-ilkal-maroon font-semibold hover:bg-ilkal-cream transition">
              Check Purchase History
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] opacity-60 break-all">
          Scanned code: <Hash className="inline w-3 h-3" /> {qrcode}
        </p>
      </div>
    </motion.div>
  );
}

function Detail({ label, value, mono, icon: Icon, extra }) {
  return (
    <div className="rounded-xl border border-ilkal-gold/20 bg-ilkal-cream/40 p-3">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide opacity-60">
        {Icon && <Icon className="w-3 h-3 text-ilkal-gold" />}
        {label}
      </div>
      <div className={`mt-0.5 font-semibold text-ilkal-maroon break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}

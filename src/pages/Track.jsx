import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PackageCheck, Truck, MapPin, Camera, MessageCircle, AlertCircle, Loader2,
  Search, ShieldAlert, BadgeCheck, Video, ClipboardCheck, Boxes, Home, ArrowRight,
} from 'lucide-react';
import { apiClient } from '../utils/api.js';

const JOURNEY = [
  { t: 'Confirmed',  d: 'Order received & locked', icon: ClipboardCheck },
  { t: 'Packed',     d: 'Hand-packed with proof',  icon: Boxes },
  { t: 'Dispatched', d: 'On the way to your PIN',   icon: Truck },
  { t: 'Delivered',  d: 'At your doorstep',         icon: Home },
];

const SAFETY = [
  { icon: MessageCircle, tone: 'emerald', t: 'Live on WhatsApp', d: 'Tracking, photos & a packing video arrive on the WhatsApp number you used at checkout.' },
  { icon: ShieldAlert,   tone: 'rose',    t: 'Beware of scams',  d: 'We never SMS or call asking for OTPs, extra delivery fees, or app installs. Track only here.' },
  { icon: BadgeCheck,    tone: 'stone',   t: 'Only from SRVRPE', d: 'Our SMS arrive only from *-SRVRPE-*. Every photo/video carries an “ilkalkart” watermark + live timestamp.' },
  { icon: Video,         tone: 'wood',    t: 'Record the unboxing', d: 'When the parcel arrives, record one continuous unboxing video — it protects both you & me.' },
];

const TONE = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rose:    'bg-rose-50 text-rose-700 ring-rose-100',
  stone:   'bg-stone-100 text-stone-700 ring-stone-200',
  wood:    'bg-wood/10 text-wood-dark ring-wood/20',
};

export default function Track() {
  const [oid, setOid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [searchParams] = useSearchParams();

  const runTrack = async (orderId) => {
    const id = String(orderId || '').trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.post('/track-my-saree', { order_id: id });
      const body = res.data;
      if (!body?.successstatus) {
        setError(body?.message || 'Could not fetch order status');
        return;
      }
      const shipping = Array.isArray(body.data) ? null : body.data;
      setResult({ id: id.toUpperCase(), message: body.message, shipping });
    } catch (e) {
      setError(e?.message || 'Could not fetch order status');
    } finally {
      setLoading(false);
    }
  };

  const track = (e) => { e.preventDefault(); runTrack(oid); };

  useEffect(() => {
    const fromUrl = searchParams.get('oid');
    if (fromUrl && fromUrl.trim()) {
      setOid(fromUrl);
      runTrack(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Which journey stage to highlight in the preview rail.
  const activeStage = result ? (result.shipping ? 2 : 0) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* ============================================================
          TRACKING CONSOLE — dark panel with the lookup built in
         ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="rounded-4xl bg-stone-900 text-stone-50 p-8 sm:p-11 shadow-card-hover">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow !text-stone-400 before:!bg-wood">Track my saree</span>
            <h1 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-50 leading-[0.95]">
              Where is it now?
            </h1>
            <p className="mt-3 text-stone-400 max-w-md">
              Enter your Order ID and follow your saree’s journey from the loom to your doorstep.
            </p>
          </div>
          <span className="hidden sm:grid place-items-center w-14 h-14 rounded-2xl bg-white/5 ring-1 ring-white/10 text-wood shrink-0">
            <MapPin className="w-6 h-6" />
          </span>
        </div>

        <form onSubmit={track} className="mt-8 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-500" />
            <input value={oid} onChange={e => setOid(e.target.value)}
              placeholder="Enter your Order ID"
              className="w-full pl-11 pr-4 py-4 rounded-full bg-white/5 ring-1 ring-white/10 text-stone-50 placeholder:text-stone-500 focus:ring-2 focus:ring-wood focus:outline-none transition" />
          </div>
          <button disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-stone-50 text-stone-900 font-medium hover:bg-white transition active:scale-[0.98] disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Track <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* journey preview rail */}
        <div className="mt-9 pt-7 border-t border-stone-700">
          <ol className="relative grid grid-cols-4 gap-2">
            <span className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-stone-700" aria-hidden />
            {JOURNEY.map((s, i) => {
              const Icon = s.icon;
              const reached = i <= activeStage;
              return (
                <li key={s.t} className="relative flex flex-col items-center text-center">
                  <div className={`grid place-items-center w-10 h-10 rounded-full ring-4 ring-stone-900 transition-colors duration-500 ${
                    reached ? 'bg-wood text-stone-900' : 'bg-stone-800 text-stone-500'
                  }`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className={`mt-3 text-xs font-bold tracking-wide ${reached ? 'text-stone-50' : 'text-stone-500'}`}>{s.t}</span>
                  <span className="mt-0.5 text-[10px] text-stone-500 leading-snug max-w-[6.5rem] hidden sm:block">{s.d}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </motion.section>

      {/* ============================================================
          ERROR
         ============================================================ */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-4xl border-2 border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-sm text-rose-800">{error}</div>
        </motion.div>
      )}

      {/* ============================================================
          RESULT
         ============================================================ */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white rounded-4xl border border-stone-200 shadow-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Order</span>
              <div className="font-display font-extrabold tracking-display text-2xl text-stone-900">{result.id}</div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              result.shipping ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-stone-100 text-stone-700 ring-1 ring-stone-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${result.shipping ? 'bg-emerald-500' : 'bg-stone-400'}`} />
              {result.shipping ? 'Shipment updated' : 'Order confirmed'}
            </span>
          </div>

          {result.message && (
            <div className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm leading-relaxed text-stone-700 flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {result.shipping ? (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field icon={Truck} label="Delivery partner" value={result.shipping.delivery_partner_name} sub={result.shipping.description} />
              <Field icon={MapPin} label="Delivery status" value={result.shipping.delivery_status_name} sub={result.shipping.ds_description} />
              {result.shipping.invoice_id && (
                <Field icon={PackageCheck} label="Invoice" value={String(result.shipping.invoice_id)} />
              )}
            </div>
          ) : (
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-stone-900 text-stone-50 shrink-0">
                <PackageCheck className="w-5 h-5" />
              </span>
              <div className="text-sm">
                <h3 className="font-display font-bold tracking-display text-stone-900">Order received</h3>
                <p className="text-stone-500 mt-1 leading-relaxed">
                  Shipping &amp; delivery-partner details appear here the moment your saree is dispatched.
                  You’ll also get a WhatsApp update on the number used to place the order.
                </p>
                <p className="mt-2 text-xs text-stone-400 inline-flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Photo &amp; video proof is shared on WhatsApp once captured.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================================
          SAFETY GRID — provenance & scam notes as cards
         ============================================================ */}
      <div className="mt-8">
        <span className="eyebrow">Good to know</span>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {SAFETY.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="rounded-4xl bg-white border border-stone-200 shadow-card p-5 flex items-start gap-3.5">
                <span className={`grid place-items-center w-11 h-11 rounded-2xl ring-1 shrink-0 ${TONE[s.tone]}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold tracking-display text-stone-900">{s.t}</h3>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-stone-400">
        <Icon className="w-3.5 h-3.5 text-wood" /> {label}
      </div>
      <div className="mt-1.5 font-display font-bold tracking-display text-stone-900">{value || '—'}</div>
      {sub && <p className="mt-1 text-xs text-stone-500 leading-relaxed">{sub}</p>}
    </div>
  );
}

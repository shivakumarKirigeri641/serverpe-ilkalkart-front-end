import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageCheck, Truck, MapPin, Camera, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../utils/api.js';

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
      setResult({
        id: id.toUpperCase(),
        message: body.message,
        shipping,
      });
    } catch (e) {
      setError(e?.message || 'Could not fetch order status');
    } finally {
      setLoading(false);
    }
  };

  const track = (e) => {
    e.preventDefault();
    runTrack(oid);
  };

  useEffect(() => {
    const fromUrl = searchParams.get('oid');
    if (fromUrl && fromUrl.trim()) {
      setOid(fromUrl);
      runTrack(fromUrl);
    }
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon text-center">Track my Saree</h1>
      <p className="text-center opacity-70 mt-2">
        Enter your Order ID to follow your saree&apos;s journey.
      </p>
      <p className="text-center text-[11px] text-green-800 mt-1.5">
        💚 You&apos;ll also receive live tracking, photos &amp; a packing video on the <b>WhatsApp number</b> you used at checkout.
      </p>
      <p className="text-center text-[11px] text-red-800 mt-1 max-w-md mx-auto">
        🛡️ <b>Beware:</b> we never SMS or call asking for OTPs, extra delivery fees, or app installs. Check tracking only here.
      </p>
      <p className="text-center text-[11px] opacity-80 mt-1 max-w-md mx-auto">
        ✅ Our SMS arrive only from <b className="font-mono">*-SRVRPE-*</b>. Every saree photo/video we send carries an
        <b> &quot;ilkalkart&quot;</b> watermark + live timestamp.
      </p>

      <form onSubmit={track} className="mt-6 flex gap-2 max-w-md mx-auto">
        <input value={oid} onChange={e => setOid(e.target.value)}
          placeholder="Enter Order ID"
          className="flex-1 px-4 py-3 rounded-full bg-white border border-ilkal-gold/30 focus:outline-none focus:border-ilkal-maroon shadow-sm" />
        <button className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
        </button>
      </form>

      {error && (
        <div className="mt-8 max-w-md mx-auto rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-10 bg-white rounded-3xl shadow-xl border border-ilkal-gold/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs opacity-70">Order</div>
              <div className="font-serif text-xl text-ilkal-maroon">{result.id}</div>
            </div>
            <span className={`chip ${result.shipping ? 'bg-green-100 text-green-800 border-green-200' : 'bg-ilkal-cream text-ilkal-maroon'}`}>
              {result.shipping ? 'Shipment Updated' : 'Order Confirmed'}
            </span>
          </div>

          {result.message && (
            <div className="mt-4 rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4 text-sm leading-relaxed text-ilkal-deep flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-ilkal-maroon mt-0.5 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {result.shipping ? (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field
                icon={Truck}
                label="Delivery Partner"
                value={result.shipping.delivery_partner_name}
                sub={result.shipping.description}
              />
              <Field
                icon={MapPin}
                label="Delivery Status"
                value={result.shipping.delivery_status_name}
                sub={result.shipping.ds_description}
              />
              {result.shipping.invoice_id && (
                <Field
                  icon={PackageCheck}
                  label="Invoice"
                  value={String(result.shipping.invoice_id)}
                />
              )}
            </div>
          ) : (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ilkal-gold/30 bg-white p-4">
              <div className="w-10 h-10 rounded-xl silk-gradient grid place-items-center shrink-0">
                <PackageCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <h3 className="font-semibold text-ilkal-maroon">Order received</h3>
                <p className="opacity-80 mt-0.5 leading-relaxed">
                  Shipping &amp; delivery partner details will appear here as soon as your saree is dispatched.
                  You&apos;ll also get a WhatsApp update on the same number used to place the order.
                </p>
                <p className="mt-2 text-xs opacity-70 inline-flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Photo &amp; video recording is shared on WhatsApp once captured.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/40 p-4">
      <div className="flex items-center gap-2 text-xs opacity-70">
        <Icon className="w-3.5 h-3.5 text-ilkal-gold" /> {label}
      </div>
      <div className="mt-1 font-semibold text-ilkal-maroon">{value || '—'}</div>
      {sub && <p className="mt-1 text-xs opacity-70 leading-relaxed">{sub}</p>}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Phone, Loader2, AlertCircle, ShoppingBag, Truck, ReceiptText,
  Calendar, ChevronDown, CheckCircle2, IndianRupee, CreditCard, Download,
  MessageSquare, KeyRound, ArrowLeft, Check, Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, uploadsUrl } from '../utils/api.js';
import ScamWarning from '../components/ScamWarning.jsx';

export default function PurchaseHistory() {
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp' | 'result'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [openId, setOpenId] = useState(null);

  const isValidMobile = /^[6-9]\d{9}$/.test(mobile.trim());
  const isValidOtp = /^\d{4}$/.test(otp.trim());

  const sendOtp = async (e) => {
    e?.preventDefault?.();
    if (!isValidMobile) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await apiClient.post('/purchase-history/send-otp', { mobile_number: mobile.trim() });
      const body = res.data;
      if (!body?.successstatus) {
        setError(body?.message || 'Could not send OTP. Please try again.');
        return;
      }
      setInfo(body.message || 'OTP sent.');
      setStep('otp');
      toast.success('OTP sent');
    } catch (e) {
      setError(e?.message || 'Could not send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault?.();
    if (!isValidOtp) {
      setError('Please enter the OTP sent to your mobile.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const res = await apiClient.post('/purchase-history/verify-otp', {
        mobile_number: mobile.trim(),
        otp: otp.trim(),
      });
      const body = res.data;
      if (!body?.successstatus) {
        setError(body?.message || 'OTP verification failed.');
        return;
      }
      setResult(body.data);
      setStep('result');
      if (body.data?.orders?.length === 1) setOpenId(body.data.orders[0].order_id);
      toast.success('Verified');
    } catch (e) {
      setError(e?.message || 'OTP verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const restart = () => {
    setStep('mobile');
    setMobile('');
    setOtp('');
    setError(null);
    setInfo(null);
    setResult(null);
    setOpenId(null);
  };

  const orders = result?.orders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ============================================================
          AUTH STATE — two-column split: console (left) + preview (right)
         ============================================================ */}
      {step !== 'result' && (
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-4xl bg-stone-900 text-stone-50 p-8 sm:p-11 shadow-card-hover">
          <div>
            <span className="eyebrow !text-stone-400 before:!bg-wood">Purchase history</span>
            <h1 className="mt-4 font-display font-extrabold tracking-display text-4xl sm:text-5xl text-stone-50 leading-[0.95]">
              Your past orders.
            </h1>
            <p className="mt-3 text-stone-400 max-w-md">
              Verify the mobile number you used at checkout with a one-time password — no account needed.
            </p>
          </div>

          {/* stepper */}
          <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
            <span className={`inline-flex items-center gap-2 ${step === 'mobile' ? 'text-stone-50' : 'text-stone-500'}`}>
              <span className={`grid place-items-center w-6 h-6 rounded-full ${step === 'mobile' ? 'bg-wood text-stone-900' : 'bg-stone-700 text-stone-300'}`}>
                {step === 'otp' ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : '1'}
              </span>
              Number
            </span>
            <span className="h-px w-8 bg-stone-700" />
            <span className={`inline-flex items-center gap-2 ${step === 'otp' ? 'text-stone-50' : 'text-stone-500'}`}>
              <span className={`grid place-items-center w-6 h-6 rounded-full ${step === 'otp' ? 'bg-wood text-stone-900' : 'bg-stone-700 text-stone-300'}`}>2</span>
              Verify
            </span>
          </div>

          {step === 'mobile' && (
            <form onSubmit={sendOtp} className="mt-7 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-500" />
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoFocus
                  className="w-full pl-11 pr-4 py-4 rounded-full bg-white/5 ring-1 ring-white/10 text-stone-50 placeholder:text-stone-500 focus:ring-2 focus:ring-wood focus:outline-none transition tabular-nums"
                />
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-stone-50 text-stone-900 font-medium hover:bg-white transition active:scale-[0.98] disabled:opacity-50"
                disabled={sending || !isValidMobile}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" /> Send OTP</>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="mt-7">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
                <KeyRound className="w-4 h-4 text-wood" />
                <span>Enter the OTP sent to <b className="text-stone-50">+91 {mobile}</b></span>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValidOtp && !verifying) { e.preventDefault(); verifyOtp(); }
                  }}
                  placeholder="••••"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  className="flex-1 h-14 px-4 rounded-full bg-white/5 ring-1 ring-white/10 focus:ring-2 focus:ring-wood focus:outline-none text-center tracking-[0.6em] font-bold text-2xl text-stone-50"
                />
                <button
                  type="submit"
                  disabled={!isValidOtp || verifying}
                  className="h-14 px-7 rounded-full bg-wood text-stone-900 font-medium shrink-0 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition active:scale-[0.98]">
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-stone-400 leading-snug">
                🔒 SMS only from <span className="font-mono text-stone-300">*-SRVRPE-*</span>. Valid for 3 minutes. Never share over a call.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <button type="button" onClick={restart} className="inline-flex items-center gap-1 text-stone-300 hover:text-stone-50 font-medium transition">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change number
                </button>
                <button type="button" onClick={sendOtp} disabled={sending} className="text-wood font-medium underline underline-offset-2 disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 'mobile' && (
            <p className="mt-4 text-[11px] text-stone-500 leading-relaxed">
              Only the registered mobile number used during purchase can fetch its history. Requests are rate-limited.
            </p>
          )}

          {info && step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 px-4 py-2.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-200">{info}</div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 px-4 py-3 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="text-sm text-rose-200">{error}</div>
            </motion.div>
          )}
        </motion.section>

        {/* RIGHT — "what you'll find" preview, fills the width */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-4xl bg-white border border-stone-200 shadow-card p-7 sm:p-9">
          <span className="eyebrow">Once you’re in</span>
          <h2 className="mt-3 font-display font-extrabold tracking-display text-2xl sm:text-3xl text-stone-900 leading-tight">
            Every order, in one place.
          </h2>

          {/* faux order-card preview */}
          <div className="mt-7 rounded-4xl border border-stone-200 bg-stone-50 p-4 select-none" aria-hidden>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-stone-900 text-stone-50 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold tracking-display text-stone-900">ORD-2048</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-stone-400">12 Mar 2026 · 2 sarees · ₹8,598</div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-9 rounded-xl bg-white border border-stone-200" />
              <div className="h-9 rounded-xl bg-white border border-stone-200" />
            </div>
          </div>

          {/* what each order shows */}
          <ul className="mt-7 space-y-3">
            {[
              { icon: ReceiptText, t: 'GST invoice', d: 'Download the tax invoice PDF for every order.' },
              { icon: Truck,       t: 'Live delivery status', d: 'Partner, tracking and current stage.' },
              { icon: Package,     t: 'Every saree listed', d: 'Names, colours, quantities and prices.' },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex items-start gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-stone-100 text-wood-dark shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-stone-900">{t}</div>
                  <div className="text-xs text-stone-400">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </motion.aside>
        </div>
      )}

      {error && step === 'result' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-4xl border-2 border-rose-200 bg-rose-50 p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-sm text-rose-800">{error}</div>
        </motion.div>
      )}

      {step === 'result' && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white rounded-4xl border border-stone-200 shadow-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 grid place-items-center text-stone-50 font-display font-extrabold text-lg shrink-0">
              {(result?.user?.user_name || 'C').trim()[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Showing purchases for</div>
              <div className="font-display font-bold tracking-display text-lg text-stone-900 truncate">
                {result?.user?.user_name || 'Customer'}
              </div>
              <div className="text-xs text-stone-400 tabular-nums">+91 {result?.user?.mobile_number}</div>
            </div>
            <div className="ml-auto shrink-0 flex flex-col items-end gap-1.5">
              <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-full tabular-nums">
                {orders.length} order{orders.length === 1 ? '' : 's'}
              </span>
              <button type="button" onClick={restart} className="text-[11px] text-stone-500 font-medium underline underline-offset-2 hover:text-stone-900">
                Sign out
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-4xl border border-stone-200">
              <span className="w-16 h-16 mx-auto rounded-full bg-stone-100 grid place-items-center">
                <Package className="w-7 h-7 text-stone-400" />
              </span>
              <p className="mt-4 text-stone-500">No purchases found on this number yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o, idx) => (
                <OrderAccordion
                  key={o.order_id}
                  order={o}
                  index={idx}
                  isOpen={openId === o.order_id}
                  onToggle={() => setOpenId((id) => (id === o.order_id ? null : o.order_id))}
                />
              ))}
            </ul>
          )}
        </motion.div>
      )}

      <div className="-mx-4 sm:-mx-6 mt-10">
        <ScamWarning compact />
      </div>
    </div>
  );
}

function OrderAccordion({ order: o, index, isOpen, onToggle }) {
  const itemCount = o.items?.length || 0;
  const status = (o.delivery_status_name || 'Awaiting dispatch').trim();
  const paid = (o.payment_status || '').toLowerCase() === 'captured';

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-4xl border border-stone-200 shadow-card overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full text-left flex items-center gap-3.5 px-5 py-4 transition-colors ${
          isOpen ? 'bg-stone-100' : 'hover:bg-stone-50'
        }`}>
        <div className="w-11 h-11 rounded-2xl bg-stone-900 grid place-items-center text-stone-50 shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold tracking-display text-stone-900 truncate">{o.order_id}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              paid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
            }`}>
              {paid && <CheckCircle2 className="w-3 h-3" />}
              {paid ? 'Paid' : (o.payment_status || 'Pending').toUpperCase()}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-stone-400 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {o.ordered_on
                ? new Date(o.ordered_on).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                : '—'}
            </span>
            <span>·</span>
            <span>{itemCount} saree{itemCount === 1 ? '' : 's'}</span>
            <span>·</span>
            <span className="text-stone-900 font-semibold tabular-nums">
              {o.amount != null ? `₹${Number(o.amount).toLocaleString('en-IN')}` : '—'}
            </span>
          </div>
        </div>
        <div className="shrink-0 hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400">Status</span>
          <span className="text-xs font-semibold text-stone-900">{status}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 w-9 h-9 rounded-full border-2 border-stone-200 grid place-items-center text-stone-700">
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
            className="overflow-hidden border-t border-stone-200 bg-stone-50">
            <motion.div
              initial={{ y: -8 }} animate={{ y: 0 }} exit={{ y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <DetailTile
                  icon={ReceiptText} label="Invoice" value={o.invoice_id || '—'}
                  extra={o.invoice_path ? (
                    <a href={uploadsUrl(o.invoice_path)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-stone-900 font-semibold underline underline-offset-2">
                      <Download className="w-3 h-3" /> Download PDF
                    </a>
                  ) : null}
                />
                <DetailTile
                  icon={Truck} label="Delivery"
                  value={o.delivery_status_name || 'Awaiting dispatch'}
                  extra={o.delivery_partner_name ? (
                    <span className="text-xs text-stone-400">via {o.delivery_partner_name}</span>
                  ) : null}
                />
                <DetailTile
                  icon={IndianRupee} label="Amount paid"
                  value={o.amount != null ? `₹${Number(o.amount).toLocaleString('en-IN')}` : '—'}
                  extra={<span className="text-xs text-stone-400 inline-flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {(o.payment_method || '—').toUpperCase()}
                  </span>}
                />
                <DetailTile
                  icon={Package} label="Items"
                  value={`${itemCount} saree${itemCount === 1 ? '' : 's'}`}
                />
              </div>

              {itemCount > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2.5">Sarees in this order</h4>
                  <ul className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100 overflow-hidden">
                    {o.items.map((it, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04 }}
                        className="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-stone-900 truncate">
                            {it.title || it.combined_code}
                          </div>
                          <div className="text-xs text-stone-400 truncate">
                            {[it.color, it.material, it.combined_code].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs font-semibold text-stone-900 tabular-nums">×{it.quantity}</div>
                          {it.base_price != null && (
                            <div className="text-[10px] text-stone-400 tabular-nums">
                              ₹{Number(it.base_price).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                <Camera className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>A slight variation in the colour of the saree is possible due to natural lighting while taking the photo.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function DetailTile({ icon: Icon, label, value, extra }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-400">
        <Icon className="w-3.5 h-3.5 text-wood" /> {label}
      </div>
      <div className="font-display font-bold tracking-display text-stone-900 mt-1">{value}</div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}

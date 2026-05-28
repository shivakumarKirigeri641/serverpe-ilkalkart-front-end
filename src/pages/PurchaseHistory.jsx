import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Phone, Loader2, AlertCircle, ShoppingBag, Truck, ReceiptText,
  Calendar, ChevronDown, CheckCircle2, IndianRupee, CreditCard, Download,
  MessageSquare, KeyRound, ArrowLeft,
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon text-center">Purchase History</h1>
      <p className="text-center opacity-70 mt-2">
        Verify your mobile number with a one-time password to view your past orders.
      </p>

      {step === 'mobile' && (
        <form onSubmit={sendOtp} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ilkal-maroon" />
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-ilkal-gold/30 focus:outline-none focus:border-ilkal-maroon shadow-sm"
            />
          </div>
          <button className="btn-primary" disabled={sending || !isValidMobile}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" /> Send OTP</>}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verifyOtp} className="mt-6 max-w-md mx-auto space-y-3">
          <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ilkal-maroon">
              <KeyRound className="w-4 h-4" />
              <span>Enter the OTP sent to <b>+91 {mobile}</b></span>
            </div>
            <p className="mt-1 text-[11px] text-green-900 leading-snug">
              🔒 SMS only from <span className="font-mono">*-SRVRPE-*</span>. Valid for 3 minutes. Never share over a call.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidOtp && !verifying) {
                    e.preventDefault();
                    verifyOtp();
                  }
                }}
                placeholder="• • • •"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                className="flex-1 h-11 px-3 rounded-xl bg-white border border-ilkal-gold/40 focus:border-ilkal-maroon focus:outline-none text-center tracking-[0.5em] font-bold text-ilkal-maroon"
              />
              <button
                type="submit"
                disabled={!isValidOtp || verifying}
                className="h-11 px-5 rounded-xl silk-gradient text-white font-semibold text-sm shadow shrink-0 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1 text-ilkal-maroon font-semibold">
                <ArrowLeft className="w-3 h-3" /> Change number
              </button>
              <button
                type="button"
                onClick={sendOtp}
                disabled={sending}
                className="text-ilkal-maroon font-semibold underline disabled:opacity-50">
                Resend OTP
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'mobile' && (
        <p className="mt-2 text-center text-[11px] opacity-60">
          Only the registered mobile number used during purchase can fetch its history. Requests are rate-limited.
        </p>
      )}

      {info && step === 'otp' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 max-w-md mx-auto rounded-2xl border border-green-200 bg-green-50 px-3 py-2 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
          <div className="text-xs text-green-800">{info}</div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 max-w-md mx-auto rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">{error}</div>
        </motion.div>
      )}

      {step === 'result' && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-3">
          <div className="bg-white rounded-2xl border border-ilkal-gold/20 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full silk-gradient grid place-items-center text-white font-bold">
              {(result?.user?.user_name || 'C').trim()[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs opacity-70">Showing purchases for</div>
              <div className="font-serif text-lg text-ilkal-maroon truncate">
                {result?.user?.user_name || 'Customer'} • +91 {result?.user?.mobile_number}
              </div>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-2">
              <div className="text-xs font-semibold text-ilkal-maroon bg-ilkal-gold/20 border border-ilkal-gold/40 px-2.5 py-1 rounded-full">
                {orders.length} order{orders.length === 1 ? '' : 's'}
              </div>
              <button
                type="button"
                onClick={restart}
                className="text-[11px] text-ilkal-maroon font-semibold underline">
                Sign out
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-ilkal-gold/20">
              <Package className="w-10 h-10 mx-auto text-ilkal-maroon opacity-60" />
              <p className="mt-3 opacity-80">No purchases found on this number yet.</p>
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
      className="bg-white rounded-2xl border border-ilkal-gold/20 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
          isOpen ? 'bg-ilkal-cream/80' : 'hover:bg-ilkal-cream/40'
        }`}>
        <div className="w-10 h-10 rounded-xl silk-gradient grid place-items-center text-white shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ilkal-maroon truncate">{o.order_id}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              paid ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {paid && <CheckCircle2 className="w-3 h-3" />}
              {paid ? 'Paid' : (o.payment_status || 'Pending').toUpperCase()}
            </span>
          </div>
          <div className="mt-0.5 text-xs opacity-70 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {o.ordered_on
                ? new Date(o.ordered_on).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                : '—'}
            </span>
            <span>•</span>
            <span>{itemCount} saree{itemCount === 1 ? '' : 's'}</span>
            <span>•</span>
            <span className="text-ilkal-maroon font-semibold">
              {o.amount != null ? `₹${Number(o.amount).toLocaleString('en-IN')}` : '—'}
            </span>
          </div>
        </div>
        <div className="shrink-0 hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wide opacity-60">Status</span>
          <span className="text-xs font-semibold text-ilkal-maroon">{status}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 w-8 h-8 rounded-full bg-white border border-ilkal-gold/30 grid place-items-center text-ilkal-maroon shadow-sm">
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
            className="overflow-hidden border-t border-ilkal-gold/20 bg-gradient-to-b from-ilkal-cream/30 to-white">
            <motion.div
              initial={{ y: -8 }} animate={{ y: 0 }} exit={{ y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <DetailTile
                  icon={ReceiptText} label="Invoice" value={o.invoice_id || '—'}
                  extra={o.invoice_path ? (
                    <a href={uploadsUrl(o.invoice_path)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-ilkal-maroon font-semibold underline">
                      <Download className="w-3 h-3" /> Download PDF
                    </a>
                  ) : null}
                />
                <DetailTile
                  icon={Truck} label="Delivery"
                  value={o.delivery_status_name || 'Awaiting dispatch'}
                  extra={o.delivery_partner_name ? (
                    <span className="text-xs opacity-70">via {o.delivery_partner_name}</span>
                  ) : null}
                />
                <DetailTile
                  icon={IndianRupee} label="Amount Paid"
                  value={o.amount != null ? `₹${Number(o.amount).toLocaleString('en-IN')}` : '—'}
                  extra={<span className="text-xs opacity-70 inline-flex items-center gap-1">
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
                  <h4 className="text-[11px] uppercase tracking-wide opacity-70 mb-2">Sarees in this order</h4>
                  <ul className="rounded-xl border border-ilkal-gold/20 bg-white divide-y divide-ilkal-gold/15 overflow-hidden">
                    {o.items.map((it, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04 }}
                        className="px-3 py-2 text-sm flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-ilkal-maroon truncate">
                            {it.title || it.combined_code}
                          </div>
                          <div className="text-xs opacity-70 truncate">
                            {[it.color, it.material, it.combined_code].filter(Boolean).join(' • ')}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs font-semibold text-ilkal-maroon">×{it.quantity}</div>
                          {it.base_price != null && (
                            <div className="text-[10px] opacity-70">
                              ₹{Number(it.base_price).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2 text-[11px] italic text-yellow-900">
                📷 Disclaimer: A slight variation in the colour of the saree is possible due to natural lighting while taking the photo.
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
    <div className="rounded-xl border border-ilkal-gold/20 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-70">
        <Icon className="w-3.5 h-3.5 text-ilkal-gold" /> {label}
      </div>
      <div className="font-semibold text-ilkal-maroon mt-0.5">{value}</div>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}

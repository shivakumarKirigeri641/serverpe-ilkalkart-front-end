import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Lock, ShieldCheck, ChevronRight, MapPin, Tag, Sparkles, MessageSquare, CheckCircle2, AlertTriangle, ShoppingBag, Camera } from 'lucide-react';

import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import AddressPicker from '../components/AddressPicker.jsx';
import { useStatesUnions } from '../api/queries.js';
import { apiClient, API_BASE_URL } from '../utils/api.js';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const loadRazorpay = () => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') return reject(new Error('No window'));
  if (window.Razorpay) return resolve(window.Razorpay);
  const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
  if (existing) {
    existing.addEventListener('load', () => resolve(window.Razorpay));
    existing.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load')));
    return;
  }
  const s = document.createElement('script');
  s.src = RAZORPAY_SCRIPT_SRC;
  s.async = true;
  s.onload = () => resolve(window.Razorpay);
  s.onerror = () => reject(new Error('Razorpay SDK failed to load'));
  document.body.appendChild(s);
});

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><rect width="80" height="96" fill="%23FFF8F0"/><text x="50%" y="50%" font-family="Poppins,sans-serif" font-size="10" fill="%237B1E3A" text-anchor="middle" dominant-baseline="middle">Saree</text></svg>';

export default function Checkout() {
  const nav = useNavigate();
  const {
    items, inc, dec, remove, subtotal, payable, baseAmount, gstAmount, gstRate, gstPercent, gstDescription, clear,
    count, bulkEligible, bulkDiscount, bulkMinQty, bulkDiscountRate,
    offer, offerPercent, offerDiscount
  } = useCart();

  const clearBag = () => {
    if (items.length === 0) return;
    if (window.confirm(`Remove all ${count} saree${count === 1 ? '' : 's'} from your bag?`)) {
      clear();
      toast.success('Bag cleared');
    }
  };

  const [contact, setContact] = useState({ name: '', mobile: '', email: '' });
  const [addr, setAddr] = useState({ id: null, houseNo: '', line1: '', line2: '', area: '', landmark: '', city: '', district: '', state: '', pin: '', lat: null, lng: null, display: '' });
  const [paying, setPaying] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const statesQuery = useStatesUnions();
  const stateOptions = statesQuery.data || [];

  // Existing-address lookup: on a complete 10-digit mobile we ask the API whether this user
  // already has saved addresses, then offer the user a chance to pick one instead of re-typing.
  const [lookupMobile, setLookupMobile] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [addrChoice, setAddrChoice] = useState('new');

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Any change to the mobile number invalidates a prior OTP session.
  useEffect(() => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
  }, [contact.mobile]);

  // When a valid 10-digit mobile is entered, look up saved addresses for this user.
  useEffect(() => {
    const m = contact.mobile;
    if (!/^[6-9]\d{9}$/.test(m)) return;
    if (m === lookupMobile) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.post('/addresses', { mobile_number: m });
        if (cancelled) return;
        const body = res.data;
        if (!body?.successstatus) return;
        const user = body.data?.user_details || null;
        const list = Array.isArray(body.data?.user_addresses) ? body.data.user_addresses : [];
        setExistingUser(user && user.id ? user : null);
        setExistingAddresses(list);
        setLookupMobile(m);
        if (list.length > 0) {
          setAddrChoice(String(list[0].id));
          setAddrDialogOpen(true);
        }
      } catch {
        /* silent — lookup is a convenience, not a blocker */
      }
    })();
    return () => { cancelled = true; };
  }, [contact.mobile, lookupMobile]);

  const applyAddressChoice = () => {
    if (addrChoice === 'new') {
      setAddr(a => ({ ...a, id: null }));
      setAddrDialogOpen(false);
      return;
    }
    const picked = existingAddresses.find(a => String(a.id) === String(addrChoice));
    if (!picked) { setAddrDialogOpen(false); return; }
    if (existingUser) {
      setContact(c => ({
        ...c,
        name: existingUser.user_name || c.name,
        mobile: existingUser.mobile_number || c.mobile,
        email: existingUser.email || c.email,
      }));
    }
    setAddr(a => ({
      ...a,
      id: picked.id,
      houseNo: picked.house_flat_no || '',
      line1: picked.address_line1 || '',
      line2: picked.address_line2 || '',
      area: picked.area || '',
      landmark: picked.landmark || '',
      city: picked.city || '',
      district: picked.district || '',
      state: picked.state_union_id ? String(picked.state_union_id) : '',
      pin: picked.pincode || '',
      display: typeof picked.map_location === 'string' ? picked.map_location : (a.display || ''),
      lat: null,
      lng: null,
    }));
    setAddrDialogOpen(false);
  };

  const selectedState = stateOptions.find(o => String(o.id) === String(addr.state)) || null;

  const buildAddressPayload = () => {
    const hasCoords = Number.isFinite(Number(addr.lat)) && Number.isFinite(Number(addr.lng));
    const mapText = hasCoords
      ? `${Number(addr.lat)},${Number(addr.lng)}${addr.display ? ` (${addr.display})` : ''}`
      : (addr.display || null);
    return {
      id: addr.id || null,
      state_union_id: addr.state ? Number(addr.state) : null,
      house_flat_no: addr.houseNo,
      address_line1: addr.line1,
      address_line2: addr.line2 || null,
      area: addr.area || null,
      landmark: addr.landmark || null,
      pincode: addr.pin,
      city: addr.city,
      district: addr.district,
      map_location: mapText,
    };
  };

  const sendOtp = async () => {
    if (!valid) { setShowErrors(true); toast.error('Please complete the highlighted fields'); return; }
    setSendingOtp(true);
    try {
      const res = await apiClient.post('/send-otp', { mobile_number: contact.mobile });
      const body = res.data;
      if (!body?.successstatus) throw new Error(body?.message || 'Could not send OTP');
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      toast.success(`OTP sent to ${contact.mobile}`);
    } catch (e) {
      toast.error(e?.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{4}$/.test(otp)) { toast.error('Enter the 4-digit OTP sent to your mobile'); return; }
    if (!valid) { setShowErrors(true); toast.error('Please complete the highlighted fields'); return; }
    setVerifyingOtp(true);
    try {
      const res = await apiClient.post('/verify-otp', {
        mobile_number: contact.mobile,
        otp,
        user_name: contact.name.trim(),
        email: contact.email?.trim() || null,
        address: buildAddressPayload(),
      });
      const body = res.data;
      if (!body?.successstatus) {
        setOtpVerified(false);
        toast.error(body?.message || 'Invalid OTP');
        return;
      }
      const persistedAddrId = body?.data?.user_address?.id;
      if (persistedAddrId) {
        setAddr(a => ({ ...a, id: persistedAddrId }));
      }
      setOtpVerified(true);
      toast.success('Mobile verified');
    } catch (e) {
      setOtpVerified(false);
      toast.error(e?.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const shipping = 0;
  const total = payable + shipping;

  const [showErrors, setShowErrors] = useState(false);

  const fieldErrors = {
    name: contact.name.trim().length <= 1,
    mobile: !/^[6-9]\d{9}$/.test(contact.mobile),
    houseNo: !addr.houseNo.trim(),
    line1: !addr.line1.trim(),
    city: !addr.city.trim(),
    district: !addr.district.trim(),
    state: !addr.state,
    pin: !/^\d{6}$/.test(addr.pin),
  };
  const valid = !Object.values(fieldErrors).some(Boolean) && items.length > 0;
  const showErr = (k) => showErrors && fieldErrors[k];

  const inFlightRef = useRef(null);
  const reportFailure = async (reason, extra = {}) => {
    const ref = inFlightRef.current;
    if (!ref) return;
    try {
      await apiClient.post('/payment-failure', {
        razorpay_order_id: ref.razorpay_order_id,
        mobile_number: contact.mobile,
        amount: ref.amount,
        currency: ref.currency,
        reason,
        source: 'client',
        ...extra,
      });
    } catch { /* best-effort */ }
  };
  const reportFailureBeacon = (reason) => {
    const ref = inFlightRef.current;
    if (!ref) return;
    try {
      const blob = new Blob([JSON.stringify({
        razorpay_order_id: ref.razorpay_order_id,
        mobile_number: contact.mobile,
        amount: ref.amount,
        currency: ref.currency,
        reason,
        source: 'beacon',
      })], { type: 'text/plain' });
      navigator.sendBeacon(`${API_BASE_URL}/ik/customer/payment-failure`, blob);
    } catch { /* best-effort */ }
  };
  useEffect(() => {
    const onUnload = () => {
      if (inFlightRef.current) reportFailureBeacon('browser_close');
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
    };
  }, []);

  const payNow = async () => {
    if (!valid) { setShowErrors(true); toast.error('Please complete the highlighted fields'); return; }
    if (!otpVerified) { toast.error('Verify mobile OTP to continue'); return; }

    setPaying(true);
    try {
      const Razorpay = await loadRazorpay();

      // 1) Create the order on the back-end (which talks to Razorpay).
      const createRes = await apiClient.post('/create-order', {
        amount: total,
        currency: 'INR',
        user_name: contact.name.trim(),
        mobile_number: contact.mobile,
        address_id: addr.id || null,
        email: contact.email || null,
      });
      const createBody = createRes.data;
      if (!createBody?.successstatus) {
        throw new Error(createBody?.message || 'Could not create order');
      }
      const { order_id, amount: amountInPaise, currency, key_id, user_id } = createBody.data || {};
      if (!order_id || !key_id) throw new Error('Invalid order response from server');

      inFlightRef.current = {
        razorpay_order_id: order_id,
        amount: total,
        currency: currency || 'INR',
      };

      await new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: key_id,
          amount: amountInPaise,
          currency: currency || 'INR',
          order_id,
          name: 'Ilkal Kart',
          description: `Order of ${count} saree${count === 1 ? '' : 's'}`,
          prefill: {
            name: contact.name,
            email: contact.email || undefined,
            contact: contact.mobile,
          },
          notes: { combined_codes: items.map((i) => i.code).join(',') },
          theme: { color: '#7B1E3A' },
          modal: {
            ondismiss: () => {
              reportFailure('user_cancelled');
              reject(new Error('Payment cancelled'));
            },
          },
          handler: async (rzpResponse) => {
            try {
              const verifyRes = await apiClient.post('/verify-payment', {
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                mobile_number: contact.mobile,
                amount: total,
                price_per_set: baseAmount,
                gst_percentage: gstPercent,
              });
              const verifyBody = verifyRes.data;
              if (!verifyBody?.successstatus) {
                await reportFailure('verify_failed', {
                  razorpay_payment_id: rzpResponse.razorpay_payment_id,
                });
                reject(new Error(verifyBody?.message || 'Payment verification failed'));
                return;
              }

              inFlightRef.current = null;
              localStorage.setItem('ilkal_last_order', JSON.stringify(verifyBody.data));
              try {
                const prev = JSON.parse(localStorage.getItem('ilkal_orders')) || [];
                localStorage.setItem('ilkal_orders', JSON.stringify([verifyBody.data, ...prev]));
              } catch {
                localStorage.setItem('ilkal_orders', JSON.stringify([verifyBody.data]));
              }
              const orderRef =
                verifyBody.data?.order_details?.order_id ||
                rzpResponse.razorpay_order_id;
              sessionStorage.setItem('ilkal_confirmation_token', String(orderRef || 'ok'));
              clear();
              toast.success('Payment successful');
              nav('/confirmation', { replace: true });
              resolve();
            } catch (err) {
              await reportFailure('verify_exception');
              reject(err);
            }
          },
        });
        rzp.on('payment.failed', (resp) => {
          reportFailure('payment_failed', {
            razorpay_payment_id: resp?.error?.metadata?.payment_id || null,
            method: resp?.error?.source || null,
          });
          reject(new Error(resp?.error?.description || 'Payment failed'));
        });
        rzp.open();
      });
    } catch (err) {
      if (err?.message !== 'Payment cancelled') {
        toast.error(err?.message || 'Payment could not be completed');
      }
    } finally {
      inFlightRef.current = null;
      setPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6">
        <span className="w-20 h-20 mx-auto rounded-full bg-stone-100 grid place-items-center">
          <ShoppingBag className="w-9 h-9 text-stone-400" />
        </span>
        <h2 className="mt-6 font-display font-extrabold tracking-display text-3xl text-stone-900">Your bag is empty.</h2>
        <p className="mt-2 text-stone-500">Discover sarees woven with love.</p>
        <Link to="/browse" className="btn-primary mt-7 inline-flex">Start browsing sarees <ChevronRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  const bulkPct = Math.min(100, Math.round((count / bulkMinQty) * 100));
  const bulkLeft = Math.max(0, bulkMinQty - count);
  const bulkRate = (bulkDiscountRate * 100).toFixed(0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ============================================================
          CHECKOUT HEADER — dark panel: title, order snapshot, step rail
         ============================================================ */}
      <div className="rounded-4xl bg-stone-900 text-stone-50 p-7 sm:p-9 shadow-card-hover overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <span className="eyebrow !text-stone-400 before:!bg-wood">Almost yours</span>
            <h1 className="mt-3 font-display font-extrabold tracking-display text-5xl sm:text-6xl text-stone-50 leading-[0.9]">Checkout.</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span><b className="text-stone-50">No login, no signup.</b> Fill, pay, and it ships to your door.</span>
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-5 py-4 text-center shrink-0">
            <div className="font-display font-extrabold tracking-display text-4xl leading-none text-wood">{count}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">in your bag</div>
          </div>
        </div>

        {/* step rail on a track */}
        <ol className="mt-8 relative grid grid-cols-6 gap-1">
          <span className="absolute top-3 left-[8.33%] right-[8.33%] h-0.5 bg-stone-700" aria-hidden />
          {['Shortlist', 'Add to cart', 'Fill details', 'Pay', 'Done', 'Doorstep'].map((s, i) => {
            const done = i < 2;
            const here = i === 2;
            return (
              <li key={s} className="relative flex flex-col items-center text-center">
                <span className={`grid place-items-center w-6 h-6 rounded-full ring-4 ring-stone-900 text-[10px] font-bold transition-colors ${
                  here ? 'bg-wood text-stone-900' : done ? 'bg-stone-50 text-stone-900' : 'bg-stone-700 text-stone-400'
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className={`mt-2.5 text-[10px] sm:text-xs font-medium leading-tight ${here ? 'text-stone-50' : 'text-stone-500'}`}>{s}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* bulk discount progress meter */}
        {bulkEligible ? (
          <div className="rounded-4xl bg-stone-900 text-stone-50 px-6 py-5 flex items-center gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-wood text-stone-900 shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="font-display font-bold tracking-display text-lg">Bulk discount unlocked!</div>
              <p className="text-sm text-stone-400">Flat {bulkRate}% off — ₹{bulkDiscount.toLocaleString('en-IN')} saved, applied below.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-4xl bg-white border border-stone-200 shadow-card px-6 py-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-wood-dark" />
                <span className="text-sm text-stone-600">
                  <b className="text-stone-900">{bulkLeft} more</b> to unlock a flat <b className="text-stone-900">{bulkRate}% off</b>
                </span>
              </div>
              <Link to="/bulk" className="text-xs text-wood-dark font-semibold underline underline-offset-2 shrink-0">How it works</Link>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full bg-stone-900 transition-all duration-500" style={{ width: `${bulkPct}%` }} />
            </div>
            <div className="mt-2 flex justify-between">
              {Array.from({ length: bulkMinQty }).map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < count ? 'bg-stone-900' : 'bg-stone-200'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Sarees */}
        <Section
          title="Your Sarees"
          action={
            <button
              onClick={clearBag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-stone-200 text-stone-600 text-xs font-medium hover:border-stone-900 hover:text-stone-900 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear bag
            </button>
          }
        >
          <div className="space-y-4">
            {items.map(it => {
              const specs = [
                ['Colour', it.color], ['Material', it.material], ['Border', it.border],
                ['Pallu', it.pallu], ['Blouse', it.blouse],
              ].filter(([, v]) => v);
              return (
              <div key={it.id} className="flex flex-col sm:flex-row gap-4 rounded-4xl p-3.5 border border-stone-200 bg-stone-50">
                {/* image bay */}
                <div className="relative w-full sm:w-28 shrink-0">
                  <img
                    src={it.images?.[0] || it.gallery?.[0]?.src || PLACEHOLDER_IMG}
                    alt={it.name}
                    className="w-full h-44 sm:h-full sm:aspect-[3/4] rounded-2xl object-cover bg-stone-100" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-stone-50 bg-stone-900/85 backdrop-blur px-2 py-0.5 rounded-full tabular-nums">
                    ID {it.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold tracking-display text-lg text-stone-900 leading-tight">{it.name}</h3>
                      {it.isHandloom && (
                        <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-wood-dark bg-wood/10 px-2 py-0.5 rounded-full">Pure handloom</span>
                      )}
                    </div>
                    <button onClick={() => remove(it.id)} aria-label="Remove" className="grid place-items-center w-8 h-8 rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* spec chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {specs.map(([k, v]) => (
                      <span key={k} className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[11px]">
                        <span className="text-stone-400">{k}</span>
                        <span className="font-medium text-stone-700">{v}</span>
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border-2 border-stone-900 p-0.5">
                      <button onClick={() => dec(it.id)} className="w-7 h-7 rounded-full bg-stone-900 text-stone-50 grid place-items-center active:scale-90 transition"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="font-bold text-stone-900 w-6 text-center text-sm tabular-nums">{it.qty}</span>
                      <button onClick={() => inc(it.id)} disabled={it.qty >= 5} className="w-7 h-7 rounded-full bg-stone-900 text-stone-50 grid place-items-center active:scale-90 disabled:opacity-30 transition"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-lg text-stone-900 tabular-nums">₹{(it.qty * it.price).toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-stone-400 tabular-nums">₹{it.price.toLocaleString('en-IN')} × {it.qty}</div>
                    </div>
                  </div>
                </div>
              </div>
            );})}
          </div>
          <p className="mt-3 text-[11px] text-stone-400 flex items-start gap-1.5">
            <Camera className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            A slight variation in the colour of the saree is possible due to natural lighting while taking the photo.
          </p>
        </Section>

        {/* Contact */}
        <Section title="Contact Details">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Full Name *" value={contact.name}
              onChange={v => setContact({ ...contact, name: v })}
              invalid={showErr('name')}
              errorText="Please enter your full name" />
            <div>
              <Input label="WhatsApp Mobile *" value={contact.mobile} maxLength={10} inputMode="numeric"
                onChange={v => setContact({ ...contact, mobile: v.replace(/\D/g, '') })}
                invalid={showErr('mobile')}
                errorText="Enter a valid 10-digit WhatsApp number starting 6-9" />
              <p className="mt-1.5 text-[11px] leading-snug inline-flex items-start gap-1.5 text-green-800 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 w-full">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mt-0.5 shrink-0 fill-green-600"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.02 0C5.4 0 .02 5.38.02 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0 0 12.02 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.21-3.5-8.52ZM12.02 21.8a9.8 9.8 0 0 1-5-1.37l-.36-.22-3.66.96.98-3.57-.23-.37A9.79 9.79 0 1 1 21.82 12a9.78 9.78 0 0 1-9.8 9.8Zm5.62-7.34c-.31-.16-1.83-.9-2.11-1-.28-.1-.49-.16-.7.15-.21.31-.8 1-.98 1.21-.18.2-.36.23-.67.07-.31-.16-1.31-.48-2.5-1.55-.92-.82-1.55-1.83-1.73-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.51.1-.21.05-.39-.03-.54-.08-.16-.7-1.68-.96-2.3-.25-.6-.51-.52-.7-.53l-.6-.01c-.21 0-.54.08-.83.39-.28.31-1.08 1.06-1.08 2.58 0 1.51 1.11 2.98 1.26 3.18.16.21 2.18 3.32 5.28 4.66.74.32 1.32.51 1.77.66.74.23 1.41.2 1.94.12.59-.09 1.83-.74 2.09-1.46.26-.72.26-1.34.18-1.46-.08-.13-.28-.21-.59-.36Z"/></svg>
                <span>
                  <b>Please share your WhatsApp number.</b> I personally send photos &amp; video of your saree
                  (before packing) and live delivery updates here. If you've ordered before, your address auto-fills.
                </span>
              </p>
            </div>
            <Input className="sm:col-span-2" label="Email (optional)" type="email" value={contact.email}
              onChange={v => setContact({ ...contact, email: v })} />
          </div>
        </Section>

        {/* Address */}
        <Section title="Shipping Address">
          <div className="mb-3 flex items-center gap-2 text-xs text-stone-600 bg-stone-100 rounded-2xl px-3.5 py-2.5">
            <MapPin className="w-4 h-4 shrink-0 text-wood-dark" />
            <span>Pin your location on the map — area, city, district, state &amp; PIN fill automatically.</span>
          </div>
          <AddressPicker value={addr} stateOptions={stateOptions} onChange={v => setAddr(a => ({ ...a, ...v }))} />

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Input label="Flat / House No. *" value={addr.houseNo}
              onChange={v => setAddr({ ...addr, houseNo: v })} placeholder="e.g. #12, B-204"
              invalid={showErr('houseNo')} errorText="House / flat number is required" />
            <Input label="Street / Road *" value={addr.line1}
              onChange={v => setAddr({ ...addr, line1: v })} placeholder="e.g. MG Road"
              invalid={showErr('line1')} errorText="Street / road is required" />
            <Input className="sm:col-span-2" label="Address Line 2" value={addr.line2}
              onChange={v => setAddr({ ...addr, line2: v })} placeholder="Apartment, suite, building (optional)" />
            <Input label="Area / Locality" value={addr.area}
              onChange={v => setAddr({ ...addr, area: v })} placeholder="e.g. Indiranagar" />
            <Input label="Landmark" value={addr.landmark}
              onChange={v => setAddr({ ...addr, landmark: v })} placeholder="e.g. Near City Mall" />
            <Input label="City *" value={addr.city}
              onChange={v => setAddr({ ...addr, city: v })}
              invalid={showErr('city')} errorText="City is required" />
            <Input label="District *" value={addr.district}
              onChange={v => setAddr({ ...addr, district: v })}
              invalid={showErr('district')} errorText="District is required" />
            <Select label="State / Union Territory *" value={addr.state}
              onChange={v => setAddr({ ...addr, state: v })}
              options={stateOptions}
              invalid={showErr('state')} errorText="Please select your state / UT" />
            <Input label="PIN code *" value={addr.pin} maxLength={6} inputMode="numeric"
              onChange={v => setAddr({ ...addr, pin: v.replace(/\D/g, '') })}
              invalid={showErr('pin')} errorText="Enter a valid 6-digit PIN code" />
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900 flex items-start gap-2.5 leading-snug">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>
              <b>Please re-check your address.</b> Confirm the house number, street, city, state and PIN are
              correct — even small mistakes can delay or misroute delivery. We ship exactly to the address shown.
            </span>
          </div>
        </Section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-20 h-fit">
        <Section title="Order Summary">
          <Row label="Sub-total (incl. GST)" value={`₹${subtotal.toLocaleString('en-IN')}`} />
          {bulkEligible && (
            <Row
              label={`Bulk discount (${(bulkDiscountRate * 100).toFixed(0)}% • ${count} sarees)`}
              value={`− ₹${bulkDiscount.toLocaleString('en-IN')}`}
              highlight
            />
          )}
          {offerPercent > 0 && (
            <Row
              label={`Offer: ${offer?.title || 'Special offer'} (${offerPercent}% off)`}
              value={`− ₹${offerDiscount.toLocaleString('en-IN')}`}
              highlight
            />
          )}
          <Row label="Item value (excl. GST)" value={`₹${baseAmount.toLocaleString('en-IN')}`} />
          {(() => {
            const isKarnataka = /karnataka/i.test(selectedState?.name || '');
            const halfPct = gstPercent / 2;
            const fmtPct = (p) => (Number.isInteger(p) ? `${p}` : p.toFixed(1));
            const halfAmt = +(gstAmount / 2).toFixed(2);
            return isKarnataka ? (
              <>
                <Row label={`CGST (${fmtPct(halfPct)}%)`} value={`₹${halfAmt.toLocaleString('en-IN')}`} />
                <Row label={`SGST (${fmtPct(halfPct)}%)`} value={`₹${halfAmt.toLocaleString('en-IN')}`} />
              </>
            ) : (
              <Row label={`GST (${fmtPct(gstPercent)}%)`} value={`₹${gstAmount.toLocaleString('en-IN')}`} />
            );
          })()}
          {gstDescription && (
            <p className="text-[10px] opacity-60 leading-snug -mt-0.5 mb-1">{gstDescription}</p>
          )}
          <Row label="Shipping" value={shipping ? `₹${shipping}` : 'FREE'} highlight={!shipping} />
          <div className="my-3 border-t border-dashed border-stone-200" />
          <Row label="Total payable" value={`₹${total.toLocaleString('en-IN')}`} bold />
          <p className="mt-2 text-xs text-stone-400">All prices are inclusive of GST. You won’t be charged anything extra.</p>

          <p className="mt-3 text-[11px] text-stone-500 leading-snug flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-wood-dark mt-0.5 shrink-0" />
            Pay only via the secure button below. We never ask for UPI to personal numbers or extra fees.
          </p>

          <div className="mt-5">
            {!otpVerified ? (
              <div className="rounded-4xl border border-stone-200 bg-stone-100 p-5 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-display font-bold tracking-display text-stone-900">
                    <MessageSquare className="w-4 h-4 shrink-0 text-wood-dark" />
                    <span>Verify mobile to continue</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-stone-500 leading-snug">
                    We&apos;ll send a 4-digit OTP to <b className="text-stone-700">{contact.mobile || '— —'}</b> to confirm your order.
                  </p>
                  <p className="mt-1 text-[11px] text-stone-500 leading-snug">
                    🔒 SMS only from <span className="font-mono text-stone-700">*-SRVRPE-*</span>.
                  </p>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={!valid || sendingOtp}
                    className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                    {sendingOtp ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      <><MessageSquare className="w-4 h-4" /> Get OTP</>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-stretch gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && otp.length === 4 && !verifyingOtp) {
                            e.preventDefault();
                            verifyOtp();
                          }
                        }}
                        placeholder="••••"
                        className="flex-1 min-w-0 h-12 px-3 rounded-full bg-white border-2 border-stone-200 focus:border-stone-900 focus:outline-none text-center tracking-[0.5em] font-bold text-lg text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 4 || verifyingOtp}
                        className="h-12 px-6 rounded-full bg-stone-900 text-stone-50 font-medium text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95">
                        {verifyingOtp ? '…' : 'Verify'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">Didn&apos;t get the code?</span>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={sendingOtp}
                        className="text-wood-dark font-medium underline underline-offset-2 disabled:opacity-50">
                        Resend OTP
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      🚨 OTP only from <span className="font-mono text-stone-700">*-SRVRPE-*</span>. Never share on a call.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mobile <b>{contact.mobile}</b> verified</span>
              </div>
            )}
          </div>

          {/* Terms & Conditions consent — required before payment */}
          <div className={`mt-3 rounded-2xl border-2 p-3.5 transition ${
            showTermsError && !agreedTerms
              ? 'border-rose-300 bg-rose-50'
              : agreedTerms
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-stone-200 bg-stone-50'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => { setAgreedTerms(e.target.checked); if (e.target.checked) setShowTermsError(false); }}
                className="mt-0.5 w-4 h-4 shrink-0 accent-stone-900 cursor-pointer"
              />
              <span className="text-[11px] leading-snug text-stone-600">
                I agree to the <b className="text-stone-900">Terms</b>, the{' '}
                <b className="text-stone-900">no-return policy</b> and accept all liabilities thereof.
              </span>
            </label>
            {showTermsError && !agreedTerms && (
              <p className="mt-2 text-[11px] font-semibold text-rose-700 pl-6.5">
                Please tick the box to agree before paying.
              </p>
            )}
          </div>

          <button
            disabled={!valid || !otpVerified || paying}
            onClick={() => {
              if (!agreedTerms) { setShowTermsError(true); toast.error('Please agree to the Terms & Conditions to continue'); return; }
              payNow();
            }}
            className="btn-primary w-full mt-3 disabled:opacity-60 disabled:cursor-not-allowed">
            {paying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <><Lock className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')}</>
            )}
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Demo payment — no real charge
          </div>
        </Section>
      </aside>
      </div>

      {addrDialogOpen && (
        <AddressChoiceDialog
          user={existingUser}
          addresses={existingAddresses}
          stateOptions={stateOptions}
          value={addrChoice}
          onChange={setAddrChoice}
          onApply={applyAddressChoice}
          onClose={() => setAddrDialogOpen(false)}
        />
      )}
    </div>
  );
}

function AddressChoiceDialog({ user, addresses, stateOptions, value, onChange, onApply, onClose }) {
  const stateName = (id) => stateOptions.find(o => String(o.id) === String(id))?.name || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-4xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-card-hover border border-stone-200 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-stone-200">
          <span className="eyebrow">Welcome back</span>
          <h3 className="mt-2 font-display font-extrabold tracking-display text-xl text-stone-900">{user?.user_name ? user.user_name : 'Your saved addresses'}</h3>
          <p className="text-xs text-stone-400 mt-1">Choose a saved address or enter a new one.</p>
        </div>
        <div className="px-6 py-4 overflow-y-auto space-y-2.5">
          {addresses.map(a => {
            const on = String(value) === String(a.id);
            return (
            <label key={a.id} className={`flex items-start gap-3 p-4 rounded-4xl border-2 cursor-pointer transition-colors ${on ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
              <span className={`mt-0.5 grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 ${on ? 'border-stone-900 bg-stone-900' : 'border-stone-300'}`}>
                {on && <span className="w-2 h-2 rounded-full bg-stone-50" />}
              </span>
              <input type="radio" name="addr-choice" className="sr-only" value={a.id} checked={on} onChange={() => onChange(String(a.id))} />
              <div className="text-sm leading-snug">
                <div className="font-display font-bold tracking-display text-stone-900">
                  {[a.house_flat_no, a.address_line1].filter(Boolean).join(', ')}
                </div>
                <div className="text-stone-500">{[a.address_line2, a.area, a.landmark].filter(Boolean).join(', ')}</div>
                <div className="text-stone-500">{[a.city, a.district, stateName(a.state_union_id), a.pincode].filter(Boolean).join(', ')}</div>
              </div>
            </label>
          );})}
          <label className={`flex items-center gap-3 p-4 rounded-4xl border-2 cursor-pointer transition-colors ${value === 'new' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
            <span className={`grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 ${value === 'new' ? 'border-stone-900 bg-stone-900' : 'border-stone-300'}`}>
              {value === 'new' && <span className="w-2 h-2 rounded-full bg-stone-50" />}
            </span>
            <input type="radio" name="addr-choice" value="new" className="sr-only" checked={value === 'new'} onChange={() => onChange('new')} />
            <span className="text-sm font-display font-bold tracking-display text-stone-900">Enter a new address</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-2.5">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-full border-2 border-stone-200 text-stone-600 text-sm font-medium hover:border-stone-900 hover:text-stone-900 transition">Cancel</button>
          <button type="button" onClick={onApply}
            className="btn-primary !py-2.5 !px-5 text-sm">Continue</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section className="bg-white rounded-4xl p-6 sm:p-7 shadow-card border border-stone-200">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-extrabold tracking-display text-xl text-stone-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Input({ label, value, onChange, type = 'text', className = '', invalid = false, errorText, ...rest }) {
  const borderCls = invalid
    ? 'border-rose-400 focus:border-rose-500'
    : 'border-stone-200 focus:border-stone-900';
  return (
    <label className={`block ${className}`}>
      <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${invalid ? 'text-rose-600' : 'text-stone-400'}`}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} {...rest}
        className={`mt-1.5 w-full px-4 py-3 rounded-full bg-stone-50 border-2 text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors ${borderCls}`} />
      {invalid && errorText && (
        <span className="mt-1.5 block text-[11px] text-rose-600">{errorText}</span>
      )}
    </label>
  );
}
function Select({ label, value, onChange, options, className = '', invalid = false, errorText }) {
  const borderCls = invalid
    ? 'border-rose-400 focus:border-rose-500'
    : 'border-stone-200 focus:border-stone-900';
  return (
    <label className={`block ${className}`}>
      <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${invalid ? 'text-rose-600' : 'text-stone-400'}`}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`mt-1.5 w-full px-4 py-3 rounded-full bg-stone-50 border-2 text-stone-900 focus:outline-none transition-colors ${borderCls}`}>
        <option value="">Select state / UT…</option>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.id;
          const lab = typeof o === 'string' ? o : `${o.name}${o.isUnionTerritory ? ' (UT)' : ''}`;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
      {invalid && errorText && (
        <span className="mt-1.5 block text-[11px] text-rose-600">{errorText}</span>
      )}
    </label>
  );
}
function Row({ label, value, bold, highlight }) {
  return (
    <div className={`flex justify-between py-1.5 ${bold ? 'font-display font-extrabold tracking-display text-xl text-stone-900' : 'text-sm'}`}>
      <span className={bold ? '' : 'text-stone-500'}>{label}</span>
      <span className={highlight ? 'text-emerald-600 font-semibold' : (bold ? '' : 'text-stone-900 font-medium tabular-nums')}>{value}</span>
    </div>
  );
}

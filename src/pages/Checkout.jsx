import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Lock, ShieldCheck, ChevronRight, MapPin, Tag, Sparkles, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    if (!/^\d{4,6}$/.test(otp)) { toast.error('Enter the OTP sent to your mobile'); return; }
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
        <div className="text-7xl">🛍️</div>
        <h2 className="font-serif text-2xl text-ilkal-maroon mt-3">Your bag is empty</h2>
        <p className="opacity-70 mt-2">Discover sarees woven with love.</p>
        <Link to="/browse" className="btn-primary mt-6 inline-flex">Start Browsing Sarees <ChevronRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
          <span>
            <b>No signup required.</b> Just fill in your delivery details below and pay — your saree
            will be hand-packed and dispatched straight to your doorstep.
          </span>
        </div>

        {bulkEligible ? (
          <div className="bg-ilkal-maroon/5 border border-ilkal-maroon/20 rounded-2xl px-4 py-3 text-sm text-ilkal-maroon flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-ilkal-gold mt-0.5 shrink-0" />
            <span>
              <b>Bulk-order discount unlocked!</b> {count} sarees in your bag — a flat{' '}
              {(bulkDiscountRate * 100).toFixed(0)}% off (₹{bulkDiscount.toLocaleString('en-IN')}) has been applied below.
            </span>
          </div>
        ) : (
          <div className="bg-ilkal-cream border border-ilkal-gold/30 rounded-2xl px-4 py-3 text-sm text-ilkal-deep flex items-start gap-2">
            <Tag className="w-4 h-4 text-ilkal-maroon mt-0.5 shrink-0" />
            <span>
              Order <b>{bulkMinQty}+ sarees</b> in one go and unlock a flat{' '}
              <b>{(bulkDiscountRate * 100).toFixed(0)}% bulk discount</b> on your total —{' '}
              <Link to="/bulk" className="text-ilkal-maroon font-semibold underline">see how it works</Link>.
              (Currently {count} in bag.)
            </span>
          </div>
        )}

        {/* Sarees */}
        <Section
          title="Your Sarees"
          action={
            <button
              onClick={clearBag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-ilkal-maroon/30 text-ilkal-maroon text-xs font-semibold hover:bg-ilkal-maroon/5 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear bag
            </button>
          }
        >
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-ilkal-gold/20">
                <img
                  src={it.images?.[0] || it.gallery?.[0]?.src || PLACEHOLDER_IMG}
                  alt={it.name}
                  className="w-20 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-semibold text-ilkal-maroon truncate">{it.name}</h3>
                      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] leading-tight">
                        {it.color && (<><dt className="opacity-60">Color</dt><dd className="text-ilkal-deep font-medium truncate">{it.color}</dd></>)}
                        {it.material && (<><dt className="opacity-60">Material</dt><dd className="text-ilkal-deep font-medium truncate">{it.material}</dd></>)}
                        {it.border && (<><dt className="opacity-60">Border</dt><dd className="text-ilkal-deep font-medium truncate">{it.border}</dd></>)}
                        {it.pallu && (<><dt className="opacity-60">Pallu</dt><dd className="text-ilkal-deep font-medium truncate">{it.pallu}</dd></>)}
                        {it.blouse && (<><dt className="opacity-60">Blouse</dt><dd className="text-ilkal-deep font-medium truncate">{it.blouse}</dd></>)}
                      </dl>
                      {it.isHandloom && (
                        <span className="mt-1 inline-block chip text-[10px]">Handloom</span>
                      )}
                    </div>
                    <button onClick={() => remove(it.id)} className="text-ilkal-maroon/70 hover:text-ilkal-maroon">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-ilkal-cream rounded-full border border-ilkal-gold/40 p-0.5">
                      <button onClick={() => dec(it.id)} className="w-8 h-8 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="font-bold text-ilkal-maroon w-6 text-center">{it.qty}</span>
                      <button onClick={() => inc(it.id)} disabled={it.qty >= 5} className="w-8 h-8 rounded-full bg-white shadow grid place-items-center text-ilkal-maroon disabled:opacity-40"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-ilkal-maroon">₹{(it.qty * it.price).toLocaleString('en-IN')}</div>
                      <div className="text-xs opacity-60">₹{it.price.toLocaleString('en-IN')} × {it.qty}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Details">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Full Name *" value={contact.name}
              onChange={v => setContact({ ...contact, name: v })}
              invalid={showErr('name')}
              errorText="Please enter your full name" />
            <div>
              <Input label="Mobile *" value={contact.mobile} maxLength={10} inputMode="numeric"
                onChange={v => setContact({ ...contact, mobile: v.replace(/\D/g, '') })}
                invalid={showErr('mobile')}
                errorText="Enter a valid 10-digit mobile starting 6-9" />
              <p className="mt-1 text-[11px] opacity-70 leading-snug">
                Once your mobile number is entered, if you've previously ordered with us your
                saved address will be auto-filled.
              </p>
            </div>
            <Input className="sm:col-span-2" label="Email (optional)" type="email" value={contact.email}
              onChange={v => setContact({ ...contact, email: v })} />
          </div>
        </Section>

        {/* Address */}
        <Section title="Shipping Address">
          <div className="mb-3 flex items-center gap-2 text-xs text-ilkal-maroon bg-ilkal-cream rounded-xl px-3 py-2 border border-ilkal-gold/30">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Pin your location on the map — area, city, district, state & PIN will be filled automatically.</span>
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

          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900 flex items-start gap-2 leading-snug">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>
              <b>Please re-check your address.</b> If you pinned your location on the map above, confirm the
              house number, street, city, state and PIN are correct — even small mistakes can delay or
              misroute your delivery. We ship exactly to the address shown here.
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
          <div className="my-2 border-t border-dashed border-ilkal-gold/40" />
          <Row label="Total Payable" value={`₹${total.toLocaleString('en-IN')}`} bold />
          <p className="mt-2 text-xs opacity-70">All prices are inclusive of GST. You won’t be charged anything extra.</p>

          <div className="mt-5">
            {!otpVerified ? (
              <div className="rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ilkal-maroon">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Verify mobile to continue</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-70 leading-snug">
                    We'll send a 4-digit OTP to <b>{contact.mobile || '— —'}</b> to confirm your order.
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
                  <div className="space-y-2">
                    <div className="flex items-stretch gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && otp.length === 4 && !verifyingOtp) {
                            e.preventDefault();
                            verifyOtp();
                          }
                        }}
                        placeholder="• • • •"
                        className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-white border border-ilkal-gold/40 focus:border-ilkal-maroon focus:outline-none text-center tracking-[0.5em] font-bold text-ilkal-maroon"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.length !== 4 || verifyingOtp}
                        className="h-11 px-5 rounded-xl silk-gradient text-white font-semibold text-sm shadow shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
                        {verifyingOtp ? '…' : 'Verify'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="opacity-60">Didn't get the code?</span>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={sendingOtp}
                        className="text-ilkal-maroon font-semibold underline disabled:opacity-50">
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                <span>Mobile <b>{contact.mobile}</b> verified</span>
              </div>
            )}
          </div>

          <button disabled={!valid || !otpVerified || paying} onClick={payNow}
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
          <div className="mt-3 flex items-center justify-center gap-1 text-xs opacity-70">
            <ShieldCheck className="w-4 h-4 text-green-700" /> Demo payment — no real charge
          </div>
        </Section>
      </aside>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-ilkal-gold/30 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-ilkal-gold/20">
          <h3 className="font-serif text-lg text-ilkal-maroon">Welcome back{user?.user_name ? `, ${user.user_name}` : ''}</h3>
          <p className="text-xs opacity-70 mt-1">Choose a saved address or enter a new one.</p>
        </div>
        <div className="px-5 py-3 overflow-y-auto space-y-2">
          {addresses.map(a => (
            <label key={a.id} className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer ${String(value) === String(a.id) ? 'border-ilkal-maroon bg-ilkal-cream/60' : 'border-ilkal-gold/30 hover:bg-ilkal-cream/30'}`}>
              <input type="radio" name="addr-choice" className="mt-1" value={a.id}
                checked={String(value) === String(a.id)}
                onChange={() => onChange(String(a.id))} />
              <div className="text-sm leading-snug">
                <div className="font-medium text-ilkal-maroon">
                  {[a.house_flat_no, a.address_line1].filter(Boolean).join(', ')}
                </div>
                <div className="opacity-80">
                  {[a.address_line2, a.area, a.landmark].filter(Boolean).join(', ')}
                </div>
                <div className="opacity-80">
                  {[a.city, a.district, stateName(a.state_union_id), a.pincode].filter(Boolean).join(', ')}
                </div>
              </div>
            </label>
          ))}
          <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer ${value === 'new' ? 'border-ilkal-maroon bg-ilkal-cream/60' : 'border-ilkal-gold/30 hover:bg-ilkal-cream/30'}`}>
            <input type="radio" name="addr-choice" value="new"
              checked={value === 'new'}
              onChange={() => onChange('new')} />
            <span className="text-sm font-medium text-ilkal-maroon">Enter a new address</span>
          </label>
        </div>
        <div className="px-5 py-3 border-t border-ilkal-gold/20 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl border border-ilkal-gold/40 text-sm">Cancel</button>
          <button type="button" onClick={onApply}
            className="btn-primary px-4 py-2 text-sm">Continue</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-md border border-ilkal-gold/20">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-serif text-xl text-ilkal-maroon">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Input({ label, value, onChange, type = 'text', className = '', invalid = false, errorText, ...rest }) {
  const borderCls = invalid
    ? 'border-red-500 focus:border-red-500 ring-1 ring-red-300'
    : 'border-ilkal-gold/30 focus:border-ilkal-maroon';
  return (
    <label className={`block ${className}`}>
      <span className={`text-xs font-medium ${invalid ? 'text-red-600' : 'opacity-80'}`}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} {...rest}
        className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-ilkal-cream border focus:outline-none ${borderCls}`} />
      {invalid && errorText && (
        <span className="mt-1 block text-[11px] text-red-600">{errorText}</span>
      )}
    </label>
  );
}
function Select({ label, value, onChange, options, className = '', invalid = false, errorText }) {
  const borderCls = invalid
    ? 'border-red-500 focus:border-red-500 ring-1 ring-red-300'
    : 'border-ilkal-gold/30 focus:border-ilkal-maroon';
  return (
    <label className={`block ${className}`}>
      <span className={`text-xs font-medium ${invalid ? 'text-red-600' : 'opacity-80'}`}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-ilkal-cream border focus:outline-none ${borderCls}`}>
        <option value="">Select state / UT…</option>
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.id;
          const lab = typeof o === 'string' ? o : `${o.name}${o.isUnionTerritory ? ' (UT)' : ''}`;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
      {invalid && errorText && (
        <span className="mt-1 block text-[11px] text-red-600">{errorText}</span>
      )}
    </label>
  );
}
function Row({ label, value, bold, highlight }) {
  return (
    <div className={`flex justify-between text-sm py-1 ${bold ? 'text-base font-bold text-ilkal-maroon' : ''}`}>
      <span className="opacity-80">{label}</span>
      <span className={highlight ? 'text-green-700 font-semibold' : ''}>{value}</span>
    </div>
  );
}

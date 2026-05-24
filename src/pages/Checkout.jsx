import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Lock, ShieldCheck, ChevronRight, MapPin, Tag, Sparkles } from 'lucide-react';

import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import AddressPicker from '../components/AddressPicker.jsx';
import { ALL_REGIONS } from '../data/indianStates.js';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96"><rect width="80" height="96" fill="%23FFF8F0"/><text x="50%" y="50%" font-family="Poppins,sans-serif" font-size="10" fill="%237B1E3A" text-anchor="middle" dominant-baseline="middle">Saree</text></svg>';

export default function Checkout() {
  const nav = useNavigate();
  const {
    items, inc, dec, remove, subtotal, payable, baseAmount, gstAmount, gstRate, clear,
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
  const [addr, setAddr] = useState({ houseNo: '', line1: '', line2: '', city: '', district: '', state: '', pin: '', lat: null, lng: null, display: '' });
  const [paying, setPaying] = useState(false);

  const shipping = 0;
  const total = payable + shipping;

  const valid =
    contact.name.trim().length > 1 &&
    /^[6-9]\d{9}$/.test(contact.mobile) &&
    addr.houseNo.trim() && addr.line1 && addr.city && addr.state && /^\d{6}$/.test(addr.pin) &&
    items.length > 0;

  const payNow = () => {
    if (!valid) { toast.error('Please complete contact & address'); return; }
    setPaying(true);
    setTimeout(() => {
      const order = {
        id: 'IK' + Date.now().toString().slice(-8),
        items, contact, addr, subtotal, bulkDiscount, offer, offerPercent, offerDiscount, payable, baseAmount, gstAmount, shipping, total,
        bulkOrder: bulkEligible,
        placedAt: new Date().toISOString()
      };
      localStorage.setItem('ilkal_last_order', JSON.stringify(order));
      try {
        const prev = JSON.parse(localStorage.getItem('ilkal_orders')) || [];
        localStorage.setItem('ilkal_orders', JSON.stringify([order, ...prev]));
      } catch { localStorage.setItem('ilkal_orders', JSON.stringify([order])); }
      clear();
      nav('/confirmation');
    }, 1800);
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
            <Input label="Full Name *" value={contact.name} onChange={v => setContact({ ...contact, name: v })} />
            <Input label="Mobile *" value={contact.mobile} maxLength={10} inputMode="numeric"
              onChange={v => setContact({ ...contact, mobile: v.replace(/\D/g, '') })} />
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
          <AddressPicker value={addr} onChange={v => setAddr(a => ({ ...a, ...v }))} />

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Input label="Flat / House No. *" value={addr.houseNo} onChange={v => setAddr({ ...addr, houseNo: v })} placeholder="e.g. #12, B-204" />
            <Input label="Street / Road *" value={addr.line1} onChange={v => setAddr({ ...addr, line1: v })} placeholder="e.g. MG Road" />
            <Input className="sm:col-span-2" label="Area / Landmark" value={addr.line2} onChange={v => setAddr({ ...addr, line2: v })} />
            <Input label="City *" value={addr.city} onChange={v => setAddr({ ...addr, city: v })} />
            <Input label="District" value={addr.district} onChange={v => setAddr({ ...addr, district: v })} />
            <Select label="State / Union Territory *" value={addr.state}
              onChange={v => setAddr({ ...addr, state: v })}
              options={ALL_REGIONS} />
            <Input label="PIN code *" value={addr.pin} maxLength={6} inputMode="numeric"
              onChange={v => setAddr({ ...addr, pin: v.replace(/\D/g, '') })} />
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
          <Row label={`GST (${(gstRate * 100).toFixed(0)}%, inclusive)`} value={`₹${gstAmount.toLocaleString('en-IN')}`} />
          <Row label="Shipping" value={shipping ? `₹${shipping}` : 'FREE'} highlight={!shipping} />
          <div className="my-2 border-t border-dashed border-ilkal-gold/40" />
          <Row label="Total Payable" value={`₹${total.toLocaleString('en-IN')}`} bold />
          <p className="mt-2 text-xs opacity-70">All prices are inclusive of GST. You won’t be charged anything extra.</p>

          <button disabled={!valid || paying} onClick={payNow}
            className="btn-primary w-full mt-5 disabled:opacity-60 disabled:cursor-not-allowed">
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
function Input({ label, value, onChange, type = 'text', className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} {...rest}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ilkal-cream border border-ilkal-gold/30 focus:border-ilkal-maroon focus:outline-none" />
    </label>
  );
}
function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-ilkal-cream border border-ilkal-gold/30 focus:border-ilkal-maroon focus:outline-none">
        <option value="">Select state / UT…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
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

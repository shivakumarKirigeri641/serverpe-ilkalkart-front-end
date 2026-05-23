import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Phone, Mail, Sparkles, Download, FileText, Camera, MessageCircle } from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';
import { downloadInvoice } from '../utils/invoice.js';
import toast from 'react-hot-toast';

export default function Confirmation() {
  const [order, setOrder] = useState(null);
  useEffect(() => {
    try { setOrder(JSON.parse(localStorage.getItem('ilkal_last_order'))); } catch {}
  }, []);

  if (!order) {
    return (
      <div className="text-center py-24 px-4">
        <h2 className="font-serif text-2xl text-ilkal-maroon">No recent order found</h2>
        <Link to="/browse" className="btn-primary mt-4 inline-flex">Start Browsing Sarees</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center">
        <div className="relative w-24 h-24 mx-auto animate-float">
          <div className="absolute inset-0 rounded-full bg-white shadow-xl ring-2 ring-ilkal-gold/50 overflow-hidden">
            <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain p-2" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full silk-gradient grid place-items-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-ilkal-maroon mt-4">Thank you, {order.contact.name.split(' ')[0]}!</h1>
        <p className="opacity-80 mt-1">Your Ilkal saree is in safe hands. We’ll wrap it with love.</p>
        <p className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ilkal-cream border border-ilkal-gold/40 text-ilkal-maroon font-semibold">
          <Sparkles className="w-4 h-4 text-ilkal-gold" /> Order ID: {order.id}
        </p>
      </motion.div>

      <div className="mt-8 bg-white rounded-3xl shadow-lg border border-ilkal-gold/20 overflow-hidden">
        <div className="p-5 border-b border-ilkal-gold/20">
          <h2 className="font-serif text-xl text-ilkal-maroon flex items-center gap-2"><Package className="w-5 h-5" /> Sarees in this order</h2>
          <div className="mt-3 space-y-3">
            {order.items.map(it => (
              <div key={it.id} className="flex gap-3 items-center">
                <img src={it.images[0]} alt={it.name} className="w-14 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-ilkal-maroon">{it.name}</div>
                  <div className="text-xs opacity-70">{it.color} • Qty {it.qty}</div>
                </div>
                <div className="font-semibold">₹{(it.qty * it.price).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-4 border-b border-ilkal-gold/20">
          <div>
            <h3 className="font-semibold text-ilkal-maroon mb-1">Contact</h3>
            <p className="text-sm flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-ilkal-gold" />{order.contact.mobile}</p>
            {order.contact.email && <p className="text-sm flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-ilkal-gold" />{order.contact.email}</p>}
          </div>
          <div>
            <h3 className="font-semibold text-ilkal-maroon mb-1 flex items-center gap-1"><MapPin className="w-4 h-4 text-ilkal-gold" /> Shipping to</h3>
            <p className="text-sm leading-relaxed">
              {[order.addr.houseNo, order.addr.line1, order.addr.line2].filter(Boolean).join(', ')}<br />
              {order.addr.city}, {order.addr.state} - {order.addr.pin}
            </p>
          </div>
        </div>

        <div className="p-5 text-sm">
          <Row label="Sub-total" value={`₹${order.subtotal.toLocaleString('en-IN')}`} />
          {order.bulkDiscount > 0 && (
            <Row label="Bulk discount (10%)" value={`− ₹${order.bulkDiscount.toLocaleString('en-IN')}`} />
          )}
          <Row label="Item value (excl. GST)" value={`₹${order.baseAmount.toLocaleString('en-IN')}`} />
          <Row label="GST (5% inclusive)" value={`₹${order.gstAmount.toLocaleString('en-IN')}`} />
          <Row label="Shipping" value={order.shipping ? `₹${order.shipping}` : 'FREE'} />
          <div className="border-t border-dashed border-ilkal-gold/40 my-2" />
          <Row label="Total Paid" value={`₹${order.total.toLocaleString('en-IN')}`} bold />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-ilkal-gold/30 bg-ilkal-cream/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl silk-gradient grid place-items-center shrink-0">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm leading-relaxed">
            <h3 className="font-serif text-lg text-ilkal-maroon">Live photo & video proof coming shortly</h3>
            <p className="mt-1 opacity-90">
              I personally record <b>live photos and a video</b> of your saree — full drape, close-ups and the
              final packing — once your order is confirmed. This proof shows the saree is fresh, undamaged, never
              draped on anyone and never worn before it reaches you.
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                <span>
                  The link will be sent to your WhatsApp on <b>+91 {order.contact.mobile}</b> as soon as it's recorded.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-ilkal-maroon mt-0.5 shrink-0" />
                <span>
                  You can also access it any time from the <Link to="/track" className="text-ilkal-maroon font-semibold underline">Track my Saree</Link> page using Order ID <b>{order.id}</b>.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch sm:items-center">
        <button
          onClick={() => { try { downloadInvoice(order); toast.success('Invoice downloaded'); } catch { toast.error('Could not generate invoice'); } }}
          className="btn-primary">
          <Download className="w-4 h-4" /> Download Invoice (PDF)
        </button>
        <Link to="/track" className="btn-gold">Track my Saree</Link>
        <Link to="/browse" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-ilkal-maroon bg-white border border-ilkal-gold/40 shadow hover:shadow-lg transition">
          Start Browsing Sarees
        </Link>
      </div>
      <p className="mt-3 text-center text-xs opacity-70 flex items-center justify-center gap-1">
        <FileText className="w-3.5 h-3.5" /> A tax invoice is also emailed to you (sample).
      </p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'font-bold text-ilkal-maroon text-base' : ''}`}>
      <span className="opacity-80">{label}</span>
      <span>{value}</span>
    </div>
  );
}

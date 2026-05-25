import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Phone, Mail, Sparkles, Download, FileText, Camera, MessageCircle } from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';
import { downloadInvoice } from '../utils/invoice.js';
import { uploadsUrl } from '../utils/api.js';
import toast from 'react-hot-toast';

const fmtINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function Confirmation() {
  const [data, setData] = useState(null);
  useEffect(() => {
    try { setData(JSON.parse(localStorage.getItem('ilkal_last_order'))); } catch {}
  }, []);

  if (!data || !data.payment_details) {
    return (
      <div className="text-center py-24 px-4">
        <h2 className="font-serif text-2xl text-ilkal-maroon">No recent order found</h2>
        <Link to="/browse" className="btn-primary mt-4 inline-flex">Start Browsing Sarees</Link>
      </div>
    );
  }

  const payment = data.payment_details || {};
  const order = data.order_details || {};
  const items = data.cart_items?.data?.items || [];
  const platform = data.platform_details || {};
  const gst = data.gst_details || {};
  const invoice = data.invoice_details || {};
  const user = data.user_details || {};
  const addr = data.user_address || {};

  const gstPercent = Number(gst.gst_percent || 0);
  const gstRate = gstPercent / 100;
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.quantity || 0) * Number(it.base_price || 0),
    0,
  );
  const baseAmount = gstRate > 0 ? +(subtotal / (1 + gstRate)).toFixed(2) : subtotal;
  const gstAmount = +(subtotal - baseAmount).toFixed(2);
  const total = Number(payment.amount) || subtotal;
  const shipping = 0;

  const firstName = String(user.user_name || 'Customer').split(' ')[0];
  const orderRef = order.order_id || payment.razorpay_order_id;
  const invoicePath = invoice.invoice_path ? uploadsUrl(invoice.invoice_path) : null;

  const handleDownload = () => {
    try {
      if (invoicePath) {
        window.open(invoicePath, '_blank', 'noopener');
        toast.success('Opening server invoice');
        return;
      }
      const legacyOrder = {
        id: orderRef,
        placedAt: payment.paid_at || new Date().toISOString(),
        contact: { name: user.user_name, mobile: user.mobile_number, email: user.email },
        addr: {
          houseNo: addr.house_flat_no, line1: addr.address_line1, line2: addr.address_line2,
          city: addr.city, district: addr.district, state: '', pin: addr.pincode,
        },
        items: items.map((it) => ({
          id: it.id, name: it.title || it.type_name || 'Saree',
          color: it.color, qty: Number(it.quantity || 0), price: Number(it.base_price || 0),
        })),
        subtotal, baseAmount, gstAmount, gstRate, gstPercent,
        gstDescription: gst.description, shipping, total,
      };
      downloadInvoice(legacyOrder);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Could not get invoice');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center">
        <div className="relative w-24 h-24 mx-auto animate-float">
          <div className="absolute inset-0 rounded-full bg-white shadow-xl ring-2 ring-ilkal-gold/50 overflow-hidden">
            <img src={logo} alt={platform.platform_name || 'Ilkal Kart'} className="w-full h-full object-contain p-2" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full silk-gradient grid place-items-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-ilkal-maroon mt-4">Thank you, {firstName}!</h1>
        <p className="opacity-80 mt-1">Your Ilkal saree is in safe hands. We'll wrap it with love.</p>
        <p className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ilkal-cream border border-ilkal-gold/40 text-ilkal-maroon font-semibold">
          <Sparkles className="w-4 h-4 text-ilkal-gold" /> Order ID: {orderRef}
        </p>
        {invoice.invoice_id && (
          <p className="mt-2 text-xs opacity-70">Invoice: {invoice.invoice_id}</p>
        )}
      </motion.div>

      <div className="mt-8 bg-white rounded-3xl shadow-lg border border-ilkal-gold/20 overflow-hidden">
        <div className="p-5 border-b border-ilkal-gold/20">
          <h2 className="font-serif text-xl text-ilkal-maroon flex items-center gap-2"><Package className="w-5 h-5" /> Sarees in this order</h2>
          <div className="mt-3 space-y-3">
            {items.map((it, idx) => (
              <div key={it.id || idx} className="flex gap-3 items-center">
                <div className="w-14 h-16 rounded-xl bg-ilkal-cream border border-ilkal-gold/30 grid place-items-center text-[10px] text-ilkal-maroon">
                  Saree
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ilkal-maroon">{it.title || it.type_name || 'Saree'}</div>
                  <div className="text-xs opacity-70">
                    {[it.color, `Qty ${it.quantity}`].filter(Boolean).join(' • ')}
                  </div>
                </div>
                <div className="font-semibold">
                  {fmtINR(Number(it.quantity || 0) * Number(it.base_price || 0))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-4 border-b border-ilkal-gold/20">
          <div>
            <h3 className="font-semibold text-ilkal-maroon mb-1">Contact</h3>
            {user.mobile_number && (
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ilkal-gold" />+91 {user.mobile_number}
              </p>
            )}
            {user.email && (
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-ilkal-gold" />{user.email}
              </p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-ilkal-maroon mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-ilkal-gold" /> Shipping to
            </h3>
            <p className="text-sm leading-relaxed">
              {[addr.house_flat_no, addr.address_line1, addr.address_line2]
                .filter(Boolean).join(', ')}
              <br />
              {[addr.area, addr.landmark].filter(Boolean).join(', ')}
              {(addr.area || addr.landmark) && <br />}
              {[addr.city, addr.district].filter(Boolean).join(', ')}
              {addr.pincode ? ` - ${addr.pincode}` : ''}
            </p>
          </div>
        </div>

        <div className="p-5 text-sm">
          <Row label="Sub-total (incl. GST)" value={fmtINR(subtotal)} />
          <Row label="Item value (excl. GST)" value={fmtINR(baseAmount)} />
          <Row
            label={`${gst.description || 'GST'} (${gstPercent}% inclusive)`}
            value={fmtINR(gstAmount)}
          />
          <Row label="Shipping" value={shipping ? fmtINR(shipping) : 'FREE'} />
          <div className="border-t border-dashed border-ilkal-gold/40 my-2" />
          <Row label="Total Paid" value={fmtINR(total)} bold />
          <div className="mt-3 grid sm:grid-cols-2 gap-x-4 text-xs opacity-70">
            {payment.razorpay_payment_id && (
              <div>Payment ID: <span className="text-ilkal-deep">{payment.razorpay_payment_id}</span></div>
            )}
            {payment.method && (
              <div>Method: <span className="text-ilkal-deep capitalize">{payment.method}</span></div>
            )}
            {payment.status && (
              <div>Status: <span className="text-ilkal-deep capitalize">{payment.status}</span></div>
            )}
            {payment.paid_at && (
              <div>Paid at: <span className="text-ilkal-deep">{new Date(payment.paid_at).toLocaleString('en-IN')}</span></div>
            )}
          </div>
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
              {platform.founder_name || 'Our curator'} personally records <b>live photos and a video</b> of your saree —
              full drape, close-ups and the final packing — once your order is confirmed.
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                <span>
                  The link will be sent to your WhatsApp on <b>+91 {user.mobile_number}</b> as soon as it's recorded.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-ilkal-maroon mt-0.5 shrink-0" />
                <span>
                  You can also access it any time from the <Link to="/track" className="text-ilkal-maroon font-semibold underline">Track my Saree</Link> page using Order ID <b>{orderRef}</b>.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch sm:items-center">
        <button onClick={handleDownload} className="btn-primary">
          <Download className="w-4 h-4" /> Download Invoice (PDF)
        </button>
        <Link to="/track" className="btn-gold">Track my Saree</Link>
        <Link to="/browse" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-ilkal-maroon bg-white border border-ilkal-gold/40 shadow hover:shadow-lg transition">
          Start Browsing Sarees
        </Link>
      </div>
      <p className="mt-3 text-center text-xs opacity-70 flex items-center justify-center gap-1">
        <FileText className="w-3.5 h-3.5" /> A tax invoice is also emailed to you.
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

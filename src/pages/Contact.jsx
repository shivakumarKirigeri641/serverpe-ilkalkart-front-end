import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext.jsx';

export default function Contact() {
  const { queryTypes } = useCatalog();
  const [form, setForm] = useState({ name: '', mobile: '', type: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!form.type && queryTypes.length > 0) {
      setForm((p) => ({ ...p, type: queryTypes[0].title }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTypes]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !/^[6-9]\d{9}$/.test(form.mobile) || !form.message) {
      toast.error('Please fill name, valid mobile and message');
      return;
    }
    setSent(true);
    toast.success('We’ll reach out within 24 hours 💌');
    setForm({ name: '', mobile: '', type: queryTypes[0]?.title || '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-ilkal-gold/20">
        <h1 className="font-serif text-3xl text-ilkal-maroon">Talk to me</h1>
        <p className="opacity-80 mt-1 text-sm">It’s just me on the other side — Shiva. I personally read and reply to every message.</p>

        <div className="mt-6 space-y-3 text-sm">
          <a href="https://wa.me/916363271302" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-50 rounded-2xl p-3 border border-green-200 text-green-800 hover:bg-green-100 transition">
            <MessageCircle className="w-6 h-6 text-green-700" />
            <div className="leading-tight">
              <div className="font-semibold">+91 63632 71302</div>
              <div className="text-[11px] opacity-80">WhatsApp me — fastest reply</div>
            </div>
          </a>
          <a href="mailto:support@serverpe.in" className="flex items-center gap-3 bg-ilkal-cream rounded-2xl p-3 border border-ilkal-gold/30">
            <Mail className="w-5 h-5 text-ilkal-maroon" /> support@serverpe.in
          </a>
          <Link to="/browse" className="btn-primary w-full mt-4">
            Start Browsing Sarees <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <motion.form onSubmit={submit}
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-ilkal-gold/20">
        <h2 className="font-serif text-2xl text-ilkal-maroon">Send a message</h2>
        <div className="mt-4 space-y-3">
          <Field label="Your Name *">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input" placeholder="Your beautiful name" />
          </Field>
          <Field label="Mobile *">
            <input value={form.mobile} maxLength={10} inputMode="numeric"
              onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
              className="input" placeholder="10-digit mobile" />
          </Field>
          <Field label="Query Type">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input">
              {queryTypes.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
            </select>
          </Field>
          <Field label="Message *">
            <textarea rows="4" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              className="input resize-none" placeholder="Tell me what you’re looking for…" />
          </Field>

          <button className="btn-primary w-full" disabled={sent}>
            <Send className="w-4 h-4" /> {sent ? 'Sent!' : 'Send Message'}
          </button>
        </div>
      </motion.form>

      <style>{`
        .input { width:100%; padding: 10px 14px; border-radius: 14px; background:#FFF8F0; border:1px solid rgba(201,162,39,0.3); outline:none; }
        .input:focus { border-color:#7B1E3A; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium opacity-80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

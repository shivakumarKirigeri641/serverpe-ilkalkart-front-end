import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Send, MessageCircle, ArrowRight, Clock, ShieldCheck, Check, Phone, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext.jsx';
import { apiClient } from '../utils/api.js';
import logo from '../images/logo/ilkalKart_logo.png';

export default function Contact() {
  const { queryTypes } = useCatalog();
  const [form, setForm] = useState({ name: '', mobile: '', type: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!form.type && queryTypes.length > 0) {
      setForm((p) => ({ ...p, type: queryTypes[0].title }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTypes]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/^[6-9]\d{9}$/.test(form.mobile) || !form.message.trim()) {
      toast.error('Please fill name, valid mobile and message');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Please enter a valid email or leave it blank');
      return;
    }
    try {
      const res = await apiClient.post('/contact-me', {
        user_name: form.name.trim(),
        mobile_number: form.mobile,
        query_type_name: form.type || (queryTypes[0]?.title || 'General Query'),
        message: form.message.trim(),
        email: form.email.trim() || null,
      });
      const body = res.data;
      if (!body?.successstatus) {
        toast.error(body?.message || 'Could not send your message');
        return;
      }
      setSent(true);
      toast.success("I'll reach out within 24 hours 💌");
    } catch (err) {
      toast.error(err?.message || 'Could not send your message');
    }
  };

  return (
    <div className="bg-stone-50">
      {/* ============================================================
          CHAT-STYLE CONTACT — "start a conversation with the founder"
         ============================================================ */}
      <section className="relative pt-16 sm:pt-20 pb-16 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Get in touch</span>
            <h1 className="mt-5 font-display font-extrabold tracking-display text-5xl sm:text-7xl text-stone-900 leading-[0.9]">
              Let’s chat.
            </h1>
            <p className="mt-5 text-lg text-stone-500 leading-relaxed">
              No call centre, no bots — it’s just me, Shiva, on the other side. Start the conversation below
              and I’ll personally reply.
            </p>
          </div>

          {/* the chat window */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mt-10 rounded-4xl bg-stone-900 overflow-hidden shadow-card-hover">

            {/* chat header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-stone-700">
              <span className="relative w-11 h-11 rounded-full bg-stone-50 grid place-items-center overflow-hidden shrink-0">
                <img src={logo} alt="Shiva" className="w-full h-full object-contain mix-blend-multiply" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold tracking-display text-stone-50 leading-tight">Shivakumar · Founder</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online · replies within 24h
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <a href="https://wa.me/916363271302" target="_blank" rel="noopener noreferrer"
                  className="grid place-items-center w-10 h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition" aria-label="WhatsApp">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="mailto:support@serverpe.in"
                  className="grid place-items-center w-10 h-10 rounded-full border border-white/15 text-stone-300 hover:bg-white/10 transition" aria-label="Email">
                  <Mail className="w-[18px] h-[18px]" />
                </a>
              </div>
            </div>

            {/* chat thread */}
            <div className="px-5 sm:px-8 py-7 space-y-3 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:22px_22px]">
              {/* incoming bubbles from Shiva */}
              <Bubble side="in" delay={0.1}>
                Namaste 🙏 I’m Shiva — the only person behind Ilkal Kart.
              </Bubble>
              <Bubble side="in" delay={0.25}>
                Drop your details below and tell me what you’re looking for. Every message reaches me personally.
              </Bubble>

              {/* outgoing — the user's submitted message (only after send) */}
              <AnimatePresence>
                {sent && (
                  <>
                    <Bubble side="out" delay={0}>
                      Sent! 🎉 I’ll get back to you within 24 hours.
                    </Bubble>
                    <Bubble side="in" delay={0.2}>
                      Got it — thank you. Talk soon! Meanwhile, feel free to{' '}
                      <Link to="/browse" className="underline underline-offset-2 font-medium">browse the collection</Link>.
                    </Bubble>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* composer — the form lives here */}
            <form onSubmit={submit} className="border-t border-stone-700 bg-white/[0.03] p-5 sm:p-7">
              {/* identity row */}
              <div className="grid sm:grid-cols-3 gap-2.5">
                <ChatInput icon={User}  value={form.name}  onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name *" />
                <ChatInput icon={Phone} value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v.replace(/\D/g, '') })} placeholder="Mobile *" maxLength={10} numeric />
                <ChatInput icon={Mail}  value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Email (optional)" type="email" />
              </div>

              {/* query type as reply chips */}
              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">What’s this about?</span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {queryTypes.map((t) => {
                    const on = form.type === t.title;
                    return (
                      <button type="button" key={t.id} onClick={() => setForm({ ...form, type: t.title })}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                          on ? 'bg-wood text-stone-900' : 'bg-white/5 text-stone-300 ring-1 ring-white/10 hover:bg-white/10'
                        }`}>
                        {t.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* message composer */}
              <div className="mt-4 flex items-end gap-2.5 rounded-4xl bg-white/5 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-wood transition p-2 pl-5">
                <textarea
                  rows="1"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Type your message…"
                  className="flex-1 bg-transparent text-stone-50 placeholder:text-stone-500 focus:outline-none resize-none py-2.5 max-h-32"
                />
                <button type="submit"
                  className="grid place-items-center w-12 h-12 rounded-full bg-wood text-stone-900 hover:brightness-105 transition active:scale-95 shrink-0"
                  aria-label="Send message">
                  {sent ? <Check className="w-5 h-5" strokeWidth={3} /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </motion.div>

          {/* trust footnote — inline, not a stacked list */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-wood" /> Replies within 24 hours</span>
            <span className="hidden sm:inline h-3 w-px bg-stone-300" />
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-wood" /> One official number · <span className="font-mono">+91 63632 71302</span></span>
            <span className="hidden sm:inline h-3 w-px bg-stone-300" />
            <Link to="/browse" className="inline-flex items-center gap-1 text-stone-600 font-medium hover:text-stone-900">
              See the collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          QUICK ANSWERS — Contact-specific FAQ (relates to messaging us)
         ============================================================ */}
      <section className="pb-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <span className="eyebrow">Before you message</span>
            <h2 className="mt-4 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900 leading-[0.95]">
              Quick answers.
            </h2>
            <p className="mt-3 text-stone-500">A few things people often ask — you may not need to write at all.</p>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <FaqRow key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const FAQS = [
  {
    q: 'How soon will I hear back?',
    a: 'Within 24 hours — usually much sooner on WhatsApp, since every message comes straight to me, not a queue.',
  },
  {
    q: 'Can I order over chat instead of the website?',
    a: 'Yes. WhatsApp me the Saree ID shown on each card, the quantity and your address — I’ll send a secure payment link and handle the rest.',
  },
  {
    q: 'Which number is actually yours?',
    a: 'Only +91 63632 71302. It’s the same number that sends your packing photos and tracking. Anyone else asking for UPI transfers isn’t me.',
  },
  {
    q: 'Do you offer returns if I change my mind?',
    a: 'No returns or replacements — by design. I send complete photo and video proof of condition before dispatch, so what reaches you is exactly what you approved.',
  },
  {
    q: 'Is my mobile number safe with you?',
    a: 'Yes. I only use it to reply to you and to send order updates. No spam, no sharing, no marketing lists.',
  },
];

function FaqRow({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-4xl bg-white border border-stone-200 shadow-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center gap-4 px-6 sm:px-7 py-5 text-left">
        <span className="font-display font-bold tracking-display text-stone-900 flex-1">{q}</span>
        <span className={`grid place-items-center w-9 h-9 rounded-full border-2 transition-colors shrink-0 ${
          open ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 text-stone-700'
        }`}>
          <Plus className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden">
            <p className="px-6 sm:px-7 pb-5 -mt-1 text-stone-500 leading-relaxed max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bubble({ side, children, delay = 0 }) {
  const out = side === 'out';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`flex ${out ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] sm:max-w-[26rem] px-4 py-3 text-sm leading-relaxed ${
        out
          ? 'rounded-2xl rounded-tr-md bg-emerald-600 text-white'
          : 'rounded-2xl rounded-tl-md bg-white/[0.07] ring-1 ring-white/10 text-stone-200'
      }`}>
        {children}
      </div>
    </motion.div>
  );
}

function ChatInput({ icon: Icon, value, onChange, placeholder, type = 'text', maxLength, numeric }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-500 pointer-events-none" />
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={numeric ? 'numeric' : undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 rounded-full bg-white/5 ring-1 ring-white/10 text-stone-50 placeholder:text-stone-500 focus:ring-2 focus:ring-wood focus:outline-none transition ${numeric ? 'tabular-nums' : ''}`}
      />
    </div>
  );
}

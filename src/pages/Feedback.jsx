import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Send, Image as ImageIcon, X, ArrowRight, Loader2, Pause, Play, Quote, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, uploadsUrl } from '../utils/api.js';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Loved it'];

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/feedbacks');
      const body = res.data;
      if (body?.successstatus && Array.isArray(body.data)) setList(body.data);
      else setList([]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image file'); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error('Image too large — keep under 2 MB'); return; }
    setPicFile(file);
    const reader = new FileReader();
    reader.onload = () => setPicPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPicFile(null);
    setPicPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || rating < 1) {
      toast.error('Please share your name, rating and a message');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (picFile) {
        const fd = new FormData();
        fd.append('user_name', name.trim());
        fd.append('rating', String(rating));
        fd.append('message', message.trim());
        fd.append('pic', picFile);
        res = await apiClient.post('/feedback', fd);
      } else {
        res = await apiClient.post('/feedback', { user_name: name.trim(), rating, message: message.trim() });
      }
      const body = res.data;
      if (!body?.successstatus) {
        toast.error(body?.message || 'Could not save feedback');
        return;
      }
      toast.success('Thank you for your kind words 💛');
      setRating(0); setHover(0); setName(''); setMessage('');
      clearImage();
      fetchList();
    } catch (err) {
      toast.error(err?.message || 'Could not save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = list.length > 0
    ? (list.reduce((s, f) => s + Number(f.rating || 0), 0) / list.length).toFixed(1)
    : '5.0';
  const shown = hover || rating;

  return (
    <div className="bg-stone-50">
      <section className="relative pt-16 sm:pt-20 pb-16 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          {/* masthead — centered */}
          <div className="text-center">
            <span className="eyebrow inline-flex before:!hidden">Your voice matters</span>
            <h1 className="mt-4 font-display font-extrabold tracking-display text-5xl sm:text-7xl text-stone-900 leading-[0.9]">
              Share your story.
            </h1>
            <p className="mt-5 text-lg text-stone-500 leading-relaxed max-w-xl mx-auto">
              Every word reaches me directly. Your feedback helps me serve the next lady better —
              and may inspire her to drape her first Ilkal.
            </p>
          </div>

          {/* verdict ribbon — social proof as a headline banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-9 flex items-center justify-center gap-5 rounded-full bg-stone-900 text-stone-50 px-7 py-4 mx-auto w-fit shadow-card-hover">
            <span className="font-display font-extrabold tracking-display text-4xl leading-none">{avg}</span>
            <span className="h-9 w-px bg-stone-700" />
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${Number(avg) >= n ? 'fill-wood text-wood' : 'text-stone-700'}`} />
                ))}
              </div>
              <div className="mt-1 text-[11px] text-stone-400">
                <b className="text-stone-50">{list.length}</b> {list.length === 1 ? 'review' : 'reviews'} · across India
              </div>
            </div>
          </motion.div>

          {/* THE COMPOSER — single focused card on the spotlight stage */}
          <motion.form onSubmit={submit}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mt-9 rounded-4xl bg-white border border-stone-200 shadow-card-hover overflow-hidden">

            {/* rating hero — the centerpiece interaction */}
            <div className="bg-stone-100 border-b border-stone-200 px-7 sm:px-10 py-9 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">How was your Ilkal?</span>
              <div className="mt-4 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)} className="p-0.5" aria-label={`${n} star`}>
                    <Star className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                      shown >= n ? 'fill-wood text-wood scale-110' : 'text-stone-300 hover:text-stone-400'
                    }`} />
                  </button>
                ))}
              </div>
              <div className="mt-3 h-6 font-display font-bold tracking-display text-xl text-stone-900">
                {shown > 0 ? RATING_WORDS[shown] : <span className="text-sm font-normal text-stone-400">Tap to rate</span>}
              </div>
            </div>

            {/* details */}
            <div className="px-7 sm:px-10 py-8">
              <Field label="Your beautiful name *">
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lakshmi from Bengaluru" className="ck-input" />
              </Field>

              <Field label="Your message *">
                <textarea rows="4" value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Tell me about the saree, the packing, the experience…"
                  className="ck-input resize-none" />
              </Field>

              <Field label="Add a photo (optional)">
                {picPreview ? (
                  <div className="flex items-center gap-4 rounded-4xl border border-stone-200 bg-stone-50 p-3">
                    <img src={picPreview} alt="preview" className="w-20 h-20 rounded-2xl object-cover ring-1 ring-stone-200" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-900 truncate">Photo attached</div>
                      <label className="text-xs text-wood-dark font-medium underline underline-offset-2 cursor-pointer">
                        Replace
                        <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                      </label>
                    </div>
                    <button type="button" onClick={clearImage}
                      className="grid place-items-center w-9 h-9 rounded-full border-2 border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 rounded-4xl border-2 border-dashed border-stone-300 hover:border-stone-900 transition-colors p-5 cursor-pointer">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-stone-900 text-stone-50 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-stone-900">Choose a photo</div>
                      <div className="text-xs text-stone-400">JPG / PNG / WebP · under 2 MB</div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                  </label>
                )}
                <p className="text-[11px] text-stone-400 mt-2 leading-relaxed flex items-start gap-1.5">
                  <Camera className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Your face is <b className="text-stone-600">not required</b>. A photo of just the saree draped is perfectly fine — privacy first, always.</span>
                </p>
              </Field>

              <button className="btn-primary w-full mt-6 disabled:opacity-60" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send feedback</>}
              </button>
              <p className="mt-3 text-center text-xs text-stone-400">
                Your feedback may appear on the landing-page testimonials.
              </p>
            </div>
          </motion.form>

          {/* request footer — slim strip, not a competing card */}
          <div className="mt-5 rounded-4xl bg-stone-100 border border-stone-200 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-wood text-stone-900 shrink-0">
              <Camera className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-display font-bold tracking-display text-stone-900">A small request</h3>
              <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                A photo of yourself — or just the saree on a hanger — would mean the world to me and the weaver.
                <b className="text-stone-600"> Your face is completely optional.</b>
              </p>
            </div>
            <Link to="/browse" className="btn-gold shrink-0">
              Browse sarees <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT VOICES — marquee */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <span className="eyebrow">Recent voices</span>
          <h2 className="mt-3 font-display font-extrabold tracking-display text-3xl sm:text-4xl text-stone-900">
            What ladies are saying.
          </h2>
        </div>

        <div className="mt-8 max-w-6xl mx-auto px-5 sm:px-8">
          {loading ? (
            <div className="text-center py-16 bg-white rounded-4xl border border-stone-200">
              <Loader2 className="w-6 h-6 animate-spin inline text-stone-400" />
              <p className="text-stone-500 mt-3 text-sm">Fetching latest feedback…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-4xl border border-stone-200">
              <p className="text-stone-500">No feedback yet — be the very first to write one.</p>
            </div>
          ) : (
            <FeedbackCarousel list={list} />
          )}
        </div>
      </section>

      <style>{`
        .ck-input {
          width: 100%; padding: 12px 16px; border-radius: 24px;
          background: #FAF7F5; border: 2px solid #E7E5E4; color: #1C1917;
          outline: none; transition: border-color .2s ease;
        }
        .ck-input::placeholder { color: #A8A29E; }
        .ck-input:focus { border-color: #1C1917; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mt-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function FeedbackCarousel({ list }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const SPEED = 40;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const tick = (ts) => {
      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      if (!paused) {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          offsetRef.current = (offsetRef.current + SPEED * dt) % halfWidth;
          track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, list.length]);

  const doubled = [...list, ...list];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 1200)}
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0, #000 64px, #000 calc(100% - 64px), transparent 100%)',
      }}
    >
      <div ref={trackRef} className="flex gap-5 will-change-transform" style={{ width: 'max-content' }}>
        {doubled.map((f, idx) => (
          <article
            key={`${f.id ?? 'f'}-${idx}`}
            aria-hidden={idx >= list.length}
            className="shrink-0 w-[85vw] sm:w-[380px] lg:w-[360px] bg-white rounded-4xl p-6 shadow-card border border-stone-200 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`w-4 h-4 ${k < Number(f.rating || 0) ? 'fill-wood text-wood' : 'text-stone-200'}`} />
                ))}
              </div>
              <Quote className="w-7 h-7 text-stone-100" />
            </div>
            {f.pic_path && (
              <img
                src={uploadsUrl(f.pic_path)}
                alt={f.user_name}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="mt-4 rounded-2xl object-cover w-full max-h-56 bg-stone-100"
              />
            )}
            <p className="mt-4 text-stone-700 leading-relaxed flex-1">“{f.message}”</p>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-stone-900 text-stone-50 font-display font-bold shrink-0">
                {(f.user_name || 'C').trim()[0]?.toUpperCase()}
              </span>
              <div className="leading-tight min-w-0">
                <div className="font-display font-bold tracking-display text-stone-900 truncate">{f.user_name}</div>
                {f.created_at && (
                  <div className="text-[11px] text-stone-400">
                    {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button type="button" onClick={() => setPaused((p) => !p)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 px-4 py-2 rounded-full border-2 border-stone-200 hover:border-stone-300 transition">
          {paused ? <><Play className="w-3.5 h-3.5" /> Play</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
        </button>
      </div>
    </div>
  );
}

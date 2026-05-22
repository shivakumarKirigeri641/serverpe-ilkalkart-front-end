import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Image as ImageIcon, X, MessageSquareHeart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'ilkal_feedbacks';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

function loadFeedbacks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFeedbacks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const [list, setList] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => { setList(loadFeedbacks()); }, []);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image file'); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error('Image too large — keep under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || rating < 1) {
      toast.error('Please share your name, rating and a message');
      return;
    }
    const entry = {
      id: 'fb-' + Date.now(),
      name: name.trim(),
      message: message.trim(),
      rating,
      image: image || null,
      createdAt: new Date().toISOString()
    };
    const next = [entry, ...list].slice(0, 50);
    setList(next);
    saveFeedbacks(next);
    toast.success('Thank you for your kind words 💛');
    setRating(0); setHover(0); setName(''); setMessage(''); setImage('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const avg = list.length > 0
    ? (list.reduce((s, f) => s + f.rating, 0) / list.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ilkal-maroon/10 text-ilkal-maroon text-xs font-semibold tracking-widest">
          <MessageSquareHeart className="w-3.5 h-3.5" /> YOUR VOICE MATTERS
        </span>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-ilkal-maroon">
          Share your <span className="shimmer-text">Ilkal Kart experience</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto opacity-80 text-sm sm:text-base">
          Every word you write reaches me directly. Your honest feedback helps me serve the next
          beautiful lady better — and your story may inspire her to drape her first Ilkal.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Form */}
        <motion.form onSubmit={submit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg border border-ilkal-gold/20">
          <h2 className="font-serif text-2xl text-ilkal-maroon">Write your feedback</h2>

          <div className="mt-4">
            <span className="text-xs font-semibold opacity-80">Your rating *</span>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="p-1">
                  <Star className={`w-8 h-8 transition ${
                    (hover || rating) >= n ? 'fill-ilkal-gold text-ilkal-gold' : 'text-ilkal-gold/40'
                  }`} />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-ilkal-maroon">{rating}/5</span>
              )}
            </div>
          </div>

          <Field label="Your beautiful name *">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Lakshmi from Bengaluru"
              className="input" />
          </Field>

          <Field label="Your message *">
            <textarea rows="5" value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tell me about the saree, the packing, the experience…"
              className="input resize-none" />
          </Field>

          <Field label="Add a photo (optional)">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ilkal-cream border border-ilkal-gold/40 text-ilkal-maroon text-sm font-semibold cursor-pointer hover:bg-ilkal-maroon/10 transition">
                <ImageIcon className="w-4 h-4" />
                {image ? 'Replace photo' : 'Choose photo'}
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
              </label>
              {image && (
                <div className="relative">
                  <img src={image} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-ilkal-gold/30 shadow" />
                  <button type="button" onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow grid place-items-center">
                    <X className="w-3.5 h-3.5 text-ilkal-maroon" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] opacity-70 mt-1 leading-relaxed">
              JPG/PNG/WebP — under 2 MB.<br />
              Your face is <b>not required</b>. A photo of just the saree draped is perfectly fine — privacy first, always.
            </p>
          </Field>

          <button className="btn-primary w-full mt-5">
            <Send className="w-4 h-4" /> Send Feedback
          </button>
          <p className="mt-2 text-[11px] text-center opacity-60">
            Your feedback may appear on the landing page testimonials.
          </p>
        </motion.form>

        {/* Sidebar — average + CTA */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl silk-gradient text-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-ilkal-gold">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={`w-5 h-5 ${Number(avg) >= n ? 'fill-ilkal-gold text-ilkal-gold' : 'text-ilkal-gold/40'}`} />
              ))}
            </div>
            <div className="mt-2 text-4xl font-bold">{avg} <span className="text-lg font-normal opacity-80">/ 5</span></div>
            <p className="opacity-90 text-sm mt-1">
              Based on <b>{list.length}</b> {list.length === 1 ? 'review' : 'reviews'} from beautiful ladies
              across India.
            </p>
          </motion.div>

          <div className="rounded-3xl bg-ilkal-cream border border-ilkal-gold/30 p-5">
            <h3 className="font-serif text-lg text-ilkal-maroon">A small request</h3>
            <p className="text-sm opacity-80 mt-1 leading-relaxed">
              If you have a photo of yourself draped in your Ilkal Kart saree, please share it —
              it would mean the world to me and to the weaver who made it.
            </p>
            <p className="text-xs opacity-75 mt-2 leading-relaxed">
              <b>Your face is completely optional.</b> A photo of the saree alone — on a hanger or a back-pose where only the drape shows — is more than enough.
              Your privacy comes first, always.
            </p>
            <Link to="/browse" className="btn-primary w-full mt-4">
              Start Browsing Sarees <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent feedbacks */}
      <div className="mt-12">
        <h2 className="font-serif text-2xl text-ilkal-maroon">Recent voices</h2>
        {list.length === 0 ? (
          <div className="mt-4 text-center py-10 bg-white rounded-3xl border border-ilkal-gold/20">
            <p className="opacity-70">No feedback yet — be the very first to write one.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {list.map((f, i) => (
                <motion.div key={f.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-3xl p-5 shadow-md border border-ilkal-gold/20">
                  <div className="flex items-center gap-1 text-ilkal-gold">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={`w-4 h-4 ${k < f.rating ? 'fill-ilkal-gold' : 'text-ilkal-gold/30'}`} />
                    ))}
                  </div>
                  {f.image && (
                    <img src={f.image} alt={f.name}
                      className="mt-3 rounded-2xl object-cover w-full max-h-56 border border-ilkal-gold/20" />
                  )}
                  <p className="mt-3 text-sm leading-relaxed opacity-90">“{f.message}”</p>
                  <p className="mt-3 font-semibold text-ilkal-maroon text-sm">— {f.name}</p>
                  <p className="text-[11px] opacity-50">{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        .input { width:100%; padding: 10px 14px; border-radius: 14px; background:#FFF8F0; border:1px solid rgba(201,162,39,0.3); outline:none; }
        .input:focus { border-color:#7B1E3A; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mt-4">
      <span className="text-xs font-semibold opacity-80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

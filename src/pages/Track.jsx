import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageCheck, PackageSearch, Truck, MapPin, Sparkles, Camera, Video, MessageCircle, ExternalLink, Clock } from 'lucide-react';

export default function Track() {
  const [oid, setOid] = useState('');
  const [result, setResult] = useState(null);
  const [searchParams] = useSearchParams();

  const runTrack = (orderId) => {
    const id = String(orderId || '').trim();
    if (!id) return;
    const stages = [
      { icon: PackageCheck, t: 'Order Confirmed', s: 'Your saree booking is received', done: true, time: 'Today, 09:12 AM' },
      { icon: Sparkles, t: 'Hand-picked from Ilkal', s: 'Personally selected at the loom', done: true, time: 'Today, 04:30 PM' },
      { icon: Camera, t: 'Photo & video proof recorded', s: 'Full saree shown + packing captured (link below)', done: true, time: 'Tomorrow, 10:30 AM' },
      { icon: PackageSearch, t: 'Quality Checked & Packed', s: 'Wrapped with care in muslin cloth', done: true, time: 'Tomorrow, 11:00 AM' },
      { icon: Truck, t: 'Out for Delivery', s: 'On the way to your doorstep', done: false, time: 'In transit' },
      { icon: MapPin, t: 'Delivered', s: 'Drape and shine!', done: false, time: 'Soon' }
    ];
    // Demo: proof becomes available once the "Photo & video proof recorded" stage is done.
    const proof = {
      ready: true,
      url: '#',
      recordedAt: 'Tomorrow, 10:30 AM',
      whatsappSentTo: '+91 ••••• ••302'
    };
    setResult({ id: id.toUpperCase(), stages, proof });
  };

  const track = (e) => {
    e.preventDefault();
    runTrack(oid);
  };

  useEffect(() => {
    const fromUrl = searchParams.get('oid');
    if (fromUrl && fromUrl.trim()) {
      setOid(fromUrl);
      runTrack(fromUrl);
    }
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon text-center">Track my Saree</h1>
      <p className="text-center opacity-70 mt-2">Enter your Order ID (e.g. <b>IK12345678</b>) to follow your saree’s journey.</p>
      <p className="text-center text-xs mt-2 text-ilkal-maroon inline-flex items-center gap-1.5 justify-center w-full">
        <Camera className="w-3.5 h-3.5" /> Live photo &amp; video proof of your saree + packing appears here once recorded.
      </p>

      <form onSubmit={track} className="mt-6 flex gap-2 max-w-md mx-auto">
        <input value={oid} onChange={e => setOid(e.target.value)}
          placeholder="Enter Order ID"
          className="flex-1 px-4 py-3 rounded-full bg-white border border-ilkal-gold/30 focus:outline-none focus:border-ilkal-maroon shadow-sm" />
        <button className="btn-primary">Track</button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-10 bg-white rounded-3xl shadow-xl border border-ilkal-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-70">Order</div>
              <div className="font-serif text-xl text-ilkal-maroon">{result.id}</div>
            </div>
            <span className="chip">Live</span>
          </div>

          {/* Photo & video proof panel */}
          {result.proof?.ready ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl silk-gradient grid place-items-center shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-sm">
                  <h3 className="font-semibold text-ilkal-maroon">Live photo &amp; video proof — ready</h3>
                  <p className="opacity-80 mt-0.5 leading-relaxed">
                    Full saree shown unfolded for non-damage proof, plus the packing video. Never draped on a lady, never worn.
                  </p>
                  <p className="text-xs opacity-70 mt-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-green-700" />
                    Link also sent on WhatsApp to {result.proof.whatsappSentTo} · recorded {result.proof.recordedAt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={result.proof.url} target="_blank" rel="noreferrer"
                      className="btn-primary text-sm py-2 px-4">
                      <Camera className="w-4 h-4" /> View photos &amp; video <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-ilkal-gold/30 bg-ilkal-cream/60 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-ilkal-gold/40 grid place-items-center shrink-0">
                  <Clock className="w-5 h-5 text-ilkal-maroon" />
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-ilkal-maroon">Photo &amp; video proof — coming shortly</h3>
                  <p className="opacity-80 mt-0.5 leading-relaxed">
                    I’ll record your saree (full drape + packing) shortly after the order is confirmed. The link will
                    appear right here and will also be sent to your WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ol className="mt-6 space-y-5">
            {result.stages.map((st, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full grid place-items-center shadow ${st.done ? 'silk-gradient text-white' : 'bg-ilkal-cream text-ilkal-maroon border border-ilkal-gold/40'}`}>
                    <st.icon className="w-5 h-5" />
                  </div>
                  {i < result.stages.length - 1 && (
                    <div className={`w-0.5 flex-1 ${st.done ? 'bg-ilkal-gold' : 'bg-ilkal-gold/20'}`} style={{ minHeight: 30 }} />
                  )}
                </div>
                <div className="pb-2">
                  <div className="font-semibold text-ilkal-maroon">{st.t}</div>
                  <div className="text-sm opacity-80">{st.s}</div>
                  <div className="text-xs opacity-60 mt-0.5">{st.time}</div>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}

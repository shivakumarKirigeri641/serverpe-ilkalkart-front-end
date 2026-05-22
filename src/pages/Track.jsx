import { useState } from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, PackageSearch, Truck, MapPin, Sparkles } from 'lucide-react';

export default function Track() {
  const [oid, setOid] = useState('');
  const [result, setResult] = useState(null);

  const track = (e) => {
    e.preventDefault();
    if (!oid.trim()) return;
    const stages = [
      { icon: PackageCheck, t: 'Order Confirmed', s: 'Your saree booking is received', done: true, time: 'Today, 09:12 AM' },
      { icon: Sparkles, t: 'Hand-picked from Ilkal', s: 'Personally selected at the loom', done: true, time: 'Today, 04:30 PM' },
      { icon: PackageSearch, t: 'Quality Checked & Packed', s: 'Wrapped with care in muslin cloth', done: true, time: 'Tomorrow, 11:00 AM' },
      { icon: Truck, t: 'Out for Delivery', s: 'On the way to your doorstep', done: false, time: 'In transit' },
      { icon: MapPin, t: 'Delivered', s: 'Drape and shine!', done: false, time: 'Soon' }
    ];
    setResult({ id: oid.toUpperCase(), stages });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl sm:text-4xl text-ilkal-maroon text-center">Track my Saree</h1>
      <p className="text-center opacity-70 mt-2">Enter your Order ID (e.g. <b>IK12345678</b>) to follow your saree’s journey.</p>

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

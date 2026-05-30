import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { usePolicy } from '../api/queries.js';
import logo from '../images/logo/ilkalKart_logo.png';

export default function Policy() {
  const { slug } = useParams();
  const { data: policy, isLoading, isError, error } = usePolicy(slug);

  const items = policy?.items || [];

  return (
    <div className="bg-stone-50 min-h-screen">
      <section className="relative pt-16 sm:pt-24 pb-10 px-5 sm:px-8">
        <div className="absolute inset-0 theater-radial pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-stone-100 ring-1 ring-stone-200 grid place-items-center overflow-hidden shrink-0">
              <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain mix-blend-multiply" />
            </span>
            <span className="eyebrow">Policy</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 font-display font-extrabold tracking-display text-4xl sm:text-6xl text-stone-900 leading-[0.95]">
            {policy?.label || 'Loading…'}
          </motion.h1>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-3xl mx-auto">
          {isLoading && (
            <div className="flex items-center gap-3 text-stone-500 py-16 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading policy…
            </div>
          )}

          {isError && (
            <div className="flex items-start gap-3 rounded-4xl bg-rose-50 ring-1 ring-rose-100 text-rose-700 p-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{error?.message || 'Could not load this policy. Please try again later.'}</p>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex items-center gap-3 text-stone-500 py-16 justify-center">
              <ShieldCheck className="w-5 h-5" /> No details available yet.
            </div>
          )}

          <ol className="space-y-5">
            {items.map((item, i) => (
              <motion.li key={item.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45 }}
                className="rounded-4xl bg-white border border-stone-200 shadow-card p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid place-items-center w-9 h-9 rounded-2xl bg-stone-900 text-stone-50 shrink-0 font-display font-bold text-sm tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    {item.title && (
                      <h2 className="font-display font-bold tracking-display text-lg sm:text-xl text-stone-900 leading-snug">
                        {item.title}
                      </h2>
                    )}
                    <p className="mt-2 text-stone-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

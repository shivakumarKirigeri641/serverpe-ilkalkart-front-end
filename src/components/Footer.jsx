import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Heart, MessageCircle, ArrowUpRight } from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';
import { usePolicies } from '../api/queries.js';

const social = [
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  const { data: policies = [] } = usePolicies();
  return (
    <footer className="mt-24 bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-stone-50 grid place-items-center overflow-hidden">
              <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <h3 className="font-display font-extrabold tracking-display text-2xl text-stone-50">
              Ilkal Kart<sup className="text-[0.5em] align-super ml-0.5 text-stone-500">™</sup>
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-stone-400">
            Material, craft and trust — every Ilkal saree hand-picked in person from
            the loom, shot in raw daylight, packed by one founder.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-6">
            {social.map(({ icon: Icon, label }) => (
              <button key={label} type="button" aria-label={label}
                className="w-10 h-10 rounded-full border-2 border-stone-700 grid place-items-center text-stone-300 hover:border-wood hover:text-stone-50 transition-colors">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Shop</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/browse" className="hover:text-stone-50 transition-colors">All Sarees</Link></li>
            <li><Link to="/browse" className="hover:text-stone-50 transition-colors">Bridal Collection</Link></li>
            <li><Link to="/browse" className="hover:text-stone-50 transition-colors">Daily Cotton</Link></li>
            <li><Link to="/browse" className="hover:text-stone-50 transition-colors">Premium Silk</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Policies</h4>
          <ul className="space-y-3 text-sm">
            {policies.map((p) => (
              <li key={p.slug}>
                <a href={`/policy/${p.slug}`} target="_blank" rel="noopener noreferrer"
                  className="hover:text-stone-50 transition-colors">
                  {p.label}
                </a>
              </li>
            ))}
            <li><Link to="/track" className="hover:text-stone-50 transition-colors">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Reach me</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="https://wa.me/916363271302" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-stone-50 transition-colors">
                <MessageCircle className="w-4 h-4 text-wood" /> +91 63632 71302
              </a>
            </li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-wood" /> support@serverpe.in</li>
          </ul>
          <Link to="/contact" className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-stone-50 border-b-2 border-wood pb-0.5 hover:border-stone-50 transition-colors">
            Get in touch <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 text-xs flex flex-col sm:flex-row gap-2 justify-between items-center text-stone-500">
          <div className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-wood fill-wood" /> from the daughters of Ilkal.
          </div>
          <div>
            © {new Date().getFullYear()} Ilkal Kart<sup className="align-super">™</sup>. All rights reserved.
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-6 text-center text-[11px] tracking-wide text-stone-600 leading-relaxed">
          Powered by <b className="text-stone-400">ServerPe App Solutions</b> — my own parent platform that
          designs, hosts and maintains hand-picked projects like Ilkal Kart<sup className="align-super">™</sup>.
        </div>
      </div>
    </footer>
  );
}

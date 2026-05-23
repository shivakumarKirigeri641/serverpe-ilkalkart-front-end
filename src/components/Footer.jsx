import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Heart, MessageCircle } from 'lucide-react';
import logo from '../images/logo/ilkalKart_logo.png';

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-ilkal-deep via-ilkal-maroon to-ilkal-deep text-ilkal-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white grid place-items-center shadow ring-1 ring-ilkal-gold/40 overflow-hidden">
              <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-serif text-2xl text-ilkal-gold">
              Ilkal Kart<sup className="text-xs align-super ml-0.5 opacity-90">™</sup>
            </h3>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            Pure, Authentic, Genuine, Elegance — hand-picked in person from Ilkal village.
            Tradition delivered with trust, care and love.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button type="button" aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-ilkal-gold hover:text-ilkal-deep transition">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-ilkal-gold hover:text-ilkal-deep transition">
              <Instagram className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-ilkal-gold hover:text-ilkal-deep transition">
              <Facebook className="w-4 h-4" />
            </button>
            <button type="button" aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-ilkal-gold hover:text-ilkal-deep transition">
              <Youtube className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-ilkal-gold font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browse" className="hover:text-ilkal-gold">All Sarees</Link></li>
            <li><Link to="/browse" className="hover:text-ilkal-gold">Bridal Collection</Link></li>
            <li><Link to="/browse" className="hover:text-ilkal-gold">Daily Cotton</Link></li>
            <li><Link to="/browse" className="hover:text-ilkal-gold">Premium Silk</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ilkal-gold font-semibold mb-3">Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><button type="button" className="hover:text-ilkal-gold text-left">Terms & Conditions</button></li>
            <li><button type="button" className="hover:text-ilkal-gold text-left">Authenticity Promise</button></li>
            <li><button type="button" className="hover:text-ilkal-gold text-left">Shipping Policy</button></li>
            <li><button type="button" className="hover:text-ilkal-gold text-left">Privacy Policy</button></li>
            <li><Link to="/track" className="hover:text-ilkal-gold">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ilkal-gold font-semibold mb-3">Reach me @</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://wa.me/916363271302" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-ilkal-gold transition">
                <MessageCircle className="w-4 h-4 text-ilkal-gold" /> +91 63632 71302
              </a>
            </li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-ilkal-gold" /> support@serverpe.in</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs flex flex-col sm:flex-row gap-2 justify-between items-center opacity-90">
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-ilkal-gold fill-ilkal-gold" /> from the daughters of Ilkal.
          </div>
          <div>
            © {new Date().getFullYear()} Ilkal Kart<sup className="align-super">™</sup>. All rights reserved — Powered by: ServerPe App Solutions.
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 text-center text-[10px] text-ilkal-cream/70 leading-relaxed">
          “Ilkal Kart<sup className="align-super">™</sup>” is an <b>unregistered trademark</b> — application filed and
          pending approval. Use of the <sup className="align-super">™</sup> symbol indicates a claim of common-law
          rights; it does not denote registered status.
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 text-center text-[11px] tracking-wider text-ilkal-gold/90 leading-relaxed">
          Powered by: <b className="text-ilkal-gold">ServerPe App Solutions</b> — my own parent platform that
          designs, hosts and maintains hand-picked projects like Ilkal Kart<sup className="align-super">™</sup>.
        </div>
      </div>
    </footer>
  );
}

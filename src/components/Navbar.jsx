import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import logo from '../images/logo/ilkalKart_logo.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse Sarees' },
  { to: '/bulk', label: 'Bulk Orders' },
  { to: '/track', label: 'Track my Saree' },
  { to: '/purchase-history', label: 'Purchase History' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/feedback', label: 'Feedback' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  const goBack = () => { if (window.history.length > 1) nav(-1); else nav('/'); };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-ilkal-gold/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-1.5 sm:gap-2">
        {/* Mobile: hamburger menu */}
        <button
          className="md:hidden p-2 rounded-full bg-white shadow active:scale-95 transition shrink-0"
          onClick={() => setOpen(o => !o)} aria-label="menu">
          {open ? <X className="w-5 h-5 text-ilkal-maroon" /> : <Menu className="w-5 h-5 text-ilkal-maroon" />}
        </button>

        {/* Desktop: back button on non-home pages */}
        {!isHome && (
          <button onClick={goBack} aria-label="back"
            className="hidden md:grid place-items-center w-9 h-9 rounded-full bg-white shadow active:scale-90 transition shrink-0">
            <ChevronLeft className="w-5 h-5 text-ilkal-maroon" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white grid place-items-center shadow-md ring-1 ring-ilkal-gold/40 overflow-hidden shrink-0">
            <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-serif text-base sm:text-xl text-ilkal-maroon font-bold truncate">Ilkal Kart</div>
            <div className="hidden sm:block text-[10px] tracking-widest text-ilkal-gold -mt-1 truncate">
              PURE • AUTHENTIC • GENUINE • ELEGANCE
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive ? 'bg-ilkal-maroon text-white shadow-md'
                           : 'text-ilkal-deep hover:bg-ilkal-maroon/10'
                }`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <Link to="/checkout" aria-label="cart"
            className="relative p-2 rounded-full bg-white shadow hover:shadow-lg transition">
            <ShoppingBag className="w-5 h-5 text-ilkal-maroon" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-ilkal-gold text-ilkal-deep text-[10px] font-bold min-w-[1.25rem] h-5 px-1 grid place-items-center rounded-full shadow">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white/95 border-t border-ilkal-gold/20">
            <div className="px-4 py-3 flex flex-col">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-base font-medium ${
                      isActive ? 'bg-ilkal-maroon text-white' : 'text-ilkal-deep hover:bg-ilkal-maroon/10'
                    }`}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

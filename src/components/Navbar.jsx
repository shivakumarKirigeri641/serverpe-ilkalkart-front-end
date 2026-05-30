import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, ChevronLeft, Search } from 'lucide-react';
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
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 md:h-20 flex items-center gap-2">
        {/* Mobile: hamburger */}
        <button
          className="md:hidden grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-900 active:scale-95 transition shrink-0"
          onClick={() => setOpen(o => !o)} aria-label="menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop: back button on non-home pages */}
        {!isHome && (
          <button onClick={goBack} aria-label="back"
            className="hidden md:grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-900 hover:border-stone-900 active:scale-90 transition shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Logo — bold display wordmark on the left */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-stone-100 grid place-items-center overflow-hidden shrink-0 ring-1 ring-stone-200">
            <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="leading-none min-w-0">
            <div className="font-display font-extrabold tracking-display text-lg md:text-2xl text-stone-900 truncate">
              Ilkal Kart
            </div>
            <div className="hidden sm:block text-[10px] font-medium tracking-[0.22em] text-stone-400 mt-0.5 truncate">
              MATERIAL · CRAFT · TRUST
            </div>
          </div>
        </Link>

        {/* Centered nav links */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'bg-stone-900 text-stone-50'
                           : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: search + cart with dot/count badge */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Link to="/browse" aria-label="search"
            className="hidden sm:grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition">
            <Search className="w-[18px] h-[18px]" />
          </Link>
          <Link to="/checkout" aria-label="cart"
            className="relative grid place-items-center w-10 h-10 rounded-full border-2 border-stone-200 text-stone-900 hover:border-stone-900 transition">
            <ShoppingBag className="w-[18px] h-[18px]" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-stone-50 text-[10px] font-bold min-w-[1.25rem] h-5 px-1 grid place-items-center rounded-full">
                {count}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wood" />
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
            className="md:hidden overflow-hidden glass-white border-t border-stone-200">
            <div className="px-4 py-3 flex flex-col">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                      isActive ? 'bg-stone-900 text-stone-50' : 'text-stone-700 hover:bg-stone-100'
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

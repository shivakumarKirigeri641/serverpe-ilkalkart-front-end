import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, LogIn, LogOut, LayoutDashboard, Package, User, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../images/logo/ilkalKart_logo.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse Sarees' },
  { to: '/bulk', label: 'Bulk Orders' },
  { to: '/track', label: 'Track my Saree' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/feedback', label: 'Feedback' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const profileRef = useRef(null);
  const isHome = loc.pathname === '/';
  const goBack = () => { if (window.history.length > 1) nav(-1); else nav('/'); };

  useEffect(() => {
    const onClick = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doLogout = () => { logout(); setProfileOpen(false); toast.success('Logged out 💛'); nav('/'); };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-ilkal-gold/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2">
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

          {!user ? (
            <div className="flex items-center gap-2 sm:pl-2 sm:ml-1 sm:border-l sm:border-ilkal-gold/30">
              <Link to="/login" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-ilkal-gold/40 text-ilkal-maroon font-medium text-sm shadow hover:shadow-lg transition">
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link to="/login?mode=signup" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-medium text-sm shadow silk-gradient hover:shadow-lg transition">
                Sign up
              </Link>
              <Link to="/login" className="sm:hidden p-2 rounded-full bg-white shadow" aria-label="login">
                <LogIn className="w-5 h-5 text-ilkal-maroon" />
              </Link>
            </div>
          ) : (
            <div className="relative sm:pl-2 sm:ml-1 sm:border-l sm:border-ilkal-gold/30" ref={profileRef}>
              <button onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white shadow hover:shadow-lg transition">
                <div className="w-8 h-8 rounded-full silk-gradient text-white grid place-items-center font-bold text-sm">
                  {user.avatar}
                </div>
                <span className="hidden sm:block text-sm font-medium text-ilkal-maroon max-w-[7rem] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-ilkal-gold/30 overflow-hidden">
                    <div className="p-4 silk-gradient text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white text-ilkal-maroon grid place-items-center font-bold">{user.avatar}</div>
                        <div className="leading-tight">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-xs opacity-90">+91 {user.mobile}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <DropItem to="/dashboard" onClick={() => setProfileOpen(false)} icon={LayoutDashboard}>Dashboard</DropItem>
                      <DropItem to="/dashboard" onClick={() => setProfileOpen(false)} icon={Package}>Purchase History</DropItem>
                      <DropItem to="/track" onClick={() => setProfileOpen(false)} icon={ShoppingBag}>Track Saree</DropItem>
                      <DropItem to="/dashboard" onClick={() => setProfileOpen(false)} icon={User}>Profile</DropItem>
                      <button onClick={doLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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
              <div className="border-t border-ilkal-gold/20 my-2" />
              {!user ? (
                <div className="flex gap-2 px-2 pb-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-white border border-ilkal-gold/40 text-ilkal-maroon font-medium text-center">Login</Link>
                  <Link to="/login?mode=signup" onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-xl silk-gradient text-white font-medium text-center">Sign up</Link>
                </div>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-base font-medium text-ilkal-deep hover:bg-ilkal-maroon/10">Dashboard</Link>
                  <button onClick={() => { setOpen(false); doLogout(); }} className="text-left px-4 py-3 rounded-xl text-base font-medium text-red-700 hover:bg-red-50">Logout</button>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropItem({ to, onClick, icon: Icon, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-ilkal-deep hover:bg-ilkal-maroon/10">
      <Icon className="w-4 h-4 text-ilkal-maroon" /> {children}
    </Link>
  );
}

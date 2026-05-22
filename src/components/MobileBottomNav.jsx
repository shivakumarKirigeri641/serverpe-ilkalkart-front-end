import { NavLink } from 'react-router-dom';
import { Home, Sparkles, ShoppingBag, User, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const items = [
  { to: '/',        label: 'Home',    icon: Home },
  { to: '/browse',  label: 'Browse',  icon: Sparkles },
  { to: '/track',   label: 'Track',   icon: Truck },
  { to: '/checkout',label: 'Bag',     icon: ShoppingBag, badge: 'cart' },
  { to: '/account', label: 'Account', icon: User, dynamic: true }
];

export default function MobileBottomNav() {
  const { count } = useCart();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-ilkal-gold/30 shadow-[0_-4px_20px_rgba(123,30,58,0.08)]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const to = it.dynamic ? (user ? '/dashboard' : '/login') : it.to;
          return (
            <li key={it.label}>
              <NavLink to={to} end={to === '/'}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 gap-0.5 transition ${
                    isActive ? 'text-ilkal-maroon' : 'text-ilkal-deep/70'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <span className={`relative w-10 h-10 grid place-items-center rounded-full transition-all duration-300 ${
                      isActive ? 'silk-gradient text-white shadow-md scale-105' : ''
                    }`}>
                      <Icon className="w-5 h-5" />
                      {it.badge === 'cart' && count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-ilkal-gold text-ilkal-deep text-[10px] font-bold w-4 h-4 grid place-items-center rounded-full shadow">
                          {count}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-medium tracking-wide">{it.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Sparkles, ShoppingBag, Truck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

const items = [
  { to: '/',                  label: 'Home',     icon: Home },
  { to: '/browse',            label: 'Browse',   icon: Sparkles },
  { to: '/track',             label: 'Track',    icon: Truck },
  { to: '/checkout',          label: 'Bag',      icon: ShoppingBag, badge: 'cart' },
  { to: '/purchase-history',  label: 'History',  icon: Package }
];

export default function MobileBottomNav() {
  const { count } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-stone-200"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <NavLink to={it.to} end={it.to === '/'}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
                    isActive ? 'text-stone-900' : 'text-stone-400'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <span className={`relative w-10 h-10 grid place-items-center rounded-full transition-all duration-300 ease-showroom ${
                      isActive ? 'bg-stone-900 text-stone-50 scale-105' : ''
                    }`}>
                      <Icon className="w-5 h-5" />
                      {it.badge === 'cart' && count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-wood text-stone-900 text-[10px] font-bold w-4 h-4 grid place-items-center rounded-full">
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

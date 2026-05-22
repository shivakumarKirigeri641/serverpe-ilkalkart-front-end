import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Package, Truck, Heart, MapPin, Bell, ShieldCheck, LogOut,
  ChevronRight, ShoppingBag, Sparkles, Phone, Mail, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadInvoice } from '../utils/invoice.js';

export default function Dashboard() {
  const { user, logout, update } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', mobile: '' });

  useEffect(() => {
    try { setOrders(JSON.parse(localStorage.getItem('ilkal_orders')) || []); } catch {}
  }, []);
  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '', mobile: user.mobile || '' });
  }, [user]);

  if (!user) return <Navigate to="/login?next=/dashboard" replace />;

  const sections = [
    { key: 'overview', label: 'Overview', icon: Sparkles },
    { key: 'orders', label: 'Purchase History', icon: Package },
    { key: 'track', label: 'Track Saree', icon: Truck },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: ShieldCheck }
  ];

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalSarees = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  const doLogout = () => { logout(); toast.success('Logged out — see you soon 💛'); nav('/'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl silk-gradient p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white text-ilkal-maroon grid place-items-center text-2xl font-bold font-serif shadow-lg">
            {user.avatar}
          </div>
          <div>
            <p className="text-xs opacity-90 tracking-widest">NAMASKARA</p>
            <h1 className="font-serif text-2xl sm:text-3xl">{user.name}</h1>
            <p className="text-xs opacity-90">+91 {user.mobile}</p>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3 max-w-md">
          <Stat label="Orders" value={orders.length} />
          <Stat label="Sarees" value={totalSarees} />
          <Stat label="Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} />
        </div>
      </motion.div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-3xl p-3 shadow-md border border-ilkal-gold/20 h-fit lg:sticky lg:top-20">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {sections.map(s => (
              <button key={s.key} onClick={() => setTab(s.key)}
                className={`shrink-0 lg:w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === s.key ? 'bg-ilkal-maroon text-white shadow' : 'text-ilkal-deep hover:bg-ilkal-maroon/10'
                }`}>
                <s.icon className="w-4 h-4" /> {s.label}
              </button>
            ))}
            <button onClick={doLogout}
              className="shrink-0 lg:w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="min-h-[400px]">
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Card title="Continue shopping" desc="Discover this week’s freshly hand-picked Ilkals." cta="Browse Sarees" to="/browse" icon={ShoppingBag} />
              <Card title="Track your saree" desc="Follow your order from the loom to your door." cta="Track now" to="/track" icon={Truck} />
              <Card title="Refer a friend" desc="Share Ilkal Kart and earn ₹250 per friend." cta="Coming soon" icon={Heart} disabled />
              <Card title="Talk to Shiva" desc="Need help, custom weave, or bulk order?" cta="Contact" to="/contact" icon={Phone} />
            </div>
          )}

          {tab === 'orders' && (
            <Panel title="Purchase History">
              {orders.length === 0 ? (
                <Empty msg="No orders yet — your story with Ilkal begins with one drape." to="/browse" cta="Browse Sarees" />
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-ilkal-gold/20">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="text-xs opacity-60">Order ID</div>
                          <div className="font-semibold text-ilkal-maroon">{o.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-60">{new Date(o.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="font-bold">₹{o.total.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {o.items.map(it => (
                          <div key={it.id} className="shrink-0 flex items-center gap-2 bg-ilkal-cream rounded-xl p-1.5 pr-3 border border-ilkal-gold/30">
                            <img src={it.images[0]} className="w-10 h-12 rounded-lg object-cover" />
                            <div className="text-xs">
                              <div className="font-semibold text-ilkal-maroon">{it.name}</div>
                              <div className="opacity-70">Qty {it.qty}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Link to="/track" className="chip">Track</Link>
                        <span className="chip">Delivered</span>
                        <button
                          onClick={() => { try { downloadInvoice(o); toast.success('Invoice downloaded'); } catch { toast.error('Could not generate invoice'); } }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-ilkal-maroon text-white shadow hover:shadow-md transition">
                          <Download className="w-3 h-3" /> Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {tab === 'track' && (
            <Panel title="Track Saree">
              <p className="text-sm opacity-80">Head to the tracking page with your order ID.</p>
              <Link to="/track" className="btn-primary mt-4 inline-flex">Open Tracker <ChevronRight className="w-4 h-4" /></Link>
            </Panel>
          )}

          {tab === 'wishlist' && (
            <Panel title="Wishlist">
              <Empty msg="Save the sarees you love — they’ll wait for you here." to="/browse" cta="Find favourites" />
            </Panel>
          )}

          {tab === 'addresses' && (
            <Panel title="Saved Addresses">
              <Empty msg="No saved address yet. Add one at checkout to ship faster next time." to="/browse" cta="Shop now" />
            </Panel>
          )}

          {tab === 'profile' && (
            <Panel title="My Profile">
              <div className="grid sm:grid-cols-2 gap-3">
                <Pf label="Full Name" icon={User}>
                  {editing
                    ? <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="pf-input" />
                    : <span>{user.name}</span>}
                </Pf>
                <Pf label="Mobile" icon={Phone}><span>+91 {user.mobile}</span></Pf>
                <Pf label="Email" icon={Mail}>
                  {editing
                    ? <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="pf-input" placeholder="your@email.com" />
                    : <span>{user.email || <span className="opacity-50">Not added</span>}</span>}
                </Pf>
                <Pf label="Member since" icon={Sparkles}>
                  <span>{new Date(user.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </Pf>
              </div>
              <div className="mt-4 flex gap-2">
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
                ) : (
                  <>
                    <button onClick={() => { update({ name: profile.name, email: profile.email }); setEditing(false); toast.success('Profile updated'); }} className="btn-primary">Save</button>
                    <button onClick={() => setEditing(false)} className="btn-gold">Cancel</button>
                  </>
                )}
              </div>
              <style>{`.pf-input{width:100%;padding:6px 10px;border-radius:10px;background:#fff;border:1px solid rgba(201,162,39,.4);outline:none}`}</style>
            </Panel>
          )}

          {tab === 'notifications' && (
            <Panel title="Notifications">
              <div className="space-y-2">
                {[
                  { t: 'Your order IK20251201 has been hand-picked from Ilkal!', d: '2 hours ago' },
                  { t: 'New Bridal Collection just arrived — peek inside.', d: 'Yesterday' },
                  { t: 'Welcome to Ilkal Kart 💛', d: 'Today' }
                ].map((n, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-ilkal-gold/20 flex gap-3">
                    <div className="w-9 h-9 rounded-full silk-gradient grid place-items-center"><Bell className="w-4 h-4 text-white" /></div>
                    <div className="flex-1">
                      <div className="text-sm">{n.t}</div>
                      <div className="text-xs opacity-60 mt-0.5">{n.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === 'security' && (
            <Panel title="Security">
              <div className="space-y-3 text-sm">
                <Row k="Login method" v="OTP via Mobile" />
                <Row k="Two-factor" v="Enabled (OTP)" />
                <Row k="Last login" v="Just now" />
                <button onClick={doLogout} className="btn-primary mt-3 bg-red-600 hover:!bg-red-700" style={{ background: '#b91c1c' }}>
                  <LogOut className="w-4 h-4" /> Logout from this device
                </button>
              </div>
            </Panel>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center border border-white/20">
      <div className="font-bold text-lg">{value}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-90">{label}</div>
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-ilkal-gold/20">
      <h2 className="font-serif text-2xl text-ilkal-maroon mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Card({ title, desc, cta, to, icon: Icon, disabled }) {
  const inner = (
    <div className={`bg-white rounded-3xl p-5 shadow-md border border-ilkal-gold/20 hover:shadow-xl transition ${disabled ? 'opacity-60' : ''}`}>
      <div className="w-10 h-10 rounded-2xl silk-gradient grid place-items-center"><Icon className="w-5 h-5 text-white" /></div>
      <h3 className="font-serif text-lg text-ilkal-maroon mt-3">{title}</h3>
      <p className="text-sm opacity-80 mt-1">{desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-ilkal-maroon font-semibold text-sm">
        {cta} <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
  return disabled || !to ? inner : <Link to={to}>{inner}</Link>;
}
function Empty({ msg, to, cta }) {
  return (
    <div className="text-center py-10">
      <div className="text-5xl">🌸</div>
      <p className="opacity-80 mt-2">{msg}</p>
      <Link to={to} className="btn-primary mt-4 inline-flex">{cta}</Link>
    </div>
  );
}
function Pf({ label, icon: Icon, children }) {
  return (
    <div className="bg-ilkal-cream rounded-2xl p-3 border border-ilkal-gold/30">
      <div className="text-xs opacity-70 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-ilkal-maroon" /> {label}</div>
      <div className="mt-1 font-semibold text-ilkal-maroon text-sm">{children}</div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between bg-ilkal-cream rounded-xl px-3 py-2 border border-ilkal-gold/30">
      <span className="opacity-80">{k}</span>
      <span className="font-semibold text-ilkal-maroon">{v}</span>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../images/logo/ilkalKart_logo.png';

const DEMO_OTP = '1234';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();
  const isSignup = new URLSearchParams(loc.search).get('mode') === 'signup';
  const redirect = new URLSearchParams(loc.search).get('next') || '/dashboard';

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendIn, setResendIn] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = (e) => {
    e?.preventDefault();
    if (isSignup && form.name.trim().length < 2) { toast.error('Enter your full name'); return; }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { toast.error('Enter valid 10-digit mobile'); return; }
    setStep('otp');
    setResendIn(30);
    toast.success(`OTP sent to +91 ${form.mobile} (demo: ${DEMO_OTP})`);
    setTimeout(() => refs.current[0]?.focus(), 100);
  };

  const onOtpChange = (i, v) => {
    const ch = v.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[i] = ch; setOtp(next);
    if (ch && i < 3) refs.current[i + 1]?.focus();
  };
  const onOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code !== DEMO_OTP) { toast.error('Invalid OTP. Hint: 1234'); return; }
    login({ name: form.name || ('Guest ' + form.mobile.slice(-4)), mobile: form.mobile });
    toast.success(isSignup ? 'Welcome to Ilkal Kart 💛' : 'Welcome back!');
    nav(redirect, { replace: true });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 silk-gradient opacity-90" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=70')] bg-cover bg-center opacity-25" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-ilkal-gold/30">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white ring-2 ring-ilkal-gold/50 shadow overflow-hidden">
            <img src={logo} alt="Ilkal Kart" className="w-full h-full object-contain p-1.5" />
          </div>
          <h1 className="font-serif text-2xl text-ilkal-maroon mt-3">
            {step === 'otp' ? 'Verify your number' : isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-xs opacity-70 mt-1">
            {step === 'otp'
              ? <>We sent a 4-digit code to <b>+91 {form.mobile}</b></>
              : 'Quick & secure — only your mobile is needed.'}
          </p>
          {step !== 'otp' && (
            <div className="mt-4 w-full text-[11px] bg-green-50 text-green-800 border border-green-200 rounded-xl px-3 py-2 leading-relaxed">
              <b>Login is optional for purchase.</b> You can buy any saree without signing up — just go to{' '}
              <Link to="/browse" className="underline font-semibold">Browse</Link>, add to bag, fill your delivery details and pay.
              <br />
              An account is needed only for <b>order tracking</b>, your <b>dashboard</b>, <b>purchase history</b>, <b>profile updates</b> and more.
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form key="details" onSubmit={sendOtp}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="mt-6 space-y-3">
              {isSignup && (
                <Field icon={User} label="Full Name">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your beautiful name"
                    className="w-full bg-transparent outline-none text-ilkal-deep" />
                </Field>
              )}
              <Field icon={Phone} label="Mobile">
                <span className="text-sm opacity-70 mr-1">+91</span>
                <input value={form.mobile} maxLength={10} inputMode="numeric"
                  onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile"
                  className="w-full bg-transparent outline-none text-ilkal-deep" />
              </Field>
              <button className="btn-primary w-full">
                Send OTP <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm opacity-80">
                {isSignup ? 'Already a member?' : 'New to Ilkal Kart?'}{' '}
                <Link to={`/login${isSignup ? '' : '?mode=signup'}`} className="text-ilkal-maroon font-semibold underline">
                  {isSignup ? 'Login' : 'Sign up'}
                </Link>
              </p>
            </motion.form>
          ) : (
            <motion.form key="otp" onSubmit={verify}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="mt-6 space-y-4">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((d, i) => (
                  <input key={i} ref={el => refs.current[i] = el}
                    value={d} onChange={e => onOtpChange(i, e.target.value)}
                    onKeyDown={e => onOtpKey(i, e)}
                    inputMode="numeric" maxLength={1}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-2xl bg-ilkal-cream border-2 border-ilkal-gold/40 focus:border-ilkal-maroon focus:outline-none text-ilkal-maroon shadow-inner" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs opacity-70">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" /> Demo OTP: <b className="text-ilkal-maroon">1234</b>
              </div>
              <button className="btn-primary w-full">Verify & Continue</button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => setStep('details')} className="text-ilkal-maroon underline">Change number</button>
                <button type="button" disabled={resendIn > 0}
                  onClick={() => { setResendIn(30); toast.success(`OTP resent (demo: ${DEMO_OTP})`); }}
                  className="text-ilkal-maroon font-semibold flex items-center gap-1 disabled:opacity-50">
                  <RotateCw className="w-3.5 h-3.5" /> {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 text-[11px] text-center opacity-60">
          By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-2xl bg-ilkal-cream border border-ilkal-gold/30 focus-within:border-ilkal-maroon transition">
        <Icon className="w-4 h-4 text-ilkal-maroon" />
        {children}
      </div>
    </div>
  );
}

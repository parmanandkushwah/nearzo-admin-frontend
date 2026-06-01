import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import logo from '../../assets/nearzo-logo.png';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Leaf = ({ style, flip, color = 'rgba(185,160,255,0.55)' }) => (
  <svg viewBox="0 0 40 60" style={style} className="absolute">
    <path
      d={flip ? 'M20 55 C5 40 0 20 20 5 C40 20 35 40 20 55Z' : 'M20 5 C5 20 0 40 20 55 C40 40 35 20 20 5Z'}
      fill={color}
    />
    <line x1="20" y1="5" x2="20" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
  </svg>
);

/* Decorative ring */
const Ring = ({ style }) => (
  <div className="absolute rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.15)', ...style }} />
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (result.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #ccc0ff 40%, #ccc0ff 70%, #20B883 100%)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite',
      }}
    >
      {/* Ambient orbs behind card */}
      <div className="fixed animate-float" style={{ top: '5%', left: '5%', width: 260, height: 260, borderRadius: '50%', background: 'rgba(50,211,154,0.15)', filter: 'blur(70px)', animationDelay: '0s' }} />
      <div className="fixed animate-float" style={{ bottom: '8%', right: '6%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(185,160,255,0.18)', filter: 'blur(80px)', animationDelay: '3s' }} />

      {/* ── Single Card ── */}
      <div
        className="relative z-10 w-full flex rounded-3xl overflow-hidden"
        style={{
          maxWidth: 900,
          minHeight: 540,
          boxShadow: '0 40px 100px -20px rgba(48,36,114,0.6), 0 0 0 1px rgba(255,255,255,0.12)',
        }}
      >

        {/* ══ LEFT — decorative panel ══ */}
        <div className="relative hidden md:flex md:w-[45%] flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #6C4CF1 0%, #ccc0ff 50%, #302472 100%)' }}
        >
          {/* ── Deep glow blobs ── */}
          <div className="absolute" style={{ bottom: '-10%', left: '-10%', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(50,211,154,0.4) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(50px)' }} />
          <div className="absolute" style={{ top: '-8%', right: '-8%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(185,160,255,0.3) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div className="absolute" style={{ top: '40%', left: '50%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(108,76,241,0.35) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(36px)', transform: 'translate(-50%,-50%)' }} />

          {/* ── Dot grid ── */}
          <div className="absolute inset-0 opacity-[0.09]" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }} />

          {/* ── Decorative rings ── */}
          <Ring style={{ width: 340, height: 340, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.12 }} />
          <Ring style={{ width: 460, height: 460, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.07 }} />
          <Ring style={{ width: 200, height: 200, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.18 }} />

          {/* ── Animated floating orbs ── */}
          <div className="absolute animate-float" style={{ top: '10%', left: '6%', width: 70, height: 70, borderRadius: '50%', background: 'rgba(50,211,154,0.28)', filter: 'blur(20px)', animationDelay: '0s' }} />
          <div className="absolute animate-float" style={{ bottom: '12%', right: '6%', width: 55, height: 55, borderRadius: '50%', background: 'rgba(185,160,255,0.32)', filter: 'blur(16px)', animationDelay: '2s' }} />
          <div className="absolute animate-float" style={{ top: '55%', left: '4%', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(10px)', animationDelay: '4s' }} />
          <div className="absolute animate-float" style={{ top: '20%', right: '8%', width: 28, height: 28, borderRadius: '50%', background: 'rgba(50,211,154,0.35)', filter: 'blur(8px)', animationDelay: '1s' }} />

          {/* ── Leaves ── */}
          <Leaf style={{ top: '8%',  left: '12%', width: 30, height: 46, transform: 'rotate(-22deg)' }} color="rgba(185,160,255,0.6)" />
          <Leaf style={{ top: '18%', left: '38%', width: 20, height: 30, transform: 'rotate(16deg)'  }} color="rgba(50,211,154,0.5)"  flip />
          <Leaf style={{ top: '6%',  right: '14%', width: 18, height: 28, transform: 'rotate(8deg)'  }} color="rgba(255,255,255,0.25)" />
          <Leaf style={{ bottom: '18%', left: '8%',  width: 26, height: 38, transform: 'rotate(30deg)'  }} color="rgba(50,211,154,0.45)" />
          <Leaf style={{ bottom: '28%', right: '10%', width: 18, height: 28, transform: 'rotate(-14deg)' }} color="rgba(185,160,255,0.5)" flip />
          <Leaf style={{ bottom: '8%',  right: '22%', width: 14, height: 22, transform: 'rotate(20deg)'  }} color="rgba(255,255,255,0.2)" />

          {/* ── Curved wave at bottom ── */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path d="M0,40 C100,80 300,0 400,40 L400,80 L0,80 Z" fill="rgba(50,211,154,0.18)" />
            <path d="M0,55 C120,20 280,70 400,50 L400,80 L0,80 Z" fill="rgba(255,255,255,0.07)" />
          </svg>

          {/* ── Brand title top ── */}
          <div className="absolute top-7 left-0 right-0 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#20B883', boxShadow: '0 0 8px rgba(50,211,154,0.8)' }} />
              <span className="text-white/80 text-xs font-bold tracking-[0.25em] uppercase">Nearzo</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#20B883', boxShadow: '0 0 8px rgba(50,211,154,0.8)' }} />
            </div>
            <div style={{ width: 40, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
          </div>

          {/* ── Phone illustration ── */}
          <div className="relative z-10 flex items-center justify-center mt-6">
            {/* Outer glow ring */}
            <div className="absolute rounded-full animate-pulse-glow" style={{ width: 220, height: 220, background: 'rgba(50,211,154,0.12)', border: '1px solid rgba(50,211,154,0.25)' }} />
            {/* Inner glow */}
            <div className="absolute" style={{ width: 170, height: 170, borderRadius: '50%', background: 'rgba(50,211,154,0.2)', filter: 'blur(30px)' }} />

            {/* Phone body */}
            <div className="relative" style={{ width: 148, height: 268, borderRadius: 34, border: '6px solid rgba(10,6,30,0.9)', background: 'linear-gradient(170deg, #5A3DDA 0%, #20B883 100%)', boxShadow: '0 30px 80px -20px rgba(108,76,241,0.75), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
              {/* Screen shine */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
                {/* Vertical shine streak */}
                <div style={{ position: 'absolute', top: '10%', left: '20%', width: 6, height: '35%', background: 'rgba(255,255,255,0.12)', borderRadius: 99, transform: 'rotate(-10deg)' }} />
              </div>

              {/* Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,6,30,0.7)' }} />
                <div style={{ width: 28, height: 6, background: 'rgba(10,6,30,0.8)', borderRadius: 99 }} />
              </div>

              {/* Mini app icons on screen */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.2)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }} />
                ))}
              </div>

              {/* Person */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* Head */}
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }} />
                {/* Body */}
                <div style={{ width: 44, height: 48, marginTop: 3, background: 'rgba(255,255,255,0.78)', borderRadius: '12px 12px 0 0', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {/* Tie */}
                  <div style={{ width: 8, height: 28, margin: '6px auto 0', background: 'rgba(108,76,241,0.7)', borderRadius: '2px 2px 4px 4px' }} />
                </div>
                {/* Legs */}
                <div className="flex gap-2">
                  <div style={{ width: 16, height: 18, background: 'rgba(255,255,255,0.65)', borderRadius: '0 0 6px 6px' }} />
                  <div style={{ width: 16, height: 18, background: 'rgba(255,255,255,0.65)', borderRadius: '0 0 6px 6px' }} />
                </div>
              </div>

              {/* Home bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2" style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 99 }} />
            </div>

            {/* ── Floating stat cards ── */}
            {/* Top-right: Online badge */}
            <div className="absolute animate-float flex items-center gap-2 px-3 py-2 rounded-2xl"
              style={{ top: -16, right: -52, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animationDelay: '0.5s' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#20B883', boxShadow: '0 0 6px rgba(50,211,154,0.9)' }} />
              <span className="text-white text-xs font-bold">Online</span>
            </div>

            {/* Bottom-left: Orders card */}
            <div className="absolute animate-float flex flex-col gap-0.5 px-3 py-2 rounded-2xl"
              style={{ bottom: -10, left: -58, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animationDelay: '2.5s' }}>
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Orders</span>
              <span className="text-white text-sm font-bold">1,284</span>
            </div>

            {/* Right-middle: Revenue card */}
            <div className="absolute animate-float flex flex-col gap-0.5 px-3 py-2 rounded-2xl"
              style={{ top: '40%', right: -62, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animationDelay: '1.5s' }}>
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Revenue</span>
              <span className="text-white text-sm font-bold">₹48K</span>
            </div>
          </div>

          {/* ── Bottom tagline ── */}
          <p className="absolute bottom-5 text-white/35 text-[10px] tracking-[0.3em] uppercase">Manage · Grow · Succeed</p>
        </div>

        {/* ══ RIGHT — form panel ══ */}
        <div className="flex-1 flex items-center justify-center px-10 py-10"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={logo}
                alt="Nearzo"
                className="h-8 w-auto mb-4 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <h1 className="font-display font-bold text-slate-900 tracking-widest uppercase" style={{ fontSize: 26, letterSpacing: '0.18em' }}>
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm mt-1">Sign in to your dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wider uppercase">Email Address</label>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background: focusedField === 'email' ? 'rgba(108,76,241,0.05)' : '#F8FAFC',
                    border: focusedField === 'email' ? '1.5px solid #6C4CF1' : '1.5px solid #E8E1FF',
                    boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(108,76,241,0.1)' : 'none',
                  }}
                >
                  <FiUser size={15} style={{ color: focusedField === 'email' ? '#6C4CF1' : '#9CA3AF', flexShrink: 0, transition: 'color 0.2s' }} />
                  <input
                    {...register('email')}
                    type="email"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
                    placeholder="admin@nearzo.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wider uppercase">Password</label>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background: focusedField === 'password' ? 'rgba(108,76,241,0.05)' : '#F8FAFC',
                    border: focusedField === 'password' ? '1.5px solid #6C4CF1' : '1.5px solid #E8E1FF',
                    boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(108,76,241,0.1)' : 'none',
                  }}
                >
                  <FiLock size={15} style={{ color: focusedField === 'password' ? '#6C4CF1' : '#9CA3AF', flexShrink: 0, transition: 'color 0.2s' }} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-primary-500 transition-colors">
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
              </div>

              {/* Forgot */}
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-xs font-medium text-slate-400 hover:text-primary-500 transition-colors">
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-center text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 rounded-full text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #6C4CF1 0%, #4930B8 100%)', boxShadow: '0 16px 40px -12px rgba(108,76,241,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 50px -10px rgba(108,76,241,0.85)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(108,76,241,0.6)'}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Login <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" /></>
                )}
              </button>
            </form>

            {/* Demo */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 whitespace-nowrap">demo credentials</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2.5 font-mono">
              admin@quickcommerce.com / admin123
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

// src/app/page.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Smartphone, Lock, Home,
  CheckCircle2, XCircle, Loader2, Info,
  Battery, Wifi, Signal, MessageSquare, Camera, Music,
  Settings, Phone, Mail, MapPin, Calendar, Clock,
  ShoppingBag, PlayCircle, Globe, Image as ImageIcon,
} from 'lucide-react';

/* ──────────────── TYPES & CONSTANTS ──────────────── */
type ScreenView = 'lock' | 'home';
type ApplyTarget = 'lock' | 'home' | 'both';
type Status = 'idle' | 'processing' | 'success' | 'error';
interface Wallpapers { lock: string; home: string; }
interface AppSettings { wallpapers: Wallpapers; screenView: ScreenView; applyTarget: ApplyTarget; }

const STORAGE_KEY = 'wallpaper-app-settings-v1';
const DEFAULT_SETTINGS: AppSettings = {
  wallpapers: { lock: '/default-lock.jpg', home: '/default-home.jpg' },
  screenView: 'lock', applyTarget: 'both',
};

/* ──────────────── LOCAL STORAGE ──────────────── */
function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: AppSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // silent fail
  }
}

/* ──────────────── RESPONSIVE HOOKS ──────────────── */
function usePhoneScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const availableH = vh - 40;
      const availableW = vw - 32;
      const scaleH = Math.min(1, availableH / 620);
      const scaleW = Math.min(1, availableW / 300);
      setScale(Math.min(scaleH, scaleW, 1));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return scale;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isDesktop;
}

/* ──────────────── 3D LOADING SCREEN ──────────────── */
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] translate-x-32 -translate-y-20" />

      <div className="relative w-32 h-32" style={{ perspective: '800px' }}>
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateX: 360, rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {[
            { transform: 'translateZ(64px)', color: 'from-indigo-500 to-blue-600' },
            { transform: 'rotateY(180deg) translateZ(64px)', color: 'from-purple-500 to-pink-600' },
            { transform: 'rotateY(90deg) translateZ(64px)', color: 'from-cyan-500 to-teal-600' },
            { transform: 'rotateY(-90deg) translateZ(64px)', color: 'from-orange-500 to-red-600' },
            { transform: 'rotateX(90deg) translateZ(64px)', color: 'from-emerald-500 to-green-600' },
            { transform: 'rotateX(-90deg) translateZ(64px)', color: 'from-yellow-500 to-amber-600' },
          ].map((f, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-br ${f.color} border border-white/20 backdrop-blur-sm shadow-[0_0_30px_rgba(99,102,241,0.3)]`}
              style={{ transform: f.transform, backfaceVisibility: 'hidden' }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-bold text-white tracking-wider">WALLPAPER STUDIO</h2>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-indigo-400 text-sm mt-2 tracking-[0.3em] uppercase"
        >
          Loading Experience
        </motion.p>
      </motion.div>

      <motion.div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ──────────────── APP ICONS ──────────────── */
const AppIcons = {
  Google: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full p-2.5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  Chrome: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full p-2">
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path d="M12 2a10 10 0 00-8.66 5h5.33L12 2z" fill="#EA4335" />
      <path d="M21.66 7H16.33L12 14.5 7.67 7H3.34A10 10 0 0012 22a10 10 0 009.66-15z" fill="#FBBC05" />
      <path d="M12 14.5L7.67 7H3.34a10 10 0 008.66 15l4.33-7.5z" fill="#34A853" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  ),
  YouTube: () => (
    <div className="w-full h-full bg-[#FF0000] rounded-2xl flex items-center justify-center">
      <PlayCircle className="w-8 h-8 text-white fill-white" />
    </div>
  ),
  Instagram: () => (
    <div
      className="w-full h-full rounded-2xl flex items-center justify-center"
      style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
    >
      <Camera className="w-7 h-7 text-white" strokeWidth={2.5} />
    </div>
  ),
  WhatsApp: () => (
    <div className="w-full h-full bg-[#25D366] rounded-2xl flex items-center justify-center">
      <MessageSquare className="w-7 h-7 text-white fill-white" />
    </div>
  ),
  Gmail: () => (
    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
      <Mail className="w-7 h-7 text-red-500" />
    </div>
  ),
  Maps: () => (
    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
      <MapPin className="w-7 h-7 text-green-600 fill-green-600" />
    </div>
  ),
  Calendar: () => (
    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
      <Calendar className="w-7 h-7 text-blue-600" />
    </div>
  ),
  Photos: () => (
    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
      <ImageIcon className="w-7 h-7 text-indigo-500" />
    </div>
  ),
  Settings: () => (
    <div className="w-full h-full bg-zinc-700 rounded-2xl flex items-center justify-center">
      <Settings className="w-7 h-7 text-zinc-300" />
    </div>
  ),
  Phone: () => (
    <div className="w-full h-full bg-[#4CD964] rounded-2xl flex items-center justify-center">
      <Phone className="w-7 h-7 text-white" />
    </div>
  ),
  Safari: () => (
    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center border border-zinc-200">
      <Globe className="w-7 h-7 text-blue-500" />
    </div>
  ),
  Music: () => (
    <div className="w-full h-full bg-[#FC3C44] rounded-2xl flex items-center justify-center">
      <Music className="w-7 h-7 text-white" />
    </div>
  ),
  Shop: () => (
    <div className="w-full h-full bg-[#5AC8FA] rounded-2xl flex items-center justify-center">
      <ShoppingBag className="w-7 h-7 text-white" />
    </div>
  ),
  ClockApp: () => (
    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center border border-zinc-700">
      <Clock className="w-7 h-7 text-white" />
    </div>
  ),
};

const HOME_APPS = [
  { name: 'Google', icon: AppIcons.Google },
  { name: 'Chrome', icon: AppIcons.Chrome },
  { name: 'YouTube', icon: AppIcons.YouTube },
  { name: 'Instagram', icon: AppIcons.Instagram },
  { name: 'WhatsApp', icon: AppIcons.WhatsApp },
  { name: 'Gmail', icon: AppIcons.Gmail },
  { name: 'Maps', icon: AppIcons.Maps },
  { name: 'Calendar', icon: AppIcons.Calendar },
  { name: 'Photos', icon: AppIcons.Photos },
  { name: 'Settings', icon: AppIcons.Settings },
  { name: 'Music', icon: AppIcons.Music },
  { name: 'Shop', icon: AppIcons.Shop },
  { name: 'Clock', icon: AppIcons.ClockApp },
  { name: 'Safari', icon: AppIcons.Safari },
  { name: 'Phone', icon: AppIcons.Phone },
];

const DOCK_APPS = [
  { name: 'Phone', icon: AppIcons.Phone },
  { name: 'Safari', icon: AppIcons.Safari },
  { name: 'Gmail', icon: AppIcons.Gmail },
  { name: 'Music', icon: AppIcons.Music },
];

/* ──────────────── NATIVE BRIDGE ──────────────── */
const isNative = () => {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as Record<string, unknown>;
  const cap = win.Capacitor as Record<string, unknown> | undefined;
  return typeof cap?.isNativePlatform === 'function' && cap.isNativePlatform() === true;
};

const setNativeWallpaper = async (base64: string, target: ApplyTarget) => {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const fn = `wp_${Date.now()}.jpg`;

  await Filesystem.writeFile({
    path: fn,
    data: base64.replace(/^data:image\/\w+;base64,/, ''),
    directory: Directory.Cache,
  });

  try {
    const cap = await import('@capacitor/core');
    const capacitor = cap.Capacitor as unknown as Record<string, unknown>;
    const plugins = capacitor.Plugins as Record<string, unknown> | undefined;
    const wallpaper = plugins?.Wallpaper as
      | { setWallpaper?: (opts: { filePath: string; target: string }) => Promise<void> }
      | undefined;
    await wallpaper?.setWallpaper?.({ filePath: fn, target });
  } finally {
    await Filesystem.deleteFile({ path: fn, directory: Directory.Cache }).catch(() => {});
  }
};

const optimizeImage = (src: string, w = 1080, h = 2400): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      const s = Math.max(w / img.width, h / img.height);
      const sw = w / s;
      const sh = h / s;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.src = src;
  });

/* ──────────────── MAIN COMPONENT ──────────────── */
export default function WallpaperApp() {
  const [loading, setLoading] = useState(true);
  const [wallpapers, setWallpapers] = useState<Wallpapers>(DEFAULT_SETTINGS.wallpapers);
  const [screenView, setScreenView] = useState<ScreenView>(DEFAULT_SETTINGS.screenView);
  const [applyTarget, setApplyTarget] = useState<ApplyTarget>(DEFAULT_SETTINGS.applyTarget);
  const [status, setStatus] = useState<Status>('idle');
  const [native, setNative] = useState(false);
  const lockRef = useRef<HTMLInputElement>(null);
  const homeRef = useRef<HTMLInputElement>(null);
  const phoneScale = usePhoneScale();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const s = loadSettings();
    setWallpapers(s.wallpapers);
    setScreenView(s.screenView);
    setApplyTarget(s.applyTarget);
    setNative(isNative());
  }, []);

  useEffect(() => {
    if (!loading) {
      saveSettings({ wallpapers, screenView, applyTarget });
    }
  }, [wallpapers, screenView, applyTarget, loading]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>, t: ScreenView) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setWallpapers((p) => ({ ...p, [t]: URL.createObjectURL(f) }));
    setStatus('idle');
    e.target.value = '';
  };

  const handleApply = useCallback(async () => {
    setStatus('processing');
    try {
      if (native) {
        if (applyTarget === 'lock' || applyTarget === 'both') {
          await setNativeWallpaper(await optimizeImage(wallpapers.lock), 'lock');
        }
        if (applyTarget === 'home' || applyTarget === 'both') {
          await setNativeWallpaper(await optimizeImage(wallpapers.home), 'home');
        }
      } else {
        const wp = screenView === 'lock' ? wallpapers.lock : wallpapers.home;
        const opt = await optimizeImage(wp);
        const a = document.createElement('a');
        a.href = opt;
        a.download = `wallpaper-${screenView}-${Date.now()}.jpg`;
        a.click();
      }
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, [wallpapers, applyTarget, native, screenView]);

  const btnCfg: Record<Status, { l: string; i: React.ReactNode; c: string }> = {
    idle: {
      l: native ? 'تنظیم روی گوشی' : 'دانلود والپیپر فعلی',
      i: native ? <Smartphone size={20} /> : <Download size={20} />,
      c: 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25',
    },
    processing: {
      l: 'در حال اعمال...',
      i: <Loader2 size={20} className="animate-spin" />,
      c: 'bg-indigo-800 cursor-wait',
    },
    success: {
      l: 'انجام شد!',
      i: <CheckCircle2 size={20} />,
      c: 'bg-emerald-600 shadow-lg shadow-emerald-500/25',
    },
    error: {
      l: 'خطا - دوباره تلاش کنید',
      i: <XCircle size={20} />,
      c: 'bg-red-600 shadow-lg shadow-red-500/25',
    },
  };
  const cb = btnCfg[status];

  const panelInitial = isDesktop ? { opacity: 0, x: -30 } : { opacity: 0, y: -20 };
  const panelAnimate = { opacity: 1, x: 0, y: 0 };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="min-h-dvh bg-zinc-950 text-white flex flex-col lg:flex-row items-center lg:justify-center gap-6 lg:gap-10 p-4 md:p-8 font-sans overflow-x-hidden"
        >
          {/* ═══════ CONTROL PANEL ═══════ */}
          <motion.div
            initial={panelInitial}
            animate={panelAnimate}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md space-y-4 lg:space-y-5 order-1 lg:order-1 shrink-0"
          >
            <div className="text-center lg:text-right">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                تغییر والپیپر 
              </h1>
             
            </div>

            
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={() => lockRef.current?.click()}
                disabled={status === 'processing'}
                className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-medium transition-all active:scale-[0.97] flex flex-col items-center justify-center gap-1.5 md:gap-2 border touch-manipulation ${
                  screenView === 'lock'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <Lock size={18} />
                <span className="text-xs md:text-sm">صفحه قفل</span>
                <span className="text-[9px] md:text-[10px] opacity-60">تغییر تصویر</span>
              </button>
              <input
                ref={lockRef}
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(e, 'lock')}
                className="hidden"
              />

              <button
                onClick={() => homeRef.current?.click()}
                disabled={status === 'processing'}
                className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-medium transition-all active:scale-[0.97] flex flex-col items-center justify-center gap-1.5 md:gap-2 border touch-manipulation ${
                  screenView === 'home'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <Home size={18} />
                <span className="text-xs md:text-sm">صفحه اصلی</span>
                <span className="text-[9px] md:text-[10px] opacity-60">تغییر تصویر</span>
              </button>
              <input
                ref={homeRef}
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(e, 'home')}
                className="hidden"
              />
            </div>

            {/* نمای پیش‌نمایش */}
            <div>
              <label className="text-[10px] md:text-xs text-zinc-500 mb-1.5 block font-medium uppercase tracking-wider text-center lg:text-right">
                نمای پیش‌نمایش
              </label>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button
                  onClick={() => setScreenView('lock')}
                  className={`py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 touch-manipulation ${
                    screenView === 'lock'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <Lock size={14} /> صفحه قفل
                </button>
                <button
                  onClick={() => setScreenView('home')}
                  className={`py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 touch-manipulation ${
                    screenView === 'home'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <Home size={14} /> صفحه اصلی
                </button>
              </div>
            </div>

            {/* دکمه اعمال */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleApply}
              disabled={status === 'processing'}
              className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-3 touch-manipulation ${cb.c}`}
            >
              {cb.i}
              {cb.l}
            </motion.button>

            {!native && (
              <div className="p-3 md:p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg md:rounded-xl text-[10px] md:text-xs text-zinc-500 space-y-1">
                <p className="font-medium text-zinc-300 flex items-center gap-2">
                  <Info size={13} /> نکته:
                </p>
                <p>
                  هر صفحه والپیپر جداگانه دارد. نمای مورد نظر را انتخاب و تصویر مخصوص آن را
                  آپلود کنید.
                </p>
              </div>
            )}
          </motion.div>

          {/* ═══════ PHONE PREVIEW ═══════ */}
          <div
            className="order-2 lg:order-2 flex items-center justify-center shrink-0"
            style={{
              height: `${620 * phoneScale}px`,
              width: `${300 * phoneScale + 24}px`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: phoneScale }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative w-[300px] h-[620px] bg-black rounded-[45px] border-[6px] border-zinc-800 shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)] overflow-hidden origin-top"
            >
              {/* Dynamic Island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-30" />

              {/* Status Bar */}
              <div className="absolute top-2.5 left-6 right-6 flex justify-between items-center text-[10px] text-white/90 z-20 font-medium pointer-events-none">
                <span>12:45</span>
                <div className="flex items-center gap-1.5">
                  <Signal size={12} />
                  <Wifi size={12} />
                  <Battery size={12} />
                </div>
              </div>

              {/* Wallpaper Layer */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${screenView}-${wallpapers[screenView]}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${wallpapers[screenView]})` }}
                />
              </AnimatePresence>

              {/* LOCK SCREEN */}
              <AnimatePresence mode="wait">
                {screenView === 'lock' && (
                  <motion.div
                    key="lock"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 z-10 flex flex-col items-center pointer-events-none"
                  >
                    <div className="mt-20 flex flex-col items-center">
                      <span className="text-white/70 text-xs tracking-[0.25em] uppercase font-light">
                        Sunday
                      </span>
                      <span className="text-white text-6xl font-thin mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                        August 9
                      </span>
                    </div>
                    <div className="mt-8 w-[85%] space-y-2">
                      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-md bg-blue-500/80" />
                          <span className="text-[10px] text-white/80 font-medium">Messages</span>
                          <span className="text-[9px] text-white/50 ml-auto">now</span>
                        </div>
                        <p className="text-[10px] text-white/70 leading-snug">
                          Hey! Check out this new wallpaper...
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto mb-10 flex justify-between w-[80%]">
                      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <div className="w-5 h-5 rounded-full border-2 border-white/60" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <div className="w-5 h-5 rounded-sm border-2 border-white/60" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="w-1 h-6 rounded-full bg-white/30 mx-auto" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HOME SCREEN */}
              <AnimatePresence mode="wait">
                {screenView === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 z-10 flex flex-col pointer-events-none"
                  >
                    <div className="mt-14 px-5 grid grid-cols-4 gap-x-3 gap-y-4 content-start">
                      {HOME_APPS.map((a) => (
                        <div key={a.name} className="flex flex-col items-center gap-1">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-white/10 backdrop-blur-sm">
                            <a.icon />
                          </div>
                          <span className="text-[9px] text-white/90 font-medium drop-shadow-md truncate w-full text-center">
                            {a.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto mb-6 mx-3 p-3 bg-white/10 backdrop-blur-xl rounded-[28px] border border-white/10">
                      <div className="grid grid-cols-4 gap-3">
                        {DOCK_APPS.map((a) => (
                          <div
                            key={`d-${a.name}`}
                            className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/10"
                          >
                            <a.icon />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </div>
                    <div className="mx-auto w-32 h-1 bg-white/40 rounded-full mb-2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}
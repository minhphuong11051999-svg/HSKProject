import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { UserCircle, ClockCounterClockwise, Crown, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// YouTube-style account button in the top-right corner: a round initial
// avatar that opens a small menu with the account and its shortcuts.
export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const name = user.name?.trim() || user.email || 'Bạn';
  const initial = Array.from(name)[0]?.toUpperCase() || '?';
  const isPro = user.plan === 'PREMIUM';
  const proEnds = isPro && user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const proUntil =
    proEnds && !Number.isNaN(proEnds.getTime())
      ? proEnds.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/');
  }

  const itemClass =
    'flex items-center gap-3 min-h-[44px] px-4 text-sm text-slate-200 hover:bg-night-800 focus-visible:bg-night-800 transition-colors';

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Tài khoản: ${name}`}
        className="relative w-11 h-11 flex items-center justify-center rounded-full"
      >
        <span
          className={`w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-coral-400 to-coral-600 text-white font-bold text-base ring-2 ${
            open ? 'ring-coral-400' : 'ring-transparent'
          } transition-shadow`}
        >
          {initial}
        </span>
        {isPro && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-amber-400 text-night-950 ring-2 ring-night-900">
            <Crown size={11} weight="fill" aria-hidden="true" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Tài khoản"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-night-700 bg-night-900 shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-night-700">
              <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-coral-400 to-coral-600 text-white font-bold">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-100 truncate">{name}</p>
                {user.email && <p className="text-xs text-slate-400 truncate">{user.email}</p>}
                <span
                  className={`inline-block mt-1 text-[0.6875rem] font-bold px-2 py-0.5 rounded-full ${
                    isPro ? 'bg-amber-400/15 text-amber-400' : 'bg-night-800 text-slate-400'
                  }`}
                >
                  {isPro ? (proUntil ? `PRO đến ${proUntil}` : 'PRO') : 'Gói miễn phí'}
                </span>
              </div>
            </div>
            <div className="py-1">
              <Link to="/profile" className={itemClass}>
                <UserCircle size={20} aria-hidden="true" /> Hồ sơ của tôi
              </Link>
              <Link to="/history" className={itemClass}>
                <ClockCounterClockwise size={20} aria-hidden="true" /> Lịch sử làm bài
              </Link>
              <Link to="/pro" className={itemClass}>
                <Crown size={20} aria-hidden="true" /> {isPro ? 'Gói PRO của tôi' : 'Nâng cấp PRO'}
              </Link>
            </div>
            <div className="py-1 border-t border-night-700">
              <button type="button" onClick={handleLogout} className={`${itemClass} w-full text-left`}>
                <SignOut size={20} aria-hidden="true" /> Đăng xuất
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

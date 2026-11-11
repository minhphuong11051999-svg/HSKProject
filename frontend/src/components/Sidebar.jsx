import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import { Highlight, HighlightItem } from '@animate-ui/react/primitives/effects/highlight';
import { House, BookOpen, NotePencil, Target, ClockCounterClockwise, Books, UsersThree, Crown, UserCircle, CreditCard } from '@phosphor-icons/react';

const NAV_ITEMS = [
  { to: '/', icon: House, label: 'Trang chủ' },
  { to: '/lessons', icon: BookOpen, label: 'Bài học' },
  { to: '/practice', icon: NotePencil, label: 'Đề mẫu' },
  { to: '/lessons/exam', icon: Target, label: 'Đề thi thật' },
  { to: '/history', icon: ClockCounterClockwise, label: 'Lịch sử' },
  { to: '/profile', icon: UserCircle, label: 'Hồ sơ' },
  { to: '/pro', icon: Crown, label: 'Gói PRO' },
];

const ADMIN_ITEMS = [
  { to: '/admin', icon: Books, label: 'Quản trị bài học' },
  { to: '/admin/sample-papers', icon: NotePencil, label: 'Quản trị đề mẫu' },
  { to: '/admin/exam-sittings', icon: Target, label: 'Quản trị đề thi thật' },
  { to: '/admin/users', icon: UsersThree, label: 'Người dùng' },
  { to: '/admin/pricing', icon: CreditCard, label: 'Gói PRO & thanh toán' },
];

// Desktop (lg+): sticky full-height column. Below lg: off-canvas drawer that
// slides in from the left, opened from the top app bar in Layout.
export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const activeTo = activeNavTarget(location.pathname, user?.role === 'ADMIN');

  return (
    <aside
      id="app-sidebar"
      aria-label="Điều hướng chính"
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-[100dvh] bg-night-900 lg:bg-night-900/75 lg:backdrop-blur-xl border-r border-night-700/70 flex flex-col
        transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full invisible lg:visible'}
        lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:max-w-none lg:h-screen lg:translate-x-0 lg:self-start lg:shrink-0`}
    >
      <div className="px-5 py-5 flex items-center justify-between gap-2">
        <BrandLogo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng menu"
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-slate-300 hover:bg-night-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Animate UI Highlight: one gold pill that glides to the active item. */}
        <Highlight
          controlledItems
          value={activeTo}
          className="inset-0 rounded-xl bg-coral-400/10 ring-1 ring-inset ring-coral-400/25"
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        >
          <NavGroup items={NAV_ITEMS} activeTo={activeTo} />
          {user?.role === 'ADMIN' && (
            <>
              <p className="px-3 pt-6 pb-2 text-xs tracking-[0.12em] text-kicker font-bold">QUẢN TRỊ</p>
              <NavGroup items={ADMIN_ITEMS} activeTo={activeTo} />
            </>
          )}
        </Highlight>
      </nav>

      <div className="p-4 border-t border-night-700">
        <div className="flex items-center justify-between mb-3">
          <Link to="/profile" className="min-w-0 text-xs text-slate-500 truncate hover:text-coral-400 transition-colors">
            Xin chào, {user?.name}
          </Link>
          <ThemeToggle className="flex-shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full min-h-[44px] border-[1.5px] border-night-600 bg-night-900 text-slate-200 hover:border-coral-400 hover:text-coral-400 rounded-xl text-sm font-bold transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

// Detail pages light up their parent list (e.g. /practice/abc → Đề mẫu).
function activeNavTarget(pathname, isAdmin) {
  const all = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;
  if (all.some((i) => i.to === pathname)) return pathname;
  if (pathname.startsWith('/practice/')) return '/practice';
  if (pathname.startsWith('/exams/')) return '/lessons/exam';
  if (pathname.startsWith('/lessons/')) return '/lessons';
  return null;
}

function NavGroup({ items, activeTo }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active = activeTo === item.to;
        return (
          <HighlightItem key={item.to} value={item.to}>
            <Link
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-xl text-[0.9375rem] transition-colors ${
                active ? 'text-coral-400 font-bold' : 'text-slate-300 hover:bg-night-700/50 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" className="flex-shrink-0" />
              {item.label}
            </Link>
          </HighlightItem>
        );
      })}
    </div>
  );
}

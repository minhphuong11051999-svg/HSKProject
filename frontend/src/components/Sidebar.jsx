import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import { House, BookOpen, NotePencil, Target, ClockCounterClockwise, Books, UsersThree } from '@phosphor-icons/react';

const NAV_ITEMS = [
  { to: '/', icon: House, label: 'Trang chủ' },
  { to: '/lessons', icon: BookOpen, label: 'Bài học' },
  { to: '/practice', icon: NotePencil, label: 'Đề mẫu' },
  { to: '/lessons/exam', icon: Target, label: 'Đề thi thật' },
  { to: '/history', icon: ClockCounterClockwise, label: 'Lịch sử' },
];

const ADMIN_ITEMS = [
  { to: '/admin', icon: Books, label: 'Quản trị bài học' },
  { to: '/admin/sample-papers', icon: NotePencil, label: 'Quản trị đề mẫu' },
  { to: '/admin/exam-sittings', icon: Target, label: 'Quản trị đề thi thật' },
  { to: '/admin/users', icon: UsersThree, label: 'Người dùng' },
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

  function isActive(to) {
    return location.pathname === to;
  }

  return (
    <aside
      id="app-sidebar"
      aria-label="Điều hướng chính"
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-[100dvh] bg-night-900 border-r border-night-700 flex flex-col
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

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive(item.to) ? 'page' : undefined}
            className={`flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg text-sm border-l-2 transition-colors ${
              isActive(item.to)
                ? 'bg-coral-500/15 text-coral-400 font-semibold border-coral-400'
                : 'text-slate-300 border-transparent hover:bg-night-800 hover:text-white'
            }`}
          >
            <item.icon size={20} weight={isActive(item.to) ? 'fill' : 'regular'} aria-hidden="true" className="flex-shrink-0" />
            {item.label}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <p className="px-3 pt-5 pb-1 text-xs tracking-wider text-slate-500 font-semibold">QUẢN TRỊ</p>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg text-sm border-l-2 transition-colors ${
                  isActive(item.to)
                    ? 'bg-coral-500/15 text-coral-400 font-semibold border-coral-400'
                    : 'text-slate-300 border-transparent hover:bg-night-800 hover:text-white'
                }`}
              >
                <item.icon size={20} weight={isActive(item.to) ? 'fill' : 'regular'} aria-hidden="true" className="flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-night-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 truncate">Xin chào, {user?.name}</p>
          <ThemeToggle className="flex-shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

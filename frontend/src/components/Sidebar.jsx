import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Trang chủ' },
  { to: '/lessons', icon: '📖', label: 'Bài học' },
  { to: '/practice', icon: '📝', label: 'Đề mẫu' },
  { to: '/lessons/exam', icon: '🎯', label: 'Đề thi thật' },
  { to: '/history', icon: '🕘', label: 'Lịch sử' },
];

const ADMIN_ITEMS = [
  { to: '/admin', icon: '📚', label: 'Quản trị bài học' },
  { to: '/admin/sample-papers', icon: '📝', label: 'Quản trị đề mẫu' },
  { to: '/admin/exam-sittings', icon: '🎯', label: 'Quản trị đề thi thật' },
  { to: '/admin/users', icon: '👥', label: 'Người dùng' },
];

export default function Sidebar() {
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
    <aside className="w-64 shrink-0 bg-night-900 border-r border-night-700 flex flex-col h-screen sticky top-0 self-start">
      <div className="px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img src="/logo.svg" alt="" className="w-8 h-8 rounded-lg flex-shrink-0" />
          <span className="zh text-lg font-bold text-coral-400 truncate">写作工坊 · HSK6</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive(item.to) ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border-l-2 transition-colors ${
              isActive(item.to)
                ? 'bg-coral-500/15 text-coral-400 font-semibold border-coral-400'
                : 'text-slate-300 border-transparent hover:bg-night-800 hover:text-white'
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border-l-2 transition-colors ${
                  isActive(item.to)
                    ? 'bg-coral-500/15 text-coral-400 font-semibold border-coral-400'
                    : 'text-slate-300 border-transparent hover:bg-night-800 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
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

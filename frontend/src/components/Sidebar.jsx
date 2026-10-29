import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Trang chủ' },
  { to: '/history', icon: '🕘', label: 'Lịch sử' },
];

const ADMIN_ITEMS = [
  { to: '/admin', icon: '📚', label: 'Quản trị bài học' },
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
    <aside className="w-64 shrink-0 bg-night-900 border-r border-night-700 flex flex-col min-h-screen sticky top-0">
      <Link to="/" className="flex items-center gap-2 px-5 py-5">
        <span className="text-2xl">✍️</span>
        <span className="zh text-lg font-bold text-coral-500">写作工坊 · HSK6</span>
      </Link>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.to)
                ? 'bg-coral-500/15 text-coral-400 font-semibold'
                : 'text-slate-300 hover:bg-night-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(item.to)
                    ? 'bg-coral-500/15 text-coral-400 font-semibold'
                    : 'text-slate-300 hover:bg-night-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-night-700">
        <p className="text-xs text-slate-500 mb-2 truncate">Xin chào, {user?.name}</p>
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

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-gradient-to-r from-indigo-900 to-indigo-600 text-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="zh text-lg font-semibold">
          写作工坊 · HSK6
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user && <Link to="/history">Lịch sử</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
          {user ? (
            <>
              <span className="opacity-80">{user.name}</span>
              <button onClick={handleLogout} className="underline">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

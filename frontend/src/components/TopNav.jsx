import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function TopNav() {
  return (
    <header className="bg-night-900/80 backdrop-blur border-b border-night-700 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="w-8 h-8 rounded-lg" />
          <span className="zh text-lg font-bold text-coral-text">写作工坊 · HSK6</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2">
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="bg-coral-500 hover:bg-coral-600 text-white rounded-full px-5 py-2 font-semibold transition-colors"
          >
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  );
}

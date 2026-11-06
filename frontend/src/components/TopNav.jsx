import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';

export default function TopNav() {
  return (
    <header className="bg-night-900/80 backdrop-blur border-b border-night-700 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <BrandLogo compact className="sm:hidden" />
        <BrandLogo className="hidden sm:flex" />
        <nav className="flex items-center gap-1.5 sm:gap-3 text-sm">
          <ThemeToggle />
          <Link
            to="/login"
            className="min-h-[44px] flex items-center text-slate-300 hover:text-white px-2.5 sm:px-3 whitespace-nowrap"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="min-h-[44px] flex items-center bg-coral-500 hover:bg-coral-600 text-white rounded-full px-4 sm:px-5 font-semibold transition-colors whitespace-nowrap"
          >
            Đăng ký
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import GlobalSearch from './GlobalSearch';
import FanpageButton from './FanpageButton';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

// Sticky top bar, YouTube-style: search in the middle; fanpage, theme and the
// account avatar on the right. Below md the search collapses to an icon that
// opens a full-width search row.
export default function AppTopBar({ onOpenMenu, menuOpen = false, showLogo = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => setMobileSearch(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-night-950/80 backdrop-blur-xl border-b border-night-700/70">
      {mobileSearch ? (
        <div className="md:hidden h-full flex items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => setMobileSearch(false)}
            aria-label="Đóng tìm kiếm"
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-slate-200 hover:bg-night-800"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <GlobalSearch autoFocus className="flex-1" onNavigate={() => setMobileSearch(false)} />
        </div>
      ) : null}

      <div className={`h-full items-center gap-2 sm:gap-3 px-3 sm:px-6 ${mobileSearch ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-2 min-w-0">
          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Mở menu"
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
              className="lg:hidden w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-slate-200 hover:bg-night-800 transition-colors"
            >
              <List size={22} aria-hidden="true" />
            </button>
          )}
          <BrandLogo compact className={showLogo ? '' : 'lg:hidden'} />
        </div>

        <div className="flex-1 flex justify-center min-w-0">
          <GlobalSearch className="hidden md:block w-full max-w-xl" />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearch(true)}
            aria-label="Tìm kiếm"
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-slate-200 hover:bg-night-800 transition-colors"
          >
            <MagnifyingGlass size={20} aria-hidden="true" />
          </button>
          <FanpageButton />
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:flex min-h-[44px] items-center text-sm text-slate-300 hover:text-coral-400 px-3 whitespace-nowrap"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="min-h-[44px] flex items-center bg-coral-500 hover:bg-coral-600 text-white text-sm rounded-full px-4 sm:px-5 font-semibold transition-colors whitespace-nowrap"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

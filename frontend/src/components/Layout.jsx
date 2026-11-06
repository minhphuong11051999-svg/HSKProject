import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BrandLogo from './BrandLogo';

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // While the drawer is open: lock page scroll behind it and close on Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (loading) {
    return <div className="min-h-screen bg-night-950" />;
  }

  if (user) {
    return (
      <div className="lg:flex min-h-screen bg-night-950 text-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-coral-500 focus:text-white focus:px-3 focus:py-2 focus:rounded-lg"
        >
          Bỏ qua menu
        </a>

        {/* Mobile / tablet top app bar */}
        <header className="lg:hidden sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 bg-night-900/95 backdrop-blur border-b border-night-700">
          <BrandLogo compact />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            className="w-11 h-11 flex items-center justify-center rounded-lg border border-night-600 text-slate-200 hover:bg-night-800 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </header>

        {/* Backdrop behind the open drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
            menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div id="main-content" className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 text-slate-100">
      <TopNav />
      <Outlet />
    </div>
  );
}

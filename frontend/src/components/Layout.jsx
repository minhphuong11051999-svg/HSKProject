import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import AppTopBar from './AppTopBar';
import PageTransition from './motion/PageTransition';

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
      <div className="relative isolate lg:flex min-h-screen bg-night-950 text-slate-100">
        {/* Blurred, faint brand artwork behind every page, like the landing hero. */}
        <div className="app-bg" aria-hidden="true" />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-coral-500 focus:text-white focus:px-3 focus:py-2 focus:rounded-lg"
        >
          Bỏ qua menu
        </a>

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
          <AppTopBar onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
          <div>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen bg-night-950 text-slate-100">
      <div className="app-bg" aria-hidden="true" />
      <AppTopBar showLogo />
      <div id="main-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  );
}

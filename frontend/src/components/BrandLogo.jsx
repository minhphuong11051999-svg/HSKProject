import { Link } from 'react-router-dom';

// Belle Chinese Lab lockup, matching the brand artwork: the red-crowned crane
// app icon, "Belle" in a copperplate script and "CHINESE LAB" in flared serif
// capitals underneath.
export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-3 min-w-0 ${className}`} aria-label="Belle Chinese Lab — Trang chủ">
      <img
        src="/logo-64.png"
        srcSet="/logo-64.png 1x, /logo-192.png 3x"
        alt=""
        width="44"
        height="44"
        className="w-11 h-11 flex-shrink-0 drop-shadow-sm"
      />
      <span className="flex flex-col min-w-0">
        <span className="font-brand text-[38px] leading-[0.95] text-slate-100">Belle</span>
        <span className="font-brandSerif text-[11px] leading-none tracking-[0.22em] text-slate-400 whitespace-nowrap">
          CHINESE LAB
        </span>
      </span>
    </Link>
  );
}

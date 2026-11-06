import { Link } from 'react-router-dom';

// Belle Chinese Lab lockup, matching the brand artwork: the red-crowned crane
// app icon, "Belle" in a copperplate script and "CHINESE LAB" in flared serif
// capitals underneath. `compact` is the smaller version for mobile top bars.
export default function BrandLogo({ className = '', compact = false }) {
  return (
    <Link
      to="/"
      className={`flex items-center min-w-0 ${compact ? 'gap-2.5' : 'gap-3'} ${className}`}
      aria-label="Belle Chinese Lab — Trang chủ"
    >
      <img
        src="/logo-64.png"
        srcSet="/logo-64.png 1x, /logo-192.png 3x"
        alt=""
        width={compact ? 36 : 44}
        height={compact ? 36 : 44}
        className={`${compact ? 'w-9 h-9' : 'w-11 h-11'} flex-shrink-0 drop-shadow-sm`}
      />
      <span className="flex flex-col min-w-0">
        <span className={`font-brand leading-[0.95] text-slate-100 ${compact ? 'text-[30px]' : 'text-[38px]'}`}>
          Belle
        </span>
        <span
          className={`font-brandSerif leading-none text-slate-400 whitespace-nowrap ${
            compact ? 'text-[9px] tracking-[0.2em]' : 'text-[11px] tracking-[0.22em]'
          }`}
        >
          CHINESE LAB
        </span>
      </span>
    </Link>
  );
}

import { Link } from 'react-router-dom';

// Belle Chinese Lab lockup: crane mark + "Belle" in an elegant italic serif
// over a small, widely tracked "CHINESE LAB" — mirrors the brand references
// (script "Belle", spaced sans subtitle) while staying legible in the sidebar.
export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-3 min-w-0 ${className}`} aria-label="Belle Chinese Lab — Trang chủ">
      <img src="/logo.svg" alt="" width="40" height="40" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-sm" />
      <span className="flex flex-col leading-none min-w-0">
        <span className="font-brand italic font-semibold text-[26px] text-slate-100 tracking-tight">Belle</span>
        <span className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-slate-400 whitespace-nowrap">
          CHINESE LAB
        </span>
      </span>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

// "← Back to list" link shown at the top of detail pages (sample paper, real
// exam, lesson) so learners can jump back and pick another one.
export default function BackLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 min-h-[44px] -ml-2 pl-2 pr-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-coral-400 hover:bg-coral-400/10 transition-colors ${className}`}
    >
      <ArrowLeft
        size={18}
        weight="bold"
        aria-hidden="true"
        className="transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
      />
      {children}
    </Link>
  );
}

import { FacebookLogo } from '@phosphor-icons/react';

export const FANPAGE_URL = 'https://www.facebook.com/profile.php?id=61596416881439';

// Opens the Belle Chinese Lab Facebook fanpage in a new tab. The label hides
// on narrow screens, leaving a 44px icon button with an accessible name.
export default function FanpageButton({ className = '' }) {
  return (
    <a
      href={FANPAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fanpage Belle Chinese Lab (mở tab mới)"
      title="Fanpage Belle Chinese Lab"
      className={`inline-flex items-center justify-center gap-2 h-11 min-w-[44px] px-2.5 xl:px-4 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 text-[#1460CC] [.dark_&]:text-[#4a8ff5] hover:bg-[#1877F2]/20 hover:border-[#1877F2]/70 text-sm font-semibold whitespace-nowrap transition-colors ${className}`}
    >
      <FacebookLogo size={20} weight="fill" aria-hidden="true" className="flex-shrink-0" />
      <span className="hidden xl:inline">Fanpage Belle Chinese Lab</span>
    </a>
  );
}

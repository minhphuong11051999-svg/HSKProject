// Shared class strings for the admin screens, so every form field and button
// has the same height, radius and cobalt focus ring in both themes.
// Danger colours come from the theme's hint tokens (AA in light and dark).

const INPUT_BASE =
  'w-full bg-night-900 border border-night-600 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 ' +
  'transition-colors focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/30';
export const INPUT = `${INPUT_BASE} min-h-[44px] text-sm`;
// Larger variant for the sign-in / sign-up forms (48px, like the landing buttons).
export const INPUT_LG = `${INPUT_BASE} min-h-[48px] text-base`;

export const LABEL = 'block mb-3';
export const LABEL_TEXT = 'block text-[13px] font-semibold text-slate-300 mb-1.5';
export const HINT = 'text-[13px] leading-relaxed text-slate-400';

const BTN_CORE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';
const BTN = `${BTN_CORE} min-h-[44px] px-4 text-sm`;
const PRIMARY_COLORS = 'bg-coral-500 hover:bg-coral-600 text-white shadow-sm';

export const BTN_PRIMARY = `${BTN} ${PRIMARY_COLORS}`;
export const BTN_PRIMARY_LG = `${BTN_CORE} min-h-[48px] px-6 text-base ${PRIMARY_COLORS}`;
export const BTN_SECONDARY = `${BTN} border border-night-600 bg-night-800 text-slate-100 hover:border-coral-400 hover:text-coral-400`;
export const BTN_DANGER =
  `${BTN} border border-[color:var(--c-hint-border)] text-[color:var(--c-hint-text)] hover:bg-[color:var(--c-hint-bg)]`;
// Quiet text buttons for list rows ("Sửa" / "Xoá") that still keep a 44px target.
export const BTN_LINK = `${BTN_CORE} min-h-[44px] px-3 text-sm text-coral-400 hover:bg-coral-400/10`;
export const BTN_LINK_DANGER = `${BTN_CORE} min-h-[44px] px-3 text-sm text-[color:var(--c-hint-text)] hover:bg-[color:var(--c-hint-bg)]`;
// Square icon/toolbar buttons (44×44 minimum).
export const BTN_TOOL =
  'inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 rounded-lg border border-night-600 ' +
  'bg-night-800 text-sm text-slate-200 transition-colors hover:border-coral-400 hover:text-coral-400';

const TOOL_BASE =
  'inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 rounded-lg border text-sm transition-colors';
export const BTN_TOOL_DANGER =
  `${TOOL_BASE} border-[color:var(--c-hint-border)] bg-night-800 text-[color:var(--c-hint-text)] hover:bg-[color:var(--c-hint-bg)]`;
// Dashed "+ Thêm ..." button under a repeater list.
export const BTN_ADD =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-dashed border-coral-400/60 ' +
  'text-sm font-bold text-coral-400 transition-colors hover:bg-coral-400/10';

export const PANEL = 'surface p-5 sm:p-6';
export const PANEL_TITLE = 'text-base font-extrabold tracking-tight text-slate-100';
export const ERROR_TEXT = 'text-sm font-medium text-[color:var(--c-hint-text)]';
export const SUCCESS_TEXT = 'text-sm font-semibold text-coral-400';
export const CHECKBOX = 'h-4 w-4 flex-shrink-0 accent-coral-500';

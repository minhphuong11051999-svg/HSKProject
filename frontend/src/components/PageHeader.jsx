import Reveal from './motion/Reveal';

/*
 * Page banner shared by the inner pages, in the landing page's language:
 * gold kicker, heavy navy title, muted lead, on the blurred porcelain artwork.
 * `art` shows the artwork itself on the right (large screens only).
 */
export default function PageHeader({ kicker = '写作工坊', title, children, actions, art = false, className = '' }) {
  return (
    <Reveal index={0}>
      <header className={`app-hero px-6 py-7 sm:px-8 sm:py-9 mb-8 ${className}`}>
        <div className="flex items-center gap-8">
          <div className="min-w-0 flex-1">
            {kicker && (
              <p className="kicker zh" lang="zh">
                {kicker}
              </p>
            )}
            <h1 className="mt-2 text-[1.75rem] sm:text-[2.25rem] leading-tight font-extrabold tracking-tight text-slate-100 [text-wrap:balance]">
              {title}
            </h1>
            {children && <div className="mt-2 text-base sm:text-lg leading-relaxed text-slate-400 max-w-2xl">{children}</div>}
            {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {art && (
            <img
              src="/img/home-hero-800.webp"
              alt=""
              aria-hidden="true"
              width="800"
              height="510"
              className="app-hero-art hidden lg:block w-[300px] h-auto flex-shrink-0"
            />
          )}
        </div>
      </header>
    </Reveal>
  );
}

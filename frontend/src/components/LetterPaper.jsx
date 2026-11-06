// Shared "tờ giấy mô phỏng" (fixed paper layout) used by the live writing
// preview, sample documents and model answers, so every letter in the app
// follows the same administrative-format rules:
//   - title centred, 2-character titles spaced out (明芳 → 明 芳)
//   - greeting flush left, always ending with a full-width colon
//   - body paragraphs indented 2 characters
//   - 此致 indented 4 characters, 敬礼！ flush left
//   - signature + date in the bottom-right corner, centred on each other

export function countHanzi(text) {
  return ((text || '').match(/[一-鿿]/g) || []).length;
}

export function spaceOutIfTwoChars(text) {
  const trimmed = (text || '').trim();
  const chars = Array.from(trimmed.replace(/\s+/g, ''));
  if (chars.length === 2 && countHanzi(chars.join('')) === 2) {
    return chars.join(' ');
  }
  return trimmed;
}

export function withColon(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  return /[：:]$/.test(trimmed) ? trimmed : `${trimmed}：`;
}

export function toParagraphs(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// Removes markup so a rich-text answer can be counted / split into paragraphs.
export function htmlToText(html) {
  return (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ');
}

export function HanziCount({ count, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border border-night-600 bg-night-900 text-slate-300 tabular-nums ${className}`}
    >
      （{count} 字）
    </span>
  );
}

export default function LetterPaper({
  title,
  greeting,
  paragraphs = [],
  extraLines = [],
  closing1,
  closing2,
  sign,
  date,
  html,
  minHeight = 'min-h-[22rem]',
  children,
}) {
  return (
    <div className={`letter-paper rounded-lg px-5 py-5 sm:p-8 pb-16 sm:pb-16 text-[15px] zh leading-8 ${minHeight}`}>
      {html ? (
        <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <>
          {title && <p className="text-center font-bold mb-3">{spaceOutIfTwoChars(title)}</p>}
          {greeting && <p className="text-left">{withColon(greeting)}</p>}
          {paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {p}
            </p>
          ))}
          {extraLines.map((p, i) => (
            <p key={`x${i}`}>{p}</p>
          ))}
          {(closing1 || closing2) && (
            <div className="mt-2">
              {closing1 && <p style={{ textIndent: '4em' }}>{closing1}</p>}
              {closing2 && <p className="text-left">{closing2}</p>}
            </div>
          )}
          {(sign || date) && (
            <div className="flex justify-end mt-6">
              <div className="inline-flex flex-col items-center text-center">
                {sign && <p>{spaceOutIfTwoChars(sign)}</p>}
                {date && <p>{date}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {children}
    </div>
  );
}

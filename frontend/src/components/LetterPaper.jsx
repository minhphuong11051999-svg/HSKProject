// Shared "tờ giấy mô phỏng" (fixed paper layout) used by the live writing
// preview, sample documents and model answers, so every letter in the app
// follows the same administrative-format rules:
//   - title centred, 2-character titles get two empty cells (通知 → 通　　知)
//   - greeting flush left, always ending with a full-width colon
//   - body paragraphs indented 2 characters
//   - 此致 indented 4 characters, 敬礼！ flush left
//   - signature + date in the bottom-right corner, centred on each other
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';

export function countHanzi(text) {
  return ((text || '').match(/[一-鿿]/g) || []).length;
}

// Titles follow the 稿纸 rule: a 2-character title leaves two empty cells
// between the characters (通知 → 通　　知). U+3000 is one full character cell.
export function formatTitle(text) {
  const trimmed = (text || '').trim();
  const chars = Array.from(trimmed.replace(/\s+/g, ''));
  if (chars.length === 2 && countHanzi(chars.join('')) === 2) {
    return chars.join('　　');
  }
  return trimmed;
}

// Same rule for a centred 2-character title inside admin-written HTML.
function spaceOutHtmlTitles(html) {
  return (html || '').replace(
    /(<(p|h[1-6]|div)\b[^>]*text-center[^>]*>)((?:\s|<[^>]+>|&nbsp;)*)([一-鿿])(?:\s|&nbsp;|　)*([一-鿿])((?:\s|<[^>]+>|&nbsp;)*)(<\/\2>)/gi,
    (_m, open, _tag, pre, a, b, post, close) => `${open}${pre}${a}　　${b}${post}${close}`
  );
}

// A signature that is exactly 2 characters leaves one empty cell between them
// (张明 → 张　明). Longer signatures (学生：李伟, 北京大学 刘玲玲) stay as written.
export function formatSign(text) {
  const trimmed = (text || '').trim();
  const chars = Array.from(trimmed.replace(/\s+/g, ''));
  if (chars.length === 2 && countHanzi(chars.join('')) === 2) {
    return chars.join('　');
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
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

const CLOSING1_RE = /^此致[，,。]?$/;
const CLOSING2_RE = /^敬礼[！!。]?$/;
const DATE_RE = /(\d{2,4}|[〇零○一二三四五六七八九十]{2,4})\s*年.*月.*日[。]?$|^\d{4}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{1,2}$/;
const SENTENCE_END_RE = /[。！？!?；;…，,]$/;

function isShortLabel(line, max = 24) {
  return line.length <= max && !SENTENCE_END_RE.test(line);
}

// A body line that ends like this closes its paragraph (。！？…；： plus any
// closing quote/bracket). Anything else — no punctuation, or a comma — means the
// line was hard-wrapped mid-sentence (typical when pasting from Word/PDF).
const PARAGRAPH_END_RE = /[。！？!?…；;：:][”’」』）)】]*$/;

// Re-joins hard-wrapped lines so each real paragraph gets ONE 2-character
// indent and its continuation lines wrap back to the left margin.
export function mergeWrappedLines(lines) {
  const out = [];
  let buf = '';
  for (const line of lines) {
    buf += line;
    if (PARAGRAPH_END_RE.test(line)) {
      out.push(buf);
      buf = '';
    }
  }
  if (buf) out.push(buf);
  return out;
}

// Splits a free-form letter (plain text or rich-text answer typed by an admin)
// into the 7 paper slots so it can be laid out with the same rules as the
// guided writing form: title / greeting / body / 此致 / 敬礼 / signature / date.
export function parseLetter(text) {
  const lines = toParagraphs(text);
  const out = { title: '', greeting: '', paragraphs: [], closing1: '', closing2: '', sign: [], date: '' };
  if (lines.length === 0) return out;

  let start = 0;
  let end = lines.length;

  // Head: optional title, then a greeting ending with a colon.
  if (lines.length > 1 && isShortLabel(lines[0]) && !/[：:]$/.test(lines[0]) && !DATE_RE.test(lines[0])) {
    out.title = lines[0];
    start = 1;
  }
  if (start < end && /[：:]$/.test(lines[start]) && lines[start].length <= 40) {
    out.greeting = lines[start];
    start += 1;
  }

  // Tail: date, then up to two short signature lines right above it.
  if (end - 1 >= start && DATE_RE.test(lines[end - 1]) && lines[end - 1].length <= 24) {
    out.date = lines[end - 1];
    end -= 1;
    while (
      out.sign.length < 2 &&
      end - 1 >= start &&
      isShortLabel(lines[end - 1], 20) &&
      !CLOSING1_RE.test(lines[end - 1]) &&
      !CLOSING2_RE.test(lines[end - 1])
    ) {
      out.sign.unshift(lines[end - 1]);
      end -= 1;
    }
  }

  // 此致 / 敬礼！ — whatever follows 敬礼！ (without a date) is the signature.
  const c2 = lines.slice(start, end).findIndex((l) => CLOSING2_RE.test(l));
  if (c2 !== -1) {
    const idx = start + c2;
    if (out.sign.length === 0) out.sign = lines.slice(idx + 1, end).slice(0, 2);
    out.closing2 = lines[idx];
    end = idx;
  }
  if (end - 1 >= start && CLOSING1_RE.test(lines[end - 1])) {
    out.closing1 = lines[end - 1];
    end -= 1;
  }

  out.paragraphs = mergeWrappedLines(lines.slice(start, end));
  return out;
}

// Rich text with images / tables / highlights can't be re-flowed safely.
function canAutoFormat(html) {
  return !/<(img|table|mark|ul|ol)\b/i.test(html || '');
}

export function HanziCount({ count, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border border-night-600 bg-night-900 text-slate-300 tabular-nums ${className}`}
    >
      （<SlidingNumber number={count} />字）
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
  autoFormat = false,
  minHeight = 'min-h-[22rem]',
  children,
}) {
  if (html && autoFormat && canAutoFormat(html)) {
    const p = parseLetter(htmlToText(html));
    return (
      <LetterPaper
        title={p.title}
        greeting={p.greeting}
        paragraphs={p.paragraphs}
        closing1={p.closing1}
        closing2={p.closing2}
        sign={p.sign}
        date={p.date}
        minHeight={minHeight}
      >
        {children}
      </LetterPaper>
    );
  }
  const signLines = (Array.isArray(sign) ? sign : [sign]).filter(Boolean);
  return (
    <div className={`letter-paper rounded-lg px-5 py-5 sm:p-8 pb-16 sm:pb-16 text-[15px] zh leading-8 ${minHeight}`}>
      {html ? (
        <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: spaceOutHtmlTitles(html) }} />
      ) : (
        <>
          {title && <p className="text-center font-bold mb-3">{formatTitle(title)}</p>}
          {greeting && <p className="text-left">{withColon(greeting)}</p>}
          {paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {p}
            </p>
          ))}
          {extraLines.map((p, i) => (
            <p key={`x${i}`}>{p}</p>
          ))}
          {closing1 && <p style={{ textIndent: '4em' }}>{closing1}</p>}
          {closing2 && <p className="text-left">{closing2}</p>}
          {(signLines.length > 0 || date) && (
            // One blank line between the body and the signature block.
            <div className="flex justify-end mt-8">
              <div className="inline-flex flex-col items-center text-center">
                {signLines.map((s, i) => (
                  <p key={i}>{formatSign(s)}</p>
                ))}
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

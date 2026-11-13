import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, X, BookOpen, NotePencil, Target } from '@phosphor-icons/react';
import { listLessons } from '../api/lessons';
import { listSamplePapers } from '../api/samplePapers';
import { listExamYears } from '../api/examSittings';

// Lists are small, so they are fetched once per page load and searched in the browser.
let cache = null;
async function loadIndex() {
  if (cache) return cache;
  const [lessons, papers, years] = await Promise.all([
    listLessons().catch(() => []),
    listSamplePapers().catch(() => []),
    listExamYears().catch(() => []),
  ]);
  const items = [
    ...lessons.map((l) => ({
      key: `l-${l.slug}`,
      group: 'Bài học',
      icon: BookOpen,
      titleZh: l.titleZh,
      titleVi: l.titleVi,
      to: `/lessons/${l.slug}`,
    })),
    ...papers.map((p) => ({
      key: `p-${p.slug}`,
      group: 'Đề mẫu',
      icon: NotePencil,
      titleZh: p.titleZh,
      titleVi: p.titleVi,
      to: `/practice/${p.slug}`,
    })),
    ...years.flatMap((y) =>
      (y.sittings || []).map((s) => ({
        key: `e-${s.slug}`,
        group: 'Đề thi thật',
        icon: Target,
        titleZh: s.titleZh,
        titleVi: `${s.titleVi || ''} · ${s.label || ''} ${y.year}`.trim(),
        to: `/exams/${s.slug}`,
      }))
    ),
  ].filter((i) => i.to && !i.to.endsWith('/'));
  items.forEach((i) => {
    i.haystack = normalize(`${i.titleZh || ''} ${i.titleVi || ''} ${i.group}`);
  });
  cache = items;
  return items;
}

// Case- and accent-insensitive, so "don xin" finds "Đơn xin nghỉ phép".
function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

export default function GlobalSearch({ autoFocus = false, onNavigate, className = '' }) {
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  function ensureLoaded() {
    if (!items) loadIndex().then(setItems);
  }

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      ensureLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // "/" focuses the search from anywhere (unless the user is typing somewhere).
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!inputRef.current || inputRef.current.offsetParent === null) return;
      e.preventDefault();
      inputRef.current.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const results = useMemo(() => {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    if (!items || !words.length) return [];
    return items.filter((i) => words.every((w) => i.haystack.includes(w))).slice(0, 12);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  function go(item) {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(item.to);
    onNavigate?.();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else {
        setOpen(false);
        inputRef.current?.blur();
        onNavigate?.();
      }
    }
  }

  const showPanel = open && query.trim().length > 0;
  let lastGroup = null;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="group flex items-center h-11 rounded-full border border-night-600 bg-night-900/70 focus-within:border-coral-400 focus-within:ring-2 focus-within:ring-coral-400/60 transition-colors">
        <MagnifyingGlass size={18} aria-hidden="true" className="ml-4 flex-shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Tìm bài học, đề mẫu, đề thi"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
          placeholder="Tìm bài học, đề mẫu, đề thi…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            ensureLoaded();
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 h-full bg-transparent px-3 text-[0.9375rem] text-slate-100 placeholder:text-slate-500 outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Xoá từ khoá"
            className="mr-1 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-100 hover:bg-night-700"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <kbd className="hidden md:flex mr-3 items-center justify-center w-6 h-6 rounded-md border border-night-600 text-xs text-slate-500 font-sans">
            /
          </kbd>
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-night-700 bg-night-900 shadow-2xl shadow-black/40 overflow-hidden">
          <ul id={listId} role="listbox" aria-label="Kết quả tìm kiếm" className="max-h-[60vh] overflow-y-auto py-2">
            {!items ? (
              <li role="presentation" className="px-4 py-2 text-sm text-slate-400">Đang tải…</li>
            ) : results.length === 0 ? (
              <li role="presentation" className="px-4 py-2 text-sm text-slate-400">
                Không tìm thấy kết quả cho “{query.trim()}”.
              </li>
            ) : (
              results.map((item, idx) => {
                const header = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={item.key} role="presentation">
                    {header && (
                      <p className="px-4 pt-2 pb-1 text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-kicker">
                        {item.group}
                      </p>
                    )}
                    <div
                      id={`${listId}-${idx}`}
                      role="option"
                      aria-selected={idx === active}
                      onPointerEnter={() => setActive(idx)}
                      onClick={() => go(item)}
                      className={`mx-2 flex items-center gap-3 min-h-[48px] px-3 py-2 rounded-xl cursor-pointer ${
                        idx === active ? 'bg-coral-400/10 text-coral-400' : 'text-slate-200'
                      }`}
                    >
                      <item.icon size={18} aria-hidden="true" className="flex-shrink-0 opacity-80" />
                      <span className="min-w-0">
                        {item.titleZh && <span className="han font-semibold mr-2">{item.titleZh}</span>}
                        <span className="text-sm text-slate-400">{item.titleVi}</span>
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';

export function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <input
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
      />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <textarea
        value={value || ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
      />
    </label>
  );
}

const RICH_TOOLBAR_BTN =
  'px-2 py-1 text-xs rounded border border-night-600 bg-night-800 text-slate-200 hover:bg-night-700';

// Textarea with an HTML formatting toolbar (bold/italic/underline/image) and an
// inline preview, for fields whose value is raw HTML rendered via dangerouslySetInnerHTML.
export function RichTextAreaField({ label, value, onChange, placeholder, rows = 6 }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(false);

  function wrapSelection(before, after = before) {
    const el = textareaRef.current;
    const text = value || '';
    if (!el) {
      onChange(text + before + after);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const selected = text.slice(start, end);
    const next = text.slice(0, start) + before + selected + after + text.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertAtCursor(snippet) {
    const el = textareaRef.current;
    const text = value || '';
    if (!el) {
      onChange(text + snippet);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + snippet + text.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => insertAtCursor(`<img src="${reader.result}" alt="" />`);
    reader.readAsDataURL(file);
  }

  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <div className="mt-1 flex flex-wrap gap-1.5">
        <button type="button" className={`${RICH_TOOLBAR_BTN} font-bold`} onClick={() => wrapSelection('<b>', '</b>')}>
          B
        </button>
        <button type="button" className={`${RICH_TOOLBAR_BTN} italic`} onClick={() => wrapSelection('<i>', '</i>')}>
          I
        </button>
        <button
          type="button"
          className={`${RICH_TOOLBAR_BTN} underline`}
          onClick={() => wrapSelection('<u>', '</u>')}
        >
          U
        </button>
        <button type="button" className={RICH_TOOLBAR_BTN} onClick={() => fileInputRef.current?.click()}>
          📎 Thêm file
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          className={`${RICH_TOOLBAR_BTN} ${preview ? 'bg-coral-600 border-coral-500 text-white' : ''}`}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? 'Chỉnh sửa' : '👁 Xem trước'}
        </button>
      </div>
      {preview ? (
        <div
          className="mt-1 w-full min-h-[8rem] bg-night-900 border border-night-600 rounded px-3 py-2 text-sm text-slate-100"
          dangerouslySetInnerHTML={{ __html: value || '<span class="text-slate-500">(trống)</span>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value || ''}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 font-mono"
        />
      )}
    </label>
  );
}

export function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
      >
        {options.map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400 mb-2">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

// Textarea where each non-empty line becomes one string in an array.
export function LinesField({ label, value, onChange, placeholder, rows = 3 }) {
  const text = (value || []).join('\n');
  return (
    <label className="block text-xs text-slate-400 mb-2">
      {label}
      <textarea
        value={text}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
        className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
      />
    </label>
  );
}

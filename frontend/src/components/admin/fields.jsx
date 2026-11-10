import { useRef, useState } from 'react';
import { Paperclip, Eye } from '@phosphor-icons/react';
import { INPUT, LABEL, LABEL_TEXT, BTN_TOOL, CHECKBOX } from './ui';

export function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <input
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <textarea
        value={value || ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    </label>
  );
}

const RICH_TOOLBAR_BTN = BTN_TOOL;

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

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const isWord =
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isWord) {
      try {
        const mammoth = await import('mammoth/mammoth.browser');
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        insertAtCursor(html);
      } catch (err) {
        alert('Không đọc được file Word này: ' + err.message);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => insertAtCursor(`<img src="${reader.result}" alt="" />`);
    reader.readAsDataURL(file);
  }

  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
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
          <span className="inline-flex items-center gap-1"><Paperclip size={14} aria-hidden="true" />Thêm ảnh/Word</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.docx"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          className={`${RICH_TOOLBAR_BTN} ${preview ? '!bg-coral-500 !border-coral-500 !text-white' : ''}`}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? 'Chỉnh sửa' : <span className="inline-flex items-center gap-1"><Eye size={14} aria-hidden="true" />Xem trước</span>}
        </button>
      </div>
      {preview ? (
        <div
          className="w-full min-h-[8rem] bg-night-900 border border-night-600 rounded-xl px-3 py-2 text-sm text-slate-100 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: value || '<span class="text-slate-500">(trống)</span>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value || ''}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT} font-mono leading-relaxed`}
        />
      )}
    </label>
  );
}

export function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={INPUT}
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
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
    <label className="flex items-center gap-3 min-h-[44px] mb-1 text-sm font-medium text-slate-300 cursor-pointer">
      <input type="checkbox" className={CHECKBOX} checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

// Textarea where each non-empty line becomes one string in an array.
export function LinesField({ label, value, onChange, placeholder, rows = 3 }) {
  const text = (value || []).join('\n');
  return (
    <label className={LABEL}>
      <span className={LABEL_TEXT}>{label}</span>
      <textarea
        value={text}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
        className={INPUT}
      />
    </label>
  );
}

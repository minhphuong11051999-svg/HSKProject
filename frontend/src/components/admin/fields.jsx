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

import { BTN_TOOL, BTN_TOOL_DANGER, BTN_ADD, HINT } from './ui';

export default function Repeater({ title, hint, items, onChange, newItem, renderItem, addLabel, itemLabel }) {
  function updateItem(index, next) {
    const copy = items.slice();
    copy[index] = next;
    onChange(copy);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, newItem()]);
  }

  function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = items.slice();
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="rounded-2xl border border-night-700 bg-night-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-extrabold tracking-tight text-slate-100">{title}</h3>
        <span className="flex-shrink-0 rounded-full bg-coral-400/10 px-2.5 py-0.5 text-xs font-bold text-coral-400">{items.length} mục</span>
      </div>
      {hint && <p className={`${HINT} mb-4`}>{hint}</p>}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-night-800 border border-night-700 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-coral-400">{itemLabel ? itemLabel(item, index) : `#${index + 1}`}</p>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => move(index, -1)} className={BTN_TOOL} title="Lên" aria-label="Lên">↑</button>
                <button type="button" onClick={() => move(index, 1)} className={BTN_TOOL} title="Xuống" aria-label="Xuống">↓</button>
                <button type="button" onClick={() => removeItem(index)} className={BTN_TOOL_DANGER} title="Xoá">Xoá</button>
              </div>
            </div>
            {renderItem(item, (next) => updateItem(index, next))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className={`${BTN_ADD} mt-4`}
      >
        + {addLabel || 'Thêm mục'}
      </button>
    </div>
  );
}

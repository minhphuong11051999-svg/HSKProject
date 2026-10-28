export default function Repeater({ title, hint, items, onChange, newItem, renderItem, addLabel }) {
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
    <div className="border border-slate-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-slate-400">{items.length} mục</span>
      </div>
      {hint && <p className="text-xs text-slate-500 mb-3">{hint}</p>}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="absolute top-2 right-2 flex gap-1 text-xs">
              <button type="button" onClick={() => move(index, -1)} className="px-1.5 py-0.5 border border-slate-300 rounded bg-white" title="Lên">↑</button>
              <button type="button" onClick={() => move(index, 1)} className="px-1.5 py-0.5 border border-slate-300 rounded bg-white" title="Xuống">↓</button>
              <button type="button" onClick={() => removeItem(index)} className="px-1.5 py-0.5 border border-seal text-seal rounded bg-white" title="Xoá">Xoá</button>
            </div>
            <p className="text-xs text-slate-400 mb-2">#{index + 1}</p>
            {renderItem(item, (next) => updateItem(index, next))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 text-sm px-3 py-1.5 border border-indigo-400 text-indigo-600 rounded-lg"
      >
        + {addLabel || 'Thêm mục'}
      </button>
    </div>
  );
}

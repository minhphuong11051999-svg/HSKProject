import Repeater from './Repeater';
import { TextField, TextAreaField, NumberField, LinesField } from './fields';

export default function SimpleListEditor({ title, hint, items, onChange, fields, addLabel }) {
  function emptyItem() {
    const item = {};
    for (const f of fields) item[f.key] = f.type === 'lines' ? [] : f.type === 'number' ? null : '';
    return item;
  }

  return (
    <Repeater
      title={title}
      hint={hint}
      items={items}
      onChange={onChange}
      newItem={emptyItem}
      addLabel={addLabel}
      renderItem={(item, update) => (
        <div className="grid sm:grid-cols-2 gap-2">
          {fields.map((f) => {
            const value = item[f.key];
            const set = (v) => update({ ...item, [f.key]: v });
            const wide = f.type === 'textarea' || f.type === 'lines';
            return (
              <div key={f.key} className={wide ? 'sm:col-span-2' : ''}>
                {f.type === 'textarea' && (
                  <TextAreaField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'lines' && (
                  <LinesField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'number' && (
                  <NumberField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {(!f.type || f.type === 'text') && (
                  <TextField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
              </div>
            );
          })}
        </div>
      )}
    />
  );
}

import Repeater from './Repeater';
import { TextField, TextAreaField, RichTextAreaField, NumberField, LinesField, SelectField } from './fields';

export default function SimpleListEditor({ title, hint, items, onChange, fields, addLabel, newItem, itemLabel }) {
  function emptyItem() {
    if (newItem) return newItem(items);
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
      itemLabel={itemLabel}
      renderItem={(item, update) => (
        <div className="grid sm:grid-cols-2 gap-2">
          {fields.map((f) => {
            const value = item[f.key];
            const set = (v) => update({ ...item, [f.key]: v });
            const wide = f.type === 'textarea' || f.type === 'richtext' || f.type === 'lines';
            return (
              <div key={f.key} className={wide ? 'sm:col-span-2' : ''}>
                {f.type === 'textarea' && (
                  <TextAreaField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'richtext' && (
                  <RichTextAreaField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'lines' && (
                  <LinesField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'number' && (
                  <NumberField label={f.label} value={value} onChange={set} placeholder={f.placeholder} />
                )}
                {f.type === 'select' && (
                  <SelectField
                    label={f.label}
                    value={value ?? ''}
                    onChange={set}
                    options={
                      // keep a legacy value selectable even if it is not one of the standard options
                      value && !f.options.some(([v]) => v === value) ? [...f.options, [value, `Khác: ${value}`]] : f.options
                    }
                  />
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

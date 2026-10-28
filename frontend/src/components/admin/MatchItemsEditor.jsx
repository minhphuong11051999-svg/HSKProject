import Repeater from './Repeater';
import { TextField } from './fields';

export default function MatchItemsEditor({ items, onChange }) {
  function emptyItem() {
    return { leftLabelVi: '', rightLabelZh: '', explanation: '' };
  }

  return (
    <Repeater
      title="Ghép từ vựng"
      hint="Người học sẽ ghép vế trái (gợi ý tiếng Việt / khẩu ngữ) với vế phải (từ/cụm tiếng Trung đúng)."
      items={items}
      onChange={onChange}
      newItem={emptyItem}
      addLabel="Thêm cặp ghép từ"
      renderItem={(item, update) => (
        <div className="grid sm:grid-cols-2 gap-2">
          <TextField
            label="Vế trái (gợi ý)"
            value={item.leftLabelVi}
            onChange={(v) => update({ ...item, leftLabelVi: v })}
          />
          <TextField
            label="Vế phải (đáp án đúng, tiếng Trung)"
            value={item.rightLabelZh}
            onChange={(v) => update({ ...item, rightLabelZh: v })}
          />
          <TextField
            label="Giải thích thêm (có thể để trống)"
            value={item.explanation}
            onChange={(v) => update({ ...item, explanation: v })}
          />
        </div>
      )}
    />
  );
}

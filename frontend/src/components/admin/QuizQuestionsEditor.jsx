import Repeater from './Repeater';
import { TextField, TextAreaField, RichTextAreaField, SelectField } from './fields';

export default function QuizQuestionsEditor({ items, onChange }) {
  function emptyItem() {
    return {
      kind: 'THEORY',
      title: '',
      prompt: '',
      options: ['', ''],
      correctIndex: 0,
      explanation: '',
      draftHtml: '',
      draftHtmlMarked: '',
    };
  }

  return (
    <Repeater
      title="Câu hỏi trắc nghiệm"
      hint="Tab 'Nhận diện thể thức' (lý thuyết) và tab 'Phân tích khuyết thiếu' (lỗi sai) đều dùng chung loại này, phân biệt bằng Loại câu hỏi."
      items={items}
      onChange={onChange}
      newItem={emptyItem}
      addLabel="Thêm câu hỏi"
      renderItem={(item, update) => (
        <div className="space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <SelectField
              label="Loại câu hỏi"
              value={item.kind}
              onChange={(v) => update({ ...item, kind: v })}
              options={[
                ['THEORY', 'Lý thuyết (trắc nghiệm thường)'],
                ['ERROR_ANALYSIS', 'Phân tích lỗi sai (có bản nháp)'],
              ]}
            />
            <TextField label="Tiêu đề câu hỏi (vd: 1.1 ...)" value={item.title} onChange={(v) => update({ ...item, title: v })} />
          </div>

          <TextAreaField label="Đề bài / câu hỏi" value={item.prompt} onChange={(v) => update({ ...item, prompt: v })} />

          {item.kind === 'ERROR_ANALYSIS' && (
            <div className="grid sm:grid-cols-2 gap-2">
              <RichTextAreaField
                label="Bản nháp có lỗi (hiển thị trước khi trả lời)"
                value={item.draftHtml}
                onChange={(v) => update({ ...item, draftHtml: v })}
              />
              <RichTextAreaField
                label="Bản nháp đã đánh dấu lỗi (hiển thị sau khi kiểm tra)"
                value={item.draftHtmlMarked}
                onChange={(v) => update({ ...item, draftHtmlMarked: v })}
              />
            </div>
          )}

          <div>
            <p className="text-xs text-slate-400 mb-1">Các đáp án (chọn ô tròn cho đáp án ĐÚNG)</p>
            <div className="space-y-1">
              {item.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={item.correctIndex === i}
                    onChange={() => update({ ...item, correctIndex: i })}
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const options = item.options.slice();
                      options[i] = e.target.value;
                      update({ ...item, options });
                    }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                    className="flex-1 bg-night-900 border border-night-600 rounded px-2 py-1 text-sm text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const options = item.options.filter((_, idx) => idx !== i);
                      const correctIndex = item.correctIndex >= options.length ? 0 : item.correctIndex;
                      update({ ...item, options, correctIndex });
                    }}
                    className="text-xs text-red-400"
                  >
                    Xoá
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update({ ...item, options: [...item.options, ''] })}
              className="mt-1 text-xs text-coral-400 underline"
            >
              + thêm đáp án
            </button>
          </div>

          <TextAreaField
            label="Giải thích đáp án (hiển thị sau khi trả lời)"
            value={item.explanation}
            onChange={(v) => update({ ...item, explanation: v })}
          />
        </div>
      )}
    />
  );
}

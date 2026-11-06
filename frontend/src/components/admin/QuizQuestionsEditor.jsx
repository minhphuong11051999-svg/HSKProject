import Repeater from './Repeater';
import { TextField, TextAreaField, RichTextAreaField, SelectField } from './fields';

// `kind` pins the editor to one question type (THEORY for "Nhận diện thể thức",
// ERROR_ANALYSIS for "Tìm lỗi sai"); without it the admin picks per question.
export default function QuizQuestionsEditor({ items, onChange, kind, title, hint }) {
  function emptyItem() {
    return {
      kind: kind || 'THEORY',
      mode: 'choice',
      correctedHtml: '',
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
      title={title || 'Câu hỏi trắc nghiệm'}
      hint={hint}
      itemLabel={(item, index) =>
        item.kind === 'ERROR_ANALYSIS'
          ? `Câu ${index + 1} · ${item.mode === 'fix' ? 'Dạng 1 — Tự sửa lỗi' : 'Dạng 2 — Trắc nghiệm lỗi'}`
          : `Câu ${index + 1}`
      }
      items={items}
      onChange={onChange}
      newItem={emptyItem}
      addLabel="Thêm câu hỏi"
      renderItem={(item, update) => (
        <div className="space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            {!kind && (
            <SelectField
              label="Loại câu hỏi"
              value={item.kind}
              onChange={(v) => update({ ...item, kind: v })}
              options={[
                ['THEORY', 'Lý thuyết (trắc nghiệm thường)'],
                ['ERROR_ANALYSIS', 'Phân tích lỗi sai (có bản nháp)'],
              ]}
            />
            )}
            {item.kind === 'ERROR_ANALYSIS' && (
              <SelectField
                label="Dạng bài"
                value={item.mode || 'choice'}
                onChange={(v) => update({ ...item, mode: v })}
                options={[
                  ['fix', 'Dạng 1 — Tự sửa lỗi (2 ô nhập: dùng từ & bố cục)'],
                  ['choice', 'Dạng 2 — Trắc nghiệm nhận diện lỗi (4 phương án)'],
                ]}
              />
            )}
            <TextField label="Tiêu đề câu hỏi (vd: 1.1 ...)" value={item.title} onChange={(v) => update({ ...item, title: v })} />
          </div>

          <TextAreaField label="Đề bài / câu hỏi" value={item.prompt} onChange={(v) => update({ ...item, prompt: v })} />

          {item.kind === 'ERROR_ANALYSIS' && (
            <div className="grid sm:grid-cols-2 gap-2">
              <RichTextAreaField
                label="Bản thảo / bài mẫu viết sai (hiển thị trước khi trả lời)"
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

          {item.kind === 'ERROR_ANALYSIS' && (
            <RichTextAreaField
              label="Bản thảo hoàn chỉnh (đã sửa hết lỗi — hiển thị sau khi kiểm tra)"
              value={item.correctedHtml}
              onChange={(v) => update({ ...item, correctedHtml: v })}
            />
          )}

          {!(item.kind === 'ERROR_ANALYSIS' && item.mode === 'fix') && (
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
          )}

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

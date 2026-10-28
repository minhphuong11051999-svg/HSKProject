import Repeater from './Repeater';
import { TextAreaField, LinesField } from './fields';

function blankId(index) {
  return `b${index + 1}`;
}

export default function ClozeExercisesEditor({ items, onChange }) {
  function emptyItem() {
    return {
      templateHtml: '',
      blanks: [{ id: blankId(0), answer: '', options: [''] }],
    };
  }

  return (
    <Repeater
      title="Bài tập điền khuyết"
      hint='Trong đoạn văn, đánh dấu chỗ trống bằng cú pháp "_____(1)_____", "_____(2)_____"... theo đúng thứ tự các ô bên dưới.'
      items={items}
      onChange={onChange}
      newItem={emptyItem}
      addLabel="Thêm bài điền khuyết"
      renderItem={(item, update) => (
        <div className="space-y-2">
          <TextAreaField
            label="Đoạn văn có đánh dấu chỗ trống"
            rows={5}
            value={item.templateHtml}
            onChange={(v) => update({ ...item, templateHtml: v })}
            placeholder="...为了增进交流，_____(1)_____，留学生办公室_____(2)_____本周五..."
          />

          <div>
            <p className="text-xs text-slate-600 mb-1">Các chỗ trống (theo đúng thứ tự 1, 2, 3...)</p>
            <div className="space-y-2">
              {item.blanks.map((b, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded p-2">
                  <p className="text-xs text-slate-400 mb-1">Chỗ trống số {i + 1}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      value={b.answer}
                      onChange={(e) => {
                        const blanks = item.blanks.slice();
                        blanks[i] = { ...b, answer: e.target.value };
                        update({ ...item, blanks });
                      }}
                      placeholder="Đáp án đúng"
                      className="border border-slate-300 rounded px-2 py-1 text-sm"
                    />
                    <LinesField
                      label="Các lựa chọn hiển thị (mỗi dòng 1 lựa chọn, nên gồm cả đáp án đúng ở trên)"
                      value={b.options}
                      onChange={(options) => {
                        const blanks = item.blanks.slice();
                        blanks[i] = { ...b, options };
                        update({ ...item, blanks });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const blanks = item.blanks
                        .filter((_, idx) => idx !== i)
                        .map((blank, idx) => ({ ...blank, id: blankId(idx) }));
                      update({ ...item, blanks });
                    }}
                    className="text-xs text-seal mt-1"
                  >
                    Xoá chỗ trống này
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                update({
                  ...item,
                  blanks: [...item.blanks, { id: blankId(item.blanks.length), answer: '', options: [''] }],
                })
              }
              className="mt-1 text-xs text-indigo-600 underline"
            >
              + thêm chỗ trống
            </button>
          </div>
        </div>
      )}
    />
  );
}

import Repeater from './Repeater';
import { INPUT, LABEL, LABEL_TEXT, BTN_LINK_DANGER, BTN_ADD } from './ui';
import { RichTextAreaField, LinesField } from './fields';

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
          <RichTextAreaField
            label="Đoạn văn có đánh dấu chỗ trống"
            rows={5}
            value={item.templateHtml}
            onChange={(v) => update({ ...item, templateHtml: v })}
            placeholder="...为了增进交流，_____(1)_____，留学生办公室_____(2)_____本周五..."
          />

          <div>
            <p className={LABEL_TEXT}>Các chỗ trống (theo đúng thứ tự 1, 2, 3...)</p>
            <div className="space-y-2">
              {item.blanks.map((b, i) => (
                <div key={i} className="bg-night-900 border border-night-700 rounded-xl p-3">
                  <p className="text-sm font-bold text-slate-300 mb-2">Chỗ trống số {i + 1}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <label className={LABEL}>
                    <span className={LABEL_TEXT}>Đáp án đúng</span>
                    <input
                      value={b.answer}
                      onChange={(e) => {
                        const blanks = item.blanks.slice();
                        blanks[i] = { ...b, answer: e.target.value };
                        update({ ...item, blanks });
                      }}
                      placeholder="Đáp án đúng"
                      className={INPUT}
                    />
                    </label>
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
                    className={`${BTN_LINK_DANGER} -ml-3`}
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
              className={`${BTN_ADD} mt-3`}
            >
              + thêm chỗ trống
            </button>
          </div>
        </div>
      )}
    />
  );
}

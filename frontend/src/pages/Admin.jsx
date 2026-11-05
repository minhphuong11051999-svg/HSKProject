import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLessons, getLessonForAdmin, createLesson, updateLesson, deleteLesson } from '../api/lessons';
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField } from '../components/admin/fields';
import SimpleListEditor from '../components/admin/SimpleListEditor';
import QuizQuestionsEditor from '../components/admin/QuizQuestionsEditor';
import ClozeExercisesEditor from '../components/admin/ClozeExercisesEditor';
import MatchItemsEditor from '../components/admin/MatchItemsEditor';
import { ALL_LESSON_PARTS, BUILTIN_PART_KEYS, DEFAULT_SELECTED_PARTS, partLabel } from '../constants/lessonParts';

const DEFAULT_PREMIUM_PARTS = ['cloze', 'error', 'vocab', 'writing'];

// Standard field set for a brand-new lesson's guided-writing forms, so a new
// lesson starts with a working template instead of an empty form the admin
// has to build from scratch every time.
const DEFAULT_WRITING_FIELDS = [
  { label: 'Tiêu đề 标题', name: 'title', placeholder: 'Ví dụ: 关于举办留学生太极拳比赛的通知', inputType: 'text', group: 'writing' },
  { label: 'Đối tượng nhận 被通知方', name: 'greeting', placeholder: 'Ví dụ: 各位同学', inputType: 'text', group: 'writing' },
  {
    label: 'Chính văn 正文 (mỗi đoạn xuống dòng riêng)',
    name: 'body',
    placeholder: 'Gõ từng đoạn, xuống dòng (Enter) để tạo đoạn mới...',
    inputType: 'textarea',
    group: 'writing',
  },
  { label: 'Đơn vị phát hành 署名', name: 'sign', placeholder: 'Ví dụ: 留学生办公室', inputType: 'text', group: 'writing' },
  { label: 'Ngày tháng 日期', name: 'date', placeholder: 'Ví dụ: 2026年9月1日', inputType: 'text', group: 'writing' },
];

const DEFAULT_PARTIAL_WRITING_FIELDS = [
  { label: 'Tiêu đề (标题)', name: 'title', placeholder: '请假条', inputType: 'text', group: 'partial_writing' },
  {
    label: 'Xưng hô người nhận (称呼 – đúng dấu câu)',
    name: 'greeting',
    placeholder: '陈老师：',
    inputType: 'text',
    group: 'partial_writing',
  },
  {
    label: 'Cú pháp thời gian dùng từ "拟于"',
    name: 'timeClause',
    placeholder: '我拟于10月15日上午请假半天。',
    inputType: 'text',
    group: 'partial_writing',
  },
  {
    label: 'Lời đề nghị phê chuẩn ở cuối chính văn',
    name: 'approvalRequest',
    placeholder: '特向您请假，并望批准。',
    inputType: 'text',
    group: 'partial_writing',
  },
  { label: 'Lời kết 1 (此致)', name: 'closing1', placeholder: '此致', inputType: 'text', group: 'partial_writing' },
  { label: 'Lời kết 2 (敬礼！)', name: 'closing2', placeholder: '敬礼！', inputType: 'text', group: 'partial_writing' },
  { label: 'Tên người viết / ký tên (署名)', name: 'sign', placeholder: '美美', inputType: 'text', group: 'partial_writing' },
  { label: 'Ngày tháng (日期)', name: 'date', placeholder: '2026年10月14日', inputType: 'text', group: 'partial_writing' },
];

const EMPTY_FORM = {
  id: null,
  slug: '',
  titleZh: '',
  titleVi: '',
  description: '',
  themeKey: 'indigo',
  type: 'PRACTICE',
  examMonth: null,
  examYear: null,
  orderIndex: 0,
  isPremium: false,
  premiumParts: DEFAULT_PREMIUM_PARTS,
  selectedParts: DEFAULT_SELECTED_PARTS,
  sections: [],
  sampleDocuments: [],
  vocabTerms: [],
  fixedPhrases: [],
  quizQuestions: [],
  clozeExercises: [],
  matchItems: [],
  writingTasks: [],
  guidedWritingFields: [...DEFAULT_WRITING_FIELDS, ...DEFAULT_PARTIAL_WRITING_FIELDS],
  guidedWritingScenarios: [],
};

export default function Admin() {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  function refresh() {
    listLessons().then(setLessons);
  }

  useEffect(refresh, []);

  async function edit(lesson) {
    setError('');
    setLoadingEdit(true);
    try {
      const full = await getLessonForAdmin(lesson.id);
      setForm({ ...EMPTY_FORM, ...full });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được nội dung bài học');
    } finally {
      setLoadingEdit(false);
    }
  }

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function withOrder(list) {
    return list.map((item, i) => ({ ...item, orderIndex: i }));
  }

  function toggleSelectedPart(key, checked) {
    setForm((prev) => ({
      ...prev,
      selectedParts: checked
        ? [...prev.selectedParts, key]
        : prev.selectedParts.filter((k) => k !== key),
      // Dropping a part also drops its premium lock, so it can't stay locked while hidden.
      premiumParts: checked ? prev.premiumParts : prev.premiumParts.filter((k) => k !== key),
    }));
  }

  // Generic editor binding for lesson parts that have no dedicated content type yet
  // (anything outside BUILTIN_PART_KEYS): reuses the `sections` table, tagged by `kind`.
  // "theory" also matches legacy sections saved before `kind` existed (kind is null/"text").
  function sectionsMatch(s, key) {
    return key === 'theory' ? !s.kind || s.kind === 'text' || s.kind === 'theory' : s.kind === key;
  }

  function setGenericSectionsFor(key, items) {
    const others = form.sections.filter((s) => !sectionsMatch(s, key));
    set('sections', [...others, ...items.map((item) => ({ ...item, kind: key }))]);
  }

  function guidedMatch(item, group) {
    return group === 'writing' ? !item.group || item.group === 'writing' : item.group === group;
  }

  function setGuidedWritingFieldsFor(group, items) {
    const others = form.guidedWritingFields.filter((f) => !guidedMatch(f, group));
    set('guidedWritingFields', [...others, ...items.map((item) => ({ ...item, group }))]);
  }

  function setGuidedWritingScenariosFor(group, items) {
    const others = form.guidedWritingScenarios.filter((s) => !guidedMatch(s, group));
    set('guidedWritingScenarios', [...others, ...items.map((item) => ({ ...item, group }))]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        titleZh: form.titleZh,
        titleVi: form.titleVi,
        description: form.description,
        themeKey: form.themeKey,
        type: form.type,
        examMonth: form.type === 'EXAM' ? form.examMonth : null,
        examYear: form.type === 'EXAM' ? form.examYear : null,
        orderIndex: form.orderIndex || 0,
        isPremium: !!form.isPremium,
        premiumParts: form.premiumParts || [],
        selectedParts: form.selectedParts?.length ? form.selectedParts : DEFAULT_SELECTED_PARTS,
        sections: withOrder(form.sections),
        sampleDocuments: withOrder(form.sampleDocuments),
        vocabTerms: form.vocabTerms,
        fixedPhrases: form.fixedPhrases,
        quizQuestions: withOrder(form.quizQuestions),
        clozeExercises: withOrder(form.clozeExercises),
        matchItems: withOrder(form.matchItems).map((m) => ({ ...m, correctKey: m.rightLabelZh })),
        writingTasks: withOrder(form.writingTasks),
        guidedWritingFields: withOrder(form.guidedWritingFields),
        guidedWritingScenarios: form.guidedWritingScenarios,
      };

      if (form.id) {
        const updated = await updateLesson(form.id, payload);
        setForm({ ...EMPTY_FORM, ...updated });
      } else {
        await createLesson(payload);
        setForm(EMPTY_FORM);
      }
      setSavedMessage('Đã lưu thành công.');
      setTimeout(() => setSavedMessage(''), 4000);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá bài học này?')) return;
    await deleteLesson(id);
    if (form.id === id) setForm(EMPTY_FORM);
    refresh();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Danh sách bài học</h1>
            <Link to="/admin/users" className="text-sm text-coral-400 underline">Quản lý người dùng</Link>
          </div>
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="bg-night-800 border border-night-700 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="zh">{lesson.titleZh}</p>
                  <p className="text-xs text-slate-400">{lesson.slug} · {lesson.type}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => edit(lesson)} className="text-coral-400 underline">Sửa</button>
                  <button onClick={() => handleDelete(lesson.id)} className="text-red-400 underline">Xoá</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{form.id ? 'Sửa bài học' : 'Thêm bài học mới'}</h2>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="text-sm px-3 py-1.5 border border-night-600 rounded-lg">
                + Tạo bài học mới
              </button>
            )}
          </div>

          {loadingEdit && <p className="text-slate-400 text-sm mb-3">Đang tải nội dung...</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-night-600 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-1">Thông tin cơ bản</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                <TextField label="Slug (vd: luyen-viet-thongbao)" value={form.slug} onChange={(v) => set('slug', v)} />
                <TextField label="Tiêu đề chữ Hán" value={form.titleZh} onChange={(v) => set('titleZh', v)} />
                <TextField label="Tiêu đề tiếng Việt" value={form.titleVi} onChange={(v) => set('titleVi', v)} />
                <SelectField
                  label="Loại bài"
                  value={form.type}
                  onChange={(v) => set('type', v)}
                  options={[['PRACTICE', 'Đề mẫu'], ['EXAM', 'Đề thi thật']]}
                />
                {form.type === 'EXAM' && (
                  <>
                    <NumberField label="Tháng" value={form.examMonth} onChange={(v) => set('examMonth', v)} />
                    <NumberField label="Năm" value={form.examYear} onChange={(v) => set('examYear', v)} />
                  </>
                )}
                <NumberField label="Thứ tự hiển thị" value={form.orderIndex} onChange={(v) => set('orderIndex', v)} />
              </div>
              <TextAreaField label="Mô tả ngắn" value={form.description} onChange={(v) => set('description', v)} />
              <CheckboxField
                label="Khoá toàn bộ bài học, chỉ user Premium mới xem được"
                checked={form.isPremium}
                onChange={(v) => set('isPremium', v)}
              />

              <div>
                <p className="text-xs text-slate-400 mb-1.5">
                  Chọn đề mục cho bài học này — tick theo đúng thứ tự bạn muốn chúng xuất hiện, trang bài học sẽ tự
                  đánh số lại theo thứ tự tick.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_LESSON_PARTS.map((part) => {
                    const checked = form.selectedParts.includes(part.key);
                    const order = form.selectedParts.indexOf(part.key);
                    return (
                      <label key={part.key} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleSelectedPart(part.key, e.target.checked)}
                        />
                        {checked ? `${order + 1}. ` : ''}
                        {part.label}
                        {!BUILTIN_PART_KEYS.includes(part.key) && (
                          <span className="text-[10px] text-slate-500">(mới)</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1.5">
                  Khoá riêng từng phần (chỉ áp dụng khi bài học KHÔNG bị khoá toàn bộ ở trên)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {form.selectedParts.map((key, idx) => {
                    const checked = form.premiumParts.includes(key);
                    return (
                      <label key={key} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            set(
                              'premiumParts',
                              e.target.checked
                                ? [...form.premiumParts, key]
                                : form.premiumParts.filter((k) => k !== key)
                            )
                          }
                        />
                        {idx + 1}. {partLabel(key)}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <SimpleListEditor
              title="Hướng dẫn (tab 1)"
              hint="Mỗi mục là một phần trong bài hướng dẫn, vd: Mục đích & yêu cầu, Cấu trúc chuẩn..."
              items={form.sections.filter((s) => sectionsMatch(s, 'theory'))}
              onChange={(v) => setGenericSectionsFor('theory', v)}
              addLabel="Thêm mục hướng dẫn"
              fields={[
                { key: 'heading', label: 'Tiêu đề mục' },
                { key: 'bodyHtml', label: 'Nội dung', type: 'richtext' },
              ]}
            />

            <SimpleListEditor
              title="Bài mẫu"
              items={form.sampleDocuments}
              onChange={(v) => set('sampleDocuments', v)}
              addLabel="Thêm bài mẫu"
              fields={[
                { key: 'label', label: 'Nhãn (vd: Bài mẫu 1)' },
                { key: 'audience', label: 'Lời chào / đối tượng nhận (có thể để trống)' },
                { key: 'body', label: 'Nội dung văn bản', type: 'richtext' },
                { key: 'signerOrg', label: 'Đơn vị ký tên (có thể để trống)' },
                { key: 'date', label: 'Ngày tháng (có thể để trống)' },
              ]}
            />

            <SimpleListEditor
              title="Từ vựng"
              items={form.vocabTerms}
              onChange={(v) => set('vocabTerms', v)}
              addLabel="Thêm từ vựng"
              fields={[
                { key: 'literary', label: '书面语 (văn viết)' },
                { key: 'colloquial', label: '口语 (khẩu ngữ)' },
                { key: 'meaningVi', label: 'Nghĩa tiếng Việt' },
                { key: 'example', label: 'Ví dụ (có thể để trống)' },
              ]}
            />

            <SimpleListEditor
              title="Mẫu câu cố định (套语)"
              items={form.fixedPhrases}
              onChange={(v) => set('fixedPhrases', v)}
              addLabel="Thêm mẫu câu"
              fields={[
                { key: 'chinese', label: 'Câu/cụm tiếng Trung' },
                { key: 'viExplanation', label: 'Giải thích tiếng Việt' },
              ]}
            />

            <QuizQuestionsEditor items={form.quizQuestions} onChange={(v) => set('quizQuestions', v)} />

            <ClozeExercisesEditor items={form.clozeExercises} onChange={(v) => set('clozeExercises', v)} />

            <MatchItemsEditor items={form.matchItems} onChange={(v) => set('matchItems', v)} />

            <SimpleListEditor
              title="Nhiệm vụ viết câu"
              items={form.writingTasks}
              onChange={(v) => set('writingTasks', v)}
              addLabel="Thêm nhiệm vụ viết câu"
              fields={[
                { key: 'title', label: 'Tiêu đề nhiệm vụ' },
                { key: 'hint', label: 'Gợi ý (có thể để trống)', type: 'richtext' },
                { key: 'facts', label: 'Dữ kiện / câu gốc (mỗi dòng 1 ý)', type: 'lines' },
                { key: 'requiredKeywords', label: 'Từ khoá bắt buộc (mỗi dòng 1 từ, có thể để trống)', type: 'lines' },
                { key: 'referenceAnswer', label: 'Đáp án tham khảo', type: 'richtext' },
              ]}
            />

            <SimpleListEditor
              title="Form luyện viết hoàn chỉnh — các trường nhập"
              hint="Mỗi mục là một ô nhập liệu trong form viết bài hoàn chỉnh (vd: Tiêu đề, Đối tượng nhận, Nội dung...)."
              items={form.guidedWritingFields.filter((f) => guidedMatch(f, 'writing'))}
              onChange={(v) => setGuidedWritingFieldsFor('writing', v)}
              addLabel="Thêm ô nhập liệu"
              fields={[
                { key: 'label', label: 'Nhãn hiển thị' },
                { key: 'name', label: 'Tên trường (không dấu, không cách, vd: title)' },
                { key: 'placeholder', label: 'Gợi ý nhập (có thể để trống)' },
                { key: 'inputType', label: 'Loại nhập (text hoặc textarea)' },
              ]}
            />

            <SimpleListEditor
              title="Form luyện viết hoàn chỉnh — đề bài & bài mẫu"
              items={form.guidedWritingScenarios.filter((s) => guidedMatch(s, 'writing'))}
              onChange={(v) => setGuidedWritingScenariosFor('writing', v)}
              addLabel="Thêm đề bài"
              fields={[
                { key: 'situationPrompt', label: 'Đề bài / tình huống', type: 'richtext' },
                { key: 'modelAnswer', label: 'Bài mẫu tham khảo', type: 'richtext' },
                { key: 'targetWordCount', label: 'Số chữ mục tiêu (có thể để trống)', type: 'number' },
              ]}
            />

            <SimpleListEditor
              title="Form viết bán phần — các trường nhập"
              hint="Giống form luyện viết hoàn chỉnh nhưng KHÔNG thêm ô nội dung chính (Chính văn) — chỉ các trường khung thư (tiêu đề, xưng hô, mở đầu, lời kết, ký tên, ngày tháng...)."
              items={form.guidedWritingFields.filter((f) => guidedMatch(f, 'partial_writing'))}
              onChange={(v) => setGuidedWritingFieldsFor('partial_writing', v)}
              addLabel="Thêm ô nhập liệu"
              fields={[
                { key: 'label', label: 'Nhãn hiển thị' },
                { key: 'name', label: 'Tên trường (không dấu, không cách, vd: title)' },
                { key: 'placeholder', label: 'Gợi ý nhập (có thể để trống)' },
                { key: 'inputType', label: 'Loại nhập (text hoặc textarea)' },
              ]}
            />

            <SimpleListEditor
              title="Form viết bán phần — đề bài & bài mẫu"
              items={form.guidedWritingScenarios.filter((s) => guidedMatch(s, 'partial_writing'))}
              onChange={(v) => setGuidedWritingScenariosFor('partial_writing', v)}
              addLabel="Thêm đề bài"
              fields={[
                { key: 'situationPrompt', label: 'Đề bài / tình huống', type: 'richtext' },
                { key: 'modelAnswer', label: 'Bài mẫu tham khảo', type: 'richtext' },
                { key: 'targetWordCount', label: 'Số chữ mục tiêu (có thể để trống)', type: 'number' },
              ]}
            />

            {form.selectedParts
              .filter((key) => !BUILTIN_PART_KEYS.includes(key))
              .map((key) => (
                <SimpleListEditor
                  key={key}
                  title={`${partLabel(key)} (mục mới — nội dung dạng văn bản, chưa chấm điểm tự động)`}
                  items={form.sections.filter((s) => sectionsMatch(s, key))}
                  onChange={(v) => setGenericSectionsFor(key, v)}
                  addLabel={`Thêm nội dung cho "${partLabel(key)}"`}
                  fields={[
                    { key: 'heading', label: 'Tiêu đề (có thể để trống)' },
                    { key: 'bodyHtml', label: 'Nội dung', type: 'richtext' },
                  ]}
                />
              ))}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {savedMessage && <p className="text-green-400 text-sm">{savedMessage}</p>}
            <div className="flex gap-2 sticky bottom-0 bg-night-950 py-3">
              <button type="submit" disabled={saving} className="bg-coral-500 hover:bg-coral-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors">
                {saving ? 'Đang lưu...' : form.id ? 'Lưu thay đổi' : 'Tạo bài học'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

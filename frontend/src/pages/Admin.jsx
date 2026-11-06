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

// The 8 standard slots of the shared letter form (UI/UX layout spec §I):
// role key (stored in `name`) → where the text lands on the simulated paper.
// Labels carry no leading "1. " — position numbers them automatically.
const FIELD_ROLES = [
  ['title', 'Ô 1 · Tiêu đề (标题) — căn giữa'],
  ['greeting', 'Ô 2 · Xưng hô người nhận (称呼) — sát lề trái'],
  ['body', 'Ô 3 · Chính văn / Thời gian (正文) — thụt 2 ô'],
  ['bodyEnd', 'Ô 4 · Lời đề nghị / Kết chính văn — thụt 2 ô'],
  ['closing1', 'Ô 5 · Lời kết 1 (此致) — thụt 4 ô'],
  ['closing2', 'Ô 6 · Lời kết 2 (敬礼！) — sát lề trái'],
  ['sign', 'Ô 7 · Tên người viết / ký tên (署名) — góc phải'],
  ['date', 'Ô 8 · Ngày tháng (日期) — góc phải'],
];

const INPUT_TYPES = [
  ['text', 'Một dòng'],
  ['textarea', 'Nhiều dòng (mỗi dòng = 1 đoạn)'],
  ['checkbox', 'Ô tick (bật/tắt)'],
];

const STANDARD_LABELS = [
  'Tiêu đề (标题)',
  'Xưng hô người nhận (称呼)',
  'Chính văn / Thời gian (正文)',
  'Lời đề nghị phê chuẩn / Kết chính văn (正文 - 结尾句)',
  'Lời kết 1 (此致)',
  'Lời kết 2 (敬礼！)',
  'Tên người viết / Ký tên (署名)',
  'Ngày tháng (日期)',
];

function standardFields(group, placeholders) {
  return FIELD_ROLES.map(([name], i) => ({
    name,
    label: STANDARD_LABELS[i],
    placeholder: placeholders[i] || '',
    inputType: name === 'body' ? 'textarea' : 'text',
    group,
  }));
}

const DEFAULT_WRITING_FIELDS = standardFields('writing', [
  'Ví dụ: 请假条 / 推荐信 / 通知',
  'Ví dụ: 王老师：/ 各位同学：',
  'Gõ từng đoạn, xuống dòng (Enter) để tạo đoạn mới...',
  'Ví dụ: 特向您请假，并望批准。',
  '此致',
  '敬礼！',
  'Ví dụ: 美美 / 留学生办公室',
  'Ví dụ: 2026年10月14日',
]);

const DEFAULT_PARTIAL_WRITING_FIELDS = standardFields('partial_writing', [
  '请假条',
  '陈老师：',
  '我拟于10月15日上午请假半天。',
  '特向您请假，并望批准。',
  '此致',
  '敬礼！',
  '美美',
  '2026年10月14日',
]);

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
  exercises: [],
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

  function setQuizFor(kind, items) {
    const others = form.quizQuestions.filter((q) => q.kind !== kind);
    set('quizQuestions', [...others, ...items.map((item) => ({ ...item, kind }))]);
  }

  function setExercisesFor(kind, items) {
    const others = form.exercises.filter((e) => e.kind !== kind);
    set('exercises', [...others, ...items.map((item) => ({ ...item, kind }))]);
  }

  function writingFieldsEditor(group) {
    return (
      <SimpleListEditor
        title="Các ô nhập liệu (Ô 1 → Ô 8)"
        hint="Số thứ tự Ô 1, Ô 2... tự đánh theo vị trí. Chọn đúng Vai trò để tờ giấy mô phỏng căn lề đúng quy chuẩn (tiêu đề giữa, xưng hô trái, chính văn thụt 2 ô, 此致 thụt 4 ô, ký tên & ngày tháng góc phải)."
        items={form.guidedWritingFields.filter((f) => guidedMatch(f, group))}
        onChange={(v) => setGuidedWritingFieldsFor(group, v)}
        addLabel="Thêm ô nhập liệu"
        itemLabel={(_, i) => `Ô ${i + 1}`}
        newItem={(current) => {
          const used = new Set(current.map((f) => f.name));
          const role = FIELD_ROLES.find(([r]) => !used.has(r))?.[0] || '';
          return { label: '', name: role, placeholder: '', inputType: role === 'body' ? 'textarea' : 'text' };
        }}
        fields={[
          { key: 'label', label: 'Nhãn hiển thị (vd: Tiêu đề 标题)' },
          { key: 'name', label: 'Vai trò trên tờ giấy', type: 'select', options: FIELD_ROLES },
          { key: 'placeholder', label: 'Gợi ý nhập / placeholder (có thể để trống)' },
          { key: 'inputType', label: 'Loại ô nhập', type: 'select', options: INPUT_TYPES },
        ]}
      />
    );
  }

  function writingScenariosEditor(group) {
    return (
      <SimpleListEditor
        title="Đề bài & bài mẫu"
        items={form.guidedWritingScenarios.filter((s) => guidedMatch(s, group))}
        onChange={(v) => setGuidedWritingScenariosFor(group, v)}
        addLabel="Thêm đề bài"
        itemLabel={(_, i) => `Đề ${i + 1}`}
        fields={[
          { key: 'situationPrompt', label: 'Đề bài / tình huống', type: 'richtext' },
          { key: 'modelAnswer', label: 'Bài mẫu tham khảo', type: 'richtext' },
          { key: 'targetWordCount', label: 'Số chữ mục tiêu (có thể để trống)', type: 'number' },
        ]}
      />
    );
  }

  function fixedPhrasesEditor() {
    return (
      <SimpleListEditor
        title="Bộ mẫu câu cố định (套语) — cột Trung văn / cột Tiếng Việt"
        items={form.fixedPhrases}
        onChange={(v) => set('fixedPhrases', v)}
        addLabel="Thêm mẫu câu"
        itemLabel={(_, i) => `Mẫu câu ${i + 1}`}
        fields={[
          { key: 'chinese', label: 'Trung văn (中文)' },
          { key: 'viExplanation', label: 'Tiếng Việt' },
        ]}
      />
    );
  }

  function matchEditor() {
    return <MatchItemsEditor items={form.matchItems} onChange={(v) => set('matchItems', v)} />;
  }

  function sentenceTasksEditor() {
    return (
      <SimpleListEditor
        title="Nhiệm vụ lắp ráp câu"
        items={form.writingTasks}
        onChange={(v) => set('writingTasks', v)}
        addLabel="Thêm nhiệm vụ"
        itemLabel={(_, i) => `Nhiệm vụ ${i + 1}`}
        fields={[
          { key: 'title', label: 'Tiêu đề nhiệm vụ (vd: Nhiệm vụ 1 · Lắp ráp câu thông báo)' },
          { key: 'facts', label: 'Thành phần dữ liệu đầu vào (mỗi dòng 1 ý)', type: 'lines' },
          { key: 'requiredKeywords', label: 'Từ khoá bắt buộc (mỗi dòng 1 từ, có thể để trống)', type: 'lines' },
          { key: 'hint', label: '💡 Công thức gợi ý (có thể để trống)', type: 'richtext' },
          { key: 'referenceAnswer', label: 'Đáp án mẫu', type: 'richtext' },
        ]}
      />
    );
  }

  // One editor block per ticked part, in the same order (and with the same
  // "Bước N" numbering) the student sees on the lesson page.
  function renderPartEditor(key) {
    switch (key) {
      case 'theory':
        return (
          <>
            <SimpleListEditor
              title="Các thẻ nội dung lý thuyết"
              hint="Mỗi mục hiển thị thành một thẻ (card) riêng, vd: Mục đích & yêu cầu, Cấu trúc chuẩn..."
              items={form.sections.filter((s) => sectionsMatch(s, 'theory'))}
              onChange={(v) => setGenericSectionsFor('theory', v)}
              addLabel="Thêm thẻ lý thuyết"
              itemLabel={(_, i) => `Thẻ ${i + 1}`}
              fields={[
                { key: 'heading', label: 'Tiêu đề thẻ' },
                { key: 'bodyHtml', label: 'Nội dung', type: 'richtext' },
              ]}
            />
            {!form.selectedParts.includes('fixed_phrases') && fixedPhrasesEditor()}
          </>
        );
      case 'samples':
        return (
          <SimpleListEditor
            title="Bài mẫu (hiển thị trên tờ giấy mô phỏng, tự đếm số chữ)"
            hint="Dòng đầu tiên ngắn của Nội dung (vd: 关于春节放假的通知) sẽ tự căn giữa làm tiêu đề."
            items={form.sampleDocuments}
            onChange={(v) => set('sampleDocuments', v)}
            addLabel="Thêm bài mẫu"
            itemLabel={(_, i) => `Bài mẫu ${i + 1}`}
            fields={[
              { key: 'label', label: 'Nhãn (vd: Thông báo hành chính)' },
              { key: 'audience', label: 'Xưng hô / đối tượng nhận (có thể để trống)' },
              { key: 'body', label: 'Nội dung văn bản (mỗi dòng = 1 đoạn)', type: 'richtext' },
              { key: 'signerOrg', label: 'Ký tên / đơn vị (có thể để trống)' },
              { key: 'date', label: 'Ngày tháng (có thể để trống)' },
            ]}
          />
        );
      case 'quiz':
        return (
          <QuizQuestionsEditor
            kind="THEORY"
            title="Câu hỏi trắc nghiệm lý thuyết"
            hint="Mỗi câu gồm 4 phương án A, B, C, D — chọn ô tròn cho đáp án đúng; phần giải thích hiện trong hộp phản hồi sau khi kiểm tra."
            items={form.quizQuestions.filter((q) => q.kind === 'THEORY')}
            onChange={(v) => setQuizFor('THEORY', v)}
          />
        );
      case 'matching':
        return matchEditor();
      case 'cloze':
        return <ClozeExercisesEditor items={form.clozeExercises} onChange={(v) => set('clozeExercises', v)} />;
      case 'error':
        return (
          <QuizQuestionsEditor
            kind="ERROR_ANALYSIS"
            title="Bài tìm lỗi sai"
            hint="Dạng 1: học viên tự sửa lỗi vào 2 ô (dùng từ & bố cục), sau khi kiểm tra hiện giải thích + bản thảo hoàn chỉnh. Dạng 2: 4 phương án trắc nghiệm, sau khi kiểm tra hiện đáp án đúng + bản thảo hoàn chỉnh."
            items={form.quizQuestions.filter((q) => q.kind === 'ERROR_ANALYSIS')}
            onChange={(v) => setQuizFor('ERROR_ANALYSIS', v)}
          />
        );
      case 'sentence_building':
        return sentenceTasksEditor();
      case 'translate_transform':
        return (
          <SimpleListEditor
            title="Câu dịch - chuyển đổi"
            items={form.exercises.filter((e) => e.kind === 'translate')}
            onChange={(v) => setExercisesFor('translate', v)}
            addLabel="Thêm câu"
            itemLabel={(_, i) => `Câu ${i + 1}`}
            fields={[
              { key: 'prompt', label: 'Câu nguồn', type: 'richtext' },
              { key: 'hints', label: 'Tag cụm từ gợi ý (mỗi dòng 1 tag, hiển thị xếp hàng ngang)', type: 'lines' },
              { key: 'answer', label: 'Đáp án chuẩn', type: 'richtext' },
            ]}
          />
        );
      case 'outline':
        return (
          <SimpleListEditor
            title="Dàn ý — mỗi mục là 1 hàng (trái: gợi ý, phải: ô trống cho học viên)"
            items={form.exercises.filter((e) => e.kind === 'outline')}
            onChange={(v) => setExercisesFor('outline', v)}
            addLabel="Thêm hàng dàn ý"
            itemLabel={(_, i) => `Hàng ${i + 1}`}
            fields={[
              { key: 'prompt', label: 'Nội dung gợi ý (cột trái)', type: 'richtext' },
              { key: 'answer', label: 'Cấu trúc tiếng Trung đáp án (hiện khi bấm Xem đáp án)', type: 'textarea' },
            ]}
          />
        );
      case 'fixed_phrases':
        return fixedPhrasesEditor();
      case 'vocab':
        return (
          <>
            <SimpleListEditor
              title="Từ vựng"
              items={form.vocabTerms}
              onChange={(v) => set('vocabTerms', v)}
              addLabel="Thêm từ vựng"
              itemLabel={(_, i) => `Từ ${i + 1}`}
              fields={[
                { key: 'literary', label: '书面语 (văn viết)' },
                { key: 'colloquial', label: '口语 (khẩu ngữ)' },
                { key: 'meaningVi', label: 'Nghĩa tiếng Việt' },
                { key: 'example', label: 'Ví dụ (có thể để trống)' },
              ]}
            />
            {!form.selectedParts.includes('matching') && matchEditor()}
            {!form.selectedParts.includes('sentence_building') && sentenceTasksEditor()}
          </>
        );
      case 'partial_writing':
      case 'writing':
        return (
          <>
            {writingFieldsEditor(key)}
            {writingScenariosEditor(key)}
          </>
        );
      default:
        return (
          <SimpleListEditor
            title="Nội dung dạng văn bản (chưa chấm điểm tự động)"
            items={form.sections.filter((s) => sectionsMatch(s, key))}
            onChange={(v) => setGenericSectionsFor(key, v)}
            addLabel={`Thêm nội dung cho "${partLabel(key)}"`}
            fields={[
              { key: 'heading', label: 'Tiêu đề (có thể để trống)' },
              { key: 'bodyHtml', label: 'Nội dung', type: 'richtext' },
            ]}
          />
        );
    }
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
        exercises: withOrder(form.exercises),
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

            {form.selectedParts.length === 0 && (
              <p className="text-sm text-slate-400">Chưa chọn đề mục nào — hãy tick các đề mục ở phần Thông tin cơ bản.</p>
            )}

            {form.selectedParts.map((key, idx) => (
              <section key={key} className="border border-night-600 rounded-xl p-4 space-y-4 bg-night-800/40">
                <h3 className="font-bold text-slate-100">
                  <span className="text-coral-400">Bước {idx + 1}</span> · {partLabel(key)}
                  {form.premiumParts.includes(key) && (
                    <span className="ml-2 align-middle bg-gold text-night-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </h3>
                {renderPartEditor(key)}
              </section>
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

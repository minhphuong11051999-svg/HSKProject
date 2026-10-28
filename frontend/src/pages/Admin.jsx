import { useEffect, useState } from 'react';
import { listLessons, createLesson, updateLesson, deleteLesson } from '../api/lessons';

const EMPTY_FORM = {
  id: null,
  slug: '',
  titleZh: '',
  titleVi: '',
  description: '',
  themeKey: 'indigo',
  type: 'PRACTICE',
  examMonth: '',
  examYear: '',
  orderIndex: 0,
  isPremium: false,
  contentJson: '{}',
};

export default function Admin() {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function refresh() {
    listLessons().then(setLessons);
  }

  useEffect(refresh, []);

  function edit(lesson) {
    setForm({
      ...EMPTY_FORM,
      ...lesson,
      examMonth: lesson.examMonth ?? '',
      examYear: lesson.examYear ?? '',
      contentJson: '{}',
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let extra = {};
      if (form.contentJson.trim()) {
        extra = JSON.parse(form.contentJson);
      }
      const payload = {
        slug: form.slug,
        titleZh: form.titleZh,
        titleVi: form.titleVi,
        description: form.description,
        themeKey: form.themeKey,
        type: form.type,
        examMonth: form.type === 'EXAM' ? Number(form.examMonth) : null,
        examYear: form.type === 'EXAM' ? Number(form.examYear) : null,
        orderIndex: Number(form.orderIndex) || 0,
        isPremium: !!form.isPremium,
        ...extra,
      };

      if (form.id) {
        await updateLesson(form.id, payload);
      } else {
        await createLesson(payload);
      }
      setForm(EMPTY_FORM);
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
    refresh();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">
      <section>
        <h1 className="text-xl font-bold mb-4">Danh sách bài học</h1>
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="bg-white border border-slate-300 rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="zh">{lesson.titleZh}</p>
                <p className="text-xs text-slate-500">{lesson.slug} · {lesson.type}</p>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => edit(lesson)} className="text-indigo-600 underline">Sửa</button>
                <button onClick={() => handleDelete(lesson.id)} className="text-seal underline">Xoá</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">{form.id ? 'Sửa bài học' : 'Thêm bài học mới'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Slug (vd: luyen-viet-thongbao)" value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input required placeholder="Tiêu đề chữ Hán" value={form.titleZh}
            onChange={(e) => setForm({ ...form, titleZh: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input required placeholder="Tiêu đề tiếng Việt" value={form.titleVi}
            onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <textarea placeholder="Mô tả ngắn" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />

          <div className="flex gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-slate-300 rounded-lg px-3 py-2">
              <option value="PRACTICE">Đề mẫu</option>
              <option value="EXAM">Đề thi thật</option>
            </select>
            {form.type === 'EXAM' && (
              <>
                <input placeholder="Tháng" value={form.examMonth}
                  onChange={(e) => setForm({ ...form, examMonth: e.target.value })}
                  className="w-20 border border-slate-300 rounded-lg px-3 py-2" />
                <input placeholder="Năm" value={form.examYear}
                  onChange={(e) => setForm({ ...form, examYear: e.target.value })}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-2" />
              </>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPremium}
              onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} />
            Nội dung trả phí (premium) — hiện chưa áp dụng, để sẵn cho sau
          </label>

          <div>
            <label className="text-sm text-slate-500 block mb-1">
              Nội dung chi tiết (JSON nâng cao: sections, quizQuestions, clozeExercises, matchItems, vocabTerms, writingTasks...)
            </label>
            <textarea rows={6} value={form.contentJson}
              onChange={(e) => setForm({ ...form, contentJson: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs" />
          </div>

          {error && <p className="text-seal text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-indigo-900 text-white rounded-lg px-4 py-2 font-semibold">
              {form.id ? 'Lưu thay đổi' : 'Tạo bài học'}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="px-4 py-2 border border-slate-300 rounded-lg">
                Huỷ
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

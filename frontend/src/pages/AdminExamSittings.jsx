import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getExamYearsForAdmin,
  createExamYear,
  deleteExamYear,
  getExamSittingForAdmin,
  createExamSitting,
  updateExamSitting,
  deleteExamSitting,
} from '../api/examSittings';
import { TextField, NumberField, CheckboxField, RichTextAreaField } from '../components/admin/fields';

const EMPTY_SITTING = {
  id: null,
  examYearId: '',
  slug: '',
  label: '',
  examDate: '',
  titleZh: '',
  titleVi: '',
  prompt: '',
  requirements: '',
  outline: '',
  answer: '',
  orderIndex: 0,
  isPremium: false,
};

export default function AdminExamSittings() {
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [newYear, setNewYear] = useState('');
  const [form, setForm] = useState(EMPTY_SITTING);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  function refresh() {
    getExamYearsForAdmin().then((data) => {
      setYears(data);
      if (!selectedYearId && data.length > 0) setSelectedYearId(data[0].id);
    });
  }

  useEffect(refresh, []);

  const selectedYear = years.find((y) => y.id === selectedYearId) || null;

  async function handleAddYear(e) {
    e.preventDefault();
    if (!newYear) return;
    setError('');
    try {
      const year = await createExamYear({ year: Number(newYear) });
      setNewYear('');
      refresh();
      setSelectedYearId(year.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thêm được năm');
    }
  }

  async function handleDeleteYear(id) {
    if (!confirm('Xoá năm này và toàn bộ đề thi bên trong?')) return;
    await deleteExamYear(id);
    if (selectedYearId === id) setSelectedYearId(null);
    refresh();
  }

  function newSittingForm() {
    setForm({ ...EMPTY_SITTING, examYearId: selectedYearId || '' });
  }

  async function edit(sitting) {
    setError('');
    setLoadingEdit(true);
    try {
      const full = await getExamSittingForAdmin(sitting.id);
      setForm({
        ...EMPTY_SITTING,
        ...full,
        examDate: full.examDate ? full.examDate.slice(0, 10) : '',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được nội dung đề thi');
    } finally {
      setLoadingEdit(false);
    }
  }

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        examYearId: form.examYearId || selectedYearId,
        slug: form.slug,
        label: form.label,
        examDate: form.examDate || null,
        titleZh: form.titleZh,
        titleVi: form.titleVi,
        prompt: form.prompt,
        requirements: form.requirements,
        outline: form.outline,
        answer: form.answer,
        orderIndex: form.orderIndex || 0,
        isPremium: !!form.isPremium,
      };

      if (form.id) {
        await updateExamSitting(form.id, payload);
      } else {
        await createExamSitting(payload);
      }
      newSittingForm();
      setSavedMessage('Đã lưu thành công.');
      setTimeout(() => setSavedMessage(''), 4000);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSitting(id) {
    if (!confirm('Xoá đề thi này?')) return;
    await deleteExamSitting(id);
    if (form.id === id) newSittingForm();
    refresh();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Đề thi thật</h1>
            <Link to="/admin/sample-papers" className="text-sm text-coral-400 underline">
              Quản trị đề mẫu
            </Link>
          </div>

          <form onSubmit={handleAddYear} className="flex gap-2 mb-4">
            <input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="Thêm năm, vd 2026"
              className="flex-1 bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              className="bg-coral-500 hover:bg-coral-600 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              + Năm
            </button>
          </form>

          <ul className="space-y-2 mb-6">
            {years.map((year) => (
              <li key={year.id}>
                <div
                  className={`flex justify-between items-center rounded-lg p-3 border ${
                    selectedYearId === year.id
                      ? 'bg-coral-500/15 border-coral-400'
                      : 'bg-night-800 border-night-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedYearId(year.id)}
                    className="text-left flex-1"
                  >
                    <p className="font-semibold">Năm {year.year}</p>
                    <p className="text-xs text-slate-400">{year.sittings.length} đề</p>
                  </button>
                  <button onClick={() => handleDeleteYear(year.id)} className="text-red-400 underline text-sm ml-2">
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {selectedYear && (
            <>
              <h2 className="font-semibold text-sm mb-2 text-slate-300">Các đề trong năm {selectedYear.year}</h2>
              <ul className="space-y-2">
                {selectedYear.sittings.map((sitting) => (
                  <li
                    key={sitting.id}
                    className="bg-night-800 border border-night-700 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p>{sitting.label}</p>
                      <p className="text-xs text-slate-400">{sitting.slug}</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button onClick={() => edit(sitting)} className="text-coral-400 underline">
                        Sửa
                      </button>
                      <button onClick={() => handleDeleteSitting(sitting.id)} className="text-red-400 underline">
                        Xoá
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{form.id ? 'Sửa đề thi' : 'Thêm đề thi mới'}</h2>
            {form.id && (
              <button
                type="button"
                onClick={newSittingForm}
                className="text-sm px-3 py-1.5 border border-night-600 rounded-lg"
              >
                + Tạo đề mới
              </button>
            )}
          </div>

          {loadingEdit && <p className="text-slate-400 text-sm mb-3">Đang tải nội dung...</p>}

          {!selectedYearId ? (
            <p className="text-slate-500 text-sm">Hãy thêm hoặc chọn một năm ở bên trái trước.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border border-night-600 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm mb-1">Thông tin cơ bản</h3>
                <p className="text-xs text-slate-500 mb-2">Thuộc năm: {selectedYear?.year}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <TextField label="Slug (vd: de-thi-2026-09-20)" value={form.slug} onChange={(v) => set('slug', v)} />
                  <TextField label="Nhãn ngày (vd: 20/09)" value={form.label} onChange={(v) => set('label', v)} />
                  <label className="block text-xs text-slate-400 mb-2">
                    Ngày ra đề
                    <input
                      type="date"
                      value={form.examDate || ''}
                      onChange={(e) => set('examDate', e.target.value)}
                      className="mt-1 w-full bg-night-900 border border-night-600 rounded px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>
                  <NumberField label="Thứ tự hiển thị" value={form.orderIndex} onChange={(v) => set('orderIndex', v)} />
                  <TextField label="Tiêu đề chữ Hán" value={form.titleZh} onChange={(v) => set('titleZh', v)} />
                  <TextField label="Tiêu đề tiếng Việt" value={form.titleVi} onChange={(v) => set('titleVi', v)} />
                </div>
                <CheckboxField
                  label="Nội dung trả phí (premium)"
                  checked={form.isPremium}
                  onChange={(v) => set('isPremium', v)}
                />
              </div>

              <RichTextAreaField label="Đề bài" value={form.prompt} onChange={(v) => set('prompt', v)} rows={8} />
              <RichTextAreaField
                label="Kiểm tra yêu cầu đề (để trống nếu không cần)"
                value={form.requirements}
                onChange={(v) => set('requirements', v)}
                rows={6}
              />
              <RichTextAreaField
                label="Dàn ý gợi ý (để trống nếu không cần)"
                value={form.outline}
                onChange={(v) => set('outline', v)}
                rows={6}
              />
              <RichTextAreaField label="Đáp án mẫu" value={form.answer} onChange={(v) => set('answer', v)} rows={10} />

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {savedMessage && <p className="text-green-400 text-sm">{savedMessage}</p>}
              <div className="flex gap-2 sticky bottom-0 bg-night-950 py-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-coral-500 hover:bg-coral-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  {saving ? 'Đang lưu...' : form.id ? 'Lưu thay đổi' : 'Tạo đề thi'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

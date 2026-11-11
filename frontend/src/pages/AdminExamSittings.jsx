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
import PageHeader from '../components/PageHeader';
import PaperSettingsPanel from '../components/admin/PaperSettingsPanel';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  INPUT,
  LABEL,
  LABEL_TEXT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_LINK,
  BTN_LINK_DANGER,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../components/admin/ui';

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
  gradingCriteria: '',
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
        gradingCriteria: form.gradingCriteria,
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Đề thi thật"
        actions={
          <Link to="/admin/sample-papers" className={BTN_SECONDARY}>
            Quản trị đề mẫu
          </Link>
        }
      />

      <PaperSettingsPanel />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start">
        <section className={PANEL}>
          <form onSubmit={handleAddYear} className="flex gap-2 mb-4">
            <input
              type="number"
              aria-label="Thêm năm, vd 2026"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="Thêm năm, vd 2026"
              className={`${INPUT} flex-1 min-w-0`}
            />
            <button
              type="submit"
              className={`${BTN_PRIMARY} flex-shrink-0`}
            >
              + Năm
            </button>
          </form>

          <ul className="space-y-2 mb-6">
            {years.map((year) => (
              <li key={year.id}>
                <div
                  className={`flex justify-between items-center gap-2 rounded-xl py-1 pl-1 pr-1 border transition-colors ${
                    selectedYearId === year.id
                      ? 'bg-coral-400/10 border-coral-400'
                      : 'bg-night-900 border-night-700 hover:border-coral-400/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedYearId(year.id)}
                    aria-pressed={selectedYearId === year.id}
                    className="text-left flex-1 min-h-[44px] rounded-lg px-3 py-1.5"
                  >
                    <p className="font-bold text-slate-100">Năm {year.year}</p>
                    <p className="text-xs text-slate-400">{year.sittings.length} đề</p>
                  </button>
                  <button onClick={() => handleDeleteYear(year.id)} className={BTN_LINK_DANGER}>
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {selectedYear && (
            <>
              <h2 className={`${PANEL_TITLE} mb-3 pt-4 border-t border-night-700`}>Các đề trong năm {selectedYear.year}</h2>
              <ul className="space-y-2">
                {selectedYear.sittings.map((sitting) => (
                  <li
                    key={sitting.id}
                    className="bg-night-900 border border-night-700 rounded-xl py-2 pl-4 pr-1 flex justify-between items-center gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-100 truncate">{sitting.label}</p>
                      <p className="text-xs text-slate-400 truncate">{sitting.slug}</p>
                    </div>
                    <div className="flex flex-shrink-0">
                      <button onClick={() => edit(sitting)} className={BTN_LINK}>
                        Sửa
                      </button>
                      <button onClick={() => handleDeleteSitting(sitting.id)} className={BTN_LINK_DANGER}>
                        Xoá
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">{form.id ? 'Sửa đề thi' : 'Thêm đề thi mới'}</h2>
            {form.id && (
              <button
                type="button"
                onClick={newSittingForm}
                className={BTN_SECONDARY}
              >
                + Tạo đề mới
              </button>
            )}
          </div>

          {loadingEdit && <p className={`${HINT} mb-3`} role="status">Đang tải nội dung...</p>}

          {!selectedYearId ? (
            <p className={`${PANEL} ${HINT}`}>Hãy thêm hoặc chọn một năm trong danh sách Năm trước.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`${PANEL} space-y-2`}>
                <h3 className={PANEL_TITLE}>Thông tin cơ bản</h3>
                <p className={`${HINT} mb-3`}>Thuộc năm: {selectedYear?.year}</p>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <TextField label="Slug (vd: de-thi-2026-09-20)" value={form.slug} onChange={(v) => set('slug', v)} />
                  <TextField label="Nhãn ngày (vd: 20/09)" value={form.label} onChange={(v) => set('label', v)} />
                  <label className={LABEL}>
                    <span className={LABEL_TEXT}>Ngày ra đề</span>
                    <input
                      type="date"
                      value={form.examDate || ''}
                      onChange={(e) => set('examDate', e.target.value)}
                      className={INPUT}
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

              <div className={PANEL}>
              <RichTextAreaField label="Đề bài" value={form.prompt} onChange={(v) => set('prompt', v)} rows={8} />
              <RichTextAreaField
                label="Từ vựng và luận điểm (để trống nếu không cần)"
                value={form.outline}
                onChange={(v) => set('outline', v)}
                rows={6}
              />
              <RichTextAreaField
                label="Tiêu chuẩn chấm (AI dùng để chấm bài, học viên không nhìn thấy)"
                value={form.gradingCriteria}
                onChange={(v) => set('gradingCriteria', v)}
                rows={6}
              />
              <RichTextAreaField label="Đáp án mẫu" value={form.answer} onChange={(v) => set('answer', v)} rows={10} />
              </div>

              {error && <p className={ERROR_TEXT} role="alert">{error}</p>}
              {savedMessage && <p className={SUCCESS_TEXT} role="status">{savedMessage}</p>}
              <div className="surface sticky bottom-3 z-10 flex flex-wrap items-center gap-3 px-4 py-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={BTN_PRIMARY}
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

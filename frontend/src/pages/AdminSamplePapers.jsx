import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listSamplePapers,
  getSamplePaperForAdmin,
  createSamplePaper,
  updateSamplePaper,
  deleteSamplePaper,
} from '../api/samplePapers';
import { TextField, NumberField, CheckboxField, RichTextAreaField } from '../components/admin/fields';
import PageHeader from '../components/PageHeader';
import PaperSettingsPanel from '../components/admin/PaperSettingsPanel';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_LINK,
  BTN_LINK_DANGER,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../components/admin/ui';

const EMPTY_FORM = {
  id: null,
  slug: '',
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

export default function AdminSamplePapers() {
  const [papers, setPapers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  function refresh() {
    listSamplePapers().then(setPapers);
  }

  useEffect(refresh, []);

  async function edit(paper) {
    setError('');
    setLoadingEdit(true);
    try {
      const full = await getSamplePaperForAdmin(paper.id);
      setForm({ ...EMPTY_FORM, ...full });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được nội dung đề mẫu');
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
        slug: form.slug,
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
        const updated = await updateSamplePaper(form.id, payload);
        setForm({ ...EMPTY_FORM, ...updated });
      } else {
        await createSamplePaper(payload);
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
    if (!confirm('Xoá đề mẫu này?')) return;
    await deleteSamplePaper(id);
    if (form.id === id) setForm(EMPTY_FORM);
    refresh();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Quản trị đề mẫu"
        actions={
          <Link to="/admin" className={BTN_SECONDARY}>
            Quản trị bài học
          </Link>
        }
      />

      <PaperSettingsPanel />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start">
        <section className={PANEL}>
          <h2 className={`${PANEL_TITLE} mb-4`}>Danh sách đề mẫu</h2>
          <ul className="space-y-2">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="bg-night-900 border border-night-700 rounded-xl py-2 pl-4 pr-1 flex justify-between items-center gap-2"
              >
                <div className="min-w-0">
                  <p className="zh text-slate-100 truncate">{paper.titleZh}</p>
                  <p className="text-xs text-slate-400 truncate">{paper.slug}</p>
                </div>
                <div className="flex flex-shrink-0">
                  <button onClick={() => edit(paper)} className={BTN_LINK}>
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(paper.id)} className={BTN_LINK_DANGER}>
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">{form.id ? 'Sửa đề mẫu' : 'Thêm đề mẫu mới'}</h2>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                className={BTN_SECONDARY}
              >
                + Tạo đề mẫu mới
              </button>
            )}
          </div>

          {loadingEdit && <p className={`${HINT} mb-3`} role="status">Đang tải nội dung...</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`${PANEL} space-y-2`}>
              <h3 className={`${PANEL_TITLE} mb-3`}>Thông tin cơ bản</h3>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <TextField label="Slug (vd: de-mau-tuijianxin-1)" value={form.slug} onChange={(v) => set('slug', v)} />
                <TextField label="Tiêu đề chữ Hán" value={form.titleZh} onChange={(v) => set('titleZh', v)} />
                <TextField label="Tiêu đề tiếng Việt" value={form.titleVi} onChange={(v) => set('titleVi', v)} />
                <NumberField label="Thứ tự hiển thị" value={form.orderIndex} onChange={(v) => set('orderIndex', v)} />
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
            <RichTextAreaField label="Đáp án" value={form.answer} onChange={(v) => set('answer', v)} rows={10} />
            </div>

            {error && <p className={ERROR_TEXT} role="alert">{error}</p>}
            {savedMessage && <p className={SUCCESS_TEXT} role="status">{savedMessage}</p>}
            <div className="surface sticky bottom-3 z-10 flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                type="submit"
                disabled={saving}
                className={BTN_PRIMARY}
              >
                {saving ? 'Đang lưu...' : form.id ? 'Lưu thay đổi' : 'Tạo đề mẫu'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

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

const EMPTY_FORM = {
  id: null,
  slug: '',
  titleZh: '',
  titleVi: '',
  prompt: '',
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
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Danh sách đề mẫu</h1>
            <Link to="/admin" className="text-sm text-coral-400 underline">
              Quản trị bài học
            </Link>
          </div>
          <ul className="space-y-2">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="bg-night-800 border border-night-700 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="zh">{paper.titleZh}</p>
                  <p className="text-xs text-slate-400">{paper.slug}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => edit(paper)} className="text-coral-400 underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(paper.id)} className="text-red-400 underline">
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{form.id ? 'Sửa đề mẫu' : 'Thêm đề mẫu mới'}</h2>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                className="text-sm px-3 py-1.5 border border-night-600 rounded-lg"
              >
                + Tạo đề mẫu mới
              </button>
            )}
          </div>

          {loadingEdit && <p className="text-slate-400 text-sm mb-3">Đang tải nội dung...</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-night-600 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-1">Thông tin cơ bản</h3>
              <div className="grid sm:grid-cols-2 gap-2">
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

            <RichTextAreaField label="Đề bài" value={form.prompt} onChange={(v) => set('prompt', v)} rows={8} />
            <RichTextAreaField label="Đáp án" value={form.answer} onChange={(v) => set('answer', v)} rows={10} />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {savedMessage && <p className="text-green-400 text-sm">{savedMessage}</p>}
            <div className="flex gap-2 sticky bottom-0 bg-night-950 py-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-coral-500 hover:bg-coral-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
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

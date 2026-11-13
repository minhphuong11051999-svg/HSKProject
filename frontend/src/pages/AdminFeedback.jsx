import { useEffect, useMemo, useState } from 'react';
import { Trash, EnvelopeSimpleOpen, EnvelopeSimple } from '@phosphor-icons/react';
import PageHeader from '../components/PageHeader';
import { listFeedback, markFeedback, deleteFeedback } from '../api/feedback';
import { PANEL, HINT, BTN_TOOL, BTN_TOOL_DANGER, ERROR_TEXT } from '../components/admin/ui';

const FILTERS = [
  ['unread', 'Chưa đọc'],
  ['all', 'Tất cả'],
];

function formatTime(iso) {
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

// Messages sent from the "Góp ý" button, newest first.
export default function AdminFeedback() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('unread');
  const [error, setError] = useState('');

  useEffect(() => {
    listFeedback()
      .then(setItems)
      .catch((err) => {
        setItems([]);
        setError(err.response?.data?.message || 'Không tải được danh sách góp ý');
      });
  }, []);

  const unread = (items || []).filter((f) => !f.isRead).length;
  const shown = useMemo(() => (items || []).filter((f) => filter === 'all' || !f.isRead), [items, filter]);

  async function toggleRead(f) {
    try {
      const updated = await markFeedback(f.id, !f.isRead);
      setItems((prev) => prev.map((x) => (x.id === f.id ? updated : x)));
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được');
    }
  }

  async function remove(f) {
    if (!confirm('Xoá góp ý này?')) return;
    try {
      await deleteFeedback(f.id);
      setItems((prev) => prev.filter((x) => x.id !== f.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Không xoá được');
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader title="Góp ý">Ý kiến người học gửi từ nút "Góp ý" ở góc dưới màn hình.</PageHeader>

      <div className="flex flex-wrap items-center gap-2 mb-5" role="group" aria-label="Lọc góp ý">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`min-h-[44px] px-4 rounded-full border text-sm font-semibold transition-colors ${
              filter === key
                ? 'bg-coral-400/10 border-coral-400/50 text-coral-400'
                : 'bg-night-800 border-night-700 text-slate-400 hover:text-slate-100'
            }`}
          >
            {label}
            {key === 'unread' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>

      {error && <p className={`${ERROR_TEXT} mb-4`} role="alert">{error}</p>}

      {items === null ? (
        <p className={HINT}>Đang tải…</p>
      ) : shown.length === 0 ? (
        <div className={`${PANEL} text-center`}>
          <p className="text-slate-400">{filter === 'unread' ? 'Không có góp ý mới.' : 'Chưa có góp ý nào.'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((f) => (
            <li key={f.id} className={`${PANEL} ${f.isRead ? 'opacity-75' : '!border-coral-400/50'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-100">
                    {!f.isRead && (
                      <>
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-coral-400 align-middle" aria-hidden="true" />
                        <span className="sr-only">Chưa đọc: </span>
                      </>
                    )}
                    {f.name || 'Khách'}
                    {f.email && <span className="font-normal text-slate-400"> · {f.email}</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatTime(f.createdAt)}
                    {f.page && <> · trang {f.page}</>}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleRead(f)}
                    className={BTN_TOOL}
                    aria-label={f.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                    title={f.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  >
                    {f.isRead ? <EnvelopeSimple size={18} aria-hidden="true" /> : <EnvelopeSimpleOpen size={18} aria-hidden="true" />}
                  </button>
                  <button type="button" onClick={() => remove(f)} className={BTN_TOOL_DANGER} aria-label="Xoá góp ý" title="Xoá">
                    <Trash size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-slate-200">{f.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { listMySubmissions } from '../api/lessons';

const PAGE_SIZE = 20;

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    listMySubmissions().then(setSubmissions).finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return submissions.slice(start, start + PAGE_SIZE);
  }, [submissions, page]);

  function goToPage(p) {
    setPage(Math.min(Math.max(p, 1), totalPages));
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-bold mb-6">Lịch sử làm bài</h1>
      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : submissions.length === 0 ? (
        <p className="text-slate-500">Bạn chưa làm bài nào.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {pageItems.map((s) => (
              <li key={s.id} className="bg-night-800 border border-night-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="zh text-slate-100">{s.lesson.titleZh}</p>
                  <p className="text-sm text-slate-500">
                    {s.exerciseType} · {new Date(s.submittedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {s.maxScore != null && (
                  <span className="font-semibold text-coral-400">
                    {s.score}/{s.maxScore}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded border border-night-600 bg-night-800 text-slate-200 disabled:opacity-40 hover:bg-night-700"
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-400">
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded border border-night-600 bg-night-800 text-slate-200 disabled:opacity-40 hover:bg-night-700"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

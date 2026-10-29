import { useEffect, useState } from 'react';
import { listMySubmissions } from '../api/lessons';

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMySubmissions().then(setSubmissions).finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-bold mb-6">Lịch sử làm bài</h1>
      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : submissions.length === 0 ? (
        <p className="text-slate-500">Bạn chưa làm bài nào.</p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
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
      )}
    </main>
  );
}

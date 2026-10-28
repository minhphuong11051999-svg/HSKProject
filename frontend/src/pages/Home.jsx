import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLessons } from '../api/lessons';

export default function Home() {
  const [tab, setTab] = useState('practice');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listLessons(tab === 'practice' ? 'practice' : 'exam')
      .then(setLessons)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <p className="zh text-2xl md:text-3xl opacity-90">写作工坊</p>
        <h1 className="text-2xl md:text-4xl font-bold mt-2">Luyện viết văn ứng dụng HSK6</h1>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setTab('practice')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'practice' ? 'bg-indigo-900 text-white' : 'bg-white border border-slate-300'}`}
        >
          Đề mẫu (1-7)
        </button>
        <button
          onClick={() => setTab('exam')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'exam' ? 'bg-indigo-900 text-white' : 'bg-white border border-slate-300'}`}
        >
          Đề thi thật
        </button>
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Đang tải...</p>
      ) : lessons.length === 0 ? (
        <p className="text-center text-slate-500">Chưa có bài học nào trong mục này.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {lessons.map((lesson, idx) => (
            <Link
              key={lesson.slug}
              to={lesson.locked ? '#' : `/lessons/${lesson.slug}`}
              className={`bg-white border border-slate-300 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:-translate-y-0.5 transition ${lesson.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <div>
                <p className="zh text-lg">{lesson.titleZh}</p>
                <p className="font-semibold text-sm mt-1">{lesson.titleVi}</p>
                {lesson.type === 'EXAM' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Đề thi {lesson.examMonth}/{lesson.examYear}
                  </p>
                )}
                {lesson.locked && <p className="text-xs text-seal mt-1">🔒 Nội dung nâng cao</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

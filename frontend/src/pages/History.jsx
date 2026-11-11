import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { listMySubmissions } from '../api/lessons';
import PageHeader from '../components/PageHeader';

const PAGE_SIZE = 20;

const PAGER_BTN =
  'min-h-[44px] min-w-[44px] px-4 text-sm font-semibold rounded-xl border border-night-700 bg-night-800 text-slate-200 hover:border-coral-400/60 hover:text-coral-400 transition-colors motion-reduce:transition-none disabled:opacity-40 disabled:pointer-events-none';

const EXERCISE_LABELS = {
  quiz: 'Trắc nghiệm',
  cloze: 'Đục lỗ',
  match: 'Nối từ',
  match_set: 'Nối từ',
  flashcard: 'Flashcard',
  error_fix: 'Tìm lỗi sai',
  analysis: 'Phân tích đề',
  writing: 'Bài viết',
  partial_writing: 'Viết bán phần',
};
const exerciseLabel = (type) => EXERCISE_LABELS[type] || 'Bài tập';

function describeSubmissionTarget(s) {
  if (s.lesson) return { label: `${s.lesson.titleVi || 'Bài học'} · ${exerciseLabel(s.exerciseType)}`, titleZh: s.lesson.titleZh };
  if (s.samplePaper) return { label: `Đề mẫu · ${s.samplePaper.titleVi || s.samplePaper.titleZh}`, titleZh: s.samplePaper.titleZh };
  if (s.examSitting) return { label: `Đề thi thật · ${s.examSitting.label}`, titleZh: s.examSitting.titleZh };
  return { label: exerciseLabel(s.exerciseType), titleZh: '—' };
}

// Older data stored one row per matching pair (all at the same second); fold
// those into a single "Nối từ x/y" row so History reads like what was done.
function collapseLegacyMatches(list) {
  const out = [];
  for (const s of list) {
    const prev = out[out.length - 1];
    const sameBurst =
      prev &&
      prev.exerciseType === 'match' &&
      s.exerciseType === 'match' &&
      prev.lessonId === s.lessonId &&
      Math.abs(new Date(prev.submittedAt) - new Date(s.submittedAt)) < 5000;
    if (sameBurst) {
      out[out.length - 1] = { ...prev, score: (prev.score ?? 0) + (s.score ?? 0), maxScore: (prev.maxScore ?? 0) + (s.maxScore ?? 0) };
    } else {
      out.push(s);
    }
  }
  return out;
}

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    listMySubmissions()
      .then((list) => setSubmissions(collapseLegacyMatches(list)))
      .finally(() => setLoading(false));
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Lịch sử làm bài" />
      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : submissions.length === 0 ? (
        <p className="text-slate-500">Bạn chưa làm bài nào.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {pageItems.map((s, i) => {
              const { label, titleZh } = describeSubmissionTarget(s);
              return (
                <motion.li
                  key={s.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30, delay: Math.min(i, 10) * 0.035 }}
                  className="surface p-3 pr-5 flex items-center gap-4"
                >
                  <span
                    lang="zh"
                    className="zh flex items-center justify-center flex-shrink-0 min-w-[3.5rem] max-w-[7rem] sm:max-w-[9rem] h-14 px-3 rounded-xl bg-night-700/60 text-coral-400 text-lg whitespace-nowrap overflow-hidden"
                  >
                    {titleZh}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-100 truncate">{label}</p>
                    <p className="text-sm text-slate-500">{new Date(s.submittedAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {s.maxScore != null ? (
                    <span className="flex-shrink-0 text-lg font-extrabold tracking-tight text-coral-400">
                      {s.score}/{s.maxScore}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-sm font-semibold text-slate-500">Đã nộp</span>
                  )}
                </motion.li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center justify-center gap-3 mt-8">
              <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} className={PAGER_BTN}>
                ← Trước
              </button>
              <span className="text-sm font-semibold text-slate-400" aria-live="polite">
                Trang {page}/{totalPages}
              </span>
              <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages} className={PAGER_BTN}>
                Sau →
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

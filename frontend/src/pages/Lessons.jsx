import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLessons } from '../api/lessons';
import PremiumModal from '../components/PremiumModal';

const TITLES = {
  practice: { heading: 'Đề mẫu', subtitle: 'Luyện tập với 7 bài mẫu, cập nhật thêm theo thời gian.' },
  exam: { heading: 'Đề thi thật', subtitle: 'Đề thi thật theo tháng, cập nhật dần.' },
};

export default function Lessons({ type }) {
  const [practice, setPractice] = useState([]);
  const [exam, setExam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      type === 'exam' ? Promise.resolve([]) : listLessons('practice'),
      type === 'practice' ? Promise.resolve([]) : listLessons('exam'),
    ])
      .then(([p, e]) => {
        setPractice(p);
        setExam(e);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const pageTitle = type ? TITLES[type]?.heading : 'Bài học';
  const pageSubtitle = type ? TITLES[type]?.subtitle : 'Toàn bộ bài luyện viết và đề thi thật.';

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-500">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">{pageTitle}</h1>
        <p className="text-slate-400 mt-1">{pageSubtitle}</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : (
        <>
          <LessonSection title="Đề mẫu" subtitle={`${practice.length} bài học`} lessons={practice} />
          <LessonSection title="Đề thi thật" subtitle={`${exam.length} bài học`} lessons={exam} />
          {practice.length === 0 && exam.length === 0 && (
            <p className="text-slate-500">Chưa có bài học nào trong mục này.</p>
          )}
        </>
      )}
    </main>
  );
}

function LessonSection({ title, subtitle, lessons }) {
  if (lessons.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1 h-5 bg-coral-500 rounded-full inline-block" />
          {title}
        </h2>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lessons.map((lesson, idx) => (
          <LessonCard key={lesson.slug} lesson={lesson} index={idx} />
        ))}
      </div>
    </section>
  );
}

function LessonCard({ lesson, index }) {
  const [showPremium, setShowPremium] = useState(false);

  const body = (
    <div className="bg-night-800 border border-night-700 rounded-xl overflow-hidden transition-all hover:border-coral-500/60 hover:-translate-y-0.5">
      <div className="relative bg-gradient-to-br from-night-700 to-night-800 h-28 flex items-center justify-center">
        <span className="zh text-4xl text-coral-500/90">{lesson.titleZh}</span>
        <span className="absolute top-2 left-2 bg-night-900/80 text-coral-400 text-xs font-bold px-2 py-0.5 rounded-full">
          #{index + 1}
        </span>
        {lesson.isPremium && (
          <span className="absolute top-2 right-2 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
            👑 PRO
          </span>
        )}
        {lesson.type === 'EXAM' && (
          <span className="absolute bottom-2 right-2 bg-night-900/80 text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {lesson.examMonth}/{lesson.examYear}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm text-slate-100 truncate">{lesson.titleVi}</p>
        {lesson.locked ? (
          <p className="text-xs text-gold mt-2">🔒 Mở khoá bằng PRO →</p>
        ) : (
          <p className="text-xs text-coral-400 mt-2">Bắt đầu luyện tập →</p>
        )}
      </div>
    </div>
  );

  if (lesson.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="text-left w-full">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return <Link to={`/lessons/${lesson.slug}`}>{body}</Link>;
}

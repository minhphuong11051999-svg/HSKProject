import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listLessons } from '../api/lessons';

export default function Home() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Hero />;
}

function Hero() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="zh text-2xl text-coral-500 mb-3">写作工坊</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Luyện viết văn ứng dụng <span className="text-coral-500">HSK6</span> toàn diện
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
            Đề mẫu 1-7 với nhiều dạng bài thực hành, cập nhật thêm đề thi thật theo tháng. Luyện từ
            hướng dẫn, nhận diện thể thức, điền khuyết, phân tích lỗi sai, đến viết hoàn chỉnh — lưu
            lại toàn bộ lịch sử luyện tập của bạn.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white rounded-full px-7 py-3.5 font-semibold transition-colors"
          >
            Bắt Đầu Học Miễn Phí <span>→</span>
          </Link>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full border border-coral-500/30" />
          <div className="absolute -bottom-10 -right-6 w-16 h-16 rounded-full border border-coral-500/20" />
          <div className="bg-night-800 border border-night-700 rounded-2xl p-10 text-center">
            <p className="zh text-6xl text-coral-500 mb-4">通知</p>
            <p className="text-slate-400 text-sm">Thông báo · Bố cáo · Thư mời · Đơn xin...</p>
            <div className="grid grid-cols-3 gap-3 mt-8 text-2xl">
              <span>📖</span>
              <span>✅</span>
              <span>📝</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [practice, setPractice] = useState([]);
  const [exam, setExam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listLessons('practice'), listLessons('exam')])
      .then(([p, e]) => {
        setPractice(p);
        setExam(e);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-500">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Xin chào, {user.name} 👋</h1>
        <p className="text-slate-400 mt-1">Chọn một bài luyện viết bên dưới để bắt đầu.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : (
        <>
          <LessonSection title="Đề mẫu" subtitle={`${practice.length} bài học`} lessons={practice} />
          <LessonSection title="Đề thi thật" subtitle={`${exam.length} bài học`} lessons={exam} />
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
  const body = (
    <div
      className={`bg-night-800 border border-night-700 rounded-xl overflow-hidden transition-all ${
        lesson.locked ? 'opacity-50' : 'hover:border-coral-500/60 hover:-translate-y-0.5'
      }`}
    >
      <div className="relative bg-gradient-to-br from-night-700 to-night-800 h-28 flex items-center justify-center">
        <span className="zh text-4xl text-coral-500/90">{lesson.titleZh}</span>
        <span className="absolute top-2 left-2 bg-night-900/80 text-coral-400 text-xs font-bold px-2 py-0.5 rounded-full">
          #{index + 1}
        </span>
        {lesson.isPremium && (
          <span className="absolute top-2 right-2 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
            PRO
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
          <p className="text-xs text-slate-500 mt-2">🔒 Cần nâng cấp để mở khoá</p>
        ) : (
          <p className="text-xs text-coral-400 mt-2">Bắt đầu luyện tập →</p>
        )}
      </div>
    </div>
  );

  return lesson.locked ? body : <Link to={`/lessons/${lesson.slug}`}>{body}</Link>;
}

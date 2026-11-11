import { Link } from 'react-router-dom';
import { House, BookOpen } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

// Catch-all for links that lead nowhere (old bookmarks, typos, half-saved records).
export default function NotFound() {
  const { user } = useAuth();
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <p className="zh text-6xl sm:text-7xl font-bold text-coral-400" lang="zh" aria-hidden="true">
        迷路
      </p>
      <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Không tìm thấy trang này</h1>
      <p className="mt-3 text-slate-400 leading-relaxed">
        Đường dẫn có thể đã bị đổi hoặc không còn tồn tại. Bạn quay về trang chủ hoặc chọn một bài học nhé.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-coral-500 hover:bg-coral-600 px-5 text-sm font-bold text-white transition-colors"
        >
          <House size={18} weight="fill" aria-hidden="true" /> Về trang chủ
        </Link>
        {user && (
          <Link
            to="/lessons"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-night-700 bg-night-800 px-5 text-sm font-semibold text-slate-200 hover:border-coral-400/60 hover:text-coral-400 transition-colors"
          >
            <BookOpen size={18} aria-hidden="true" /> Xem bài học
          </Link>
        )}
      </div>
    </main>
  );
}

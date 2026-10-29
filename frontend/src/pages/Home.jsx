import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';

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

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import Dashboard from './Dashboard';
import Reveal from '../components/motion/Reveal';
import { BookOpen, SealCheck, NotePencil } from '@phosphor-icons/react';

export default function Home() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Hero />;
}

function Hero() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Reveal index={0}>
            <p className="zh text-2xl text-coral-500 mb-3">写作工坊</p>
          </Reveal>
          <Reveal index={1}>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Luyện viết văn ứng dụng <span className="text-coral-500">HSK6</span> toàn diện
            </h1>
          </Reveal>
          <Reveal index={2}>
          <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
            Đề mẫu 1-7 với nhiều dạng bài thực hành, cập nhật thêm đề thi thật theo tháng. Luyện từ
            hướng dẫn, nhận diện thể thức, điền khuyết, phân tích lỗi sai, đến viết hoàn chỉnh — lưu
            lại toàn bộ lịch sử luyện tập của bạn.
          </p>
          </Reveal>
          <Reveal index={3}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white rounded-full px-7 py-3.5 font-semibold shadow-lg shadow-coral-500/20 hover:shadow-coral-500/40 active:scale-[0.97] transition-all"
            >
              Bắt Đầu Học Miễn Phí
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal index={2} className="relative hidden md:block">
          {/* Slow drifting rings around the showcase card. */}
          <motion.div
            className="absolute -top-8 -left-8 w-24 h-24 rounded-full border border-coral-500/30"
            animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-10 -right-6 w-16 h-16 rounded-full border border-coral-500/20"
            animate={{ y: [0, 8, 0], x: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative bg-night-800 border border-night-700 rounded-2xl p-10 text-center">
            <p className="zh text-6xl text-coral-500 mb-4">通知</p>
            <p className="text-slate-400 text-sm">Thông báo · Bố cáo · Thư mời · Đơn xin...</p>
            <div className="grid grid-cols-3 gap-3 mt-8 text-coral-400 justify-items-center" aria-hidden="true">
              <BookOpen size={30} weight="duotone" />
              <SealCheck size={30} weight="duotone" />
              <NotePencil size={30} weight="duotone" />
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSamplePapers } from '../api/samplePapers';
import PremiumModal from '../components/PremiumModal';

export default function SamplePapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSamplePapers()
      .then(setPapers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-500">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Đề mẫu</h1>
        <p className="text-slate-400 mt-1">Đề bài &amp; đáp án tham khảo, luyện viết nhanh.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : papers.length === 0 ? (
        <p className="text-slate-500">Chưa có đề mẫu nào.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {papers.map((paper, idx) => (
            <SamplePaperCard key={paper.slug} paper={paper} index={idx} />
          ))}
        </div>
      )}
    </main>
  );
}

function SamplePaperCard({ paper, index }) {
  const [showPremium, setShowPremium] = useState(false);

  const body = (
    <div className="bg-night-800 border border-night-700 rounded-xl overflow-hidden transition-all hover:border-coral-500/60 hover:-translate-y-0.5">
      <div className="relative bg-gradient-to-br from-night-700 to-night-800 h-28 flex items-center justify-center">
        <span className="zh text-4xl text-coral-500/90">{paper.titleZh}</span>
        <span className="absolute top-2 left-2 bg-night-900/80 text-coral-400 text-xs font-bold px-2 py-0.5 rounded-full">
          #{index + 1}
        </span>
        {paper.isPremium && (
          <span className="absolute top-2 right-2 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
            👑 PRO
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm text-slate-100 truncate">{paper.titleVi}</p>
        {paper.locked ? (
          <p className="text-xs text-gold mt-2">🔒 Mở khoá bằng PRO →</p>
        ) : (
          <p className="text-xs text-coral-400 mt-2">Xem đề &amp; đáp án →</p>
        )}
      </div>
    </div>
  );

  if (paper.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="text-left w-full">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return <Link to={`/practice/${paper.slug}`}>{body}</Link>;
}

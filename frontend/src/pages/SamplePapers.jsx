import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSamplePapers } from '../api/samplePapers';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/motion/Reveal';
import { Lock } from '@phosphor-icons/react';

const CARD = 'surface h-full w-full flex flex-col overflow-hidden text-left';
const BADGE = 'absolute top-3 text-xs font-bold px-2.5 py-0.5 rounded-full';

export default function SamplePapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSamplePapers()
      .then(setPapers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Đề mẫu">Đề bài &amp; đáp án tham khảo, luyện viết nhanh.</PageHeader>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : papers.length === 0 ? (
        <p className="text-slate-500">Chưa có đề mẫu nào.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {papers.map((paper, idx) => (
            <Reveal key={paper.slug} index={idx} className="h-full">
              <SamplePaperCard paper={paper} index={idx} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

function SamplePaperCard({ paper, index }) {
  const [showPremium, setShowPremium] = useState(false);

  const inner = (
    <>
      <div className="relative h-32 m-2 mb-0 rounded-2xl bg-night-700/60 flex items-center justify-center px-3">
        <span lang="zh" className="zh text-4xl leading-tight text-coral-400 text-center">{paper.titleZh}</span>
        <span className={`${BADGE} left-3 bg-night-800 text-coral-400 font-extrabold`}>#{index + 1}</span>
        {paper.isPremium && (
          <span className={`${BADGE} right-3 bg-gold/90 text-night-950`}>
            <ProLabel />
          </span>
        )}
      </div>
      <div className="px-5 pt-4 pb-5">
        <p className="font-bold text-slate-100 truncate">{paper.titleVi}</p>
        {paper.locked ? (
          <p className="text-sm font-semibold text-gold mt-2">
            <span className="inline-flex items-center gap-1">
              <Lock size={12} weight="bold" aria-hidden="true" />
              Mở khoá bằng PRO →
            </span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-coral-400 mt-2">Xem đề &amp; đáp án →</p>
        )}
      </div>
    </>
  );

  if (paper.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className={CARD}>
          {inner}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return (
    <Link to={`/practice/${paper.slug}`} className={CARD}>
      {inner}
    </Link>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSamplePaper } from '../api/samplePapers';
import PremiumModal from '../components/PremiumModal';
import PaperTabs from '../components/PaperTabs';
import BackLink from '../components/BackLink';

export default function SamplePaperViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSamplePaper(slug)
      .then(setPaper)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-center py-10 text-slate-400">Đang tải...</p>;
  if (!paper) return <p className="text-center py-10 text-slate-400">Không tìm thấy đề mẫu.</p>;

  if (paper.locked) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <p className="zh text-2xl text-coral-400">{paper.titleZh}</p>
        <h1 className="text-2xl sm:text-[1.75rem] leading-tight font-extrabold tracking-tight text-slate-100 [text-wrap:balance] mt-2">{paper.titleVi}</h1>
        <PremiumModal open onClose={() => navigate('/practice')} />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <BackLink to="/practice" className="mb-3">Danh sách đề mẫu</BackLink>
      <p className="zh text-xl text-coral-400 mb-1">{paper.titleZh}</p>
      <h1 className="text-2xl sm:text-[1.75rem] leading-tight font-extrabold tracking-tight text-slate-100 [text-wrap:balance] mb-7">{paper.titleVi}</h1>

      <PaperTabs
        prompt={paper.prompt}
        requirements={paper.requirements}
        outline={paper.outline}
        answer={paper.answer}
        targetKey={{ samplePaperId: paper.id }}
      />
    </main>
  );
}

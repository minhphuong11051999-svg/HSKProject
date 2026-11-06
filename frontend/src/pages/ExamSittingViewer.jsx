import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamSitting } from '../api/examSittings';
import PremiumModal from '../components/PremiumModal';
import PaperTabs from '../components/PaperTabs';

export default function ExamSittingViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sitting, setSitting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExamSitting(slug)
      .then(setSitting)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-center py-10 text-slate-400">Đang tải...</p>;
  if (!sitting) return <p className="text-center py-10 text-slate-400">Không tìm thấy đề thi.</p>;

  if (sitting.locked) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <p className="zh text-2xl">{sitting.titleZh}</p>
        <h1 className="text-xl font-bold mt-2">{sitting.titleVi}</h1>
        <PremiumModal open onClose={() => navigate('/lessons/exam')} />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <p className="text-sm text-slate-500 mb-1">
        Năm {sitting.examYear?.year} · {sitting.label}
      </p>
      <p className="zh text-xl mb-1">{sitting.titleZh}</p>
      <h1 className="text-xl font-bold mb-6">{sitting.titleVi}</h1>

      <PaperTabs
        prompt={sitting.prompt}
        requirements={sitting.requirements}
        outline={sitting.outline}
        answer={sitting.answer}
        targetKey={{ examSittingId: sitting.id }}
      />
    </main>
  );
}

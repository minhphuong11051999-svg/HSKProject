import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSamplePaper } from '../api/samplePapers';
import PremiumModal from '../components/PremiumModal';

export default function SamplePaperViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setLoading(true);
    setShowAnswer(false);
    getSamplePaper(slug)
      .then(setPaper)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-center py-10 text-slate-400">Đang tải...</p>;
  if (!paper) return <p className="text-center py-10 text-slate-400">Không tìm thấy đề mẫu.</p>;

  if (paper.locked) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="zh text-2xl">{paper.titleZh}</p>
        <h1 className="text-xl font-bold mt-2">{paper.titleVi}</h1>
        <PremiumModal open onClose={() => navigate('/practice')} />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <p className="zh text-xl mb-1">{paper.titleZh}</p>
      <h1 className="text-xl font-bold mb-6">{paper.titleVi}</h1>

      <section className="bg-night-800 border border-night-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-3 text-slate-200">📋 Đề bài</h2>
        <div className="zh text-sm leading-7" dangerouslySetInnerHTML={{ __html: paper.prompt }} />
      </section>

      <section className="bg-night-800 border border-night-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">✅ Đáp án</h2>
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="text-sm bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
          </button>
        </div>
        {showAnswer ? (
          <div className="zh text-sm leading-7" dangerouslySetInnerHTML={{ __html: paper.answer }} />
        ) : (
          <p className="text-sm text-slate-500">Tự làm bài trước rồi bấm "Xem đáp án" để đối chiếu.</p>
        )}
      </section>
    </main>
  );
}

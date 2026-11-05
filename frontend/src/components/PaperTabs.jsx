import { useEffect, useState } from 'react';
import { getMySubmissionFor, submitExercise } from '../api/lessons';

const TABS = [
  { key: 'prompt', label: 'Đề bài', icon: '📋' },
  { key: 'draft', label: 'Bài làm', icon: '✍️' },
  { key: 'answer', label: 'Đáp án mẫu', icon: '✅' },
  { key: 'ai', label: 'AI Chấm Bài', icon: '🤖' },
];

// Shared 4-tab content viewer for both sample papers (Đề mẫu) and real exam
// sittings (Đề thi thật) — the only difference between the two is which id
// field is set on `targetKey`, which selects the FK used when saving/loading
// the "Bài làm" submission.
export default function PaperTabs({ prompt, answer, targetKey }) {
  const [tab, setTab] = useState('prompt');
  const [showAnswer, setShowAnswer] = useState(false);
  const [draft, setDraft] = useState('');
  const [submission, setSubmission] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [saving, setSaving] = useState(false);

  const targetId = targetKey.samplePaperId || targetKey.examSittingId;

  useEffect(() => {
    setTab('prompt');
    setShowAnswer(false);
    setSubmission(null);
    setLoadingDraft(true);
    getMySubmissionFor(targetKey)
      .then((s) => {
        setSubmission(s);
        setDraft(s?.answerPayload?.text || '');
      })
      .finally(() => setLoadingDraft(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  async function handleSubmitDraft() {
    setSaving(true);
    try {
      const result = await submitExercise({
        ...targetKey,
        exerciseType: 'writing',
        exerciseId: targetId,
        answerPayload: { text: draft },
      });
      setSubmission(result);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Các phần của đề" className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            id={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              tab === t.key
                ? 'bg-coral-500 text-white'
                : 'bg-night-800 border border-night-700 text-slate-300 hover:bg-night-700 hover:text-white'
            }`}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'prompt' && (
        <section
          id="panel-prompt"
          role="tabpanel"
          aria-labelledby="tab-prompt"
          className="bg-night-800 border border-night-700 rounded-xl p-6"
        >
          <div className="zh text-sm leading-7" dangerouslySetInnerHTML={{ __html: prompt }} />
        </section>
      )}

      {tab === 'draft' && (
        <section
          id="panel-draft"
          role="tabpanel"
          aria-labelledby="tab-draft"
          className="bg-night-800 border border-night-700 rounded-xl p-6"
        >
          <h2 className="font-semibold mb-3 text-slate-200">Bài làm của bạn</h2>
          {loadingDraft ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={12}
                placeholder="Viết bài làm của bạn ở đây..."
                className="w-full bg-night-900 border border-night-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 zh leading-7"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  disabled={saving || !draft.trim()}
                  className="min-h-[44px] bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                >
                  {saving ? 'Đang lưu...' : 'Nộp bài làm'}
                </button>
                {submission && (
                  <span className="text-xs text-slate-500">
                    Đã nộp lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'answer' && (
        <section
          id="panel-answer"
          role="tabpanel"
          aria-labelledby="tab-answer"
          className="bg-night-800 border border-night-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-200">Đáp án mẫu</h2>
            <button
              type="button"
              onClick={() => setShowAnswer((v) => !v)}
              className="min-h-[44px] text-sm bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
            </button>
          </div>
          {showAnswer ? (
            <div className="zh text-sm leading-7" dangerouslySetInnerHTML={{ __html: answer }} />
          ) : (
            <p className="text-sm text-slate-500">Tự làm bài trước rồi bấm "Xem đáp án" để đối chiếu.</p>
          )}
        </section>
      )}

      {tab === 'ai' && (
        <section
          id="panel-ai"
          role="tabpanel"
          aria-labelledby="tab-ai"
          className="bg-night-800 border border-night-700 rounded-xl p-6 text-center"
        >
          <p className="text-4xl mb-3" aria-hidden="true">🤖</p>
          <h2 className="font-semibold text-slate-200 mb-2">Chấm bài bằng AI</h2>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            Tính năng AI chấm điểm và nhận xét bài làm đang được phát triển. Hãy quay lại sau nhé!
          </p>
          <button
            type="button"
            disabled
            className="min-h-[44px] bg-coral-500 text-white rounded-lg px-4 py-2 text-sm font-semibold opacity-50 cursor-not-allowed"
          >
            Chấm bài bằng AI (Sắp ra mắt)
          </button>
        </section>
      )}
    </div>
  );
}

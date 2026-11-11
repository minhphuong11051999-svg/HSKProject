import { useEffect, useRef, useState } from 'react';
import { getMySubmissionFor, submitExercise } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import LetterPaper, { HanziCount, countHanzi, htmlToText } from './LetterPaper';
import { Tabs } from '@animate-ui/react/primitives/radix-ui/tabs';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import PressButton from './motion/PressButton';
import Reveal from './motion/Reveal';
import ExamTimer from './ExamTimer';
import AiGradePanel from './AiGradePanel';
import { ClipboardText, MagnifyingGlass, TreeStructure, PencilLine, SealCheck, Robot, Warning } from '@phosphor-icons/react';

const ALL_TABS = [
  { key: 'prompt', label: 'Đề bài', icon: ClipboardText },
  { key: 'analysis', label: 'Phân tích đề', icon: MagnifyingGlass },
  { key: 'outline', label: 'Từ vựng và luận điểm', icon: TreeStructure },
  { key: 'draft', label: 'Bài làm', icon: PencilLine },
  { key: 'answer', label: 'Đáp án mẫu', icon: SealCheck },
  { key: 'ai', label: 'AI Chấm Bài', icon: Robot },
];

const PRIMARY_BTN =
  'min-h-[44px] bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-2 text-sm font-bold shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] transition-colors';
const TEXTAREA =
  'w-full bg-night-950 border border-night-700 rounded-xl px-4 py-3 text-sm text-slate-100 leading-7 transition-colors focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 focus:outline-none';

// Shared tabbed viewer for sample papers (Đề mẫu) and real exam sittings
// (Đề thi thật); `targetKey` picks the FK used to save the learner's work.
// - "Từ vựng và luận điểm" (outline) arrives only once the admin opens it site-wide.
// - "Bài làm" behaves like the exam room: plain text, no auto-formatting, and an
//   unsubmitted draft is wiped the moment the learner leaves the browser tab.
// - "AI Chấm Bài" is PRO-only and needs the paper's hidden grading criteria.
export default function PaperTabs({ prompt, outline, answer, targetKey, hasGradingCriteria }) {
  const { user } = useAuth();
  const isPro = user?.plan === 'PREMIUM' || user?.role === 'ADMIN';
  const TABS = ALL_TABS.filter((t) => {
    if (t.key === 'outline') return !!outline;
    if (t.key === 'ai') return isPro;
    return true;
  });
  const [tab, setTab] = useState('prompt');
  const [showAnswer, setShowAnswer] = useState(false);
  const [draft, setDraft] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wiped, setWiped] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const targetId = targetKey.samplePaperId || targetKey.examSittingId;
  const submittedText = submission?.answerPayload?.text || '';

  useEffect(() => {
    setTab('prompt');
    setShowAnswer(false);
    setSubmission(null);
    setWiped(false);
    setTimeUp(false);
    setLoadingDraft(true);
    getMySubmissionFor(targetKey)
      .then((s) => {
        setSubmission(s);
        setDraft(s?.answerPayload?.text || '');
        setAnalysis(s?.answerPayload?.analysis || '');
      })
      .finally(() => setLoadingDraft(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  // Leaving the browser tab (or switching app on a phone) wipes whatever has
  // been typed since the last submission. Switching between this page's own
  // tabs does not, so the learner can re-read the prompt.
  const pendingRef = useRef(false);
  pendingRef.current = draft !== submittedText && draft.trim() !== '';
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden' && pendingRef.current) {
        setDraft('');
        setWiped(true);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // The analysis and the draft travel together in one submission, so the
  // latest save always holds both. The draft is saved verbatim (no trimming),
  // leading spaces included, so the grader can judge the layout.
  async function save(setBusy) {
    setBusy(true);
    try {
      const result = await submitExercise({
        ...targetKey,
        exerciseType: 'writing',
        exerciseId: targetId,
        answerPayload: { text: draft, analysis },
      });
      setSubmission(result);
    } finally {
      setBusy(false);
    }
  }

  const PANEL = 'surface p-6 sm:p-8 focus-visible:outline-none';
  const H2 = 'text-lg font-extrabold tracking-tight text-slate-100';

  return (
    <>
      <ExamTimer onPhase={(key) => TABS.some((t) => t.key === key) && setTab(key)} onFinish={() => setTimeUp(true)} />

      {/* Animate UI Tabs: the selected pill slides between tabs, panels cross-fade;
          Radix supplies roles, ids and arrow-key navigation. */}
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List aria-label="Các phần của đề" className="relative flex flex-wrap gap-2 mb-7">
          {TABS.map((t) => (
            <Tabs.Trigger
              key={t.key}
              value={t.key}
              className={`relative z-[1] min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-colors flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-coral-400/10 border-coral-400/40 text-coral-400'
                  : 'bg-night-800 border-night-700 text-slate-400 hover:border-coral-400/40 hover:text-slate-100'
              }`}
            >
              <t.icon size={18} weight={tab === t.key ? 'fill' : 'regular'} aria-hidden="true" />
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="prompt" className={PANEL}>
          <div className="zh text-sm leading-7 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: prompt }} />
        </Tabs.Content>

        <Tabs.Content value="analysis" className={PANEL}>
          <h2 className={`${H2} mb-4`}>
            <label htmlFor="paper-analysis">Phân tích đề</label>
          </h2>
          {loadingDraft ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : (
            <>
              <textarea
                id="paper-analysis"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                rows={8}
                className={TEXTAREA}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <PressButton
                  onClick={() => save(setSavingAnalysis)}
                  disabled={savingAnalysis || !analysis.trim()}
                  className={PRIMARY_BTN}
                >
                  {savingAnalysis ? 'Đang lưu...' : 'Lưu phân tích'}
                </PressButton>
                {submission?.answerPayload?.analysis && (
                  <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <SealCheck size={14} weight="fill" className="text-green-400" aria-hidden="true" />
                    Đã lưu lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            </>
          )}
        </Tabs.Content>

        {outline && (
          <Tabs.Content value="outline" className={PANEL}>
            <h2 className={`${H2} mb-3`}>Từ vựng và luận điểm</h2>
            <div className="zh text-sm leading-7 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: outline }} />
          </Tabs.Content>
        )}

        <Tabs.Content value="draft" className={PANEL}>
          <h2 className={`${H2} mb-3`}>
            <label htmlFor="paper-draft">Bài làm của bạn</label>
          </h2>
          <p className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 mb-4 text-sm font-medium text-slate-200">
            <Warning size={18} weight="fill" className="text-gold shrink-0 mt-0.5" aria-hidden="true" />
            Rời khỏi tab trình duyệt sẽ xoá toàn bộ bài làm chưa nộp.
          </p>
          {wiped && (
            <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 mb-4 text-sm font-semibold text-red-400">
              Bài làm đã bị xoá vì bạn rời khỏi trang trong lúc làm bài.
            </p>
          )}
          {loadingDraft ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : (
            <>
              <textarea
                id="paper-draft"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (wiped) setWiped(false);
                }}
                readOnly={timeUp}
                rows={14}
                spellCheck={false}
                autoComplete="off"
                className={`${TEXTAREA} zh whitespace-pre-wrap ${timeUp ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              <div className="flex flex-wrap items-center justify-end gap-2 mt-1">
                <span
                  aria-live="polite"
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border tabular-nums inline-flex items-center gap-1 transition-colors ${
                    countHanzi(draft) ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-night-600 text-slate-400'
                  }`}
                >
                  <SlidingNumber number={countHanzi(draft)} /> chữ Hán
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <PressButton onClick={() => save(setSaving)} disabled={saving || !draft.trim()} className={PRIMARY_BTN}>
                  {saving ? 'Đang lưu...' : 'Nộp bài làm'}
                </PressButton>
                {submission && (
                  <Reveal key={submission.submittedAt} offset={6}>
                    <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                      <SealCheck size={14} weight="fill" className="text-green-400" aria-hidden="true" />
                      Đã nộp lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                    </span>
                  </Reveal>
                )}
              </div>
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="answer" className={PANEL}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className={`${H2} flex items-center gap-2`}>
              Đáp án mẫu
              {showAnswer && <HanziCount count={countHanzi(htmlToText(answer))} />}
            </h2>
            <PressButton
              onClick={() => setShowAnswer((v) => !v)}
              aria-expanded={showAnswer}
              className={PRIMARY_BTN}
            >
              {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
            </PressButton>
          </div>
          {showAnswer ? (
            <Reveal>
              <LetterPaper html={answer} autoFormat minHeight="" />
            </Reveal>
          ) : (
            <p className="text-sm text-slate-500">Tự làm bài trước rồi bấm "Xem đáp án" để đối chiếu.</p>
          )}
        </Tabs.Content>

        {isPro && (
          <Tabs.Content value="ai" className={PANEL}>
            <AiGradePanel
              targetKey={targetKey}
              text={submittedText || draft}
              hasGradingCriteria={!!hasGradingCriteria}
              onGoWrite={() => setTab('draft')}
            />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </>
  );
}

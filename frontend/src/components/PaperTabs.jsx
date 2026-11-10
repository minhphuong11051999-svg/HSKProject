import { useEffect, useRef, useState } from 'react';
import { getMySubmissionFor, submitExercise } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import LetterPaper, { HanziCount, countHanzi, htmlToText } from './LetterPaper';
import { Tabs } from '@animate-ui/react/primitives/radix-ui/tabs';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import PressButton from './motion/PressButton';
import Reveal from './motion/Reveal';
import { ClipboardText, MagnifyingGlass, TreeStructure, PencilLine, SealCheck, Robot } from '@phosphor-icons/react';

// Two full-width spaces — the standard first-line indent used when writing
// Chinese compositions by hand, so typed paragraphs match exam-paper format.
const PARAGRAPH_INDENT = '　　';

const ALL_TABS = [
  { key: 'prompt', label: 'Đề bài', icon: ClipboardText },
  { key: 'analysis', label: 'Phân tích đề', icon: MagnifyingGlass },
  { key: 'outline', label: 'Dàn ý gợi ý', icon: TreeStructure },
  { key: 'draft', label: 'Bài làm', icon: PencilLine },
  { key: 'answer', label: 'Đáp án mẫu', icon: SealCheck },
  { key: 'ai', label: 'AI Chấm Bài', icon: Robot },
];

// Shared tabbed content viewer for both sample papers (Đề mẫu) and real exam
// sittings (Đề thi thật) — the only difference between the two is which id
// field is set on `targetKey`, which selects the FK used when saving/loading
// the "Bài làm" submission. "Phân tích đề" is written by the learner and saved
// with the draft. The outline only reaches Free learners once the admin opens
// it (the backend leaves it out otherwise); AI grading is a PRO-only tab.
export default function PaperTabs({ prompt, outline, answer, targetKey }) {
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
  const draftRef = useRef(null);

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
        setAnalysis(s?.answerPayload?.analysis || '');
      })
      .finally(() => setLoadingDraft(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  function handleDraftKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const el = draftRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const insert = `\n${PARAGRAPH_INDENT}`;
    const next = draft.slice(0, start) + insert + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      if (!el) return;
      const cursor = start + insert.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function handleDraftPaste(e) {
    e.preventDefault();
    const el = draftRef.current;
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const indentedPasted = pasted.replace(/\r\n|\r|\n/g, `\n${PARAGRAPH_INDENT}`);
    const next = draft.slice(0, start) + indentedPasted + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      if (!el) return;
      const cursor = start + indentedPasted.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  // The analysis and the draft travel together in one submission, so the
  // latest save always holds both.
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
  const handleSubmitDraft = () => save(setSaving);

  const PANEL = 'surface p-6 sm:p-8 focus-visible:outline-none';

  return (
    // Animate UI Tabs: the cobalt "selected" pill slides between tabs and panels
    // cross-fade. Radix supplies roles, ids and arrow-key navigation.
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
        <h2 className="text-lg font-extrabold tracking-tight mb-1 text-slate-100">Phân tích đề</h2>
        <p className="text-sm text-slate-400 mb-4">
          Tự ghi ra trước khi viết: thể loại, người viết và người nhận, mục đích, các ý bắt buộc phải có, số chữ.
        </p>
        {loadingDraft ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : (
          <>
            <label htmlFor="paper-analysis" className="sr-only">Phân tích đề của bạn</label>
            <textarea
              id="paper-analysis"
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              rows={8}
              placeholder={`Ví dụ:
- Thể loại: 申请书
- Gửi cho: nhà trường
- Phải nêu: lý do, ưu điểm bản thân, mong muốn học được gì
- Số chữ: ≥ 150`}
              className="w-full bg-night-950 border border-night-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 leading-7 transition-colors focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <PressButton
                onClick={() => save(setSavingAnalysis)}
                disabled={savingAnalysis || !analysis.trim()}
                className="min-h-[44px] bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-2 text-sm font-bold shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] transition-colors"
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
          <h2 className="text-lg font-extrabold tracking-tight mb-3 text-slate-100">Dàn ý gợi ý</h2>
          <div className="zh text-sm leading-7 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: outline }} />
        </Tabs.Content>
      )}

      <Tabs.Content value="draft" className={PANEL}>
        <h2 className="text-lg font-extrabold tracking-tight mb-3 text-slate-100">Bài làm của bạn</h2>
        {loadingDraft ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : (
          <>
            <textarea
              ref={draftRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleDraftKeyDown}
              onPaste={handleDraftPaste}
              rows={12}
              placeholder="Viết bài làm của bạn ở đây..."
              aria-label="Bài làm của bạn"
              className="w-full bg-night-950 border border-night-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 zh leading-7 transition-colors focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
              <p className="text-xs text-slate-500">Mỗi lần xuống dòng sẽ tự thụt đầu dòng 2 ô, đúng quy cách viết luận.</p>
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
              <PressButton
                onClick={handleSubmitDraft}
                disabled={saving || !draft.trim()}
                className="min-h-[44px] bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-2 text-sm font-bold shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] transition-colors"
              >
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
          <h2 className="text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            Đáp án mẫu
            {showAnswer && <HanziCount count={countHanzi(htmlToText(answer))} />}
          </h2>
          <PressButton
            onClick={() => setShowAnswer((v) => !v)}
            aria-expanded={showAnswer}
            className="min-h-[44px] text-sm bg-coral-500 hover:bg-coral-600 text-white font-bold px-5 py-1.5 rounded-xl shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] transition-colors"
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
      <Tabs.Content value="ai" className={`${PANEL} text-center`}>
        <Robot size={44} weight="duotone" className="mx-auto mb-3 text-coral-400" aria-hidden="true" />
        <h2 className="text-lg font-extrabold tracking-tight text-slate-100 mb-2">Chấm bài bằng AI</h2>
        <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
          Tính năng AI chấm điểm và nhận xét bài làm đang được phát triển. Hãy quay lại sau nhé!
        </p>
        <button
          type="button"
          disabled
          className="min-h-[44px] bg-coral-500 text-white rounded-xl px-5 py-2 text-sm font-bold opacity-50 cursor-not-allowed"
        >
          Chấm bài bằng AI (Sắp ra mắt)
        </button>
      </Tabs.Content>
      )}
    </Tabs.Root>
  );
}

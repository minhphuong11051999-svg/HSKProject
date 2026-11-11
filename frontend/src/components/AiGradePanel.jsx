import { useState } from 'react';
import { gradeWithAi } from '../api/aiGrade';
import PressButton from './motion/PressButton';
import Reveal from './motion/Reveal';
import { Robot, CheckCircle, XCircle, Quotes, ArrowRight, ArrowsClockwise } from '@phosphor-icons/react';

const H3 = 'text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3';

// PRO-only: sends the learner's draft; the server pairs it with the paper's
// hidden grading criteria and returns score, coverage, layout/format notes,
// grammar errors and suggested 套话.
export default function AiGradePanel({ targetKey, text, hasGradingCriteria, onGoWrite }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasDraft = !!text && text.trim() !== '';

  async function grade() {
    setLoading(true);
    setError('');
    try {
      setResult(await gradeWithAi({ ...targetKey, text }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không chấm được bài lúc này, bạn thử lại sau nhé.');
    } finally {
      setLoading(false);
    }
  }

  if (!result) {
    return (
      <div className="text-center py-2">
        <span className="mx-auto mb-3 grid place-items-center h-14 w-14 rounded-2xl bg-coral-400/10 text-coral-400">
          <Robot size={32} weight="duotone" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-100 mb-2">Chấm bài bằng AI</h2>
        <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
          AI đối chiếu bài làm với tiêu chuẩn chấm của đề: chấm điểm, nhận xét ý, bố cục, định dạng, chỉ ra lỗi ngữ pháp và gợi ý mẫu câu.
        </p>
        {!hasGradingCriteria ? (
          <p className="text-sm font-semibold text-slate-500">Đề này chưa có tiêu chuẩn chấm.</p>
        ) : !hasDraft ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-300">Bạn hãy viết bài ở tab "Bài làm" trước khi chấm.</p>
            <button type="button" onClick={onGoWrite} className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-bold text-coral-400 hover:underline">
              Đến tab Bài làm <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <PressButton
            onClick={grade}
            disabled={loading}
            aria-busy={loading}
            className="min-h-[44px] bg-coral-500 hover:bg-coral-600 disabled:opacity-60 disabled:cursor-wait text-white rounded-xl px-6 py-2 text-sm font-bold shadow-[0_8px_20px_-10px_rgba(31,63,143,0.7)] transition-colors inline-flex items-center gap-2"
          >
            {loading && <ArrowsClockwise size={16} weight="bold" className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {loading ? 'AI đang chấm bài (khoảng 30 giây)...' : 'Chấm bài bằng AI'}
          </PressButton>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-err">
            {error}
          </p>
        )}
      </div>
    );
  }

  const pct = result.maxScore ? Math.round((result.totalScore / result.maxScore) * 100) : 0;

  return (
    <Reveal>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-6">
          <div
            className="relative grid place-items-center h-28 w-28 rounded-full shrink-0"
            style={{ background: `conic-gradient(rgb(var(--c-coral-accent)) ${pct * 3.6}deg, rgb(var(--c-night-700)) 0)` }}
            role="img"
            aria-label={`Điểm ${result.totalScore} trên ${result.maxScore}`}
          >
            <div className="grid place-items-center h-[5.75rem] w-[5.75rem] rounded-full bg-night-800">
              <span className="text-3xl font-extrabold tabular-nums text-slate-100 leading-none">{result.totalScore}</span>
              <span className="text-xs font-semibold text-slate-500">/ {result.maxScore}</span>
            </div>
          </div>
          <div className="flex-1 min-w-[14rem]">
            <p className="kicker">Kết quả AI chấm</p>
            <p className="mt-1 text-slate-200 leading-relaxed">{result.overall}</p>
          </div>
        </div>

        <section>
          <h3 className={H3}>Điểm theo tiêu chí</h3>
          <ul className="space-y-4">
            {result.criteria.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="font-bold text-slate-100 text-sm">{c.name}</span>
                  <span className="text-sm font-extrabold tabular-nums text-coral-400">
                    {c.score}/{c.max}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-night-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-coral-500 to-coral-300" style={{ width: `${c.max ? (c.score / c.max) * 100 : 0}%` }} />
                </div>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{c.comment}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-ok/30 bg-ok/5 p-4">
            <h3 className={`${H3} !text-ok`}>Ý đã có</h3>
            <ul className="space-y-2">
              {result.coverage.covered.length ? (
                result.coverage.covered.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-slate-200">
                    <CheckCircle size={18} weight="fill" className="text-ok shrink-0 mt-0.5" aria-hidden="true" />
                    {x}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">Chưa có ý nào khớp.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-err/30 bg-err/5 p-4">
            <h3 className={`${H3} !text-err`}>Ý còn thiếu</h3>
            <ul className="space-y-2">
              {result.coverage.missing.length ? (
                result.coverage.missing.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-slate-200">
                    <XCircle size={18} weight="fill" className="text-err shrink-0 mt-0.5" aria-hidden="true" />
                    {x}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">Đủ ý. Tốt lắm!</li>
              )}
            </ul>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className={H3}>Bố cục</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{result.structureComment}</p>
          </div>
          <div>
            <h3 className={H3}>
              Định dạng <span className="zh normal-case">格式</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{result.formatComment}</p>
          </div>
        </section>

        <section>
          <h3 className={H3}>Lỗi ngữ pháp ({result.grammarErrors.length})</h3>
          {result.grammarErrors.length ? (
            <ul className="space-y-3">
              {result.grammarErrors.map((g, i) => (
                <li key={i} className="rounded-2xl border border-night-700 bg-night-900/40 p-4">
                  <p className="zh text-base leading-7 text-err line-through decoration-err/60">
                    <span className="sr-only">Câu sai: </span>
                    {g.original}
                  </p>
                  <p className="zh text-base leading-7 text-ok font-semibold">
                    <span className="sr-only">Sửa lại: </span>
                    {g.correction}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{g.explanation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Không phát hiện lỗi ngữ pháp.</p>
          )}
        </section>

        <section>
          <h3 className={H3}>
            Mẫu câu gợi ý <span className="zh normal-case">套话</span>
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {result.suggestedPhrases.map((p, i) => (
              <li key={i} className="rounded-2xl bg-coral-400/5 border border-coral-400/20 p-4">
                <p className="zh text-base text-coral-400 flex gap-2">
                  <Quotes size={18} weight="fill" className="shrink-0 mt-0.5 opacity-60" aria-hidden="true" />
                  {p.phrase}
                </p>
                <p className="text-sm text-slate-300 mt-1.5">{p.meaning}</p>
                <p className="text-xs text-slate-500 mt-1">{p.usage}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-night-700">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="min-h-[44px] mt-4 inline-flex items-center gap-2 rounded-xl border border-night-700 bg-night-800 px-4 text-sm font-semibold text-slate-300 hover:border-coral-400/40 hover:text-slate-100 transition-colors"
          >
            <ArrowsClockwise size={16} aria-hidden="true" /> Chấm lại
          </button>
          <p className="mt-4 text-xs text-slate-500">Kết quả do AI tạo, chỉ mang tính tham khảo.</p>
        </div>
      </div>
    </Reveal>
  );
}

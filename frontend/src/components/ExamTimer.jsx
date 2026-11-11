import { useEffect, useRef, useState } from 'react';
import { Timer, Play, SkipForward, Stop } from '@phosphor-icons/react';

// Exam-room pacing: 2' analysing the prompt, 3' on vocabulary and arguments,
// 10' writing (15' in all). Each phase opens its tab; when the writing phase
// ends the draft locks (the learner can still submit it).
const PHASES = [
  { key: 'analysis', label: 'Phân tích đề', minutes: 2 },
  { key: 'outline', label: 'Từ vựng và luận điểm', minutes: 3 },
  { key: 'draft', label: 'Làm bài', minutes: 10 },
];
const TOTAL = PHASES.reduce((s, p) => s + p.minutes, 0);

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export default function ExamTimer({ onPhase, onFinish }) {
  const [phase, setPhase] = useState(-1); // -1 idle, PHASES.length = finished
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const cb = useRef({ onPhase, onFinish });
  cb.current = { onPhase, onFinish };

  function startPhase(i) {
    if (i >= PHASES.length) {
      setPhase(PHASES.length);
      cb.current.onFinish?.();
      return;
    }
    setPhase(i);
    setEndsAt(Date.now() + PHASES[i].minutes * 60_000);
    cb.current.onPhase?.(PHASES[i].key);
  }

  const running = phase >= 0 && phase < PHASES.length;

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && now >= endsAt) startPhase(phase + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const left = endsAt - now;

  return (
    <section aria-label="Thời gian làm bài" className="surface px-5 py-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center h-10 w-10 rounded-full bg-coral-400/10 text-coral-400 shrink-0">
            <Timer size={22} weight="duotone" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100">
              {phase === -1 && `Luyện như thi thật · ${TOTAL} phút`}
              {running && PHASES[phase].label}
              {phase === PHASES.length && 'Hết giờ làm bài'}
            </p>
            <p className="text-xs text-slate-400">
              {phase === -1 && PHASES.map((p) => `${p.label} ${p.minutes}'`).join(' · ')}
              {running && `Bước ${phase + 1}/${PHASES.length}`}
              {phase === PHASES.length && 'Bài làm đã khoá, bạn vẫn có thể nộp bài.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {running && (
            <span
              role="timer"
              aria-live="off"
              className={`font-extrabold tabular-nums text-2xl tracking-tight mr-1 ${left < 30_000 ? 'text-err' : 'text-coral-400'}`}
            >
              {fmt(left)}
            </span>
          )}
          {phase === -1 || phase === PHASES.length ? (
            <button
              type="button"
              onClick={() => startPhase(0)}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-coral-500 hover:bg-coral-600 px-4 text-sm font-bold text-white transition-colors"
            >
              <Play size={16} weight="fill" aria-hidden="true" />
              {phase === -1 ? 'Bắt đầu tính giờ' : 'Làm lại'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => startPhase(phase + 1)}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-night-700 bg-night-800 px-3 text-sm font-semibold text-slate-300 hover:border-coral-400/40 hover:text-slate-100 transition-colors"
              >
                <SkipForward size={16} aria-hidden="true" />
                {phase < PHASES.length - 1 ? 'Bước tiếp' : 'Kết thúc'}
              </button>
              <button
                type="button"
                onClick={() => setPhase(-1)}
                aria-label="Dừng tính giờ"
                className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl border border-night-700 bg-night-800 text-slate-400 hover:text-err hover:border-err/40 transition-colors"
              >
                <Stop size={16} weight="fill" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {phase >= 0 && (
        <ol className="mt-4 grid gap-2" style={{ gridTemplateColumns: PHASES.map((p) => `${p.minutes}fr`).join(' ') }}>
          {PHASES.map((p, i) => {
            const fill = i < phase ? 1 : i === phase ? 1 - Math.max(0, left) / (p.minutes * 60_000) : 0;
            return (
              <li key={p.key}>
                <div className="h-1.5 rounded-full bg-night-700 overflow-hidden">
                  <div className="h-full rounded-full bg-coral-400 transition-[width] duration-300 ease-linear motion-reduce:transition-none" style={{ width: `${fill * 100}%` }} />
                </div>
                <p className={`mt-1.5 text-[11px] font-semibold truncate ${i === phase ? 'text-coral-400' : 'text-slate-500'}`}>
                  {p.label} · {p.minutes}&apos;
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

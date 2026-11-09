import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dialog } from '@animate-ui/react/primitives/radix-ui/dialog';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  Confetti,
  SpeakerHigh,
  X,
  XCircle,
  Cards,
} from '@phosphor-icons/react';
import PressButton from '../motion/PressButton';
import { submitExercise } from '../../api/lessons';

const KIND_LABELS = {
  choice: 'Trắc nghiệm nhận diện & cụm từ',
  fill: 'Điền từ vào câu',
  translate: 'Dịch câu Việt → Trung',
  listen: 'Luyện nghe',
};

// First variant of "申请 / 申请书" style entries is what goes on the card face.
const mainOf = (text) => (text || '').split(' / ')[0];

let currentAudio = null;

// Plays the uploaded/linked clip when there is one; otherwise (or if it fails to
// load) reads the Chinese text with the browser's text-to-speech voice.
function play(audioUrl, text) {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
  currentAudio?.pause();
  currentAudio = null;
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.play().catch(() => text && speak(text));
    return;
  }
  if (text) speak(text);
}

function speak(text) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  } catch {
    // Speech synthesis unavailable (old browser) — the text is still on screen.
  }
}

// Full-screen flashcard round opened from "Bài mẫu": for every word the learner
// studies the 2-sided card, then answers its 4 questions. The rest of the lesson
// is dimmed + blurred behind the dialog until it is closed.
export default function FlashcardGame({ open, onClose, cards, lessonId, canSave }) {
  const steps = useMemo(() => {
    const list = [];
    cards.forEach((card, i) => {
      list.push({ type: 'card', i });
      (card.questions || []).forEach((_, j) => list.push({ type: 'question', i, j }));
    });
    return list;
  }, [cards]);
  const total = useMemo(() => cards.reduce((n, c) => n + (c.questions?.length || 0), 0), [cards]);

  const [n, setN] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  function restart() {
    setN(0);
    setFlipped(false);
    setAnswers({});
    setScore(0);
  }

  useEffect(() => {
    if (open) {
      restart();
      return undefined;
    }
    // Closing the dialog silences anything still playing.
    currentAudio?.pause();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
    return undefined;
  }, [open]);

  const done = n >= steps.length;
  const step = steps[n];
  const card = step ? cards[step.i] : null;

  // Save the finished round once (graded on the server from the chosen options).
  useEffect(() => {
    if (!done || !open || !canSave || !lessonId || steps.length === 0) return;
    const payload = {};
    cards.forEach((c) => {
      payload[c.id] = (c.questions || []).map((_, j) => answers[`${c.id}:${j}`] ?? null);
    });
    submitExercise({ lessonId, exerciseType: 'flashcard', exerciseId: lessonId, answerPayload: { answers: payload } }).catch(
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function choose(k) {
    const key = `${card.id}:${step.j}`;
    if (answers[key] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [key]: k }));
    if (k === card.questions[step.j].answer) setScore((s) => s + 1);
  }

  // `from` is the step the button was rendered for: a stale button on the step
  // that is still animating out (or a double click) can't skip a question.
  function next(from) {
    setFlipped(false);
    setN((v) => (v === from ? v + 1 : v));
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-3 inset-y-3 sm:inset-y-6 z-50 m-auto h-fit max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] max-w-3xl overflow-y-auto rounded-2xl border border-night-700 bg-night-900 p-4 sm:p-6 shadow-2xl focus:outline-none"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <Dialog.Title className="flex items-center gap-2 font-bold text-slate-100">
              <Cards size={22} weight="duotone" className="text-coral-400" aria-hidden="true" />
              Luyện với flashcard
            </Dialog.Title>
            <Dialog.Close
              aria-label="Đóng flashcard"
              className="w-11 h-11 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-100 hover:bg-night-800 transition-colors"
            >
              <X size={20} weight="bold" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {!done && card && (
            <>
              <div className="flex justify-between text-xs font-bold tracking-wide text-slate-400">
                <span>
                  TỪ {step.i + 1}/{cards.length}
                </span>
                <span className="inline-flex items-center gap-1">
                  ĐIỂM <SlidingNumber number={score} />
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-night-700 mt-2 mb-5 overflow-hidden">
                <motion.div
                  className="h-full w-full origin-left bg-gradient-to-r from-coral-500 to-gold"
                  animate={{ scaleX: n / steps.length }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                />
              </div>
            </>
          )}

          {/* Enter-only slide (no exit phase): the next step is interactive at once,
              so fast clicking can never leave a stale step on screen. */}
          <motion.div
              key={done ? 'end' : n}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
            >
              {done ? (
                <EndScreen score={score} total={total} onRestart={restart} onClose={onClose} />
              ) : step.type === 'card' ? (
                <CardStep card={card} flipped={flipped} onFlip={() => setFlipped((v) => !v)} onNext={() => next(n)} />
              ) : (
                <QuestionStep
                  question={card.questions[step.j]}
                  chosen={answers[`${card.id}:${step.j}`]}
                  onChoose={choose}
                  onNext={() => next(n)}
                />
              )}
            </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CardStep({ card, flipped, onFlip, onNext }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.2em] text-coral-400 mb-3">— THẺ TỪ VỰNG</p>
      {/* 3D flip: both faces share one grid cell, so the card is as tall as the taller face. */}
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? 'Xem lại mặt trước' : 'Lật thẻ'}
        className="block w-full text-left [perspective:1400px] rounded-3xl"
      >
        <motion.div
          className="grid [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <CardFront card={card} />
          <CardBack card={card} />
        </motion.div>
      </button>

      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => play(card.audioUrl, mainOf(card.word))}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-night-600 bg-night-800 px-5 text-sm font-semibold text-slate-200 hover:bg-night-700 transition-colors"
        >
          <SpeakerHigh size={18} weight="fill" aria-hidden="true" />
          Nghe từ
        </button>
        <PressButton
          onClick={onNext}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-coral-500 hover:bg-coral-600 px-5 text-sm font-semibold text-white transition-colors"
        >
          Làm bài tập
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </PressButton>
      </div>
    </div>
  );
}

const FACE =
  'relative [grid-area:1/1] [backface-visibility:hidden] rounded-3xl text-white min-h-[22rem] px-5 pt-7 pb-12 sm:px-8 sm:pt-9 shadow-xl';

function CardFront({ card }) {
  const phrases = (Array.isArray(card.phrases) ? card.phrases : []).filter(Boolean);
  return (
    <div className={`${FACE} bg-gradient-to-br from-[#16213f] to-[#0e1730] grid sm:grid-cols-2 items-center gap-6`}>
      {/* ① big hanzi + ② part of speech */}
      <div className="flex flex-col items-center gap-5">
        <p className="zh text-7xl sm:text-8xl font-black tracking-wide leading-none text-center">{mainOf(card.word)}</p>
        {card.partOfSpeech && (
          <span className="rounded-full border border-gold/40 bg-white/10 px-4 py-1 text-xs font-extrabold tracking-wider text-[#f0c36a] uppercase">
            {card.partOfSpeech}
          </span>
        )}
      </div>
      {/* ③ picture + ④ two phrases */}
      <div className="flex flex-col items-center gap-4">
        {card.imageUrl && (
          <div className="w-44 sm:w-52 aspect-square rounded-3xl bg-white overflow-hidden shadow-lg">
            <img src={card.imageUrl} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
        )}
        {phrases.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {phrases.map((p) => (
              <span key={p} className="zh rounded-xl bg-white/10 px-4 py-2 text-lg sm:text-xl font-bold">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
      <Hint>↻ Chạm để lật thẻ</Hint>
    </div>
  );
}

function CardBack({ card }) {
  return (
    <div
      className={`${FACE} [transform:rotateY(180deg)] bg-gradient-to-br from-[#1f2a44] to-[#141c30] flex flex-col items-center justify-center gap-4 text-center`}
    >
      {/* ① hanzi + pinyin */}
      <div>
        <p className="zh text-5xl sm:text-6xl font-black">{mainOf(card.word)}</p>
        <p className="mt-2 text-xl sm:text-2xl tracking-wide text-[#9fd8cd]">{card.pinyin}</p>
      </div>
      {/* ② Vietnamese meaning */}
      {card.meaning && (
        <p className="rounded-2xl bg-white/10 px-5 py-3 text-base sm:text-lg font-bold text-[#f6d77a]">{card.meaning}</p>
      )}
      {/* ③ example + translation */}
      {card.exampleZh && (
        <div className="w-full rounded-2xl bg-[#e9e4d6] px-5 py-4 text-left text-[#2b3445]">
          <p className="zh text-lg sm:text-xl font-semibold">{card.exampleZh}</p>
          {card.exampleVi && <p className="mt-1 text-sm text-[#5a6272]">{card.exampleVi}</p>}
        </div>
      )}
      <Hint>↻ Xem lại mặt trước</Hint>
    </div>
  );
}

function Hint({ children }) {
  return (
    <span className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold text-white/50">{children}</span>
  );
}

function QuestionStep({ question, chosen, onChoose, onNext }) {
  const answered = chosen !== undefined;
  const correct = answered && chosen === question.answer;
  const isListen = question.kind === 'listen' && (question.audioZh || question.audioUrl);

  useEffect(() => {
    if (!isListen) return undefined;
    const t = setTimeout(() => play(question.audioUrl, question.audioZh), 350);
    return () => {
      clearTimeout(t);
      currentAudio?.pause();
    };
  }, [isListen, question.audioUrl, question.audioZh]);

  return (
    <div className="rounded-2xl border border-night-700 bg-night-800 p-4 sm:p-6">
      <p className="text-xs font-bold tracking-wider text-coral-400 mb-3 uppercase">
        {KIND_LABELS[question.kind] || 'Câu hỏi'}
      </p>
      {isListen && (
        <PressButton
          onClick={() => play(question.audioUrl, question.audioZh)}
          aria-label="Phát lại câu"
          className="mx-auto mb-4 flex w-20 h-20 items-center justify-center rounded-full bg-gradient-to-br from-[#16213f] to-[#0e1730] text-white shadow-lg"
        >
          <SpeakerHigh size={34} weight="fill" aria-hidden="true" />
        </PressButton>
      )}
      <p className="text-base sm:text-lg font-semibold leading-relaxed text-slate-100 mb-4">{question.prompt}</p>

      <div className="space-y-2.5">
        {(question.options || []).map((opt, k) => {
          const isAnswer = k === question.answer;
          const isChosen = k === chosen;
          const tone = !answered
            ? 'border-night-600 hover:border-coral-500'
            : isAnswer
            ? 'border-green-500 bg-green-500/15'
            : isChosen
            ? 'border-red-500 bg-red-500/15'
            : 'border-night-700 opacity-60';
          return (
            <button
              key={k}
              type="button"
              disabled={answered}
              onClick={() => onChoose(k)}
              className={`w-full min-h-[48px] flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-base font-semibold text-slate-100 transition-colors disabled:cursor-default ${tone}`}
            >
              <span className="w-6 flex-shrink-0 font-bold text-slate-400">{'ABCD'[k]}</span>
              <span className="flex-1">{opt}</span>
              {answered && isAnswer && <CheckCircle size={22} weight="fill" className="text-green-400" aria-hidden="true" />}
              {answered && isChosen && !isAnswer && <XCircle size={22} weight="fill" className="text-red-400" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="mt-4">
            <div
              className={`rounded-xl border p-3 text-sm leading-relaxed ${
                correct ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
              }`}
            >
              <p className={`font-semibold ${correct ? 'text-green-400' : 'text-red-400'}`}>
                {correct ? 'Chính xác!' : 'Chưa đúng.'} Đáp án: {'ABCD'[question.answer]}
              </p>
              {isListen && (
                <>
                  <p className="zh mt-1 text-slate-100">{question.audioZh}</p>
                  {question.audioVi && <p className="text-slate-400">{question.audioVi}</p>}
                </>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <PressButton
                onClick={onNext}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-coral-500 hover:bg-coral-600 px-6 text-sm font-semibold text-white transition-colors"
              >
                Tiếp tục
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </PressButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EndScreen({ score, total, onRestart, onClose }) {
  return (
    <div className="rounded-2xl border border-night-700 bg-night-800 px-5 py-10 text-center">
      <motion.div
        initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="inline-flex"
      >
        <Confetti size={64} weight="duotone" className="text-coral-400" aria-hidden="true" />
      </motion.div>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-100">Hoàn thành!</h2>
      <p className="mt-2 text-lg text-slate-300">
        Bạn đúng <b className="text-coral-400">{score}/{total}</b> câu
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-night-600 bg-night-900 px-5 text-sm font-semibold text-slate-200 hover:bg-night-700 transition-colors"
        >
          <ArrowClockwise size={18} weight="bold" aria-hidden="true" />
          Làm lại
        </button>
        <PressButton
          onClick={onClose}
          className="min-h-[44px] rounded-xl bg-coral-500 hover:bg-coral-600 px-6 text-sm font-semibold text-white transition-colors"
        >
          Đóng
        </PressButton>
      </div>
    </div>
  );
}

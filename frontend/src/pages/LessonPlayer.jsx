import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLesson, submitExercise } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import PremiumModal from '../components/PremiumModal';
import LetterPaper, { HanziCount, countHanzi, htmlToText, toParagraphs } from '../components/LetterPaper';
import { BUILTIN_PART_KEYS, partLabel } from '../constants/lessonParts';

const BTN_PRIMARY =
  'min-h-[40px] inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors';
const BTN_SECONDARY =
  'min-h-[40px] inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-night-900 border border-night-600 hover:bg-night-700 text-slate-200 px-4 py-2 rounded-lg transition-colors';
const CARD = 'bg-night-900 border border-night-700 rounded-xl p-5';
const INPUT =
  'w-full bg-night-900 border border-night-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-coral-500';

export default function LessonPlayer() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [tab, setTab] = useState('theory');
  const [loading, setLoading] = useState(true);
  const [showTabPremium, setShowTabPremium] = useState(false);
  const isPremiumUser = user?.plan === 'PREMIUM';

  function isPartPremium(key) {
    return !!lesson?.premiumParts?.includes(key);
  }

  function goToTab(t) {
    if (isPartPremium(t.key) && !isPremiumUser) {
      setShowTabPremium(true);
      return;
    }
    setTab(t.key);
  }

  useEffect(() => {
    setLoading(true);
    getLesson(slug)
      .then((data) => {
        setLesson(data);
        const parts = data?.selectedParts?.length ? data.selectedParts : ['theory'];
        setTab(parts[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const parts = useMemo(() => {
    const keys = lesson?.selectedParts?.length ? lesson.selectedParts : [];
    return keys.map((key, i) => ({ key, number: i + 1, label: partLabel(key) }));
  }, [lesson]);

  const theoryQuestions = useMemo(
    () => lesson?.quizQuestions?.filter((q) => q.kind === 'THEORY') || [],
    [lesson]
  );
  const errorQuestions = useMemo(
    () => lesson?.quizQuestions?.filter((q) => q.kind === 'ERROR_ANALYSIS') || [],
    [lesson]
  );

  if (loading) return <p className="text-center py-10 text-slate-400">Đang tải...</p>;
  if (!lesson) return <p className="text-center py-10 text-slate-400">Không tìm thấy bài học.</p>;
  if (lesson.locked) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="zh text-2xl">{lesson.titleZh}</p>
        <h1 className="text-xl font-bold mt-2">{lesson.titleVi}</h1>
        <PremiumModal open onClose={() => navigate('/lessons')} />
      </main>
    );
  }

  const selected = lesson.selectedParts || [];
  const current = parts.find((p) => p.key === tab);
  const canSave = !!user;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-64 flex-shrink-0 md:sticky md:top-6 md:self-start">
        <p className="zh text-xl mb-1">{lesson.titleZh}</p>
        <h1 className="font-semibold mb-4">{lesson.titleVi}</h1>
        <nav className="flex flex-col gap-2" aria-label="Các bước của bài học">
          {parts.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => goToTab(t)}
              aria-current={tab === t.key ? 'step' : undefined}
              className={`w-full min-h-[40px] text-left px-3 py-2 rounded-lg text-sm flex items-center flex-wrap gap-x-2 gap-y-1 transition-colors ${
                tab === t.key
                  ? 'bg-coral-500 text-white'
                  : 'bg-night-800 border border-night-700 hover:bg-night-700'
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  tab === t.key ? 'bg-white/25 text-white' : 'bg-night-700 text-slate-300'
                }`}
              >
                {t.number}
              </span>
              <span className="min-w-0 break-words">{t.label}</span>
              {isPartPremium(t.key) && !isPremiumUser && (
                <span className="flex-shrink-0 bg-gold text-night-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                  👑 PRO
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <PremiumModal open={showTabPremium} onClose={() => setShowTabPremium(false)} />

      <section className="flex-1 min-w-0 bg-night-800 border border-night-700 rounded-xl p-5 sm:p-6">
        {current && (
          <header className="mb-6 pb-4 border-b border-night-700">
            <h2 className="text-lg font-bold text-slate-100">
              <span className="text-coral-400">Bước {current.number}</span> · {current.label}
            </h2>
          </header>
        )}

        {tab === 'theory' && <TheoryTab lesson={lesson} showFixedPhrases={!selected.includes('fixed_phrases')} />}
        {tab === 'samples' && <SamplesTab lesson={lesson} />}
        {tab === 'quiz' && <QuizList lessonId={lesson.id} questions={theoryQuestions} canSave={canSave} />}
        {tab === 'matching' && <MatchingTab lesson={lesson} canSave={canSave} />}
        {tab === 'cloze' && <ClozeTab lessonId={lesson.id} exercises={lesson.clozeExercises} canSave={canSave} />}
        {tab === 'error' && <ErrorTab lessonId={lesson.id} questions={errorQuestions} canSave={canSave} />}
        {tab === 'sentence_building' && <SentenceBuildingTab tasks={lesson.writingTasks} />}
        {tab === 'translate_transform' && <TranslateTab exercises={exercisesOf(lesson, 'translate')} />}
        {tab === 'outline' && <OutlineTab exercises={exercisesOf(lesson, 'outline')} />}
        {tab === 'fixed_phrases' && <FixedPhrasesTab phrases={lesson.fixedPhrases} />}
        {tab === 'vocab' && (
          <VocabTab
            lesson={lesson}
            canSave={canSave}
            showMatching={!selected.includes('matching')}
            showSentenceTasks={!selected.includes('sentence_building')}
          />
        )}
        {tab === 'partial_writing' && <PartialWritingTab lesson={lesson} />}
        {tab === 'writing' && <WritingTab lesson={lesson} />}
        {!BUILTIN_PART_KEYS.includes(tab) && <GenericTab lesson={lesson} partKey={tab} />}
      </section>
    </main>
  );
}

function exercisesOf(lesson, kind) {
  return (lesson.exercises || []).filter((e) => e.kind === kind);
}

function Empty({ children = 'Chưa có nội dung cho phần này.' }) {
  return <p className="text-slate-400 text-sm">{children}</p>;
}

function LoginHint({ canSave }) {
  if (canSave) return null;
  return <p className="text-xs text-amber-400 mt-2">Đăng nhập để kiểm tra đáp án.</p>;
}

function Html({ html, className = '' }) {
  return <div className={`whitespace-pre-line ${className}`} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}

function FeedbackBox({ isCorrect, title, children }) {
  const tone =
    isCorrect === undefined
      ? 'border-night-600 bg-night-900'
      : isCorrect
      ? 'border-green-500/60 bg-green-500/10'
      : 'border-red-500/60 bg-red-500/10';
  return (
    <div className={`mt-4 rounded-lg border p-4 text-sm ${tone}`} role="status">
      {title && (
        <p
          className={`font-semibold mb-1 ${
            isCorrect === undefined ? 'text-slate-200' : isCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- 1. Lý thuyết */

function TheoryTab({ lesson, showFixedPhrases }) {
  const sections = lesson.sections.filter((s) => !s.kind || s.kind === 'text' || s.kind === 'theory');
  if (!lesson.description && sections.length === 0 && (!showFixedPhrases || lesson.fixedPhrases.length === 0)) {
    return <Empty />;
  }
  return (
    <div className="space-y-4">
      {lesson.description && <p className="text-slate-300">{lesson.description}</p>}
      {sections.map((s) => (
        <article key={s.id} className={CARD}>
          {s.heading && <h3 className="font-semibold mb-2 text-slate-100">{s.heading}</h3>}
          <Html html={s.bodyHtml} className="text-sm leading-7 text-slate-300" />
        </article>
      ))}
      {showFixedPhrases && lesson.fixedPhrases.length > 0 && (
        <article className={CARD}>
          <h3 className="font-semibold mb-3 text-slate-100">Bộ mẫu câu cố định — 书面语 (套语)</h3>
          <PhraseTable phrases={lesson.fixedPhrases} />
        </article>
      )}
    </div>
  );
}

function GenericTab({ lesson, partKey }) {
  const sections = lesson.sections.filter((s) => s.kind === partKey);
  if (sections.length === 0) return <Empty>Chưa có nội dung cho phần "{partLabel(partKey)}".</Empty>;
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <article key={s.id} className={CARD}>
          {s.heading && <h3 className="font-semibold mb-2">{s.heading}</h3>}
          <Html html={s.bodyHtml} className="text-sm leading-7" />
        </article>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- 2. Bài mẫu */

// Sample bodies are stored as plain text where the first short line is
// usually the document title (e.g. "关于春节放假的通知"); lift it out so it
// renders centred above the greeting like on a real sheet.
function splitSampleBody(body) {
  const lines = toParagraphs(htmlToText(body));
  if (lines.length > 1 && lines[0].length <= 24 && !/[。！？，]/.test(lines[0])) {
    return { title: lines[0], paragraphs: lines.slice(1) };
  }
  return { title: '', paragraphs: lines };
}

function SamplesTab({ lesson }) {
  if (lesson.sampleDocuments.length === 0) return <Empty>Chưa có bài mẫu cho phần này.</Empty>;
  return (
    <div className="grid gap-6">
      {lesson.sampleDocuments.map((doc, idx) => {
        const { title, paragraphs } = splitSampleBody(doc.body);
        const total = countHanzi([title, doc.audience, ...paragraphs, doc.signerOrg, doc.date].join(''));
        return (
          <article key={doc.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-slate-200">
                Bài mẫu {idx + 1}
                {doc.label ? ` · ${doc.label}` : ''}
              </p>
              <HanziCount count={total} />
            </div>
            <LetterPaper
              title={title}
              greeting={doc.audience}
              paragraphs={paragraphs}
              sign={doc.signerOrg}
              date={doc.date}
              minHeight=""
            />
          </article>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------- 3. Nhận diện thể thức */

function QuizList({ lessonId, questions, canSave }) {
  if (questions.length === 0) return <Empty>Chưa có câu hỏi cho phần này.</Empty>;
  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <ChoiceQuestion key={q.id} index={i} lessonId={lessonId} question={q} canSave={canSave} />
      ))}
    </div>
  );
}

function ChoiceQuestion({ index, lessonId, question: q, canSave, showDraft = false }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    if (selected === null || !canSave) return;
    setChecking(true);
    try {
      const res = await submitExercise({
        lessonId,
        exerciseType: 'quiz',
        exerciseId: q.id,
        answerPayload: { selectedIndex: selected },
      });
      setResult(res.feedback);
    } catch {
      // network error — the user can simply press again
    } finally {
      setChecking(false);
    }
  }

  function retry() {
    setSelected(null);
    setResult(null);
  }

  return (
    <article className={CARD}>
      <p className="text-xs font-semibold text-slate-500 mb-1">Câu {index + 1}</p>
      <p className="font-semibold text-slate-100">{q.title}</p>
      {showDraft && q.draftHtml && (
        <div className="my-3">
          <p className="text-xs font-semibold text-slate-400 mb-1">Bài mẫu viết sai</p>
          <LetterPaper html={result ? q.draftHtmlMarked || q.draftHtml : q.draftHtml} minHeight="" />
        </div>
      )}
      {q.prompt && <p className="mt-2 text-sm text-slate-300">{q.prompt}</p>}

      <div className="mt-3 grid gap-2" role="radiogroup" aria-label={q.title}>
        {q.options.map((opt, idx) => {
          const text = (typeof opt === 'string' ? opt : opt.text).replace(/^[A-D][.、．]\s*/, '');
          const letter = String.fromCharCode(65 + idx);
          let tone = selected === idx ? 'border-coral-500 ring-1 ring-coral-500' : 'border-night-600 hover:border-coral-500/60';
          if (result) {
            if (idx === result.correctIndex) tone = 'border-green-500 bg-green-500/10 text-green-300';
            else if (idx === selected) tone = 'border-red-500 bg-red-500/10 text-red-300';
            else tone = 'border-night-700 opacity-60';
          }
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={selected === idx}
              disabled={!!result}
              onClick={() => setSelected(idx)}
              className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border bg-night-800 text-sm transition-colors ${tone}`}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-night-700 text-xs font-bold flex items-center justify-center">
                {letter}
              </span>
              <span className="pt-0.5">{text}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {!result ? (
          <button type="button" onClick={check} disabled={checking || selected === null || !canSave} className={BTN_PRIMARY}>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra đáp án'}
          </button>
        ) : (
          <button type="button" onClick={retry} className={BTN_SECONDARY}>
            ↺ Thử lại
          </button>
        )}
      </div>
      <LoginHint canSave={canSave} />

      {result && (
        <FeedbackBox
          isCorrect={result.isCorrect}
          title={
            result.isCorrect
              ? '✅ Chính xác!'
              : `❌ Chưa đúng — đáp án đúng là ${String.fromCharCode(65 + result.correctIndex)}.`
          }
        >
          {result.explanation && <p className="text-slate-300 whitespace-pre-line">{result.explanation}</p>}
        </FeedbackBox>
      )}
      {result?.correctedHtml && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-400 mb-1">Bản thảo hoàn chỉnh</p>
          <LetterPaper html={result.correctedHtml} minHeight="" />
        </div>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- 4. Ghép nối */

function MatchingTab({ lesson, canSave }) {
  if (lesson.matchItems.length === 0) return <Empty>Chưa có bài ghép nối.</Empty>;
  return <MatchBoard lessonId={lesson.id} items={lesson.matchItems} canSave={canSave} />;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchBoard({ lessonId, items, canSave }) {
  const rightItems = useMemo(() => shuffle(items.map((it) => ({ id: it.id, text: it.rightLabelZh }))), [items]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [pairs, setPairs] = useState({});
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);
  const [lines, setLines] = useState([]);
  const boardRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});
  const done = Object.keys(results).length > 0;
  const pairedRightIds = new Set(Object.values(pairs));

  // Measure card edges so each pair gets an SVG line from the right edge of
  // the left card to the left edge of the matching right card.
  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const box = board.getBoundingClientRect();
    const next = Object.entries(pairs)
      .map(([leftId, rightId]) => {
        const l = leftRefs.current[leftId]?.getBoundingClientRect();
        const r = rightRefs.current[rightId]?.getBoundingClientRect();
        if (!l || !r) return null;
        return {
          leftId,
          x1: l.right - box.left,
          y1: l.top + l.height / 2 - box.top,
          x2: r.left - box.left,
          y2: r.top + r.height / 2 - box.top,
        };
      })
      .filter(Boolean);
    setLines(next);
  }, [pairs]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  function clickLeft(item) {
    if (done) return;
    if (pairs[item.id]) {
      // clicking a paired card un-pairs it so mistakes can be fixed before checking
      setPairs((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      return;
    }
    setSelectedLeft((cur) => (cur === item.id ? null : item.id));
  }

  function clickRight(rightItem) {
    if (done || pairedRightIds.has(rightItem.id) || !selectedLeft) return;
    setPairs((prev) => ({ ...prev, [selectedLeft]: rightItem.id }));
    setSelectedLeft(null);
  }

  function reset() {
    setPairs({});
    setSelectedLeft(null);
    setResults({});
  }

  async function checkAll() {
    if (!canSave) return;
    setChecking(true);
    try {
      const entries = await Promise.all(
        items.map(async (item) => {
          const rightId = pairs[item.id];
          const rightText = rightId ? rightItems.find((r) => r.id === rightId)?.text : null;
          const res = await submitExercise({
            lessonId,
            exerciseType: 'match',
            exerciseId: item.id,
            answerPayload: { selectedKey: rightText },
          });
          return [item.id, res.feedback];
        })
      );
      setResults(Object.fromEntries(entries));
    } catch {
      // ignore, user can retry
    } finally {
      setChecking(false);
    }
  }

  function leftStatus(item) {
    if (!done) return pairs[item.id] ? 'paired' : selectedLeft === item.id ? 'selected' : '';
    return results[item.id]?.isCorrect ? 'correct' : 'wrong';
  }

  function rightStatus(rightItem) {
    const leftId = Object.keys(pairs).find((l) => pairs[l] === rightItem.id);
    if (!done) return leftId ? 'paired' : '';
    if (!leftId) return '';
    return results[leftId]?.isCorrect ? 'correct' : 'wrong';
  }

  const statusClass = {
    '': 'border-night-600 bg-night-900 hover:border-coral-500/60',
    selected: 'border-coral-500 bg-night-900 ring-2 ring-coral-500',
    paired: 'border-coral-500/60 bg-coral-500/10',
    correct: 'border-green-500 bg-green-500/10 text-green-300',
    wrong: 'border-red-500 bg-red-500/10 text-red-300',
  };

  function lineColor(leftId) {
    if (!done) return 'var(--c-coral-accent, #d4a03a)';
    return results[leftId]?.isCorrect ? '#22c55e' : '#ef4444';
  }

  const letterOf = (rightId) => String.fromCharCode(65 + rightItems.findIndex((r) => r.id === rightId));
  const userAnswer = items
    .map((item, idx) => (pairs[item.id] ? `${idx + 1}-${letterOf(pairs[item.id])}` : null))
    .filter(Boolean)
    .join(', ');
  const correctAnswer = items
    .map((item, idx) => {
      const key = results[item.id]?.correctKey;
      const r = rightItems.findIndex((ri) => ri.text === key);
      return r >= 0 ? `${idx + 1}-${String.fromCharCode(65 + r)}` : null;
    })
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Chọn 1 thẻ ở cột trái rồi chọn thẻ tương ứng ở cột phải để nối. Bấm lại thẻ đã nối ở cột trái để bỏ nối.
      </p>
      <div ref={boardRef} className="relative grid grid-cols-2 gap-x-10 sm:gap-x-20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          {lines.map((ln) => (
            <line
              key={ln.leftId}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke={lineColor(ln.leftId)}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Cột trái</p>
          {items.map((item, idx) => (
            <button
              key={item.id}
              ref={(el) => (leftRefs.current[item.id] = el)}
              type="button"
              onClick={() => clickLeft(item)}
              aria-pressed={selectedLeft === item.id}
              className={`relative w-full min-h-[44px] text-left text-sm px-3 py-2 rounded-lg border transition-colors ${statusClass[leftStatus(item)]}`}
            >
              <b className="mr-1">{idx + 1}.</b> {item.leftLabelVi}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Cột phải</p>
          {rightItems.map((rightItem, idx) => (
            <button
              key={rightItem.id}
              ref={(el) => (rightRefs.current[rightItem.id] = el)}
              type="button"
              onClick={() => clickRight(rightItem)}
              className={`relative w-full min-h-[44px] text-left text-sm zh px-3 py-2 rounded-lg border transition-colors ${statusClass[rightStatus(rightItem)]}`}
            >
              <b className="mr-1">{String.fromCharCode(65 + idx)}.</b> {rightItem.text}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!done ? (
          <button
            type="button"
            onClick={checkAll}
            disabled={checking || Object.keys(pairs).length === 0 || !canSave}
            className={BTN_PRIMARY}
          >
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra đáp án'}
          </button>
        ) : null}
        <button type="button" onClick={reset} className={BTN_SECONDARY} disabled={Object.keys(pairs).length === 0 && !done}>
          ↺ Thử lại
        </button>
      </div>
      <LoginHint canSave={canSave} />

      {done && (
        <FeedbackBox
          isCorrect={items.every((it) => results[it.id]?.isCorrect)}
          title={`Kết quả: ${items.filter((it) => results[it.id]?.isCorrect).length}/${items.length} cặp đúng`}
        >
          <p className="text-slate-300">
            Bạn nối: <span className="font-mono">{userAnswer || '—'}</span>
          </p>
          <p className="text-slate-300">
            Đáp án: <span className="font-mono text-green-400">{correctAnswer}</span>
          </p>
          {items.some((it) => results[it.id]?.explanation) && (
            <ul className="mt-2 space-y-1 text-slate-400 list-disc pl-5">
              {items
                .filter((it) => results[it.id]?.explanation)
                .map((it) => (
                  <li key={it.id}>
                    {it.leftLabelVi}: {results[it.id].explanation}
                  </li>
                ))}
            </ul>
          )}
        </FeedbackBox>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- 5. Đục lỗ */

const BLANK_MARKER = /_{2,}\s*[（(]\s*(\d+)\s*[)）]\s*_{2,}/;
const BLANK_MARKER_G = new RegExp(BLANK_MARKER.source, 'g');

function ClozeTab({ lessonId, exercises, canSave }) {
  if (!exercises || exercises.length === 0) return <Empty>Chưa có bài tập đục lỗ.</Empty>;
  return (
    <div className="space-y-6">
      {exercises.map((ex, i) => (
        <ClozeCard key={ex.id} index={i} lessonId={lessonId} exercise={ex} canSave={canSave} />
      ))}
    </div>
  );
}

function ClozeCard({ index, lessonId, exercise: ex, canSave }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const segments = ex.templateHtml.split(BLANK_MARKER_G); // [html, n, html, n, ...]
  const inline = segments.length > 1;

  async function check() {
    if (!canSave) return;
    setChecking(true);
    try {
      const res = await submitExercise({
        lessonId,
        exerciseType: 'cloze',
        exerciseId: ex.id,
        answerPayload: { answers },
      });
      setResult(res.feedback);
    } catch {
      // ignore, user can retry
    } finally {
      setChecking(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  function renderSelect(blank, number) {
    if (!blank) return <span className="text-red-400">[?]</span>;
    const chosen = answers[blank.id] || '';
    const correct = result?.correctAnswers?.[blank.id];
    const isRight = result && chosen === correct;
    return (
      <select
        key={`s${number}`}
        aria-label={`Chỗ trống ${number}`}
        value={chosen}
        disabled={!!result}
        onChange={(e) => setAnswers((prev) => ({ ...prev, [blank.id]: e.target.value }))}
        className={`mx-1 align-baseline rounded-md border px-1.5 py-0.5 text-sm font-sans ${
          result
            ? isRight
              ? 'border-green-600 bg-green-50 text-green-800'
              : 'border-red-600 bg-red-50 text-red-800'
            : 'border-slate-400 bg-white text-slate-900'
        }`}
      >
        <option value="">({number}) Chọn...</option>
        {blank.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  const fullAnswerHtml = result
    ? ex.templateHtml.replace(BLANK_MARKER_G, (_, n) => {
        const blank = ex.blanks[Number(n) - 1];
        const value = blank ? result.correctAnswers?.[blank.id] : '';
        return `<b style="color:#15803d;text-decoration:underline">${value || ''}</b>`;
      })
    : '';

  return (
    <article className={CARD}>
      <p className="text-xs font-semibold text-slate-500 mb-2">Bài {index + 1}</p>
      <div className="letter-paper rounded-lg p-6 pb-16 text-[15px] zh leading-9 whitespace-pre-line">
        {inline
          ? segments.map((seg, i) =>
              i % 2 === 0 ? (
                <span key={i} dangerouslySetInnerHTML={{ __html: seg }} />
              ) : (
                renderSelect(ex.blanks[Number(seg) - 1], seg)
              )
            )
          : <span dangerouslySetInnerHTML={{ __html: ex.templateHtml }} />}
      </div>

      {!inline && (
        <div className="mt-3 flex flex-wrap gap-3">{ex.blanks.map((b, i) => renderSelect(b, i + 1))}</div>
      )}

      {result && (
        <ul className="mt-3 text-xs space-y-0.5">
          {ex.blanks.map((b, i) =>
            answers[b.id] === result.correctAnswers?.[b.id] ? null : (
              <li key={b.id} className="text-red-400">
                ({i + 1}) Đáp án đúng: <span className="zh text-green-400">{result.correctAnswers?.[b.id]}</span>
              </li>
            )
          )}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {!result ? (
          <button type="button" onClick={check} disabled={checking || !canSave} className={BTN_PRIMARY}>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra'}
          </button>
        ) : (
          <button type="button" onClick={retry} className={BTN_SECONDARY}>
            ↺ Thử lại
          </button>
        )}
      </div>
      <LoginHint canSave={canSave} />

      {result && (
        <>
          <FeedbackBox
            isCorrect={result.score === result.maxScore}
            title={`Kết quả: ${result.score}/${result.maxScore} ô đúng`}
          />
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 mb-1">Đáp án mẫu toàn văn</p>
            <LetterPaper html={fullAnswerHtml} minHeight="" />
          </div>
        </>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- 6. Tìm lỗi sai */

function ErrorTab({ lessonId, questions, canSave }) {
  if (questions.length === 0) return <Empty>Chưa có bài tìm lỗi sai.</Empty>;
  return (
    <div className="space-y-5">
      {questions.map((q, i) =>
        q.mode === 'fix' ? (
          <ErrorFixCard key={q.id} index={i} lessonId={lessonId} question={q} canSave={canSave} />
        ) : (
          <ChoiceQuestion key={q.id} index={i} lessonId={lessonId} question={q} canSave={canSave} showDraft />
        )
      )}
    </div>
  );
}

function ErrorFixCard({ index, lessonId, question: q, canSave }) {
  const [wordFix, setWordFix] = useState('');
  const [layoutFix, setLayoutFix] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    if (!canSave) return;
    setChecking(true);
    try {
      const res = await submitExercise({
        lessonId,
        exerciseType: 'error_fix',
        exerciseId: q.id,
        answerPayload: { wordFix, layoutFix },
      });
      setResult(res.feedback);
    } catch {
      // ignore, user can retry
    } finally {
      setChecking(false);
    }
  }

  function retry() {
    setWordFix('');
    setLayoutFix('');
    setResult(null);
  }

  return (
    <article className={CARD}>
      <p className="text-xs font-semibold text-slate-500 mb-1">Câu {index + 1} · Tự sửa lỗi</p>
      <p className="font-semibold text-slate-100">{q.title}</p>
      {q.draftHtml && (
        <div className="my-3">
          <p className="text-xs font-semibold text-slate-400 mb-1">Bản thảo có lỗi</p>
          <LetterPaper html={result ? q.draftHtmlMarked || q.draftHtml : q.draftHtml} minHeight="" />
        </div>
      )}
      {q.prompt && <p className="text-sm text-slate-300 mb-3">{q.prompt}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-slate-300 block mb-1">Sửa lỗi dùng từ</span>
          <textarea
            rows={4}
            value={wordFix}
            onChange={(e) => setWordFix(e.target.value)}
            disabled={!!result}
            className={`${INPUT} zh`}
            placeholder="Ghi từ sai → từ đúng..."
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300 block mb-1">Sửa lỗi bố cục</span>
          <textarea
            rows={4}
            value={layoutFix}
            onChange={(e) => setLayoutFix(e.target.value)}
            disabled={!!result}
            className={`${INPUT} zh`}
            placeholder="Chỉ ra lỗi bố cục và cách sửa..."
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {!result ? (
          <button
            type="button"
            onClick={check}
            disabled={checking || !canSave || (!wordFix.trim() && !layoutFix.trim())}
            className={BTN_PRIMARY}
          >
            {checking ? 'Đang tải...' : 'Kiểm tra đáp án'}
          </button>
        ) : (
          <button type="button" onClick={retry} className={BTN_SECONDARY}>
            ↺ Thử lại
          </button>
        )}
      </div>
      <LoginHint canSave={canSave} />
      {result && (
        <>
          <FeedbackBox title="Giải thích">
            <p className="text-slate-300 whitespace-pre-line">{result.explanation || 'Chưa có giải thích.'}</p>
          </FeedbackBox>
          {result.correctedHtml && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">Bản thảo hoàn chỉnh</p>
              <LetterPaper html={result.correctedHtml} minHeight="" />
            </div>
          )}
        </>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- 7. Lắp ráp câu */

function SentenceBuildingTab({ tasks }) {
  if (!tasks || tasks.length === 0) return <Empty>Chưa có nhiệm vụ lắp ráp câu.</Empty>;
  return (
    <div className="space-y-5">
      {tasks.map((task) => (
        <SentenceTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

function SentenceTaskCard({ task }) {
  const [value, setValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const facts = Array.isArray(task.facts) ? task.facts : [];
  const keywords = Array.isArray(task.requiredKeywords) ? task.requiredKeywords.filter(Boolean) : [];

  return (
    <article className={CARD}>
      <p className="font-semibold text-slate-100">{task.title}</p>
      {facts.length > 0 && (
        <div className="mt-3 rounded-lg border border-night-600 bg-night-800 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-1">Dữ liệu đầu vào</p>
          <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
            {facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {keywords.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-400 mb-1">Từ khoá bắt buộc</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => {
              const used = value.includes(k);
              return (
                <span
                  key={k}
                  className={`zh text-sm px-2.5 py-0.5 rounded-full border ${
                    used ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-night-600 text-slate-300'
                  }`}
                >
                  {used ? '✓ ' : ''}
                  {k}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className={`${INPUT} zh mt-3`}
        placeholder="Viết câu hoàn chỉnh của bạn..."
        aria-label={`Câu trả lời cho ${task.title}`}
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {task.hint && (
          <button type="button" onClick={() => setShowHint((v) => !v)} className={BTN_SECONDARY}>
            💡 {showHint ? 'Ẩn công thức' : 'Công thức gợi ý'}
          </button>
        )}
        <button type="button" onClick={() => setShowAnswer((v) => !v)} className={BTN_PRIMARY}>
          {showAnswer ? 'Ẩn đáp án mẫu' : 'Xem đáp án mẫu'}
        </button>
      </div>
      {showHint && task.hint && (
        <div className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-200">
          <Html html={task.hint} />
        </div>
      )}
      {showAnswer && (
        <FeedbackBox isCorrect title="Đáp án mẫu">
          <Html html={task.referenceAnswer} className="zh text-slate-200" />
        </FeedbackBox>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- 8. Dịch - Chuyển câu */

function TranslateTab({ exercises }) {
  if (exercises.length === 0) return <Empty>Chưa có bài dịch - chuyển câu.</Empty>;
  return (
    <div className="space-y-5">
      {exercises.map((ex, i) => (
        <TranslateCard key={ex.id} index={i} exercise={ex} />
      ))}
    </div>
  );
}

function TranslateCard({ index, exercise: ex }) {
  const [value, setValue] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const hints = Array.isArray(ex.hints) ? ex.hints.filter(Boolean) : [];
  return (
    <article className={CARD}>
      <p className="text-xs font-semibold text-slate-500 mb-2">Câu {index + 1}</p>
      <div className="rounded-lg border border-night-600 bg-night-800 p-3">
        <p className="text-xs font-semibold text-slate-400 mb-1">Câu nguồn</p>
        <Html html={ex.prompt} className="text-sm text-slate-100" />
      </div>
      {hints.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-400 mb-1">Cụm từ gợi ý</p>
          <div className="flex flex-wrap gap-1.5">
            {hints.map((h, i) => (
              <span key={i} className="zh text-sm px-2.5 py-0.5 rounded-full bg-coral-500/15 text-coral-400 border border-coral-500/30">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className={`${INPUT} zh mt-3`}
        placeholder="Viết câu dịch / câu chuyển đổi của bạn..."
        aria-label={`Bài làm câu ${index + 1}`}
      />
      <button type="button" onClick={() => setShowAnswer((v) => !v)} className={`${BTN_PRIMARY} mt-3`}>
        {showAnswer ? 'Ẩn đáp án chuẩn' : 'Xem đáp án chuẩn'}
      </button>
      {showAnswer && (
        <FeedbackBox isCorrect title="Đáp án chuẩn">
          <Html html={ex.answer} className="zh text-slate-200" />
        </FeedbackBox>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- 9. Lập dàn ý */

function OutlineTab({ exercises }) {
  const [values, setValues] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  if (exercises.length === 0) return <Empty>Chưa có bài lập dàn ý.</Empty>;
  return (
    <div className="space-y-4">
      <div className="hidden sm:grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
        <p>Nội dung gợi ý</p>
        <p>Cấu trúc tiếng Trung tương ứng</p>
      </div>
      {exercises.map((ex, i) => (
        <div key={ex.id} className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg border border-night-600 bg-night-900 p-3 text-sm text-slate-200">
            <span className="font-semibold text-coral-400 mr-1">{i + 1}.</span>
            <Html html={ex.prompt} className="inline" />
          </div>
          <div>
            <textarea
              rows={2}
              value={values[ex.id] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [ex.id]: e.target.value }))}
              className={`${INPUT} zh`}
              placeholder="Điền cấu trúc tiếng Trung..."
              aria-label={`Ô điền cho mục ${i + 1}`}
            />
            {showAnswer && ex.answer && (
              <p className="mt-1 text-sm zh text-green-400 whitespace-pre-line">→ {htmlToText(ex.answer).trim()}</p>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setShowAnswer((v) => !v)} className={BTN_PRIMARY}>
        {showAnswer ? 'Ẩn đáp án gợi ý' : 'Xem đáp án gợi ý'}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- 10. Bộ mẫu câu cố định */

function PhraseTable({ phrases }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-night-600">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-night-800 text-slate-300">
            <th className="p-3 text-left w-1/2">Trung văn (中文)</th>
            <th className="p-3 text-left w-1/2">Tiếng Việt</th>
          </tr>
        </thead>
        <tbody>
          {phrases.map((p) => (
            <tr key={p.id} className="border-t border-night-700 align-top">
              <td className="p-3 zh text-slate-100">{p.chinese}</td>
              <td className="p-3 text-slate-300">{p.viExplanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FixedPhrasesTab({ phrases }) {
  if (!phrases || phrases.length === 0) return <Empty>Chưa có mẫu câu cố định.</Empty>;
  return <PhraseTable phrases={phrases} />;
}

/* ---------------------------------------------------------------- Từ vựng */

function VocabTab({ lesson, canSave, showMatching, showSentenceTasks }) {
  const hasVocab = lesson.vocabTerms.length > 0;
  const hasMatch = showMatching && lesson.matchItems.length > 0;
  const hasTasks = showSentenceTasks && lesson.writingTasks.length > 0;
  if (!hasVocab && !hasMatch && !hasTasks) return <Empty />;
  return (
    <div className="space-y-8">
      {hasVocab && (
        <div className="overflow-x-auto rounded-lg border border-night-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-night-900 text-slate-300">
                <th className="p-3 text-left">书面语</th>
                <th className="p-3 text-left">口语</th>
                <th className="p-3 text-left">Nghĩa</th>
                <th className="p-3 text-left">Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              {lesson.vocabTerms.map((v) => (
                <tr key={v.id} className="border-t border-night-700 align-top">
                  <td className="p-3 zh">{v.literary}</td>
                  <td className="p-3 zh">{v.colloquial}</td>
                  <td className="p-3">{v.meaningVi}</td>
                  <td className="p-3 text-slate-400 zh">{v.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasMatch && (
        <div>
          <h3 className="font-semibold mb-2">Ghép từ vựng</h3>
          <MatchBoard lessonId={lesson.id} items={lesson.matchItems} canSave={canSave} />
        </div>
      )}
      {hasTasks && (
        <div className="space-y-4">
          <h3 className="font-semibold">Viết câu</h3>
          {lesson.writingTasks.map((task) => (
            <SentenceTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------- 11/12. Viết hoàn chỉnh & bán phần */

// The 7 standard input slots shared by both writing exercises. A field's role
// comes from its `name` when it matches a known convention (seed lessons use
// names like "audience", "cizhi"...); otherwise its position in the list
// decides, so admin-created fields always land in the right spot on the sheet.
const SLOT_ROLES = ['title', 'greeting', 'body', 'closing1', 'closing2', 'sign', 'date'];
// 'bodyEnd' is no longer a standard slot but is still recognised by name for
// lessons saved with the earlier 8-slot template (rendered as a body paragraph).

const FIELD_ROLE_RULES = [
  { role: 'title', test: (n) => n === 'title' },
  { role: 'bodyEnd', test: (n) => /bodyend|approval|ending/.test(n) },
  { role: 'greeting', test: (n) => /greet|recipient|audience/.test(n) },
  { role: 'closing1', test: (n) => /cizhi|close1|closing1/.test(n) },
  { role: 'closing2', test: (n) => /jingli|close2|closing2/.test(n) },
  { role: 'salute', test: (n) => /salute/.test(n) },
  { role: 'sign', test: (n) => /sign|name|org/.test(n) },
  { role: 'date', test: (n) => n === 'date' },
  { role: 'body', test: (n, f) => n === 'body' || f.inputType === 'textarea' },
];

function nameRole(f) {
  const n = (f.name || '').toLowerCase().trim();
  if (!n && f.inputType !== 'textarea') return null;
  for (const { role, test } of FIELD_ROLE_RULES) {
    if (test(n, f)) return role;
  }
  return null;
}

function resolveRoles(fields) {
  const roles = fields.map(nameRole);
  const used = new Set(roles.filter(Boolean));
  return roles.map((role, idx) => {
    if (role) return role;
    const slot = SLOT_ROLES[idx];
    if (slot && !used.has(slot)) {
      used.add(slot);
      return slot;
    }
    return 'plain';
  });
}

// Each field's typed value is keyed by its own id (or position for unsaved
// fields), never by `name` — two fields sharing a name (e.g. both left blank)
// would otherwise mirror each other's text.
function fieldKey(f, idx) {
  return f.id || `idx-${idx}`;
}

function WritingTab({ lesson }) {
  const fields = useMemo(
    () => lesson.guidedWritingFields.filter((f) => !f.group || f.group === 'writing'),
    [lesson.guidedWritingFields]
  );
  const scenarios = useMemo(
    () => lesson.guidedWritingScenarios.filter((s) => !s.group || s.group === 'writing'),
    [lesson.guidedWritingScenarios]
  );
  return <GuidedWritingForm fields={fields} scenarios={scenarios} />;
}

function PartialWritingTab({ lesson }) {
  const fields = useMemo(
    () => lesson.guidedWritingFields.filter((f) => f.group === 'partial_writing'),
    [lesson.guidedWritingFields]
  );
  const scenarios = useMemo(
    () => lesson.guidedWritingScenarios.filter((s) => s.group === 'partial_writing'),
    [lesson.guidedWritingScenarios]
  );
  return <GuidedWritingForm fields={fields} scenarios={scenarios} />;
}

function GuidedWritingForm({ fields: guidedWritingFields, scenarios }) {
  const [values, setValues] = useState({});
  const [showModel, setShowModel] = useState(false);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = scenarios[scenarioIdx];

  const roles = useMemo(() => resolveRoles(guidedWritingFields), [guidedWritingFields]);

  function valueOfRole(role) {
    const idx = roles.indexOf(role);
    return idx >= 0 ? values[fieldKey(guidedWritingFields[idx], idx)] ?? '' : '';
  }

  const saluteOn = !!valueOfRole('salute');
  const paragraphs = [...toParagraphs(valueOfRole('body')), ...toParagraphs(valueOfRole('bodyEnd'))];
  const extraLines = guidedWritingFields
    .map((f, idx) => (roles[idx] === 'plain' ? values[fieldKey(f, idx)] : null))
    .filter((v) => typeof v === 'string' && v.trim());
  const closing1 = roles.includes('closing1') ? valueOfRole('closing1') : saluteOn ? '此致' : '';
  const closing2 = roles.includes('closing2') ? valueOfRole('closing2') : saluteOn ? '敬礼！' : '';

  const totalHanzi = countHanzi(Object.values(values).filter((v) => typeof v === 'string').join(''));
  const target = scenario?.targetWordCount;
  const counterClass =
    totalHanzi === 0
      ? 'bg-night-800 border-night-600 text-slate-400'
      : target && totalHanzi < target * 0.8
      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
      : 'bg-green-500/10 border-green-500 text-green-400';

  if (guidedWritingFields.length === 0) return <Empty />;

  return (
    <div className="space-y-5">
      {scenario && (
        <div className="rounded-lg border border-night-600 bg-night-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-slate-400">
              Đề bài{scenarios.length > 1 ? ` ${scenarioIdx + 1}/${scenarios.length}` : ''}
            </p>
            {scenarios.length > 1 && (
              <div className="flex gap-1">
                {scenarios.map((s, i) => (
                  <button
                    key={s.id || i}
                    type="button"
                    onClick={() => {
                      setScenarioIdx(i);
                      setShowModel(false);
                    }}
                    aria-pressed={i === scenarioIdx}
                    className={`w-7 h-7 rounded-md text-xs font-bold ${
                      i === scenarioIdx ? 'bg-coral-500 text-white' : 'bg-night-800 border border-night-600 text-slate-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Html html={scenario.situationPrompt} className="text-sm text-slate-200 leading-7" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          {guidedWritingFields.map((f, idx) => {
            const key = fieldKey(f, idx);
            const id = `gw-${key}`;
            return (
              <div key={key}>
                <label htmlFor={id} className="text-sm text-slate-300 block mb-1">
                  <span className="font-semibold text-slate-200">Ô {idx + 1}</span> · {f.label}
                </label>
                {f.inputType === 'textarea' ? (
                  <textarea
                    id={id}
                    placeholder={f.placeholder}
                    value={values[key] || ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={5}
                    className={`${INPUT} zh`}
                  />
                ) : f.inputType === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!values[key]}
                      onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    {f.placeholder}
                  </label>
                ) : (
                  <input
                    id={id}
                    placeholder={f.placeholder}
                    value={values[key] || ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={`${INPUT} zh`}
                  />
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border tabular-nums ${counterClass}`}
              aria-live="polite"
            >
              {totalHanzi}
              {target ? ` / ${target}` : ''} chữ Hán
            </span>
            <div className="flex gap-2 ml-auto">
              {scenario?.modelAnswer && (
                <button type="button" onClick={() => setShowModel((v) => !v)} className={BTN_PRIMARY}>
                  {showModel ? 'Ẩn đáp án mẫu' : 'Đáp án mẫu'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setValues({})}
                disabled={Object.keys(values).length === 0}
                className={BTN_SECONDARY}
              >
                Xoá trắng
              </button>
            </div>
          </div>
        </form>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">Tờ giấy mô phỏng (real-time)</p>
          <LetterPaper
            title={valueOfRole('title')}
            greeting={valueOfRole('greeting')}
            paragraphs={paragraphs}
            extraLines={extraLines}
            closing1={closing1}
            closing2={closing2}
            sign={valueOfRole('sign')}
            date={valueOfRole('date')}
          />
        </div>
      </div>

      {showModel && scenario?.modelAnswer && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-200">Đáp án mẫu</p>
            <HanziCount count={countHanzi(htmlToText(scenario.modelAnswer))} />
          </div>
          <LetterPaper html={scenario.modelAnswer} minHeight="" />
        </div>
      )}
    </div>
  );
}

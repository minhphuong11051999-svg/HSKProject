import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLesson, submitExercise } from '../api/lessons';
import { useAuth } from '../context/AuthContext';
import PremiumModal from '../components/PremiumModal';
import { LESSON_PARTS } from '../constants/lessonParts';

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
    getLesson(slug).then(setLesson).finally(() => setLoading(false));
  }, [slug]);

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-64 flex-shrink-0">
        <p className="zh text-xl mb-1">{lesson.titleZh}</p>
        <h1 className="font-semibold mb-4">{lesson.titleVi}</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {LESSON_PARTS.map((t) => (
            <button
              key={t.key}
              onClick={() => goToTab(t)}
              className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.key ? 'bg-coral-500 text-white' : 'bg-night-800 border border-night-700'
              }`}
            >
              {t.label}
              {isPartPremium(t.key) && !isPremiumUser && <span className="text-xs">🔒</span>}
            </button>
          ))}
        </nav>
      </aside>

      <PremiumModal open={showTabPremium} onClose={() => setShowTabPremium(false)} />

      <section className="flex-1 bg-night-800 border border-night-700 rounded-xl p-6">
        {tab === 'theory' && <TheoryTab lesson={lesson} />}
        {tab === 'samples' && <SamplesTab lesson={lesson} />}
        {tab === 'quiz' && <QuizTab lessonId={lesson.id} questions={theoryQuestions} canSave={!!user} />}
        {tab === 'cloze' && <ClozeTab lessonId={lesson.id} exercises={lesson.clozeExercises} canSave={!!user} />}
        {tab === 'error' && <QuizTab lessonId={lesson.id} questions={errorQuestions} canSave={!!user} showDraft />}
        {tab === 'vocab' && <VocabTab lesson={lesson} canSave={!!user} />}
        {tab === 'writing' && <WritingTab lesson={lesson} />}
      </section>
    </main>
  );
}

function TheoryTab({ lesson }) {
  return (
    <div className="space-y-8">
      {lesson.description && <p className="text-slate-300">{lesson.description}</p>}

      {lesson.sections.map((s) => (
        <div key={s.id}>
          <h3 className="font-semibold mb-2">{s.heading}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
        </div>
      ))}

      {lesson.fixedPhrases.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Bộ mẫu câu cố định — 书面语 (套语)</h3>
          <table className="w-full text-sm border border-night-600">
            <thead>
              <tr className="bg-night-900">
                <th className="p-2 text-left">中文</th>
                <th className="p-2 text-left">Tiếng Việt</th>
              </tr>
            </thead>
            <tbody>
              {lesson.fixedPhrases.map((p) => (
                <tr key={p.id} className="border-b border-night-700">
                  <td className="p-2 zh">{p.chinese}</td>
                  <td className="p-2 text-slate-300">{p.viExplanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SamplesTab({ lesson }) {
  if (lesson.sampleDocuments.length === 0) {
    return <p className="text-slate-400">Chưa có bài mẫu cho phần này.</p>;
  }

  return (
    <div className="grid gap-4">
      {lesson.sampleDocuments.map((doc, idx) => (
        <article key={doc.id} className="border border-night-700 bg-night-900 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Bài mẫu {idx + 1}{doc.label ? ` · ${doc.label}` : ''}</p>
          {doc.audience && <p className="text-sm">{doc.audience}</p>}
          <div className="whitespace-pre-line mt-2 text-sm zh">{doc.body}</div>
          {(doc.signerOrg || doc.date) && (
            <p className="text-right text-xs text-slate-400 mt-2">
              {doc.signerOrg} {doc.date}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function QuizTab({ lessonId, questions, canSave, showDraft }) {
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState({});

  async function check(question) {
    const selectedIndex = selected[question.id];
    if (selectedIndex === undefined || !canSave) return;
    setChecking((prev) => ({ ...prev, [question.id]: true }));
    try {
      const res = await submitExercise({
        lessonId,
        exerciseType: 'quiz',
        exerciseId: question.id,
        answerPayload: { selectedIndex },
      });
      setResults((prev) => ({ ...prev, [question.id]: res.feedback }));
    } catch {
      // ignore network errors, let the user retry
    } finally {
      setChecking((prev) => ({ ...prev, [question.id]: false }));
    }
  }

  if (questions.length === 0) return <p className="text-slate-400">Chưa có câu hỏi cho phần này.</p>;

  return (
    <div className="space-y-6">
      {questions.map((q) => {
        const result = results[q.id];
        return (
          <div key={q.id} className="border border-night-700 rounded-lg p-4">
            <p className="font-semibold">{q.title}</p>
            {showDraft && q.draftHtml && (
              <div
                className="my-3 text-sm bg-night-900 p-3 rounded"
                dangerouslySetInnerHTML={{ __html: result ? q.draftHtmlMarked || q.draftHtml : q.draftHtml }}
              />
            )}
            <p className="mt-2 text-sm">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.text;
                let optionClass = '';
                if (result) {
                  if (idx === result.correctIndex) optionClass = 'text-green-400 font-semibold';
                  else if (idx === selected[q.id]) optionClass = 'text-red-400';
                }
                return (
                  <label key={idx} className={`flex items-center gap-2 text-sm ${optionClass}`}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected[q.id] === idx}
                      disabled={!!result}
                      onChange={() => setSelected((prev) => ({ ...prev, [q.id]: idx }))}
                    />
                    {text}
                  </label>
                );
              })}
            </div>
            {!result && (
              <button
                onClick={() => check(q)}
                disabled={checking[q.id]}
                className="mt-3 text-sm bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {checking[q.id] ? 'Đang kiểm tra...' : 'Kiểm tra'}
              </button>
            )}
            {result && (
              <div className="mt-3 text-sm">
                <p className={result.isCorrect ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {result.isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng.'}
                </p>
                {result.explanation && <p className="mt-1 text-slate-400">{result.explanation}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClozeTab({ lessonId, exercises, canSave }) {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  async function check(exercise) {
    const chosen = answers[exercise.id] || {};
    if (!canSave) return;
    try {
      const res = await submitExercise({
        lessonId,
        exerciseType: 'cloze',
        exerciseId: exercise.id,
        answerPayload: { answers: chosen },
      });
      setResults((prev) => ({ ...prev, [exercise.id]: res.feedback }));
    } catch {
      // ignore, user can retry
    }
  }

  if (!exercises || exercises.length === 0) return <p className="text-slate-400">Chưa có bài tập điền khuyết.</p>;

  return (
    <div className="space-y-6">
      {exercises.map((ex) => {
        const result = results[ex.id];
        return (
          <div key={ex.id} className="border border-night-700 rounded-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: ex.templateHtml }} />
            <div className="mt-3 flex flex-wrap gap-3">
              {ex.blanks.map((b) => {
                const chosen = answers[ex.id]?.[b.id] || '';
                const correctAnswer = result?.correctAnswers?.[b.id];
                const isRight = result && chosen === correctAnswer;
                return (
                  <div key={b.id} className="flex flex-col items-start gap-1">
                    <select
                      value={chosen}
                      disabled={!!result}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [ex.id]: { ...prev[ex.id], [b.id]: e.target.value } }))
                      }
                      className={`bg-night-900 border rounded px-2 py-1 text-sm text-slate-100 ${
                        result ? (isRight ? 'border-green-500' : 'border-red-500') : 'border-night-600'
                      }`}
                    >
                      <option value="">Chọn...</option>
                      {b.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {result && !isRight && <span className="text-xs text-green-400">Đáp án: {correctAnswer}</span>}
                  </div>
                );
              })}
            </div>
            {!result && (
              <button
                onClick={() => check(ex)}
                className="mt-3 text-sm bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Kiểm tra
              </button>
            )}
            {result && (
              <p className="mt-2 text-sm font-semibold text-coral-400">
                Kết quả: {result.score}/{result.maxScore}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VocabTab({ lesson, canSave }) {
  return (
    <div className="space-y-8">
      {lesson.vocabTerms.length > 0 && (
        <table className="w-full text-sm border border-night-600">
          <thead>
            <tr className="bg-night-900">
              <th className="p-2 text-left">书面语</th>
              <th className="p-2 text-left">口语</th>
              <th className="p-2 text-left">Nghĩa</th>
              <th className="p-2 text-left">Ví dụ</th>
            </tr>
          </thead>
          <tbody>
            {lesson.vocabTerms.map((v) => (
              <tr key={v.id} className="border-b border-night-700">
                <td className="p-2 zh">{v.literary}</td>
                <td className="p-2">{v.colloquial}</td>
                <td className="p-2">{v.meaningVi}</td>
                <td className="p-2 text-slate-400">{v.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lesson.matchItems.length > 0 && (
        <MatchBoard lessonId={lesson.id} items={lesson.matchItems} canSave={canSave} />
      )}

      {lesson.writingTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Viết câu</h3>
          {lesson.writingTasks.map((task) => (
            <WritingTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
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
  const rightItems = useMemo(
    () => shuffle(items.map((it) => ({ id: it.id, text: it.rightLabelZh }))),
    [items]
  );
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [pairs, setPairs] = useState({});
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);
  const done = Object.keys(results).length > 0;

  const pairedRightIds = new Set(Object.values(pairs));

  function clickLeft(item) {
    if (done || pairs[item.id]) return;
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
    selected: 'border-coral-500 bg-night-900 ring-1 ring-coral-500',
    paired: 'border-slate-500 bg-night-700 opacity-70',
    correct: 'border-green-500 bg-green-500/10 text-green-400',
    wrong: 'border-red-500 bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Ghép từ vựng</h3>
      <p className="text-xs text-slate-500">Chọn 1 thẻ ở cột trái rồi chọn thẻ tương ứng ở cột phải để ghép cặp.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Cột A (Tiếng Việt)</p>
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => clickLeft(item)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${statusClass[leftStatus(item)]}`}
            >
              <b>{idx + 1}.</b> {item.leftLabelVi}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Cột B (Chữ Hán)</p>
          {rightItems.map((rightItem, idx) => (
            <button
              key={rightItem.id}
              type="button"
              onClick={() => clickRight(rightItem)}
              className={`w-full text-left text-sm zh px-3 py-2 rounded-lg border transition-colors ${statusClass[rightStatus(rightItem)]}`}
            >
              <b>{String.fromCharCode(65 + idx)}.</b> {rightItem.text}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!done ? (
          <button
            onClick={checkAll}
            disabled={checking || Object.keys(pairs).length === 0}
            className="text-sm bg-coral-500 hover:bg-coral-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra'}
          </button>
        ) : (
          <button onClick={reset} className="text-sm bg-night-700 hover:bg-night-600 text-slate-100 px-3 py-1.5 rounded-lg transition-colors">
            ↺ Thử lại
          </button>
        )}
      </div>
      {done && (
        <div className="text-sm bg-night-900 border border-night-700 rounded-lg p-3 space-y-1">
          {items.map((item) => (
            <p key={item.id} className={results[item.id]?.isCorrect ? 'text-green-400' : 'text-red-400'}>
              {item.leftLabelVi} → <span className="zh">{results[item.id]?.correctKey}</span>
              {results[item.id]?.explanation ? ` (${results[item.id].explanation})` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function WritingTaskCard({ task }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div className="border border-night-700 rounded-lg p-4">
      <p className="font-semibold text-sm">{task.title}</p>
      {task.hint && <p className="text-xs text-slate-400 mt-1">Gợi ý: {task.hint}</p>}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full bg-night-900 border border-night-600 rounded-lg px-3 py-2 mt-2 text-sm text-slate-100 placeholder-slate-500"
        placeholder="Viết câu của bạn..."
      />
      <button onClick={() => setShowAnswer((v) => !v)} className="mt-2 text-sm text-coral-400 underline">
        {showAnswer ? 'Ẩn đáp án tham khảo' : 'Xem đáp án tham khảo'}
      </button>
      {showAnswer && <p className="mt-2 text-sm bg-night-900 p-2 rounded">{task.referenceAnswer}</p>}
    </div>
  );
}

// Field "name" conventions used across lessons to drive the shared letter-paper
// layout (see guidedWritingFields seed data for the lessons already authored).
const FIELD_ROLE_RULES = [
  { role: 'title', test: (n) => n === 'title' },
  { role: 'greeting', test: (n) => /greet|recipient|audience/.test(n) },
  { role: 'closing1', test: (n) => /cizhi|close1|closing1/.test(n) },
  { role: 'closing2', test: (n) => /jingli|close2|closing2/.test(n) },
  { role: 'salute', test: (n) => /salute/.test(n) },
  { role: 'sign', test: (n) => /sign|name|org/.test(n) },
  { role: 'date', test: (n) => n === 'date' },
  { role: 'body', test: (n, f) => n === 'body' || f.inputType === 'textarea' },
];

function fieldRole(f) {
  const n = f.name.toLowerCase();
  for (const { role, test } of FIELD_ROLE_RULES) {
    if (test(n, f)) return role;
  }
  return 'plain';
}

function countHanzi(text) {
  return (text.match(/[一-鿿]/g) || []).length;
}

// 2-character Chinese names/titles are conventionally spaced out (明芳 -> 明 芳);
// 3+ characters are written normally.
function spaceOutIfTwoChars(text) {
  const trimmed = (text || '').trim();
  const chars = Array.from(trimmed.replace(/\s+/g, ''));
  if (chars.length === 2 && countHanzi(chars.join('')) === 2) {
    return chars.join(' ');
  }
  return trimmed;
}

function WritingTab({ lesson }) {
  const [fields, setFields] = useState({});
  const [showModel, setShowModel] = useState(false);

  const byRole = useMemo(() => {
    const map = {};
    for (const f of lesson.guidedWritingFields) {
      (map[fieldRole(f)] ||= []).push(f);
    }
    return map;
  }, [lesson.guidedWritingFields]);

  const titleField = byRole.title?.[0];
  const greetingField = byRole.greeting?.[0];
  const bodyField = byRole.body?.[0];
  const closing1Field = byRole.closing1?.[0];
  const closing2Field = byRole.closing2?.[0];
  const saluteField = byRole.salute?.[0];
  const signField = byRole.sign?.[0];
  const dateField = byRole.date?.[0];
  const otherFields = byRole.plain || [];

  const title = spaceOutIfTwoChars(titleField ? fields[titleField.name] || '' : '');
  const greeting = greetingField ? fields[greetingField.name] || '' : '';
  const body = bodyField ? fields[bodyField.name] || '' : '';
  const paragraphs = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const sign = spaceOutIfTwoChars(signField ? fields[signField.name] || '' : '');
  const date = dateField ? fields[dateField.name] || '' : '';
  const saluteOn = saluteField ? !!fields[saluteField.name] : false;
  const closing1Text = closing1Field ? fields[closing1Field.name] || '' : saluteOn ? '此致' : '';
  const closing2Text = closing2Field ? fields[closing2Field.name] || '' : saluteOn ? '敬礼！' : '';

  const totalHanzi = countHanzi(Object.values(fields).join(''));
  const counterClass =
    totalHanzi === 0
      ? 'bg-night-800 border-night-600 text-slate-400'
      : totalHanzi < 80
      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
      : totalHanzi <= 180
      ? 'bg-green-500/10 border-green-500 text-green-400'
      : 'bg-red-500/10 border-red-500 text-red-400';

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form className="space-y-3">
        {lesson.guidedWritingFields.map((f) => (
          <div key={f.id}>
            <label className="text-sm text-slate-300 block mb-1">{f.label}</label>
            {f.inputType === 'textarea' ? (
              <textarea
                placeholder={f.placeholder}
                value={fields[f.name] || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                rows={4}
                className="w-full bg-night-900 border border-night-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
              />
            ) : f.inputType === 'checkbox' ? (
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={!!fields[f.name]}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.checked }))}
                />
                {f.placeholder}
              </label>
            ) : (
              <input
                placeholder={f.placeholder}
                value={fields[f.name] || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className="w-full bg-night-900 border border-night-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
              />
            )}
          </div>
        ))}
        <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${counterClass}`}>
          {totalHanzi} chữ Hán
        </span>
      </form>

      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">Tờ giấy mô phỏng (real-time)</p>
        <div className="letter-paper rounded-lg p-6 sm:p-8 text-sm zh leading-8 min-h-[22rem]">
          {title && <p className="text-center font-bold mb-3">{title}</p>}
          {greeting && <p className="text-left mb-2">{greeting}</p>}
          {paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {p}
            </p>
          ))}
          {otherFields.map((f) =>
            fields[f.name] ? (
              <p key={f.name} className="mt-2">
                {fields[f.name]}
              </p>
            ) : null
          )}
          {(closing1Text || closing2Text) && (
            <div className="mt-3">
              {closing1Text && <p style={{ textIndent: '4em' }}>{closing1Text}</p>}
              {closing2Text && <p>{closing2Text}</p>}
            </div>
          )}
          {(sign || date) && (
            <div className="flex justify-end mt-8">
              <div className="inline-flex flex-col items-center">
                <p>{sign || ' '}</p>
                <p className="mt-1">{date || ' '}</p>
              </div>
            </div>
          )}
        </div>

        {lesson.guidedWritingScenarios.map((sc) => (
          <div key={sc.id} className="mt-4 pt-4 border-t border-night-700">
            <p className="text-xs text-slate-400">{sc.situationPrompt}</p>
            <button onClick={() => setShowModel((v) => !v)} className="mt-2 text-sm text-coral-400 underline">
              {showModel ? 'Ẩn bài mẫu' : 'Xem bài mẫu tham khảo'}
            </button>
            {showModel && <p className="mt-2 text-sm whitespace-pre-line">{sc.modelAnswer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

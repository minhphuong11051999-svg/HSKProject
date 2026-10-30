import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLesson, submitExercise } from '../api/lessons';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'guide', label: '📖 Hướng dẫn & bài mẫu' },
  { key: 'quiz', label: '① Nhận diện thể thức' },
  { key: 'cloze', label: '② Đục lỗ tái lập văn bản' },
  { key: 'error', label: '③ Phân tích khuyết thiếu & sửa lỗi' },
  { key: 'vocab', label: '④ Ghép từ vựng & viết câu' },
  { key: 'writing', label: '⑤ Luyện viết hoàn chỉnh' },
];

export default function LessonPlayer() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [tab, setTab] = useState('guide');
  const [loading, setLoading] = useState(true);

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
        <p className="mt-4 text-slate-400">🔒 Đây là nội dung nâng cao, cần nâng cấp tài khoản để mở khoá.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-64 flex-shrink-0">
        <p className="zh text-xl mb-1">{lesson.titleZh}</p>
        <h1 className="font-semibold mb-4">{lesson.titleVi}</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                tab === t.key ? 'bg-coral-500 text-white' : 'bg-night-800 border border-night-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-1 bg-night-800 border border-night-700 rounded-xl p-6">
        {tab === 'guide' && <GuideTab lesson={lesson} />}
        {tab === 'quiz' && <QuizTab lessonId={lesson.id} questions={theoryQuestions} canSave={!!user} />}
        {tab === 'cloze' && <ClozeTab lessonId={lesson.id} exercises={lesson.clozeExercises} canSave={!!user} />}
        {tab === 'error' && <QuizTab lessonId={lesson.id} questions={errorQuestions} canSave={!!user} showDraft />}
        {tab === 'vocab' && <VocabTab lesson={lesson} canSave={!!user} />}
        {tab === 'writing' && <WritingTab lesson={lesson} />}
      </section>
    </main>
  );
}

function GuideTab({ lesson }) {
  return (
    <div className="space-y-8">
      {lesson.description && <p className="text-slate-300">{lesson.description}</p>}

      {lesson.sections.map((s) => (
        <div key={s.id}>
          <h3 className="font-semibold mb-2">{s.heading}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
        </div>
      ))}

      {lesson.sampleDocuments.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Bài mẫu</h3>
          <div className="grid gap-4">
            {lesson.sampleDocuments.map((doc) => (
              <article key={doc.id} className="border border-night-700 bg-night-900 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-1">{doc.label}</p>
                {doc.audience && <p className="text-sm">{doc.audience}</p>}
                <div className="whitespace-pre-line mt-2 text-sm">{doc.body}</div>
                {(doc.signerOrg || doc.date) && (
                  <p className="text-right text-xs text-slate-400 mt-2">
                    {doc.signerOrg} {doc.date}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {lesson.fixedPhrases.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Mẫu câu cố định (套语)</h3>
          <table className="w-full text-sm border border-night-600">
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
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});

  async function check(item) {
    if (!canSave) return;
    try {
      const res = await submitExercise({
        lessonId: lesson.id,
        exerciseType: 'match',
        exerciseId: item.id,
        answerPayload: { selectedKey: selected[item.id] },
      });
      setResults((prev) => ({ ...prev, [item.id]: res.feedback }));
    } catch {
      // ignore, user can retry
    }
  }

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
        <div className="space-y-3">
          <h3 className="font-semibold">Ghép từ vựng</h3>
          {lesson.matchItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm w-40">{item.leftLabelVi}</span>
              <select
                value={selected[item.id] || ''}
                disabled={!!results[item.id]}
                onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="bg-night-900 border border-night-600 rounded px-2 py-1 text-sm text-slate-100"
              >
                <option value="">Chọn...</option>
                <option value={item.rightLabelZh}>{item.rightLabelZh}</option>
              </select>
              {!results[item.id] && (
                <button onClick={() => check(item)} className="text-sm text-coral-400 underline">
                  Kiểm tra
                </button>
              )}
              {results[item.id] && (
                <span className="text-sm">
                  {results[item.id].isCorrect
                    ? '✅'
                    : `❌ Đáp án đúng: ${results[item.id].correctKey}${
                        results[item.id].explanation ? ` (${results[item.id].explanation})` : ''
                      }`}
                </span>
              )}
            </div>
          ))}
        </div>
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

function WritingTab({ lesson }) {
  const [fields, setFields] = useState({});
  const [showModel, setShowModel] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-6">
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
      </form>

      <div className="border border-night-700 bg-night-900 rounded-lg p-4">
        <p className="text-xs text-slate-400 mb-2">Xem trước bản nháp</p>
        <div className="whitespace-pre-line text-sm">
          {lesson.guidedWritingFields.map((f) => fields[f.name]).filter(Boolean).join('\n\n') ||
            'Nhập nội dung bên trái để xem bản nháp...'}
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

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

  if (loading) return <p className="text-center py-10 text-slate-500">Đang tải...</p>;
  if (!lesson) return <p className="text-center py-10 text-slate-500">Không tìm thấy bài học.</p>;
  if (lesson.locked) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="zh text-2xl">{lesson.titleZh}</p>
        <h1 className="text-xl font-bold mt-2">{lesson.titleVi}</h1>
        <p className="mt-4 text-slate-500">🔒 Đây là nội dung nâng cao, cần nâng cấp tài khoản để mở khoá.</p>
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
                tab === t.key ? 'bg-indigo-900 text-white' : 'bg-white border border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-1 bg-white border border-slate-300 rounded-xl p-6">
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
      {lesson.description && <p className="text-slate-600">{lesson.description}</p>}

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
              <article key={doc.id} className="border border-paperline bg-paper rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">{doc.label}</p>
                {doc.audience && <p className="text-sm">{doc.audience}</p>}
                <div className="whitespace-pre-line mt-2 text-sm">{doc.body}</div>
                {(doc.signerOrg || doc.date) && (
                  <p className="text-right text-xs text-slate-500 mt-2">
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
          <table className="w-full text-sm border border-slate-300">
            <tbody>
              {lesson.fixedPhrases.map((p) => (
                <tr key={p.id} className="border-b border-slate-200">
                  <td className="p-2 zh">{p.chinese}</td>
                  <td className="p-2 text-slate-600">{p.viExplanation}</td>
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
  const [checked, setChecked] = useState({});

  async function check(question) {
    const selectedIndex = selected[question.id];
    if (selectedIndex === undefined) return;
    setChecked((prev) => ({ ...prev, [question.id]: true }));
    if (canSave) {
      await submitExercise({
        lessonId,
        exerciseType: 'quiz',
        exerciseId: question.id,
        answerPayload: { selectedIndex },
      }).catch(() => {});
    }
  }

  if (questions.length === 0) return <p className="text-slate-500">Chưa có câu hỏi cho phần này.</p>;

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="border border-slate-200 rounded-lg p-4">
          <p className="font-semibold">{q.title}</p>
          {showDraft && q.draftHtml && (
            <div
              className="my-3 text-sm bg-slate-50 p-3 rounded"
              dangerouslySetInnerHTML={{ __html: checked[q.id] ? q.draftHtmlMarked || q.draftHtml : q.draftHtml }}
            />
          )}
          <p className="mt-2 text-sm">{q.prompt}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={selected[q.id] === idx}
                  onChange={() => setSelected((prev) => ({ ...prev, [q.id]: idx }))}
                />
                {typeof opt === 'string' ? opt : opt.text}
              </label>
            ))}
          </div>
          <button onClick={() => check(q)} className="mt-3 text-sm bg-indigo-900 text-white px-3 py-1.5 rounded-lg">
            Kiểm tra
          </button>
        </div>
      ))}
    </div>
  );
}

function ClozeTab({ lessonId, exercises, canSave }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState({});

  async function check(exercise) {
    const chosen = answers[exercise.id] || {};
    const blanks = exercise.blanks;
    let correct = 0;
    blanks.forEach((b) => {
      if (chosen[b.id] === b.answer) correct += 1;
    });
    setResult((prev) => ({ ...prev, [exercise.id]: `${correct}/${blanks.length}` }));
    if (canSave) {
      await submitExercise({
        lessonId,
        exerciseType: 'cloze',
        exerciseId: exercise.id,
        answerPayload: { answers: chosen },
      }).catch(() => {});
    }
  }

  if (!exercises || exercises.length === 0) return <p className="text-slate-500">Chưa có bài tập điền khuyết.</p>;

  return (
    <div className="space-y-6">
      {exercises.map((ex) => (
        <div key={ex.id} className="border border-slate-200 rounded-lg p-4">
          <div dangerouslySetInnerHTML={{ __html: ex.templateHtml }} />
          <div className="mt-3 flex flex-wrap gap-3">
            {ex.blanks.map((b) => (
              <select
                key={b.id}
                value={answers[ex.id]?.[b.id] || ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [ex.id]: { ...prev[ex.id], [b.id]: e.target.value } }))
                }
                className="border border-slate-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Chọn...</option>
                {b.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <button onClick={() => check(ex)} className="mt-3 text-sm bg-indigo-900 text-white px-3 py-1.5 rounded-lg">
            Kiểm tra
          </button>
          {result[ex.id] && <p className="mt-2 text-sm font-semibold">Kết quả: {result[ex.id]}</p>}
        </div>
      ))}
    </div>
  );
}

function VocabTab({ lesson, canSave }) {
  const [selected, setSelected] = useState({});
  const [checked, setChecked] = useState({});

  async function check(item) {
    setChecked((prev) => ({ ...prev, [item.id]: true }));
    if (canSave) {
      await submitExercise({
        lessonId: lesson.id,
        exerciseType: 'match',
        exerciseId: item.id,
        answerPayload: { selectedKey: selected[item.id] },
      }).catch(() => {});
    }
  }

  return (
    <div className="space-y-8">
      {lesson.vocabTerms.length > 0 && (
        <table className="w-full text-sm border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-2 text-left">书面语</th>
              <th className="p-2 text-left">口语</th>
              <th className="p-2 text-left">Nghĩa</th>
              <th className="p-2 text-left">Ví dụ</th>
            </tr>
          </thead>
          <tbody>
            {lesson.vocabTerms.map((v) => (
              <tr key={v.id} className="border-b border-slate-200">
                <td className="p-2 zh">{v.literary}</td>
                <td className="p-2">{v.colloquial}</td>
                <td className="p-2">{v.meaningVi}</td>
                <td className="p-2 text-slate-500">{v.example}</td>
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
                onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="border border-slate-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Chọn...</option>
                <option value={item.rightLabelZh}>{item.rightLabelZh}</option>
              </select>
              <button onClick={() => check(item)} className="text-sm text-indigo-600 underline">
                Kiểm tra
              </button>
              {checked[item.id] && (
                <span className="text-sm">
                  {selected[item.id] === item.correctKey ? '✅' : `❌ (${item.explanation || ''})`}
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
    <div className="border border-slate-200 rounded-lg p-4">
      <p className="font-semibold text-sm">{task.title}</p>
      {task.hint && <p className="text-xs text-slate-500 mt-1">Gợi ý: {task.hint}</p>}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 text-sm"
        placeholder="Viết câu của bạn..."
      />
      <button onClick={() => setShowAnswer((v) => !v)} className="mt-2 text-sm text-indigo-600 underline">
        {showAnswer ? 'Ẩn đáp án tham khảo' : 'Xem đáp án tham khảo'}
      </button>
      {showAnswer && <p className="mt-2 text-sm bg-slate-50 p-2 rounded">{task.referenceAnswer}</p>}
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
            <label className="text-sm text-slate-600 block mb-1">{f.label}</label>
            {f.inputType === 'textarea' ? (
              <textarea
                placeholder={f.placeholder}
                value={fields[f.name] || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <input
                placeholder={f.placeholder}
                value={fields[f.name] || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </form>

      <div className="border border-paperline bg-paper rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-2">Xem trước bản nháp</p>
        <div className="whitespace-pre-line text-sm">
          {lesson.guidedWritingFields.map((f) => fields[f.name]).filter(Boolean).join('\n\n') ||
            'Nhập nội dung bên trái để xem bản nháp...'}
        </div>

        {lesson.guidedWritingScenarios.map((sc) => (
          <div key={sc.id} className="mt-4 pt-4 border-t border-paperline">
            <p className="text-xs text-slate-500">{sc.situationPrompt}</p>
            <button onClick={() => setShowModel((v) => !v)} className="mt-2 text-sm text-indigo-600 underline">
              {showModel ? 'Ẩn bài mẫu' : 'Xem bài mẫu tham khảo'}
            </button>
            {showModel && <p className="mt-2 text-sm whitespace-pre-line">{sc.modelAnswer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

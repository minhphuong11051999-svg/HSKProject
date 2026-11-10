import { useRef, useState } from 'react';
import Repeater from './Repeater';
import { INPUT, LABEL_TEXT, BTN_TOOL, BTN_TOOL_DANGER, CHECKBOX } from './ui';
import { TextField, TextAreaField } from './fields';

const QUESTION_KINDS = [
  ['choice', '1 · Trắc nghiệm nhận diện & cụm từ'],
  ['fill', '2 · Điền từ vào câu'],
  ['translate', '3 · Dịch câu Việt → Trung'],
  ['listen', '4 · Luyện nghe'],
];

function emptyQuestion(kind) {
  return {
    kind,
    prompt: '',
    options: ['', '', '', ''],
    answer: 0,
    ...(kind === 'listen' ? { audioZh: '', audioVi: '', audioUrl: '' } : {}),
  };
}

function emptyCard() {
  return {
    word: '',
    pinyin: '',
    meaning: '',
    partOfSpeech: '',
    imageUrl: '',
    audioUrl: '',
    phrases: ['', ''],
    exampleZh: '',
    exampleVi: '',
    questions: QUESTION_KINDS.map(([k]) => emptyQuestion(k)),
  };
}

// Downscale an uploaded picture to ≤480px WebP so it can live inside the lesson
// JSON without bloating every lesson download.
function fileToSmallDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (file.type === 'image/svg+xml') return resolve(reader.result);
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 480 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ImageField({ value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div className="mb-3">
      <p className={LABEL_TEXT}>③ Hình ảnh (mặt trước, bên phải trên)</p>
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-night-600 flex-shrink-0">
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-500">Chưa có</span>}
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={BTN_TOOL}
            >
              Tải ảnh lên
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className={BTN_TOOL_DANGER}>
                Xoá ảnh
              </button>
            )}
          </div>
          <input
            value={value?.startsWith('data:') ? '' : value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={value?.startsWith('data:') ? 'Đang dùng ảnh tải lên' : '…hoặc dán link ảnh (https://...)'}
            aria-label="Link ảnh"
            className={INPUT}
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onChange(await fileToSmallDataUrl(file));
        }}
      />
    </div>
  );
}

const MAX_AUDIO_BYTES = 300 * 1024;

// Short pronunciation clip stored inline (data URL) or linked by URL. Left empty,
// the game falls back to the browser's Chinese text-to-speech voice.
function AudioField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const isUpload = value?.startsWith('data:');
  return (
    <div className="mb-3">
      <p className={LABEL_TEXT}>{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={BTN_TOOL}
        >
          Tải file âm thanh
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              setError('');
              onChange('');
            }}
            className={BTN_TOOL_DANGER}
          >
            Xoá âm thanh
          </button>
        )}
        <input
          value={isUpload ? '' : value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isUpload ? 'Đang dùng file tải lên' : '…hoặc dán link file (https://...mp3)'}
          aria-label="Link file âm thanh"
          className={`${INPUT} flex-1 min-w-[12rem]`}
        />
      </div>
      {value && <audio controls src={value} className="mt-2 h-9 w-full max-w-sm" />}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[color:var(--c-hint-text)]" role="alert">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-slate-500">
          mp3 / m4a / wav, tối đa 300KB (khoảng 10–20 giây). Để trống thì dùng giọng đọc của trình duyệt.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          if (file.size > MAX_AUDIO_BYTES) {
            setError(`File nặng ${Math.round(file.size / 1024)}KB — vượt giới hạn 300KB. Hãy cắt ngắn / nén lại, hoặc dán link file.`);
            return;
          }
          setError('');
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result);
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

function QuestionEditor({ question: q, onChange, title }) {
  const options = Array.from({ length: 4 }, (_, i) => q.options?.[i] ?? '');
  return (
    <div className="rounded-xl border border-night-700 bg-night-900 p-4">
      <p className="text-sm font-bold text-coral-400 mb-3">{title}</p>
      {q.kind === 'listen' && (
        <div className="grid sm:grid-cols-2 gap-2">
          <TextField
            label="Câu tiếng Trung được đọc to (tự phát âm)"
            value={q.audioZh}
            onChange={(v) => onChange({ ...q, audioZh: v })}
          />
          <TextField label="Bản dịch (hiện sau khi trả lời)" value={q.audioVi} onChange={(v) => onChange({ ...q, audioVi: v })} />
        </div>
      )}
      {q.kind === 'listen' && (
        <AudioField
          label="File âm thanh câu luyện nghe (có thể để trống)"
          value={q.audioUrl}
          onChange={(v) => onChange({ ...q, audioUrl: v })}
        />
      )}
      <TextAreaField label="Câu hỏi" rows={2} value={q.prompt} onChange={(v) => onChange({ ...q, prompt: v })} />
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              className={CHECKBOX}
              checked={q.answer === i}
              onChange={() => onChange({ ...q, answer: i })}
              aria-label={`Đáp án đúng là ${'ABCD'[i]}`}
            />
            <span className="w-4 font-bold">{'ABCD'[i]}</span>
            <input
              value={opt}
              onChange={(e) => {
                const next = options.slice();
                next[i] = e.target.value;
                onChange({ ...q, options: next });
              }}
              className={`${INPUT} flex-1 min-w-0`}
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Chọn ô tròn cạnh phương án đúng.</p>
    </div>
  );
}

// Admin editor for the vocabulary flashcards launched from "Nhận diện thể thức".
// Field numbers ①–④ mirror the card layout spec (front / back).
export default function FlashcardsEditor({ items, onChange }) {
  return (
    <Repeater
      title="Flashcard từ vựng (nút ★ “Luyện với flashcard” trong Nhận diện thể thức)"
      hint="Mỗi từ: thẻ 2 mặt + 4 câu bài tập (trắc nghiệm, điền từ, dịch câu, luyện nghe). Để trống danh sách thì nút flashcard sẽ không hiện."
      items={items}
      onChange={onChange}
      newItem={emptyCard}
      addLabel="Thêm flashcard"
      itemLabel={(item, i) => `Từ ${i + 1}${item.word ? ` · ${item.word}` : ''}`}
      renderItem={(card, update) => {
        const phrases = [card.phrases?.[0] ?? '', card.phrases?.[1] ?? ''];
        const questions = QUESTION_KINDS.map(
          ([kind], i) => card.questions?.find((q) => q.kind === kind) || card.questions?.[i] || emptyQuestion(kind)
        );
        return (
          <div className="space-y-2">
            <p className="kicker">Mặt trước</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <TextField
                label="① Chữ Hán (vd: 批准 hoặc 申请 / 申请书)"
                value={card.word}
                onChange={(v) => update({ ...card, word: v })}
              />
              <TextField
                label="② Nhãn từ loại (vd: Động từ)"
                value={card.partOfSpeech}
                onChange={(v) => update({ ...card, partOfSpeech: v })}
              />
            </div>
            <ImageField value={card.imageUrl} onChange={(v) => update({ ...card, imageUrl: v })} />
            <AudioField
              label="Phát âm của từ — phát khi bấm “Nghe từ” (có thể để trống)"
              value={card.audioUrl}
              onChange={(v) => update({ ...card, audioUrl: v })}
            />
            <div className="grid sm:grid-cols-2 gap-2">
              {phrases.map((p, i) => (
                <TextField
                  key={i}
                  label={`④ Cụm từ ${i + 1}`}
                  value={p}
                  onChange={(v) => {
                    const next = phrases.slice();
                    next[i] = v;
                    update({ ...card, phrases: next });
                  }}
                />
              ))}
            </div>

            <p className="kicker pt-3">Mặt sau</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <TextField label="① Pinyin" value={card.pinyin} onChange={(v) => update({ ...card, pinyin: v })} />
              <TextField label="② Nghĩa tiếng Việt" value={card.meaning} onChange={(v) => update({ ...card, meaning: v })} />
              <TextField label="③ Câu ví dụ (中文)" value={card.exampleZh} onChange={(v) => update({ ...card, exampleZh: v })} />
              <TextField label="③ Bản dịch câu ví dụ" value={card.exampleVi} onChange={(v) => update({ ...card, exampleVi: v })} />
            </div>

            <p className="kicker pt-3">4 câu bài tập</p>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <QuestionEditor
                  key={QUESTION_KINDS[i][0]}
                  title={QUESTION_KINDS[i][1]}
                  question={q}
                  onChange={(nq) => {
                    const next = questions.slice();
                    next[i] = nq;
                    update({ ...card, questions: next });
                  }}
                />
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}

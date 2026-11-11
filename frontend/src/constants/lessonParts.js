// Every exercise "mục" a lesson can be built from. Admins tick which ones a
// given lesson uses (in the order they want them to appear); the lesson then
// numbers only the ticked ones. Keys in BUILTIN_PART_KEYS have a dedicated
// content editor and renderer. Any other key falls back to a generic text
// section (heading + content), editable/rendered the same way as "Duyệt lý
// thuyết" but stored under its own `kind`.
export const ALL_LESSON_PARTS = [
  { key: 'theory', label: 'Duyệt lý thuyết' },
  { key: 'analysis', label: 'Phân tích đề' },
  { key: 'samples', label: 'Bài mẫu' },
  { key: 'quiz', label: 'Nhận diện thể thức' },
  { key: 'matching', label: 'Ghép nối' },
  { key: 'fill_blank', label: 'Điền từ' },
  { key: 'cloze', label: 'Đục lỗ' },
  { key: 'error', label: 'Tìm lỗi sai' },
  { key: 'sentence_building', label: 'Lắp ráp câu' },
  { key: 'translate_transform', label: 'Dịch - Chuyển câu' },
  { key: 'outline', label: 'Lập dàn ý' },
  { key: 'fixed_phrases', label: 'Bộ câu mẫu cố định' },
  { key: 'vocab', label: 'Ghép từ vựng & viết câu' },
  { key: 'partial_writing', label: 'Viết bán phần' },
  { key: 'writing', label: 'Luyện viết hoàn chỉnh' },
];

export const BUILTIN_PART_KEYS = [
  'theory',
  'analysis',
  'samples',
  'quiz',
  'matching',
  'cloze',
  'error',
  'sentence_building',
  'translate_transform',
  'outline',
  'fixed_phrases',
  'vocab',
  'partial_writing',
  'writing',
];

export const DEFAULT_SELECTED_PARTS = ['theory', 'samples', 'quiz', 'cloze', 'error', 'vocab', 'writing'];

// "Phân tích đề": the same 5 questions for every lesson. Per lesson the admin
// only fills a hint + reference answer for each (lesson.analysisTask.items[i]).
export const ANALYSIS_QUESTIONS = [
  'Theo đề bài, tôi là ai?',
  'Vấn đề là gì?',
  'Tôi phải viết cho ai?',
  'Thể loại văn bản nào?',
  'Viết nhằm mục đích gì?',
];

export function partLabel(key) {
  return ALL_LESSON_PARTS.find((p) => p.key === key)?.label || key;
}

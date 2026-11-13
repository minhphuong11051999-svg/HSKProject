const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

const FULL_INCLUDE = {
  sections: { orderBy: { orderIndex: 'asc' } },
  sampleDocuments: { orderBy: { orderIndex: 'asc' } },
  vocabTerms: true,
  fixedPhrases: true,
  quizQuestions: { orderBy: { orderIndex: 'asc' } },
  clozeExercises: { orderBy: { orderIndex: 'asc' } },
  matchItems: { orderBy: { orderIndex: 'asc' } },
  writingTasks: { orderBy: { orderIndex: 'asc' } },
  guidedWritingFields: { orderBy: { orderIndex: 'asc' } },
  guidedWritingScenarios: true,
  exercises: { orderBy: { orderIndex: 'asc' } },
  flashcards: { orderBy: { orderIndex: 'asc' } },
};

const NESTED_KEYS = Object.keys(FULL_INCLUDE);

function canAccess(lesson, user) {
  if (!lesson.isPremium) return true;
  return !!user && user.plan === 'PREMIUM';
}

function stripAnswers(lesson) {
  return {
    ...lesson,
    quizQuestions: lesson.quizQuestions?.map(({ correctIndex, explanation, correctedHtml, ...rest }) => rest),
    clozeExercises: lesson.clozeExercises?.map(({ blanks, ...rest }) => ({
      ...rest,
      blanks: blanks?.map(({ answer, ...b }) => b),
    })),
    matchItems: lesson.matchItems?.map(({ correctKey, explanation, ...rest }) => rest),
  };
}

async function listLessons({ type }, user) {
  const lessons = await prisma.lesson.findMany({
    where: type ? { type: type.toUpperCase() } : undefined,
    orderBy: [{ examYear: 'desc' }, { examMonth: 'desc' }, { orderIndex: 'asc' }],
    select: {
      id: true,
      slug: true,
      titleZh: true,
      titleVi: true,
      description: true,
      themeKey: true,
      type: true,
      examMonth: true,
      examYear: true,
      orderIndex: true,
      isPremium: true,
      isPublished: true,
      category: true,
    },
  });

  const isAdmin = user?.role === 'ADMIN';
  return lessons
    .filter((lesson) => isAdmin || lesson.isPublished)
    .map((lesson) => ({ ...lesson, locked: !canAccess(lesson, user) }));
}

async function getLessonBySlug(slug, user) {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: FULL_INCLUDE,
  });

  if (!lesson || (!lesson.isPublished && user?.role !== 'ADMIN')) {
    const error = new Error('Lesson not found');
    error.status = 404;
    throw error;
  }

  if (!canAccess(lesson, user)) {
    const locked = { id: lesson.id, slug: lesson.slug, titleZh: lesson.titleZh, titleVi: lesson.titleVi, locked: true };
    return locked;
  }

  return { ...stripAnswers(lesson), locked: false };
}

async function getLessonForGrading(lessonId) {
  return prisma.lesson.findUnique({ where: { id: lessonId }, include: FULL_INCLUDE });
}

async function getLessonForAdmin(lessonId) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: FULL_INCLUDE });
  if (!lesson) {
    const error = new Error('Lesson not found');
    error.status = 404;
    throw error;
  }
  return lesson;
}

// "Phân tích đề": 5 fixed questions (titles live in the frontend); per lesson we
// keep an optional illustrative prompt plus a hint + reference answer per question.
const ANALYSIS_ITEM_COUNT = 5;

function normalizeAnalysisTask(task) {
  if (!task || typeof task !== 'object') return null;
  const str = (v) => (typeof v === 'string' ? v : '');
  const items = Array.from({ length: ANALYSIS_ITEM_COUNT }, (_, i) => {
    const item = Array.isArray(task.items) ? task.items[i] : null;
    return { hint: str(item?.hint), answer: str(item?.answer) };
  });
  const prompt = str(task.prompt);
  if (!prompt.trim() && items.every((it) => !it.hint.trim() && !it.answer.trim())) return null;
  return { prompt, items };
}

async function upsertLesson(data, lessonId) {
  const { slug, titleZh, titleVi, description, themeKey, type, examMonth, examYear, orderIndex, isPremium, premiumParts, selectedParts } = data;

  const baseData = {
    slug,
    titleZh,
    titleVi,
    description,
    themeKey,
    type,
    examMonth: examMonth ?? null,
    examYear: examYear ?? null,
    orderIndex: orderIndex ?? 0,
    isPremium: !!isPremium,
    isPublished: data.isPublished === undefined ? true : !!data.isPublished,
    category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : null,
    premiumParts: Array.isArray(premiumParts) ? premiumParts : [],
    selectedParts:
      Array.isArray(selectedParts) && selectedParts.length > 0
        ? selectedParts
        : ['theory', 'samples', 'quiz', 'cloze', 'error', 'vocab', 'writing'],
  };
  // Steps the admin has ticked but not launched yet (content kept, hidden from learners).
  if (Array.isArray(data.hiddenParts)) {
    baseData.hiddenParts = data.hiddenParts.filter((k) => typeof k === 'string');
  }
  // Only touch the column when the client sends it, so older clients don't wipe it.
  if (data.analysisTask !== undefined) {
    baseData.analysisTask = normalizeAnalysisTask(data.analysisTask) ?? Prisma.DbNull;
  }

  const nestedCreate = buildNestedCreate(data);

  if (lessonId) {
    await prisma.$transaction(
      NESTED_KEYS.map((key) => prisma[modelNameFor(key)].deleteMany({ where: { lessonId } }))
    );
    return prisma.lesson.update({
      where: { id: lessonId },
      data: { ...baseData, ...nestedCreate },
      include: FULL_INCLUDE,
    });
  }

  return prisma.lesson.create({
    data: { ...baseData, ...nestedCreate },
    include: FULL_INCLUDE,
  });
}

function buildNestedCreate(data) {
  const result = {};
  for (const key of NESTED_KEYS) {
    if (Array.isArray(data[key])) {
      result[key] = { create: data[key].map(({ id, lessonId, ...rest }) => rest) };
    }
  }
  return result;
}

const MODEL_NAME = {
  sections: 'lessonSection',
  sampleDocuments: 'sampleDocument',
  vocabTerms: 'vocabTerm',
  fixedPhrases: 'fixedPhrase',
  quizQuestions: 'quizQuestion',
  clozeExercises: 'clozeExercise',
  matchItems: 'matchItem',
  writingTasks: 'writingTask',
  guidedWritingFields: 'guidedWritingField',
  guidedWritingScenarios: 'guidedWritingScenario',
  exercises: 'lessonExercise',
  flashcards: 'flashcard',
};

function modelNameFor(key) {
  return MODEL_NAME[key];
}

async function deleteLesson(lessonId) {
  await prisma.lesson.delete({ where: { id: lessonId } });
}

module.exports = {
  listLessons,
  getLessonBySlug,
  getLessonForGrading,
  getLessonForAdmin,
  upsertLesson,
  deleteLesson,
  canAccess,
};

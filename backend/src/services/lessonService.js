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
};

const NESTED_KEYS = Object.keys(FULL_INCLUDE);

function canAccess(lesson, user) {
  if (!lesson.isPremium) return true;
  return !!user && user.plan === 'PREMIUM';
}

function stripAnswers(lesson) {
  return {
    ...lesson,
    quizQuestions: lesson.quizQuestions?.map(({ correctIndex, explanation, ...rest }) => rest),
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
    },
  });

  return lessons.map((lesson) => ({ ...lesson, locked: !canAccess(lesson, user) }));
}

async function getLessonBySlug(slug, user) {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: FULL_INCLUDE,
  });

  if (!lesson) {
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

async function upsertLesson(data, lessonId) {
  const { slug, titleZh, titleVi, description, themeKey, type, examMonth, examYear, orderIndex, isPremium } = data;

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
  };

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

function modelNameFor(key) {
  return key;
}

async function deleteLesson(lessonId) {
  await prisma.lesson.delete({ where: { id: lessonId } });
}

module.exports = { listLessons, getLessonBySlug, getLessonForGrading, upsertLesson, deleteLesson, canAccess };

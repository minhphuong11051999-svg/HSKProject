const prisma = require('../lib/prisma');
const lessonService = require('./lessonService');

function gradeQuiz(lesson, exerciseId, answerPayload) {
  const question = lesson.quizQuestions.find((q) => q.id === exerciseId);
  if (!question) return null;
  const correct = answerPayload.selectedIndex === question.correctIndex;
  return { score: correct ? 1 : 0, maxScore: 1 };
}

function gradeCloze(lesson, exerciseId, answerPayload) {
  const exercise = lesson.clozeExercises.find((c) => c.id === exerciseId);
  if (!exercise) return null;
  const blanks = exercise.blanks || [];
  let correctCount = 0;
  for (const blank of blanks) {
    if (answerPayload.answers?.[blank.id] === blank.answer) correctCount += 1;
  }
  return { score: correctCount, maxScore: blanks.length };
}

function gradeMatch(lesson, exerciseId, answerPayload) {
  const item = lesson.matchItems.find((m) => m.id === exerciseId);
  if (!item) return null;
  const correct = answerPayload.selectedKey === item.correctKey;
  return { score: correct ? 1 : 0, maxScore: 1 };
}

const GRADERS = {
  quiz: gradeQuiz,
  cloze: gradeCloze,
  match: gradeMatch,
};

async function createSubmission({ userId, lessonId, exerciseType, exerciseId, answerPayload }) {
  const lesson = await lessonService.getLessonForGrading(lessonId);
  if (!lesson) {
    const error = new Error('Lesson not found');
    error.status = 404;
    throw error;
  }

  const grader = GRADERS[exerciseType];
  const result = grader ? grader(lesson, exerciseId, answerPayload) : null;

  return prisma.submission.create({
    data: {
      userId,
      lessonId,
      exerciseType,
      exerciseId,
      answerPayload,
      score: result?.score ?? null,
      maxScore: result?.maxScore ?? null,
    },
  });
}

async function listMySubmissions(userId, lessonSlug) {
  const where = { userId };
  if (lessonSlug) {
    const lesson = await prisma.lesson.findUnique({ where: { slug: lessonSlug } });
    if (!lesson) return [];
    where.lessonId = lesson.id;
  }

  return prisma.submission.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    include: { lesson: { select: { slug: true, titleZh: true, titleVi: true } } },
  });
}

module.exports = { createSubmission, listMySubmissions };

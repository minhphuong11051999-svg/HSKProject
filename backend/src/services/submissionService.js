const prisma = require('../lib/prisma');
const lessonService = require('./lessonService');

function gradeQuiz(lesson, exerciseId, answerPayload) {
  const question = lesson.quizQuestions.find((q) => q.id === exerciseId);
  if (!question) return null;
  const correct = answerPayload.selectedIndex === question.correctIndex;
  return {
    score: correct ? 1 : 0,
    maxScore: 1,
    isCorrect: correct,
    correctIndex: question.correctIndex,
    explanation: question.explanation || null,
  };
}

function gradeCloze(lesson, exerciseId, answerPayload) {
  const exercise = lesson.clozeExercises.find((c) => c.id === exerciseId);
  if (!exercise) return null;
  const blanks = exercise.blanks || [];
  let correctCount = 0;
  const correctAnswers = {};
  for (const blank of blanks) {
    correctAnswers[blank.id] = blank.answer;
    if (answerPayload.answers?.[blank.id] === blank.answer) correctCount += 1;
  }
  return { score: correctCount, maxScore: blanks.length, correctAnswers };
}

function gradeMatch(lesson, exerciseId, answerPayload) {
  const item = lesson.matchItems.find((m) => m.id === exerciseId);
  if (!item) return null;
  const correct = answerPayload.selectedKey === item.correctKey;
  return {
    score: correct ? 1 : 0,
    maxScore: 1,
    isCorrect: correct,
    correctKey: item.correctKey,
    explanation: item.explanation || null,
  };
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

  const submission = await prisma.submission.create({
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

  return { ...submission, feedback: result };
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

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_WINDOW_DAYS = 90;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function getUserStats(userId) {
  const submissions = await prisma.submission.findMany({
    where: { userId },
    select: { submittedAt: true },
  });

  const activeDays = new Set(submissions.map((s) => toDateKey(s.submittedAt)));
  const sortedDays = Array.from(activeDays).sort();

  const todayKey = toDateKey(new Date());
  const yesterdayKey = toDateKey(new Date(Date.now() - DAY_MS));

  let currentStreak = 0;
  if (activeDays.has(todayKey) || activeDays.has(yesterdayKey)) {
    let cursor = activeDays.has(todayKey) ? new Date() : new Date(Date.now() - DAY_MS);
    while (activeDays.has(toDateKey(cursor))) {
      currentStreak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }

  let longestStreak = 0;
  let run = 0;
  let prevDate = null;
  for (const key of sortedDays) {
    const date = new Date(`${key}T00:00:00Z`);
    if (prevDate && date.getTime() - prevDate.getTime() === DAY_MS) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prevDate = date;
  }

  const totalSubmissions = submissions.length;
  const xpPerSubmission = 10;
  const xpPerLevel = 100;
  const totalXp = totalSubmissions * xpPerSubmission;
  const level = Math.floor(totalXp / xpPerLevel) + 1;
  const xpIntoLevel = totalXp % xpPerLevel;

  const activity = [];
  const now = new Date();
  for (let i = ACTIVITY_WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * DAY_MS);
    const key = toDateKey(date);
    activity.push({ date: key, active: activeDays.has(key) });
  }
  const daysActiveInWindow = activity.filter((a) => a.active).length;

  return {
    currentStreak,
    longestStreak,
    totalSubmissions,
    level,
    xpIntoLevel,
    xpPerLevel,
    activity,
    daysActiveInWindow,
    windowDays: ACTIVITY_WINDOW_DAYS,
  };
}

module.exports = { createSubmission, listMySubmissions, getUserStats };

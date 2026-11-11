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
    correctedHtml: question.correctedHtml || null,
  };
}

// "Tìm lỗi sai" self-correction mode: free-text rewrite, not auto-graded — the
// response just unlocks the explanation and the fully corrected draft.
function gradeErrorFix(lesson, exerciseId) {
  const question = lesson.quizQuestions.find((q) => q.id === exerciseId);
  if (!question) return null;
  return {
    score: null,
    maxScore: null,
    explanation: question.explanation || null,
    correctedHtml: question.correctedHtml || null,
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

// The whole matching board in one submission (one History row, one XP):
// answers = { [matchItemId]: chosenRightText }. Graded by text, so two cards
// with identical wording are interchangeable.
function gradeMatchSet(lesson, _exerciseId, answerPayload) {
  const answers = answerPayload?.answers || {};
  const results = {};
  let score = 0;
  for (const item of lesson.matchItems || []) {
    const correct = answers[item.id] != null && answers[item.id] === item.correctKey;
    if (correct) score += 1;
    results[item.id] = { isCorrect: correct, correctKey: item.correctKey, explanation: item.explanation || null };
  }
  return { score, maxScore: (lesson.matchItems || []).length, results };
}

// Whole flashcard round: answers = { [flashcardId]: [chosenIndex × 4 questions] }.
function gradeFlashcards(lesson, _exerciseId, answerPayload) {
  const answers = answerPayload?.answers || {};
  let score = 0;
  let maxScore = 0;
  for (const card of lesson.flashcards || []) {
    const questions = Array.isArray(card.questions) ? card.questions : [];
    const chosen = Array.isArray(answers[card.id]) ? answers[card.id] : [];
    questions.forEach((q, i) => {
      maxScore += 1;
      if (Number.isInteger(chosen[i]) && chosen[i] === q.answer) score += 1;
    });
  }
  return { score, maxScore };
}

const GRADERS = {
  flashcard: gradeFlashcards,
  quiz: gradeQuiz,
  cloze: gradeCloze,
  match: gradeMatch,
  match_set: gradeMatchSet,
  error_fix: gradeErrorFix,
};

async function createSubmission({ userId, lessonId, samplePaperId, examSittingId, exerciseType, exerciseId, answerPayload }) {
  let result = null;

  if (lessonId) {
    const lesson = await lessonService.getLessonForGrading(lessonId);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.status = 404;
      throw error;
    }

    const grader = GRADERS[exerciseType];
    result = grader ? grader(lesson, exerciseId, answerPayload) : null;
  }

  const submission = await prisma.submission.create({
    data: {
      userId,
      lessonId: lessonId || null,
      samplePaperId: samplePaperId || null,
      examSittingId: examSittingId || null,
      exerciseType,
      exerciseId,
      answerPayload,
      score: result?.score ?? null,
      maxScore: result?.maxScore ?? null,
    },
  });

  return { ...submission, feedback: result };
}

async function listMySubmissions(userId, { lessonSlug, samplePaperId, examSittingId } = {}) {
  const where = { userId };
  if (lessonSlug) {
    const lesson = await prisma.lesson.findUnique({ where: { slug: lessonSlug } });
    if (!lesson) return [];
    where.lessonId = lesson.id;
  }
  if (samplePaperId) where.samplePaperId = samplePaperId;
  if (examSittingId) where.examSittingId = examSittingId;

  return prisma.submission.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    include: {
      lesson: { select: { slug: true, titleZh: true, titleVi: true } },
      samplePaper: { select: { slug: true, titleZh: true, titleVi: true } },
      examSitting: { select: { slug: true, titleZh: true, titleVi: true, label: true } },
    },
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
    select: { submittedAt: true, exerciseType: true, exerciseId: true, lessonId: true, samplePaperId: true, examSittingId: true },
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

  // XP counts each distinct exercise once, so retrying the same exercise keeps
  // the streak alive but doesn't farm levels.
  const totalSubmissions = new Set(
    submissions.map((s) => [s.exerciseType, s.exerciseId, s.lessonId || s.samplePaperId || s.examSittingId || ''].join(':'))
  ).size;
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

const prisma = require('../lib/prisma');
const { readSettings } = require('../lib/settings');

function canAccess(sitting, user) {
  if (!sitting.isPremium) return true;
  return !!user && user.plan === 'PREMIUM';
}

// The "Từ vựng và luận điểm" (outline) tab stays hidden for everyone but the admin
// until the admin opens it site-wide. The AI grading criteria never leave the server.
function forLearner(item, user, settings) {
  const { gradingCriteria, ...rest } = item;
  const out = { ...rest, hasGradingCriteria: !!(gradingCriteria && gradingCriteria.trim()) };
  const isAdmin = !!user && user.role === 'ADMIN';
  if (!isAdmin && !settings.showOutlineTab) out.outline = null;
  return out;
}

async function listExamYears(user) {
  const years = await prisma.examYear.findMany({
    orderBy: { year: 'desc' },
    include: {
      sittings: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          slug: true,
          label: true,
          examDate: true,
          titleZh: true,
          titleVi: true,
          isPremium: true,
          orderIndex: true,
        },
      },
    },
  });

  return years.map((year) => ({
    ...year,
    // Half-filled records (no slug yet) have no page to open, so learners never see them.
    sittings: year.sittings
      .filter((sitting) => sitting.slug?.trim() || user?.role === 'ADMIN')
      .map((sitting) => ({ ...sitting, locked: !canAccess(sitting, user) })),
  }));
}

async function getExamSittingBySlug(slug, user) {
  const sitting = await prisma.examSitting.findUnique({
    where: { slug },
    include: { examYear: { select: { id: true, year: true } } },
  });
  if (!sitting) {
    const error = new Error('Exam sitting not found');
    error.status = 404;
    throw error;
  }

  if (!canAccess(sitting, user)) {
    return {
      id: sitting.id,
      slug: sitting.slug,
      label: sitting.label,
      titleZh: sitting.titleZh,
      titleVi: sitting.titleVi,
      examYear: sitting.examYear,
      locked: true,
    };
  }

  return { ...forLearner(sitting, user, await readSettings()), locked: false };
}

async function listExamYearsForAdmin() {
  return prisma.examYear.findMany({
    orderBy: { year: 'desc' },
    include: { sittings: { orderBy: { orderIndex: 'asc' } } },
  });
}

async function upsertExamYear(data, id) {
  const { year, orderIndex } = data;
  const baseData = { year: Number(year), orderIndex: orderIndex ?? 0 };

  if (id) {
    return prisma.examYear.update({ where: { id }, data: baseData });
  }
  return prisma.examYear.create({ data: baseData });
}

async function deleteExamYear(id) {
  await prisma.examYear.delete({ where: { id } });
}

async function getExamSittingForAdmin(id) {
  const sitting = await prisma.examSitting.findUnique({ where: { id } });
  if (!sitting) {
    const error = new Error('Exam sitting not found');
    error.status = 404;
    throw error;
  }
  return sitting;
}

async function upsertExamSitting(data, id) {
  const {
    examYearId,
    slug,
    label,
    examDate,
    titleZh,
    titleVi,
    prompt,
    requirements,
    outline,
    outlineOpen,
    gradingCriteria,
    answer,
    orderIndex,
    isPremium,
  } = data;
  const missing = [
    [slug, 'đường dẫn (slug)'],
    [label, 'nhãn ngày thi'],
    [prompt && String(prompt).replace(/<[^>]*>/g, ''), 'đề bài'],
  ].filter(([v]) => !String(v ?? '').trim()).map(([, name]) => name);
  if (missing.length) {
    const error = new Error(`Vui lòng nhập ${missing.join(', ')}.`);
    error.status = 400;
    throw error;
  }
  const baseData = {
    examYearId,
    slug,
    label,
    examDate: examDate ? new Date(examDate) : null,
    titleZh,
    titleVi,
    prompt,
    requirements: requirements || null,
    outline: outline || null,
    outlineOpen: !!outlineOpen,
    gradingCriteria: gradingCriteria || null,
    answer,
    orderIndex: orderIndex ?? 0,
    isPremium: !!isPremium,
  };

  if (id) {
    return prisma.examSitting.update({ where: { id }, data: baseData });
  }
  return prisma.examSitting.create({ data: baseData });
}

async function deleteExamSitting(id) {
  await prisma.examSitting.delete({ where: { id } });
}

module.exports = {
  listExamYears,
  getExamSittingBySlug,
  listExamYearsForAdmin,
  upsertExamYear,
  deleteExamYear,
  getExamSittingForAdmin,
  upsertExamSitting,
  deleteExamSitting,
};

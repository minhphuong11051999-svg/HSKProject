const prisma = require('../lib/prisma');

function canAccess(sitting, user) {
  if (!sitting.isPremium) return true;
  return !!user && user.plan === 'PREMIUM';
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
    sittings: year.sittings.map((sitting) => ({ ...sitting, locked: !canAccess(sitting, user) })),
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

  return { ...sitting, locked: false };
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
  const { examYearId, slug, label, examDate, titleZh, titleVi, prompt, answer, orderIndex, isPremium } = data;
  const baseData = {
    examYearId,
    slug,
    label,
    examDate: examDate ? new Date(examDate) : null,
    titleZh,
    titleVi,
    prompt,
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

const prisma = require('../lib/prisma');

function canAccess(paper, user) {
  if (!paper.isPremium) return true;
  return !!user && user.plan === 'PREMIUM';
}

async function listSamplePapers(user) {
  const papers = await prisma.samplePaper.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      slug: true,
      titleZh: true,
      titleVi: true,
      orderIndex: true,
      isPremium: true,
    },
  });

  return papers.map((paper) => ({ ...paper, locked: !canAccess(paper, user) }));
}

async function getSamplePaperBySlug(slug, user) {
  const paper = await prisma.samplePaper.findUnique({ where: { slug } });
  if (!paper) {
    const error = new Error('Sample paper not found');
    error.status = 404;
    throw error;
  }

  if (!canAccess(paper, user)) {
    return { id: paper.id, slug: paper.slug, titleZh: paper.titleZh, titleVi: paper.titleVi, locked: true };
  }

  return { ...paper, locked: false };
}

async function getSamplePaperForAdmin(id) {
  const paper = await prisma.samplePaper.findUnique({ where: { id } });
  if (!paper) {
    const error = new Error('Sample paper not found');
    error.status = 404;
    throw error;
  }
  return paper;
}

async function upsertSamplePaper(data, id) {
  const { slug, titleZh, titleVi, prompt, answer, orderIndex, isPremium } = data;
  const baseData = {
    slug,
    titleZh,
    titleVi,
    prompt,
    answer,
    orderIndex: orderIndex ?? 0,
    isPremium: !!isPremium,
  };

  if (id) {
    return prisma.samplePaper.update({ where: { id }, data: baseData });
  }
  return prisma.samplePaper.create({ data: baseData });
}

async function deleteSamplePaper(id) {
  await prisma.samplePaper.delete({ where: { id } });
}

module.exports = {
  listSamplePapers,
  getSamplePaperBySlug,
  getSamplePaperForAdmin,
  upsertSamplePaper,
  deleteSamplePaper,
};

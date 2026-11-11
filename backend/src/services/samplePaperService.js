const prisma = require('../lib/prisma');
const { readSettings } = require('../lib/settings');

function canAccess(paper, user) {
  if (!paper.isPremium) return true;
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

  return papers
    .filter((paper) => paper.slug?.trim() || user?.role === 'ADMIN')
    .map((paper) => ({ ...paper, locked: !canAccess(paper, user) }));
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

  return { ...forLearner(paper, user, await readSettings()), locked: false };
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
  const { slug, titleZh, titleVi, prompt, requirements, outline, outlineOpen, gradingCriteria, answer, orderIndex, isPremium } = data;
  const missing = [
    [slug, 'đường dẫn (slug)'],
    [prompt && String(prompt).replace(/<[^>]*>/g, ''), 'đề bài'],
  ].filter(([v]) => !String(v ?? '').trim()).map(([, name]) => name);
  if (missing.length) {
    const error = new Error(`Vui lòng nhập ${missing.join(', ')}.`);
    error.status = 400;
    throw error;
  }
  const baseData = {
    slug,
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

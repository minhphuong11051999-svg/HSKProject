const prisma = require('./prisma');

// Site-wide switches and config the admin can change. Only keys listed here
// are readable/writable through /settings.
const DEFAULTS = {
  // Show not-yet-written cards on the Bài học map to learners.
  showUpcomingLessons: false,
  // Show the "Từ vựng và luận điểm" tab on every paper (hidden at launch, opened by the admin).
  showOutlineTab: false,
  // Scoring scale for AI grading; the owner decides the criteria and points.
  aiRubric: {
    criteria: [
      { name: 'Nội dung (đủ ý so với tiêu chuẩn chấm)', max: 40 },
      { name: 'Bố cục và định dạng (格式)', max: 30 },
      { name: 'Ngữ pháp và từ vựng', max: 30 },
    ],
  },
};

async function readSettings() {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: Object.keys(DEFAULTS) } } });
  return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), { ...DEFAULTS });
}

async function writeSettings(patch) {
  const entries = Object.entries(patch || {}).filter(([k]) => k in DEFAULTS);
  for (const [key, value] of entries) {
    await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return readSettings();
}

module.exports = { DEFAULTS, readSettings, writeSettings };

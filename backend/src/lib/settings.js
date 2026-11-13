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
  // "Gói PRO" page: plans, bank transfer details and contact, all typed in by the admin.
  pricing: {
    plans: [],
    bank: { bankName: '', accountNumber: '', accountName: '', transferNote: 'PRO [email của bạn]', qrImageUrl: '' },
    contact: '',
    note: '',
    // Promo code typed on the PRO page; each plan may carry its own salePrice.
    discountCode: '',
    discountNote: '',
  },
  // Free accounts open steps 1..N of every lesson; later steps need PRO (0 = no limit).
  freeStepCount: 2,
  // "Phân loại bài học": groups → sub-groups shown on the Bài học page. Each lesson
  // picks one sub-group id (Lesson.category). "planned" are types not written yet,
  // shown as "Đang soạn" cards until a lesson with the same Chinese title exists.
  lessonMap: {
    criterion: 'Người đọc có quyền quyết định điều bạn cần?',
    groups: [
      {
        id: 'loai-1',
        title: 'Loại I · Có',
        desc: 'Thỉnh cầu (xin, đề nghị)',
        subs: [
          { id: 'loai1-ban-than', label: '1.1 Cho bản thân', planned: [] },
          { id: 'loai1-nguoi-khac', label: '1.2 Cho người khác', planned: [] },
          { id: 'loai1-to-chuc', label: '1.3 Cho tổ chức', planned: [{ zh: '建议信', vi: 'Thư đề xuất' }] },
        ],
      },
      {
        id: 'loai-2',
        title: 'Loại II · Không',
        desc: 'Người đọc không quyết định điều bạn cần',
        subs: [
          { id: 'loai2-bao-cho-biet', label: 'Loại 1 · Báo cho biết', planned: [{ zh: '通告', vi: 'Thông cáo' }] },
          {
            id: 'loai2-tinh-cam',
            label: 'Loại 2 · Kết nối tình cảm',
            planned: [
              { zh: '感谢信', vi: 'Thư cảm ơn' },
              { zh: '贺信', vi: 'Thư chúc mừng' },
              { zh: '欢迎辞', vi: 'Lời chào mừng' },
              { zh: '告别辞', vi: 'Lời từ biệt' },
              { zh: '祝酒辞', vi: 'Lời chúc rượu' },
              { zh: '致谢辞', vi: 'Lời cảm tạ' },
            ],
          },
        ],
      },
      {
        id: 'nghi-luan-ke-chuyen',
        title: '议论文 · 记叙文',
        desc: 'Sắp ra mắt',
        subs: [
          { id: 'nghi-luan', label: '议论文 · Văn nghị luận', planned: [{ zh: '议论文', vi: 'Văn nghị luận' }] },
          { id: 'ke-chuyen', label: '记叙文 · Văn kể chuyện', planned: [{ zh: '记叙文', vi: 'Văn kể chuyện' }] },
        ],
      },
    ],
  },
  // Where learners are told to go when they forget their password (no email flow yet).
  supportContact: '',
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

// What anyone may read: the promo code itself stays on the server.
function publicSettings(settings) {
  const { discountCode, ...pricing } = settings.pricing || {};
  return { ...settings, pricing: { ...pricing, hasDiscount: !!(discountCode && discountCode.trim()) } };
}

function discountMatches(settings, code) {
  const real = (settings.pricing?.discountCode || '').trim().toUpperCase();
  return !!real && (code || '').trim().toUpperCase() === real;
}

module.exports = { DEFAULTS, readSettings, writeSettings, publicSettings, discountMatches };

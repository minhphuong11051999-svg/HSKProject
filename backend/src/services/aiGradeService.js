const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../lib/prisma');
const { readSettings } = require('../lib/settings');

const MODEL = 'claude-opus-5-5';

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const htmlToText = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

// JSON shape the model must return (structured outputs).
function resultSchema(criteria) {
  const str = { type: 'string' };
  const obj = (properties) => ({
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  });
  return obj({
    totalScore: { type: 'number' },
    maxScore: { type: 'number' },
    criteria: {
      type: 'array',
      items: obj({ name: { type: 'string', enum: criteria.map((c) => c.name) }, score: { type: 'number' }, max: { type: 'number' }, comment: str }),
    },
    coverage: obj({ covered: { type: 'array', items: str }, missing: { type: 'array', items: str } }),
    structureComment: str,
    formatComment: str,
    grammarErrors: { type: 'array', items: obj({ original: str, correction: str, explanation: str }) },
    suggestedPhrases: { type: 'array', items: obj({ phrase: str, meaning: str, usage: str }) },
    overall: str,
  });
}

const SYSTEM = [
  'Bạn là giám khảo chấm bài viết HSK6 (3.0), phần văn bản ứng dụng (应用文), cho người học Việt Nam.',
  'Chấm bài làm của học viên dựa trên TIÊU CHUẨN CHẤM do giáo viên cung cấp (dàn ý / các ý bắt buộc của đề) và thang điểm được giao.',
  '- Nội dung: so từng ý trong tiêu chuẩn chấm, liệt kê ý đã có (covered) và ý còn thiếu (missing).',
  '- Bố cục và định dạng (格式): bài được gửi NGUYÊN VĂN, kể cả khoảng trắng đầu dòng (khoảng trắng thường và khoảng trắng toàn khổ U+3000). Kiểm tra tiêu đề có căn giữa không, đầu đoạn có lùi 2 ô (空两格) không, xưng hô sát lề trái có dấu hai chấm không, 此致/敬礼, ký tên và ngày tháng ở góc phải, v.v. tùy thể loại.',
  '- Ngữ pháp và từ vựng: liệt kê từng lỗi với câu gốc, câu sửa và giải thích ngắn bằng tiếng Việt. Không bịa lỗi; nếu không có lỗi thì để mảng rỗng.',
  '- Gợi ý 3-6 mẫu câu 套话 phù hợp thể loại và đề này mà học viên có thể dùng.',
  'Điểm từng tiêu chí không vượt quá điểm tối đa của tiêu chí đó; totalScore là tổng điểm, maxScore là tổng điểm tối đa.',
  'Nhận xét viết bằng tiếng Việt, ngắn gọn, cụ thể, mang tính khích lệ; trích dẫn tiếng Trung khi cần.',
].join('\n');

async function gradeWriting({ user, samplePaperId, examSittingId, text }) {
  if (!user || (user.plan !== 'PREMIUM' && user.role !== 'ADMIN')) {
    throw httpError(403, 'Tính năng AI chấm bài chỉ dành cho tài khoản PRO.');
  }
  if (!text || !text.trim()) {
    throw httpError(400, 'Bạn hãy viết bài ở tab "Bài làm" trước khi chấm.');
  }
  if (text.length > 6000) {
    throw httpError(400, 'Bài làm quá dài để chấm (tối đa 6000 ký tự).');
  }

  let paper = null;
  if (samplePaperId) paper = await prisma.samplePaper.findUnique({ where: { id: samplePaperId } });
  else if (examSittingId) paper = await prisma.examSitting.findUnique({ where: { id: examSittingId } });
  if (!paper) throw httpError(404, 'Không tìm thấy đề.');
  if (!paper.gradingCriteria || !paper.gradingCriteria.trim()) {
    throw httpError(400, 'Đề này chưa có tiêu chuẩn chấm.');
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    throw httpError(503, 'AI chấm bài chưa được cấu hình trên máy chủ.');
  }

  const { aiRubric } = await readSettings();
  const criteria = (aiRubric?.criteria || []).filter((c) => c && c.name && Number(c.max) > 0);
  if (!criteria.length) throw httpError(503, 'Chưa cấu hình thang điểm AI chấm bài.');

  const rubricText = criteria.map((c) => `- ${c.name}: tối đa ${Number(c.max)} điểm`).join('\n');
  const userContent = [
    'ĐỀ BÀI:',
    htmlToText(paper.prompt),
    '',
    'TIÊU CHUẨN CHẤM (giáo viên nhập, học viên không nhìn thấy):',
    htmlToText(paper.gradingCriteria),
    '',
    'THANG ĐIỂM:',
    rubricText,
    '',
    'BÀI LÀM CỦA HỌC VIÊN (nguyên văn, giữ nguyên khoảng trắng; nằm giữa hai dòng ===):',
    '===',
    text,
    '===',
  ].join('\n');

  const client = new Anthropic();
  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: resultSchema(criteria) },
      },
      messages: [{ role: 'user', content: userContent }],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) throw httpError(429, 'AI đang quá tải, bạn thử lại sau ít phút nhé.');
    if (err instanceof Anthropic.APIError) {
      console.error('AI grade API error', err.status, err.message);
      throw httpError(502, 'Không chấm được bài lúc này, bạn thử lại sau nhé.');
    }
    throw err;
  }

  if (response.stop_reason === 'refusal') throw httpError(422, 'AI không chấm được bài này.');
  if (response.stop_reason === 'max_tokens') throw httpError(502, 'Kết quả chấm bị cắt ngang, bạn thử lại nhé.');
  const textBlock = response.content.find((b) => b.type === 'text');
  let result;
  try {
    result = JSON.parse(textBlock?.text || '');
  } catch {
    throw httpError(502, 'Không đọc được kết quả chấm, bạn thử lại nhé.');
  }
  return { ...result, gradedAt: new Date().toISOString() };
}

module.exports = { gradeWriting };

// November launch price list. The admin can load it into "Gói PRO & thanh toán"
// with "Điền bảng giá mới"; the PRO page also shows it while no plans are saved.
export const PRO_FEATURES = [
  '16 dạng văn bản ứng dụng (full bước)',
  '20 đề thi mẫu',
  'Tặng: toàn bộ kho đề thi thật',
  'Đáp án mẫu',
];

export const PRESET_PLANS = [
  { name: 'Gói miễn phí', price: '0đ', features: ['Văn bản ứng dụng (4 bước)', '2 đề thi mẫu, có đáp án mẫu'] },
  { name: 'PRO 15 ngày', price: '99.000đ', salePrice: '60.000đ', period: '15 ngày', features: PRO_FEATURES },
  { name: 'PRO 30 ngày', price: '119.000đ', salePrice: '90.000đ', period: '30 ngày', features: PRO_FEATURES, highlight: true },
  { name: 'PRO 3 tháng', price: '279.000đ', salePrice: '239.000đ', period: '3 tháng', features: PRO_FEATURES },
];

// "So sánh gói" table on the PRO page: [row label, free, PRO]. true/false = có/không.
export const PLAN_COMPARISON = [
  ['Văn bản ứng dụng', '4 bước', 'Full bước · 16 dạng'],
  ['Đề thi mẫu', '2 đề', '20 đề'],
  ['Đáp án mẫu', true, true],
  ['Kho đề thi thật', false, 'Tặng toàn bộ'],
];

export const PRESET_DISCOUNT_NOTE = 'Nhập mã giảm giá để được giá ưu đãi';

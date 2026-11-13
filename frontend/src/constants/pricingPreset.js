// November launch price list. The admin can load it into "Gói PRO & thanh toán"
// with "Điền bảng giá mới"; the PRO page also shows it while no plans are saved.
export const PRO_FEATURES = [
  '16 dạng văn bản ứng dụng (đủ bước 1–8)',
  '20 đề thi mẫu (cập nhật thêm)',
  'Tặng: 2 đề thi thật (cập nhật dần)',
  'Đáp án mẫu',
];

export const PRESET_PLANS = [
  { name: 'Gói miễn phí', price: '0đ', features: ['16 dạng văn bản ứng dụng (bước 1–3)', '5 đề thi mẫu'] },
  { name: 'PRO 15 ngày', price: '99.000đ', salePrice: '60.000đ', period: '15 ngày', features: PRO_FEATURES },
  { name: 'PRO 30 ngày', price: '119.000đ', salePrice: '90.000đ', period: '30 ngày', features: PRO_FEATURES, highlight: true },
  { name: 'PRO 3 tháng', price: '279.000đ', salePrice: '239.000đ', period: '3 tháng', features: PRO_FEATURES },
];

export const PRESET_DISCOUNT_NOTE = 'Nhập mã giảm giá để được giá ưu đãi';

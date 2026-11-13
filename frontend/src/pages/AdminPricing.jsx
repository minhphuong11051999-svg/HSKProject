import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Trash, Plus, MagicWand } from '@phosphor-icons/react';
import { getSettings, updateSettings } from '../api/settings';
import PageHeader from '../components/PageHeader';
import { TextField, TextAreaField, CheckboxField } from '../components/admin/fields';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  LABEL,
  LABEL_TEXT,
  INPUT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_ADD,
  BTN_TOOL,
  BTN_TOOL_DANGER,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../components/admin/ui';

const TOOL = `${BTN_TOOL} disabled:opacity-40 disabled:pointer-events-none`;
const EMPTY_BANK = { bankName: '', accountNumber: '', accountName: '', transferNote: 'PRO [email của bạn]', qrImageUrl: '' };
const EMPTY_PLAN = { name: '', price: '', salePrice: '', period: '', featuresText: '', highlight: false };
const DEFAULT_FREE_STEPS = 2;

// "Điền bảng giá mới": the November launch price list. Fills the form only;
// the admin reviews it and presses "Lưu cấu hình".
const PRO_FEATURES = [
  '16 dạng văn bản ứng dụng (đủ bước 1–8)',
  '20 đề thi mẫu (cập nhật thêm)',
  'Tặng: 2 đề thi thật (cập nhật dần)',
  'Đáp án mẫu',
];
const PRESET_PLANS = [
  { name: 'Gói miễn phí', price: '0đ', features: ['16 dạng văn bản ứng dụng (bước 1–3)', '5 đề thi mẫu'] },
  { name: 'PRO 15 ngày', price: '99.000đ', salePrice: '60.000đ', period: '15 ngày', features: PRO_FEATURES },
  { name: 'PRO 30 ngày', price: '119.000đ', salePrice: '90.000đ', period: '30 ngày', features: PRO_FEATURES, highlight: true },
  { name: 'PRO 3 tháng', price: '279.000đ', salePrice: '239.000đ', period: '3 tháng', features: PRO_FEATURES },
];
const PRESET_DISCOUNT_NOTE = 'Nhập mã giảm giá để được giá ưu đãi';

let planKeySeq = 0;
const nextKey = () => `plan-${++planKeySeq}`;

// Plans are edited with features as raw text so blank lines can be typed;
// they are split into an array only when saving.
function toEditablePlan(p = {}) {
  return {
    key: nextKey(),
    name: p.name || '',
    price: p.price || '',
    salePrice: p.salePrice || '',
    period: p.period || '',
    featuresText: Array.isArray(p.features) ? p.features.join('\n') : '',
    highlight: !!p.highlight,
  };
}

function toSavedPlan(p) {
  const plan = {
    name: p.name.trim(),
    price: p.price.trim(),
    period: p.period.trim(),
    features: p.featuresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
  };
  const salePrice = (p.salePrice || '').trim();
  if (salePrice) plan.salePrice = salePrice;
  if (p.highlight) plan.highlight = true;
  return plan;
}

export default function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [bank, setBank] = useState(EMPTY_BANK);
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountNote, setDiscountNote] = useState('');
  const [freeSteps, setFreeSteps] = useState(String(DEFAULT_FREE_STEPS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    getSettings()
      .then((s) => {
        const pricing = s?.pricing || {};
        setPlans((pricing.plans || []).map(toEditablePlan));
        setBank({ ...EMPTY_BANK, ...(pricing.bank || {}) });
        setContact(pricing.contact || '');
        setNote(pricing.note || '');
        setDiscountCode(pricing.discountCode || '');
        setDiscountNote(pricing.discountNote || '');
        setFreeSteps(String(Number.isInteger(s?.freeStepCount) ? s.freeStepCount : DEFAULT_FREE_STEPS));
      })
      .catch((err) => setError(err.response?.data?.message || 'Không tải được cấu hình gói PRO'))
      .finally(() => setLoading(false));
  }, []);

  function updatePlan(index, key, value) {
    setPlans((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  }

  function movePlan(index, dir) {
    setPlans((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removePlan(index) {
    if (!confirm('Xoá gói này?')) return;
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }

  function fillPreset() {
    const hasPlans = plans.some((p) => p.name.trim() || p.price.trim() || p.featuresText.trim());
    if (hasPlans && !confirm('Thay các gói hiện có bằng bảng giá mới? Bạn vẫn cần bấm “Lưu cấu hình” để áp dụng.')) return;
    setPlans(PRESET_PLANS.map(toEditablePlan));
    setDiscountNote(PRESET_DISCOUNT_NOTE);
    setSavedMessage('Đã điền bảng giá mới vào biểu mẫu. Kiểm tra lại rồi bấm “Lưu cấu hình”.');
  }

  function setBankField(key, value) {
    setBank((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    const freeStepCount = Number(freeSteps);
    if (String(freeSteps).trim() === '' || !Number.isInteger(freeStepCount) || freeStepCount < 0) {
      setError('Số bước miễn phí phải là số nguyên từ 0 trở lên.');
      return;
    }
    setSaving(true);
    try {
      const pricing = {
        plans: plans.map(toSavedPlan).filter((p) => p.name || p.price || p.features.length),
        bank: {
          bankName: bank.bankName.trim(),
          accountNumber: bank.accountNumber.trim(),
          accountName: bank.accountName.trim(),
          transferNote: bank.transferNote.trim(),
          qrImageUrl: bank.qrImageUrl.trim(),
        },
        contact: contact.trim(),
        note: note.trim(),
        discountCode: discountCode.trim(),
        discountNote: discountNote.trim(),
      };
      const saved = await updateSettings({ pricing, freeStepCount });
      const fresh = saved?.pricing;
      if (fresh) {
        setPlans((fresh.plans || []).map(toEditablePlan));
        setDiscountCode(fresh.discountCode || '');
        setDiscountNote(fresh.discountNote || '');
      }
      if (Number.isInteger(saved?.freeStepCount)) setFreeSteps(String(saved.freeStepCount));
      setSavedMessage('Đã lưu cấu hình gói PRO.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Quản trị gói PRO"
        actions={
          <Link to="/pro" className={BTN_SECONDARY}>
            Xem trang Gói PRO
          </Link>
        }
      >
        Bảng giá, thông tin chuyển khoản và kênh liên hệ hiển thị trên trang Gói PRO. Sau khi học viên chuyển khoản, bật PRO cho họ ở
        trang Người dùng.
      </PageHeader>

      {loading ? (
        <p className="text-slate-500" role="status">
          Đang tải...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className={PANEL} aria-labelledby="pricing-plans">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 id="pricing-plans" className={PANEL_TITLE}>
                Các gói
              </h2>
              <button type="button" className={BTN_SECONDARY} onClick={fillPreset}>
                <MagicWand size={18} aria-hidden="true" />
                Điền bảng giá mới
              </button>
            </div>
            <p className={`${HINT} mb-4`}>
              Thứ tự ở đây là thứ tự hiển thị. Gói được đánh dấu “Phổ biến” có viền vàng. “Giá sau mã giảm” chỉ hiện khi học viên nhập
              đúng mã giảm giá; để trống nếu gói không giảm. “Điền bảng giá mới” chỉ điền vào biểu mẫu, kiểm tra lại rồi bấm “Lưu cấu
              hình”.
            </p>

            {plans.length === 0 && <p className={`${HINT} mb-4`}>Chưa có gói nào.</p>}

            <ol className="space-y-4">
              {plans.map((plan, i) => (
                <li key={plan.key} className="rounded-xl border border-night-700 bg-night-900/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-100">
                      Gói {i + 1}
                      {plan.name ? `: ${plan.name}` : ''}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className={TOOL}
                        onClick={() => movePlan(i, -1)}
                        disabled={i === 0}
                        aria-label={`Đưa gói ${i + 1} lên`}
                      >
                        <ArrowUp size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={TOOL}
                        onClick={() => movePlan(i, 1)}
                        disabled={i === plans.length - 1}
                        aria-label={`Đưa gói ${i + 1} xuống`}
                      >
                        <ArrowDown size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={BTN_TOOL_DANGER}
                        onClick={() => removePlan(i)}
                        aria-label={`Xoá gói ${i + 1}`}
                      >
                        <Trash size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-4">
                    <TextField label="Tên gói" value={plan.name} onChange={(v) => updatePlan(i, 'name', v)} placeholder="PRO 3 tháng" />
                    <TextField label="Thời hạn" value={plan.period} onChange={(v) => updatePlan(i, 'period', v)} placeholder="3 tháng" />
                    <TextField label="Giá" value={plan.price} onChange={(v) => updatePlan(i, 'price', v)} placeholder="279.000đ" />
                    <TextField
                      label="Giá sau mã giảm (không bắt buộc)"
                      value={plan.salePrice}
                      onChange={(v) => updatePlan(i, 'salePrice', v)}
                      placeholder="239.000đ"
                    />
                  </div>
                  <label className={LABEL}>
                    <span className={LABEL_TEXT}>Quyền lợi (mỗi dòng một ý)</span>
                    <textarea
                      value={plan.featuresText}
                      rows={4}
                      placeholder={'AI chấm bài không giới hạn\nToàn bộ bài học PRO'}
                      onChange={(e) => updatePlan(i, 'featuresText', e.target.value)}
                      className={INPUT}
                    />
                  </label>
                  <CheckboxField
                    label="Đánh dấu “Phổ biến”"
                    checked={plan.highlight}
                    onChange={(v) => updatePlan(i, 'highlight', v)}
                  />
                </li>
              ))}
            </ol>

            <button type="button" className={`${BTN_ADD} mt-4`} onClick={() => setPlans((prev) => [...prev, { ...EMPTY_PLAN, key: nextKey() }])}>
              <Plus size={16} weight="bold" aria-hidden="true" />
              Thêm gói
            </button>
          </section>

          <section className={PANEL} aria-labelledby="pricing-discount">
            <h2 id="pricing-discount" className={`${PANEL_TITLE} mb-1`}>
              Mã giảm giá
            </h2>
            <p className={`${HINT} mb-4`}>
              Học viên nhập đúng mã trên trang Gói PRO sẽ thấy “Giá sau mã giảm” của từng gói, và mã được thêm vào nội dung chuyển
              khoản. Mã không phân biệt hoa thường và không hiện công khai. Để trống mã thì ô nhập mã được ẩn.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <TextField label="Mã giảm giá" value={discountCode} onChange={setDiscountCode} placeholder="VD: HSK6GIAM39" />
              <TextField
                label="Lời nhắc cạnh ô nhập mã"
                value={discountNote}
                onChange={setDiscountNote}
                placeholder={PRESET_DISCOUNT_NOTE}
              />
            </div>
          </section>

          <section className={PANEL} aria-labelledby="pricing-free">
            <h2 id="pricing-free" className={`${PANEL_TITLE} mb-4`}>
              Quyền gói miễn phí
            </h2>
            <label className={LABEL} htmlFor="free-step-count">
              <span className={LABEL_TEXT}>Số bước mở cho tài khoản miễn phí trong mỗi bài học</span>
              <input
                id="free-step-count"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={freeSteps}
                onChange={(e) => setFreeSteps(e.target.value)}
                aria-describedby="free-step-count-hint"
                className={`${INPUT} sm:max-w-[10rem]`}
              />
            </label>
            <p id="free-step-count-hint" className={HINT}>
              Tài khoản miễn phí học được từ bước 1 đến bước này của mọi bài học; các bước sau cần PRO. Nhập 0 để không giới hạn.
              Ra mắt 18–20/11: 2 bước; 23/11 đổi thành 3.
            </p>
          </section>

          <section className={PANEL} aria-labelledby="pricing-bank">
            <h2 id="pricing-bank" className={`${PANEL_TITLE} mb-4`}>
              Thông tin chuyển khoản
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <TextField label="Ngân hàng" value={bank.bankName} onChange={(v) => setBankField('bankName', v)} placeholder="Vietcombank" />
              <TextField label="Số tài khoản" value={bank.accountNumber} onChange={(v) => setBankField('accountNumber', v)} />
              <TextField label="Chủ tài khoản" value={bank.accountName} onChange={(v) => setBankField('accountName', v)} placeholder="NGUYEN VAN A" />
              <TextField label="Link ảnh mã QR (không bắt buộc)" value={bank.qrImageUrl} onChange={(v) => setBankField('qrImageUrl', v)} placeholder="https://..." />
            </div>
            <TextField
              label="Nội dung chuyển khoản"
              value={bank.transferNote}
              onChange={(v) => setBankField('transferNote', v)}
              placeholder="PRO [email của bạn]"
            />
            <p className={HINT}>“[email của bạn]” sẽ được thay bằng email của học viên đang đăng nhập.</p>
          </section>

          <section className={PANEL} aria-labelledby="pricing-contact">
            <h2 id="pricing-contact" className={`${PANEL_TITLE} mb-4`}>
              Liên hệ và ghi chú
            </h2>
            <TextAreaField
              label="Kênh liên hệ để gửi ảnh giao dịch (link sẽ tự thành đường dẫn)"
              value={contact}
              onChange={setContact}
              placeholder="Zalo: 09xx xxx xxx · https://facebook.com/..."
              rows={2}
            />
            <TextAreaField label="Ghi chú thêm (không bắt buộc)" value={note} onChange={setNote} rows={3} />
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className={BTN_PRIMARY} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
            <p role="status" className={SUCCESS_TEXT}>
              {savedMessage}
            </p>
          </div>
          {error && (
            <p role="alert" className={ERROR_TEXT}>
              {error}
            </p>
          )}
        </form>
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Trash, Plus } from '@phosphor-icons/react';
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
const EMPTY_PLAN = { name: '', price: '', period: '', featuresText: '', highlight: false };

let planKeySeq = 0;
const nextKey = () => `plan-${++planKeySeq}`;

// Plans are edited with features as raw text so blank lines can be typed;
// they are split into an array only when saving.
function toEditablePlan(p = {}) {
  return {
    key: nextKey(),
    name: p.name || '',
    price: p.price || '',
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
  if (p.highlight) plan.highlight = true;
  return plan;
}

export default function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [bank, setBank] = useState(EMPTY_BANK);
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
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

  function setBankField(key, value) {
    setBank((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSavedMessage('');
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
      };
      const saved = await updateSettings({ pricing });
      const fresh = saved?.pricing;
      if (fresh) setPlans((fresh.plans || []).map(toEditablePlan));
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
            <h2 id="pricing-plans" className={`${PANEL_TITLE} mb-1`}>
              Các gói
            </h2>
            <p className={`${HINT} mb-4`}>Thứ tự ở đây là thứ tự hiển thị. Gói được đánh dấu “Phổ biến” có viền vàng.</p>

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
                  <div className="grid sm:grid-cols-3 gap-x-4">
                    <TextField label="Tên gói" value={plan.name} onChange={(v) => updatePlan(i, 'name', v)} placeholder="PRO 3 tháng" />
                    <TextField label="Giá" value={plan.price} onChange={(v) => updatePlan(i, 'price', v)} placeholder="199.000đ" />
                    <TextField label="Thời hạn" value={plan.period} onChange={(v) => updatePlan(i, 'period', v)} placeholder="/ 3 tháng" />
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

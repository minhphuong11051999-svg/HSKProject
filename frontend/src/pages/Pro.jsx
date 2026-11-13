import { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle, Copy, Crown, BookOpen, Exam, ChatCircleText, Sparkle, Tag, XCircle } from '@phosphor-icons/react';
import { getSettings, checkDiscount } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { FANPAGE_URL } from '../components/FanpageButton';
import { PRESET_PLANS, PRESET_DISCOUNT_NOTE } from '../constants/pricingPreset';

const EMAIL_PLACEHOLDER = '[email của bạn]';
const DEFAULT_FREE_STEPS = 2;

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function benefits(freeSteps) {
  return [
    {
      icon: BookOpen,
      title: 'Đủ 8 bước mỗi bài học',
      text:
        freeSteps > 0
          ? `Tài khoản miễn phí học được bước 1–${freeSteps} của mỗi bài; PRO mở toàn bộ các bước của 16 dạng văn bản ứng dụng.`
          : 'Mở toàn bộ các bước của 16 dạng văn bản ứng dụng.',
    },
    {
      icon: Exam,
      title: 'Đề thi mẫu và đề thi thật',
      text: 'Luyện với 20 đề thi mẫu (cập nhật thêm), tặng kèm đề thi thật gắn nhãn PRO.',
    },
    {
      icon: CheckCircle,
      title: 'Đáp án mẫu',
      text: 'Xem đáp án mẫu của từng đề để so sánh và học cách triển khai bài viết.',
    },
  ];
}

const URL_RE = /(https?:\/\/[^\s]+)/g;

// Renders plain text, turning http(s) URLs into links that open in a new tab.
function Linkified({ text }) {
  const parts = String(text || '').split(URL_RE);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-coral-400 underline underline-offset-2 break-all hover:text-coral-500"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Đã sao chép ${label}` : `Sao chép ${label}`}
      className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-night-600 bg-night-800 text-sm font-semibold text-slate-200 transition-colors hover:border-coral-400 hover:text-coral-400"
    >
      {copied ? <Check size={16} weight="bold" className="text-ok" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
    </button>
  );
}

function BankRow({ label, value, copyLabel, mono = false }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-night-700 last:border-b-0">
      <dt className="text-[13px] font-semibold text-slate-400">{label}</dt>
      <dd className="mt-1 flex items-center justify-between gap-3">
        <span className={`min-w-0 break-all text-slate-100 ${mono ? 'font-mono text-lg font-bold tracking-wide' : 'font-semibold'}`}>
          {value}
        </span>
        {copyLabel && <CopyButton value={value} label={copyLabel} />}
      </dd>
    </div>
  );
}

function PlanCard({ plan, discounted }) {
  const features = Array.isArray(plan.features) ? plan.features.filter(Boolean) : [];
  const salePrice = typeof plan.salePrice === 'string' ? plan.salePrice.trim() : '';
  const onSale = discounted && !!salePrice;
  return (
    <li
      className={`surface relative flex flex-col p-6 ${plan.highlight ? '!border-gold ring-2 ring-gold/60' : ''}`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white shadow">
          <Crown size={12} weight="fill" aria-hidden="true" />
          Phổ biến
        </span>
      )}
      <h3 className="text-lg font-extrabold tracking-tight text-slate-100">{plan.name || 'Gói PRO'}</h3>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
        {onSale ? (
          <>
            <span className="text-lg font-bold text-slate-500 line-through decoration-2">
              <span className="sr-only">Giá gốc </span>
              {plan.price}
            </span>
            <span className="text-3xl font-extrabold tracking-tight text-coral-400">
              <span className="sr-only">, giá sau mã giảm </span>
              {salePrice}
            </span>
          </>
        ) : (
          <span className="text-3xl font-extrabold tracking-tight text-coral-400">{plan.price}</span>
        )}
        {plan.period && <span className="text-sm font-medium text-slate-400">/ {plan.period.replace(/^\/\s*/, '')}</span>}
      </p>
      {onSale && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-ok">
          <Tag size={14} weight="fill" aria-hidden="true" />
          Đã áp dụng mã giảm giá
        </p>
      )}
      {features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-300">
              <Check size={16} weight="bold" className="mt-0.5 flex-shrink-0 text-ok" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// "Mã giảm giá": checks the code on the server; the real code never reaches the page.
function DiscountForm({ note, appliedCode, onApplied }) {
  const [code, setCode] = useState(appliedCode);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const value = code.trim();
    setError('');
    if (!value) {
      setError('Vui lòng nhập mã giảm giá.');
      return;
    }
    setChecking(true);
    try {
      const res = await checkDiscount(value);
      if (res?.valid) {
        onApplied(value.toUpperCase());
      } else {
        onApplied('');
        setError('Mã giảm giá không đúng.');
      }
    } catch (err) {
      setError(
        err.response?.status === 429
          ? 'Bạn đã thử quá nhiều lần, vui lòng thử lại sau ít phút.'
          : err.response?.data?.message || 'Không kiểm tra được mã, vui lòng thử lại.',
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <section aria-labelledby="pro-discount" className="surface mb-6 p-5">
      <h2 id="pro-discount" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-100">
        <Tag size={20} weight="duotone" className="text-coral-400" aria-hidden="true" />
        Mã giảm giá
      </h2>
      {note && <p className="mt-1 text-sm text-slate-400">{note}</p>}
      <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="discount-code" className="sr-only">
          Mã giảm giá
        </label>
        <input
          id="discount-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Nhập mã giảm giá"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'discount-code-msg' : undefined}
          className="w-full sm:max-w-xs min-h-[44px] rounded-xl border border-night-600 bg-night-900 px-3 py-2 text-sm uppercase text-slate-100 placeholder:normal-case placeholder-slate-500 transition-colors focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/30"
        />
        <button
          type="submit"
          disabled={checking}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-coral-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking ? 'Đang kiểm tra...' : 'Áp dụng'}
        </button>
      </form>
      <div aria-live="polite">
        {error ? (
          <p id="discount-code-msg" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[color:var(--c-hint-text)]">
            <XCircle size={16} weight="fill" aria-hidden="true" />
            {error}
          </p>
        ) : (
          appliedCode && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ok">
              <CheckCircle size={16} weight="fill" aria-hidden="true" />
              Đã áp dụng mã {appliedCode}. Giá ưu đãi hiện trong bảng giá, mã đã được thêm vào nội dung chuyển khoản.
            </p>
          )
        )}
      </div>
    </section>
  );
}

export default function Pro() {
  const { user } = useAuth();
  const [pricing, setPricing] = useState(null);
  const [freeSteps, setFreeSteps] = useState(DEFAULT_FREE_STEPS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [appliedCode, setAppliedCode] = useState('');

  useEffect(() => {
    getSettings()
      .then((s) => {
        setPricing(s?.pricing || {});
        if (Number.isInteger(s?.freeStepCount)) setFreeSteps(s.freeStepCount);
      })
      .catch(() => {
        setPricing({});
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const isPro = user?.plan === 'PREMIUM';
  const proUntil = isPro && user?.planExpiresAt ? formatDate(user.planExpiresAt) : '';
  // Until the admin saves a price list, show the launch prices (free plan
  // wording follows the current free step setting).
  const savedPlans = Array.isArray(pricing?.plans) ? pricing.plans : [];
  const plans = savedPlans.length
    ? savedPlans
    : PRESET_PLANS.map((p) =>
        p.price === '0đ' && freeSteps > 0
          ? { ...p, features: p.features.map((f) => f.replace(/bước 1–\d+/, `bước 1–${freeSteps}`)) }
          : p
      );
  const bank = pricing?.bank || {};
  const contact = (pricing?.contact || '').trim();
  const note = (pricing?.note || '').trim();
  const discountNote = (pricing?.discountNote || '').trim() || PRESET_DISCOUNT_NOTE;
  // Admins get the raw settings (with the code) instead of the public hasDiscount flag.
  const hasDiscount = !!(pricing?.hasDiscount || (pricing?.discountCode || '').trim());
  const hasBank = !!(bank.accountNumber || '').trim();
  const baseNote = (bank.transferNote || '').split(EMAIL_PLACEHOLDER).join(user?.email || EMAIL_PLACEHOLDER);
  const transferNote = appliedCode && baseNote ? `${baseNote} ${appliedCode}` : baseNote;
  const notConfigured = !!loadError && savedPlans.length === 0 && !hasBank;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Gói PRO">
        Mở khoá đủ các bước của mọi bài học, đề thi mẫu, đề thi thật và đáp án mẫu để luyện viết HSK6 hiệu quả hơn.
      </PageHeader>

      {isPro && (
        <div className="surface mb-8 flex items-start gap-3 p-5 !border-ok/50" role="status">
          <CheckCircle size={24} weight="fill" className="flex-shrink-0 text-ok" aria-hidden="true" />
          <div>
            <p className="font-bold text-slate-100">
              {proUntil ? `Tài khoản của bạn đang là PRO đến hết ${proUntil}` : 'Tài khoản của bạn đang là PRO'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Cảm ơn bạn! Mọi tính năng PRO đã được mở khoá.
              {proUntil ? ' Gia hạn trước ngày hết hạn, thời gian mới được cộng nối tiếp.' : ''}
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="pro-benefits" className="mb-10">
        <h2 id="pro-benefits" className="mb-4 text-xl font-extrabold tracking-tight text-slate-100">
          Quyền lợi PRO
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {benefits(freeSteps).map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface p-5">
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-coral-400/10 text-coral-400">
                <Icon size={24} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="font-bold text-slate-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-400">
          <Sparkle size={18} weight="fill" className="mt-0.5 flex-shrink-0 text-gold" aria-hidden="true" />
          <span>
            <span className="font-bold text-slate-300">Sắp ra mắt:</span> gói VIP (AI chấm bài, flashcard từ vựng, video bài giảng)
          </span>
        </p>
      </section>

      {loading ? (
        <p className="text-slate-500" role="status">
          Đang tải thông tin gói PRO...
        </p>
      ) : notConfigured ? (
        <section className="surface p-6 text-center">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-100">Thông tin gói PRO đang được cập nhật</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {loadError ? 'Không tải được thông tin lúc này. ' : ''}
            Vui lòng quay lại sau{contact ? ' hoặc liên hệ với chúng tôi để được hỗ trợ nâng cấp.' : '.'}
          </p>
          {contact && (
            <p className="mt-4 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
              <ChatCircleText size={16} className="mr-1 inline-block align-[-3px] text-coral-400" aria-hidden="true" />
              <Linkified text={contact} />
            </p>
          )}
        </section>
      ) : (
        <>
          {plans.length > 0 && (
            <section aria-labelledby="pro-plans" className="mb-10">
              <h2 id="pro-plans" className="mb-4 text-xl font-extrabold tracking-tight text-slate-100">
                Bảng giá
              </h2>
              {hasDiscount && <DiscountForm note={discountNote} appliedCode={appliedCode} onApplied={setAppliedCode} />}
              <ul className={`grid gap-6 pt-2 sm:grid-cols-2 ${plans.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                {plans.map((plan, i) => (
                  <PlanCard key={i} plan={plan} discounted={!!appliedCode} />
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="pro-steps" className="mb-10">
            <h2 id="pro-steps" className="mb-4 text-xl font-extrabold tracking-tight text-slate-100">
              Cách nâng cấp
            </h2>
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                hasBank
                  ? 'Chuyển khoản theo thông tin bên dưới, ghi đúng nội dung chuyển khoản.'
                  : 'Nhắn fanpage Belle Chinese Lab để nhận thông tin chuyển khoản.',
                contact
                  ? 'Gửi ảnh chụp giao dịch qua kênh liên hệ bên dưới.'
                  : 'Gửi ảnh chụp giao dịch cho quản trị viên.',
                'Admin kích hoạt PRO, bạn đăng xuất rồi đăng nhập lại.',
              ].map((text, i) => (
                <li key={i} className="surface flex items-start gap-3 p-5">
                  <span
                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-coral-500 text-sm font-extrabold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="sr-only">Bước {i + 1}: </span>
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-start">
            {hasBank && (
              <section aria-labelledby="pro-bank" className="surface p-5 sm:p-6 min-w-0">
                <h2 id="pro-bank" className="text-lg font-extrabold tracking-tight text-slate-100">
                  Thông tin chuyển khoản
                </h2>
                <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-start">
                  <dl className="min-w-0 flex-1">
                    <BankRow label="Ngân hàng" value={bank.bankName} />
                    <BankRow label="Số tài khoản" value={bank.accountNumber} copyLabel="số tài khoản" mono />
                    <BankRow label="Chủ tài khoản" value={bank.accountName} />
                    <BankRow label="Nội dung chuyển khoản" value={transferNote} copyLabel="nội dung chuyển khoản" />
                  </dl>
                  {bank.qrImageUrl && (
                    <img
                      src={bank.qrImageUrl}
                      alt={`Mã QR chuyển khoản${bank.bankName ? ` ${bank.bankName}` : ''}${bank.accountNumber ? `, số tài khoản ${bank.accountNumber}` : ''}`}
                      className="mx-auto w-full max-w-[220px] h-auto rounded-xl border border-night-700 bg-white p-2 sm:mx-0"
                      loading="lazy"
                    />
                  )}
                </div>
                {!user && transferNote.includes(EMAIL_PLACEHOLDER) && (
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                    Thay “{EMAIL_PLACEHOLDER}” bằng email bạn dùng để đăng nhập.
                  </p>
                )}
              </section>
            )}

            {!hasBank && !contact && (
              <aside className="surface p-5 sm:p-6 min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-100">Liên hệ</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Nhắn tin cho fanpage để nhận thông tin chuyển khoản và kích hoạt PRO:{' '}
                  <a href={FANPAGE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-coral-400 underline underline-offset-2 hover:text-coral-300">
                    Fanpage Belle Chinese Lab
                  </a>
                </p>
              </aside>
            )}
            {(contact || note) && (
              <aside className={`surface p-5 sm:p-6 min-w-0 ${hasBank ? 'lg:max-w-xs' : ''}`}>
                {contact && (
                  <>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-100">Liên hệ</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                      <Linkified text={contact} />
                    </p>
                  </>
                )}
                {note && (
                  <p className={`text-sm leading-relaxed text-slate-400 whitespace-pre-line ${contact ? 'mt-4 pt-4 border-t border-night-700' : ''}`}>
                    <Linkified text={note} />
                  </p>
                )}
              </aside>
            )}
          </div>
        </>
      )}
    </main>
  );
}

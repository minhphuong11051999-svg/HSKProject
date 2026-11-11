import { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle, Copy, Crown, Robot, BookOpen, Exam, ChatCircleText } from '@phosphor-icons/react';
import { getSettings } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

const EMAIL_PLACEHOLDER = '[email của bạn]';

const BENEFITS = [
  {
    icon: Robot,
    title: 'AI chấm bài',
    text: 'Chấm điểm theo tiêu chí của từng đề, chỉ ra lỗi ngữ pháp kèm cách sửa và gợi ý mẫu câu (套话) phù hợp.',
  },
  {
    icon: BookOpen,
    title: 'Bài học và phần học PRO',
    text: 'Mở khoá toàn bộ bài học và phần học gắn nhãn PRO.',
  },
  {
    icon: Exam,
    title: 'Đề thi thật PRO',
    text: 'Luyện với các đề thi thật gắn nhãn PRO.',
  },
];

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

function PlanCard({ plan }) {
  const features = Array.isArray(plan.features) ? plan.features.filter(Boolean) : [];
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
        <span className="text-3xl font-extrabold tracking-tight text-coral-400">{plan.price}</span>
        {plan.period && <span className="text-sm font-medium text-slate-400">{plan.period}</span>}
      </p>
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

export default function Pro() {
  const { user } = useAuth();
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => setPricing(s?.pricing || {}))
      .catch(() => {
        setPricing({});
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const isPro = user?.plan === 'PREMIUM';
  const plans = Array.isArray(pricing?.plans) ? pricing.plans : [];
  const bank = pricing?.bank || {};
  const contact = (pricing?.contact || '').trim();
  const note = (pricing?.note || '').trim();
  const hasBank = !!(bank.accountNumber || '').trim();
  const transferNote = (bank.transferNote || '').split(EMAIL_PLACEHOLDER).join(user?.email || EMAIL_PLACEHOLDER);
  const notConfigured = plans.length === 0 && !hasBank;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Gói PRO">
        Mở khoá AI chấm bài cùng toàn bộ bài học và đề thi thật gắn nhãn PRO để luyện viết HSK6 hiệu quả hơn.
      </PageHeader>

      {isPro && (
        <div className="surface mb-8 flex items-start gap-3 p-5 !border-ok/50" role="status">
          <CheckCircle size={24} weight="fill" className="flex-shrink-0 text-ok" aria-hidden="true" />
          <div>
            <p className="font-bold text-slate-100">Tài khoản của bạn đang là PRO</p>
            <p className="mt-1 text-sm text-slate-400">Cảm ơn bạn! Mọi tính năng PRO đã được mở khoá.</p>
          </div>
        </div>
      )}

      <section aria-labelledby="pro-benefits" className="mb-10">
        <h2 id="pro-benefits" className="mb-4 text-xl font-extrabold tracking-tight text-slate-100">
          Quyền lợi PRO
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface p-5">
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-coral-400/10 text-coral-400">
                <Icon size={24} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="font-bold text-slate-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
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
              <h2 id="pro-plans" className="mb-6 text-xl font-extrabold tracking-tight text-slate-100">
                Bảng giá
              </h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, i) => (
                  <PlanCard key={i} plan={plan} />
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
                'Chuyển khoản theo thông tin bên dưới, ghi đúng nội dung chuyển khoản.',
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

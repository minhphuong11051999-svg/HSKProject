import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { updateMe, changePassword } from '../api/auth';
import PageHeader from '../components/PageHeader';
import ProLabel from '../components/ProLabel';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  INPUT,
  LABEL_TEXT,
  BTN_PRIMARY,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../components/admin/ui';

const MIN_PASSWORD = 8;
const MAX_NAME = 100;

// Password input with a show/hide toggle; the label stays visible above it.
function PasswordField({ label, value, onChange, autoComplete, error }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={LABEL_TEXT}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${INPUT} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-11 rounded-r-xl text-slate-400 hover:text-coral-400"
        >
          {shown ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className={`${ERROR_TEXT} mt-1.5`} role="alert">{error}</p>
      )}
    </div>
  );
}

function InfoCard() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nameId = useId();

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const isPro = user?.plan === 'PREMIUM';
  const trimmed = name.trim();
  const unchanged = trimmed === (user?.name || '');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!trimmed) return setError('Vui lòng nhập tên.');
    if (trimmed.length > MAX_NAME) return setError(`Tên tối đa ${MAX_NAME} ký tự.`);
    setSaving(true);
    try {
      const updated = await updateMe({ name: trimmed });
      updateUser(updated && typeof updated === 'object' ? updated : { name: trimmed });
      setSuccess('Đã lưu tên.');
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={PANEL} aria-labelledby="profile-info-title">
      <h2 id="profile-info-title" className={`${PANEL_TITLE} mb-4`}>Thông tin</h2>

      <dl className="space-y-4 mb-5">
        <div>
          <dt className={LABEL_TEXT}>Email</dt>
          <dd className="text-slate-100 break-all">{user?.email}</dd>
        </div>
        <div>
          <dt className={LABEL_TEXT}>Gói</dt>
          <dd className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {isPro ? (
              <span className="bg-gold/90 text-night-950 text-xs font-bold px-2.5 py-1 rounded-full">
                <ProLabel />
              </span>
            ) : (
              <>
                <span className="border border-night-600 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  Free
                </span>
                <Link
                  to="/pro"
                  className="inline-flex items-center min-h-[44px] text-sm font-bold text-coral-400 underline underline-offset-4"
                >
                  Xem gói PRO
                </Link>
              </>
            )}
          </dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor={nameId} className={LABEL_TEXT}>Tên hiển thị</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id={nameId}
            autoComplete="name"
            maxLength={MAX_NAME}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuccess('');
            }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${nameId}-err` : undefined}
            className={`${INPUT} sm:flex-1`}
          />
          <button type="submit" disabled={saving || unchanged} className={BTN_PRIMARY}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
        {error && <p id={`${nameId}-err`} className={`${ERROR_TEXT} mt-1.5`} role="alert">{error}</p>}
        <p className={`${SUCCESS_TEXT} mt-1.5 min-h-[1.25rem]`} role="status">{success}</p>
      </form>
    </section>
  );
}

const EMPTY_PW = { current: '', next: '', confirm: '' };

function PasswordCard() {
  const [form, setForm] = useState(EMPTY_PW);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  function set(key) {
    return (value) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
      setSuccess('');
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    const next = {};
    if (!form.current) next.current = 'Vui lòng nhập mật khẩu hiện tại.';
    if (form.next.length < MIN_PASSWORD) next.next = `Mật khẩu mới cần tối thiểu ${MIN_PASSWORD} ký tự.`;
    if (form.confirm !== form.next) next.confirm = 'Mật khẩu xác nhận không khớp.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      setForm(EMPTY_PW);
      setSuccess('Đã đổi mật khẩu.');
    } catch (err) {
      const message = err.response?.data?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.';
      if (/hiện tại/i.test(message)) setErrors({ current: message });
      else if (/8/.test(message)) setErrors({ next: message });
      else setErrors({ form: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={PANEL} aria-labelledby="profile-pw-title">
      <h2 id="profile-pw-title" className={`${PANEL_TITLE} mb-1`}>Đổi mật khẩu</h2>
      <p className={`${HINT} mb-4`}>Mật khẩu mới cần tối thiểu {MIN_PASSWORD} ký tự.</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <PasswordField
          label="Mật khẩu hiện tại"
          autoComplete="current-password"
          value={form.current}
          onChange={set('current')}
          error={errors.current}
        />
        <PasswordField
          label="Mật khẩu mới"
          autoComplete="new-password"
          value={form.next}
          onChange={set('next')}
          error={errors.next}
        />
        <PasswordField
          label="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        {errors.form && <p className={ERROR_TEXT} role="alert">{errors.form}</p>}
        <button type="submit" disabled={saving} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
          {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
        <p className={`${SUCCESS_TEXT} min-h-[1.25rem]`} role="status">{success}</p>
      </form>
    </section>
  );
}

export default function Profile() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Hồ sơ của tôi" />
      <div className="space-y-6">
        <InfoCard />
        <PasswordCard />
      </div>
    </main>
  );
}

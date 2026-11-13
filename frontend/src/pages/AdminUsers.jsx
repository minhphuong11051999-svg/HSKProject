import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeSlash, Copy, Check, Shuffle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { listUsers, createUser, updateUserPlan, deleteUser, resetUserPassword } from '../api/users';
import { getSettings, updateSettings } from '../api/settings';
import ProLabel from '../components/ProLabel';
import PageHeader from '../components/PageHeader';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  INPUT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_LINK,
  BTN_LINK_DANGER,
  ERROR_TEXT,
  SUCCESS_TEXT,
  LABEL_TEXT,
} from '../components/admin/ui';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'USER' };
// PRO periods the admin can grant after a bank transfer ('' = no end date).
const PERIODS = [
  ['15', '15 ngày'],
  ['30', '30 ngày'],
  ['90', '3 tháng (90 ngày)'],
  ['', 'Không thời hạn'],
];

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// FREE, PRO with no end date, PRO running until a date, or PRO whose date has passed
// (the list returns the stored plan; the server treats an expired one as FREE).
function planStatus(u) {
  if (u.plan !== 'PREMIUM') return { kind: 'free' };
  if (!u.planExpiresAt) return { kind: 'forever' };
  const ends = new Date(u.planExpiresAt);
  if (ends.getTime() <= Date.now()) return { kind: 'expired', date: formatDate(ends) };
  return { kind: 'active', date: formatDate(ends) };
}
const MIN_PASSWORD = 8;
// No look-alike characters (0/O, 1/l/I) so the password is easy to read out or retype.
const READABLE = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomPassword(length = 10) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => READABLE[b % READABLE.length]).join('');
}

// "Liên hệ khi quên mật khẩu": shown on the login page under "Quên mật khẩu?".
function SupportContactPanel() {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getSettings()
      .then((s) => setValue(typeof s?.supportContact === 'string' ? s.supportContact : ''))
      .catch(() => setError('Không tải được cài đặt.'))
      .finally(() => setLoaded(true));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const saved = await updateSettings({ supportContact: value.trim() });
      if (typeof saved?.supportContact === 'string') setValue(saved.supportContact);
      setSuccess('Đã lưu.');
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`${PANEL} mb-6`} aria-labelledby="support-contact-title">
      <h2 id="support-contact-title" className={`${PANEL_TITLE} mb-1`}>Liên hệ khi quên mật khẩu</h2>
      <p className={`${HINT} mb-3`}>
        Hiện ở trang đăng nhập khi học viên bấm “Quên mật khẩu?”, ví dụ link Zalo/Facebook hoặc số điện thoại. Để
        trống thì trang ghi “Liên hệ người quản lý lớp học của bạn.”
      </p>
      <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="support-contact" className="sr-only">Liên hệ khi quên mật khẩu</label>
        <input
          id="support-contact"
          value={value}
          disabled={!loaded}
          onChange={(e) => {
            setValue(e.target.value);
            setSuccess('');
          }}
          placeholder="https://zalo.me/... hoặc 09xx xxx xxx"
          className={`${INPUT} sm:flex-1`}
        />
        <button type="submit" disabled={saving || !loaded} className={BTN_PRIMARY}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>
      {error && <p className={`${ERROR_TEXT} mt-2`} role="alert">{error}</p>}
      <p className={`${SUCCESS_TEXT} mt-2 empty:hidden`} role="status">{success}</p>
    </section>
  );
}

// Inline row under a user: set a new password, then show it once to copy.
function ResetPasswordRow({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [shown, setShown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [copied, setCopied] = useState(false);
  const inputId = `reset-pw-${user.id}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD) {
      setError(`Mật khẩu cần tối thiểu ${MIN_PASSWORD} ký tự.`);
      return;
    }
    if (!confirm(`Đặt lại mật khẩu cho "${user.email}"? Mật khẩu cũ sẽ không dùng được nữa.`)) return;
    setSaving(true);
    try {
      await resetUserPassword(user.id, password);
      setDone(password);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(done);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <tr className="bg-coral-400/5">
      <td colSpan={7} className="px-4 py-4">
        {done ? (
          <div role="status" className="space-y-2">
            <p className={SUCCESS_TEXT}>Đã đặt mật khẩu mới cho {user.email}:</p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-base font-bold tracking-wider text-slate-100 select-all">
                {done}
              </code>
              <button type="button" onClick={handleCopy} className={BTN_SECONDARY}>
                {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                {copied ? 'Đã chép' : 'Sao chép'}
              </button>
              <button type="button" onClick={onClose} className={BTN_LINK}>Đóng</button>
            </div>
            <p className={HINT}>
              Mật khẩu chỉ hiện một lần. Hãy gửi cho học viên và nhắc họ đổi lại trong trang “Hồ sơ của tôi”.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-2">
            <label htmlFor={inputId} className={LABEL_TEXT}>
              Mật khẩu mới cho {user.email} (tối thiểu {MIN_PASSWORD} ký tự)
            </label>
            <div className="flex flex-wrap items-start gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  id={inputId}
                  type={shown ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? `${inputId}-err` : undefined}
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShown((v) => !v)}
                  aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={shown}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-11 rounded-r-xl text-slate-400 hover:text-coral-400"
                >
                  {shown ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPassword(randomPassword());
                  setShown(true);
                  setError('');
                }}
                className={BTN_SECONDARY}
              >
                <Shuffle size={18} aria-hidden="true" />
                Tạo ngẫu nhiên
              </button>
              <button type="submit" disabled={saving} className={BTN_PRIMARY}>
                {saving ? 'Đang lưu...' : 'Xác nhận'}
              </button>
              <button type="button" onClick={onClose} className={BTN_LINK}>Huỷ</button>
            </div>
            {error && <p id={`${inputId}-err`} className={ERROR_TEXT} role="alert">{error}</p>}
          </form>
        )}
      </td>
    </tr>
  );
}

// Inline row under a user: grant PRO for a period, extend it, or turn it off.
function PlanRow({ user, onSaved, onClose }) {
  const status = planStatus(user);
  const [days, setDays] = useState('30');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const selectId = `plan-period-${user.id}`;
  const hintId = `${selectId}-hint`;

  const isOn = status.kind === 'active' || status.kind === 'forever';
  const actionLabel = status.kind === 'active' ? 'Gia hạn' : status.kind === 'forever' ? 'Đặt thời hạn' : 'Bật PRO';
  const nothingToDo = status.kind === 'forever' && days === '';
  const periodText = PERIODS.find(([v]) => v === days)?.[1] || '';

  let hint = 'Thời hạn tính từ hôm nay.';
  if (status.kind === 'active') hint = `Thời gian mới được cộng nối tiếp vào ngày hết hạn hiện tại (${status.date}).`;
  if (status.kind === 'forever') hint = 'Tài khoản đang PRO không thời hạn; chọn thời hạn sẽ thay bằng ngày hết hạn tính từ hôm nay.';
  if (days === '') hint = 'PRO không có ngày hết hạn, chỉ tắt khi bạn tắt thủ công.';

  async function save(plan, period) {
    setError('');
    setSaving(true);
    try {
      const updated = await updateUserPlan(user.id, plan, period === '' ? undefined : Number(period));
      onSaved(user, updated && typeof updated === 'object' ? updated : { plan, planExpiresAt: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật gói thất bại');
      setSaving(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (nothingToDo) return;
    if (status.kind === 'forever' && !confirm(`"${user.email}" đang PRO không thời hạn. Đổi thành PRO ${periodText} tính từ hôm nay?`)) return;
    save('PREMIUM', days);
  }

  function handleTurnOff() {
    if (!confirm(`Tắt PRO của "${user.email}"? Tài khoản trở về gói miễn phí ngay.`)) return;
    save('FREE', '');
  }

  return (
    <tr className="bg-coral-400/5">
      <td colSpan={7} className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor={selectId} className={LABEL_TEXT}>
            Thời hạn PRO cho {user.email}
          </label>
          <div className="flex flex-wrap items-start gap-3">
            <select
              id={selectId}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              aria-describedby={hintId}
              className={`${INPUT} w-full sm:w-56`}
            >
              {PERIODS.map(([value, text]) => (
                <option key={value || 'none'} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <button type="submit" disabled={saving || nothingToDo} className={BTN_PRIMARY}>
              {saving ? 'Đang lưu...' : actionLabel}
            </button>
            {(isOn || status.kind === 'expired') && (
              <button type="button" onClick={handleTurnOff} disabled={saving} className={BTN_LINK_DANGER}>
                Tắt PRO
              </button>
            )}
            <button type="button" onClick={onClose} className={BTN_LINK}>Huỷ</button>
          </div>
          <p id={hintId} className={HINT}>{hint}</p>
          {error && <p className={ERROR_TEXT} role="alert">{error}</p>}
        </form>
      </td>
    </tr>
  );
}

function PlanCell({ user }) {
  const status = planStatus(user);
  if (status.kind === 'free') return <span className="text-slate-500">Free</span>;
  return (
    <span className="flex flex-col">
      <span className={status.kind === 'expired' ? 'text-slate-500 font-semibold' : 'text-gold font-semibold'}>
        <ProLabel />
      </span>
      <span className={`text-xs whitespace-nowrap ${status.kind === 'expired' ? 'font-semibold text-[color:var(--c-hint-text)]' : 'text-slate-400'}`}>
        {status.kind === 'forever' && 'Không thời hạn'}
        {status.kind === 'active' && `Đến ${status.date}`}
        {status.kind === 'expired' && `Hết hạn ${status.date}`}
      </span>
    </span>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetFor, setResetFor] = useState(null);
  const [planFor, setPlanFor] = useState(null);
  const [planMessage, setPlanMessage] = useState('');

  function refresh() {
    setLoading(true);
    listUsers().then(setUsers).finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createUser(form);
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Tạo tài khoản thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Xoá tài khoản "${u.email}"?`)) return;
    try {
      await deleteUser(u.id);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Xoá thất bại');
    }
  }

  function handlePlanSaved(u, updated) {
    const merged = { ...u, plan: updated.plan, planExpiresAt: updated.planExpiresAt ?? null };
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...merged } : x)));
    setPlanFor(null);
    const status = planStatus(merged);
    setPlanMessage(
      status.kind === 'free'
        ? `Đã tắt PRO của ${u.email}.`
        : status.kind === 'forever'
          ? `Đã bật PRO không thời hạn cho ${u.email}.`
          : `${u.email} là PRO đến hết ${status.date}.`,
    );
  }

  function togglePlanRow(id) {
    setPlanMessage('');
    setPlanFor(planFor === id ? null : id);
    if (resetFor === id) setResetFor(null);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Quản lý người dùng"
        actions={
          <Link to="/admin" className={BTN_SECONDARY}>Quản trị bài học</Link>
        }
      />

      <SupportContactPanel />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        <section className="min-w-0">
          {loading ? (
            <p className={`${PANEL} ${HINT}`} role="status">Đang tải...</p>
          ) : (
            <>
            <p className={`${HINT} mb-3`}>
              Bấm “Gói” ở cột Premium để bật PRO theo thời hạn (15 ngày, 30 ngày, 3 tháng hoặc không thời hạn), gia hạn hoặc tắt PRO.
              Hết hạn, tài khoản tự về gói miễn phí. Sau khi bật PRO, học viên cần đăng xuất rồi đăng nhập lại để quyền PRO có hiệu lực.
            </p>
            <p className={`${SUCCESS_TEXT} mb-3 empty:hidden`} role="status">{planMessage}</p>
            <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-night-700">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th scope="col" className="px-4 py-3">Tên</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Vai trò</th>
                  <th scope="col" className="px-4 py-3">Ngày tạo</th>
                  <th scope="col" className="px-4 py-3">Số bài đã làm</th>
                  <th scope="col" className="px-4 py-3">Premium</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <Fragment key={u.id}>
                  <tr className="border-t border-night-700 first:border-t-0 hover:bg-coral-400/5 transition-colors">
                    <td className="px-4 py-2 font-semibold text-slate-100">{u.name}</td>
                    <td className="px-4 py-2 text-slate-300">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-coral-400/10 px-2.5 py-0.5 text-xs font-bold text-coral-400">{u.role}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-2 text-center tabular-nums">{u.submissionCount}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <PlanCell user={u} />
                        <button
                          type="button"
                          onClick={() => togglePlanRow(u.id)}
                          aria-expanded={planFor === u.id}
                          className={`${BTN_LINK} whitespace-nowrap`}
                        >
                          {planStatus(u).kind === 'active' ? 'Gia hạn' : 'Gói'}
                          <span className="sr-only"> của {u.email}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setResetFor(resetFor === u.id ? null : u.id);
                            if (planFor === u.id) setPlanFor(null);
                          }}
                          aria-expanded={resetFor === u.id}
                          className={`${BTN_LINK} whitespace-nowrap`}
                        >
                          Đặt lại mật khẩu
                        </button>
                        {u.id !== me?.id && (
                          <button onClick={() => handleDelete(u)} className={BTN_LINK_DANGER}>Xoá</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {planFor === u.id && (
                    <PlanRow user={u} onSaved={handlePlanSaved} onClose={() => setPlanFor(null)} />
                  )}
                  {resetFor === u.id && <ResetPasswordRow user={u} onClose={() => setResetFor(null)} />}
                  </Fragment>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </section>

        <section className={`${PANEL} lg:sticky lg:top-[5.5rem]`}>
          <h2 className={`${PANEL_TITLE} mb-4`}>Tạo tài khoản mới</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              aria-label="Họ tên"
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={INPUT}
            />
            <input
              type="email"
              required
              aria-label="Email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={INPUT}
            />
            <input
              type="password"
              required
              minLength={8}
              aria-label="Mật khẩu (tối thiểu 8 ký tự)"
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={INPUT}
            />
            <select
              aria-label="Vai trò"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={INPUT}
            >
              <option value="USER">Người dùng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {error && <p className={ERROR_TEXT} role="alert">{error}</p>}
            <button type="submit" disabled={saving} className={`${BTN_PRIMARY} w-full`}>
              {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { getSettings } from '../api/settings';
import { INPUT_LG, LABEL_TEXT, BTN_PRIMARY_LG, ERROR_TEXT, HINT } from '../components/admin/ui';

const inputClass = INPUT_LG;

const LOGIN_ERRORS = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng.',
};

const URL_RE = /(https?:\/\/[^\s]+)/g;

// Shows the admin-configured contact, turning any URLs in it into links.
function SupportContact({ text }) {
  if (!text) return <p className="mt-2 font-semibold text-slate-100">Liên hệ người quản lý lớp học của bạn.</p>;
  const parts = text.split(URL_RE);
  return (
    <p className="mt-2 font-semibold text-slate-100 break-words whitespace-pre-line">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral-400 underline underline-offset-4 break-all"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [contact, setContact] = useState(null); // null = not loaded yet
  const [contactError, setContactError] = useState(false);

  function toggleForgot() {
    const next = !forgotOpen;
    setForgotOpen(next);
    if (next && (contact === null || contactError)) {
      setContactError(false);
      setContact(null);
      getSettings()
        .then((s) => setContact(typeof s?.supportContact === 'string' ? s.supportContact.trim() : ''))
        .catch(() => {
          setContactError(true);
          setContact('');
        });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message;
      setError(LOGIN_ERRORS[message] || message || 'Đăng nhập thất bại');
    }
  }

  return (
    <main className="px-4 sm:px-6 py-10 sm:py-16">
      <div className="surface mx-auto max-w-sm lg:max-w-4xl overflow-hidden lg:grid lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden lg:flex items-center justify-center bg-coral-400/10 border-r border-night-700 p-8">
          <img
            src="/img/home-hero-800.webp"
            alt=""
            aria-hidden="true"
            width="800"
            height="510"
            className="app-hero-art w-full h-auto"
          />
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <p className="kicker">
            <span className="zh" lang="zh">写作工坊</span> · HSK6
          </p>
          <h1 className="mt-2 mb-8 text-[2rem] leading-tight font-extrabold tracking-tight text-slate-100">Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className={LABEL_TEXT}>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <div>
              <label htmlFor="login-password" className={LABEL_TEXT}>Mật khẩu</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 rounded-r-xl text-slate-400 hover:text-coral-400"
                >
                  {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleForgot}
                  aria-expanded={forgotOpen}
                  aria-controls="forgot-panel"
                  className="inline-flex items-center min-h-[44px] text-sm font-bold text-coral-400 underline underline-offset-4"
                >
                  Quên mật khẩu?
                </button>
              </div>
              {forgotOpen && (
                <div id="forgot-panel" className="rounded-xl border border-night-600 bg-coral-400/5 p-4 text-sm">
                  <p className={HINT}>
                    Web chưa hỗ trợ tự đặt lại mật khẩu qua email. Vui lòng liên hệ admin để được cấp mật khẩu mới:
                  </p>
                  {contact === null ? (
                    <p className={`${HINT} mt-2`} role="status">Đang tải...</p>
                  ) : (
                    <>
                      <SupportContact text={contact} />
                      {contactError && (
                        <p className={`${HINT} mt-1`}>(Không tải được thông tin liên hệ.)</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            {error && (
              <p className={ERROR_TEXT} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={`${BTN_PRIMARY_LG} w-full`}>
              Đăng nhập
            </button>
          </form>

          <p className="text-sm mt-6 text-slate-400">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="inline-flex items-center min-h-[44px] font-bold text-coral-400 underline underline-offset-4"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

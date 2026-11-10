import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INPUT_LG, LABEL_TEXT, BTN_PRIMARY_LG, ERROR_TEXT } from '../components/admin/ui';

const inputClass = INPUT_LG;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
            <label className="block">
              <span className={LABEL_TEXT}>Mật khẩu</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
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

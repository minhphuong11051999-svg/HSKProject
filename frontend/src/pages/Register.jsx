import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full bg-night-800 border border-night-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-coral-500';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-xl font-bold mb-6 text-center">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-lg py-2 font-semibold transition-colors">
          Đăng ký
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-slate-400">
        Đã có tài khoản? <Link to="/login" className="text-coral-400 underline">Đăng nhập</Link>
      </p>
    </main>
  );
}

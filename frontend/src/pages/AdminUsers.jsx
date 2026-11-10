import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, createUser, updateUserPlan, deleteUser } from '../api/users';
import ProLabel from '../components/ProLabel';
import PageHeader from '../components/PageHeader';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  INPUT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_LINK_DANGER,
  ERROR_TEXT,
  CHECKBOX,
} from '../components/admin/ui';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'USER' };

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  async function togglePremium(u) {
    const nextPlan = u.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan: nextPlan } : x)));
    try {
      await updateUserPlan(u.id, nextPlan);
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật gói thất bại');
      refresh();
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Quản lý người dùng"
        actions={
          <Link to="/admin" className={BTN_SECONDARY}>Quản trị bài học</Link>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        <section className="min-w-0">
          {loading ? (
            <p className={`${PANEL} ${HINT}`} role="status">Đang tải...</p>
          ) : (
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
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-night-700 first:border-t-0 hover:bg-coral-400/5 transition-colors">
                    <td className="px-4 py-2 font-semibold text-slate-100">{u.name}</td>
                    <td className="px-4 py-2 text-slate-300">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-coral-400/10 px-2.5 py-0.5 text-xs font-bold text-coral-400">{u.role}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-2 text-center tabular-nums">{u.submissionCount}</td>
                    <td className="px-4 py-2">
                      <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                        <input
                          type="checkbox"
                          className={CHECKBOX}
                          checked={u.plan === 'PREMIUM'}
                          onChange={() => togglePremium(u)}
                        />
                        <span className={u.plan === 'PREMIUM' ? 'text-gold font-semibold' : 'text-slate-500'}>
                          {u.plan === 'PREMIUM' ? <ProLabel /> : 'Free'}
                        </span>
                      </label>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {u.id !== me?.id && (
                        <button onClick={() => handleDelete(u)} className={BTN_LINK_DANGER}>Xoá</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>

        <section className={`${PANEL} lg:sticky lg:top-6`}>
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

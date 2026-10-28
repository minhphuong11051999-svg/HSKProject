import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, createUser, deleteUser } from '../api/users';

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

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Quản lý người dùng</h1>
        <Link to="/admin" className="text-sm text-indigo-600 underline">Quản trị bài học</Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <section>
          {loading ? (
            <p className="text-slate-500">Đang tải...</p>
          ) : (
            <table className="w-full text-sm bg-white border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Vai trò</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Số bài đã làm</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3 text-center">{u.submissionCount}</td>
                    <td className="p-3 text-right">
                      {u.id !== me?.id && (
                        <button onClick={() => handleDelete(u)} className="text-seal underline">Xoá</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-3">Tạo tài khoản mới</h2>
          <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-slate-300 rounded-lg p-4">
            <input
              required
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="USER">Người dùng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {error && <p className="text-seal text-sm">{error}</p>}
            <button type="submit" disabled={saving} className="w-full bg-indigo-900 text-white rounded-lg py-2 font-semibold">
              {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

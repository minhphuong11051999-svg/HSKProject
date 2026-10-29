import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-night-950" />;
  }

  if (user) {
    return (
      <div className="flex min-h-screen bg-night-950 text-slate-100">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 text-slate-100">
      <TopNav />
      <Outlet />
    </div>
  );
}

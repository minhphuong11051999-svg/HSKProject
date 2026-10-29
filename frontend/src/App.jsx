import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const History = lazy(() => import('./pages/History'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));

function PageFallback() {
  return <div className="p-10 text-center text-slate-500">Đang tải...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/lessons/:slug"
            element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

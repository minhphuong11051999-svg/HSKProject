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
const Lessons = lazy(() => import('./pages/Lessons'));
const SamplePapers = lazy(() => import('./pages/SamplePapers'));
const SamplePaperViewer = lazy(() => import('./pages/SamplePaperViewer'));
const AdminSamplePapers = lazy(() => import('./pages/AdminSamplePapers'));
const ExamSittings = lazy(() => import('./pages/ExamSittings'));
const ExamSittingViewer = lazy(() => import('./pages/ExamSittingViewer'));
const AdminExamSittings = lazy(() => import('./pages/AdminExamSittings'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
            path="/lessons"
            element={
              <ProtectedRoute>
                <Lessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/practice"
            element={
              <ProtectedRoute>
                <Lessons type="practice" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/exam"
            element={
              <ProtectedRoute>
                <ExamSittings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:slug"
            element={
              <ProtectedRoute>
                <ExamSittingViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:slug"
            element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <SamplePapers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:slug"
            element={
              <ProtectedRoute>
                <SamplePaperViewer />
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
          <Route
            path="/admin/sample-papers"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminSamplePapers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exam-sittings"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminExamSittings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import DailyNews from './pages/DailyNews.jsx';
import SubmitNews from './pages/SubmitNews.jsx';
import AdminAllNews from './pages/AdminAllNews.jsx';
import AdminByStatus from './pages/AdminByStatus.jsx';

// "/" is the login portal, rendered standalone (no sidebar/topbar — a
// visitor isn't "in the app" yet). Everything else is nested under a
// single ProtectedRoute + AppLayout pair: ProtectedRoute gates entry to
// any signed-in user, AppLayout renders the sidebar/topbar shell once,
// and each child route fills the <Outlet /> in turn. The two admin pages
// get an extra ProtectedRoute with adminOnly for the stricter check.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/daily-news" element={<DailyNews />} />
        <Route path="/submit" element={<SubmitNews />} />
        <Route
          path="/admin/all-news"
          element={
            <ProtectedRoute adminOnly>
              <AdminAllNews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/by-status"
          element={
            <ProtectedRoute adminOnly>
              <AdminByStatus />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

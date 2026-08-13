import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Two levels of protection:
//   - default: any signed-in user (student OR admin) may pass
//   - adminOnly: only signed-in admins may pass; a signed-in student
//     gets bounced to the daily news feed rather than the landing page,
//     since they ARE authenticated — they just lack the role for this page
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Landing page ("/") is the single login portal now, so unauthenticated
    // visitors always redirect there instead of to a page-specific login route.
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/daily-news" replace />;
  }

  return children;
}

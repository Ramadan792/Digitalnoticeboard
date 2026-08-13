import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { isAuthenticated, loginStudent, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 'choose' | 'student' | 'admin' — which panel is showing right now.
  const [mode, setMode] = useState('choose');
  const [studentId, setStudentId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/daily-news';

  // Already signed in (e.g. came back to "/" manually)? Skip the portal.
  if (isAuthenticated) {
    navigate(redirectTo, { replace: true });
    return null;
  }

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const match = loginStudent(studentId);
    if (match) {
      navigate('/daily-news', { replace: true });
    } else {
      setError('Student ID not recognized.');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    // loginAdmin matches the typed name case/whitespace-insensitively
    // against the hardcoded admin list, so "mrs. adaeze okoro" still works.
    const match = loginAdmin(adminName, adminPassword);
    if (match) {
      navigate('/admin/all-news', { replace: true });
    } else {
      setError('Incorrect name or password.');
    }
  };

  const backToChoose = () => {
    setMode('choose');
    setError('');
    setStudentId('');
    setAdminName('');
    setAdminPassword('');
    setShowPassword(false);
  };

  return (
    <div className="landing-screen">
      <div className="landing-card">
        {mode === 'choose' && (
          <>
            <h1>Online Bulletin Board</h1>
            <p className="page-subtext">Sign in as:</p>
            <div className="landing-choice-row">
              <button className="landing-choice-btn" onClick={() => { setMode('student'); setError(''); }}>
                <GraduationCap size={26} />
                <span>Student</span>
              </button>
              <button className="landing-choice-btn" onClick={() => { setMode('admin'); setError(''); }}>
                <ShieldCheck size={26} />
                <span>Admin</span>
              </button>
            </div>
          </>
        )}

        {mode === 'student' && (
          <>
            <button className="landing-back-btn" onClick={backToChoose}>
              <ArrowLeft size={15} /> Back
            </button>
            <h1>Student Sign In</h1>
            <p className="page-subtext">Enter your student ID — no password needed.</p>
            <form onSubmit={handleStudentSubmit}>
              <label className="form-field">
                <span>Student ID</span>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="STU-2024-001"
                  required
                />
              </label>
              <button type="submit" className="btn-primary login-submit">Sign In</button>
              {error && <p className="status-error">{error}</p>}
            </form>
          </>
        )}

        {mode === 'admin' && (
          <>
            <button className="landing-back-btn" onClick={backToChoose}>
              <ArrowLeft size={15} /> Back
            </button>
            <h1>Admin Sign In</h1>
            <p className="page-subtext">Enter your name and the shared admin password.</p>
            <form onSubmit={handleAdminSubmit}>
              <label className="form-field">
                <span>Admin Name</span>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Main Admin"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="form-field">
                <span>Password</span>
                {/* Eye toggle just swaps the input's type between
                    "password" and "text" — the value itself never changes,
                    only whether the browser masks it. */}
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <button type="submit" className="btn-primary login-submit">Sign In</button>
              {error && <p className="status-error">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

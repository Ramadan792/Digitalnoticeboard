import { Sun, Moon, LogOut, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Topbar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="topbar-user">
        <span className="topbar-user-icon">
          {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
        </span>
        <div className="topbar-user-text">
          <span className="topbar-user-name">{user?.name}</span>
          <span className="topbar-user-role">{isAdmin ? 'Admin' : 'Student'}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <button className="topbar-logout" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

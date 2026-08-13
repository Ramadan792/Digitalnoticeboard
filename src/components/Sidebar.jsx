import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Megaphone,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FilePlus,
  ListChecks,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// "Welcome" is gone now that "/" is the login portal (it redirects signed-in
// users straight to Daily News, so a nav link back to it would be dead-end
// for anyone actually using the sidebar). "Admin access" is still modeled
// as a normal section — visibility is filtered at render time based on role,
// not hardcoded into two separate nav arrays.
const SECTIONS = [
  {
    label: 'Bulletin board',
    adminOnly: false,
    items: [
      { label: 'Daily News', to: '/daily-news', icon: FileText },
      { label: 'Submit your news', to: '/submit', icon: FilePlus },
    ],
  },
  {
    label: 'Admin access',
    adminOnly: true,
    items: [
      { label: 'All submitted news', to: '/admin/all-news', icon: ListChecks },
      { label: 'News by status', to: '/admin/by-status', icon: BarChart3 },
    ],
  },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();

  // Desktop collapse: shrinks to icon-only rail. Independent from mobile
  // open/closed state, which is a full show/hide overlay instead.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.label, true]))
  );

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Students never see the "Admin access" section at all — this is the
  // sidebar half of "students cannot access admin panels"; the other half
  // is ProtectedRoute's adminOnly check, which stops direct URL access too.
  const visibleSections = SECTIONS.filter((s) => !s.adminOnly || isAdmin);

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">
              <Megaphone size={18} />
            </span>
            {!collapsed && <span className="sidebar-brand-name">Online bulletin board</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              {!collapsed && (
                <button
                  className="sidebar-section-header"
                  onClick={() => toggleSection(section.label)}
                >
                  <span>{section.label}</span>
                  {openSections[section.label] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}

              {(collapsed || openSections[section.label]) && (
                <div className="sidebar-section-items">
                  {section.items.map(({ label, to, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                    >
                      <Icon size={17} />
                      {!collapsed && <span>{label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

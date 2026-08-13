import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

// A "layout route" in React Router v6: this renders once, and whichever
// child route matches gets slotted into <Outlet />. Keeps App.jsx's route
// table flat and readable instead of nesting a second <Routes> by hand.
export default function AppLayout() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="shell-main">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}

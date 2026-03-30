import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getActiveUser } from '../utils/getActiveUser';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/WaiterLayout.css';

export default function WaiterLayout() {
  const { name } = getActiveUser();
  const outlet    = getActiveOutlet();
  const firstName = name?.split(' ')[0] || 'Waiter';
  const navigate  = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.clear();
      navigate('/sign-in');
    }
  };

  return (
    <div className="wl-layout">
      <header className="wl-header">
        <span className="wl-greeting">Hello, {firstName}</span>
        <div className="wl-header-right">
          {outlet && <span className="wl-outlet-badge">{outlet}</span>}
          <button className="wl-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <main className="wl-content">
        <Outlet />
      </main>
    </div>
  );
}

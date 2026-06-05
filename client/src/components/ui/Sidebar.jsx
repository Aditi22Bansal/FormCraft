import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'My Forms' },
  { to: '/dashboard', icon: FileText, label: 'Templates' },
  { to: '/dashboard', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-40">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-text text-xs font-bold">F</div>
          <span className="font-semibold text-text">FormCraft</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={label} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border-l-2 ${
                isActive ? 'bg-accent-subtle border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text hover:bg-elevated'
              }`
            }>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{user?.name}</p>
            <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-text-tertiary hover:text-text transition-colors duration-150">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

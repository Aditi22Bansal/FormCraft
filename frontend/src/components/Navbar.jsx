import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
            <rect x="3" y="3" width="8" height="5" rx="1.5" fill="currentColor" opacity="0.8" />
            <rect x="3" y="10" width="8" height="5" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="13" y="3" width="8" height="12" rx="1.5" fill="currentColor" opacity="0.3" />
            <rect x="3" y="17" width="18" height="4" rx="1.5" fill="currentColor" opacity="0.15" />
          </svg>
          FormCraft
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            to="/forms/new"
            className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">New Form</span>
          </Link>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <span className="hidden sm:block text-sm text-gray-600 max-w-[120px] truncate">
              {user?.name}
            </span>
            {user?.role === 'admin' && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

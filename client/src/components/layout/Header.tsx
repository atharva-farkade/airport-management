import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6">
      <h2 className="text-sm font-mono text-slate-400">
        Airport Service Management Platform
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <User size={16} className="text-slate-400" />
          <span>{user?.fullName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

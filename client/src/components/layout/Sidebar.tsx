import { NavLink } from 'react-router-dom';
import { Plane, LayoutDashboard, Users, Clock, Wrench, ClipboardCheck, Receipt, TrendingUp, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  airport_admin: [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Flights', path: '/admin/flights', icon: <Plane size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Turnaround', path: '/admin/turnaround', icon: <Clock size={18} /> },
  ],
  airline_staff: [
    { name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={18} /> },
    { name: 'Flights', path: '/staff/flights', icon: <Plane size={18} /> },
    { name: 'Services', path: '/staff/services', icon: <ClipboardCheck size={18} /> },
  ],
  service_vendor: [
    { name: 'Dashboard', path: '/vendor', icon: <LayoutDashboard size={18} /> },
    { name: 'My Tasks', path: '/vendor/tasks', icon: <Wrench size={18} /> },
  ],
  finance: [
    { name: 'Dashboard', path: '/finance', icon: <LayoutDashboard size={18} /> },
    { name: 'Tariffs', path: '/finance/tariffs', icon: <CreditCard size={18} /> },
    { name: 'Invoices', path: '/finance/invoices', icon: <Receipt size={18} /> },
    { name: 'Revenue', path: '/finance/revenue', icon: <TrendingUp size={18} /> },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = navByRole[user.role];

  return (
    <aside className="w-60 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Plane className="text-sky-400" size={22} />
        <span className="font-display font-bold text-lg">ASMP</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">
          {user.role.replace(/_/g, ' ')}
        </p>
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${user.role.split('_')[0]}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sky-500/10 border-l-2 border-sky-400 text-sky-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

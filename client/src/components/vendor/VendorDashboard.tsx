import { useEffect, useState } from 'react';
import { Wrench, CheckCircle } from 'lucide-react';
import { vendorService } from '../../services/vendor';
import { useSocketEvent } from '../../hooks/useSocket';
import { Card } from '../ui';
import { ServiceRequest } from '../../types';

export function VendorDashboard() {
  const [tasks, setTasks] = useState<ServiceRequest[]>([]);

  const loadTasks = () => {
    vendorService.getMyTasks().then(r => setTasks(r.data.data));
  };

  useEffect(() => { loadTasks(); }, []);

  useSocketEvent(['services_requested', 'service_started'], loadTasks);

  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Vendor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card accent="amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-3xl font-mono tabular-nums">{pending}</p>
            </div>
            <Wrench className="text-amber-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="sky">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">In Progress</p>
              <p className="text-3xl font-mono tabular-nums">{inProgress}</p>
            </div>
            <Wrench className="text-sky-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-3xl font-mono tabular-nums">{completed}</p>
            </div>
            <CheckCircle className="text-green-400 opacity-50" size={32} />
          </div>
        </Card>
      </div>
    </div>
  );
}

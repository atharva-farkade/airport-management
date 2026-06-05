import { useEffect, useState } from 'react';
import { Plane, Users, Clock } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useSocketEvent } from '../../hooks/useSocket';
import { Card } from '../ui';
import { FlightDetails } from '../../types';

export function AdminDashboard() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [userCount, setUserCount] = useState(0);

  const loadData = () => {
    adminService.getUpcomingFlights().then(r => setFlights(r.data.data.flights));
    adminService.getUsers().then(r => setUserCount(r.data.data.length));
  };

  useEffect(() => { loadData(); }, []);

  useSocketEvent(['flight_arrived', 'flight_departed', 'services_requested'], loadData);

  const arrived = flights.filter(f => f.status === 'arrived').length;
  const scheduled = flights.filter(f => f.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card accent="sky">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Flights</p>
              <p className="text-3xl font-mono tabular-nums">{flights.length}</p>
            </div>
            <Plane className="text-sky-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Scheduled / Arrived</p>
              <p className="text-3xl font-mono tabular-nums">{scheduled} / {arrived}</p>
            </div>
            <Clock className="text-amber-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Users</p>
              <p className="text-3xl font-mono tabular-nums">{userCount}</p>
            </div>
            <Users className="text-green-400 opacity-50" size={32} />
          </div>
        </Card>
      </div>
    </div>
  );
}

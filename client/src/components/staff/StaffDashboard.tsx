import { useEffect, useState } from 'react';
import { Plane, ClipboardCheck } from 'lucide-react';
import { staffService } from '../../services/staff';
import { Card } from '../ui';
import { FlightDetails } from '../../types';

export function StaffDashboard() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);

  useEffect(() => {
    staffService.getArrivedFlights().then(r => setFlights(r.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card accent="sky">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Arrived Flights</p>
              <p className="text-3xl font-mono tabular-nums">{flights.length}</p>
            </div>
            <Plane className="text-sky-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Awaiting Service</p>
              <p className="text-3xl font-mono tabular-nums">{flights.length}</p>
            </div>
            <ClipboardCheck className="text-green-400 opacity-50" size={32} />
          </div>
        </Card>
      </div>
    </div>
  );
}

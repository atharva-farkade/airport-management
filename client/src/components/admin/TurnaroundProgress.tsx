import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import { Card } from '../ui';
import { FlightDetails, TurnaroundStatus } from '../../types';

const states: TurnaroundStatus[] = ['in_air', 'landed', 'on_block', 'servicing', 'boarding', 'ready_for_departure', 'departed'];

function TurnaroundTimeline({ current }: { current: TurnaroundStatus }) {
  const currentIdx = states.indexOf(current);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {states.map((state, i) => (
        <div key={state} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${
              i < currentIdx ? 'bg-green-400' :
              i === currentIdx ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]' :
              'bg-slate-700'
            }`} />
            <span className={`text-[10px] mt-1 whitespace-nowrap ${
              i === currentIdx ? 'text-cyan-400' : 'text-slate-500'
            }`}>{state.replace(/_/g, ' ')}</span>
          </div>
          {i < states.length - 1 && (
            <div className={`w-6 h-0.5 mx-1 ${i < currentIdx ? 'bg-green-400' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function TurnaroundProgress() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);

  useEffect(() => {
    adminService.getUpcomingFlights().then(r => {
      setFlights(r.data.data.flights.filter((f: FlightDetails) => f.status === 'arrived'));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Turnaround Status</h1>
      {flights.length === 0 ? (
        <Card><p className="text-slate-500">No active turnarounds</p></Card>
      ) : (
        flights.map(f => (
          <Card key={f._id} accent="sky">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-lg">{f.flightNumber}</span>
              <span className="text-sm text-slate-400">{(f as unknown as Record<string, string>).airlineName} • {f.aircraftType}</span>
            </div>
            <TurnaroundTimeline current={f.turnaroundStatus} />
          </Card>
        ))
      )}
    </div>
  );
}

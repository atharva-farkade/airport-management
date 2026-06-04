import { useEffect, useState } from 'react';
import { staffService } from '../../services/staff';
import { Button, Card, Table, Badge } from '../ui';
import { FlightDetails, ServiceRequest } from '../../types';

export function ServiceVerification() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [services, setServices] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    staffService.getArrivedFlights().then(r => setFlights(r.data.data));
  }, []);

  useEffect(() => {
    if (selectedFlightId) {
      staffService.getFlightServices(selectedFlightId).then(r => setServices(r.data.data));
    }
  }, [selectedFlightId]);

  const verify = async (id: string) => {
    await staffService.verifyService(id);
    staffService.getFlightServices(selectedFlightId).then(r => setServices(r.data.data));
  };

  const statusVariant = (s: string) => {
    const map: Record<string, 'pending' | 'in_progress' | 'completed' | 'verified'> = {
      pending: 'pending', assigned: 'pending', in_progress: 'in_progress', completed: 'completed', verified: 'verified',
    };
    return map[s] || 'default';
  };

  const columns = [
    { key: 'serviceId', header: 'ID', render: (s: ServiceRequest) => <span className="font-mono text-xs">{s.serviceRequestId || (s as unknown as Record<string, string>).serviceId}</span> },
    { key: 'serviceType', header: 'Service', render: (s: ServiceRequest) => s.serviceType.replace(/_/g, ' ') },
    { key: 'status', header: 'Status', render: (s: ServiceRequest) => <Badge variant={statusVariant(s.status)}>{s.status}</Badge> },
    {
      key: 'actions', header: '', render: (s: ServiceRequest) =>
        s.status === 'completed' ? (
          <Button variant="primary" onClick={() => verify(s._id)}>Verify ✓</Button>
        ) : null
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Service Verification</h1>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-400">Select Flight</label>
        <select
          className="w-full max-w-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500"
          value={selectedFlightId}
          onChange={e => setSelectedFlightId(e.target.value)}
        >
          <option value="">Choose a flight</option>
          {flights.map(f => <option key={f._id} value={f._id}>{f.flightNumber} — {(f as unknown as Record<string, string>).airlineName}</option>)}
        </select>
      </div>

      {selectedFlightId && (
        <Card>
          <Table columns={columns} data={services} keyExtractor={s => s._id} emptyMessage="No services for this flight" />
        </Card>
      )}
    </div>
  );
}

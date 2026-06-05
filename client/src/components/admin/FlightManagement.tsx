import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/admin';
import { useSocketEvent } from '../../hooks/useSocket';
import { Button, Input, Card, Table, Badge, Modal } from '../ui';
import { FlightDetails } from '../../types';

export function FlightManagement() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadFlights = () => {
    adminService.getUpcomingFlights().then(r => setFlights(r.data.data.flights));
  };

  useEffect(() => { loadFlights(); }, []);

  useSocketEvent(['flight_arrived', 'flight_departed', 'turnaround_status_update'], loadFlights);

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await adminService.registerFlight({
        flightNumber: data.flightNumber,
        airlineName: data.airlineName,
        aircraftType: data.aircraftType,
        aircraftRegistration: data.aircraftRegistration,
        origin: data.origin,
        destination: data.destination,
        sta: data.sta,
        std: data.std,
      });
      reset();
      setShowForm(false);
      loadFlights();
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setError(null);
      await adminService.updateFlightStatus(id, status);
      loadFlights();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update flight status';
      setError(msg);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'pending' | 'in_progress' | 'completed'> = {
      scheduled: 'pending', arrived: 'in_progress', departed: 'completed',
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    { key: 'flightNumber', header: 'Flight', render: (f: FlightDetails) => <span className="font-mono">{f.flightNumber}</span> },
    { key: 'airlineName', header: 'Airline', render: (f: FlightDetails) => (f as unknown as Record<string, string>).airlineName || '' },
    { key: 'origin', header: 'Origin' },
    { key: 'destination', header: 'Destination' },
    { key: 'aircraftType', header: 'Aircraft' },
    { key: 'status', header: 'Status', render: (f: FlightDetails) => statusBadge(f.status) },
    {
      key: 'actions', header: 'Actions', render: (f: FlightDetails) => (
        <div className="flex gap-2">
          {f.status === 'scheduled' && (
            <Button variant="secondary" onClick={() => updateStatus(f._id, 'arrived')}>Mark Arrived</Button>
          )}
          {f.status === 'arrived' && (
            <Button variant="secondary" onClick={() => updateStatus(f._id, 'departed')}>Mark Departed</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Flight Management</h1>
        <Button onClick={() => setShowForm(true)}>+ Register Flight</Button>
      </div>

      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-950 border border-red-500/50 border-l-4 border-l-red-500 rounded-md px-5 py-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-[slideIn_0.3s_ease]">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Action Failed</p>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-300 text-sm">✕</button>
          </div>
        </div>
      )}

      <Card>
        <Table columns={columns} data={flights} keyExtractor={f => f._id} emptyMessage="No flights registered" />
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Register Flight">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Flight Number" placeholder="AI-441" {...register('flightNumber', { required: true })} />
          <Input label="Airline Name" placeholder="Air India" {...register('airlineName', { required: true })} />
          <Input label="Aircraft Type" placeholder="B737" {...register('aircraftType', { required: true })} />
          <Input label="Aircraft Registration" placeholder="VT-ABC" {...register('aircraftRegistration')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Origin" placeholder="DEL" {...register('origin', { required: true })} />
            <Input label="Destination" placeholder="BOM" {...register('destination', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="STA (Scheduled Arrival)" type="datetime-local" {...register('sta', { required: true })} />
            <Input label="STD (Scheduled Departure)" type="datetime-local" {...register('std', { required: true })} />
          </div>
          <Button type="submit" isLoading={loading} className="w-full">Register</Button>
        </form>
      </Modal>
    </div>
  );
}

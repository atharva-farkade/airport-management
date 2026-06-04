import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/admin';
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

  const updateStatus = async (id: string, status: string) => {
    await adminService.updateFlightStatus(id, status);
    loadFlights();
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

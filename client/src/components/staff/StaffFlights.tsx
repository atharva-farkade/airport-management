import { useEffect, useState } from 'react';
import { staffService } from '../../services/staff';
import { Button, Card, Table, Badge, Modal } from '../ui';
import { FlightDetails, ServiceType } from '../../types';

const serviceTypes: ServiceType[] = [
  'REFUELING', 'CATERING', 'BAGGAGE_HANDLING', 'CABIN_CLEANING',
  'LINE_MAINTENANCE', 'WATER_SERVICE', 'LAVATORY_SERVICE',
  'PUSHBACK_TOWING', 'GROUND_HANDLING', 'FLIGHT_INSPECTION', 'BAGGAGE_UNLOADING',
];

export function StaffFlights() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDetails | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    staffService.getArrivedFlights().then(r => setFlights(r.data.data));
  }, []);

  const toggleService = (s: ServiceType) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const submitRequest = async () => {
    if (!selectedFlight || selectedServices.length === 0) return;
    setLoading(true);
    try {
      await staffService.requestServices({
        flightId: selectedFlight._id,
        services: selectedServices.map(s => ({ serviceType: s })),
      });
      setSelectedFlight(null);
      setSelectedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'flightNumber', header: 'Flight', render: (f: FlightDetails) => <span className="font-mono">{f.flightNumber}</span> },
    { key: 'airline', header: 'Airline' },
    { key: 'aircraftType', header: 'Aircraft' },
    { key: 'origin', header: 'From' },
    { key: 'turnaroundStatus', header: 'Turnaround', render: (f: FlightDetails) => <Badge variant="in_progress">{f.turnaroundStatus.replace(/_/g, ' ')}</Badge> },
    {
      key: 'actions', header: '', render: (f: FlightDetails) => (
        <Button variant="secondary" onClick={() => setSelectedFlight(f)}>Request Services</Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Arrived Flights</h1>
      <Card>
        <Table columns={columns} data={flights} keyExtractor={f => f._id} emptyMessage="No arrived flights" />
      </Card>

      <Modal isOpen={!!selectedFlight} onClose={() => setSelectedFlight(null)} title={`Request Services — ${selectedFlight?.flightNumber}`}>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Select services to request:</p>
          <div className="grid grid-cols-2 gap-2">
            {serviceTypes.map(s => (
              <button
                key={s}
                onClick={() => toggleService(s)}
                className={`p-2 text-xs rounded-md border transition-colors text-left ${
                  selectedServices.includes(s)
                    ? 'border-sky-400 bg-sky-400/10 text-sky-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <Button onClick={submitRequest} isLoading={loading} className="w-full" disabled={selectedServices.length === 0}>
            Submit Request ({selectedServices.length})
          </Button>
        </div>
      </Modal>
    </div>
  );
}

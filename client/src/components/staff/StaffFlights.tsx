import { useEffect, useState } from 'react';
import { staffService } from '../../services/staff';
import { useSocketEvent } from '../../hooks/useSocket';
import { Button, Card, Table, Badge, Modal } from '../ui';
import { FlightDetails, ServiceType, ServiceRequest } from '../../types';

const serviceTypes: ServiceType[] = [
  'REFUELING', 'CATERING', 'BAGGAGE_HANDLING', 'CABIN_CLEANING',
  'LINE_MAINTENANCE', 'WATER_SERVICE', 'LAVATORY_SERVICE',
  'PUSHBACK_TOWING', 'GROUND_HANDLING', 'FLIGHT_INSPECTION', 'BAGGAGE_UNLOADING',
];

const defaultUnits: Record<string, string> = {
  REFUELING: 'liter',
  CATERING: 'meal',
  BAGGAGE_HANDLING: 'Kg',
  CABIN_CLEANING: 'fixed',
  LINE_MAINTENANCE: 'hour',
  WATER_SERVICE: 'liter',
  LAVATORY_SERVICE: 'fixed',
  PUSHBACK_TOWING: 'fixed',
  GROUND_HANDLING: 'hour',
  FLIGHT_INSPECTION: 'fixed',
  BAGGAGE_UNLOADING: 'Kg',
};

interface ServiceEntry {
  serviceType: ServiceType;
  quantityEstimate: number;
  unit: string;
}

export function StaffFlights() {
  const [flights, setFlights] = useState<FlightDetails[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDetails | null>(null);
  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([]);
  const [existingServices, setExistingServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFlights = () => {
    staffService.getArrivedFlights().then(r => setFlights(r.data.data));
  };

  useEffect(() => { loadFlights(); }, []);

  useSocketEvent(['flight_arrived', 'turnaround_status_update'], loadFlights);

  const openModal = (flight: FlightDetails) => {
    setSelectedFlight(flight);
    setServiceEntries([]);
    staffService.getFlightServices(flight._id).then(r => setExistingServices(r.data.data));
  };

  const isAlreadyRequested = (s: ServiceType) => existingServices.some(e => e.serviceType === s);

  const toggleService = (s: ServiceType) => {
    if (isAlreadyRequested(s)) return;
    setServiceEntries(prev => {
      const exists = prev.find(e => e.serviceType === s);
      if (exists) return prev.filter(e => e.serviceType !== s);
      return [...prev, { serviceType: s, quantityEstimate: 0, unit: defaultUnits[s] || 'fixed' }];
    });
  };

  const updateEntry = (serviceType: ServiceType, field: 'quantityEstimate' | 'unit', value: string | number) => {
    setServiceEntries(prev => prev.map(e =>
      e.serviceType === serviceType ? { ...e, [field]: value } : e
    ));
  };

  const submitRequest = async () => {
    if (!selectedFlight || serviceEntries.length === 0) return;
    setLoading(true);
    try {
      await staffService.requestServices({
        flightId: selectedFlight._id,
        services: serviceEntries.map(e => ({
          serviceType: e.serviceType,
          quantityEstimate: e.quantityEstimate,
          unit: e.unit,
        })),
      });
      setSelectedFlight(null);
      setServiceEntries([]);
      setExistingServices([]);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (s: ServiceType) => serviceEntries.some(e => e.serviceType === s);

  const columns = [
    { key: 'flightNumber', header: 'Flight', render: (f: FlightDetails) => <span className="font-mono">{f.flightNumber}</span> },
    { key: 'airline', header: 'Airline' },
    { key: 'aircraftType', header: 'Aircraft' },
    { key: 'origin', header: 'From' },
    { key: 'turnaroundStatus', header: 'Turnaround', render: (f: FlightDetails) => <Badge variant="in_progress">{f.turnaroundStatus.replace(/_/g, ' ')}</Badge> },
    {
      key: 'actions', header: '', render: (f: FlightDetails) => (
        <Button variant="secondary" onClick={() => openModal(f)}>Request Services</Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Arrived Flights</h1>
      <Card>
        <Table columns={columns} data={flights} keyExtractor={f => f._id} emptyMessage="No arrived flights" />
      </Card>

      <Modal isOpen={!!selectedFlight} onClose={() => { setSelectedFlight(null); setExistingServices([]); }} title={`Request Services — ${selectedFlight?.flightNumber}`} size="lg">
        <div className="space-y-4">
          {/* Existing services */}
          {existingServices.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Already Requested ({existingServices.length})</p>
              <div className="space-y-1">
                {existingServices.map(s => (
                  <div key={s._id} className="flex items-center justify-between bg-slate-800/60 rounded-md px-3 py-2 text-xs">
                    <span className="text-slate-300">{s.serviceType.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Qty: {s.quantityUsed || 0}</span>
                      <Badge variant={
                        s.status === 'verified' ? 'verified' :
                        s.status === 'completed' ? 'completed' :
                        s.status === 'in_progress' ? 'in_progress' : 'pending'
                      }>{s.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service selection */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Select new services to request:</p>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map(s => {
                const alreadyRequested = isAlreadyRequested(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    disabled={alreadyRequested}
                    className={`p-2 text-xs rounded-md border transition-colors text-left ${
                      alreadyRequested
                        ? 'border-slate-800 bg-slate-800/30 text-slate-600 cursor-not-allowed line-through'
                        : isSelected(s)
                        ? 'border-sky-400 bg-sky-400/10 text-sky-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity details for new selections */}
          {serviceEntries.length > 0 && (
            <div className="space-y-2 border-t border-slate-700 pt-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Quantity Details</p>
              {serviceEntries.map(entry => (
                <div key={entry.serviceType} className="flex items-center gap-3 bg-slate-800/50 rounded-md p-2">
                  <span className="text-xs text-slate-300 w-36 truncate">{entry.serviceType.replace(/_/g, ' ')}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={entry.quantityEstimate || ''}
                    onChange={e => updateEntry(entry.serviceType, 'quantityEstimate', Number(e.target.value))}
                    className="w-24 px-2 py-1 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <select
                    value={entry.unit}
                    onChange={e => updateEntry(entry.serviceType, 'unit', e.target.value)}
                    className="px-2 py-1 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="liter">Liters</option>
                    <option value="hour">Hours</option>
                    <option value="meal">Meals</option>
                    <option value="item">Items</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          <Button onClick={submitRequest} isLoading={loading} className="w-full" disabled={serviceEntries.length === 0}>
            Submit Request ({serviceEntries.length})
          </Button>
        </div>
      </Modal>
    </div>
  );
}

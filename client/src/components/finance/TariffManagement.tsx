import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { financeService } from '../../services/finance';
import { Button, Card, Table, Modal, Input } from '../ui';
import { Tariff, ServiceType } from '../../types';

const serviceTypes: ServiceType[] = [
  'REFUELING', 'CATERING', 'BAGGAGE_HANDLING', 'CABIN_CLEANING',
  'LINE_MAINTENANCE', 'WATER_SERVICE', 'LAVATORY_SERVICE',
  'PUSHBACK_TOWING', 'GROUND_HANDLING', 'FLIGHT_INSPECTION', 'BAGGAGE_UNLOADING',
];

export function TariffManagement() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadTariffs = () => {
    financeService.getTariffs().then(r => setTariffs(r.data.data));
  };

  useEffect(() => { loadTariffs(); }, []);

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await financeService.createTariff({
        serviceType: data.serviceType,
        aircraftType: data.aircraftType,
        baseFee: Number(data.baseFee),
        ratePerUnit: Number(data.ratePerUnit),
        unit: data.unit,
      });
      reset();
      setShowForm(false);
      loadTariffs();
    } finally {
      setLoading(false);
    }
  };

  const deleteTariff = async (serviceType: string) => {
    if (!confirm(`Delete tariff for ${serviceType}?`)) return;
    await financeService.deleteTariff(serviceType);
    loadTariffs();
  };

  const columns = [
    { key: 'serviceType', header: 'Service', render: (t: Tariff) => t.serviceType.replace(/_/g, ' ') },
    { key: 'aircraftType', header: 'Aircraft Type' },
    { key: 'baseFee', header: 'Base Fee', render: (t: Tariff) => <span className="font-mono">₹{t.baseFee}</span> },
    { key: 'ratePerUnit', header: 'Rate/Unit', render: (t: Tariff) => <span className="font-mono">₹{(t as unknown as Record<string, number>).ratePerUnit}</span> },
    { key: 'unit', header: 'Unit' },
    {
      key: 'actions', header: '', render: (t: Tariff) => (
        <Button variant="danger" onClick={() => deleteTariff(t.serviceType)}>Delete</Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Tariff Management</h1>
        <Button onClick={() => setShowForm(true)}>+ Add Tariff</Button>
      </div>

      <Card>
        <Table columns={columns} data={tariffs} keyExtractor={t => t._id} emptyMessage="No tariffs configured" />
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add / Update Tariff">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Service Type</label>
            <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500" {...register('serviceType', { required: true })}>
              <option value="">Select</option>
              {serviceTypes.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <Input label="Aircraft Type" placeholder="B737" {...register('aircraftType', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Fee (₹)" type="number" {...register('baseFee', { required: true })} />
            <Input label="Rate Per Unit (₹)" type="number" {...register('ratePerUnit', { required: true })} />
          </div>
          <Input label="Unit" placeholder="e.g. liters, kg, fixed" {...register('unit', { required: true })} />
          <Button type="submit" isLoading={loading} className="w-full">Save Tariff</Button>
        </form>
      </Modal>
    </div>
  );
}

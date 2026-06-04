import { useEffect, useState } from 'react';
import { Receipt, TrendingUp, CreditCard } from 'lucide-react';
import { financeService } from '../../services/finance';
import { Card } from '../ui';
import { Invoice, Tariff } from '../../types';

export function FinanceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);

  useEffect(() => {
    financeService.getInvoices().then(r => setInvoices(r.data.data));
    financeService.getTariffs().then(r => setTariffs(r.data.data));
  }, []);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const pendingApproval = invoices.filter(i => i.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Finance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card accent="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-3xl font-mono tabular-nums">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="amber">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Approval</p>
              <p className="text-3xl font-mono tabular-nums">{pendingApproval}</p>
            </div>
            <Receipt className="text-amber-400 opacity-50" size={32} />
          </div>
        </Card>
        <Card accent="violet">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Tariffs</p>
              <p className="text-3xl font-mono tabular-nums">{tariffs.length}</p>
            </div>
            <CreditCard className="text-violet-500 opacity-50" size={32} />
          </div>
        </Card>
      </div>
    </div>
  );
}

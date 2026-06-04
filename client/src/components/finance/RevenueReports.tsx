import { useEffect, useState } from 'react';
import { financeService } from '../../services/finance';
import { useSocketEvent } from '../../hooks/useSocket';
import { Card, Input, Button } from '../ui';

interface RevenueSummary {
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
}

export function RevenueReports() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSummary = () => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    financeService.getRevenueSummary(params).then(r => setSummary(r.data.data));
  };

  useEffect(() => { loadSummary(); }, []);

  useSocketEvent('invoice_paid', loadSummary);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Revenue Reports</h1>

      <Card>
        <div className="flex gap-4 items-end">
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button onClick={loadSummary}>Filter</Button>
        </div>
      </Card>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card accent="green">
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-2xl font-mono tabular-nums mt-1">₹{summary.totalRevenue?.toLocaleString()}</p>
          </Card>
          <Card accent="sky">
            <p className="text-sm text-slate-400">Total Invoices</p>
            <p className="text-2xl font-mono tabular-nums mt-1">{summary.totalInvoices}</p>
          </Card>
          <Card accent="violet">
            <p className="text-sm text-slate-400">Paid Revenue</p>
            <p className="text-2xl font-mono tabular-nums mt-1">₹{summary.paidRevenue?.toLocaleString()}</p>
          </Card>
          <Card accent="amber">
            <p className="text-sm text-slate-400">Pending Revenue</p>
            <p className="text-2xl font-mono tabular-nums mt-1">₹{summary.pendingRevenue?.toLocaleString()}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

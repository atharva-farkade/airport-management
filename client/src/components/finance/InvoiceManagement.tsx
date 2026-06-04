import { useEffect, useState } from 'react';
import { financeService } from '../../services/finance';
import { Button, Card, Table, Badge, Modal, Input } from '../ui';
import { Invoice } from '../../types';

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadInvoices = () => {
    financeService.getInvoices().then(r => setInvoices(r.data.data));
  };

  useEffect(() => { loadInvoices(); }, []);

  const approve = async (id: string) => {
    await financeService.approveInvoice(id);
    loadInvoices();
  };

  const reject = async () => {
    if (!rejectTarget || !rejectReason) return;
    await financeService.rejectInvoice(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason('');
    loadInvoices();
  };

  const markPaid = async (id: string) => {
    await financeService.markPaid(id);
    loadInvoices();
  };

  const statusVariant = (s: string) => {
    const map: Record<string, 'pending' | 'in_progress' | 'completed' | 'verified' | 'rejected'> = {
      draft: 'default' as unknown as 'pending',
      pending_approval: 'pending',
      approved: 'completed',
      rejected: 'rejected',
      paid: 'verified',
    };
    return map[s] || 'default' as const;
  };

  const columns = [
    { key: 'airline', header: 'Airline' },
    { key: 'totalAmount', header: 'Amount', render: (i: Invoice) => <span className="font-mono">₹{i.totalAmount?.toLocaleString()}</span> },
    { key: 'lineItems', header: 'Items', render: (i: Invoice) => i.lineItems?.length || 0 },
    { key: 'status', header: 'Status', render: (i: Invoice) => <Badge variant={statusVariant(i.status)}>{i.status.replace(/_/g, ' ')}</Badge> },
    {
      key: 'actions', header: 'Actions', render: (i: Invoice) => (
        <div className="flex gap-2">
          {i.status === 'pending_approval' && (
            <>
              <Button onClick={() => approve(i._id)}>Approve</Button>
              <Button variant="danger" onClick={() => setRejectTarget(i._id)}>Reject</Button>
            </>
          )}
          {i.status === 'approved' && (
            <Button variant="secondary" onClick={() => markPaid(i._id)}>Mark Paid</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Invoices</h1>
      <Card>
        <Table columns={columns} data={invoices} keyExtractor={i => i._id} emptyMessage="No invoices" />
      </Card>

      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Invoice">
        <div className="space-y-4">
          <Input
            label="Reason for rejection"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <Button variant="danger" onClick={reject} className="w-full" disabled={!rejectReason}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { financeService } from '../../services/finance';
import { useSocketEvent } from '../../hooks/useSocket';
import { Button, Card, Table, Badge, Modal, Input } from '../ui';
import { Invoice } from '../../types';

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = () => {
    financeService.getInvoices().then(r => setInvoices(r.data.data));
  };

  useEffect(() => { loadInvoices(); }, []);

  useSocketEvent(['invoice_generated', 'invoice_approved', 'invoice_rejected', 'invoice_paid'], loadInvoices);

  const approve = async (id: string) => {
    await financeService.approveInvoice(id);
    loadInvoices();
  };

  const generate = async (flightId: string) => {
    await financeService.generateInvoice(typeof flightId === 'object' ? (flightId as unknown as { _id: string })._id : flightId);
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

  const viewInvoice = (invoice: Invoice) => {
    financeService.getInvoice(invoice._id).then(r => setSelectedInvoice(r.data.data));
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
    { key: 'flightNumber', header: 'Flight', render: (i: Invoice) => <span className="font-mono">{i.flightNumber}</span> },
    { key: 'airlineName', header: 'Airline', render: (i: Invoice) => i.airlineName },
    { key: 'totalAmount', header: 'Amount', render: (i: Invoice) => <span className="font-mono">₹{i.totalAmount?.toLocaleString()}</span> },
    { key: 'lineItems', header: 'Items', render: (i: Invoice) => i.lineItems?.length || 0 },
    { key: 'status', header: 'Status', render: (i: Invoice) => <Badge variant={statusVariant(i.status)}>{i.status.replace(/_/g, ' ')}</Badge> },
    {
      key: 'actions', header: 'Actions', render: (i: Invoice) => (
        <div className="flex gap-2">
          {i.status === 'draft' && (
            <Button variant="secondary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); generate(i.flightId as string); }}>Generate</Button>
          )}
          {i.status === 'pending_approval' && (
            <>
              <Button onClick={(e: React.MouseEvent) => { e.stopPropagation(); approve(i._id); }}>Approve</Button>
              <Button variant="danger" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setRejectTarget(i._id); }}>Reject</Button>
            </>
          )}
          {i.status === 'approved' && (
            <Button variant="secondary" onClick={(e: React.MouseEvent) => { e.stopPropagation(); markPaid(i._id); }}>Mark Paid</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Invoices</h1>
      <Card>
        <Table columns={columns} data={invoices} keyExtractor={i => i._id} emptyMessage="No invoices" onRowClick={viewInvoice} />
      </Card>

      {/* Invoice Detail Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="" size="lg">
        {selectedInvoice && <InvoiceBill invoice={selectedInvoice} />}
      </Modal>

      {/* Reject Modal */}
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

function InvoiceBill({ invoice }: { invoice: Invoice }) {
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-slate-900 text-slate-100 min-w-[500px]">
      {/* Header */}
      <div className="border-b border-slate-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-cyan-400">✈ ASMP</h2>
            <p className="text-xs text-slate-500 mt-1">Airport Service Management Platform</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold uppercase tracking-wide">Invoice</h3>
            <Badge variant={
              invoice.status === 'paid' ? 'verified' :
              invoice.status === 'approved' ? 'completed' :
              invoice.status === 'rejected' ? 'rejected' : 'pending'
            }>
              {invoice.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Bill To / Invoice Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bill To</p>
          <p className="font-semibold text-lg">{invoice.airlineName}</p>
          <p className="text-sm text-slate-400">Flight: <span className="font-mono">{invoice.flightNumber}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Invoice Details</p>
          <p className="text-sm text-slate-400">Date: {formatDate(invoice.generatedAt || invoice.createdAt)}</p>
          {invoice.approvedAt && <p className="text-sm text-slate-400">Approved: {formatDate(invoice.approvedAt)}</p>}
          {invoice.paidAt && <p className="text-sm text-green-400">Paid: {formatDate(invoice.paidAt)}</p>}
          {invoice.rejectionReason && <p className="text-sm text-red-400 mt-1">Rejected: {invoice.rejectionReason}</p>}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border border-slate-700 rounded-md overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-xs uppercase">
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Service</th>
              <th className="text-right px-4 py-2">Qty</th>
              <th className="text-right px-4 py-2">Unit Price</th>
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                <td className="px-4 py-2">{item.serviceName?.replace(/_/g, ' ') || '—'}</td>
                <td className="px-4 py-2 text-right font-mono">{item.quantity}</td>
                <td className="px-4 py-2 text-right font-mono">₹{item.unitPrice?.toLocaleString()}</td>
                <td className="px-4 py-2 text-right font-mono">₹{item.totalPrice?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end border-t border-slate-700 pt-4">
        <div className="text-right">
          <p className="text-sm text-slate-400">Total Amount</p>
          <p className="text-2xl font-bold font-mono text-cyan-400">₹{invoice.totalAmount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-600">Generated by ASMP • Airport Service Management Platform</p>
      </div>
    </div>
  );
}

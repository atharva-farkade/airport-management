import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import { Button, Card, Table, Badge, Modal, Input } from '../ui';

interface UserInfo {
  username: string;
  email?: string;
  role: string;
  gender?: string;
  specialization?: string;
  airline?: string;
}

const ROLES = [
  { value: 'airport_admin', label: 'Airport Admin' },
  { value: 'airline_staff', label: 'Airline Staff' },
  { value: 'service_vendor', label: 'Service Vendor' },
  { value: 'finance', label: 'Finance' },
];

const SPECIALIZATIONS = [
  'REFUELING', 'CATERING', 'BAGGAGE_HANDLING', 'CABIN_CLEANING',
  'LINE_MAINTENANCE', 'WATER_SERVICE', 'LAVATORY_SERVICE',
  'PUSHBACK_TOWING', 'GROUND_HANDLING', 'FLIGHT_INSPECTION', 'BAGGAGE_UNLOADING',
];

export function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'airline_staff', gender: 'other', number: '', airline: '', specialization: '' });

  const loadUsers = () => {
    adminService.getUsers().then(r => setUsers(r.data.data));
  };

  useEffect(() => { loadUsers(); }, []);

  const removeUser = async (username: string) => {
    if (!confirm(`Remove user "${username}"?`)) return;
    await adminService.removeUser({ username });
    loadUsers();
  };

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      await adminService.createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        gender: form.gender,
        number: form.number,
        ...(form.role === 'airline_staff' && { airline: form.airline }),
        ...(form.role === 'service_vendor' && { specialization: form.specialization }),
      });
      setShowForm(false);
      setForm({ username: '', email: '', password: '', role: 'airline_staff', gender: 'other', number: '', airline: '', specialization: '' });
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const roleBadge = (role: string) => {
    const map: Record<string, 'pending' | 'in_progress' | 'completed' | 'verified'> = {
      airport_admin: 'in_progress', airline_staff: 'pending', service_vendor: 'completed', finance: 'verified',
    };
    return <Badge variant={map[role] || 'default'}>{role.replace(/_/g, ' ')}</Badge>;
  };

  const columns = [
    { key: 'username', header: 'Username', render: (u: UserInfo) => <span className="font-mono">{u.username}</span> },
    { key: 'role', header: 'Role', render: (u: UserInfo) => roleBadge(u.role) },
    { key: 'gender', header: 'Gender', render: (u: UserInfo) => u.gender || '—' },
    {
      key: 'actions', header: '', render: (u: UserInfo) => (
        <Button variant="danger" onClick={() => removeUser(u.username)}>Remove</Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <Button onClick={() => setShowForm(true)}>+ Add User</Button>
      </div>
      <Card>
        <Table columns={columns} data={users} keyExtractor={u => u.username} emptyMessage="No users" />
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setError(null); }} title="Create User" size="lg">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" value={form.username} onChange={e => update('username', e.target.value)} placeholder="johndoe" />
            <Input label="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@airline.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" />
            <Input label="Phone Number" value={form.number} onChange={e => update('number', e.target.value)} placeholder="9876543210" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Role</label>
              <select
                value={form.role}
                onChange={e => update('role', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Gender</label>
              <select
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {form.role === 'airline_staff' && (
            <Input label="Airline" value={form.airline} onChange={e => update('airline', e.target.value)} placeholder="Air India" />
          )}

          {form.role === 'service_vendor' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Specialization</label>
              <select
                value={form.specialization}
                onChange={e => update('specialization', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}

          <Button onClick={handleCreate} isLoading={loading} className="w-full">
            Create User
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import { Button, Card, Table, Badge } from '../ui';

interface UserInfo {
  username: string;
  role: string;
  gender?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);

  const loadUsers = () => {
    adminService.getUsers().then(r => setUsers(r.data.data));
  };

  useEffect(() => { loadUsers(); }, []);

  const removeUser = async (username: string) => {
    if (!confirm(`Remove user "${username}"?`)) return;
    await adminService.removeUser({ username });
    loadUsers();
  };

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
      <h1 className="text-2xl font-display font-bold">User Management</h1>
      <Card>
        <Table columns={columns} data={users} keyExtractor={u => u.username} emptyMessage="No users" />
      </Card>
    </div>
  );
}

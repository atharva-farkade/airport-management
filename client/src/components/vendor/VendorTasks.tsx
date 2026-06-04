import { useEffect, useState } from 'react';
import { vendorService } from '../../services/vendor';
import { Button, Card, Badge } from '../ui';
import { ServiceRequest, FlightDetails } from '../../types';

export function VendorTasks() {
  const [tasks, setTasks] = useState<ServiceRequest[]>([]);

  const loadTasks = () => {
    vendorService.getMyTasks().then(r => setTasks(r.data.data));
  };

  useEffect(() => { loadTasks(); }, []);

  const startTask = async (id: string) => {
    await vendorService.startService(id);
    loadTasks();
  };

  const completeTask = async (id: string) => {
    await vendorService.updateService(id, { status: 'completed' });
    loadTasks();
  };

  const statusVariant = (s: string) => {
    const map: Record<string, 'pending' | 'in_progress' | 'completed' | 'verified'> = {
      pending: 'pending', assigned: 'pending', in_progress: 'in_progress', completed: 'completed', verified: 'verified',
    };
    return map[s] || 'default' as const;
  };

  const getFlightNumber = (flight: string | FlightDetails) => {
    return typeof flight === 'object' ? flight.flightNumber : flight;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">My Tasks</h1>

      {tasks.length === 0 ? (
        <Card><p className="text-slate-500">No tasks assigned to your specialization</p></Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <Card key={task._id} accent={task.status === 'in_progress' ? 'sky' : undefined}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">{task.serviceRequestId}</span>
                    <Badge variant={statusVariant(task.status)}>{task.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-lg font-medium">{task.serviceType.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-slate-400">Flight: {getFlightNumber(task.flightId)}</p>
                </div>
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <Button onClick={() => startTask(task._id)}>Claim & Start</Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button variant="secondary" onClick={() => completeTask(task._id)}>Mark Complete</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

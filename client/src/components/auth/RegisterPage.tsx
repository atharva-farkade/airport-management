import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card } from '../ui';
import { RegisterData, UserRole, ServiceType } from '../../types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'airport_admin', label: 'Airport Admin' },
  { value: 'airline_staff', label: 'Airline Staff' },
  { value: 'service_vendor', label: 'Service Vendor' },
  { value: 'finance', label: 'Finance' },
];

const specializations: ServiceType[] = [
  'REFUELING', 'CATERING', 'BAGGAGE_HANDLING', 'CABIN_CLEANING',
  'LINE_MAINTENANCE', 'WATER_SERVICE', 'LAVATORY_SERVICE',
  'PUSHBACK_TOWING', 'GROUND_HANDLING', 'FLIGHT_INSPECTION', 'BAGGAGE_UNLOADING',
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterData>();
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterData) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md" accent="sky">
        <div className="flex items-center gap-3 mb-6">
          <Plane className="text-sky-400" size={28} />
          <h1 className="text-2xl font-display font-bold">Register</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-400/10 border border-red-400/30 rounded-md text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" error={errors.fullName?.message} {...register('fullName', { required: 'Required' })} />
          <Input label="Username" error={errors.username?.message} {...register('username', { required: 'Required' })} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Role</label>
            <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500" {...register('role', { required: 'Required' })}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {errors.role && <span className="text-xs text-red-400">{errors.role.message}</span>}
          </div>

          {selectedRole === 'service_vendor' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Specialization</label>
              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-sky-500" {...register('specialization')}>
                <option value="">Select specialization</option>
                {specializations.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}

          {selectedRole === 'airline_staff' && (
            <Input label="Airline" {...register('airline')} />
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-sky-400 hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  );
}

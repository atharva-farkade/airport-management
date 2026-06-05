import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card } from '../ui';
import { LoginCredentials } from '../../types';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setError('');
    setLoading(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md" accent="sky">
        <div className="flex items-center gap-3 mb-6">
          <Plane className="text-sky-400" size={28} />
          <h1 className="text-2xl font-display font-bold">ASMP Login</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-400/10 border border-red-400/30 rounded-md text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@airline.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Contact your admin to get an account.
        </p>
      </Card>
    </div>
  );
}

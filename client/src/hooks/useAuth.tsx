import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { AuthState, LoginCredentials, RegisterData, User } from '../types';

interface AuthContextType extends AuthState {
  login: (creds: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('asmp_user');
    if (stored) {
      setState({ user: JSON.parse(stored), isAuthenticated: true, isLoading: false });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (creds: LoginCredentials) => {
    const res = await authService.login(creds);
    const data = res.data.data; // { username, role, accessToken, refreshToken }
    const user: User = {
      _id: '',
      username: data.username,
      email: creds.email,
      fullName: data.username,
      role: data.role as User['role'],
      createdAt: '',
      updatedAt: '',
    };
    localStorage.setItem('asmp_user', JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
    // After register, login automatically
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('asmp_user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

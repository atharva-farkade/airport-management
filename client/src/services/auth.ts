import api from './api';
import type { ApiResponse, LoginCredentials, RegisterData } from '../types';

interface LoginResponse {
  username: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (data: LoginCredentials) =>
    api.post<ApiResponse<LoginResponse>>('/users/login', { username: data.email, password: data.password }),

  register: (data: RegisterData) =>
    api.post<ApiResponse<unknown>>('/users/register', {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      airline: data.airline,
      specialization: data.specialization,
    }),

  logout: () =>
    api.post('/users/logout'),

  refreshToken: () =>
    api.post('/users/refresh-token'),
};

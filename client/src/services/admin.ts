import api from './api';
import type { ApiResponse, FlightDetails } from '../types';

interface FlightRegisterData {
  flightNumber: string;
  aircraftRegistration?: string;
  airlineName: string;
  aircraftType: string;
  origin: string;
  destination: string;
  sta: string;
  std: string;
  eta?: string;
  etd?: string;
}

interface FlightsResponse {
  flights: FlightDetails[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface UserInfo {
  username: string;
  role: string;
  gender?: string;
}

export const adminService = {
  registerFlight: (data: FlightRegisterData) =>
    api.post<ApiResponse<FlightDetails>>('/admin/flight-details', data),

  getUpcomingFlights: (page = 1) =>
    api.get<ApiResponse<FlightsResponse>>(`/admin/upcoming-flights?page=${page}`),

  getUsers: () =>
    api.get<ApiResponse<UserInfo[]>>('/admin/users'),

  removeUser: (data: { username?: string; email?: string }) =>
    api.delete<ApiResponse<null>>('/admin/remove-user', { params: data }),

  updateFlightStatus: (flightId: string, status: string) =>
    api.patch<ApiResponse<FlightDetails>>(`/admin/flight/${flightId}/status`, { status }),

  getTurnaroundSummary: (flightId: string) =>
    api.get<ApiResponse<unknown>>(`/admin/flight/${flightId}/turnaround`),
};

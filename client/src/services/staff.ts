import api from './api';
import { ApiResponse, FlightDetails, ServiceRequest, ServiceType } from '../types';

export const staffService = {
  getArrivedFlights: () =>
    api.get<ApiResponse<FlightDetails[]>>('/staff/flight-details'),

  requestServices: (data: { flightId: string; services: { serviceType: ServiceType; quantity?: number }[] }) =>
    api.post<ApiResponse<ServiceRequest[]>>('/staff/service-request', data),

  getFlightServices: (flightId: string) =>
    api.get<ApiResponse<ServiceRequest[]>>(`/staff/flight/${flightId}/services`),

  verifyService: (serviceRequestId: string) =>
    api.patch<ApiResponse<ServiceRequest>>(`/staff/service/${serviceRequestId}/verify`),
};

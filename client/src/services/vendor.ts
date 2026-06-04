import api from './api';
import { ApiResponse, ServiceRequest } from '../types';

export const vendorService = {
  getMyTasks: () =>
    api.get<ApiResponse<ServiceRequest[]>>('/vendor/my-tasks'),

  startService: (serviceRequestId: string) =>
    api.patch<ApiResponse<ServiceRequest>>(`/vendor/service/${serviceRequestId}/start`),

  updateService: (serviceRequestId: string, data: { progress?: number; status?: string; quantity?: number }) =>
    api.patch<ApiResponse<ServiceRequest>>(`/vendor/service/${serviceRequestId}/update`, data),
};

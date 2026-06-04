import api from './api';
import type { ApiResponse, Invoice, Tariff } from '../types';

interface RevenueSummaryResponse {
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  byStatus: Record<string, number>;
}

interface TariffCreateData {
  serviceType: string;
  aircraftType: string;
  baseFee: number;
  ratePerUnit: number;
  unit: string;
  currency?: string;
}

export const financeService = {
  // Tariffs
  createTariff: (data: TariffCreateData) =>
    api.post<ApiResponse<Tariff>>('/finance/tariffs', data),

  getTariffs: () =>
    api.get<ApiResponse<Tariff[]>>('/finance/tariffs'),

  deleteTariff: (serviceType: string) =>
    api.delete<ApiResponse<null>>(`/finance/tariffs/${serviceType}`),

  // Invoices
  getInvoices: (params?: { status?: string; airlineName?: string }) =>
    api.get<ApiResponse<Invoice[]>>('/finance/invoices', { params }),

  getInvoice: (invoiceId: string) =>
    api.get<ApiResponse<Invoice>>(`/finance/invoices/${invoiceId}`),

  generateInvoice: (flightId: string) =>
    api.post<ApiResponse<Invoice>>(`/finance/invoices/${flightId}/generate`),

  approveInvoice: (invoiceId: string) =>
    api.patch<ApiResponse<Invoice>>(`/finance/invoices/${invoiceId}/approve`),

  rejectInvoice: (invoiceId: string, reason: string) =>
    api.patch<ApiResponse<Invoice>>(`/finance/invoices/${invoiceId}/reject`, { reason }),

  markPaid: (invoiceId: string) =>
    api.patch<ApiResponse<Invoice>>(`/finance/invoices/${invoiceId}/paid`),

  // Revenue
  getRevenueSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<RevenueSummaryResponse>>('/finance/revenue/summary', { params }),
};

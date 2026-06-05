// User Roles
export type UserRole = 'airport_admin' | 'airline_staff' | 'service_vendor' | 'finance';

// Service Types
export type ServiceType =
  | 'REFUELING' | 'CATERING' | 'BAGGAGE_HANDLING' | 'CABIN_CLEANING'
  | 'LINE_MAINTENANCE' | 'WATER_SERVICE' | 'LAVATORY_SERVICE'
  | 'PUSHBACK_TOWING' | 'GROUND_HANDLING' | 'FLIGHT_INSPECTION' | 'BAGGAGE_UNLOADING';

// Turnaround Status
export type TurnaroundStatus =
  | 'in_air' | 'landed' | 'on_block' | 'servicing'
  | 'boarding' | 'ready_for_departure' | 'departed';

// Service Request Status
export type ServiceRequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'verified';

// Invoice Status
export type InvoiceStatus = 'draft' | 'generated' | 'pending_approval' | 'approved' | 'rejected' | 'paid';

// Flight Status
export type FlightStatus = 'scheduled' | 'arrived' | 'departed';

// Models
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialization?: ServiceType;
  airline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightDetails {
  _id: string;
  flightNumber: string;
  aircraftRegistration: string;
  aircraftType: string;
  airline: string;
  origin: string;
  destination: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  estimatedArrival?: string;
  estimatedDeparture?: string;
  status: FlightStatus;
  turnaroundStatus: TurnaroundStatus;
  gate?: string;
  stand?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  _id: string;
  serviceRequestId: string;
  flightId: string | FlightDetails;
  serviceType: ServiceType;
  status: ServiceRequestStatus;
  assignedVendor?: string | User;
  quantity?: number;
  cost?: number;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tariff {
  _id: string;
  serviceType: ServiceType;
  aircraftType: string;
  baseFee: number;
  perUnitRate: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  serviceRequestId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  _id: string;
  flightId: string | FlightDetails;
  airlineName: string;
  flightNumber: string;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  status: InvoiceStatus;
  rejectionReason?: string;
  generatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  specialization?: ServiceType;
  airline?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Revenue
export interface RevenueSummary {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
}

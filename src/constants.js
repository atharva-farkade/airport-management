export const DB_NAME = "asmpDB"

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
}

// User Roles
export const UserRoles = {
  ADMIN: 'airport_admin',
  AIRLINE_STAFF: 'airline_staff',
  VENDOR: 'service_vendor',
  FINANCE: 'finance'
};

// Service Types
export const ServiceTypes = {
  REFUELING: 'REFUELING',
  CATERING: 'CATERING',
  BAGGAGE_HANDLING: 'BAGGAGE_HANDLING',
  CABIN_CLEANING: 'CABIN_CLEANING',
  LINE_MAINTENANCE: 'LINE_MAINTENANCE',
  WATER_SERVICE: 'WATER_SERVICE',
  LAVATORY_SERVICE: 'LAVATORY_SERVICE',
  PUSHBACK_TOWING: 'PUSHBACK_TOWING',
  GROUND_HANDLING: 'GROUND_HANDLING',
  FLIGHT_INSPECTION: 'FLIGHT_INSPECTION',
  BAGGAGE_UNLOADING: 'BAGGAGE_UNLOADING'
};

// Turnaround Status (Flight Lifecycle)
export const TurnaroundStatus = {
  IN_AIR: 'in_air',
  LANDED: 'landed',
  ON_BLOCK: 'on_block',
  SERVICING: 'servicing',
  BOARDING: 'boarding',
  READY_FOR_DEPARTURE: 'ready_for_departure',
  DEPARTED: 'departed'
};

// Service Request Status
export const ServiceRequestStatus = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified'
};

// Invoice Status
export const InvoiceStatus = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid'
};
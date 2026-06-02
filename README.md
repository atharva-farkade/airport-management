# ✈️ Airport Service Management Platform (ASMP)

A real-time, role-based backend platform for managing ground handling services during aircraft turnaround at airports. Built with **Express 5**, **MongoDB**, and **Socket.IO**, it orchestrates the complete lifecycle from flight arrival → service requests → vendor execution → billing → payment — all with live WebSocket updates.

---

## 📌 Table of Contents

- [Architecture Overview](#architecture-overview)
- [User Roles](#user-roles)
- [Turnaround State Machine](#turnaround-state-machine)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Database Models](#database-models)
- [Project Structure](#project-structure)
- [License](#license)

---

## 🏗️ Architecture Overview

```
┌───────────┐     ┌──────────────┐     ┌────────────┐
│  Airline   │     │   Airport    │     │  Service   │
│   Staff    │────▶│    Admin     │────▶│   Vendor   │
└─────┬─────┘     └──────┬───────┘     └─────┬──────┘
      │                  │                    │
      │   Request        │   Register         │   Execute
      │   Services       │   Flights          │   Services
      │                  │                    │
      ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────┐
│              Express REST API + Socket.IO            │
│                                                      │
│  Auth ─ Turnaround Manager ─ Billing Service         │
│                                                      │
├─────────────────────────────────────────────────────┤
│                    MongoDB Atlas                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │   Finance    │
                 │   Team       │
                 └──────────────┘
                 Tariffs │ Invoices │ Revenue
```

---

## 👥 User Roles

| Role | Key | Description |
|------|-----|-------------|
| **Airport Admin** | `airport_admin` | Registers flights, manages users, updates flight status, views turnaround summaries |
| **Airline Staff** | `airline_staff` | Requests ground services for arriving flights, verifies completed services |
| **Service Vendor** | `service_vendor` | Claims and executes assigned tasks based on specialization |
| **Finance** | `finance` | Manages tariffs, generates/approves/rejects invoices, tracks revenue |

---

## 🔄 Turnaround State Machine

The core of ASMP is an automated state machine that transitions flights through their turnaround lifecycle:

```
IN_AIR → LANDED → ON_BLOCK → SERVICING → BOARDING → READY_FOR_DEPARTURE → DEPARTED
```

| Transition | Trigger |
|------------|---------|
| `IN_AIR` → `LANDED` | Admin marks flight as "arrived" |
| `LANDED` → `ON_BLOCK` | Auto-transition (chocks on) |
| `ON_BLOCK` → `SERVICING` | Any vendor starts a service |
| `SERVICING` → `BOARDING` | All critical services (Refueling, Cabin Cleaning, Catering) verified |
| `BOARDING` → `READY_FOR_DEPARTURE` | All requested services verified |
| `READY_FOR_DEPARTURE` → `DEPARTED` | Admin marks flight as "departed" |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Real-time** | Socket.IO |
| **Authentication** | JWT (access + refresh tokens) with HTTP-only cookies |
| **Password Hashing** | bcrypt.js |
| **Dev Server** | Nodemon |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (or local MongoDB instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/atharva532/airport-management.git
cd airport-management

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and secrets (see below)

# Seed tariff data (optional)
node src/seeds/tariff.seed.js

# Start development server
npm run dev
```

The server will start on `http://localhost:5000` (or whichever `PORT` you configure).

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=7d
COOKIE_SECURE=false
```

> **Note:** Set `COOKIE_SECURE=true` in production with HTTPS.

---

## 📚 API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require a valid JWT in the `accessToken` cookie or `Authorization` header.

### Authentication (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ✗ | Register a new user |
| `POST` | `/login` | ✗ | Login (returns access + refresh tokens) |
| `POST` | `/logout` | ✔ | Logout (clears tokens) |
| `POST` | `/refresh-token` | ✗ | Refresh access token using refresh token |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/flight-details` | Register a new flight |
| `GET` | `/upcoming-flights` | List all registered flights |
| `GET` | `/users` | List all users |
| `DELETE` | `/remove-user` | Remove a user by username/email |
| `PATCH` | `/flight/:flightId/status` | Update flight status (`scheduled` / `arrived` / `departed`) |
| `GET` | `/flight/:flightId/turnaround` | Get turnaround progress summary |

### Airline Staff (`/api/v1/staff`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/flight-details` | Get arrived flights |
| `POST` | `/service-request` | Request services for a flight |
| `GET` | `/flight/:flightId/services` | Get all services for a flight |
| `PATCH` | `/service/:serviceRequestId/verify` | Verify a completed service (triggers billing) |

### Service Vendor (`/api/v1/vendor`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/my-tasks` | Get tasks matching vendor's specialization |
| `PATCH` | `/service/:serviceRequestId/start` | Claim and start a service |
| `PATCH` | `/service/:serviceRequestId/update` | Update progress or mark as completed |

### Finance (`/api/v1/finance`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Tariffs** | | |
| `POST` | `/tariffs` | Create or update a tariff |
| `GET` | `/tariffs` | List all tariffs |
| `DELETE` | `/tariffs/:serviceType` | Delete a tariff |
| **Invoices** | | |
| `GET` | `/invoices` | List invoices (filter by `status`, `airlineName`) |
| `GET` | `/invoices/:invoiceId` | Get invoice details |
| `POST` | `/invoices/:flightId/generate` | Generate invoice from verified services |
| `PATCH` | `/invoices/:invoiceId/approve` | Approve an invoice |
| `PATCH` | `/invoices/:invoiceId/reject` | Reject an invoice (requires `reason`) |
| `PATCH` | `/invoices/:invoiceId/paid` | Mark invoice as paid |
| **Revenue** | | |
| `GET` | `/revenue/summary` | Revenue report (filter by `startDate`, `endDate`) |

---

## 📡 WebSocket Events

Real-time events emitted via Socket.IO to all connected clients:

| Event | Emitted When |
|-------|-------------|
| `flight_arrived` | Admin marks a flight as arrived |
| `services_requested` | Staff creates service requests for a flight |
| `service_started` | Vendor claims and starts a service |
| `service_progress_update` | Vendor updates service progress |
| `service_verified` | Staff verifies a completed service |
| `turnaround_status_update` | Flight turnaround status transitions |
| `flight_departed` | Flight is marked as departed |
| `invoice_generated` | Invoice is generated for a flight |
| `invoice_approved` | Finance approves an invoice |
| `invoice_rejected` | Finance rejects an invoice |
| `invoice_paid` | Invoice is marked as paid |

---

## 🗄️ Database Models

### `User`
Stores all user accounts with role-specific fields (`specialization` for vendors, `airline` for staff). Passwords are bcrypt-hashed. Supports JWT token generation.

### `FlightDetails`
Full flight record including identification (flight number, aircraft registration), route (origin/destination), schedule (STA/STD/ETA/ETD), turnaround status (state machine), and invoice linkage.

### `ServiceRequest`
Individual service task with auto-generated IDs (`SRV-000001`), lifecycle tracking (pending → assigned → in_progress → completed → verified), quantity/cost tracking, and timing metadata.

### `Tariff`
Pricing rules per service type and aircraft type. Supports base fee + per-unit rate. Compound index on `(serviceType, aircraftType)`.

### `Invoice`
Itemized billing document with line items, lifecycle (draft → pending_approval → approved → rejected → paid), and timestamps for each state transition.

### `Counter`
Auto-incrementing sequence generator for human-readable service request IDs.

---

## 📂 Project Structure

```
src/
├── index.js                    # Server entry‑point (HTTP + Socket.IO)
├── app.js                      # Express app configuration & route mounting
├── constants.js                # Enums – roles, service types, statuses
├── db/
│   └── index.js                # MongoDB connection
├── models/
│   ├── user.model.js           # User schema with JWT & bcrypt methods
│   ├── flightDetails.model.js  # Flight schema with turnaround state machine
│   ├── serviceRequest.model.js # Service request with auto-increment IDs
│   ├── tariff.model.js         # Pricing rules per service + aircraft type
│   ├── invoice.model.js        # Itemized billing documents
│   └── counter.model.js        # Auto-increment counter
├── controllers/
│   ├── user.controller.js      # Auth (register, login, logout, refresh)
│   ├── admin.controller.js     # Flight & user management
│   ├── service.controller.js   # Service request lifecycle
│   ├── finance.controller.js   # Tariff, invoice & revenue management
│   └── vendor.controller.js    # Vendor role check
├── routes/
│   ├── user.routes.js          # /api/v1/users
│   ├── admin.routes.js         # /api/v1/admin
│   ├── staff.routes.js         # /api/v1/staff
│   ├── vendor.routes.js        # /api/v1/vendor
│   └── finance.routes.js       # /api/v1/finance
├── middlewares/
│   ├── auth.middleware.js       # JWT verification
│   ├── authorizeRoles.middleware.js  # Role-based access control
│   ├── admin.middleware.js      # Admin access guard
│   ├── staff.middleware.js      # Staff access guard
│   ├── vendor.middleware.js     # Vendor access guard
│   └── finance.middleware.js    # Finance access guard
├── utils/
│   ├── TurnaroundManager.js     # State machine logic
│   ├── BillingService.js        # Cost calculation & invoice management
│   ├── ApiError.js              # Standardized error class
│   ├── ApiResponse.js           # Standardized response class
│   └── asyncHandlers.js         # Async wrapper for controllers
└── seeds/
    ├── tariff.seed.js           # Seed script for tariff data
    └── tariff-mongodb-script.js # Direct MongoDB insert script
```

---

## 🔑 Supported Service Types

| Service | Key |
|---------|-----|
| Refueling | `REFUELING` |
| Catering | `CATERING` |
| Baggage Handling | `BAGGAGE_HANDLING` |
| Cabin Cleaning | `CABIN_CLEANING` |
| Line Maintenance | `LINE_MAINTENANCE` |
| Water Service | `WATER_SERVICE` |
| Lavatory Service | `LAVATORY_SERVICE` |
| Pushback & Towing | `PUSHBACK_TOWING` |
| Ground Handling | `GROUND_HANDLING` |
| Flight Inspection | `FLIGHT_INSPECTION` |
| Baggage Unloading | `BAGGAGE_UNLOADING` |

---

## 🧪 Testing

A Postman collection is included for testing:

📄 **`Airport_Service_Management_API.postman_collection.json`**

Import it into Postman to test all endpoints with pre-configured requests.

---

## 📄 License

ISC © [Atharva Farkade](https://github.com/atharva532)
# ASMP — Issues to Fix

## Critical

- [ ] **1. `flightId` type mismatch in ServiceRequest model** — Defined as `type: String` but stores ObjectIds. Breaks `.populate()` calls. Should be `type: mongoose.Schema.Types.ObjectId, ref: "FlightDetails"`.

- [ ] **2. `flight.airline` doesn't exist — should be `flight.airlineName`** — Used in `BillingService.addToInvoice()` and `TurnaroundManager.getTurnaroundSummary()`.

- [ ] **3. No global error handler middleware** — Thrown `ApiError` instances won't produce JSON responses without an `(err, req, res, next)` handler in `app.js`.

- [ ] **4. Stray `console.log` at module level in `admin.controller.js`** — Executes on import, not intentional.

## Security

- [ ] **5. Cookie `secure: true` always — breaks local dev** — The `COOKIE_SECURE` env var exists but is never read. Cookies won't be set over HTTP.

- [ ] **6. Exported `cookieOptions` in constants.js never used** — Controllers define inline options inconsistently (missing `sameSite`, `maxAge`).

- [ ] **7. No input validation on service types** — `requestServices` accepts any string without validating against `ServiceTypes` enum.

- [ ] **8. Socket.IO has no authentication** — Anyone can connect and receive all events.

- [ ] **9. No rate limiting on auth endpoints** — Login/register vulnerable to brute-force.

- [ ] **10. Duplicate bcrypt libraries** — Both `bcrypt` and `bcryptjs` in deps; only `bcryptjs` is used.

## Logic Bugs

- [ ] **11. `createTariff` ignores `aircraftType`** — Does `findOne({ serviceType })` without `aircraftType`, always overwrites the first match instead of using the compound key.

- [ ] **12. `updateFlightStatus` silently ignores `status === "scheduled"`** — Validates it as valid but does nothing with it.

- [ ] **13. `TurnaroundManager.markDeparted` has no state guard** — Allows marking any flight departed regardless of current turnaround state.

## Architecture / Cleanup

- [ ] **14. Redundant role middlewares** — `verifyAdminAccess`, `verifyStaffAccess`, `verifyVendorAccess` duplicate what `authorizeRoles` already does. Pick one.

- [ ] **15. Revenue summary loads all invoices into memory** — Should use MongoDB aggregation instead of JS filtering.

- [ ] **16. `FlightDetails` schema missing `timestamps: true`** — No `createdAt`/`updatedAt`.

- [ ] **17. Unused dependencies** — `ws` and `mongoose-aggregate-paginate-v2` are never used.

- [ ] **18. Multiple scattered `export` statements in `admin.controller.js`** — Should use a single export block.

- [ ] **19. No `.env.example` file** — Referenced in README but doesn't exist.

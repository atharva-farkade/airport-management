import { FlightDetails } from "../models/flightDetails.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { TurnaroundStatus, ServiceRequestStatus } from "../constants.js";
import { ApiError } from "./ApiError.js";

/**
 * Turnaround Manager - The State Machine Logic
 * Automatically transitions flight status based on service completion
 */

export class TurnaroundManager {

    // Valid state transitions — only forward movement allowed
    static VALID_TRANSITIONS = {
        [TurnaroundStatus.IN_AIR]: [TurnaroundStatus.LANDED],
        [TurnaroundStatus.LANDED]: [TurnaroundStatus.ON_BLOCK],
        [TurnaroundStatus.ON_BLOCK]: [TurnaroundStatus.SERVICING],
        [TurnaroundStatus.SERVICING]: [TurnaroundStatus.BOARDING],
        [TurnaroundStatus.BOARDING]: [TurnaroundStatus.READY_FOR_DEPARTURE],
        [TurnaroundStatus.READY_FOR_DEPARTURE]: [TurnaroundStatus.DEPARTED],
        [TurnaroundStatus.DEPARTED]: []
    };

    static isValidTransition(from, to) {
        return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
    }

    /**
     * Check and update turnaround status based on current state
     * @param {String} flightId - MongoDB ObjectId of the flight
     * @param {Object} io - Socket.IO instance for real-time updates
     */
    static async updateTurnaroundStatus(flightId, io = null) {
        const flight = await FlightDetails.findById(flightId);
        if (!flight) throw new ApiError("Flight not found", 404);

        const currentStatus = flight.turnaroundStatus;
        let newStatus = currentStatus;

        // Get all service requests for this flight
        const serviceRequests = await ServiceRequest.find({ flightId });

        // State transition logic
        switch (currentStatus) {
            case TurnaroundStatus.LANDED:
                // Auto-transition to ON_BLOCK (simulating chocks on)
                newStatus = TurnaroundStatus.ON_BLOCK;
                break;

            case TurnaroundStatus.ON_BLOCK:
                // If any service has started, move to SERVICING
                const hasStartedServices = serviceRequests.some(
                    sr => sr.status === ServiceRequestStatus.IN_PROGRESS
                );
                if (hasStartedServices) {
                    newStatus = TurnaroundStatus.SERVICING;
                }
                break;

            case TurnaroundStatus.SERVICING:
                // Check if critical services are VERIFIED
                const criticalServices = ['REFUELING', 'CABIN_CLEANING', 'CATERING'];
                const criticalRequests = serviceRequests.filter(sr =>
                    criticalServices.includes(sr.serviceType)
                );

                const allCriticalVerified = criticalRequests.length > 0 &&
                    criticalRequests.every(sr => sr.status === ServiceRequestStatus.VERIFIED);

                if (allCriticalVerified) {
                    newStatus = TurnaroundStatus.BOARDING;
                }
                break;

            case TurnaroundStatus.BOARDING:
                // Check if ALL services are verified
                const allVerified = serviceRequests.length > 0 &&
                    serviceRequests.every(sr => sr.status === ServiceRequestStatus.VERIFIED);

                if (allVerified) {
                    newStatus = TurnaroundStatus.READY_FOR_DEPARTURE;
                }
                break;

            case TurnaroundStatus.READY_FOR_DEPARTURE:
                // Manual transition to DEPARTED by admin
                break;

            default:
                break;
        }

        // Update if status changed and transition is valid
        if (newStatus !== currentStatus) {
            if (!TurnaroundManager.isValidTransition(currentStatus, newStatus)) {
                throw new ApiError(`Invalid transition: ${currentStatus} → ${newStatus}`, 400);
            }

            flight.turnaroundStatus = newStatus;
            await flight.save();

            // Emit socket event
            if (io) {
                io.emit("turnaround_status_update", {
                    flightId: flight._id,
                    flightNumber: flight.flightNumber,
                    oldStatus: currentStatus,
                    newStatus: newStatus,
                    timestamp: new Date()
                });
            }

            console.log(`✈️  Flight ${flight.flightNumber}: ${currentStatus} → ${newStatus}`);
        }

        return flight;
    }

    /**
     * Mark flight as departed
     */
    static async markDeparted(flightId, io = null) {
        const flight = await FlightDetails.findById(flightId);
        if (!flight) throw new ApiError("Flight not found", 404);

        if (flight.turnaroundStatus !== TurnaroundStatus.READY_FOR_DEPARTURE) {
            throw new ApiError(
                `Cannot depart: flight is in '${flight.turnaroundStatus}' state. Must be '${TurnaroundStatus.READY_FOR_DEPARTURE}'.`,
                400
            );
        }

        flight.turnaroundStatus = TurnaroundStatus.DEPARTED;
        flight.status = 'departed';
        flight.actualDepartureTime = new Date();
        await flight.save();

        if (io) {
            io.emit("flight_departed", {
                flightId: flight._id,
                flightNumber: flight.flightNumber,
                departureTime: flight.actualDepartureTime
            });
        }

        return flight;
    }

    /**
     * Get turnaround progress summary
     */
    static async getTurnaroundSummary(flightId) {
        const flight = await FlightDetails.findById(flightId);
        const serviceRequests = await ServiceRequest.find({ flightId })
            .populate('requestedBy', 'username')
            .populate('assignedVendor', 'username specialization');

        const summary = {
            flight: {
                flightNumber: flight.flightNumber,
                airlineName: flight.airlineName,
                turnaroundStatus: flight.turnaroundStatus,
                sta: flight.sta,
                std: flight.std,
                actualArrivalTime: flight.actualArrivalTime
            },
            services: {
                total: serviceRequests.length,
                pending: serviceRequests.filter(sr => sr.status === ServiceRequestStatus.PENDING).length,
                inProgress: serviceRequests.filter(sr => sr.status === ServiceRequestStatus.IN_PROGRESS).length,
                completed: serviceRequests.filter(sr => sr.status === ServiceRequestStatus.COMPLETED).length,
                verified: serviceRequests.filter(sr => sr.status === ServiceRequestStatus.VERIFIED).length
            },
            serviceDetails: serviceRequests.map(sr => ({
                serviceType: sr.serviceType,
                status: sr.status,
                vendor: sr.assignedVendor?.username || 'Unassigned',
                quantityUsed: sr.quantityUsed,
                cost: sr.calculatedCost
            }))
        };

        return summary;
    }
}

import { Tariff } from "../models/tariff.model.js";
import { Invoice } from "../models/invoice.model.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { FlightDetails } from "../models/flightDetails.model.js";
import { InvoiceStatus } from "../constants.js";
import { ApiError } from "./ApiError.js";

/**
 * Billing Service - Handles cost calculation and invoice management
 */

export class BillingService {

    /**
     * Calculate cost for a service based on tariff and aircraft type
     * @param {String} serviceType - Type of service
     * @param {Number} quantity - Quantity used
     * @param {String} aircraftType - Aircraft type (A320, B777, ATR-72)
     * @returns {Object} - { cost, tariff }
     */
    static async calculateCost(serviceType, quantity = 1, aircraftType = 'DEFAULT') {
        // Try to find tariff for specific aircraft type first
        let tariff = await Tariff.findOne({ serviceType, aircraftType });

        // Fallback to DEFAULT tariff if no specific aircraft tariff found
        if (!tariff) {
            tariff = await Tariff.findOne({ serviceType, aircraftType: 'DEFAULT' });
        }

        if (!tariff) {
            throw new ApiError(`No tariff found for service type: ${serviceType}`, 404);
        }

        const cost = tariff.baseFee + (tariff.ratePerUnit * quantity);

        return {
            cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
            tariff: {
                baseFee: tariff.baseFee,
                ratePerUnit: tariff.ratePerUnit,
                unit: tariff.unit,
                currency: tariff.currency,
                aircraftType: tariff.aircraftType
            }
        };
    }

    /**
     * Add service charge to flight invoice
     * @param {String} flightId - Flight ObjectId
     * @param {String} serviceRequestId - ServiceRequest ObjectId
     */
    static async addToInvoice(flightId, serviceRequestId) {
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        const flight = await FlightDetails.findById(flightId);

        if (!serviceRequest || !flight) {
            throw new ApiError("Service request or flight not found", 404);
        }

        // Find or create invoice for this flight
        let invoice = await Invoice.findOne({ flightId, status: InvoiceStatus.DRAFT });

        if (!invoice) {
            invoice = await Invoice.create({
                flightId,
                airlineName: flight.airlineName,
                flightNumber: flight.flightNumber,
                status: InvoiceStatus.DRAFT,
                lineItems: [],
                totalAmount: 0
            });
        }

        // Add line item
        const lineItem = {
            serviceRequestId: serviceRequest._id,
            serviceName: serviceRequest.serviceType,
            quantity: serviceRequest.quantityUsed,
            unitPrice: serviceRequest.calculatedCost / (serviceRequest.quantityUsed || 1),
            totalPrice: serviceRequest.calculatedCost
        };

        invoice.lineItems.push(lineItem);
        invoice.totalAmount += serviceRequest.calculatedCost;

        await invoice.save();

        // Link invoice to flight
        if (!flight.invoiceId) {
            flight.invoiceId = invoice._id;
            await flight.save();
        }

        return invoice;
    }

    /**
     * Generate final invoice (move from DRAFT to PENDING_APPROVAL)
     * If no draft invoice exists, check for verified services and create one
     * @param {String} flightId - Flight ObjectId
     */
    static async generateInvoice(flightId) {
        let invoice = await Invoice.findOne({ flightId, status: InvoiceStatus.DRAFT });

        // If no draft invoice, check if there are verified services we can invoice
        if (!invoice) {
            const verifiedServices = await ServiceRequest.find({
                flightId,
                status: 'verified',
                calculatedCost: { $gt: 0 }
            });

            if (verifiedServices.length === 0) {
                // Check if there are any services at all for this flight
                const allServices = await ServiceRequest.find({ flightId });

                if (allServices.length === 0) {
                    throw new ApiError("No services have been requested for this flight. Workflow: Staff must first request services.", 400);
                }

                const pendingServices = allServices.filter(s => s.status !== 'verified');
                if (pendingServices.length > 0) {
                    const statuses = pendingServices.map(s => s.status).join(', ');
                    throw new ApiError(`Services exist but none are verified yet. Current statuses: ${statuses}. Workflow: Vendor must complete services, then Staff must verify them.`, 400);
                }

                throw new ApiError("No billable services found for this flight.", 400);
            }

            // Create invoice from verified services
            const flight = await FlightDetails.findById(flightId);
            invoice = await Invoice.create({
                flightId,
                airlineName: flight?.airlineName || 'Unknown',
                flightNumber: flight?.flightNumber || 'Unknown',
                status: InvoiceStatus.DRAFT,
                lineItems: verifiedServices.map(sr => ({
                    serviceRequestId: sr._id,
                    serviceName: sr.serviceType,
                    quantity: sr.quantityUsed,
                    unitPrice: sr.calculatedCost / (sr.quantityUsed || 1),
                    totalPrice: sr.calculatedCost
                })),
                totalAmount: verifiedServices.reduce((sum, sr) => sum + sr.calculatedCost, 0)
            });
        }

        invoice.status = InvoiceStatus.PENDING_APPROVAL;
        invoice.generatedAt = new Date();
        await invoice.save();

        return invoice;
    }

    /**
     * Approve invoice (Finance role)
     */
    static async approveInvoice(invoiceId) {
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            throw new ApiError("Invoice not found", 404);
        }

        invoice.status = InvoiceStatus.APPROVED;
        invoice.approvedAt = new Date();
        await invoice.save();

        return invoice;
    }

    /**
     * Reject invoice (Finance role)
     */
    static async rejectInvoice(invoiceId, reason) {
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            throw new ApiError("Invoice not found", 404);
        }

        invoice.status = InvoiceStatus.REJECTED;
        invoice.rejectionReason = reason;
        await invoice.save();

        return invoice;
    }

    /**
     * Mark invoice as paid
     */
    static async markPaid(invoiceId) {
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            throw new ApiError("Invoice not found", 404);
        }

        if (invoice.status !== InvoiceStatus.APPROVED) {
            throw new ApiError("Only approved invoices can be marked as paid", 400);
        }

        invoice.status = InvoiceStatus.PAID;
        invoice.paidAt = new Date();
        await invoice.save();

        return invoice;
    }
}

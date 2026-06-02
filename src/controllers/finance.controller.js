import asyncHandler from '../utils/asyncHandlers.js';
import { Tariff } from '../models/tariff.model.js';
import { Invoice } from '../models/invoice.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { BillingService } from '../utils/BillingService.js';
import { InvoiceStatus } from '../constants.js';

// Check finance role access
const checkFinanceRole = asyncHandler(async (req, res) =>
    res.send("Finance route accessed successfully")
);

export { checkFinanceRole };

// ============ TARIFF MANAGEMENT ============

// Create or update tariff
const createTariff = asyncHandler(async (req, res) => {
    const { serviceType, aircraftType, baseFee, ratePerUnit, unit, currency } = req.body;

    // Check if tariff exists for this service+aircraft combination
    let tariff = await Tariff.findOne({ serviceType, aircraftType: aircraftType || 'DEFAULT' });

    if (tariff) {
        // Update existing
        tariff.baseFee = baseFee;
        tariff.ratePerUnit = ratePerUnit;
        tariff.unit = unit || tariff.unit;
        tariff.currency = currency || tariff.currency;
        await tariff.save();
    } else {
        // Create new
        tariff = await Tariff.create({
            serviceType,
            aircraftType: aircraftType || 'DEFAULT',
            baseFee,
            ratePerUnit,
            unit: unit || 'fixed',
            currency: currency || 'INR'
        });
    }

    return res.status(201).json(
        new ApiResponse(201, tariff, "Tariff created/updated successfully")
    );
});

export { createTariff };

// Get all tariffs
const getAllTariffs = asyncHandler(async (req, res) => {
    const tariffs = await Tariff.find().sort({ serviceType: 1 });

    return res.status(200).json(
        new ApiResponse(200, tariffs, "Tariffs retrieved successfully")
    );
});

export { getAllTariffs };

// Delete tariff
const deleteTariff = asyncHandler(async (req, res) => {
    const { serviceType } = req.params;

    const tariff = await Tariff.findOneAndDelete({ serviceType });

    if (!tariff) {
        throw new ApiError("Tariff not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Tariff deleted successfully")
    );
});

export { deleteTariff };

// ============ INVOICE MANAGEMENT ============

// Get all invoices (with filters)
const getAllInvoices = asyncHandler(async (req, res) => {
    const { status, airlineName } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (airlineName) filter.airlineName = airlineName;

    const invoices = await Invoice.find(filter)
        .populate('flightId', 'flightNumber airline sta std')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, invoices, "Invoices retrieved successfully")
    );
});

export { getAllInvoices };

// Get invoice by ID
const getInvoiceById = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
        .populate('flightId')
        .populate('lineItems.serviceRequestId');

    if (!invoice) {
        throw new ApiError("Invoice not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice retrieved successfully")
    );
});

export { getInvoiceById };

// Generate invoice (move from DRAFT to PENDING_APPROVAL)
const generateInvoice = asyncHandler(async (req, res) => {
    const { flightId } = req.params;

    const invoice = await BillingService.generateInvoice(flightId);

    const io = req.app.get("io");
    if (io) {
        io.emit("invoice_generated", {
            invoiceId: invoice._id,
            flightId: flightId,
            totalAmount: invoice.totalAmount
        });
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice generated successfully")
    );
});

export { generateInvoice };

// Approve invoice
const approveInvoice = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;

    const invoice = await BillingService.approveInvoice(invoiceId);

    const io = req.app.get("io");
    if (io) {
        io.emit("invoice_approved", {
            invoiceId: invoice._id,
            totalAmount: invoice.totalAmount
        });
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice approved successfully")
    );
});

export { approveInvoice };

// Reject invoice
const rejectInvoice = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError("Rejection reason is required", 400);
    }

    const invoice = await BillingService.rejectInvoice(invoiceId, reason);

    const io = req.app.get("io");
    if (io) {
        io.emit("invoice_rejected", {
            invoiceId: invoice._id,
            reason: reason
        });
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice rejected successfully")
    );
});

export { rejectInvoice };

// Mark invoice as paid
const markInvoicePaid = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;

    const invoice = await BillingService.markPaid(invoiceId);

    const io = req.app.get("io");
    if (io) {
        io.emit("invoice_paid", {
            invoiceId: invoice._id,
            totalAmount: invoice.totalAmount
        });
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice marked as paid successfully")
    );
});

export { markInvoicePaid };

// Get revenue summary
const getRevenueSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const results = await Invoice.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const byStatus = {};
    let totalInvoices = 0;
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;

    for (const r of results) {
        byStatus[r._id] = r.count;
        totalInvoices += r.count;
        totalRevenue += r.revenue;
        if (r._id === InvoiceStatus.PAID) paidRevenue = r.revenue;
        if (r._id === InvoiceStatus.PENDING_APPROVAL || r._id === InvoiceStatus.APPROVED) {
            pendingRevenue += r.revenue;
        }
    }

    const summary = { totalInvoices, totalRevenue, byStatus, paidRevenue, pendingRevenue };

    return res.status(200).json(
        new ApiResponse(200, summary, "Revenue summary retrieved successfully")
    );
});

export { getRevenueSummary };

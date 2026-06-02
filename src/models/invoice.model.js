import mongoose from "mongoose";
import { InvoiceStatus } from "../constants.js";

const invoiceSchema = new mongoose.Schema({
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlightDetails",
        required: true
    },
    airlineName: {
        type: String,
        required: true
    },
    flightNumber: {
        type: String,
        required: true
    },
    lineItems: [{
        serviceRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest"
        },
        serviceName: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: Object.values(InvoiceStatus),
        default: InvoiceStatus.DRAFT
    },
    generatedAt: Date,
    approvedAt: Date,
    paidAt: Date,
    rejectionReason: String
}, { timestamps: true });

export const Invoice = mongoose.model("Invoice", invoiceSchema);

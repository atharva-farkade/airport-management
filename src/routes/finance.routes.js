import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import {
    checkFinanceRole,
    createTariff,
    getAllTariffs,
    deleteTariff,
    getAllInvoices,
    getInvoiceById,
    generateInvoice,
    approveInvoice,
    rejectInvoice,
    markInvoicePaid,
    getRevenueSummary
} from "../controllers/finance.controller.js";

const financerouter = Router()

// Basic route
financerouter.route("/").post(verifyJwt, authorizeRoles("finance"), checkFinanceRole);

// Tariff management
financerouter.post("/tariffs", verifyJwt, authorizeRoles("finance"), createTariff);
financerouter.get("/tariffs", verifyJwt, authorizeRoles("finance"), getAllTariffs);
financerouter.delete("/tariffs/:serviceType", verifyJwt, authorizeRoles("finance"), deleteTariff);

// Invoice management
financerouter.get("/invoices", verifyJwt, authorizeRoles("finance"), getAllInvoices);
financerouter.get("/invoices/:invoiceId", verifyJwt, authorizeRoles("finance"), getInvoiceById);
financerouter.post("/invoices/:flightId/generate", verifyJwt, authorizeRoles("finance"), generateInvoice);
financerouter.patch("/invoices/:invoiceId/approve", verifyJwt, authorizeRoles("finance"), approveInvoice);
financerouter.patch("/invoices/:invoiceId/reject", verifyJwt, authorizeRoles("finance"), rejectInvoice);
financerouter.patch("/invoices/:invoiceId/paid", verifyJwt, authorizeRoles("finance"), markInvoicePaid);

// Revenue reporting
financerouter.get("/revenue/summary", verifyJwt, authorizeRoles("finance"), getRevenueSummary);

export default financerouter;
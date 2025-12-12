import express from "express";
import * as Payment from "../controllers/PaymentController.js";
import upload from "../middleware/uploadPaymentProof.js";

const paymentroutes = express.Router();

/* -------------------- USER ROUTES -------------------- */
// Get all payments for a user
paymentroutes.get("/user/:userId", Payment.getPaymentsForUser);

// Make payment with reference code
paymentroutes.patch("/pay/:id", Payment.makePayment);

// Submit reference code only
paymentroutes.post("/submit-reference", Payment.submitReferenceCode);

// Upload payment proof image
paymentroutes.post("/upload-proof", upload.single("proof"), Payment.uploadPaymentProof);

// Get payment proofs for a specific user
paymentroutes.get("/proofs/user/:userId", Payment.getUserPaymentProofs);

/* -------------------- ADMIN ROUTES -------------------- */
// Get all users
paymentroutes.get("/all-users", Payment.getAllUsers);

// Record payment manually
paymentroutes.post("/record", Payment.recordPayment);

// Mark payment status
paymentroutes.patch("/admin/pay/:id", Payment.adminMarkPayment);

// Get all payment proofs from all users
paymentroutes.get("/proofs/all", Payment.getAllPaymentProofs);

// // Get pending payments for a user
// router.get("/user/:userId/pending", getUserPendingPayments);

export default paymentroutes;
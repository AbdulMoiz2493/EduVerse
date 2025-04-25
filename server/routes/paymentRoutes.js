import express from "express";
import {
  createPaymentLink,
  handleWebhook,
  getUserPayments,
  getPaymentById,
  verifyEnrollment
} from "../controllers/paymentController.js";
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create a payment link for a course
router.post("/create", authenticate, createPaymentLink);

// Handle Stripe webhook events
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

router.post("/verify-enrollment", authenticate, verifyEnrollment);

// Get all payments for the authenticated user
router.get("/user", authenticate, getUserPayments);

// Get a specific payment by ID
router.get("/:paymentId", authenticate, getPaymentById);

export default router;
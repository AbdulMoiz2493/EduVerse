
import { Payment } from "../models/Payment.js";
import { Invoice } from "../models/Invoice.js"; // Import the Invoice model
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js"; // Assuming you have an Enrollment model
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();


//console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY); // Debug the env variable

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10", // Specify the API version explicitly
});

//console.log("Stripe instance:", stripe); // Debug the stripe instance
//console.log("Stripe products:", stripe.products); // Debug the products property

// Create a payment link for a course
export const createPaymentLink = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.userId;
  
    try {
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }
  
      const user = await User.findById(userId);
      const course = await Course.findById(courseId).populate('tutor', 'name');
  
      if (!user || !course) {
        return res.status(404).json({ message: 'User or course not found' });
      }
  
      if (course.payment !== 'paid') {
        return res.status(400).json({ message: 'This course is free' });
      }
  
      if (course.price <= 0 || isNaN(course.price)) {
        return res.status(400).json({ message: 'Course price must be greater than 0' });
      }
  
      const existingEnrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
      });
      if (existingEnrollment) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }
  
      const product = await stripe.products.create({
        name: course.title || 'Untitled Course',
        description: course.description || 'No description provided',
      });
  
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(course.price * 100),
        product: product.id,
      });
  
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId.toString(),
          courseId: courseId.toString(),
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `http://localhost:8080/student?payment_success=true&courseId=${courseId}`, // Add courseId to redirect URL
          },
        },
      });
  
      const payment = new Payment({
        user: userId,
        course: courseId,
        amount: course.price,
        stripePaymentIntentId: '',
        paymentLink: paymentLink.url,
        status: 'completed',
      });
  
      await payment.save();
  
      return res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        paymentLink: paymentLink.url,
      });
    } catch (error) {
      console.error('Error creating payment link:', error.message, error.stack);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


// Handle Stripe webhook events
export const handleWebhook = async (req, res) => {
    const event = req.body;
  
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata.userId;
          const courseId = session.metadata.courseId;
          const paymentIntentId = session.payment_intent;
  
          console.log("Processing checkout.session.completed:", { userId, courseId, paymentIntentId });
  
          // Find the pending payment
          const payment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: "pending",
          });
  
          if (!payment) {
            console.error("Payment not found for session:", session.id);
            return res.status(404).json({ message: "Payment not found" });
          }
  
          // Update payment status
          payment.stripePaymentIntentId = paymentIntentId;
          payment.status = "completed";
          await payment.save();
          console.log("Payment updated:", payment._id);
  
          // Check if enrollment already exists
          const existingEnrollment = await Enrollment.findOne({
            student: userId,
            course: courseId,
          });
  
          if (!existingEnrollment) {
            // Create enrollment
            const enrollment = new Enrollment({
              student: userId,
              course: courseId,
            });
            await enrollment.save();
            console.log("Enrollment created:", enrollment._id);
          } else {
            console.log("Enrollment already exists:", existingEnrollment._id);
          }
  
          // Generate and save invoice
          const existingInvoice = await Invoice.findOne({
            user: userId,
            course: courseId,
            paymentId: paymentIntentId,
          });
  
          if (!existingInvoice) {
            const invoice = new Invoice({
              invoiceId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user: userId,
              course: courseId,
              amount: payment.amount,
              currency: "USD",
              paymentId: paymentIntentId,
              status: "completed",
            });
            await invoice.save();
            console.log("Invoice created:", invoice._id);
          } else {
            console.log("Invoice already exists:", existingInvoice._id);
          }
  
          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object;
          const userId = session.metadata.userId;
          const courseId = session.metadata.courseId;
  
          console.log("Processing checkout.session.expired:", { userId, courseId });
  
          const payment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: "completed",
          });
  
          if (payment) {
            payment.status = "failed";
            await payment.save();
            console.log("Payment marked as failed:", payment._id);
          } else {
            console.log("No pending payment found for expired session");
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
  
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error.message, error.stack);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  // New endpoint to verify enrollment after payment
export const verifyEnrollment = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.userId;
  
    try {
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }
  
      // Check if payment is completed
      let payment = await Payment.findOne({
        user: userId,
        course: courseId,
        status: 'completed',
      });
  
      // Fallback: If no completed payment, check for pending payment
      if (!payment) {
        payment = await Payment.findOne({
          user: userId,
          course: courseId,
          status: 'pending',
        });
  
        if (payment) {
          // Wait a short time and recheck (simulating webhook delay)
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          payment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: 'completed',
          });
        }
      }
  
      if (!payment) {
        return res.status(404).json({ message: 'No completed payment found' });
      }
  
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
      });
  
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
  
      res.status(200).json({ message: 'Enrollment verified', enrollmentId: enrollment._id });
    } catch (error) {
      console.error('Error verifying enrollment:', error.message, error.stack);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


// Get all payments for a user
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId })
      .populate("course", "title")
      .lean();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific payment by ID
export const getPaymentById = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId)
      .populate("course", "title")
      .populate("user", "name")
      .lean();

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
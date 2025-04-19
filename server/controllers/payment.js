import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import axios from "axios";
import { createEnrollment, saveEnrollmentDb } from "./enrollment.js";

const initiateKhaltiPayment = async (req, res) => {
  console.log(`initiating payment`);
  const { courseId, user } = req.body;

  const enrollment = await Enrollment.findOne({
    course: courseId,
    user: user._id,
    isPaid: true,
  });

  if (enrollment) {
    return res.status(400).json({ message: "Already enrolled" });
  }

  const course = await Course.findById(courseId);
  const userObj = await User.findById(user._id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (!userObj) {
    return res.status(404).json({ message: "User not found" });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:8080";
  const khaltiUrl = process.env.KHALTI_URL || "https://dev.khalti.com/api/v2/";
  const khaltiKey = process.env.KHALTI_KEY;

  if (!khaltiKey) {
    console.error("Khalti key is missing in environment variables");
    return res.status(500).json({
      message: "Khalti key is not configured",
    });
  }

  const subTotal = Math.round(course.price * 100);
  const tax = Math.round(subTotal * 0.13);
  const totalAmount = subTotal + tax;

  const formData = {
    return_url: `${clientUrl}/course/${courseId}/enroll/?step=2`,
    website_url: clientUrl,
    amount: totalAmount.toString(),
    purchase_order_id: courseId,
    purchase_order_name: `Course: ${course.title}`,
    customer_info: {
      name: userObj.name,
      email: userObj.email,
    },
    amount_breakdown: [
      {
        label: "Subtotal",
        amount: subTotal,
      },
      {
        label: "Tax",
        amount: tax,
      },
    ],
  };

  try {
    const payment = await Payment.create({
      amount: course.price,
      studentId: userObj._id,
      provider: "khalti",
      status: "initiated",
      paymentData: formData,
    });

    const { data: khaltiResponse } = await axios.post(
      `${khaltiUrl}epayment/initiate/`,
      formData,
      {
        headers: {
          Authorization: `key ${khaltiKey}`,
        },
      }
    );

    await Payment.updateOne(
      { _id: payment._id },
      {
        transactionId: khaltiResponse.pidx || null,
        paymentUrl: khaltiResponse.payment_url,
        status: "pending",
        responseData: khaltiResponse,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        paymentUrl: khaltiResponse.payment_url,
        message: "Payment initiated successfully",
      },
    });
  } catch (error) {
    console.error(
      "Payment initiation error:",
      error.response?.data || error.message
    );

    await Payment.create({
      amount: course.price,
      status: "failed",
      studentId: userObj._id,
      provider: "khalti",
      paymentData: formData,
      responseData: error.response?.data || { message: error.message },
    });

    const errorMessage = error.response?.data
      ? Object.values(error.response.data).flat().join(", ")
      : error.message;

    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: errorMessage,
    });
  }
};

const verifyKhaltiPayment = async (req, res, next) => {
  const { pidx, courseId } = req.body;

  if (!pidx || !courseId) {
    return res.status(400).json({
      success: false,
      message: "Payment ID and Course ID are required",
    });
  }

  const payment = await Payment.findOne({
    transactionId: pidx,
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment record not found",
    });
  }

  const khaltiUrl = process.env.KHALTI_URL || "https://dev.khalti.com/api/v2/";
  const khaltiKey = process.env.KHALTI_KEY;

  if (!khaltiKey) {
    return res.status(500).json({
      success: false,
      message: "Khalti key is not configured",
    });
  }

  try {
    const { data: verifyResponse } = await axios.post(
      `${khaltiUrl}epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `key ${khaltiKey}`,
        },
      }
    );

    // Update payment status based on Khalti response
    if (verifyResponse.status === "Completed") {
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: "completed",
          responseData: verifyResponse,
        }
      );

      // Create enrollment record
      await saveEnrollmentDb({
        courseId: courseId,
        userId: payment.studentId,
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: "khalti",
        paymentId: payment._id,
      });

      return res.status(200).json({
        success: true,
        data: {
          message: "Payment verified successfully",
          payment: {
            id: payment._id,
            status: "completed",
            transactionId: pidx,
            amount: payment.amount,
          },
        },
      });
    } else {
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: "pending",
          responseData: verifyResponse,
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          message: "Payment is pending",
          status: verifyResponse.status,
          payment: {
            id: payment._id,
            status: "pending",
            transactionId: pidx,
            amount: payment.amount,
          },
        },
      });
    }
  } catch (error) {
    console.error(
      "Khalti payment verification error:",
      error.response?.data || error.message
    );

    await Payment.updateOne(
      { _id: payment._id },
      {
        status: "failed",
        responseData: error.response?.data || { message: error.message },
      }
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.response?.data || error.message,
    });
  }
};

export { initiateKhaltiPayment, verifyKhaltiPayment };

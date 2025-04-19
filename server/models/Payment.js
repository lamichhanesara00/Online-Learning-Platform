import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Amount cannot be negative",
      },
    },
    status: {
      type: String,
      enum: [
        "initiated",
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      required: true,
      default: "initiated",
    },
    transactionId: {
      type: String,
    },
    paymentUrl: {
      type: String,
    },
    paymentData: {
      type: mongoose.Schema.Types.Mixed,
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.path("amount").get(function (num) {
  return (num / 1).toFixed(2);
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;

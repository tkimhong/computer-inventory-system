const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["checkout", "checkin"], required: true },
    documentPath: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);

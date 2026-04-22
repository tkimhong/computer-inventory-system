const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    hashedKey:  { type: String, required: true },
    keyPrefix:  { type: String, required: true }, 
    label:      { type: String, required: true },  
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("ApiKey", apiKeySchema);

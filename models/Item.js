const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  serialNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  model: { 
    type: String, 
    required: true 
  },
  brand: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true // e.g., Laptops, Desktops, Servers, Monitors, Keyboards
  },
  status: { 
    type: String, 
    enum: ["Available", "In-Use", "Maintenance", "Retired"], 
    default: "Available" 
  },
  dateAcquired: {
    type: Date,
    default: Date.now
  },
  // Used for the Soft Delete requirement
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  PackageName: {
    type: String,
    required: false,
  },
  PackageImage: {
    type: Array,
    required: false,
  },
  TourLength: {
    type: String,
    required: false,
  },
  TotalPerson: {
    type: String,
    required: false,
  },
  selectedStatus: {
    type: String,
    required: false,
  },
  Description: {
    type: String,
    required: false,
  },
  eventType: {
    type: Array,
    required: false,
  },
  vehicles: {
    type: Array,
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "Active",
  },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("packages", PackageSchema);

const mongoose = require("mongoose");

const CustomersSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  stripeId: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  contact_no: {
    type: String,
    required: false,
  },
  userImage: {
    type: String,
    required: false,
  },
  signature: {
    type: String,
    required: false,
  },
  documents: {
    type: Array,
    required: false,
  },
  addressLine1: {
    type: String,
    required: false,
  },
  addressLine2: {
    type: String,
    required: false,
  },
  addressLine3: {
    type: String,
    required: false,
  },
  zipCode: {
    type: Number,
    required: false,
  },
  documentStatus: {
    type: String,
    default: "",
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  wallet_balance: {
    type: Number,
    default: 0,
    required: false,
  },
  customerStatus: {
    type: String,
    default: "active",
  },
});

module.exports = mongoose.model("customers", CustomersSchema);

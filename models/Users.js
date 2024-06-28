const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  countryCode: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  designation: {
    type: String,
    required: false,
  },
  signature: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date(),
  },
  documentStatus: {
    type: String,
    required: false,
  },
  reason_Rejection:{
    type:String,
    required:false
  }
});

module.exports = mongoose.model("users", UsersSchema);

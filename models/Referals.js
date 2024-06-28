const mongoose = require("mongoose");

const ReferalSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  refered_email: {
    type: String,
    required: false,
  },
  referal_code: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    default: "not-used",
    required: false,
  },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("referal", ReferalSchema);

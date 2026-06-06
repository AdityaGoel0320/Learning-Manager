const mongoose = require("mongoose");

const learningSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
    min: 1
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true
  },

  subTopic: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending"
  }
},
{
  timestamps: true
});

module.exports = mongoose.model("Learning", learningSchema);
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
  type: String,
  enum: ["Pending", "Submitted"],
  default: "Pending",
},
  priority: {
    type: String,
    enum: ["Must-Do", "Should-Do", "Can Wait"],
    default: "Should-Do",
  },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
 
const express = require("express");
const Assignment = require("../models/Assignment");

const router = express.Router();

router.get("/", async (request, response) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1 });
    response.json(assignments);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.post("/", async (request, response) => {
  try {
    const assignment = new Assignment({
      title: request.body.title,
      dueDate: request.body.dueDate,
      status: request.body.status || "Pending",
      priority: request.body.priority || "Should-Do",
    });

    const savedAssignment = await assignment.save();
    response.status(201).json(savedAssignment);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (request, response) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(
      request.params.id
    );

    if (!deletedAssignment) {
      return response.status(404).json({ message: "Assignment not found." });
    }

    response.json({ message: "Assignment deleted successfully." });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (request, response) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      request.params.id,
      {
        title: request.body.title,
        dueDate: request.body.dueDate,
        status: request.body.status || "Pending",
        priority: request.body.priority || "Should-Do",
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedAssignment) {
      return response.status(404).json({ message: "Assignment not found." });
    }

    response.json(updatedAssignment);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

module.exports = router;
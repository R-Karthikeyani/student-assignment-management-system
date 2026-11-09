require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const assignmentRoutes = require("./routes/assignmentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/assignments", assignmentRoutes);

app.get("/", (request, response) => {
  response.send("Student Assignment Management API is running.");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB.");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
  });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

const topicRoutes = require("./routes/topicRoutes");
const learningRoutes = require("./routes/learningRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.get("/", (req, res) => {
  res.json({
    message: "Learning Manager API is running",
  });
});


mongoose
  .connect(
    "mongodb+srv://adityagoeldev_db_user:aditya10@cluster0.mo0uzbu.mongodb.net/learning-manager"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server Running On Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed");
    console.error(err);
    process.exit(1);
  });

app.use("/api/topics", topicRoutes);
app.use("/api/learning", learningRoutes);
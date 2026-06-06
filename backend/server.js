const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

const topicRoutes = require("./routes/topicRoutes");
const learningRoutes = require("./routes/learningRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());
dns.setServers(["1.1.1.1", "8.8.8.8"]);



mongoose
  .connect(
    "mongodb+srv://adityagoeldev_db_user:aditya10@cluster0.mo0uzbu.mongodb.net/learning-manager"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed");
    console.error(err);
  });

app.use("/api/topics", topicRoutes);
app.use("/api/learning", learningRoutes);

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
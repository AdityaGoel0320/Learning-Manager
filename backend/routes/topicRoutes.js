const express = require("express");
const router = express.Router();

const Topic = require("../models/Topic");
const Learning = require("../models/Learning");

router.get("/", async (req, res) => {
  const topics = await Topic.find().sort({ name: 1 });
  res.json(topics);
});

router.post("/", async (req, res) => {
  const topic = await Topic.create(req.body);
  res.json(topic);
});

router.put("/:id", async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(topic);
});

router.delete("/:id", async (req, res) => {
  await Learning.deleteMany({
    topic: req.params.id,
  });

  await Topic.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Topic Deleted",
  });
});

module.exports = router;
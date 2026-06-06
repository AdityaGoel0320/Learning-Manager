const express = require("express");
const router = express.Router();

const Learning = require("../models/Learning");

router.get("/", async (req, res) => {
  const data = await Learning.find()
    .populate("topic")
    .sort({
      orderNumber: 1,
      subTopic: 1,
    });

  res.json(data);
});

router.post("/", async (req, res) => {
  const item = await Learning.create(req.body);
  res.json(item);
});

router.put("/:id", async (req, res) => {
  const item = await Learning.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.json(item);
});

router.delete("/:id", async (req, res) => {
  await Learning.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
  });
});

module.exports = router;
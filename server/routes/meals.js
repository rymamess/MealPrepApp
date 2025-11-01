import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

// GET all meals
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

console.log("test");

// GET meal by ID
router.get("/:id", async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new meal
router.post("/", async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

import express from "express";
import mongoose from "mongoose";
import UserMeal from "../models/UserMeal.js";

const router = express.Router();

// 🔹 Hardcode userId pour l'instant
const HARDCODED_USER_ID = new mongoose.Types.ObjectId("64f1234567890abcdef12345");

// 🔹 GET all user meals
router.get("/", async (req, res) => {
  try {
    console.log("GET /userMeals");
    const userMeals = await UserMeal.find({ userId: HARDCODED_USER_ID });
    console.log(`Found ${userMeals.length} userMeals`);
    res.json(userMeals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST create a user meal
router.post("/", async (req, res) => {
  try {
    console.log("POST /userMeals Body:", req.body);

    // Crée le document en utilisant le HARDCODED_USER_ID
    const newMeal = new UserMeal({
      userId: HARDCODED_USER_ID,
      visibility: req.body.visibility || "private",
      ...req.body, // champs comme name, category, ingredients, etc.
    });

    const savedMeal = await newMeal.save();
    console.log("✅ Created UserMeal:", savedMeal);
    res.status(201).json(savedMeal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 🔹 GET one user meal
router.get("/:id", async (req, res) => {
  try {
    const meal = await UserMeal.findOne({
      _id: req.params.id,
      userId: HARDCODED_USER_ID,
    });
    if (!meal) return res.status(404).json({ error: "UserMeal not found" });
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT update a user meal
router.put("/:id", async (req, res) => {
  try {
    const { _id, userId, createdAt, ...updatableFields } = req.body;

    const updatedMeal = await UserMeal.findOneAndUpdate(
      { _id: req.params.id, userId: HARDCODED_USER_ID },
      {
        ...updatableFields,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedMeal) return res.status(404).json({ error: "UserMeal not found" });
    res.json(updatedMeal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 🔹 DELETE remove a user meal
router.delete("/:id", async (req, res) => {
  try {
    const deletedMeal = await UserMeal.findOneAndDelete({
      _id: req.params.id,
      userId: HARDCODED_USER_ID,
    });

    if (!deletedMeal) return res.status(404).json({ error: "UserMeal not found" });
    res.json({ message: "UserMeal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

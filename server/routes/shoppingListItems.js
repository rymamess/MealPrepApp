import express from "express";
import ManualShoppingItem from "../models/ManualShoppingItem.js";
import { INGREDIENT_CATEGORIES } from "../models/Ingredient.js";
import { UNITS } from "../models/Meal.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseISODateUTC } from "../utils/dateRange.js";

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.use(requireAuth);

// 🔹 POST créer (ou fusionner avec un item existant du même nom+unité+période) un item
// de liste de courses ajouté manuellement
router.post("/", async (req, res) => {
  try {
    const { name, category, quantity, unit, periodStart, periodEnd } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!INGREDIENT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!UNITS.includes(unit)) {
      return res.status(400).json({ error: "Invalid unit" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "quantity must be greater than 0" });
    }

    const startDate = parseISODateUTC(periodStart, "start");
    const endDate = parseISODateUTC(periodEnd, "end");
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Invalid periodStart or periodEnd" });
    }
    if (startDate > endDate) {
      return res.status(400).json({ error: "periodStart must be before periodEnd" });
    }

    const trimmedName = name.trim();

    const existing = await ManualShoppingItem.findOne({
      userId: req.userId,
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
      unit,
      periodStart: startDate,
      periodEnd: endDate,
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }

    const created = await ManualShoppingItem.create({
      userId: req.userId,
      name: trimmedName,
      category,
      quantity,
      unit,
      periodStart: startDate,
      periodEnd: endDate,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 DELETE retirer un item ajouté manuellement
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ManualShoppingItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ error: "ManualShoppingItem not found" });
    res.json({ message: "ManualShoppingItem deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

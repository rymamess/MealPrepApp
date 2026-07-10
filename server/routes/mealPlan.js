import express from "express";
import MealPlanEntry from "../models/MealPlanEntry.js";
import Meal from "../models/Meal.js";
import UserMeal from "../models/UserMeal.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { computeShoppingList } from "../utils/shoppingList.js";

const router = express.Router();

const MEAL_TYPES = ["Breakfast", "Snack", "Lunch", "Dinner", "Dessert"];
const ITEM_TYPES = ["Meal", "UserMeal"];

// boundary: 'start' -> minuit UTC du jour, 'end' -> 23:59:59.999 UTC du jour
function parseISODateUTC(value, boundary) {
  if (!value) return null;
  const time = boundary === "end" ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${value}T${time}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseQueryRange(req, res) {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).json({ error: "start and end query params are required (YYYY-MM-DD)" });
    return null;
  }
  const startDate = parseISODateUTC(start, "start");
  const endDate = parseISODateUTC(end, "end");
  if (!startDate || !endDate) {
    res.status(400).json({ error: "Invalid start or end date" });
    return null;
  }
  return { startDate, endDate };
}

// Chevauchement d'intervalle : l'entrée est retournée dès que sa période
// [periodStart, periodEnd] chevauche au moins partiellement [queryStart, queryEnd].
function overlapFilter(userId, startDate, endDate) {
  return {
    userId,
    periodStart: { $lte: endDate },
    periodEnd: { $gte: startDate },
  };
}

router.use(requireAuth);

// 🔹 GET meal plan entries overlapping a date range
router.get("/", async (req, res) => {
  try {
    const range = parseQueryRange(req, res);
    if (!range) return;

    const entries = await MealPlanEntry.find(overlapFilter(req.userId, range.startDate, range.endDate))
      .populate("itemId")
      .sort({ periodStart: 1, createdAt: 1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GET aggregated shopping list for entries overlapping a date range
router.get("/shopping-list", async (req, res) => {
  try {
    const range = parseQueryRange(req, res);
    if (!range) return;

    const entries = await MealPlanEntry.find(overlapFilter(req.userId, range.startDate, range.endDate)).populate(
      "itemId"
    );

    res.json(computeShoppingList(entries));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST create a meal plan entry
router.post("/", async (req, res) => {
  try {
    const { periodStart, periodEnd, plannedDay, mealType, itemType, itemId, servings } = req.body;

    const startDate = parseISODateUTC(periodStart, "start");
    const endDate = parseISODateUTC(periodEnd, "end");
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Invalid periodStart or periodEnd" });
    }
    if (startDate > endDate) {
      return res.status(400).json({ error: "periodStart must be before periodEnd" });
    }
    if (!MEAL_TYPES.includes(mealType)) {
      return res.status(400).json({ error: "Invalid mealType" });
    }
    if (!ITEM_TYPES.includes(itemType) || !itemId) {
      return res.status(400).json({ error: "Invalid itemType or itemId" });
    }
    if (!servings || servings < 1) {
      return res.status(400).json({ error: "servings must be at least 1" });
    }

    if (itemType === "UserMeal") {
      const userMeal = await UserMeal.findOne({ _id: itemId, userId: req.userId });
      if (!userMeal) return res.status(404).json({ error: "UserMeal not found" });
    } else {
      const meal = await Meal.findById(itemId);
      if (!meal) return res.status(404).json({ error: "Meal not found" });
    }

    const plannedDayDate = plannedDay ? parseISODateUTC(plannedDay, "start") : null;

    const entry = await MealPlanEntry.create({
      userId: req.userId,
      periodStart: startDate,
      periodEnd: endDate,
      plannedDay: plannedDayDate,
      mealType,
      itemType,
      itemId,
      servings,
    });

    const populated = await entry.populate("itemId");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 PUT update a meal plan entry (quantité, créneau, période, jour indicatif)
router.put("/:id", async (req, res) => {
  try {
    const updates = {};

    if (req.body.mealType !== undefined) {
      if (!MEAL_TYPES.includes(req.body.mealType)) {
        return res.status(400).json({ error: "Invalid mealType" });
      }
      updates.mealType = req.body.mealType;
    }

    if (req.body.servings !== undefined) {
      if (!req.body.servings || req.body.servings < 1) {
        return res.status(400).json({ error: "servings must be at least 1" });
      }
      updates.servings = req.body.servings;
    }

    if (req.body.periodStart !== undefined) {
      const startDate = parseISODateUTC(req.body.periodStart, "start");
      if (!startDate) return res.status(400).json({ error: "Invalid periodStart" });
      updates.periodStart = startDate;
    }

    if (req.body.periodEnd !== undefined) {
      const endDate = parseISODateUTC(req.body.periodEnd, "end");
      if (!endDate) return res.status(400).json({ error: "Invalid periodEnd" });
      updates.periodEnd = endDate;
    }

    if (req.body.plannedDay !== undefined) {
      updates.plannedDay = req.body.plannedDay ? parseISODateUTC(req.body.plannedDay, "start") : null;
    }

    if (updates.periodStart && updates.periodEnd && updates.periodStart > updates.periodEnd) {
      return res.status(400).json({ error: "periodStart must be before periodEnd" });
    }

    const updated = await MealPlanEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("itemId");

    if (!updated) return res.status(404).json({ error: "MealPlanEntry not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 DELETE a meal plan entry
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MealPlanEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ error: "MealPlanEntry not found" });
    res.json({ message: "MealPlanEntry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

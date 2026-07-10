import mongoose from 'mongoose';

const MealPlanEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  plannedDay: { type: Date, default: null },
  mealType: { type: String, enum: ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Dessert'], required: true },
  itemType: { type: String, enum: ['Meal', 'UserMeal'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemType' },
  servings: { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now },
});

MealPlanEntrySchema.index({ userId: 1, periodStart: 1 });

export default mongoose.model('MealPlanEntry', MealPlanEntrySchema, 'mealPlanEntries');

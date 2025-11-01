import mongoose from 'mongoose';
import { MealBaseSchema } from './Meal.js';

const UserMealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  baseMealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', default: null },
  visibility: { type: String, enum: ['private','group'], default: 'private' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔹 Ajouter tous les champs de MealBase
UserMealSchema.add(MealBaseSchema);

UserMealSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('UserMeal', UserMealSchema, 'userMeals');

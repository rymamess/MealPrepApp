import mongoose from 'mongoose';
import UserMeal from './models/UserMeal.js';

const HARDCODED_USER_ID = '64f1234567890abcdef12345';
const MONGO_URI = 'mongodb+srv://rymamessedaa_db_user:RYM4-mealprep@cluster0.mxi9dqi.mongodb.net/test?retryWrites=true&w=majority';

async function createUserMeal() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const newMeal = new UserMeal({
      userId: HARDCODED_USER_ID,
      visibility: 'private',
      name: 'RM TEST',
      photo: 'https://example.com/images/quinoa-salad.jpg',
      category: 'lunch',
      prepTime: 10,
      cookTime: 0,
      difficulty: 'easy',
      portions: 2,
      ingredients: [
        { name: 'quinoa', quantity: '100g' },
        { name: 'tomate', quantity: '50g' },
        { name: 'concombre', quantity: '50g' },
      ],
      spices: [
        { name: 'sel', quantity: '1 pincée' },
        { name: 'poivre', quantity: '1 pincée' },
      ],
      description: 'Une salade saine et rapide à préparer',
    });

    const savedMeal = await newMeal.save();
    console.log('✅ Created UserMeal:', savedMeal);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createUserMeal();

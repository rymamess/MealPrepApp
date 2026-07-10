import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const APPLY = process.argv.includes("--apply");

// Staples courants (québécois/français), répartis sur les 8 catégories.
const SEED_INGREDIENTS = [
  // Meat
  { name: "Poulet", category: "Meat" },
  { name: "Bœuf haché", category: "Meat" },
  { name: "Poitrine de poulet", category: "Meat" },
  { name: "Porc haché", category: "Meat" },
  { name: "Bacon", category: "Meat" },
  { name: "Saucisses", category: "Meat" },
  // Seafood
  { name: "Saumon", category: "Seafood" },
  { name: "Crevettes", category: "Seafood" },
  { name: "Thon", category: "Seafood" },
  { name: "Tilapia", category: "Seafood" },
  // Dairy
  { name: "Lait", category: "Dairy" },
  { name: "Fromage cheddar", category: "Dairy" },
  { name: "Yogourt nature", category: "Dairy" },
  { name: "Beurre", category: "Dairy" },
  { name: "Crème 35%", category: "Dairy" },
  { name: "Œufs", category: "Dairy" },
  // Vegetables
  { name: "Oignon", category: "Vegetables" },
  { name: "Ail", category: "Vegetables" },
  { name: "Carotte", category: "Vegetables" },
  { name: "Poivron", category: "Vegetables" },
  { name: "Tomate", category: "Vegetables" },
  { name: "Brocoli", category: "Vegetables" },
  { name: "Céleri", category: "Vegetables" },
  { name: "Champignons", category: "Vegetables" },
  { name: "Pomme de terre", category: "Vegetables" },
  { name: "Épinards", category: "Vegetables" },
  // Fruits
  { name: "Pomme", category: "Fruits" },
  { name: "Banane", category: "Fruits" },
  { name: "Citron", category: "Fruits" },
  { name: "Fraises", category: "Fruits" },
  // Grains
  { name: "Riz", category: "Grains" },
  { name: "Pâtes", category: "Grains" },
  { name: "Farine", category: "Grains" },
  { name: "Pain", category: "Grains" },
  { name: "Quinoa", category: "Grains" },
  { name: "Avoine", category: "Grains" },
  // Spices (épices & herbes)
  { name: "Sel", category: "Spices" },
  { name: "Poivre noir", category: "Spices" },
  { name: "Thym", category: "Spices" },
  { name: "Basilic", category: "Spices" },
  { name: "Origan", category: "Spices" },
  { name: "Persil", category: "Spices" },
  { name: "Cannelle", category: "Spices" },
  { name: "Cumin", category: "Spices" },
  { name: "Paprika", category: "Spices" },
  { name: "Curcuma", category: "Spices" },
  { name: "Poudre d'ail", category: "Spices" },
  { name: "Piment de Cayenne", category: "Spices" },
  { name: "Muscade", category: "Spices" },
  { name: "Gingembre moulu", category: "Spices" },
  { name: "Feuilles de laurier", category: "Spices" },
  // Condiments
  { name: "Huile d'olive", category: "Condiments" },
  { name: "Sauce soya", category: "Condiments" },
  { name: "Vinaigre balsamique", category: "Condiments" },
  { name: "Moutarde", category: "Condiments" },
  { name: "Ketchup", category: "Condiments" },
  { name: "Mayonnaise", category: "Condiments" },
  // Other
  { name: "Bouillon de poulet", category: "Other" },
  { name: "Tofu", category: "Other" },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connecté à MongoDB (${APPLY ? "mode ÉCRITURE" : "mode DRY RUN, lecture seule"})`);

  const collection = mongoose.connection.collection("ingredients");
  const existing = await collection.find({}).project({ name: 1 }).toArray();
  const existingNames = new Set(existing.map((doc) => doc.name.toLowerCase()));

  const toInsert = SEED_INGREDIENTS.filter((item) => !existingNames.has(item.name.toLowerCase()));

  console.log(`\n${APPLY ? "Ajouté" : "À ajouter"}: ${toInsert.length} ingrédient(s) (${SEED_INGREDIENTS.length - toInsert.length} déjà présents, ignorés).`);
  toInsert.forEach((item) => console.log(`  - ${item.name} (${item.category})`));

  if (APPLY && toInsert.length) {
    await collection.insertMany(toInsert);
    console.log(`\n✅ ${toInsert.length} ingrédient(s) ajouté(s) au catalogue partagé.`);
  } else if (!APPLY && toInsert.length) {
    console.log("\n👉 Relance avec --apply pour les ajouter.");
  } else {
    console.log("\nRien à ajouter 🎉");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Échec:", err);
  process.exit(1);
});

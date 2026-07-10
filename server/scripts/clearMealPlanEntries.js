import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const APPLY = process.argv.includes("--apply");

// Le schema de mealPlanEntries a changé de forme de façon incompatible
// (date -> periodStart/periodEnd/plannedDay, servings devenu obligatoire).
// Ce script vide la collection plutôt que de migrer des données de test.
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connecté à MongoDB (${APPLY ? "mode ÉCRITURE" : "mode DRY RUN, lecture seule"})`);

  const collection = mongoose.connection.collection("mealPlanEntries");
  const count = await collection.countDocuments();

  console.log(`\n${APPLY ? "Supprimé" : "À supprimer"}: ${count} document(s) dans mealPlanEntries.`);

  if (APPLY && count > 0) {
    const result = await collection.deleteMany({});
    console.log(`\n✅ ${result.deletedCount} document(s) supprimé(s).`);
  } else if (!APPLY && count > 0) {
    console.log("\n👉 Relance avec --apply pour supprimer ces documents.");
  } else {
    console.log("\nRien à supprimer 🎉");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Échec:", err);
  process.exit(1);
});

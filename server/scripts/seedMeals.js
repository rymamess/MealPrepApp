import mongoose from "mongoose";
import dotenv from "dotenv";
import Meal, { UNITS, COOK_MODES } from "../models/Meal.js";
import { INGREDIENT_CATEGORIES } from "../models/Ingredient.js";

dotenv.config();

const APPLY = process.argv.includes("--apply");

// Recettes classiques et basiques pour enrichir l'onglet "Explorer".
// Format conforme au schéma actuel de Meal (server/models/Meal.js).
const SEED_MEALS = [
  // ---------- Breakfast ----------
  {
    name: "Pancakes moelleux",
    photo: "https://upload.wikimedia.org/wikipedia/commons/4/40/Foodiesfeed.com_pouring-honey-on-pancakes-with-walnuts.jpg",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 15,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Farine", quantity: 250, unit: "g", category: "Grains" },
      { name: "Lait", quantity: 300, unit: "ml", category: "Dairy" },
      { name: "Œufs", quantity: 2, unit: "unité", category: "Dairy" },
      { name: "Beurre", quantity: 40, unit: "g", category: "Dairy" },
      { name: "Sucre", quantity: 30, unit: "g", category: "Other" },
    ],
    spices: [
      { name: "Levure chimique", quantity: 2, unit: "c. à café", category: "Other" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Mélanger la farine, le sucre, la levure et le sel. Ajouter le lait, les œufs battus et le beurre fondu, fouetter jusqu'à obtenir une pâte lisse. Cuire à la poêle 2 à 3 minutes de chaque côté jusqu'à ce que des bulles apparaissent en surface, puis retourner. Servir avec sirop d'érable ou fruits frais.",
  },
  {
    name: "Œufs brouillés crémeux",
    photo: "https://upload.wikimedia.org/wikipedia/commons/4/47/Scrambled_eggs_with_basil.jpg",
    category: "Breakfast",
    prepTime: 5,
    cookTime: 5,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Œufs", quantity: 4, unit: "unité", category: "Dairy" },
      { name: "Beurre", quantity: 20, unit: "g", category: "Dairy" },
      { name: "Crème 35%", quantity: 30, unit: "ml", category: "Dairy" },
    ],
    spices: [
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Ciboulette fraîche", quantity: 1, unit: "c. à soupe", category: "Spices" },
    ],
    description:
      "Battre les œufs avec la crème, le sel et le poivre. Faire fondre le beurre dans une poêle à feu doux, verser les œufs et remuer constamment à la spatule jusqu'à obtenir une texture crémeuse. Retirer du feu avant qu'ils ne soient complètement pris, parsemer de ciboulette et servir immédiatement.",
  },
  {
    name: "Porridge à l'avoine et fruits",
    photo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Swedish_cuisine-Oatmeal_with_cloudberry.jpg",
    category: "Breakfast",
    prepTime: 5,
    cookTime: 10,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Avoine", quantity: 100, unit: "g", category: "Grains" },
      { name: "Lait", quantity: 400, unit: "ml", category: "Dairy" },
      { name: "Banane", quantity: 1, unit: "unité", category: "Fruits" },
    ],
    spices: [
      { name: "Cannelle", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Miel", quantity: 1, unit: "c. à soupe", category: "Condiments" },
    ],
    description:
      "Porter le lait à ébullition, ajouter l'avoine et cuire à feu doux 8 à 10 minutes en remuant régulièrement jusqu'à obtenir une texture crémeuse. Servir dans des bols, garnir de rondelles de banane, d'un filet de miel et d'une pincée de cannelle.",
  },

  // ---------- Snack ----------
  {
    name: "Houmous maison",
    photo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Homemade_hummus_and_pita_03.jpg",
    category: "Snack",
    prepTime: 10,
    cookTime: 0,
    cookMode: "Aucune",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Pois chiches cuits", quantity: 400, unit: "g", category: "Other" },
      { name: "Tahini", quantity: 60, unit: "g", category: "Condiments" },
      { name: "Citron", quantity: 1, unit: "unité", category: "Fruits" },
      { name: "Ail", quantity: 1, unit: "unité", category: "Vegetables" },
    ],
    spices: [
      { name: "Huile d'olive", quantity: 3, unit: "c. à soupe", category: "Condiments" },
      { name: "Cumin", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Mixer les pois chiches, le tahini, le jus de citron, l'ail et le cumin jusqu'à obtenir une texture lisse, en ajoutant un peu d'eau si nécessaire. Assaisonner de sel, verser dans un bol et arroser d'huile d'olive avant de servir avec des crudités ou du pain pita.",
  },
  {
    name: "Guacamole frais",
    photo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Guacamole_IMGP1256.jpg",
    category: "Snack",
    prepTime: 10,
    cookTime: 0,
    cookMode: "Aucune",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Avocats", quantity: 3, unit: "unité", category: "Fruits" },
      { name: "Tomate", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Oignon rouge", quantity: 0.5, unit: "unité", category: "Vegetables" },
      { name: "Citron vert", quantity: 1, unit: "unité", category: "Fruits" },
    ],
    spices: [
      { name: "Coriandre fraîche", quantity: 2, unit: "c. à soupe", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Piment de Cayenne", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Écraser la chair des avocats à la fourchette. Ajouter la tomate et l'oignon rouge finement coupés, le jus de citron vert et la coriandre ciselée. Assaisonner de sel et d'une pincée de piment, mélanger et servir aussitôt avec des tortillas ou des nachos.",
  },
  {
    name: "Barres tendres à l'avoine",
    photo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Flapjacks.jpg",
    category: "Snack",
    prepTime: 15,
    cookTime: 20,
    cookMode: "Four",
    cookTemp: 180,
    difficulty: "Medium",
    servings: 8,
    ingredients: [
      { name: "Avoine", quantity: 200, unit: "g", category: "Grains" },
      { name: "Beurre", quantity: 80, unit: "g", category: "Dairy" },
      { name: "Miel", quantity: 100, unit: "g", category: "Condiments" },
      { name: "Canneberges séchées", quantity: 50, unit: "g", category: "Fruits" },
    ],
    spices: [
      { name: "Cannelle", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Préchauffer le four à 180°C. Faire fondre le beurre avec le miel, verser sur l'avoine et les canneberges, mélanger avec la cannelle et le sel. Presser fermement le mélange dans un moule carré tapissé de papier cuisson. Cuire 20 minutes jusqu'à ce que les bords soient dorés, laisser refroidir complètement avant de découper en barres.",
  },

  // ---------- Lunch ----------
  {
    name: "Salade César au poulet",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/38/Chicken_Caesar_Salad_-_Amo_2026-04-11.jpg",
    category: "Lunch",
    prepTime: 15,
    cookTime: 10,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Poitrine de poulet", quantity: 2, unit: "unité", category: "Meat" },
      { name: "Laitue romaine", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Parmesan", quantity: 50, unit: "g", category: "Dairy" },
      { name: "Croûtons", quantity: 60, unit: "g", category: "Grains" },
    ],
    spices: [
      { name: "Huile d'olive", quantity: 2, unit: "c. à soupe", category: "Condiments" },
      { name: "Sauce César", quantity: 4, unit: "c. à soupe", category: "Condiments" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Assaisonner et cuire les poitrines de poulet à la poêle avec un filet d'huile jusqu'à cuisson complète, puis trancher. Déchirer la laitue romaine, la répartir dans les assiettes avec le poulet, les croûtons et le parmesan râpé. Napper de sauce César et poivrer avant de servir.",
  },
  {
    name: "Sandwich club au poulet",
    photo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Club-sandwich.jpg",
    category: "Lunch",
    prepTime: 15,
    cookTime: 10,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Pain de mie", quantity: 6, unit: "unité", category: "Grains" },
      { name: "Poitrine de poulet", quantity: 1, unit: "unité", category: "Meat" },
      { name: "Bacon", quantity: 4, unit: "unité", category: "Meat" },
      { name: "Tomate", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Laitue", quantity: 4, unit: "unité", category: "Vegetables" },
    ],
    spices: [
      { name: "Mayonnaise", quantity: 3, unit: "c. à soupe", category: "Condiments" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Griller le pain de mie. Cuire la poitrine de poulet à la poêle et la trancher, faire cuire le bacon jusqu'à ce qu'il soit croustillant. Tartiner le pain de mayonnaise, superposer poulet, bacon, tomate et laitue entre les tranches grillées. Couper en triangles et maintenir avec des cure-dents avant de servir.",
  },
  {
    name: "Quiche lorraine",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/34/Quiche_lorraine_01.JPG",
    category: "Lunch",
    prepTime: 20,
    cookTime: 35,
    cookMode: "Four",
    cookTemp: 190,
    difficulty: "Medium",
    servings: 6,
    ingredients: [
      { name: "Pâte brisée", quantity: 1, unit: "unité", category: "Grains" },
      { name: "Œufs", quantity: 4, unit: "unité", category: "Dairy" },
      { name: "Crème 35%", quantity: 200, unit: "ml", category: "Dairy" },
      { name: "Lait", quantity: 100, unit: "ml", category: "Dairy" },
      { name: "Bacon", quantity: 150, unit: "g", category: "Meat" },
      { name: "Fromage gruyère", quantity: 100, unit: "g", category: "Dairy" },
    ],
    spices: [
      { name: "Muscade", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Préchauffer le four à 190°C. Foncer un moule avec la pâte brisée et piquer le fond à la fourchette. Faire revenir le bacon, le répartir sur la pâte avec le gruyère râpé. Battre les œufs avec la crème, le lait, la muscade, le sel et le poivre, puis verser sur la garniture. Cuire 35 minutes jusqu'à ce que la quiche soit dorée et prise au centre.",
  },
  {
    name: "Salade de riz aux légumes",
    photo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Rice_salad_with_balsamic_cream_and_black_sesame_%287581872284%29.jpg",
    category: "Lunch",
    prepTime: 15,
    cookTime: 15,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Riz", quantity: 200, unit: "g", category: "Grains" },
      { name: "Poivron", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Concombre", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Tomates cerises", quantity: 150, unit: "g", category: "Vegetables" },
      { name: "Maïs", quantity: 100, unit: "g", category: "Vegetables" },
    ],
    spices: [
      { name: "Huile d'olive", quantity: 3, unit: "c. à soupe", category: "Condiments" },
      { name: "Vinaigre balsamique", quantity: 1, unit: "c. à soupe", category: "Condiments" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Persil", quantity: 1, unit: "c. à soupe", category: "Spices" },
    ],
    description:
      "Cuire le riz selon les instructions du paquet puis laisser refroidir. Couper le poivron, le concombre et les tomates cerises en petits morceaux. Mélanger le riz froid avec les légumes et le maïs, assaisonner d'huile d'olive, de vinaigre balsamique, de sel, de poivre et de persil ciselé. Servir frais.",
  },

  // ---------- Dinner ----------
  {
    name: "Pâtes à la carbonara",
    photo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Spaghetti_alla_Carbonara.jpg",
    category: "Dinner",
    prepTime: 10,
    cookTime: 15,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Pâtes", quantity: 400, unit: "g", category: "Grains" },
      { name: "Lardons", quantity: 150, unit: "g", category: "Meat" },
      { name: "Œufs", quantity: 3, unit: "unité", category: "Dairy" },
      { name: "Parmesan", quantity: 80, unit: "g", category: "Dairy" },
    ],
    spices: [
      { name: "Poivre noir", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Cuire les pâtes dans l'eau bouillante salée. Pendant ce temps, faire revenir les lardons à sec jusqu'à ce qu'ils soient croustillants. Battre les œufs avec le parmesan et le poivre. Égoutter les pâtes en réservant un peu d'eau de cuisson, les mélanger hors du feu avec les lardons puis avec le mélange œufs-parmesan pour créer une sauce crémeuse. Ajouter un peu d'eau de cuisson si nécessaire et servir aussitôt.",
  },
  {
    name: "Ratatouille",
    photo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Ratatouille.jpg",
    category: "Dinner",
    prepTime: 20,
    cookTime: 40,
    cookMode: "Plaque",
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      { name: "Aubergine", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Courgette", quantity: 2, unit: "unité", category: "Vegetables" },
      { name: "Poivron", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Tomate", quantity: 4, unit: "unité", category: "Vegetables" },
      { name: "Oignon", quantity: 1, unit: "unité", category: "Vegetables" },
    ],
    spices: [
      { name: "Huile d'olive", quantity: 4, unit: "c. à soupe", category: "Condiments" },
      { name: "Ail", quantity: 2, unit: "unité", category: "Vegetables" },
      { name: "Thym", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Couper tous les légumes en cubes. Faire revenir l'oignon et l'ail dans l'huile d'olive, ajouter l'aubergine et le poivron, cuire quelques minutes. Ajouter la courgette et les tomates, assaisonner de thym, sel et poivre. Laisser mijoter à couvert environ 35 minutes en remuant de temps en temps, jusqu'à ce que les légumes soient fondants. Servir chaud ou tiède.",
  },
  {
    name: "Poulet au curry et riz",
    photo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Chicken_Curry_with_Rice.jpg",
    category: "Dinner",
    prepTime: 15,
    cookTime: 25,
    cookMode: "Plaque",
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      { name: "Poitrine de poulet", quantity: 4, unit: "unité", category: "Meat" },
      { name: "Lait de coco", quantity: 400, unit: "ml", category: "Other" },
      { name: "Oignon", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Riz", quantity: 300, unit: "g", category: "Grains" },
    ],
    spices: [
      { name: "Curry en poudre", quantity: 2, unit: "c. à soupe", category: "Spices" },
      { name: "Ail", quantity: 2, unit: "unité", category: "Vegetables" },
      { name: "Gingembre moulu", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Huile d'olive", quantity: 2, unit: "c. à soupe", category: "Condiments" },
    ],
    description:
      "Couper le poulet en morceaux et le faire dorer dans l'huile avec l'oignon émincé et l'ail. Ajouter le curry et le gingembre, mélanger pour bien enrober. Verser le lait de coco, saler et laisser mijoter environ 20 minutes jusqu'à ce que le poulet soit cuit et la sauce légèrement épaissie. Servir sur un lit de riz cuit.",
  },
  {
    name: "Chili con carne",
    photo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Chili_con_carne_50_A.jpg",
    category: "Dinner",
    prepTime: 15,
    cookTime: 35,
    cookMode: "Plaque",
    difficulty: "Medium",
    servings: 6,
    ingredients: [
      { name: "Bœuf haché", quantity: 500, unit: "g", category: "Meat" },
      { name: "Haricots rouges", quantity: 400, unit: "g", category: "Other" },
      { name: "Tomates concassées", quantity: 400, unit: "g", category: "Vegetables" },
      { name: "Oignon", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Poivron", quantity: 1, unit: "unité", category: "Vegetables" },
    ],
    spices: [
      { name: "Ail", quantity: 2, unit: "unité", category: "Vegetables" },
      { name: "Cumin", quantity: 1, unit: "c. à soupe", category: "Spices" },
      { name: "Paprika", quantity: 1, unit: "c. à soupe", category: "Spices" },
      { name: "Piment de Cayenne", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Faire revenir l'oignon, le poivron et l'ail, ajouter le bœuf haché et cuire jusqu'à ce qu'il soit doré. Ajouter le cumin, le paprika et le piment, mélanger. Verser les tomates concassées et les haricots rouges égouttés, saler et laisser mijoter à couvert environ 30 minutes en remuant de temps en temps. Servir avec du riz ou des tortillas.",
  },
  {
    name: "Saumon grillé aux légumes",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Liat_Portal_for_Foodie_Disorder_-_Homemade_grilled_salmon_with_butternut_squash.jpg",
    category: "Dinner",
    prepTime: 10,
    cookTime: 20,
    cookMode: "Four",
    cookTemp: 200,
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      { name: "Filet de saumon", quantity: 2, unit: "unité", category: "Seafood" },
      { name: "Courgette", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Poivron", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Citron", quantity: 1, unit: "unité", category: "Fruits" },
    ],
    spices: [
      { name: "Huile d'olive", quantity: 2, unit: "c. à soupe", category: "Condiments" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Aneth", quantity: 1, unit: "c. à café", category: "Spices" },
    ],
    description:
      "Préchauffer le four à 200°C. Disposer le saumon et les légumes coupés en morceaux sur une plaque, arroser d'huile d'olive, assaisonner de sel, poivre et aneth. Ajouter quelques rondelles de citron. Cuire 18 à 20 minutes jusqu'à ce que le saumon soit cuit et les légumes tendres. Servir immédiatement.",
  },
  {
    name: "Tacos au bœuf épicé",
    photo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Tacos_de_%28carne%29_asada.jpg",
    category: "Dinner",
    prepTime: 15,
    cookTime: 15,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Bœuf haché", quantity: 400, unit: "g", category: "Meat" },
      { name: "Tortillas de maïs", quantity: 8, unit: "unité", category: "Grains" },
      { name: "Tomate", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Laitue", quantity: 0.5, unit: "unité", category: "Vegetables" },
      { name: "Fromage cheddar", quantity: 80, unit: "g", category: "Dairy" },
    ],
    spices: [
      { name: "Cumin", quantity: 1, unit: "c. à soupe", category: "Spices" },
      { name: "Paprika", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Ail", quantity: 1, unit: "unité", category: "Vegetables" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Faire revenir le bœuf haché avec l'ail émincé, le cumin, le paprika et le sel jusqu'à ce que la viande soit bien cuite. Réchauffer les tortillas. Garnir chaque tortilla de viande, de tomate coupée en dés, de laitue émincée et de cheddar râpé. Servir aussitôt avec de la sauce piquante au goût.",
  },
  {
    name: "Pizza margherita maison",
    photo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Margherita_pizza_on_plate.jpg",
    category: "Dinner",
    prepTime: 25,
    cookTime: 15,
    cookMode: "Four",
    cookTemp: 220,
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      { name: "Pâte à pizza", quantity: 1, unit: "unité", category: "Grains" },
      { name: "Sauce tomate", quantity: 150, unit: "ml", category: "Condiments" },
      { name: "Mozzarella", quantity: 200, unit: "g", category: "Dairy" },
      { name: "Tomate", quantity: 1, unit: "unité", category: "Vegetables" },
    ],
    spices: [
      { name: "Basilic", quantity: 2, unit: "c. à soupe", category: "Spices" },
      { name: "Huile d'olive", quantity: 2, unit: "c. à soupe", category: "Condiments" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Préchauffer le four à 220°C. Étaler la pâte à pizza sur une plaque, napper de sauce tomate en laissant un bord. Répartir la mozzarella émincée et les tranches de tomate, saler légèrement. Cuire 12 à 15 minutes jusqu'à ce que la croûte soit dorée et le fromage fondu. Garnir de feuilles de basilic frais et d'un filet d'huile d'olive avant de servir.",
  },
  {
    name: "Soupe à l'oignon gratinée",
    photo: "https://upload.wikimedia.org/wikipedia/commons/b/be/French_Onion_Soup%2C_Applebee%27s.jpg",
    category: "Dinner",
    prepTime: 15,
    cookTime: 45,
    cookMode: "Four",
    cookTemp: 200,
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      { name: "Oignon", quantity: 4, unit: "unité", category: "Vegetables" },
      { name: "Bouillon de bœuf", quantity: 1, unit: "l", category: "Other" },
      { name: "Pain baguette", quantity: 4, unit: "unité", category: "Grains" },
      { name: "Fromage gruyère", quantity: 100, unit: "g", category: "Dairy" },
    ],
    spices: [
      { name: "Beurre", quantity: 30, unit: "g", category: "Dairy" },
      { name: "Thym", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Poivre noir", quantity: 1, unit: "pincée", category: "Spices" },
    ],
    description:
      "Émincer finement les oignons et les faire caraméliser doucement dans le beurre pendant 25 minutes en remuant régulièrement. Ajouter le bouillon de bœuf et le thym, saler, poivrer et laisser mijoter 15 minutes. Répartir la soupe dans des bols individuels allant au four, déposer une tranche de pain grillé et couvrir de gruyère râpé. Passer sous le four à 200°C jusqu'à ce que le fromage soit gratiné et doré.",
  },

  // ---------- Dessert ----------
  {
    name: "Mousse au chocolat",
    photo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Chocolate_mousse_%2816013444604%29.jpg",
    category: "Dessert",
    prepTime: 20,
    cookTime: 0,
    cookMode: "Aucune",
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      { name: "Chocolat noir", quantity: 200, unit: "g", category: "Other" },
      { name: "Œufs", quantity: 4, unit: "unité", category: "Dairy" },
      { name: "Sucre", quantity: 30, unit: "g", category: "Other" },
    ],
    spices: [{ name: "Sel", quantity: 1, unit: "pincée", category: "Spices" }],
    description:
      "Faire fondre le chocolat noir au bain-marie et laisser tiédir. Séparer les blancs des jaunes d'œufs. Mélanger les jaunes avec le chocolat fondu. Monter les blancs en neige ferme avec une pincée de sel, ajouter le sucre en fin de montage. Incorporer délicatement les blancs au mélange chocolaté en trois fois. Répartir dans des ramequins et réfrigérer au moins 3 heures avant de servir.",
  },
  {
    name: "Crêpes sucrées",
    photo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Pfannkuchen_mit_Zucker.jpg",
    category: "Dessert",
    prepTime: 10,
    cookTime: 20,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Farine", quantity: 250, unit: "g", category: "Grains" },
      { name: "Lait", quantity: 500, unit: "ml", category: "Dairy" },
      { name: "Œufs", quantity: 3, unit: "unité", category: "Dairy" },
      { name: "Beurre", quantity: 30, unit: "g", category: "Dairy" },
    ],
    spices: [
      { name: "Sucre", quantity: 2, unit: "c. à soupe", category: "Other" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Extrait de vanille", quantity: 1, unit: "c. à café", category: "Other" },
    ],
    description:
      "Mélanger la farine, le sucre et le sel dans un saladier. Creuser un puits, ajouter les œufs puis verser le lait progressivement en fouettant pour éviter les grumeaux. Ajouter le beurre fondu et la vanille. Laisser reposer la pâte 30 minutes. Cuire les crêpes dans une poêle chaude légèrement beurrée, environ 1 à 2 minutes de chaque côté. Servir avec du sucre, de la confiture ou du sirop d'érable.",
  },
  {
    name: "Compote de pommes maison",
    photo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Applesauce.jpg",
    category: "Dessert",
    prepTime: 10,
    cookTime: 20,
    cookMode: "Plaque",
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      { name: "Pomme", quantity: 6, unit: "unité", category: "Fruits" },
      { name: "Eau", quantity: 100, unit: "ml", category: "Other" },
    ],
    spices: [
      { name: "Cannelle", quantity: 1, unit: "c. à café", category: "Spices" },
      { name: "Sucre", quantity: 2, unit: "c. à soupe", category: "Other" },
    ],
    description:
      "Éplucher, épépiner et couper les pommes en morceaux. Les mettre dans une casserole avec l'eau, le sucre et la cannelle. Cuire à feu doux à couvert environ 20 minutes en remuant de temps en temps, jusqu'à ce que les pommes soient bien tendres. Écraser à la fourchette ou mixer selon la texture désirée. Servir tiède ou froid.",
  },
  {
    name: "Cookies aux pépites de chocolat",
    photo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Chocolate_chip_cookies_on_cutting_board.jpg",
    category: "Dessert",
    prepTime: 15,
    cookTime: 12,
    cookMode: "Four",
    cookTemp: 180,
    difficulty: "Easy",
    servings: 12,
    ingredients: [
      { name: "Farine", quantity: 280, unit: "g", category: "Grains" },
      { name: "Beurre", quantity: 150, unit: "g", category: "Dairy" },
      { name: "Sucre", quantity: 150, unit: "g", category: "Other" },
      { name: "Pépites de chocolat", quantity: 200, unit: "g", category: "Other" },
      { name: "Œufs", quantity: 1, unit: "unité", category: "Dairy" },
    ],
    spices: [
      { name: "Levure chimique", quantity: 1, unit: "c. à café", category: "Other" },
      { name: "Sel", quantity: 1, unit: "pincée", category: "Spices" },
      { name: "Extrait de vanille", quantity: 1, unit: "c. à café", category: "Other" },
    ],
    description:
      "Préchauffer le four à 180°C. Mélanger le beurre ramolli avec le sucre jusqu'à obtenir une texture crémeuse, ajouter l'œuf et la vanille. Incorporer la farine, la levure et le sel, puis ajouter les pépites de chocolat. Former des boules de pâte et les disposer sur une plaque tapissée de papier cuisson en les espaçant. Cuire 10 à 12 minutes jusqu'à ce que les bords soient dorés. Laisser refroidir sur une grille avant de déguster.",
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connecté à MongoDB (${APPLY ? "mode ÉCRITURE" : "mode DRY RUN, lecture seule"})`);

  // Validation stricte contre le schéma actuel avant toute écriture.
  const MEAL_CATEGORIES = ["Breakfast", "Snack", "Lunch", "Dinner", "Dessert"];
  const DIFFICULTIES = ["Easy", "Medium", "Hard"];
  let hasErrors = false;

  for (const meal of SEED_MEALS) {
    const errors = [];
    if (!meal.name) errors.push("name manquant");
    if (!meal.photo || meal.photo === "PLACEHOLDER") errors.push("photo manquante");
    if (!MEAL_CATEGORIES.includes(meal.category)) errors.push(`category invalide: "${meal.category}"`);
    if (!DIFFICULTIES.includes(meal.difficulty)) errors.push(`difficulty invalide: "${meal.difficulty}"`);
    if (!COOK_MODES.includes(meal.cookMode)) errors.push(`cookMode invalide: "${meal.cookMode}"`);
    for (const [label, list] of [["ingredients", meal.ingredients], ["spices", meal.spices]]) {
      (list || []).forEach((item, i) => {
        if (!item.name) errors.push(`${label}[${i}]: nom manquant`);
        if (typeof item.quantity !== "number") errors.push(`${label}[${i}] "${item.name}": quantity doit être un nombre`);
        if (!UNITS.includes(item.unit)) errors.push(`${label}[${i}] "${item.name}": unité invalide "${item.unit}"`);
        if (item.category && !INGREDIENT_CATEGORIES.includes(item.category)) {
          errors.push(`${label}[${i}] "${item.name}": catégorie invalide "${item.category}"`);
        }
      });
    }
    if (errors.length) {
      hasErrors = true;
      console.error(`❌ Recette "${meal.name}" invalide:`);
      errors.forEach((e) => console.error(`  - ${e}`));
    }
  }

  if (hasErrors) {
    await mongoose.disconnect();
    process.exit(1);
  }

  const existing = await Meal.find({}).select("name").lean();
  const existingNames = new Set(existing.map((m) => m.name.toLowerCase()));
  const toInsert = SEED_MEALS.filter((m) => !existingNames.has(m.name.toLowerCase()));

  console.log(
    `\n${APPLY ? "Ajouté" : "À ajouter"}: ${toInsert.length} recette(s) (${SEED_MEALS.length - toInsert.length} déjà présentes, ignorées).`
  );
  toInsert.forEach((m) => console.log(`  - ${m.name} (${m.category})`));

  if (APPLY && toInsert.length) {
    await Meal.insertMany(toInsert);
    console.log(`\n✅ ${toInsert.length} recette(s) ajoutée(s) à la collection meals.`);
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

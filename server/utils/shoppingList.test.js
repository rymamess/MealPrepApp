import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeShoppingList } from './shoppingList.js';

function entry({ servings, recipeServings, ingredients = [], spices = [] }) {
  return {
    servings,
    itemId: { servings: recipeServings, ingredients, spices },
  };
}

test('sums compatible units (g + g) into a single line', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 200, unit: 'g' }] }),
    entry({ ingredients: [{ name: 'farine', quantity: 300, unit: 'g' }] }),
  ]);
  assert.equal(result.ingredients.length, 1);
  assert.equal(result.ingredients[0].quantity, 500);
  assert.equal(result.ingredients[0].unit, 'g');
});

test('converts mass total to kg once it reaches 1000g', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 700, unit: 'g' }] }),
    entry({ ingredients: [{ name: 'Farine', quantity: 0.5, unit: 'kg' }] }),
  ]);
  assert.equal(result.ingredients.length, 1);
  assert.equal(result.ingredients[0].quantity, 1.2);
  assert.equal(result.ingredients[0].unit, 'kg');
});

test('keeps incompatible units for the same ingredient as separate lines', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 200, unit: 'g' }] }),
    entry({ ingredients: [{ name: 'Farine', quantity: 2, unit: 'unité' }] }),
  ]);
  assert.equal(result.ingredients.length, 2);
});

test('dedupes "au goût" entries into a single line without summing', () => {
  const result = computeShoppingList([
    entry({ spices: [{ name: 'Sel', quantity: 0, unit: 'au goût' }] }),
    entry({ spices: [{ name: 'sel', quantity: 0, unit: 'au goût' }] }),
  ]);
  assert.equal(result.spices.length, 1);
  assert.equal(result.spices[0].unit, 'au goût');
});

test('scales ingredient quantities by servings override', () => {
  const result = computeShoppingList([
    entry({
      servings: 6,
      recipeServings: 2,
      ingredients: [{ name: 'Riz', quantity: 100, unit: 'g' }],
    }),
  ]);
  assert.equal(result.ingredients[0].quantity, 300);
});

test('ignores entries with a dangling (null) recipe reference', () => {
  const result = computeShoppingList([
    { servings: undefined, itemId: null },
    entry({ ingredients: [{ name: 'Riz', quantity: 100, unit: 'g' }] }),
  ]);
  assert.equal(result.ingredients.length, 1);
  assert.equal(result.ingredients[0].quantity, 100);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeShoppingList } from './shoppingList.js';

function entry({ servings, recipeServings, ingredients = [], spices = [] }) {
  return {
    servings,
    itemId: { servings: recipeServings, ingredients, spices },
  };
}

function manual({ id = '1', name, category, quantity, unit }) {
  return { _id: { toString: () => id }, name, category, quantity, unit };
}

test('sums compatible units (g + g) into a single line', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 200, unit: 'g', category: 'Grains' }] }),
    entry({ ingredients: [{ name: 'farine', quantity: 300, unit: 'g', category: 'Grains' }] }),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 500);
  assert.equal(result[0].unit, 'g');
  assert.equal(result[0].category, 'Grains');
  assert.equal(result[0].source, 'recipe');
});

test('converts mass total to kg once it reaches 1000g', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 700, unit: 'g', category: 'Grains' }] }),
    entry({ ingredients: [{ name: 'Farine', quantity: 0.5, unit: 'kg', category: 'Grains' }] }),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 1.2);
  assert.equal(result[0].unit, 'kg');
});

test('keeps incompatible units for the same ingredient as separate lines', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Farine', quantity: 200, unit: 'g', category: 'Grains' }] }),
    entry({ ingredients: [{ name: 'Farine', quantity: 2, unit: 'unité', category: 'Grains' }] }),
  ]);
  assert.equal(result.length, 2);
});

test('dedupes "au goût" entries into a single line without summing', () => {
  const result = computeShoppingList([
    entry({ spices: [{ name: 'Sel', quantity: 0, unit: 'au goût', category: 'Spices' }] }),
    entry({ spices: [{ name: 'sel', quantity: 0, unit: 'au goût', category: 'Spices' }] }),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].unit, 'au goût');
  assert.equal(result[0].category, 'Spices');
});

test('scales ingredient quantities by servings override', () => {
  const result = computeShoppingList([
    entry({
      servings: 6,
      recipeServings: 2,
      ingredients: [{ name: 'Riz', quantity: 100, unit: 'g', category: 'Grains' }],
    }),
  ]);
  assert.equal(result[0].quantity, 300);
});

test('ignores entries with a dangling (null) recipe reference', () => {
  const result = computeShoppingList([
    { servings: undefined, itemId: null },
    entry({ ingredients: [{ name: 'Riz', quantity: 100, unit: 'g', category: 'Grains' }] }),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 100);
});

test('defaults to "Other" category when a recipe ingredient has none set', () => {
  const result = computeShoppingList([
    entry({ ingredients: [{ name: 'Mystère', quantity: 1, unit: 'unité' }] }),
  ]);
  assert.equal(result[0].category, 'Other');
});

test('a manual item with no matching recipe ingredient is its own "manual" line', () => {
  const result = computeShoppingList(
    [entry({ ingredients: [{ name: 'Riz', quantity: 100, unit: 'g', category: 'Grains' }] })],
    [manual({ id: 'm1', name: 'Papier essuie-tout', category: 'Other', quantity: 1, unit: 'unité' })]
  );
  assert.equal(result.length, 2);
  const manualItem = result.find((i) => i.source === 'manual');
  assert.equal(manualItem.id, 'm1');
  assert.equal(manualItem.name, 'papier essuie-tout');
  assert.equal(manualItem.quantity, 1);
});

test('merges a manual item into the recipe total when name+unit match, tagged "mixed"', () => {
  const result = computeShoppingList(
    [entry({ ingredients: [{ name: 'Tomate', quantity: 3, unit: 'unité', category: 'Vegetables' }] })],
    [manual({ id: 'm1', name: 'Tomate', category: 'Vegetables', quantity: 2, unit: 'unité' })]
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 5);
  assert.equal(result[0].source, 'mixed');
  assert.equal(result[0].id, 'm1');
});

test('keeps a manual item separate from a recipe ingredient of the same name but different unit', () => {
  const result = computeShoppingList(
    [entry({ ingredients: [{ name: 'Farine', quantity: 200, unit: 'g', category: 'Grains' }] })],
    [manual({ id: 'm1', name: 'Farine', category: 'Grains', quantity: 1, unit: 'unité' })]
  );
  assert.equal(result.length, 2);
});

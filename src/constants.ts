/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Unit = 'grams' | 'oz';
export type TempUnit = '°C' | '°F';

export interface AppSettings {
  defaultFeedingTime: string;
  unit: Unit;
  tempUnit: TempUnit;
  remindersEnabled: boolean;
}

export type Observation = 
  | 'No bubbles' 
  | 'Some bubbles' 
  | 'Lots of bubbles' 
  | 'Rose' 
  | 'Doubled' 
  | 'Liquid on top' 
  | 'Smells sour' 
  | 'Smells weird' 
  | 'Looks moldy';

export interface StarterDay {
  day: number;
  task: string[];
  lookFor: string;
  isNormal: string;
  type: 'mix' | 'observe' | 'feed' | 'discard_feed' | 'check';
}

export const STARTER_PLAN: StarterDay[] = [
  {
    day: 1,
    task: ['Mix 50g all-purpose or bread flour with 50g room-temperature water', 'Stir until no lumps are visible', 'Cover with a loose-fitting lid', 'Leave at room temperature (about 65-70 F)'],
    lookFor: 'A smooth, thick mixture with no visible lumps.',
    isNormal: 'No bubbling yet is completely normal on the first day.',
    type: 'mix'
  },
  {
    day: 2,
    task: ['Wait and watch for bubbles', 'Do not add flour or water today', 'If your room is about 80 F or warmer and you see lots of bubbles, move on to Day 3 instructions early'],
    lookFor: 'Early bubbles may appear, especially in a warm room.',
    isNormal: 'Seeing little or no activity today is still normal.',
    type: 'observe'
  },
  {
    day: 3,
    task: ['Add 50g flour', 'Add 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: 'Bubbles or an odd smell may start to show up.',
    isNormal: 'If it smells or looks funny, that can still be part of normal fermentation.',
    type: 'feed'
  },
  {
    day: 4,
    task: ['Add 50g flour', 'Add 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: 'More bubbles and some fermentation activity.',
    isNormal: 'The starter may still seem inconsistent from day to day.',
    type: 'feed'
  },
  {
    day: 5,
    task: ['Discard all but 50g of starter', 'Add 50g flour to the remaining 50g starter', 'Add 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: 'The starter may begin acting more predictably.',
    isNormal: 'Discarding helps keep the starter balanced and healthy.',
    type: 'discard_feed'
  },
  {
    day: 6,
    task: ['Discard all but 50g of starter', 'Feed with 50g flour', 'Feed with 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: 'Watch for stronger bubbling and a rise after feeding.',
    isNormal: 'Keep feeding daily even if it is not doubling yet.',
    type: 'discard_feed'
  },
  {
    day: 7,
    task: ['Discard all but 50g of starter', 'Feed with 50g flour', 'Feed with 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: 'More regular bubbling and a clearer rise-and-fall cycle.',
    isNormal: 'Some starters stay slow through the middle days.',
    type: 'discard_feed'
  }
];

// Extend for 14 days using the same day-by-day guidance from the starter sheet.
for (let d = 8; d <= 14; d++) {
  STARTER_PLAN.push({
    day: d,
    task: d <= 10
      ? ['Discard all but 50g of starter', 'Feed with 50g flour', 'Feed with 50g water', 'Mix well', 'Cover loosely and leave at room temperature']
      : ['If it has not doubled yet, discard all but 50g of starter', 'Add 50g flour', 'Add 50g water', 'Mix well', 'Cover loosely and leave at room temperature'],
    lookFor: d <= 9
      ? 'Steadier bubbling and more visible activity each day.'
      : d === 10
        ? 'Around Day 10, expect lots of bubbles. If it doubles after feeding, it is active and ready to use.'
        : 'If it doubles after feeding, it is active and ready to use. If not, keep feeding daily and watch for a strong rise.'
      ,
    isNormal: d <= 9
      ? 'Keep feeding daily and stay consistent.'
      : d === 10
        ? 'If it still is not doubling, keep feeding every day. A new starter may need 4-5 more days.'
        : 'Some new starters need a few extra days. Keep feeding daily until it reliably doubles in size.'
      ,
    type: d >= 10 ? 'check' : 'discard_feed'
  });
}

export type RecipeType = 'basic' | 'overnight' | 'same-day' | 'baking-arts' | 'cocoa-sourdough';

export interface BreadIngredient {
  amount: string;
  item: string;
  grams?: number;
  bakerPercent?: number;
  note?: string;
}

export interface BreadStep {
  name: string;
  durationMinutes: number;
  instruction: string;
  feelGuide: string;
  tip: string;
}

export interface BreadRecipe {
  title: string;
  ingredients: BreadIngredient[];
  yieldText: string;
  baseLoafWeight?: number;
  baseTotalFlourGrams?: number;
  hydrationText?: string;
  steps: BreadStep[];
}

const BAKING_ARTS_STEPS: BreadStep[] = [
  { name: 'Feed Starter', durationMinutes: 0, instruction: 'Feed your starter 8-18 hours before mixing the dough.', feelGuide: 'Starter should be active and bubbly.', tip: 'Use starter at peak activity for best rise.' },
  { name: 'Autolyse (Optional)', durationMinutes: 60, instruction: 'Combine 100g bread flour with 100g water from the recipe. Rest covered for 15-60 minutes.', feelGuide: 'Shaggy pre-dough.', tip: 'You can skip this step, but it helps gluten development.' },
  { name: 'Mix Dough', durationMinutes: 15, instruction: 'Add the remaining ingredients to the autolyse bowl if using. Mix well until no lumps remain, then cover and rest 5-15 minutes.', feelGuide: 'Fully hydrated with no dry spots.', tip: 'Scrape the bowl well so all flour is incorporated.' },
  { name: 'Bulk Proof / Stretch and Fold', durationMinutes: 120, instruction: 'Complete the first stretch and fold, turn dough so no seams are visible, and cover. Rest 30 minutes. Repeat until you have done 4 total stretch-and-fold rounds with 30-minute rests.', feelGuide: 'Dough gets smoother and stronger after each round.', tip: 'Wet hands lightly to keep the dough from sticking.' },
  { name: 'Shape', durationMinutes: 30, instruction: 'Generously sprinkle the counter with flour. Gently lift the dough in the air and allow gravity to elongate it. Place the smooth side on the counter. Stitch the dough together by pulling opposite sides toward the center and pinching them closed like a zipper. Start at one end and roll up the dough, gently tugging on each roll to build tension. Cup the dough ball on the counter and pull it toward yourself to create maximum surface tension. Gently lift it and place it into a generously dusted banneton with the smooth top side facing down. Cover with plastic wrap and leave it at room temperature to finish bulk proofing. The full bulk proof, from the initial stretch-and-fold through cold proof, is complete when the loaf is jiggly and visible air bubbles appear, usually around 4-6 hours.', feelGuide: 'Puffy, airy dough with visible bubbles.', tip: 'Aim for a taut surface without tearing the dough.' },
  { name: 'Cold Proof', durationMinutes: 720, instruction: 'Once the dough is puffy with visible bubbles, move the covered banneton to the refrigerator for 12-72 hours.', feelGuide: 'Cold, firm dough after proofing.', tip: 'A longer cold proof makes a more sour loaf.' },
  { name: 'Preheat & Turn Out', durationMinutes: 60, instruction: 'Preheat a Dutch oven with lid at 500°F for at least 1 hour. Turn the cold dough out onto a dough sling or parchment once the oven is ready.', feelGuide: 'Cold dough should hold its shape well.', tip: 'Keep the dough cold for easier scoring and transfer.' },
  { name: 'Bake & Score', durationMinutes: 50, instruction: 'If using a sling, carefully take out the Dutch oven and lift off the lid. Gently lift the dough by the sling and place it into the Dutch oven. Replace the lid and put it back in the oven. Bake at 500°F with the lid on for 5 minutes. Remove the dough and place it on a cooling rack to score with a lame. Cut one 1/4-inch deep line across the top of the dough at a 30-degree angle. Return the dough to the Dutch oven, replace the lid, and continue baking at 500°F for 15 more minutes. If using parchment paper instead, turn the cold dough out onto parchment, score it first with one 1/4-inch deep line at a 30-degree angle, then use the parchment to lower it into the Dutch oven. Replace the lid and bake at 500°F for 20 minutes. For either method, after the covered bake, carefully remove the lid, reduce the heat to 425°F, and continue baking for another 20-30 minutes until the loaf is a deep golden brown.', feelGuide: 'Deep golden crust.', tip: 'Use a lame or very sharp blade for a clean score.' },
  { name: 'Cool', durationMinutes: 60, instruction: 'Allow the loaf to cool for at least 1 hour before slicing.', feelGuide: 'The loaf should feel set and smell rich.', tip: 'Waiting helps the crumb finish setting inside.' },
];

export const BREAD_RECIPES: Record<RecipeType, BreadRecipe> = {
  'basic': {
    title: 'Basic Protocol',
    yieldText: '1 LOAF',
    ingredients: [
      { amount: '500g', item: 'bread flour' },
      { amount: '350g', item: 'water' },
      { amount: '100g', item: 'active starter' },
      { amount: '10g', item: 'salt' },
    ],
    steps: [
    { name: 'Mix Dough', durationMinutes: 30, instruction: 'Mix flour and water. Let rest.', feelGuide: 'Shaggy and sticky.', tip: 'Use lukewarm water (80-85°F).' },
    { name: 'Add Salt/Starter', durationMinutes: 15, instruction: 'Incorporate starter and salt.', feelGuide: 'Slimey but cohesive.', tip: 'Use a "pincer" motion with your fingers.' },
    { name: 'Stretch & Fold 1', durationMinutes: 30, instruction: 'Pull and fold 4 times.', feelGuide: 'Resistant to stretching.', tip: 'Wet your hands to prevent sticking.' },
    { name: 'Stretch & Fold 2', durationMinutes: 30, instruction: 'Pull and fold 4 times.', feelGuide: 'Starting to feel smoother.', tip: 'Be gentle to keep air inside.' },
    { name: 'Stretch & Fold 3', durationMinutes: 30, instruction: 'Pull and fold 4 times.', feelGuide: 'Stronger and more elastic.', tip: 'Dough should hold its shape better.' },
    { name: 'Bulk Fermentation', durationMinutes: 240, instruction: 'Let rise in a warm spot.', feelGuide: 'Jiggly and increased in volume.', tip: 'Look for 30-50% growth.' },
    { name: 'Pre-shape', durationMinutes: 20, instruction: 'Form into a loose ball.', feelGuide: 'Taught surface.', tip: 'Don\'t use too much flour yet.' },
    { name: 'Final Shape', durationMinutes: 10, instruction: 'Tighten and place in basket.', feelGuide: 'Maximum surface tension.', tip: 'Flour your banneton well.' },
    { name: 'Cold Proof', durationMinutes: 720, instruction: 'Place in fridge.', feelGuide: 'Stiff and cold.', tip: 'Better flavor develops overnight.' },
    { name: 'Bake', durationMinutes: 45, instruction: 'Preheat oven to 500°F. Score and bake.', feelGuide: 'Finished bread should sound hollow.', tip: 'Use a Dutch oven for best steam.' }
    ],
  },
  'same-day': {
    title: 'Same-Day Protocol',
    yieldText: '1 LOAF',
    ingredients: [
      { amount: '500g', item: 'bread flour' },
      { amount: '375g', item: 'water' },
      { amount: '100g', item: 'active starter' },
      { amount: '10g', item: 'salt' },
    ],
    steps: [
    { name: 'Mix & Autolyse', durationMinutes: 60, instruction: 'Mix all ingredients except salt.', feelGuide: 'Rough dough.', tip: 'Skip the separate starter mix to save time.' },
    { name: 'Add Salt', durationMinutes: 15, instruction: 'Mix in salt thoroughly.', feelGuide: 'Smooth after mixing.', tip: 'Ensure salt is fully dissolved.' },
    { name: 'Bulk Fermentation', durationMinutes: 300, instruction: 'Rise in a warm place (78°F+).', feelGuide: 'Gassy and light.', tip: 'Warmth is your friend for same-day bread.' },
    { name: 'Shape', durationMinutes: 15, instruction: 'Final shape immediately.', feelGuide: 'Taught surface.', tip: 'Be decisive with your shaping.' },
    { name: 'Final Proof', durationMinutes: 120, instruction: 'Rise at room temperature.', feelGuide: 'Soft and pillowy.', tip: 'Poke test: dough should spring back slowly.' },
    { name: 'Bake', durationMinutes: 45, instruction: 'Score and bake.', feelGuide: 'Dark golden crust.', tip: 'Vent the steam for the last 10 mins.' }
    ],
  },
  'overnight': {
    title: 'Overnight Protocol',
    yieldText: '1 LOAF',
    ingredients: [
      { amount: '500g', item: 'bread flour' },
      { amount: '350g', item: 'water' },
      { amount: '100g', item: 'active starter' },
      { amount: '10g', item: 'salt' },
    ],
    steps: [
    { name: 'Mix Dough', durationMinutes: 30, instruction: 'Incorporate all ingredients.', feelGuide: 'Hydrated but loose.', tip: 'Start this late in the evening.' },
    { name: 'Bulk Fermentation (Overnight)', durationMinutes: 600, instruction: 'Room temp rise (lower temp is better).', feelGuide: 'Bubbling and very light.', tip: 'Protect from drafts.' },
    { name: 'Shape', durationMinutes: 20, instruction: 'Shape onto counter.', feelGuide: 'Fragile, be gentle.', tip: 'Careful not to degas the dough.' },
    { name: 'Short Proof', durationMinutes: 60, instruction: 'Final room temp rest.', feelGuide: 'Relaxed and airy.', tip: 'Preheat oven while proofing.' },
    { name: 'Bake', durationMinutes: 45, instruction: 'Score and bake.', feelGuide: 'Light and airy crumb.', tip: 'Steam is crucial for expansion.' }
    ],
  },
  'baking-arts': {
    title: 'Baking Arts & Coffee Sourdough Bread',
    yieldText: '450 G LOAF',
    baseLoafWeight: 450,
    baseTotalFlourGrams: 261,
    ingredients: [
      { amount: '52g', item: 'active starter', grams: 52, bakerPercent: 20, note: 'fed within 8-18 hours prior' },
      { amount: '157g', item: 'water', grams: 157, bakerPercent: 60, note: 'plus 26g water from starter' },
      { amount: '209g', item: 'flour 1 (bread flour)', grams: 209, bakerPercent: 80 },
      { amount: '26g', item: 'flour 2 (alternate flour)', grams: 26, bakerPercent: 10 },
      { amount: '5g', item: 'salt', grams: 5, bakerPercent: 2 },
      { amount: '1/4 tsp', item: 'diastatic malt powder', grams: 0.4, bakerPercent: 0.15 },
    ],
    steps: BAKING_ARTS_STEPS,
  },
  'cocoa-sourdough': {
    title: 'Cocoa Sourdough Loaf',
    yieldText: '900 G LOAF',
    baseLoafWeight: 900,
    baseTotalFlourGrams: 523,
    ingredients: [
      { amount: '105g', item: 'active starter', grams: 105, bakerPercent: 20 },
      { amount: '314g', item: 'water', grams: 314, bakerPercent: 60 },
      { amount: '418g', item: 'flour 1 (bread flour)', grams: 418, bakerPercent: 80 },
      { amount: '52g', item: 'flour 2 (alternate flour)', grams: 52, bakerPercent: 10 },
      { amount: '10g', item: 'salt', grams: 10, bakerPercent: 2 },
      { amount: '0.8g', item: 'diastatic malt powder', grams: 0.8, bakerPercent: 0.15 },
    ],
    steps: BAKING_ARTS_STEPS,
  },
};

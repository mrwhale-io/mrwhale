interface Item {
  probability: number;
}

/**
 * Select a random item from a weighted collection.
 * @param items The items to select from.
 */
export function weightedSample<T extends Item>(items: T[]): T {
  // Calculate the total weight of all items adjusted by the multiplier
  const total = items.reduce((sum, item) => sum + item.probability, 0);

  // Generate a random number within the total weight
  const rnd = Math.random() * total;
  let accumulator = 0;

  // Iterate over the items and determine which one is chosen
  for (const item of items) {
    accumulator += item.probability;

    if (rnd < accumulator) {
      return item;
    }
  }

  // In case of an edge case, return the last item
  return items[items.length - 1];
}

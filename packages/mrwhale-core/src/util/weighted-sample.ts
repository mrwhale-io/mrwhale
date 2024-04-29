interface Item {
  probability: number;
}

/**
 * Get weighted random result from a list of items.
 */
export function weightedSample<T extends Item>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.probability, 0);

  const rnd = Math.random() * total;
  let accumulator = 0;

  for (const item of items) {
    accumulator += item.probability;

    if (rnd < accumulator) {
      return item;
    }
  }
}

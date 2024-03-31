interface Item {
  weight: number;
}

/**
 * Get weighted random result from a list of items.
 */
export function weightedSample<T extends Item>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);

  const rnd = Math.random() * total;
  let accumulator = 0;

  for (const item of items) {
    accumulator += item.weight;

    if (rnd < accumulator) {
      return item;
    }
  }
}

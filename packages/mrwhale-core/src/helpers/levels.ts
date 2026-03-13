/** The base experience points */
const LEVEL_BASE = 100;

/** The multiplier applied to the level squared in the experience calculation */
const LEVEL_MULTIPLIER = 5;

/** The additional experience points added per level */
const INCREASE_PER_LEVEL = 50;

/**
 * Calculates the total experience points required to reach a specific level.
 * Uses a quadratic formula with configurable multiplier, increase per level, and base values.
 *
 * @param level - The target level to calculate experience for
 * @returns The total experience points required to reach the specified level
 *
 * @example
 * ```typescript
 * const expRequired = levelToExp(10);
 * console.log(expRequired); // Returns experience needed for level 10
 * ```
 */
export function levelToExp(level: number): number {
  return (
    LEVEL_MULTIPLIER * Math.pow(level, 2) +
    INCREASE_PER_LEVEL * level +
    LEVEL_BASE
  );
}

/**
 * Calculates the level based on the given experience points.
 *
 * This function determines what level a user has achieved based on their total
 * accumulated experience points. It iteratively subtracts the experience cost
 * for each level until the remaining experience is insufficient for the next level.
 *
 * @param exp - The total experience points to convert to a level
 * @returns The calculated level based on the experience points
 *
 * @example
 * ```typescript
 * const level = getLevelFromExp(1500);
 * console.log(level); // Returns the level for 1500 experience points
 * ```
 */
export function getLevelFromExp(exp: number): number {
  let level = 0;
  let remainingExp = exp;

  while (remainingExp >= levelToExp(level)) {
    remainingExp -= levelToExp(level);
    level++;
  }

  return level;
}

/**
 * Calculates the remaining experience points needed to reach the next level.
 *
 * @param exp - The current total experience points
 * @returns The amount of experience points remaining until the next level
 */
export function getRemainingExp(exp: number): number {
  const level = getLevelFromExp(exp);

  let xp = 0;
  for (let i = 0; i < level; i++) {
    xp += levelToExp(i);
  }
  return exp - xp;
}

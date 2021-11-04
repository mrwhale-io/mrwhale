const LEVEL_BASE = 100;
const LEVEL_MULTIPLIER = 5;
const INCREASE_PER_LEVEL = 50;

/**
 * Convert level to experience.
 * 
 * @param level The level to calculate from.
 */
export function levelToExp(level: number): number {
  return (
    LEVEL_MULTIPLIER * Math.pow(level, 2) +
    INCREASE_PER_LEVEL * level +
    LEVEL_BASE
  );
}

/**
 * Calculate level from experience.
 * 
 * @param exp The experience to calculate level from.
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
 * Calculate remaining exp before level up.
 * 
 * @param exp The experience to calculate level from.
 */
export function getRemainingExp(exp: number): number {
  const level = getLevelFromExp(exp);

  let xp = 0;
  for (let i = 0; i < level; i++) {
    xp += levelToExp(i);
  }
  return exp - xp;
}

/**
 * Weekly jam themes for Mr. Whale's Game Jam.
 */
export const JAM_THEMES: string[] = [
  "One Button",
  "Don't Blink",
  "Hidden",
  "Tiny Disaster",
  "Too Fast",
  "Exploding Sandwich",
  "Tentacles",
  "Reverse Controls",
  "Panic",
  "Wrong Button",
  "Upside Down",
  "Don't Stop",
  "Gravity Is Broken",
  "The Floor Is Lava",
  "Impossible",
  "Backwards",
  "Eyes Closed",
  "On Fire",
  "Shrinking",
  "Overloaded",
  "Underwater",
  "Glitch",
  "Last Stand",
  "Forbidden",
  "Chaos",
  "Tiny",
  "Haunted",
  "Lost",
  "Speed Run",
  "Don't Lose It",
  "Multiplied",
  "Invisible",
  "Fragile",
  "Darkness",
  "Time Loop",
  "Out of Control",
  "The Wrong Way",
  "Reflection",
  "Echo",
  "Void",
];

/**
 * Daily inspiration prompts for non-jam days.
 */
export const DAILY_PROMPTS: string[] = [
  "What if the main character was also the obstacle?",
  "A game where winning feels wrong.",
  "Your weapon is also your shield.",
  "The world shrinks every second.",
  "The enemy wants to be your friend.",
  "You can only move in one direction.",
  "The game ends when you get bored.",
  "Every mistake makes you stronger.",
  "You are playing as the boss.",
  "The final boss is the loading screen.",
  "The game plays itself, but better.",
  "Everything is made of sandwiches.",
  "You can only see what you've already seen.",
  "The map is wrong on purpose.",
  "Death is the win condition.",
  "The music is a hint.",
  "You cannot jump. You can only fall upwards.",
  "The score decreases when you do well.",
  "The game lies to you constantly.",
  "There are two players. You control both.",
  "The enemy is your reflection.",
  "The level is inside a fish.",
  "You have infinite lives but limited time.",
];

/**
 * Mr. Whale's intro messages for weekly jam announcements.
 * Used to give the bot personality.
 */
export const JAM_ANNOUNCEMENT_INTROS: string[] = [
  "After a lengthy debate with the squid council... I have decided to announce this week's jam!",
  "While exploring the deepest trench in the ocean... I found a mysterious message in a bottle that inspired this week's jam!",
  "After accidentally swallowing a submarine... I had a vision of this week's jam theme!",
  "Following a surprisingly heated argument with a jellyfish... I have decided on this week's jam theme!",
  "After consulting the ancient whale oracle... I have received guidance for this week's jam theme!",
  "I accidentally awakened an ancient sea creature, and it had ideas for this week's jam theme...",
  "After three days lost in a kelp forest... I emerged with a new jam theme!",
  "While napping on the ocean floor, I had a vision... This week's jam theme is clear!",
  "The plankton have voted, and they demand... This week's jam theme!",

  "After escaping a particularly aggressive dolphin... I have decided on this week's jam theme!",
  "I found a message in a bottle at the bottom of the ocean... It revealed this week's jam theme!",
  "The squid king insists this is a good idea... This week's jam theme is approved!",
  "After a spirited debate with a very opinionated crab... We have settled on this week's jam theme!",
  "While breaching for dramatic effect... I realized this week's jam theme!",
  "The tide has spoken, and its words were... This week's jam theme!",
];

/**
 * Mr. Whale's closing messages when a jam ends.
 */
export const JAM_CLOSE_INTROS: string[] = [
  "After reviewing all entries with the squid council...",
  "After extensive deliberation in the deep...",
  "The ancient whale tribunal has reached a verdict...",
  "After consulting the ocean floor archives...",
  "The tide has decided...",
];

/**
 * Roles that can be awarded to jam winners.
 */
export const JAM_WINNER_ROLES = {
  champion: "🐋 Champion of the Deep",
  explorer: "🦑 Abyss Explorer",
  survivor: "🦑 Squid Survivor",
  master: "🎮 Microgame Master",
} as const;

/**
 * Returns a random element from an array.
 */
export function getRandomJamElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns a theme that hasn't been used recently, falling back to random if all have been used.
 */
export function getNextTheme(usedThemes: string[] = []): string {
  const available = JAM_THEMES.filter((t) => !usedThemes.includes(t));
  const pool = available.length > 0 ? available : JAM_THEMES;
  return getRandomJamElement(pool);
}

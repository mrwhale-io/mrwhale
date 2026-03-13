import * as seedrandom from "seedrandom";
import {
  CommandOptions,
  environments,
  genres,
  goals,
  items,
  rules,
  themes,
  artStyles,
  mechanics,
  moods,
  genreCompatibility,
} from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "gameidea",
  description: "Generate a random game idea with intelligent combinations.",
  type: "fun",
  usage: "<prefix>gameidea [simple|detailed]",
  cooldown: 3000,
};

const RNG = seedrandom();

interface GameIdea {
  environment: string;
  genre: string;
  item: string;
  goal: string;
  rule: string;
  theme?: string;
  artStyle?: string;
  mechanic?: string;
  mood?: string;
}

interface GenerationMode {
  simple: boolean;
  includeExtendedData: boolean;
}

export function action(args?: string[]): string {
  const mode: GenerationMode = {
    simple: !args || args.length === 0 || args[0] === "simple",
    includeExtendedData: args && args[0] === "detailed",
  };

  const idea = generateIntelligentIdea(mode);
  return formatGameIdea(idea, mode);
}


function getRandomElement<T>(array: T[], rng = RNG): T {
  return array[Math.floor(rng() * array.length)];
}

function getWeightedElement<T>(
  array: T[],
  preferred: T[] = [],
  avoided: T[] = [],
  rng = RNG,
): T {
  // Create weighted array favoring preferred elements
  const weightedArray = [];

  for (const item of array) {
    if (avoided.includes(item)) {
      continue; // Skip avoided elements
    } else if (preferred.includes(item)) {
      // Add preferred elements 3 times for higher probability
      weightedArray.push(item, item, item);
    } else {
      weightedArray.push(item);
    }
  }

  return getRandomElement(
    weightedArray.length > 0 ? weightedArray : array,
    rng,
  );
}

function generateIntelligentIdea(mode: GenerationMode): GameIdea {
  // Start with genre as the foundation
  const genre = getRandomElement(genres);
  const compatibility =
    genreCompatibility[genre as keyof typeof genreCompatibility];

  // Generate elements with genre compatibility
  const goal = getWeightedElement(goals, compatibility?.preferredGoals, []);

  const item = getWeightedElement(items, compatibility?.preferredItems, []);

  const environment = getWeightedElement(
    environments,
    compatibility?.preferredEnvironments,
    [],
  );

  const rule = getRandomElement(rules);

  const idea: GameIdea = {
    genre,
    goal,
    item,
    environment,
    rule,
  };

  // Add extended data for detailed mode
  if (mode.includeExtendedData) {
    idea.theme = getWeightedElement(themes, compatibility?.preferredThemes, []);

    idea.mechanic = getWeightedElement(
      mechanics,
      compatibility?.preferredMechanics,
      compatibility?.avoidedMechanics,
    );

    idea.artStyle = getRandomElement(artStyles);
    idea.mood = getRandomElement(moods);
  }

  return idea;
}

function formatGameIdea(idea: GameIdea, mode: GenerationMode): string {
  const genreEmoji = getGenreEmoji(idea.genre);
  const moodText = idea.mood ? ` ${idea.mood}` : "";

  if (mode.simple) {
    return `🎮 **${idea.genre.toUpperCase()} GAME IDEA**

${genreEmoji} A${moodText} ${idea.genre} game where you **${
      idea.goal
    }** the **${idea.item}** in **${idea.environment}**, but **${idea.rule}**.`;
  }

  // Detailed formatting
  let formatted = `🎮 **${idea.genre.toUpperCase()} GAME CONCEPT**

📍 **Setting**: ${idea.environment}
🎯 **Objective**: ${idea.goal} the ${idea.item}
🎭 **Theme**: ${idea.theme || "Classic"}
⚡ **Core Mechanic**: ${idea.mechanic || "Traditional gameplay"}
🎨 **Art Style**: ${idea.artStyle || "Developer's choice"}
🌟 **Mood**: ${idea.mood || "Balanced"}

🔧 **Special Rule**: ${idea.rule}

📝 **Elevator Pitch**: 
"A ${idea.mood || ""} ${idea.genre} game where you ${idea.goal} ${
    idea.item
  } in ${idea.environment}`;

  if (idea.mechanic) {
    formatted += ` using ${idea.mechanic}`;
  }

  formatted += `, but ${idea.rule}."`;

  return formatted;
}

function getGenreEmoji(genre: string): string {
  const emojiMap: { [key: string]: string } = {
    RPG: "⚔️",
    platform: "🏃",
    shooter: "🔫",
    fighting: "👊",
    racing: "🏎️",
    puzzle: "🧩",
    strategy: "🧠",
    horror: "👻",
    simulation: "🏗️",
    rhythm: "🎵",
    stealth: "🥷",
    "tower defense": "🛡️",
    roguelike: "🎲",
    "card game": "🃏",
  };

  return emojiMap[genre] || "🎮";
}

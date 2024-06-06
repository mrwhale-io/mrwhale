import { Achievement } from "../types/achievement";
import { fishingRods } from "./fishing-rods";

export const achievements: Achievement[] = [
  {
    id: 1,
    name: "First Catch",
    description: "Catch your first fish.",
    icon: "🎣",
    criteria: { type: "catch_fish", quantity: 1 },
  },
  {
    id: 2,
    name: "Novice Angler",
    description: "Catch 10 fish.",
    icon: "🐟",
    criteria: { type: "catch_fish", quantity: 10 },
  },
  {
    id: 3,
    name: "Skilled Fisher",
    description: "Catch 50 fish.",
    icon: "🐠",
    criteria: { type: "catch_fish", quantity: 50 },
  },
  {
    id: 4,
    name: "Expert Angler",
    description: "Catch 100 fish.",
    icon: "🐡",
    criteria: { type: "catch_fish", quantity: 100 },
  },
  {
    id: 5,
    name: "Master Fisher",
    description: "Catch 500 fish.",
    icon: "🐬",
    criteria: { type: "catch_fish", quantity: 500 },
  },
  {
    id: 6,
    name: "Rod Collector",
    description: "Collect all types of fishing rods.",
    icon: "🎣",
    criteria: { type: "collect_rod", quantity: fishingRods.length },
  },
  {
    id: 7,
    name: "Rare Catch",
    description: "Catch a rare fish.",
    icon: "🦑",
    criteria: { type: "catch_rarity", rarity: "Rare" },
  },
  {
    id: 8,
    name: "Legendary Fisher",
    description:
      "Catch a legendary fish (e.g., Giant Squid or Colossal Squid).",
    icon: "🦈",
    criteria: { type: "catch_rarity", rarity: "Legendary" },
  },
  {
    id: 9,
    name: "High Roller",
    description: "Accumulate 10,000 gems.",
    icon: "💎",
    criteria: { type: "accumulate_gems", quantity: 10000 },
  },
  {
    id: 10,
    name: "Big Spender",
    description: "Spend 10,000 gems in the shop.",
    icon: "💰",
    criteria: { type: "spend_gems", quantity: 10000 },
  },
  {
    id: 11,
    name: "Lucky Catch",
    description: "Catch a fish on your first attempt.",
    icon: "🍀",
    criteria: { type: "first_attempt" },
  },
];

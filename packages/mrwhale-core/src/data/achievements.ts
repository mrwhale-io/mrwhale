import { Achievement } from "../types/achievement";
import { fishingRods } from "./fishing-rods";

export const achievements: Achievement[] = [
  {
    id: 1,
    name: "First Catch",
    description: "Catch your first fish.",
    icon: "🎣",
    criteria: { type: "catch_fish", quantity: 1 },
    exp: 15,
  },
  {
    id: 2,
    name: "Novice Angler",
    description: "Catch 10 fish.",
    icon: "🐟",
    criteria: { type: "catch_fish", quantity: 10 },
    exp: 15,
  },
  {
    id: 3,
    name: "Skilled Fisher",
    description: "Catch 50 fish.",
    icon: "🐠",
    criteria: { type: "catch_fish", quantity: 50 },
    exp: 25,
  },
  {
    id: 4,
    name: "Expert Angler",
    description: "Catch 100 fish.",
    icon: "🐡",
    criteria: { type: "catch_fish", quantity: 100 },
    exp: 50,
  },
  {
    id: 5,
    name: "Master Fisher",
    description: "Catch 500 fish.",
    icon: "🐬",
    criteria: { type: "catch_fish", quantity: 500 },
    exp: 100,
  },
  {
    id: 6,
    name: "Rod Collector",
    description: "Collect all types of fishing rods.",
    icon: "🎣",
    criteria: { type: "collect_rod", quantity: fishingRods.length },
    exp: 75,
  },
  {
    id: 7,
    name: "Rare Catch",
    description: "Catch a rare fish.",
    icon: "🦑",
    criteria: { type: "catch_rarity", rarity: "Rare" },
    exp: 15,
  },
  {
    id: 8,
    name: "Legendary Fisher",
    description:
      "Catch a legendary fish (e.g., Giant Squid or Colossal Squid).",
    icon: "🦈",
    criteria: { type: "catch_rarity", rarity: "Legendary" },
    exp: 25,
  },
  {
    id: 9,
    name: "High Roller",
    description: "Accumulate 10,000 gems.",
    icon: "💎",
    criteria: { type: "accumulate_gems", quantity: 10000 },
    exp: 50,
  },
  {
    id: 10,
    name: "Big Spender",
    description: "Spend 10,000 gems in the shop.",
    icon: "💰",
    criteria: { type: "spend_gems", quantity: 10000 },
    exp: 50,
  },
  {
    id: 11,
    name: "Lucky Catch",
    description: "Catch a fish on your first attempt.",
    icon: "🍀",
    criteria: { type: "first_attempt" },
    exp: 15,
  },
];

import { FishingRod } from "../types/fishing-rod";

export const fishingRods: FishingRod[] = [
  {
    id: 1,
    name: "Basic Fishing Rod",
    description: "This is the standard fishing rod available to all players.",
    icon: "🎣",
    probabilityMultiplier: 1,
    cost: 0,
    maxCatchableRarity: 2,
    casts: 5,
    delay: 10000,
    minLevel: 0,
  },
  {
    id: 2,
    name: "Bamboo Fishing Rod",
    description:
      "A lightweight and flexible fishing rod ideal for casual fishing.",
    icon: "🎋",
    probabilityMultiplier: 1.5,
    cost: 2000,
    maxCatchableRarity: 3,
    casts: 8,
    delay: 8000,
    minLevel: 0,
  },
  {
    id: 3,
    name: "Fiberglass Fishing Rod",
    description:
      "A durable and versatile fishing rod suitable for a wide range of fishing conditions.",
    icon: "🔧",
    probabilityMultiplier: 2,
    cost: 3000,
    maxCatchableRarity: 3,
    casts: 10,
    delay: 6000,
    minLevel: 10,
  },
  {
    id: 4,
    name: "Telescopic Fishing Rod",
    description:
      "A compact and portable rod that can be easily extended for use and collapsed for storage.",
    icon: "🔭",
    probabilityMultiplier: 2.5,
    cost: 4000,
    maxCatchableRarity: 4,
    casts: 12,
    delay: 4000,
    minLevel: 20,
  },
  {
    id: 5,
    name: "Surf Fishing Rod",
    description:
      "Sturdy fishing rod designed for casting bait or lures into the surf from shore.",
    icon: "🌊",
    probabilityMultiplier: 3,
    cost: 5000,
    maxCatchableRarity: 5,
    casts: 14,
    delay: 2000,
    minLevel: 30,
  },
  {
    id: 6,
    name: "Deep Sea Fishing Rod",
    description:
      "Heavy-duty fishing rod designed for deep-sea fishing excursions.",
    icon: "🦑",
    probabilityMultiplier: 3.5,
    cost: 6000,
    maxCatchableRarity: 5,
    casts: 16,
    delay: 1000,
    minLevel: 40,
  },
];

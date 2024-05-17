import { FishingRod } from "../types/fishing-rod";

export const fishingRods: FishingRod[] = [
  {
    id: 1,
    name: "Basic Fishing Rod",
    description: "This is the standard fishing rod available to all players.",
    probabilityMultiplier: 1,
    cost: 0,
  },
  {
    id: 2,
    name: "Bamboo Fishing Rod",
    description:
      "A lightweight and flexible fishing rod ideal for casual fishing.",
    probabilityMultiplier: 1.5,
    cost: 2000,
  },
  {
    id: 3,
    name: "Fiberglass Fishing Rod",
    description:
      "A durable and versatile fishing rod suitable for a wide range of fishing conditions.",
    probabilityMultiplier: 2,
    cost: 3000,
  },
  {
    id: 4,
    name: "Telescopic Fishing Rod",
    description:
      "A compact and portable rod that can be easily extended for use and collapsed for storage.",
    probabilityMultiplier: 2.5,
    cost: 4000,
  },
  {
    id: 5,
    name: "Surf Fishing Rod",
    description:
      "Sturdy fishing rod designed for casting bait or lures into the surf from shore.",
    probabilityMultiplier: 3,
    cost: 5000,
  },
  {
    id: 6,
    name: "Deep Sea Fishing Rod",
    description:
      "Heavy-duty fishing rod designed for deep-sea fishing excursions.",
    probabilityMultiplier: 3.5,
    cost: 6000,
  },
];

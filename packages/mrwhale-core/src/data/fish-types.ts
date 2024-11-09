import { Fish } from "../types/fish";

export const baseFishTypes: Fish[] = [
  {
    id: 1,
    name: "Krill",
    description:
      "A tiny, shrimp-like creature that's the staple diet of many sea giants such as myself. Not much to look at, but they add up!",
    icon: "🦐",
    worth: 15,
    expWorth: 10,
    hpWorth: 1,
    probability: 75,
    rarity: "Common",
    rarityLevel: 1,
  },
  {
    id: 2,
    name: "Shrimp",
    description:
      "Small, tasty, and packed with protein. Shrimp are a favorite catch for any seafood enthusiast.",
    icon: "🦐",
    worth: 20,
    expWorth: 15,
    hpWorth: 1.5,
    probability: 70,
    rarity: "Common",
    rarityLevel: 1,
  },
  {
    id: 3,
    name: "Crab",
    description:
      "These crusty critters are known for their sideways scuttle and their delicious meat. Just watch out for those pincers!",
    icon: "🦀",
    worth: 30,
    expWorth: 25,
    hpWorth: 2.5,
    probability: 60,
    rarity: "Uncommon",
    rarityLevel: 1,
  },
  {
    id: 4,
    name: "Lobster",
    description:
      "The king of crustaceans! Lobsters are prized for their succulent meat and are often considered a luxurious catch.",
    icon: "🦞",
    worth: 35,
    expWorth: 30,
    hpWorth: 3,
    probability: 55,
    rarity: "Uncommon",
    rarityLevel: 2,
  },
  {
    id: 5,
    name: "Cod",
    description:
      " A versatile and popular fish, cod is known for its mild flavor and flaky texture. Lovely with chips.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 6,
    name: "Cuttlefish",
    description:
      "These clever cephalopods can change color in the blink of an eye. They're a fascinating and unique catch.",
    icon: "🐟",
    worth: 45,
    expWorth: 40,
    hpWorth: 4,
    probability: 45,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 7,
    name: "Rockfish",
    description:
      "Known for their rugged appearance and delicious taste, rockfish are a hardy species found in rocky crevices.",
    icon: "🐟",
    worth: 50,
    expWorth: 45,
    hpWorth: 4.5,
    probability: 40,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 8,
    name: "Octopus",
    description:
      "With eight arms and a big brain, octopuses are as smart as they are slippery. A true challenge for any angler!",
    icon: "🐙",
    worth: 60,
    expWorth: 55,
    hpWorth: 5.5,
    probability: 30,
    rarity: "Epic",
    rarityLevel: 4,
  },
  {
    id: 9,
    name: "Shark",
    description:
      "The apex predator of the ocean, sharks are both feared and revered. Catching one is a true test of skill.",
    icon: "🦈",
    worth: 70,
    expWorth: 65,
    hpWorth: 6.5,
    probability: 20,
    rarity: "Epic",
    rarityLevel: 4,
  },
  {
    id: 10,
    name: "Giant Squid",
    description:
      " Elusive and mysterious, the giant squid is a deep-sea legend. Only the most skilled fishermen have ever caught a glimpse, let alone reeled one in.",
    icon: "🦑",
    worth: 85,
    expWorth: 80,
    hpWorth: 8,
    probability: 5,
    rarity: "Legendary",
    rarityLevel: 5,
  },
  {
    id: 11,
    name: "Colossal Squid",
    description:
      "The stuff of nightmares and sailor tales, the colossal squid is a rare and formidable catch. Its sheer size and power make it a trophy for any angler.",
    icon: "🦑",
    worth: 100,
    expWorth: 90,
    hpWorth: 9,
    probability: 1,
    rarity: "Legendary",
    rarityLevel: 5,
  },
];

export const springFishTypes: Fish[] = [
  {
    id: 12,
    name: "Spring Trout",
    description:
      "A graceful and agile fish that darts through the streams and rivers of spring. Its shimmering scales and swift movements make it a challenging catch.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 13,
    name: "Spring Salmon",
    description:
      "A vibrant and energetic fish that swims upstream in the spring. Known for its bright colors and leaping acrobatics.",
    icon: "🐟",
    worth: 45,
    expWorth: 40,
    hpWorth: 4,
    probability: 45,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 14,
    name: "Spring Bass",
    description:
      "A lively and energetic fish that thrives in the cool waters of spring. Known for its acrobatic leaps and fierce fighting spirit.",
    icon: "🐟",
    worth: 55,
    expWorth: 50,
    hpWorth: 5,
    probability: 35,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 15,
    name: "Spring Catfish",
    description:
      "A whiskered and wily fish that lurks in the murky waters of spring. Its sharp senses and cunning nature make it a challenging catch.",
    icon: "🐟",
    worth: 60,
    expWorth: 55,
    hpWorth: 5.5,
    probability: 30,
    rarity: "Epic",
    rarityLevel: 4,
  },
];

export const summerFishTypes: Fish[] = [
  {
    id: 16,
    name: "Summer Salmon",
    description:
      "A vibrant and energetic fish that swims upstream in the summer. Known for its bright colors and leaping acrobatics.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 17,
    name: "Summer Bass",
    description:
      "A lively and energetic fish that thrives in the warm waters of summer. Known for its acrobatic leaps and fierce fighting spirit.",
    icon: "🐟",
    worth: 45,
    expWorth: 40,
    hpWorth: 4,
    probability: 45,
    rarity: "Rare",
    rarityLevel: 3,
  },

  {
    id: 18,
    name: "Summer Pike",
    description:
      "A sleek and predatory fish that hunts in the shallows during the summer months. Watch out for those sharp teeth!",
    icon: "🐟",
    worth: 65,
    expWorth: 60,
    hpWorth: 6,
    probability: 25,
    rarity: "Epic",
    rarityLevel: 4,
  },
  {
    id: 19,
    name: "Sunfish",
    description:
      "A colorful and sun-loving fish that basks in the warm summer rays. Its vibrant scales and playful nature make it a joy to catch.",
    icon: "🐟",
    worth: 70,
    expWorth: 65,
    hpWorth: 6.5,
    probability: 20,
    rarity: "Epic",
    rarityLevel: 4,
  },
];

export const fallFishTypes: Fish[] = [
  {
    id: 20,
    name: "Fall Bass",
    description:
      "A lively and energetic fish that thrives in the cool waters of fall. Known for its acrobatic leaps and fierce fighting spirit.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 21,
    name: "Autumn Carp",
    description:
      "A robust and hardy fish that thrives in the cool waters of autumn. Known for its strength and endurance.",
    icon: "🐟",
    worth: 45,
    expWorth: 40,
    hpWorth: 4,
    probability: 45,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 22,
    name: "Fall Trout",
    description:
      "A graceful and agile fish that darts through the streams and rivers of autumn. Its shimmering scales and swift movements make it a challenging catch.",
    icon: "🐟",
    worth: 65,
    expWorth: 60,
    hpWorth: 6,
    probability: 25,
    rarity: "Epic",
    rarityLevel: 4,
  },
  {
    id: 23,
    name: "Pumpkinseed",
    description:
      "A festive and colorful fish that appears in the lakes and ponds of fall. Its orange and green markings are a sight to behold.",
    icon: "🐟",
    worth: 70,
    expWorth: 65,
    hpWorth: 6.5,
    probability: 20,
    rarity: "Epic",
    rarityLevel: 4,
  },
];

export const winterFishTypes: Fish[] = [
  {
    id: 24,
    name: "Winter Trout",
    description:
      "A graceful and agile fish that darts through the streams and rivers of winter. Its shimmering scales and swift movements make it a challenging catch.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 25,
    name: "Winter Pike",
    description:
      "A cold-water predator that lurks beneath the ice of winter. Its icy scales and sharp teeth make it a formidable catch.",
    icon: "🐟",
    worth: 45,
    expWorth: 40,
    hpWorth: 4,
    probability: 45,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 26,
    name: "Winter Flounder",
    description:
      "A flat and camouflaged fish that blends in with the snowy seabed of winter. Its subtle colors and clever tactics make it a tricky catch.",
    icon: "🐟",
    worth: 65,
    expWorth: 60,
    hpWorth: 6,
    probability: 25,
    rarity: "Epic",
    rarityLevel: 4,
  },
  {
    id: 27,
    name: "Ice Fish",
    description:
      "A rare and elusive fish that only appears in the coldest depths of winter. Its translucent scales and eerie glow make it a ghostly catch.",
    icon: "🐟",
    worth: 70,
    expWorth: 65,
    hpWorth: 6.5,
    probability: 20,
    rarity: "Epic",
    rarityLevel: 4,
  },
];

export const nocturnalFishTypes: Fish[] = [
  {
    id: 28,
    name: "Nocturnal Trout",
    description:
      "A graceful and agile fish that darts through the streams and rivers under the cover of night. Its shimmering scales and stealthy movements make it a mysterious catch.",
    icon: "🐟",
    worth: 40,
    expWorth: 35,
    hpWorth: 3.5,
    probability: 50,
    rarity: "Rare",
    rarityLevel: 2,
  },
  {
    id: 29,
    name: "Nocturnal Bass",
    description:
      "A shadowy and elusive fish that emerges under the cover of night. Its dark scales and stealthy movements make it a mysterious catch.",
    icon: "🐟",
    worth: 55,
    expWorth: 50,
    hpWorth: 5,
    probability: 35,
    rarity: "Rare",
    rarityLevel: 3,
  },
  {
    id: 30,
    name: "Nighttime Catfish",
    description:
      "A whiskered and wily fish that prowls the waters after dark. Its sharp senses and cunning nature make it a challenging catch.",
    icon: "🐟",
    worth: 60,
    expWorth: 55,
    hpWorth: 5.5,
    probability: 30,
    rarity: "Epic",
    rarityLevel: 4,
  },
];

export const allFishTypes: Fish[] = [
  ...baseFishTypes,
  ...springFishTypes,
  ...summerFishTypes,
  ...fallFishTypes,
  ...winterFishTypes,
  ...nocturnalFishTypes,
];

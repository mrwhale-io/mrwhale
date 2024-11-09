import { achievements, baits, allFishTypes, fishingRods } from "@mrwhale-io/core";
import { Achievement } from "../src/database/models/achievement";
import { Fish } from "../src/database/models/fish";
import { FishingRod } from "../src/database/models/fishing-rod";
import { Bait } from "../src/database/models/bait";

async function seedItems() {
  try {
    // Sync fish model
    await Fish.sync({ force: true });

    // Seed fish
    Fish.bulkCreate(allFishTypes, {
      updateOnDuplicate: ["name"],
    });

    // Sync fishing rod model
    await FishingRod.sync({ force: true });

    // Seed fishing rods
    FishingRod.bulkCreate(fishingRods, {
      updateOnDuplicate: ["name"],
    });

    // Sync bait model
    await Bait.sync({ force: true });

    // Seed baits
    Bait.bulkCreate(baits, {
      updateOnDuplicate: ["name"],
    });

    // Sync achievements model
    await Achievement.sync({ force: true });

    // Seed achievements
    Achievement.bulkCreate(achievements, {
      updateOnDuplicate: ["name"],
    });

    console.log("Successfully seeded items in database.");
  } catch (error) {
    console.error("Error seeding items in database:", error);
  }
}

seedItems();
